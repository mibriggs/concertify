function createStore<T>(defaultVal: T) {
	let value = $state(defaultVal);

	return {
		get value() {
			return value;
		},
		set value(newValue: T) {
			value = newValue;
		},
		set: (newValue: T) => {
			value = newValue;
		},
		update: (fn: (value: T) => T) => {
			value = fn(value);
		},
		reset: () => {
			value = defaultVal;
		}
	};
}

export const radiusStore = createStore<number>(50);
export const geoHashStore = createStore<{ geoHash: string; name: string }>({
	geoHash: '',
	name: ''
});

let loading = $state(false);
export function getIsLoading() {
	return loading;
}
export function setLoading(newLoading: boolean) {
	loading = newLoading;
}
