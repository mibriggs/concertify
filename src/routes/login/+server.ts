import { CLIENT_ID } from "$env/static/private";
import { constructQueryParams, generateRandomString } from "$lib";
import { stateStore } from "$lib/stores/stateStore";
import type { SpotifyRedirectOptions } from "$lib/types";
import { redirect } from "@sveltejs/kit"

// GET endpoint to login to spotify
export const GET = () => {
    const state = generateRandomString(20);
    const spotifyRedirectOptions: SpotifyRedirectOptions = {
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: 'http://localhost:3000',
        scope: "user-follow-read",
        state,
    };

    stateStore.set(state);

    const spotifyUrl: string = `https://accounts.spotify.com/authorize?${constructQueryParams(spotifyRedirectOptions)}`;
    throw redirect(307, spotifyUrl);
}