import type { MapBoxGeoJson } from '$lib/types';
import { writable } from 'svelte/store';

function createStore<T>(defaultVal: T) {
	const { subscribe, set, update } = writable(defaultVal);
	return {
		subscribe,
		set,
		update,
		reset: () => set(defaultVal)
	};
}

export const radiusStore = createStore<number>(5);
export const geoHashStore = createStore<MapBoxGeoJson | undefined>(undefined);