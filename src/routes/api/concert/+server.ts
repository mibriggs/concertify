import { SECRET_TICKETMASTER_TOKEN } from '$env/static/private';
import { constructQueryParams, TICKETMASTER_BASE_URL } from '$lib';
import { ticketMasterAttractionsResponse, type TicketmasterAttractions } from '$lib/types.js';
import { json } from '@sveltejs/kit';

export const GET = async ({ url, cookies }) => {
	const artistName = url.searchParams.has('artist')
		? (url.searchParams.get('artist') as string)
		: '';
	const radius = url.searchParams.has('radius') ? (url.searchParams.get('radius') as string) : '30';
	const manualGeoHashString = url.searchParams.has('loc')
		? (url.searchParams.get('loc') as string)
		: '';
	const geoHashString = cookies.get('geoHash');

	const eventQueryParams: Record<string, string> = {
		classificationName: 'music',
		apikey: SECRET_TICKETMASTER_TOKEN,
		keyword: artistName.toLowerCase(),
		radius,
		unit: 'miles',
		sort: 'date,asc'
	};

	const attractionsQuerParams: Record<string, string> = {
		keyword: artistName,
		sort: 'relevance,asc',
		apikey: SECRET_TICKETMASTER_TOKEN
	};

	if (geoHashString) {
		eventQueryParams.geoPoint = geoHashString;
	}
	if (manualGeoHashString !== '') {
		eventQueryParams.geoPoint = manualGeoHashString;
	}

	const fetchAttractionsUrl: string = encodeURI(
		`${TICKETMASTER_BASE_URL}/attractions.json?${constructQueryParams(attractionsQuerParams)}`
	);
	const attractionsResponse = await fetch(fetchAttractionsUrl);

	if (attractionsResponse.ok) {
		const data = (await attractionsResponse.json()) as unknown;
		const attractions: TicketmasterAttractions = ticketMasterAttractionsResponse.parse(data);
		const matchingAtttractions =
			attractions.page.totalElements > 0 && attractions._embedded
				? attractions._embedded?.attractions
						.filter(
							(attraction) =>
								attraction.name && attraction.name.toLowerCase() === artistName.toLowerCase()
						)
						.map((attraction) => {
							return {
								id: attraction.id,
								name: attraction.name ? attraction.name : '',
								upcomingEvents: attraction.upcomingEvents._total
									? attraction.upcomingEvents._total
									: 0
							};
						})
						.filter((attraction) => attraction.upcomingEvents > 0)
				: [];
		if (matchingAtttractions.length === 0) {
			return json({
				page: {
					totalElements: 0,
					size: 1,
					totalPages: 1,
					number: 0
				}
			});
		}

		// we know the artist we want has events coming
		const artistId = matchingAtttractions[0].id;
		eventQueryParams.attractionId = artistId;
		const eventFetchUrl: string = encodeURI(
			`${TICKETMASTER_BASE_URL}/events.json?${constructQueryParams(eventQueryParams)}`
		);
		const eventResponse = await fetch(eventFetchUrl);
		if (eventResponse.ok) {
			const data = await eventResponse.json();
			return json(data, { status: 200 });
		}

		// same with inner fetch
		return json({ message: 'An error occurred' }, { status: 400 });
	}

	// if the initial fetch fails i want to know
	return json({ message: 'An error occurred' }, { status: 400 });
};
