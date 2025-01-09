import {
	type AccessTokenWithDate,
	type Artist,
	severalArtistsSchema,
	top50SongsSchema
} from '$lib/types';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SPOTIFY_BASE_URL } from '$lib';

const getTopSongsArtists = async (
	accessToken: AccessTokenWithDate,
	artistIds: string[]
): Promise<Artist[] | undefined> => {
	const ids = artistIds.join(',');
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

const getTopArtistIds = async (accessToken: AccessTokenWithDate): Promise<Set<string>> => {
	const topArtistsPlaylistId = '0Hm1tCeFv45CJkNeIAtrfF';
	const fetchUrl = `${SPOTIFY_BASE_URL}/playlists/${topArtistsPlaylistId}/tracks`;
	const response = await fetch(fetchUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken.access_token}`
		}
	});

	if (response.ok) {
		const data = (await response.json()) as unknown;
		const maybePlaylistData = top50SongsSchema.safeParse(data);

		if (maybePlaylistData.success) {
			const top50SongsArtistIds: string[] = maybePlaylistData.data.items.flatMap((item) => {
				return item.track.artists.map((artist) => artist.id);
			});
			return new Set(top50SongsArtistIds);
		} else {
			throw new Error(maybePlaylistData.error.message);
		}
	} else {
		const errorData = await response.json();
		console.error('Error fetching playlist:', errorData);
		throw new Error('Error fetching playlist:');
	}
};

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.spotifyAccessTokens) {
		throw redirect(302, '/?signedout=true');
	}

	const accessToken: AccessTokenWithDate = locals.spotifyAccessTokens;
	const artistIds = Array.from(await getTopArtistIds(accessToken));

	return {
		artistIds: getTopArtistIds(accessToken),
		// nextArtistId: artistIds[24],
		start: 0,
		end: 25,
		count: 25,
		batchNo: 1,
		// artists: getTopSongsArtists(accessToken, artistIds.slice(0, 25))
	};
};
