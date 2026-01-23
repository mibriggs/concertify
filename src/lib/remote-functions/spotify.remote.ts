import { getRequestEvent, query } from '$app/server';
import { SPOTIFY_BASE_URL } from '$lib';
import { followedArtistsSuccessReponseSchema } from '$lib/types';
import { error } from '@sveltejs/kit';
import { z } from 'zod/v4';

export const getFollowedArtists = query(z.string().optional(), async (startingUrl) => {
	const { locals } = getRequestEvent();

	if (!locals.spotifyAccessTokens) error(404, { message: 'Spotify access token missing ' });

	const fetchUrl = startingUrl ?? `${SPOTIFY_BASE_URL}/me/following?type=artist&limit=25`;
	const response = await fetch(fetchUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${locals.spotifyAccessTokens.access_token}`
		}
	});

	if (!response.ok) error(500, { message: 'Something went wrong' });

	const data = (await response.json()) as unknown;

	const maybeArtistsData = followedArtistsSuccessReponseSchema.safeParse(data);

	if (!maybeArtistsData.success) error(500, { message: maybeArtistsData.error.message });

	return maybeArtistsData.data;
});
