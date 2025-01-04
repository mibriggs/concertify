import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		spotifyToken: locals.spotifyAccessTokens
	};
};

/**
 * Stuff left to do
 * 		1. Get Search functionality working
 * 		2. FIlter????
 */
