import { getRequestEvent, query } from '$app/server';
import { SECRET_TICKETMASTER_TOKEN } from '$env/static/private';
import { constructQueryParams, TICKETMASTER_BASE_URL, getTicketmasterDateRange } from '$lib';
import { concertEventSuccessSchema } from '$lib/types';
import { error } from '@sveltejs/kit';
import z from 'zod';

export const getUpcomingEvents = query(
	z.object({
		radius: z.number().min(5).max(150).optional().default(50),
		geoHash: z.string().optional()
	}),
	async ({ radius, geoHash }) => {
		const allEvents = [];
		let page = 0;
		let totalPages = 1;
		let geoHashToUse = geoHash ?? '';

		const { cookies } = getRequestEvent();
		if (!geoHash && cookies.get('geoHash')) {
			geoHashToUse = cookies.get('geoHash') as string;
		} else if (!geoHash) {
			geoHashToUse = 'dr5reg';
		}

		const { startDateTime, endDateTime } = getTicketmasterDateRange();

		// Ticketmaster API limit: (page * size) must be less than 1000
		const MAX_RESULTS = 1000;
		const PAGE_SIZE = 200;
		const MAX_PAGES = Math.floor(MAX_RESULTS / PAGE_SIZE); // = 5

		while (page < totalPages && page <= MAX_PAGES) {
			console.log('Fetching events for chunk: ', page);
			const queryParams = {
				classificationName: 'music',
				segmentName: 'Music',
				source: 'ticketmaster',
				geoPoint: geoHashToUse,
				radius: radius,
				unit: 'miles',
				size: 200,
				page: page.toString(),
				sort: 'date,asc',
				startDateTime,
				endDateTime,
				apikey: SECRET_TICKETMASTER_TOKEN
			};

			const fetchUrl = `${TICKETMASTER_BASE_URL}/events.json?${constructQueryParams(queryParams)}`;
			console.log(fetchUrl);

			try {
				const response = await fetch(fetchUrl);
				if (!response.ok) {
					console.error('Ticketmaster API error: ', response.status);
					break;
				}

				const data = (await response.json()) as unknown;
				const maybeConcertEvent = concertEventSuccessSchema.safeParse(data);
				if (!maybeConcertEvent.success) {
					console.error('Error parsing Ticketmaster response: ', maybeConcertEvent.error);
					break;
				}

				const upcomingEvents = maybeConcertEvent.data;
				if (page === 0) {
					totalPages = upcomingEvents.page.totalPages;
				}

				if (upcomingEvents._embedded?.events) {
					// Only include events with tickets currently on sale
					const onsaleEvents = upcomingEvents._embedded.events.filter(
						(event) => event.dates?.status?.code === 'onsale'
					);
					allEvents.push(...onsaleEvents);
				}

				page++;

				if (page < totalPages) {
					await new Promise((resolve) => setTimeout(resolve, 200));
				}
			} catch (error: unknown) {
				console.error('Error fetching Ticketmaster events: ', error);
				break;
			}
		}

		// Extract artist names from events
		const artistNames = new Set<string>();
		allEvents.forEach((event) => {
			if (event._embedded?.attractions) {
				event._embedded.attractions.forEach((attraction) => {
					if (attraction.name) {
						artistNames.add(attraction.name);
					}
				});
			}
		});

		console.log('Total events found:', allEvents.length);
		console.log('Unique artists:', artistNames.size);
		const normalizedNames: string[] = [];
		artistNames.forEach((name) => normalizedNames.push(name.toLowerCase()));
		return normalizedNames;
	}
);

export const getConcertData = query(
	z.object({
		artistId: z.string(),
		artistName: z.string(),
		radius: z.number().optional(),
		loc: z.string().optional()
	}),
	async ({ artistId, artistName, radius, loc }) => {
		console.log('======================== ENTERING REMOTE FUNCTION ========================');
		console.log(artistId, artistName, radius, loc);
		let geoHashToUse = '';
		const { cookies } = getRequestEvent();
		const concertRadius = radius ?? 30;
		const cookieGeoHashString = cookies.get('geoHash');
		const { startDateTime, endDateTime } = getTicketmasterDateRange();

		if (loc) {
			geoHashToUse = loc;
		} else if (cookieGeoHashString) {
			geoHashToUse = cookieGeoHashString;
		}

		const eventQueryParams: Record<string, string> = {
			classificationName: 'music',
			apikey: SECRET_TICKETMASTER_TOKEN,
			keyword: artistName.toLowerCase(),
			radius: concertRadius.toString(),
			unit: 'miles',
			sort: 'relevance,desc',
			geoPoint: geoHashToUse,
			startDateTime,
			endDateTime
		};

		const eventFetchUrl: string = encodeURI(
			`${TICKETMASTER_BASE_URL}/events.json?${constructQueryParams(eventQueryParams)}`
		);
		console.log(eventFetchUrl);
		const eventResponse = await fetch(eventFetchUrl);

		if (!eventResponse.ok) error(400, { message: 'An error occurred' });

		const data = (await eventResponse.json()) as unknown;

		const validatedData = concertEventSuccessSchema.safeParse(data);
		if (!validatedData.success) {
			console.error('Failed to parse events response:', validatedData.error);
			error(500, { message: 'Invalid response from Ticketmaster' });
		}

		// Filter to only include events with tickets on sale
		if (validatedData.data._embedded?.events) {
			validatedData.data._embedded.events = validatedData.data._embedded.events
				.filter((event) => event.dates?.status?.code === 'onsale')
				.filter((event) => {
					return event._embedded.attractions?.some((attraction) => {
						console.log('======================== IN FILTER ========================');
						const spotifyUrl =
							attraction.externalLinks?.spotify?.find((sp) => sp.url.includes(artistId))?.url ?? '';
						console.log(spotifyUrl);
						const includesArtistId = spotifyUrl.includes(artistId);
						return includesArtistId || normalizeName(attraction.name) === normalizeName(artistName);
					});
				})
				.sort((event1, event2) =>
					compareDates(event1.dates.start.localDate, event2.dates.start.localDate)
				);

			// Update page totals to reflect filtered results
			if (validatedData.data.page) {
				validatedData.data.page.totalElements = validatedData.data._embedded.events.length;
			}
		}

		return validatedData.data;
	}
);

function compareDates(a?: string, b?: string): number {
	if (!a && !b) return 0;
	if (!a) return 1; // a goes after b
	if (!b) return -1; // b goes after a
	return a.localeCompare(b);
}

function normalizeName(name: string) {
	return name
		.toLowerCase()
		.trim()
		.normalize('NFD') // Decompose accented characters
		.replace(/[\u0300-\u036f]/g, '') // Remove accent marks
		.replace(/\s+/g, ' '); // Normalize whitespace
}
