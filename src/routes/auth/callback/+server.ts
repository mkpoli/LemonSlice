import { redirect, error, type RequestHandler } from '@sveltejs/kit';
import { importJWK, jwtVerify } from 'jose';
import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fetchPublicKey, sessionCookieName } from '$lib/server/auth';
import { LEMON_JWT_PUBLIC_KEY_PATH } from '$env/static/private';

export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
	const token = url.searchParams.get('token');
	const next = url.searchParams.get('next') ?? '/';

	if (!token) throw error(400, 'Missing token');

	// Fetch from JWKS endpoint
	const publicKey = await fetchPublicKey(new URL(LEMON_JWT_PUBLIC_KEY_PATH));
	let payload;
	try {
		const result = await jwtVerify(token, publicKey, {
			issuer: 'https://lemontv.com',
			audience: 'https://slice.lemontv.win'
		});
		payload = result.payload;
	} catch (e) {
		console.warn('[auth/callback] Invalid JWT:', e);
		throw error(401, 'Invalid token');
	}

	const userId = payload.sub;
	const username = payload.name;
	if (typeof userId !== 'string' || typeof username !== 'string') {
		throw error(400, 'Invalid user info in token');
	}

	const existingUser = await db.query.user.findFirst({ where: eq(userTable.id, userId) });
	if (!existingUser) {
		await db.insert(userTable).values({ id: userId, username });
	} else if (existingUser.username !== username) {
		await db.update(userTable).set({ username }).where(eq(userTable.id, userId));
	}

	const exp = typeof payload.exp === 'number' ? payload.exp : Math.floor(Date.now() / 1000) + 86400;
	const maxAge = exp - Math.floor(Date.now() / 1000);

	cookies.set(sessionCookieName, token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge
	});

	throw redirect(302, next);
};
