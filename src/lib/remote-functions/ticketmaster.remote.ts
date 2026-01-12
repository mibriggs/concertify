import { query } from '$app/server';
import { SECRET_TICKETMASTER_TOKEN } from '$env/static/private';
import { constructQueryParams, TICKETMASTER_BASE_URL, getTicketmasterDateRange } from '$lib';
import { concertEventSuccessSchema } from '$lib/types';
import z from 'zod';

export const getUpcomingEvents = query(
	z.object({
		radius: z.number().min(5).max(50).optional().default(30),
		geoHash: z.string().optional().default('dr5reg')
	}),
	async ({ radius, geoHash }) => {
		const allEvents = [];
		let page = 0;
		let totalPages = 1;

		const { startDateTime, endDateTime } = getTicketmasterDateRange();

		// Ticketmaster API limit: (page * size) must be less than 1000
		const MAX_RESULTS = 1000;
		const PAGE_SIZE = 200;
		const MAX_PAGES = Math.floor(MAX_RESULTS / PAGE_SIZE); // = 5

		while (page < totalPages && page < MAX_PAGES) {
			console.log('Fetching events for chunk: ', page);
			const queryParams = {
				classificationName: 'music',
				segmentName: 'Music',
				source: 'ticketmaster',
				geoPoint: geoHash,
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
		artistNames.forEach((name) => console.log(name));
	}
);
