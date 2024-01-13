import { SPOTIFY_BASE_URL, type AccessTokenWithDate } from "$lib/types";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const getTop50SongsPlaylist = async (accessToken: AccessTokenWithDate) => {
    const top50PlaylistId = '37i9dQZEVXbMDoHDwVN2tF?si=b5207ca491d545ff'
    const fetchUrl = `${SPOTIFY_BASE_URL}/playlists/${top50PlaylistId}`
    const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken.access_token}`
        }
    });
    const data = await response.json()
    console.log(data);
}

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.spotifyAccessTokens) {
		throw redirect(302, '/?signedout=true');
	}

    const accessToken: AccessTokenWithDate = locals.spotifyAccessTokens;
    getTop50SongsPlaylist(accessToken);
    
    return {};
};