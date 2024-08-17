import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	type AccessTokenWithDate,
	type Artist,
	type FollowedArtists,
	followedArtistsSuccessReponseSchema
} from '$lib/types';
import { SPOTIFY_BASE_URL } from '$lib';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.spotifyAccessTokens) {
		throw redirect(302, '/?signedout=true');
	}

	const accessToken: AccessTokenWithDate = locals.spotifyAccessTokens;
	return { artists: await getFollowedArtists(accessToken) };
};

const getFollowedArtists = async (accessToken: AccessTokenWithDate): Promise<Artist[]> => {
	let followedArtists: Artist[] = [];
	let moreArtistsToDiscover: boolean = true;
	let startingArtist: string = '';

	while (moreArtistsToDiscover) {
		const fetchUrl = `${SPOTIFY_BASE_URL}/me/following?type=artist&limit=50${
			startingArtist !== '' ? '&after=' + startingArtist : ''
		}`;
		const response = await fetch(fetchUrl, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken.access_token}`
			}
		});

		if (response.ok) {
			const data = (await response.json()) as unknown;
			const artistsData: FollowedArtists = followedArtistsSuccessReponseSchema.parse(data);

			const currArtists: Artist[] = artistsData.artists.items;
			const nextStartingArtist: string | null = artistsData.artists.cursors.after;
			followedArtists = [...followedArtists, ...currArtists];

			if (!nextStartingArtist) {
				moreArtistsToDiscover = false;
			} else {
				startingArtist = nextStartingArtist;
			}
		} else {
			moreArtistsToDiscover = false;
		}
	}

	return followedArtists;
};
