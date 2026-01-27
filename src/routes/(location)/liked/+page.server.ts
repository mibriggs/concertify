import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.spotifyAccessTokens) {
		throw redirect(302, '/login?signedout=true');
	}
};
// basically spotify changed their api docs out of nowhere so i can no longer access any spotify controlled playlists.
// Using some user maintained one https://open.spotify.com/playlist/0Hm1tCeFv45CJkNeIAtrfF?si=BNvxUcjMSl23JG1QM-jWXA
