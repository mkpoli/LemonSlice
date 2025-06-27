import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { jwtVerify, importJWK } from 'jose';
import { sessionCookieName } from '$lib/server/auth';

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
		event.locals.user = null;
		return resolve(event);
	}

	try {
		const res = await fetch('https://lemontv.win/.well-known/jwks.json');
		const { keys } = await res.json();
		const publicKey = await importJWK(keys[0], keys[0].alg ?? 'ES256');

		const { payload } = await jwtVerify(token, publicKey, {
			issuer: 'https://lemontv.com',
			audience: 'https://lemonade.strinova.win'
		});

		event.locals.user = {
			id: payload.sub,
			username: payload.name,
			email: payload.email,
			roles: payload.roles
		};
	} catch {
		event.locals.user = null;
		event.cookies.delete(sessionCookieName, { path: '/' });
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleAuth);
