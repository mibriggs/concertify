import { SECRET_MAPBOX_TOKEN } from '$env/static/private';
import { json } from '@sveltejs/kit';

export const GET = async ({ url }) => {
	const mapboxId = url.searchParams.has('mapboxId')
		? (url.searchParams.get('mapboxId') as string)
		: '';
	const sessionToken = crypto.randomUUID();
	const fetchUrl = `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?session_token=${sessionToken}&access_token=${SECRET_MAPBOX_TOKEN}`;
	try {
		const res = await fetch(fetchUrl);
		const data = await res.json();
		return json(data);
	} catch (error) {
		console.error(error);
	}
};
