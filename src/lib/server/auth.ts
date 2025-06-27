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

export function deleteSessionTokenCookie(event: RequestEvent) {
	console.info('[auth] Deleting session cookie');
	event.cookies.delete(sessionCookieName, { path: '/' });
}
