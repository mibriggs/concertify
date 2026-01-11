import { encodeBase32 } from 'geohashing';
import { type AccessTokenWithDate, type Artist, severalArtistsSchema } from './types';

export const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
export const TICKETMASTER_BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

const CHARACTERS = 'abcdefghijklmnopqrstuvwxyz0123456789';

export const generateRandomString = (length: number) => {
	let randomString = '';
	for (let i = 0; i < length; i++) {
		randomString += CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
	}
	return randomString;
};

export const constructQueryParams = (queryObject: Record<string, string | boolean | number>) => {
	const queryParams: string[] = [];
	Object.entries(queryObject).forEach((queryParam) => queryParams.push(queryParam.join('=')));
	return queryParams.join('&');
};

export const formatNumber = (numToFormat: number): string => {
	const newNum = Intl.NumberFormat('en-US', {
		notation: 'compact',
		maximumFractionDigits: 1
	}).format(numToFormat);
	return newNum;
};

export const getGeoLocation = () => {
	const SECONDS = 1000;
	const MINUTES = 60;
	const fiveMinutes = 5 * SECONDS * MINUTES;
	const tenSeconds = 10 * SECONDS;

	const options: PositionOptions = {
		enableHighAccuracy: true,
		maximumAge: fiveMinutes,
		timeout: tenSeconds
	};

	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(onLocationSuccess, onLocationError, options);
	} else {
		console.warn('No geolocation support received');
	}
};

const onLocationSuccess = (position: GeolocationPosition) => {
	const coords: GeolocationCoordinates = position.coords;
	const geoHashString = encodeBase32(coords.latitude, coords.longitude, 9);
	document.cookie = `geoHash=${geoHashString}; path=/`;
};

const onLocationError = (err: GeolocationPositionError) => {
	console.warn(`ERROR(${err.code}): ${err.message}`);
};

export const convertTo12HourFormat = (time24: string | undefined) => {
	if (!time24) return '';
	const [hours24, minutes] = time24.split(':').map(Number);
	let period = 'AM';
	let hours12 = hours24;

	if (hours24 === 0) {
		hours12 = 12; // Midnight case
	} else if (hours24 >= 12) {
		period = 'PM';
		if (hours24 > 12) {
			hours12 = hours24 - 12;
		}
	}

	if (hours24 === 12) {
		period = 'PM'; // Noon case
	}

	return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const makeDateHumanReadable = (oldDateFormat: string | undefined) => {
	if (!oldDateFormat) return '';

	const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
	const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

	const [year, month, day] = oldDateFormat.split('-').map((datePortion) => parseInt(datePortion));
	const date = new Date(year, month - 1, day);

	const formattedDay = dayFormatter.format(date);
	const formattedDate = dateFormatter.format(date);

	return `${formattedDay}. ${formattedDate}`;
};

export const getTopSongsArtists = async (
	accessToken: AccessTokenWithDate,
	artistIds: string[]
): Promise<Artist[] | undefined> => {
	const ids = artistIds.join(',');
	const fetchUrl = `${SPOTIFY_BASE_URL}/artists?ids=${ids}`;
	const response = await fetch(fetchUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken.access_token}`
		}
	});

	if (response.ok) {
		// basically spotify changed their api docs out of nowhere so i can no longer access any spotify controlled playlists. Using some user maintained one https://open.spotify.com/playlist/0Hm1tCeFv45CJkNeIAtrfF?si=BNvxUcjMSl23JG1QM-jWXA
		const data = (await response.json()) as unknown; // need to batch now
		const maybeArtistsData = severalArtistsSchema.safeParse(data);
		if (maybeArtistsData.success) {
			const artists: Artist[] = maybeArtistsData.data.artists;
			return artists;
		} else {
			throw new Error(maybeArtistsData.error.message);
		}
	}
};
