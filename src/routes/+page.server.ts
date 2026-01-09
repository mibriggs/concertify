import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, locals }) => {
	// If user is logged in, redirect to leaders page
	if (locals.spotifyAccessTokens) {
		throw redirect(302, '/leaders');
	}

	// Check if this is an OAuth callback (has code and state params)
	const isOAuthCallback = url.searchParams.has('code') && url.searchParams.has('state');

	// If not logged in and not an OAuth callback, redirect to login page
	if (!locals.spotifyAccessTokens && !isOAuthCallback) {
		throw redirect(302, '/login');
	}

	if (url.searchParams.has('signedout')) {
		const searchParam = url.searchParams.get('signedout');
		if (searchParam) {
			return { isSignedOut: true };
		}
	}
};

export const actions = {
	logoutUser: async ({ cookies }) => {
		cookies.getAll().forEach((cookie) => cookies.delete(cookie.name, { path: '/' }));
		throw redirect(302, '/');
	}
};
