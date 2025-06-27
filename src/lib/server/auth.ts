import { importJWK, jwtVerify } from 'jose';
import { Buffer } from 'node:buffer';
import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';

export const sessionCookieName = 'auth-session';

export async function validateSessionToken(token: string) {
	const jwkRaw = Buffer.from(process.env.LEMON_PUBLIC_JWK_BASE64!, 'base64url').toString('utf8');
	const jwk = JSON.parse(jwkRaw);
	const publicKey = await importJWK(jwk, 'ES256');

	const { payload } = await jwtVerify(token, publicKey, {
		issuer: 'https://lemontv.win',
		audience: 'https://slice.lemontv.win'
	});

	if (typeof payload.sub !== 'string') throw new Error('Missing sub in token');

	const userId = payload.sub;
	const username = typeof payload.name === 'string' ? payload.name : undefined;

	if (!username) throw new Error('Missing name in token');

	const existingUser = await db.query.user.findFirst({ where: eq(userTable.id, userId) });

	if (!existingUser) {
		await db.insert(userTable).values({
			id: userId,
			username
		});
	} else if (existingUser.username !== username) {
		await db.update(userTable).set({ username }).where(eq(userTable.id, userId));
	}

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
	event.cookies.delete(sessionCookieName, { path: '/' });
}
