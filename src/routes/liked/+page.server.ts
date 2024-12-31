import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	savedTracksSuccessResponseSchema,
	type AccessTokenWithDate,
	type SavedTracks
} from '$lib/types';
import { SPOTIFY_BASE_URL } from '$lib';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.spotifyAccessTokens) {
		throw redirect(302, '/?signedout=true');
	}

	let nextUrl: string | undefined = undefined;

	const accessToken: AccessTokenWithDate = locals.spotifyAccessTokens;
	const fetchUrl = `${SPOTIFY_BASE_URL}/me/tracks?limit=25`;
	const response = await fetch(fetchUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken.access_token}`
		}
	});

	if (response.ok) {
		const data = (await response.json()) as unknown;
		const savedTracks: SavedTracks = savedTracksSuccessResponseSchema.parse(data);
		nextUrl = savedTracks.next === null ? undefined : savedTracks.next;
		savedTracks.items.forEach((item) => item.track.artists.forEach((track) => track.id));
	}

	return {
		nextUrl
	};
};
