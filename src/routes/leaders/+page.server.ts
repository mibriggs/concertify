import {
	type AccessTokenWithDate,
	type Artist,
	severalArtistsSchema,
	top50SongsSchema
} from '$lib/types';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SPOTIFY_BASE_URL } from '$lib';

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
		throw redirect(302, '/login?signedout=true');
	}

	const accessToken: AccessTokenWithDate = locals.spotifyAccessTokens;
	const artistIds = Array.from(await getTopArtistIds(accessToken));

	return {
		artistIds: getTopArtistIds(accessToken),
		start: 0,
		end: 25,
		count: 25,
		batchNo: 1
	};
};
