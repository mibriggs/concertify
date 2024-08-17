import { SECRET_TICKETMASTER_TOKEN } from '$env/static/private';
import { constructQueryParams, TICKETMASTER_BASE_URL } from '$lib';
import { json } from '@sveltejs/kit';

export const GET = async ({ url, cookies, request }) => {
    const requestHost = request.headers.get("host");
	const artistName = url.searchParams.has('artist')
		? (url.searchParams.get('artist') as string)
		: '';
	const geoHashString = cookies.get('geoHash');

	const queryParams: Record<string, string> = {
		classificationName: 'music',
		apikey: SECRET_TICKETMASTER_TOKEN,
		keyword: artistName.toLowerCase(),
		radius: '10',
		unit: 'miles',
		sort: 'date,asc'
	};

	if (geoHashString) {
		queryParams.geoPoint = geoHashString;
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
