import { SECRET_TICKETMASTER_TOKEN } from '$env/static/private';
import { constructQueryParams, TICKETMASTER_BASE_URL } from '$lib';
import { json } from '@sveltejs/kit';

export const GET = async ({ url, cookies }) => {
	const artistName = url.searchParams.has('artist')
		? (url.searchParams.get('artist') as string)
		: '';
	const radius = url.searchParams.has('radius') ? (url.searchParams.get('radius') as string) : '10';
	const manualGeoHashString = url.searchParams.has('loc')
		? (url.searchParams.get('loc') as string)
		: '';
	const geoHashString = cookies.get('geoHash');

	const queryParams: Record<string, string> = {
		classificationName: 'music',
		apikey: SECRET_TICKETMASTER_TOKEN,
		keyword: artistName.toLowerCase(),
		radius,
		unit: 'miles',
		sort: 'date,asc'
	};

	if (geoHashString) {
		queryParams.geoPoint = geoHashString;
	}
	if (manualGeoHashString !== '') {
		queryParams.geoPoint = manualGeoHashString;
	}

	const queryParamString: string = constructQueryParams(queryParams);
	const fetchUrl: string = encodeURI(`${TICKETMASTER_BASE_URL}/events.json?${queryParamString}`);
	const response = await fetch(fetchUrl);

	if (response.ok) {
		const data = await response.json();
		return json(data, { status: 200 });
	}
	return json({ message: 'An error occurred' }, { status: 400 });
};
