<script lang="ts">
	import {
		mapboxAutomcompleteSchema,
		mapboxRetrieveSchema,
		type MapBoxAutocompleteOptions,
		type MapBoxGeoJson,
		type Suggestion
	} from '$lib/types';
	import SearchBar from '$components/search-bar.svelte';
	import { Locate, Navigation } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { geoHashStore, radiusStore } from '$lib/stores/store';
	import { encodeBase32 } from 'geohashing';
	import { getGeoLocation } from '$lib';

	export let label: string;

	let debounceTimer: number | undefined;
	let searchValue: string = '';
	let isOpen: boolean = false;
	let mapboxSuggestions: Suggestion[] = [];

	const getAutoCompleteOptions = (e: CustomEvent<any>) => {
		const value = e.detail.value;
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
</script>

<main class="flex flex-col font-mono text-white">
	<div class="sticky top-20 z-10 flex flex-col gap-2 bg-spotiblack py-3">
		<!-- For larger screens -->
		<div class="hidden items-center justify-between pl-8 md:flex">
			<span class="sm:text-md text-sm font-bold md:text-xl">{label}</span>
			<div class="w-5/12">
				<!-- <SearchBar id="search" placeholder="Search artists..." bind:value={searchValue} /> -->
			</div>
		</div>

		<!-- For smaller screens -->
		<div class="flex flex-col items-center justify-center gap-2 px-6 md:hidden">
			<div class="flex w-full items-center justify-between gap-2">
				<span class="sm:text-md text-sm font-bold md:text-xl">{label}</span>
			</div>
			<!-- <div class="w-full">
				<SearchBar id="search-mobile" placeholder="Search artists..." bind:value={searchValue} />
			</div> -->
		</div>
	</div>

	<slot />

	{#if isOpen}
		<div
			id="popup-panel"
			class:hide={!isOpen}
			class:show={isOpen}
			class="fixed bottom-16 right-4 z-50 flex w-11/12 flex-col gap-3 self-end rounded-lg bg-white p-3 text-start text-spotiblack opacity-100 shadow-lg md:bottom-20 md:w-[33%]"
		>
			<span class="flex flex-col gap-1">
				<label for="radius" class="italic">Search Radius: {$radiusStore} miles</label>
				<input
					type="range"
					min="5"
					max="50"
					step="5"
					id="radius"
					name="radius"
					bind:value={$radiusStore}
				/>
			</span>

			<span class="flex flex-col gap-2">
				<div class="flex gap-1 items-center p-1 rounded-md border-stone-300 border-2 cursor-pointer">
					<button class="flex items-center gap-1" id="current-loc" on:click={getGeoLocation}>
						<div class="bg-spotigreen text-white p-1 rounded-md flex items-center justify-center">
							<Navigation />
						</div>
					</button>
					<label for="current-loc" class="cursor-pointer">Use my current location</label>
				</div>

				<div>
					<label for="city" class="italic">Point of Reference:</label>
					<SearchBar
						id="city"
						placeholder="Enter city or location..."
						shouldFocusOnClear={false}
						bind:value={$geoHashStore.name}
						on:inputChange={getAutoCompleteOptions}
						on:searchCanceled={cancelSearch}
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
								on:click={() => retrieveLocation(suggestion.mapbox_id, suggestion.name)}
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
		class="fixed bottom-2 right-4 z-50 flex size-11 items-center justify-center self-end rounded-full bg-spotigreen shadow-lg active:opacity-80 md:size-14"
		on:click={() => (isOpen = !isOpen)}
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
