import { importJWK, jwtVerify } from 'jose';
import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';

export const sessionCookieName = 'auth-session';

export async function fetchPublicKey(url: URL): Promise<CryptoKey | Uint8Array> {
	const jwksResponse = await fetch(url);
	if (!jwksResponse.ok) throw Error('Failed to fetch LemonTV public key');
	const { keys } = await jwksResponse.json();
	const jwk = keys[0];
	if (!jwk) throw Error('No keys found in LemonTV JWKS');

	return importJWK(jwk, jwk.alg ?? 'ES256');
}

export async function validateSessionToken(token: string) {
	console.info('[auth] Validating session token...');

	const publicKey = await fetchPublicKey(new URL('https://lemontv.win/.well-known/jwks.json'));

	console.info('[auth] Verifying JWT with LemonTV public key...');

	const { payload } = await jwtVerify(token, publicKey, {
		issuer: 'https://lemontv.win',
		audience: 'https://slice.lemontv.win'
	});

	console.info('[auth] JWT verification successful, payload:', {
		sub: payload.sub,
		name: payload.name,
		email: payload.email,
		roles: payload.roles
	});

	if (typeof payload.sub !== 'string') throw new Error('Missing sub in token');

	const userId = payload.sub;
	const username = typeof payload.name === 'string' ? payload.name : undefined;

	if (!username) throw new Error('Missing name in token');

	console.info('[auth] Looking up user in database:', { userId, username });

	const existingUser = await db.query.user.findFirst({ where: eq(userTable.id, userId) });

	if (!existingUser) {
		console.info('[auth] Creating new user:', { userId, username });
		await db.insert(userTable).values({
			id: userId,
			username
		});
	} else if (existingUser.username !== username) {
		console.info('[auth] Updating existing user username:', {
			userId,
			oldUsername: existingUser.username,
			newUsername: username
		});
		await db.update(userTable).set({ username }).where(eq(userTable.id, userId));
	} else {
		console.info('[auth] User found and up to date:', { userId, username });
	}

	console.info('[auth] Session validation completed successfully');

	return {
		user: {
			id: userId,
			username,
			email: payload.email,
			roles: payload.roles
		}
	};
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	console.info('[auth] Deleting session cookie');
	event.cookies.delete(sessionCookieName, { path: '/' });
}
