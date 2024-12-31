import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		spotifyToken: locals.spotifyAccessTokens
	};
};

/**
 * Stuff left to do
 * 		1. Get the liked artists page working --> how to make this performant?
 * 		2. Get Search functionality working
 * 		3. FIlter????
 */
