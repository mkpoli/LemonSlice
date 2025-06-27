import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { jwtVerify, importJWK } from 'jose';
import { fetchPublicKey, JWT_ISSUER, sessionCookieName } from '$lib/server/auth';
import { LEMON_JWT_PUBLIC_KEY_PATH } from '$env/static/private';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

const handleAuth: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(sessionCookieName);

	if (!token) {
		console.info('[handleAuth] No session token found, user is null');
		event.locals.user = null;
		return resolve(event);
	}

	console.info('[handleAuth] Session token found, validating...');

	try {
		console.info('[handleAuth] Fetching LemonTV JWKS...');
		const publicKey = await fetchPublicKey(new URL(LEMON_JWT_PUBLIC_KEY_PATH));

		console.info('[handleAuth] Public key:', publicKey);

		console.info('[handleAuth] Verifying JWT token...');
		const { payload } = await jwtVerify(token, publicKey, {
			issuer: JWT_ISSUER,
			audience: event.url.origin
		});

		console.info('[handleAuth] JWT verification successful, setting user:', {
			id: payload.sub,
			username: payload.name,
			email: payload.email,
			roles: payload.roles
		});

		event.locals.user = {
			id: payload.sub,
			username: payload.name,
			email: payload.email,
			roles: payload.roles
		};
	} catch (error) {
		console.info('[handleAuth] JWT verification failed, clearing session:', error);
		event.locals.user = null;
		event.cookies.delete(sessionCookieName, { path: '/' });
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleAuth);
