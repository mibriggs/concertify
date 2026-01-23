import { getContext, setContext } from 'svelte';

type ApplyFilterFunction = (selectedFilters: string[]) => void;

const ONFILTER_KEY = Symbol('onfilter');
const SELECTED_FILTERS_KEY = Symbol('selectedFilters');

export function setOnFilterContext(fn: ApplyFilterFunction) {
	setContext(ONFILTER_KEY, fn);
}

export function getOnFilterContext() {
	return getContext<ApplyFilterFunction>(ONFILTER_KEY);
}

export function setSelectedFiltersContext(selected: { value: string[] }) {
	setContext(SELECTED_FILTERS_KEY, selected);
}

export function getSelectedFiltersContext() {
	return getContext<{ value: string[] }>(SELECTED_FILTERS_KEY);
}
