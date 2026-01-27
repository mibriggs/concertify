import { SECRET_TICKETMASTER_TOKEN } from '$env/static/private';
import { constructQueryParams, TICKETMASTER_BASE_URL, getTicketmasterDateRange } from '$lib';
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

	const { startDateTime, endDateTime } = getTicketmasterDateRange();

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

	const attractionsQueryParams: Record<string, string> = {
		keyword: artistName,
		sort: 'relevance,desc',
		classificationName: 'music',
		apikey: SECRET_TICKETMASTER_TOKEN
	};

	if (geoHashString) {
		eventQueryParams.geoPoint = geoHashString;
	}
	if (manualGeoHashString !== '') {
		eventQueryParams.geoPoint = manualGeoHashString;
	}

	// Fetch attractions with pagination
	const allAttractions: Array<{
		id: string;
		name?: string;
		type?: string;
		upcomingEvents: {
			_total?: number;
			_filtered?: number;
		};
	}> = [];
	let attractionPage = 0;
	let attractionTotalPages = 1;
	const ATTRACTION_PAGE_SIZE = 50; // NOT Ticketmaster default

	while (attractionPage < attractionTotalPages) {
		attractionsQueryParams.page = attractionPage.toString();
		attractionsQueryParams.size = ATTRACTION_PAGE_SIZE.toString();

		const fetchAttractionsUrl: string = encodeURI(
			`${TICKETMASTER_BASE_URL}/attractions.json?${constructQueryParams(attractionsQueryParams)}`
		);

		const attractionsResponse = await fetch(fetchAttractionsUrl);
		if (!attractionsResponse.ok) {
			console.error('Attractions API error:', attractionsResponse.status);
			break;
		}

		const data = (await attractionsResponse.json()) as unknown;
		const attractions: TicketmasterAttractions = ticketMasterAttractionsResponse.parse(data);

		if (attractionPage === 0) {
			attractionTotalPages = attractions.page.totalPages;
		}

		if (attractions._embedded?.attractions) {
			allAttractions.push(...attractions._embedded.attractions);
		}

		attractionPage++;

		// Add delay between requests to avoid rate limiting
		if (attractionPage < attractionTotalPages) {
			await new Promise((resolve) => setTimeout(resolve, 200));
		}
	}

	// Now filter through all attractions we've collected
	const matchingAtttractions =
		allAttractions.length > 0
			? allAttractions
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
		const data = (await eventResponse.json()) as unknown;

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
};
