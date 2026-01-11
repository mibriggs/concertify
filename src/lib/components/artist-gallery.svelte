<script lang="ts">
	import {
		mapboxAutomcompleteSchema,
		mapboxRetrieveSchema,
		type InputChangeEvent,
		type MapBoxAutocompleteOptions,
		type MapBoxGeoJson,
		type Suggestion
	} from '$lib/types';
	import SearchBar from '$components/search-bar.svelte';
	import { Locate, Navigation, Filter } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { encodeBase32 } from 'geohashing';
	import { getGeoLocation } from '$lib';
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { geoHashStore, radiusStore } from '$lib/stores/store.svelte';

	interface Props {
		label: string;
		children?: import('svelte').Snippet;
	}

	let { label, children }: Props = $props();

	let debounceTimer: number | undefined;
	let searchValue: string = $state('');
	let isOpen: boolean = $state(false);
	let mapboxSuggestions: Suggestion[] = $state([]);
	let editLocationContainer: HTMLDivElement | undefined = $state();
	let openLocationContainer: HTMLButtonElement | undefined = $state();
	let inputSlider: HTMLInputElement | undefined = $state();

	const getAutoCompleteOptions = (e: InputChangeEvent) => {
		const value = e.currentTarget.value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
			try {
				if (value === '') {
					mapboxSuggestions = [];
					return;
				}
				const res = await fetch(`/api/autocomplete?searchValue=${encodeURIComponent(value)}`);
				const data = (await res.json()) as unknown;
				const options: MapBoxAutocompleteOptions = mapboxAutomcompleteSchema.parse(data);
				mapboxSuggestions = options.suggestions;
			} catch (error) {
				console.error(error);
			}
		}, 500);
	};

	const retrieveLocation = async (mapboxId: string, name: string) => {
		try {
			const res = await fetch(`/api/retrieve?mapboxId=${mapboxId}`);
			const data = (await res.json()) as unknown;
			const maybeCoords = mapboxRetrieveSchema.safeParse(data);
			if (!maybeCoords.success) {
				console.error(maybeCoords.error);
			} else {
				const coords: MapBoxGeoJson = maybeCoords.data;
				const [long, lat] = coords.features[0].geometry.coordinates;
				geoHashStore.set({ geoHash: encodeBase32(lat, long), name });
			}
			mapboxSuggestions = [];
		} catch (error) {
			console.error(error);
		}
	};

	const cancelSearch = () => {
		geoHashStore.set({ geoHash: '', name: '' });
		mapboxSuggestions = [];
	};

	const closeOnOutsideClick = (e: MouseEvent) => {
		if (editLocationContainer && openLocationContainer) {
			const divBoundingClient: DOMRect = editLocationContainer.getBoundingClientRect();
			const buttonBoundingClient: DOMRect = openLocationContainer.getBoundingClientRect();

			const isContainerClicked =
				e.clientX >= divBoundingClient.left &&
				e.clientX <= divBoundingClient.right &&
				e.clientY >= divBoundingClient.top &&
				e.clientY <= divBoundingClient.bottom;

			const isButtonClicked =
				e.clientX >= buttonBoundingClient.left &&
				e.clientX <= buttonBoundingClient.right &&
				e.clientY >= buttonBoundingClient.top &&
				e.clientY <= buttonBoundingClient.bottom;

			if (!isContainerClicked && !isButtonClicked) {
				editLocationContainer.classList.remove('show');
				editLocationContainer.classList.add('hide');
				isOpen = false;
			}
		}
	};

	const closeLocationMenu = (e: TouchEvent) => {
		if (editLocationContainer && e.target instanceof Node && !inputSlider?.contains(e.target)) {
			editLocationContainer.classList.remove('show');
			editLocationContainer.classList.add('hide');
			isOpen = false;
		}
	};

	onMount(() => {
		if (browser) {
			document.addEventListener('mousedown', closeOnOutsideClick);
			document.addEventListener('touchmove', closeLocationMenu);
		}
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('mousedown', closeOnOutsideClick);
			document.removeEventListener('touchmove', closeLocationMenu);
		}
	});
</script>

<main class="flex flex-col font-mono text-white">
	<div class="sticky top-20 z-10 flex flex-col gap-2 bg-spotiblack py-3">
		<!-- For larger screens -->
		<div class="hidden items-center justify-between gap-4 pl-8 pr-8 md:flex">
			<span class="sm:text-md text-sm font-bold md:text-xl">{label}</span>
			<div class="flex w-6/12 items-center gap-2">
				<SearchBar
					id="search"
					placeholder="Search artists..."
					bind:value={searchValue}
					onInputChange={() => console.log('input changed')}
					onSearchCanceled={() => console.log('search cancelled')}
				/>
				<button
					class="flex items-center gap-2 rounded-lg bg-stone-700 px-4 py-2 text-white transition-colors hover:bg-stone-600"
				>
					<Filter size="20" />
					<span>Filter</span>
				</button>
			</div>
		</div>

		<!-- For smaller screens -->
		<div class="flex flex-col items-center justify-center gap-2 px-6 md:hidden">
			<div class="flex w-full items-center justify-between gap-2">
				<span class="sm:text-md text-sm font-bold md:text-xl">{label}</span>
				<button
					class="flex items-center rounded-lg bg-stone-700 p-2 text-white transition-colors hover:bg-stone-600"
					aria-label="Filter"
				>
					<Filter size="20" />
				</button>
			</div>
			<div class="w-full">
				<SearchBar
					id="search-mobile"
					placeholder="Search artists..."
					bind:value={searchValue}
					onInputChange={() => console.log('input changed')}
					onSearchCanceled={() => console.log('search cancelled')}
				/>
			</div>
		</div>
	</div>

	{@render children?.()}

	{#if isOpen}
		<div
			id="popup-panel"
			class:hide={!isOpen}
			class:show={isOpen}
			class="fixed bottom-[72px] right-4 z-50 flex w-11/12 flex-col gap-3 self-end rounded-lg bg-white p-3 text-start text-spotiblack opacity-100 shadow-lg md:bottom-20 md:w-[33%]"
			bind:this={editLocationContainer}
		>
			<span class="flex flex-col gap-1">
				<label for="radius" class="italic">Search Radius: {radiusStore.value} miles</label>
				<input
					type="range"
					min="5"
					max="50"
					step="5"
					id="radius"
					name="radius"
					bind:value={radiusStore.value}
					bind:this={inputSlider}
				/>
			</span>

			<span class="flex flex-col gap-2">
				<button
					class="flex w-fit items-center gap-1 pt-1"
					id="current-loc"
					onclick={getGeoLocation}
				>
					<div class="flex items-center justify-center rounded-md bg-spotigreen p-1 text-white">
						<Navigation />
					</div>
					<label for="current-loc" class="cursor-pointer underline">Use my current location</label>
				</button>

				<div>
					<label for="city" class="italic">Point of Reference:</label>
					<SearchBar
						id="city"
						placeholder="Enter city or location..."
						shouldFocusOnClear={false}
						bind:value={geoHashStore.value.name}
						onInputChange={getAutoCompleteOptions}
						onSearchCanceled={cancelSearch}
					/>
				</div>
			</span>

			{#if mapboxSuggestions.length > 0}
				<ul
					class="max-h-44 divide-y-2 overflow-y-auto rounded-md p-1 outline outline-stone-300 md:max-h-48"
					transition:slide
				>
					{#each mapboxSuggestions as suggestion (suggestion.mapbox_id)}
						<li>
							<button
								class="m-1 flex w-full flex-col justify-center"
								onclick={() => retrieveLocation(suggestion.mapbox_id, suggestion.name)}
							>
								<h1 class="text-md text-start font-bold">{suggestion.name}</h1>
								{#if suggestion.full_address}
									<h2 class="text-start text-xs italic">{suggestion.full_address}</h2>
								{:else if suggestion.address}
									<h2 class="text-start text-xs italic">{suggestion.address}</h2>
								{:else}
									<h2 class="text-start text-xs italic">{suggestion.place_formatted}</h2>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
	<button
		id="location-trigger"
		class="fixed bottom-2 right-4 z-50 flex size-14 items-center justify-center self-end rounded-full bg-spotigreen shadow-lg active:opacity-80"
		bind:this={openLocationContainer}
		onclick={() => (isOpen = !isOpen)}
	>
		<Locate />
	</button>
</main>

<style lang="postcss">
	.hide {
		animation: vanish 0.35s ease-out forwards;
	}

	.show {
		animation: appear 0.35s ease-in forwards;
	}

	@keyframes vanish {
		from {
			visibility: visible;
			transform: translateY(0);
			opacity: 1;
		}
		to {
			visibility: hidden;
			transform: translateY(100%);
			opacity: 0;
		}
	}

	@keyframes appear {
		from {
			visibility: hidden;
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			visibility: visible;
			transform: translateY(0);
			opacity: 1;
		}
	}

	/* Getting rid of base range styling */
	input[type='range'] {
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		background: transparent;
		cursor: pointer;
		outline: none;
	}

	/* Webkit styling (AKA Chrome, Safari, and Edge) */
	input[type='range']::-webkit-slider-runnable-track {
		-webkit-appearance: none;
		height: 20px;
		border-radius: 16px;
		@apply bg-stone-300;
	}
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		height: 32px;
		width: 32px;
		background: #fcf7f8;
		margin-top: -6px;
		border: solid;
		border-radius: 9999px;
		border-width: 2px;
		border-color: #332e3c;
	}

	/* Firefox Styling */
	input[type='range']::-moz-range-track {
		-moz-appearance: none;
		background: #e7ebe4;
		height: 20px;
		border-radius: 16px;
	}

	input[type='range']::-moz-range-thumb {
		-moz-appearance: none;
		appearance: none;
		height: 32px;
		width: 32px;
		border: solid;
		border-radius: 9999px;
		border-width: 2px;
		border-color: #332e3c;
		@apply bg-stone-300;
	}

	/* Styling for idek what */
	input[type='range']::-ms-track {
		appearance: none;
		background: #e7ebe4;
		height: 20px;
		border-radius: 16px;
	}
	input[type='range']::-ms-thumb {
		appearance: none;
		height: 32px;
		width: 32px;
		background: #fcf7f8;
		border: solid;
		border-radius: 9999px;
		border-width: 2px;
		border-color: #332e3c;
	}
</style>
