import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";
import { constructQueryParams } from "$lib";
import { accessTokenStore } from "$lib/stores/accessStore";
import type { RefreshTokenSuccessResponse, SpotifyRefreshTokenBody } from "$lib/types";
import type { Handle } from "@sveltejs/kit";
import { get } from "svelte/store";

// what i thought was middleware but idk anymore
export const handle: Handle = async ({ event, resolve }) => {
    console.log("In handle function?");
    // const accessTokens = event.cookies.get("tokens")
    // const currentAccessTokens = get(accessTokenStore);
    // const timeSinceTokenCreation: number = Date.now() - currentAccessTokens.createdAt.getTime();
    // const isExpired: boolean = timeSinceTokenCreation > (currentAccessTokens.expires_in * 1000);
    
    // const base64ClientCredentials: string = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    // const refreshTokenBody: SpotifyRefreshTokenBody = {
    //     grant_type: "refresh_token",
    //     refresh_token: currentAccessTokens.refresh_token,
    // };

    // if (isExpired) {
    //     console.log('Current Token expired')
    //     const response = await fetch("https://accounts.spotify.com/api/token", {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded',
    //             'Authorization': `Basic ${base64ClientCredentials}`,
    //         },
    //         body: constructQueryParams(refreshTokenBody),
    //     });

    //     if (response.status === 200) {
    //         const responseData: RefreshTokenSuccessResponse = await response.json();
    //         const currentDate: Date = new Date();
    //         accessTokenStore.update((curr) => {
    //             return {
    //                 ...curr,
    //                 expires_in: responseData.expires_in,
    //                 access_token: responseData.access_token,
    //                 createdAt: currentDate
    //             };
    //         });
    //     }
    // }
    return await resolve(event);
}