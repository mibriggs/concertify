import type { PageServerLoad } from './$types';
import type { SpotifyRedirectOptions } from '$lib/types';
import { SECRET_SPOTIFY_ID } from '$env/static/private';
import { constructQueryParams, generateRandomString } from '$lib';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		spotifyToken: locals.spotifyAccessTokens
	};
};

export const actions = {
	authWithSpotify: async ({ cookies }) => {
		const state = generateRandomString(20);
		const spotifyRedirectOptions: SpotifyRedirectOptions = {
			response_type: 'code',
			client_id: SECRET_SPOTIFY_ID,
			redirect_uri: 'http://localhost:3000',
			scope: 'user-follow-read',
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
	}
};
