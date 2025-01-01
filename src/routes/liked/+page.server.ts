import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	savedTracksSuccessResponseSchema,
	severalArtistsSchema,
	type AccessTokenWithDate,
	type Artist,
	type SavedTracks
} from '$lib/types';
import { SPOTIFY_BASE_URL } from '$lib';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.spotifyAccessTokens) {
		throw redirect(302, '/?signedout=true');
	}

	let nextUrl: string | undefined = undefined;
	let artistIds: Set<string> = new Set();
	let artists: Artist[] = [];

	const accessToken: AccessTokenWithDate = locals.spotifyAccessTokens;
	let fetchUrl = `${SPOTIFY_BASE_URL}/me/tracks`;
	let response = await fetch(fetchUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken.access_token}`
		}
	});

	if (response.ok) {
		const data = (await response.json()) as unknown;
		const savedTracks: SavedTracks = savedTracksSuccessResponseSchema.parse(data);
		nextUrl = savedTracks.next === null ? undefined : savedTracks.next;
		savedTracks.items.forEach((song) =>
			song.track.artists.forEach((artist) => artistIds.add(artist.id))
		);
	}

	const ids = Array.from(artistIds).join(',');
	fetchUrl = `${SPOTIFY_BASE_URL}/artists?ids=${ids}`;
	response = await fetch(fetchUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken.access_token}`
		}
	});

	if (response.ok) {
		// basically spotify changed their api docs out of nowhere so i can no longer access any spotify controlled playlists. Using some user maintained one https://open.spotify.com/playlist/0Hm1tCeFv45CJkNeIAtrfF?si=BNvxUcjMSl23JG1QM-jWXA
		const data = (await response.json()) as unknown; // need to batch now
		const artistsData = severalArtistsSchema.parse(data);
		artists = artistsData.artists;
	}

	return {
		nextUrl,
		artistIds,
		artists
	};
};
