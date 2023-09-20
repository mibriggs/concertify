import { stateStore } from "$lib/stores/stateStore";
import { get } from "svelte/store";
import type { PageServerLoad } from "./$types";
import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";
import { constructQueryParams } from "$lib";
import type { AccessTokenStoreType, AccessTokenSuccessResponse, SpotifyAccessTokenBody } from "$lib/types";

// I believe this is called everytime we navigate to this page
// Having slight issues with the cookies cause access token gets invalidated after time and we gotta use the refresh
// token to request a new access token
// I thought the hooks.server.ts file would take care of this but it doesn't seem to ever be called
// Also, I'm unsure about cookies in general, is this where i should store this data?
export const load: PageServerLoad = async ({ url, cookies }) => {
    console.log("Load function called");
    const accessTokens = cookies.get("tokens");
    if (accessTokens) return JSON.parse(accessTokens) as AccessTokenSuccessResponse;
    
    const urlState: string | null = url.searchParams.get("state");
    let loadResponse: AccessTokenStoreType | undefined;

    if (url.searchParams.has("state") && urlState === get(stateStore) && url.searchParams.has("code")) {
        const spotifyCode: string = url.searchParams.get("code") as string;

        const accessTokenBody: SpotifyAccessTokenBody = {
            grant_type: "authorization_code",
            code: spotifyCode,
            redirect_uri: 'http://localhost:3000'
        };
        const base64ClientCredentials: string = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
        
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${base64ClientCredentials}`,
            },
            body: constructQueryParams(accessTokenBody)
        });

        if (response.status === 200) {
            const responseData: AccessTokenSuccessResponse = await response.json();
            const currentDate: Date = new Date();
            loadResponse = {... responseData, createdAt: currentDate};
            cookies.set('tokens', JSON.stringify(loadResponse));
        }

    }
    return loadResponse;
};

// Form action that will request the artists when that button is clicked
export const actions = {
    viewFollowedArtists: async (event) => {
       const accessTokens = event.cookies.get("tokens");
       if (!accessTokens) return;
       
       const currentAccessTokens = JSON.parse(accessTokens) as AccessTokenSuccessResponse;
       const response = await fetch("https://api.spotify.com/v1/me/following?type=artist&limit=50", {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${currentAccessTokens.access_token}`
            }
        });

        console.log(response.status, response.statusText);

        if (response.status === 200) {
            const data = await response.json();
            const artistNames = data.artists.items.map((artist: any) => artist.name);
            return { artists: artistNames };
        }
    }
}