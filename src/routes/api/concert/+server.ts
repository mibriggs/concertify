import { SECRET_TICKETMASTER_TOKEN } from '$env/static/private';
import { constructQueryParams, TICKETMASTER_BASE_URL } from '$lib';
import {
	concertEventSuccessSchema,
	ticketMasterAttractionsResponse,
	type TicketmasterAttractions
} from '$lib/types.js';
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

	// Set date range: tomorrow to 4 months from today
	const tomorrow = new Date();
	tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
	tomorrow.setUTCHours(0, 0, 0, 0);

	const fourMonthsFromToday = new Date();
	fourMonthsFromToday.setUTCMonth(fourMonthsFromToday.getUTCMonth() + 4);
	fourMonthsFromToday.setUTCHours(23, 59, 59, 0);

	// Format dates without milliseconds: YYYY-MM-DDTHH:mm:ssZ
	const startDateTime = tomorrow.toISOString().replace(/\.\d{3}Z$/, 'Z');
	const endDateTime = fourMonthsFromToday.toISOString().replace(/\.\d{3}Z$/, 'Z');

	const eventQueryParams: Record<string, string> = {
		classificationName: 'music',
		apikey: SECRET_TICKETMASTER_TOKEN,
		keyword: artistName.toLowerCase(),
		radius,
		unit: 'miles',
		sort: 'date,asc',
		startDateTime,
		endDateTime
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

			const validatedData = concertEventSuccessSchema.safeParse(data);
			if (!validatedData.success) {
				console.error('Failed to parse events response:', validatedData.error);
				return json({ message: 'Invalid response from Ticketmaster' }, { status: 500 });
			}

			// Filter to only include events with tickets on sale
			if (validatedData.data._embedded?.events) {
				validatedData.data._embedded.events = validatedData.data._embedded.events.filter(
					(event) => event.dates?.status?.code === 'onsale'
				);
				// Update page totals to reflect filtered results
				if (validatedData.data.page) {
					validatedData.data.page.totalElements = validatedData.data._embedded.events.length;
				}
			}

			return json(validatedData.data, { status: 200 });
		}

		// same with inner fetch
		return json({ message: 'An error occurred' }, { status: 400 });
	}

	// if the initial fetch fails i want to know
	return json({ message: 'An error occurred' }, { status: 400 });
};
