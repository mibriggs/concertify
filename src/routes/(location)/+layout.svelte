<script lang="ts">
	import { geoHashStore, radiusStore } from '$lib/stores/store.svelte';
	import { ChevronUp, MapPinned, Navigation } from 'lucide-svelte';
	import type { LayoutProps } from './$types';
	import { decodeBase32, encodeBase32 } from 'geohashing';
	import { z } from 'zod/v4';
	import SearchBar from '$components/search-bar.svelte';
	import { slide } from 'svelte/transition';
	import {
		mapboxAutomcompleteSchema,
		mapboxRetrieveSchema,
		type InputChangeEvent,
		type MapBoxAutocompleteOptions,
		type MapBoxGeoJson,
		type Suggestion
	} from '$lib/types';
	import { getGeoLocation, US_STATE_ABBREVIATIONS } from '$lib';
	import { invalidateAll } from '$app/navigation';

	const addressSchema = z.object({
		'ISO3166-2-lvl4': z.string().optional(),

		borough: z.string().optional(),
		suburb: z.string().optional(),
		quarter: z.string().optional(),

		city: z.string().optional(),
		town: z.string().optional(),
		village: z.string().optional(),
		hamlet: z.string().optional(),
		municipality: z.string().optional(),
		county: z.string().optional(),

		// “state-like” variants you’ll see from Nominatim/OSM
		state: z.string().optional(),
		region: z.string().optional(),
		province: z.string().optional(),
		state_district: z.string().optional(),

		country: z.string().optional(),
		country_code: z.string().optional()
	});

	let { data, children }: LayoutProps = $props();

	let isOpen: boolean = $state(false);
	let debounceTimer: number | undefined = $state();
	let mapboxSuggestions: Suggestion[] = $state([]);

	const city = $derived.by(async () => {
		if (geoHashStore.value.geoHash !== '') {
			return await getCityFromCoords(geoHashStore.value.geoHash);
		} else if (data.geoHashCookie) {
			return await getCityFromCoords(data.geoHashCookie);
		} else {
			return 'No location set';
		}
	});

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
				geoHashStore.set({ geoHash: encodeBase32(lat, long, 9), name });
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

	const getCityFromCoords = async (geoHash: string) => {
		const coords = decodeBase32(geoHash);
		const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1&zoom=10&accept-language=en`;
		const res = await fetch(url);

		if (!res.ok) return 'Could not extract city';

		const data = await res.json();

		if (!data['address']) return 'Could not extract city';

		console.log('has address field');
		console.log(data['address']);
		const maybeAddressData = addressSchema.safeParse(data['address']);
		if (!maybeAddressData.success) return 'Could not extract city';

		const addressData = maybeAddressData.data;
		const isUS = addressData.country_code === 'us';

		const city =
			addressData.borough ||
			addressData.suburb ||
			addressData.quarter ||
			addressData.city ||
			addressData.town ||
			addressData.village ||
			addressData.hamlet ||
			addressData.municipality ||
			addressData.county ||
			addressData.state ||
			null;

		const stateLike =
			addressData.state ||
			addressData.region ||
			addressData.province ||
			addressData.state_district ||
			null;

		const region =
			addressData.city ||
			addressData.town ||
			addressData.village ||
			addressData.hamlet ||
			addressData.municipality ||
			addressData.county
				? stateLike || addressData.country || null
				: addressData.country || null;

		let finalRegion =
			isUS && region && US_STATE_ABBREVIATIONS[region] ? US_STATE_ABBREVIATIONS[region] : region;

		if (city && finalRegion && city === finalRegion) {
			finalRegion = addressData.country || null;
		}

		console.log(city, stateLike, region, finalRegion);

		if (finalRegion === null && city === null) return 'Could not extract city';
		else if (finalRegion === null && city !== null) return city;
		else if (finalRegion !== null && city === null) return finalRegion;
		else return `${city}, ${finalRegion}`;
	};
</script>

{#if children}
	{@render children()}
{/if}

<div class="text-zinc-200 p-3 footer flex items-center justify-between w-full bottom-0">
	{#if isOpen}
		<div
			id="popup-panel"
			in:slide
			out:slide
			class="absolute right-5 bottom-full flex w-11/12 flex-col gap-3 self-end rounded-lg bg-white p-3 text-start text-spotiblack opacity-100 shadow-lg md:bottom-20 md:w-[33%]"
		>
			<div>
				<div class="font-bold">Location Settings</div>
				<p class="text-neutral-400 text-sm">
					Set your location and search radius. This will be used across the entire site to find
					concerts near you.
				</p>
			</div>
			<span class="flex flex-col gap-1">
				<label for="radius" class="italic">Search Radius: {radiusStore.value} miles</label>
				<input
					type="range"
					min="5"
					max="150"
					step="5"
					id="radius"
					name="radius"
					bind:value={radiusStore.value}
				/>
			</span>

			<span class="flex flex-col gap-2">
				<button
					class="flex w-fit items-center gap-1 pt-1"
					id="current-loc"
					onclick={async () => {
						try {
							const geoHash = await getGeoLocation();
							geoHashStore.set({ geoHash, name: '' });
							await invalidateAll();
						} catch (error) {
							console.error('Failed to get location:', error);
						}
					}}
				>
					<div class="flex items-center justify-center rounded-md bg-spotigreen p-1 text-zinc-100">
						<Navigation />
					</div>
					<label for="current-loc" class="cursor-pointer underline">Use my current location</label>
				</button>

				<div class="flex items-center gap-3">
					<div class="flex-1 h-px bg-neutral-300"></div>
					<span class="text-xs text-neutral-400 uppercase">or</span>
					<div class="flex-1 h-px bg-neutral-300"></div>
				</div>

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
	<div class="flex items-center gap-4">
		<div class="bg-spotigreen p-3 rounded-md">
			<MapPinned size="28" color="#e4e4e7" />
		</div>
		<div>
			{#await city}
				<div class="font-semibold">Loading...</div>
			{:then currCity}
				<div class="font-semibold">{currCity}</div>
			{/await}
			<div class="text-sm italic text-neutral-500">Within {radiusStore.value} miles</div>
		</div>
	</div>

	<button
		id="location-trigger"
		class="flex size-14 items-center justify-center self-end rounded-full bg-spotigreen shadow-lg active:opacity-80"
		onclick={() => (isOpen = !isOpen)}
	>
		<ChevronUp
			size="28"
			color="#e4e4e7"
			class="transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
		/>
	</button>
</div>

<style lang="postcss">
	.footer {
		position: fixed;
		background-color: #18181b;
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
