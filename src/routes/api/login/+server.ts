import { SECRET_SPOTIFY_ID } from '$env/static/private';
import { constructQueryParams, generateRandomString } from '$lib';
import { redirect } from '@sveltejs/kit';
import type { SpotifyRedirectOptions } from '$lib/types';

// GET endpoint to login to spotify
export const GET = ({ cookies }) => {
	const state = generateRandomString(20);
	const spotifyRedirectOptions: SpotifyRedirectOptions = {
		response_type: 'code',
		client_id: SECRET_SPOTIFY_ID,
		redirect_uri: 'http://localhost:3000',
		scope: 'user-follow-read',
		state
	};

	cookies.set('state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 * 30
	});

	const spotifyUrl: string = `https://accounts.spotify.com/authorize?${constructQueryParams(
		spotifyRedirectOptions
	)}`;
	throw redirect(307, spotifyUrl);
};
