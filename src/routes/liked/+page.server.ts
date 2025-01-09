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

	const accessToken: AccessTokenWithDate = locals.spotifyAccessTokens;

	const { ids, url } = await getLkedArtistIds(accessToken);
	return {
		nextUrl: url,
		artistIds: ids,
		artists: getLikedSongsArtists(accessToken, ids)
	};
};

const getLkedArtistIds = async (
	accessToken: AccessTokenWithDate
): Promise<{ ids: Set<string>; url: string | undefined }> => {
	let fetchUrl = `${SPOTIFY_BASE_URL}/me/tracks`;
	let response = await fetch(fetchUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken.access_token}`
		}
	});
	let artistIds: Set<string> = new Set();
	let nextUrl: undefined | string;

	if (response.ok) {
		const data = (await response.json()) as unknown;
		const savedTracks: SavedTracks = savedTracksSuccessResponseSchema.parse(data);
		nextUrl = savedTracks.next === null ? undefined : savedTracks.next;
		savedTracks.items.forEach((song) =>
			song.track.artists.forEach((artist) => artistIds.add(artist.id))
		);
	}

	return { ids: artistIds, url: nextUrl };
};

const getLikedSongsArtists = async (
	accessToken: AccessTokenWithDate,
	artistIds: Set<string>
): Promise<Artist[] | undefined> => {
	const ids = Array.from(artistIds).join(',');
	const fetchUrl = `${SPOTIFY_BASE_URL}/artists?ids=${ids}`;
	const response = await fetch(fetchUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken.access_token}`
		}
	});

	if (response.ok) {
		// basically spotify changed their api docs out of nowhere so i can no longer access any spotify controlled playlists. Using some user maintained one https://open.spotify.com/playlist/0Hm1tCeFv45CJkNeIAtrfF?si=BNvxUcjMSl23JG1QM-jWXA
		const data = (await response.json()) as unknown; // need to batch now
		const maybeArtistsData = severalArtistsSchema.safeParse(data);
		if (maybeArtistsData.success) {
			const artists: Artist[] = maybeArtistsData.data.artists;
			return artists;
		} else {
			throw new Error(maybeArtistsData.error.message);
		}
	}
};
