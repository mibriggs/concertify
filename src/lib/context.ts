import { getContext, setContext } from 'svelte';

type ApplyFilterFunction = (selectedFilters: string[]) => void;

const ONFILTER_KEY = Symbol('onfilter');

export function setOnFilterContext(fn: ApplyFilterFunction) {
	setContext(ONFILTER_KEY, fn);
}

export function getOnFilterContext() {
	return getContext<ApplyFilterFunction>(ONFILTER_KEY);
}
