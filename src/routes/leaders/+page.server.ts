import { SPOTIFY_BASE_URL, type AccessTokenWithDate, getSongPlaylistSuccessResponseSchema } from '$lib/types';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const getTop50SongsPlaylist = async (accessToken: AccessTokenWithDate) => {
	const top50PlaylistId = '37i9dQZEVXbMDoHDwVN2tF';
	const fetchUrl = `${SPOTIFY_BASE_URL}/playlists/${top50PlaylistId}/tracks`;
	const response = await fetch(fetchUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken.access_token}`
		}
	});
    
    if (response.ok) {
        const data = (await response.json()) as unknown;
        const maybePlaylistData = getSongPlaylistSuccessResponseSchema.safeParse(data);
        
        if (maybePlaylistData.success) {
            console.log(maybePlaylistData.data);
        } else {
            console.log(maybePlaylistData.error.errors)
        }
    }
};

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.spotifyAccessTokens) {
		throw redirect(302, '/?signedout=true');
	}

	const accessToken: AccessTokenWithDate = locals.spotifyAccessTokens;
	getTop50SongsPlaylist(accessToken);

	return {};
};
