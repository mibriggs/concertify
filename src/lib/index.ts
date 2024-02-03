import { dev } from '$app/environment';
import { encodeBase32 } from 'geohashing';

export const baseRedirectUrl: string = dev
	? 'http://localhost:3000'
	: 'https://myconcertify.vercel.app';

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

	console.log('Get geo location function called');
	if (navigator.geolocation) {
		console.log('Navigator geolocation exists');
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
	console.log('Error callback');
	console.warn(`ERROR(${err.code}): ${err.message}`);
};
