import { getRequestEvent, query } from '$app/server';
import { SPOTIFY_BASE_URL } from '$lib';
import {
	followedArtistsSuccessReponseSchema,
	savedTracksSuccessResponseSchema,
	severalArtistsSchema,
	top50SongsSchema,
	type Artist
} from '$lib/types';
import { error } from '@sveltejs/kit';
import { z } from 'zod/v4';

export const getFollowedArtists = query(z.string().optional(), async (startingUrl) => {
	const { locals } = getRequestEvent();

	if (!locals.spotifyAccessTokens) error(404, { message: 'Spotify access token missing ' });

	const fetchUrl = startingUrl ?? `${SPOTIFY_BASE_URL}/me/following?type=artist&limit=25`;
	const response = await fetch(fetchUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${locals.spotifyAccessTokens.access_token}`
		}
	});

	if (!response.ok) error(500, { message: 'Something went wrong' });

	const data = (await response.json()) as unknown;

	const maybeArtistsData = followedArtistsSuccessReponseSchema.safeParse(data);

	if (!maybeArtistsData.success) error(500, { message: maybeArtistsData.error.message });

	return maybeArtistsData.data;
});

export const getLikedArtists = query(z.string().optional(), async (startingUrl) => {
	const { locals } = getRequestEvent();

	if (!locals.spotifyAccessTokens) error(404, { message: 'Spotify access token missing' });

	// Fetch liked songs (50 is the max limit, and we only take primary artist so 50 songs = 50 artists max)
	const fetchUrl = startingUrl ?? `${SPOTIFY_BASE_URL}/me/tracks?limit=50`;
	const response = await fetch(fetchUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${locals.spotifyAccessTokens.access_token}`
		}
	});

	if (!response.ok) error(500, { message: 'Failed to fetch liked songs' });

	const data = (await response.json()) as unknown;
	const maybeSavedTracks = savedTracksSuccessResponseSchema.safeParse(data);

	if (!maybeSavedTracks.success) error(500, { message: maybeSavedTracks.error.message });

	const savedTracks = maybeSavedTracks.data;

	// Extract artist IDs (primary artist only)
	const artistIds: string[] = [];
	savedTracks.items.forEach((song) => {
		const primaryArtist = song.track.artists[0];
		if (primaryArtist) {
			artistIds.push(primaryArtist.id);
		}
	});

	// Fetch artist details
	const artists: Artist[] = [];
	if (artistIds.length > 0) {
		const fetchedArtists = await getArtists(artistIds);

		fetchedArtists.artists.forEach((artist) => {
			const indxInArtistsArr = artists.findIndex((seenArtist) => seenArtist.id === artist.id);
			if (indxInArtistsArr === -1) artists.push(artist);
		});
	}

	return {
		artists,
		nextUrl: savedTracks.next ?? undefined
	};
});

export const getTopArtists = query(async () => {
	const { locals } = getRequestEvent();

	if (!locals.spotifyAccessTokens) error(404, { message: 'Spotify access token missing' });

	const topArtistsPlaylistId = '0Hm1tCeFv45CJkNeIAtrfF';
	const fetchUrl = `${SPOTIFY_BASE_URL}/playlists/${topArtistsPlaylistId}/tracks`;
	const response = await fetch(fetchUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${locals.spotifyAccessTokens.access_token}`
		}
	});
	const text = await response.text();

	if (!response.ok) {
		console.error(`Spotify API error: ${response.status} - ${text}`);
		error(500, { message: `Spotify API error: ${response.status} - ${text}` });
	}

	const data = JSON.parse(text) as unknown;
	const maybePlaylistData = top50SongsSchema.safeParse(data);

	if (!maybePlaylistData.success) error(400, { message: maybePlaylistData.error.message });

	const top50SongsArtistIds: string[] = maybePlaylistData.data.items.flatMap((item) => {
		return item.track.artists.map((artist) => artist.id);
	});

	const top50Set = [...new Set(top50SongsArtistIds)];
	const batches: string[][] = [];
	for (let i = 0; i < top50Set.length; i += 50) {
		batches.push(top50Set.slice(i, i + 50));
	}
	return { ids: batches };
});

export const getArtists = query(z.string().array(), async (artistIds) => {
	const { locals } = getRequestEvent();

	if (!locals.spotifyAccessTokens) error(404, { message: 'Spotify access token missing' });

	const artistResponse = await fetch(`${SPOTIFY_BASE_URL}/artists?ids=${artistIds.join(',')}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${locals.spotifyAccessTokens.access_token}`
		}
	});

	if (!artistResponse.ok) error(500, { message: 'Failed to fetch artist details' });

	const artistData = (await artistResponse.json()) as unknown;
	const maybeArtistsData = severalArtistsSchema.safeParse(artistData);

	if (!maybeArtistsData.success) error(500, { message: maybeArtistsData.error.message });

	return maybeArtistsData.data;
});
