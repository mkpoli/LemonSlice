import { importJWK } from 'jose';

import type { RequestEvent } from '@sveltejs/kit';

export const sessionCookieName = 'auth-session';

// Configure audience based on environment
// export const JWT_AUDIENCE = dev ? 'http://localhost:23333' : 'https://slice.lemontv.win';
export const JWT_ISSUER = 'https://lemontv.win';

export async function fetchPublicKey(
	url: URL,
	fetch: typeof globalThis.fetch = globalThis.fetch
): Promise<CryptoKey | Uint8Array> {
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
