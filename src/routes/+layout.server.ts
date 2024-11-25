import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		spotifyToken: locals.spotifyAccessTokens
	};
};

/**
 * Stuff left to do
 * 		1. Switch from a pagination view to infinity scroll
 * 		2. Get the liked artists page working --> how to make this performant?
 * 		3. Get Search functionality working
 */
