import {
	type AccessTokenWithDate,
	type Artist,
	severalArtistsSchema,
	top50SongsSchema
} from '$lib/types';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SPOTIFY_BASE_URL } from '$lib';

const getTop50SongsArtists = async (
	accessToken: AccessTokenWithDate,
	artistIds: string[]
): Promise<Artist[] | undefined> => {
	const artistIdsSet = new Set(artistIds);
	const ids = Array.from(artistIdsSet).join(',');
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

const getTop50SongsPlaylist = async (accessToken: AccessTokenWithDate) => {
	const top50PlaylistId = '0Hm1tCeFv45CJkNeIAtrfF';
	const fetchUrl = `${SPOTIFY_BASE_URL}/playlists/${top50PlaylistId}/tracks`;
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
				return item.track.artists[0].id;
			});
			return await getTop50SongsArtists(accessToken, top50SongsArtistIds);
		} else {
			throw new Error(maybePlaylistData.error.message);
		}
	} else {
		const errorData = await response.json();
		console.error('Error fetching playlist:', errorData);
		return;
	}
};

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.spotifyAccessTokens) {
		throw redirect(302, '/?signedout=true');
	}

	const accessToken: AccessTokenWithDate = locals.spotifyAccessTokens;
	return { artists: await getTop50SongsPlaylist(accessToken) };
};
