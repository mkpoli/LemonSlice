import type { PageServerLoad } from './$types';

import { LEMON_AUTH_SERVER_ENDPOINT } from '$env/static/private';

// https://lemontv.win/login/jwt?redirect_uri=https://slice.lemontv.win/auth/callback&next=/
function constructAuthURL(endpoint: URL, url: URL) {
	const authURL = new URL(endpoint);
	authURL.searchParams.set('redirect_uri', `${url.origin}/auth/callback`);
	authURL.searchParams.set('next', url.pathname);
	return authURL.toString();
}

export const load: PageServerLoad = async ({ locals, url }) => {
	return {
		user: locals.user,
		authURL: constructAuthURL(new URL(LEMON_AUTH_SERVER_ENDPOINT), url)
	};
};
