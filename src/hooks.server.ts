import { SECRET_SPOTIFY_ID, SECRET_SPOTIFY_SECRET } from '$env/static/private';
import { constructQueryParams } from '$lib';
import {
	accessTokenSuccessResponseSchema,
	accessTokenSchema,
	refreshTokenSuccessResponseSchema,
	type AccessTokens,
	type SpotifyAccessTokenBody,
	type SpotifyRefreshTokenBody,
	type AccessTokenWithDate,
	type RefreshTokens
} from '$lib/types';
import type { Cookies, Handle, RequestEvent } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (isSuccessResponseFromSpotify(event.url, event.cookies)) {
		const tokens: AccessTokenWithDate | undefined = await setUsersTokens(event);
		if (tokens) {
			event.locals.spotifyAccessTokens = tokens;
			event.cookies.set('tokens', JSON.stringify(tokens), {
				path: '/'
			});
		}
	}

	if (event.cookies.get('tokens') !== undefined) {
		// we have the spotify tokens
		const data = JSON.parse(event.cookies.get('tokens') as string) as unknown;
		const accessTokens: AccessTokenWithDate = accessTokenSchema.parse(data);

		const timeSinceTokenCreation: number = Date.now() - accessTokens.createdAt.getTime();
		const isExpired: boolean = timeSinceTokenCreation > accessTokens.expires_in * 1000;

		if (isExpired) {
			const base64ClientCredentials: string = btoa(`${SECRET_SPOTIFY_ID}:${SECRET_SPOTIFY_SECRET}`);

			const refreshTokenBody: SpotifyRefreshTokenBody = {
				grant_type: 'refresh_token',
				refresh_token: accessTokens.refresh_token
			};

			const response = await event.fetch('https://accounts.spotify.com/api/token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization: `Basic ${base64ClientCredentials}`
				},
				body: constructQueryParams(refreshTokenBody)
			});

			if (response.ok) {
				const data = (await response.json()) as unknown;
				const refreshTokens: RefreshTokens = refreshTokenSuccessResponseSchema.parse(data);
				const currentDate: Date = new Date();
				const newCookies: AccessTokenWithDate = {
					...accessTokens,
					expires_in: refreshTokens.expires_in,
					access_token: refreshTokens.access_token,
					createdAt: currentDate
				};
				event.cookies.set('tokens', JSON.stringify(newCookies), {
					path: '/'
				});
			}
		}
	}

	event.locals.spotifyAccessTokens = event.cookies.get('tokens')
		? accessTokenSchema.parse(JSON.parse(event.cookies.get('tokens') as string))
		: undefined;
	return await resolve(event);
};

const isSuccessResponseFromSpotify = (url: URL, cookies: Cookies): boolean => {
	const maybeStateCookie = cookies.get('state');

	if (maybeStateCookie) {
		return (
			url.pathname === '/' &&
			url.searchParams.has('code') &&
			url.searchParams.has('state') &&
			url.searchParams.get('state') === maybeStateCookie
		);
	}
	return false;
};

const setUsersTokens = async (
	event: RequestEvent<Partial<Record<string, string>>, string | null>
): Promise<undefined | AccessTokenWithDate> => {
	const { fetch, url } = event;

	const spotifyCode = url.searchParams.get('code') as string;
	const accessTokenBody: SpotifyAccessTokenBody = {
		grant_type: 'authorization_code',
		code: spotifyCode,
		redirect_uri: url.origin
	};
	const base64ClientCredentials: string = btoa(`${SECRET_SPOTIFY_ID}:${SECRET_SPOTIFY_SECRET}`);

	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${base64ClientCredentials}`
		},
		body: constructQueryParams(accessTokenBody)
	});

	if (!response.ok) return;

	const data = (await response.json()) as unknown;
	const responseTokens: AccessTokens = accessTokenSuccessResponseSchema.parse(data);
	const currentDate: Date = new Date();
	return { ...responseTokens, createdAt: currentDate };
};
