import { followedArtistsSuccessReponseSchema } from '$lib/types';
import type { PageServerLoad } from './$types';
import type { Artist, AccessTokenWithDate, FollowedArtists, SpotifyRedirectOptions } from '$lib/types';
import { SECRET_SPOTIFY_ID } from '$env/static/private';
import { constructQueryParams, generateRandomString } from '$lib';
import { redirect } from '@sveltejs/kit';
// I believe this is called everytime we navigate to this page
// Having slight issues with the cookies cause access token gets invalidated after time and we gotta use the refresh
// token to request a new access token
// I thought the hooks.server.ts file would take care of this but it doesn't seem to ever be called
// Also, I'm unsure about cookies in general, is this where i should store this data?
export const load: PageServerLoad = async ({ locals }) => {
	return {
		spotifyToken: locals.spotifyAccessTokens
	};
};

// Form action that will request the artists when that button is clicked
export const actions = {
	authWithSpotify: async ({ cookies }) => {
		const state = generateRandomString(20);
		const spotifyRedirectOptions: SpotifyRedirectOptions = {
			response_type: 'code',
			client_id: SECRET_SPOTIFY_ID,
			redirect_uri: 'http://localhost:3000',
			scope: 'user-follow-read',
			state
		};
		const spotifyAuthRequestQueryParams: string = constructQueryParams(spotifyRedirectOptions);
		
		cookies.set('state', state, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 30
		});
		
		const spotifyUrl: string = `https://accounts.spotify.com/authorize?${spotifyAuthRequestQueryParams}`;
		throw redirect(307, spotifyUrl);
	},

	viewFollowedArtists: async ({ locals }) => {
		const accessTokens: AccessTokenWithDate | undefined = locals.spotifyAccessTokens;
		let followedArtists: Artist[] = [];
		let moreArtistsToDiscover: boolean = true;
		let startingArtist: string = '';

		if (!accessTokens) return;

		while (moreArtistsToDiscover) {
			const fetchUrl = `https://api.spotify.com/v1/me/following?type=artist&limit=50${
				startingArtist !== '' ? '&after=' + startingArtist : ''
			}`;
			const response = await fetch(fetchUrl, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accessTokens.access_token}`
				}
			});

			if (response.status === 200) {
				const data = (await response.json()) as unknown;
				const artistsData: FollowedArtists = followedArtistsSuccessReponseSchema.parse(data);

				const currArtists: Artist[] = artistsData.artists.items.map((artist) => artist);
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

		return {
			artists: followedArtists
		};
	}
};
