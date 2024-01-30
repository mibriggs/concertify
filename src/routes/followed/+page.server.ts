import { redirect, type Cookies } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	type AccessTokenWithDate,
	type Artist,
	type FollowedArtists,
	followedArtistsSuccessReponseSchema,
	concertEventSuccessSchema,
	type Concert
} from '$lib/types';
import { SECRET_TICKETMASTER_TOKEN } from '$env/static/private';
import { SPOTIFY_BASE_URL, TICKETMASTER_BASE_URL, constructQueryParams } from '$lib';

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

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.spotifyAccessTokens) {
		throw redirect(302, '/?signedout=true');
	}

	const accessToken: AccessTokenWithDate = locals.spotifyAccessTokens;
	return { artists: await getFollowedArtists(accessToken) };
};

export const actions: Actions = {
	getConcertInfo: async ({ request, cookies }) => {
		return {concertInfo: await _fetchConcertInfo(request, cookies)};
	}
};

export const _fetchConcertInfo = async (request: Request, cookies: Cookies): Promise<Concert | undefined>  => {
	const data = await request.formData();
	const artistName: string = data.has('artist') ? (data.get('artist')?.toString() as string) : '';
	const geoHashString = cookies.get('geoHash');

	const queryParams: Record<string, string> = {
		classificationName: 'music',
		apikey: SECRET_TICKETMASTER_TOKEN,
		keyword: artistName.toLowerCase(),
		radius: '10',
		unit: 'miles',
		sort: 'date,asc'
	};

	if (geoHashString) {
		queryParams.geoPoint = geoHashString;
	}

	const queryParamString: string = constructQueryParams(queryParams);
	const fetchUrl: string = encodeURI(`${TICKETMASTER_BASE_URL}/events.json?${queryParamString}`);
	
	const response = await fetch(fetchUrl);
	if (response.ok) {
		const data = (await response.json()) as unknown;
		const maybeConcerts = concertEventSuccessSchema.safeParse(data);

		if (maybeConcerts.success) {
			const concertData = maybeConcerts.data;
			return concertData;
		}
	}
};
