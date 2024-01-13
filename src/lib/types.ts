import { dev } from '$app/environment';
import { z } from 'zod';

const externalUrlSchema = z.object({
	spotify: z.string()
});

const followersSchema = z.object({
	href: z.string().nullable(),
	total: z.number()
});

const imageSchema = z.object({
	url: z.string(),
	height: z.number(),
	width: z.number()
});

const restrictionsSchema = z.object({
	reason: z.enum(['market', 'product', 'explicit'])
});

const externalIdsSchema = z.object({
	isrc: z.string(),
	ean: z.string(),
	upc: z.string()
});

const resumePointSchema = z.object({
	fully_played: z.boolean(),
	resume_position_ms: z.number()
});

const copyrightSchema = z.object({
	text: z.string(),
	type: z.string()
});

const simpleArtistSchema = z.object({
	external_urls: externalUrlSchema,
	href: z.string(),
	id: z.string(),
	name: z.string(),
	type: z.literal('artist'),
	uri: z.string()
});

const artistSchema = z.object({
	external_urls: externalUrlSchema,
	followers: followersSchema,
	genres: z.string().array(),
	href: z.string(),
	id: z.string(),
	images: imageSchema.array(),
	name: z.string(),
	popularity: z.number(),
	type: z.literal('artist'),
	uri: z.string()
});

const userSchema = z.object({
	external_urls: externalUrlSchema,
	followers: followersSchema,
	href: z.string(),
	id: z.string(),
	type: z.literal('user'),
	uri: z.string()
});

const albumSchema = z.object({
	album_type: z.enum(['album', 'single', 'compilation']),
	total_tracks: z.number(),
	available_markets: z.string().array(),
	external_urls: externalUrlSchema,
	href: z.string(),
	id: z.string(),
	images: imageSchema.array(),
	name: z.string(),
	release_date: z.string(),
	release_date_precision: z.enum(['year', 'month', 'day']),
	restriction: restrictionsSchema,
	type: z.literal('album'),
	uri: z.string(),
	artists: simpleArtistSchema.array()
});

const showSchema = z.object({
	available_markets: z.string().array(),
	copyrights: copyrightSchema.array(),
	description: z.string(),
	html_description: z.string(),
	explicit: z.boolean(),
	external_urls: externalUrlSchema,
	href: z.string(),
	id: z.string(),
	images: imageSchema.array(),
	is_externally_hosted: z.boolean(),
	languages: z.string().array(),
	media_type: z.string(),
	name: z.string(),
	publisher: z.string(),
	type: z.string(),
	uri: z.string(),
	total_episodes: z.number()
});

const trackSchema = z.object({
	album: albumSchema,
	artists: artistSchema.array(),
	available_markets: z.string().array(),
	disc_number: z.number(),
	duration_ms: z.number(),
	explicit: z.boolean(),
	external_ids: externalIdsSchema,
	external_urls: externalUrlSchema,
	href: z.string(),
	id: z.string(),
	is_playable: z.boolean(),
	linked_from: z.object({}),
	restrictions: restrictionsSchema,
	name: z.string(),
	popularity: z.number(),
	preview_url: z.string().nullable(),
	track_number: z.number(),
	type: z.literal('track'),
	uri: z.string(),
	is_local: z.boolean()
});

const episodeSchema = z.object({
	audio_preview_url: z.string().nullable(),
	description: z.string(),
	html_description: z.string(),
	duration_ms: z.number(),
	explicit: z.boolean(),
	external_urls: externalUrlSchema,
	href: z.string(),
	id: z.string(),
	images: imageSchema.array(),
	is_externally_hosted: z.boolean(),
	is_playable: z.boolean(),
	languages: z.string().array(),
	name: z.string(),
	release_date: z.string(),
	release_date_precision: z.string(),
	resume_point: resumePointSchema,
	type: z.literal('episode'),
	uri: z.string(),
	restrictions: restrictionsSchema,
	show: showSchema
});

const playlistTrackSchema = z.object({
	added_at: z.string().datetime(),
	added_by: userSchema,
	is_local: z.boolean(),
	track: z.union([trackSchema, episodeSchema])
});

const accessTokenSuccessResponseSchema = z.object({
	access_token: z.string(),
	token_type: z.string(),
	scope: z.string().optional(),
	expires_in: z.number(),
	refresh_token: z.string()
});

const refreshTokenSuccessResponseSchema = z.object({
	access_token: z.string(),
	token_type: z.string(),
	scope: z.string(),
	expires_in: z.number()
});

export const accessTokenSchema = accessTokenSuccessResponseSchema.extend({
	createdAt: z.string().transform((val) => new Date(val))
});

export const followedArtistsSuccessReponseSchema = z.object({
	artists: z.object({
		href: z.string(),
		limit: z.number(),
		next: z.string().nullable(),
		cursors: z.object({
			after: z.string().nullable(),
			before: z.string().optional()
		}),
		total: z.number(),
		items: artistSchema.array()
	})
});

export const savedTracksSuccessResponseSchema = z.object({
	href: z.string(),
	limit: z.number(),
	next: z.string().nullable(),
	offset: z.number(),
	previous: z.string().nullable(),
	total: z.number(),
	items: z
		.object({
			added_at: z.string(),
			track: z.object({})
		})
		.array()
});

const getPlaylistSuccessResponseSchema = z.object({
	href: z.string(),
	limit: z.number(),
	next: z.string().nullable(),
	offset: z.number(),
	previous: z.string().nullable(),
	total: z.number(),
	items: playlistTrackSchema.array()
});

export const baseRedirectUrl: string = dev
	? 'http://localhost:3000'
	: 'https://myconcertify.vercel.app';

export const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';

export type SpotifyAccessTokenBody = {
	grant_type: 'authorization_code';
	code: string;
	redirect_uri: string;
};

export type SpotifyRefreshTokenBody = {
	grant_type: 'refresh_token';
	refresh_token: string;
};

export type SpotifyRedirectOptions = {
	response_type: 'code';
	client_id: string;
	scope?: string;
	redirect_uri: string;
	state: string;
	show_dialog?: boolean;
};

export {
	artistSchema,
	trackSchema,
	accessTokenSuccessResponseSchema,
	refreshTokenSuccessResponseSchema,
	getPlaylistSuccessResponseSchema
};
export type FollowedArtists = z.infer<typeof followedArtistsSuccessReponseSchema>;
export type Artist = z.infer<typeof artistSchema>;
export type AccessTokens = z.infer<typeof accessTokenSuccessResponseSchema>;
export type RefreshTokens = z.infer<typeof refreshTokenSuccessResponseSchema>;
export type AccessTokenWithDate = z.infer<typeof accessTokenSchema>;
