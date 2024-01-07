import { z } from 'zod';

export const accessTokenSuccessResponseSchema = z.object({
	access_token: z.string(),
	token_type: z.string(),
	scope: z.string().optional(),
	expires_in: z.number(),
	refresh_token: z.string(),
});

export const refreshTokenSuccessResponseSchema = z.object({
	access_token: z.string(),
	token_type: z.string(),
	scope: z.string(),
	expires_in: z.number(),
});

export const accessTokenSchema = accessTokenSuccessResponseSchema.extend({
	createdAt: z.string().transform((val) => new Date(val)),
});

export const artistSchema = z.object({
	external_urls: z.object({
		spotify: z.string()
	}),
	followers: z.object({
		href: z.string().nullable(),
		total: z.number()
	}),
	genres: z.array(z.string()),
	href: z.string(),
	id: z.string(),
	images: z.array(
		z.object({
			url: z.string(),
			height: z.number(),
			width: z.number()
		})
	),
	name: z.string(),
	popularity: z.number(),
	type: z.string(),
	uri: z.string(),
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
};

export type FollowedArtists = z.infer<typeof followedArtistsSuccessReponseSchema>;
export type Artist = z.infer<typeof artistSchema>;
export type AccessTokens = z.infer<typeof accessTokenSuccessResponseSchema>;
export type RefreshTokens = z.infer<typeof refreshTokenSuccessResponseSchema>;
export type AccessTokenWithDate = z.infer<typeof accessTokenSchema>;
