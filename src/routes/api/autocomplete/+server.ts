import { SECRET_MAPBOX_TOKEN } from '$env/static/private';
import { json } from '@sveltejs/kit';

export const GET = async ({ url }) => {
	const searchValue: string = url.searchParams.has('searchValue')
		? (url.searchParams.get('searchValue') as string)
		: '';
	const sessionToken = crypto.randomUUID();
	const fetchUrl = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
		searchValue
	)}&types=country,region,postcode,district,place,locality,neighborhood,address,street&session_token=${sessionToken}&access_token=${SECRET_MAPBOX_TOKEN}&limit=10`;

	try {
		const res = await fetch(fetchUrl);
		if (!res.ok) {
			console.error('Mapbox API error:', res.status, res.statusText);
			return json({ suggestions: [], attribution: '', response_id: '' }, { status: res.status });
		}
		const data = await res.json();
		return json(data);
	} catch (error) {
		console.error('Mapbox autocomplete error:', error);
		return json({ suggestions: [], attribution: '', response_id: '' }, { status: 500 });
	}
};
