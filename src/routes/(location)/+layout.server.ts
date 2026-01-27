import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	return {
		geoHashCookie: cookies.get('geoHash')
	};
};
