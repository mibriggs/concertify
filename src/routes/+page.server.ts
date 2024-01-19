import type { PageServerLoad } from './$types';
import type { SpotifyRedirectOptions } from '$lib/types';
import { SECRET_SPOTIFY_ID } from '$env/static/private';
import { constructQueryParams, generateRandomString } from '$lib';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	if (url.searchParams.has('signedout')) {
		const searchParam = url.searchParams.get('signedout');
		if (searchParam) {
			return { isSignedOut: true };
		}
	}
};

export const actions = {
	authWithSpotify: async ({ cookies, url }) => {
		const state = generateRandomString(20);
		const spotifyRedirectOptions: SpotifyRedirectOptions = {
			response_type: 'code',
			client_id: SECRET_SPOTIFY_ID,
			redirect_uri: url.origin,
			scope: 'user-follow-read user-library-read',
			state,
			show_dialog: true
		};
		const spotifyAuthRequestQueryParams: string = constructQueryParams(spotifyRedirectOptions);

		cookies.set('state', state, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		});

		const spotifyUrl: string = `https://accounts.spotify.com/authorize?${spotifyAuthRequestQueryParams}`;
		throw redirect(307, spotifyUrl);
	},
	logoutUser: async ({ cookies }) => {
		cookies.getAll().forEach((cookie) => cookies.delete(cookie.name, { path: '/' }));
		throw redirect(302, '/');
	}
};
