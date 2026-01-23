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
	height: z.number().optional(),
	width: z.number().optional()
});

const restrictionsSchema = z.object({
	reason: z.enum(['market', 'product', 'explicit'])
});

const externalIdsSchema = z.object({
	isrc: z.string().optional(),
	ean: z.string().optional(),
	upc: z.string().optional()
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
	popularity: z.number().optional(),
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
	restriction: restrictionsSchema.optional(),
	type: z.literal('album'),
	uri: z.string(),
	artists: simpleArtistSchema.array()
});

const trackSchema = z.object({
	album: albumSchema,
	artists: artistSchema.array(),
	available_markets: z.string().array().optional(),
	disc_number: z.number(),
	duration_ms: z.number(),
	explicit: z.boolean(),
	external_ids: externalIdsSchema.optional(),
	external_urls: externalUrlSchema,
	href: z.string(),
	id: z.string(),
	is_playable: z.boolean().optional(),
	linked_from: z.object({}).optional(),
	restrictions: restrictionsSchema.optional(),
	name: z.string(),
	popularity: z.number(),
	preview_url: z.string().nullable(),
	track_number: z.number(),
	type: z.literal('track'),
	uri: z.string(),
	is_local: z.boolean()
});

const playlistTrackSchema = z.object({
	added_at: z.string().datetime(),
	added_by: userSchema.nullable(),
	is_local: z.boolean()
});

const songPlaylistTrackSchema = playlistTrackSchema.extend({
	track: trackSchema
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

const accessTokenSchema = accessTokenSuccessResponseSchema.extend({
	createdAt: z.string().transform((val) => new Date(val))
});

const followedArtistsSuccessReponseSchema = z.object({
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

const savedTracksSuccessResponseSchema = z.object({
	href: z.string(),
	limit: z.number(),
	next: z.string().nullable(),
	offset: z.number(),
	previous: z.string().nullable(),
	total: z.number(),
	items: z
		.object({
			added_at: z.string(),
			track: z.object({
				artists: simpleArtistSchema.array()
			})
		})
		.array()
});

const basePlaylistResponseSchema = z.object({
	href: z.string(),
	limit: z.number(),
	next: z.string().nullable(),
	offset: z.number(),
	previous: z.string().nullable(),
	total: z.number()
});

const getSongPlaylistSuccessResponseSchema = basePlaylistResponseSchema.extend({
	items: songPlaylistTrackSchema.array()
});

const concertBaseDateSchema = z.object({
	localDate: z.string().optional(),
	localTime: z.string().optional(),
	dateTime: z.string().optional(),
	noSpecificTime: z.boolean()
});

const concertStartDateSchema = concertBaseDateSchema.extend({
	dateTBD: z.boolean(),
	dateTBA: z.boolean(),
	timeTBA: z.boolean()
});

const concertDateSchema = z.object({
	start: concertStartDateSchema,
	spanMultipleDays: z.boolean(),
	status: z.object({
		code: z.enum(['onsale', 'offsale', 'cancelled', 'postponed', 'rescheduled'])
	}),
	access: z
		.object({
			startDateTime: z.string(),
			startApproximate: z.boolean(),
			endDateTime: z.string().optional(),
			endApproximate: z.boolean()
		})
		.optional()
});

const concertEventSuccessSchema = z.object({
	_embedded: z
		.object({
			events: z
				.object({
					name: z.string(),
					type: z.string(),
					id: z.string(),
					test: z.boolean(),
					url: z.string(),
					locale: z.string(),
					images: z
						.object({
							url: z.string(),
							width: z.number(),
							height: z.number(),
							fallback: z.boolean()
						})
						.array(),
					dates: concertDateSchema,
					_embedded: z.object({
						venues: z
							.object({
								name: z.string().optional(),
								address: z
									.object({
										line1: z.string().optional()
									})
									.optional(),
								location: z
									.object({
										longitude: z.string(),
										latitude: z.string()
									})
									.optional(),
								images: z
									.object({
										ratio: z.string().optional(),
										url: z.string(),
										width: z.number(),
										height: z.number(),
										fallback: z.boolean()
									})
									.array()
									.optional()
							})
							.array(),
						attractions: z
							.object({
								name: z.string(),
								id: z.string().optional(),
								type: z.string().optional()
							})
							.array()
							.optional()
					})
				})
				.array()
		})
		.optional(),
	_links: z
		.object({
			self: z.object({
				href: z.string()
			})
		})
		.optional(),
	page: z.object({
		size: z.number(),
		totalElements: z.number(),
		totalPages: z.number(),
		number: z.number()
	})
});

const top50SongsSchema = z.object({
	href: z.string(),
	limit: z.number(),
	next: z.string().nullable(),
	offset: z.number(),
	previous: z.string().nullable(),
	total: z.number(),
	items: z
		.object({
			track: z.object({
				artists: z
					.object({
						id: z.string(),
						name: z.string()
					})
					.array()
			})
		})
		.array()
});

const severalArtistsSchema = z.object({
	artists: artistSchema.array()
});

const suggestionSchema = z.object({
	name: z.string(),
	mapbox_id: z.string(),
	address: z.string().optional(),
	full_address: z.string().optional(),
	place_formatted: z.string()
});

const mapboxAutomcompleteSchema = z.object({
	suggestions: suggestionSchema.array(),
	attribution: z.string(),
	response_id: z.string()
});

const mapboxRetrieveSchema = z.object({
	type: z.string(),
	attribution: z.string(),
	features: z
		.object({
			geometry: z.object({
				type: z.string(),
				coordinates: z.number().array().length(2) // [longitude,latitude]
			})
		})
		.array()
});

const ticketMasterAttractionsResponse = z.object({
	page: z.object({
		size: z.number(),
		totalElements: z.number(),
		totalPages: z.number(),
		number: z.number()
	}),
	_embedded: z
		.object({
			attractions: z
				.object({
					id: z.string(),
					name: z.string().optional(),
					type: z.string().optional(),
					upcomingEvents: z.object({
						_total: z.number().optional(),
						_filtered: z.number().optional()
					})
				})
				.array()
		})
		.optional()
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
	show_dialog?: boolean;
};

export {
	artistSchema,
	trackSchema,
	accessTokenSuccessResponseSchema,
	refreshTokenSuccessResponseSchema,
	getSongPlaylistSuccessResponseSchema,
	concertEventSuccessSchema,
	accessTokenSchema,
	followedArtistsSuccessReponseSchema,
	top50SongsSchema,
	savedTracksSuccessResponseSchema,
	severalArtistsSchema,
	mapboxAutomcompleteSchema,
	mapboxRetrieveSchema,
	ticketMasterAttractionsResponse
};

export type ButtonClickEvent = MouseEvent & {
	currentTarget: EventTarget & HTMLButtonElement;
};
export type InputChangeEvent = Event & { currentTarget: EventTarget & HTMLInputElement };
export type FollowedArtists = z.infer<typeof followedArtistsSuccessReponseSchema>;
export type Artist = z.infer<typeof artistSchema>;
export type AccessTokens = z.infer<typeof accessTokenSuccessResponseSchema>;
export type RefreshTokens = z.infer<typeof refreshTokenSuccessResponseSchema>;
export type AccessTokenWithDate = z.infer<typeof accessTokenSchema>;
export type SongPlaylist = z.infer<typeof getSongPlaylistSuccessResponseSchema>;
export type Concert = z.infer<typeof concertEventSuccessSchema>;
export type MapBoxAutocompleteOptions = z.infer<typeof mapboxAutomcompleteSchema>;
export type Suggestion = z.infer<typeof suggestionSchema>;
export type MapBoxGeoJson = z.infer<typeof mapboxRetrieveSchema>;
export type SavedTracks = z.infer<typeof savedTracksSuccessResponseSchema>;
export type ArtistImage = z.infer<typeof imageSchema>;
export type TicketmasterAttractions = z.infer<typeof ticketMasterAttractionsResponse>;
