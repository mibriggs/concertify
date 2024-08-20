import { encodeBase32 } from 'geohashing';

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

export const constructQueryParams = (queryObject: Object) => {
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
	const [year, month, day] = oldDateFormat.split('-').map((datePortion) => parseInt(datePortion));
	const date = new Date(year, month - 1, day);
	return date.toDateString();
};
