import { encodeBase32 } from 'geohashing';

// place files you want to import through the `$lib` alias in this folder.
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
	console.log('Get geo location function called');
	if (navigator.geolocation) {
		console.log('Navigator geolocation exists');
		navigator.geolocation.watchPosition(onLocationSuccess, onLocationError);
	}
};

const onLocationSuccess = (position: GeolocationPosition) => {
	console.log('Success callback');
	const coords: GeolocationCoordinates = position.coords;
	const geoHashString = encodeBase32(coords.latitude, coords.longitude, 9);
	console.log(geoHashString);
	document.cookie = `geoHash=${geoHashString}; path=/`;
};

const onLocationError = (err: GeolocationPositionError) => {
	console.log('Error callback');
	console.warn(`ERROR(${err.code}): ${err.message}`);
};
