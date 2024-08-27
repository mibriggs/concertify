<script lang="ts">
	import {
		mapboxAutomcompleteSchema,
		type Artist,
		type MapBoxAutocompleteOptions,
		type Suggestion
	} from '$lib/types';
	import Modal from '$components/modal.svelte';
	import ArtistCard from '$components/artist-card.svelte';
	import Button from '$components/button.svelte';
	import SearchBar from '$components/search-bar.svelte';
	import { Locate } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { radiusStore } from '$lib/stores/store';

	export let artists: Artist[];
	export let label: string;

	const chunkSize = 12;
	const chunks: Artist[][] = [];

	let currArtistIndex: number;
	let debounceTimer: number | undefined;
	let chunkIndex = 0;
	let searchValue: string = '';
	let locationSearchValue: string = '';
	let isOpen: boolean = false;
	let isModalOpen: boolean = false;
	let mapboxSuggestions: Suggestion[] = [];

	for (let i = 0; i < artists.length; i += chunkSize) {
		const chunk = artists.slice(i, i + chunkSize);
		chunks.push(chunk);
	}

	const openModal = (artistIndex: number) => {
		currArtistIndex = artistIndex;
		isModalOpen = true;
		const modalId = '#modal';
		const modal: HTMLDialogElement | null = document.querySelector(modalId);
		modal?.showModal();
	};

	const nextPage = () => {
		chunkIndex += 1;
		scrollToTopOfPage();
	};

	const prevPage = () => {
		chunkIndex -= 1;
		scrollToTopOfPage();
	};

	const scrollToTopOfPage = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const getAutoCompleteOptions = (e: Event) => {
		console.log(locationSearchValue);
		// console.log(value);
		// clearTimeout(debounceTimer);
		// debounceTimer = setTimeout(async () => {
		// 	try {
		// 		if (value === '') {
		// 			mapboxSuggestions = [];
		// 			return;
		// 		}
		// 		const res = await fetch(`/api/autocomplete?searchValue=${encodeURIComponent(value)}`);
		// 		const data = (await res.json()) as unknown;
		// 		console.log(data);
		// 		const options: MapBoxAutocompleteOptions = mapboxAutomcompleteSchema.parse(data);
		// 		mapboxSuggestions = options.suggestions;
		// 	} catch (error) {
		// 		console.error(error);
		// 	}
		// }, 500);
	};

	const retrieveLocation = async (mapboxId: string, name: string) => {
		try {
			const res = await fetch(`/api/retrieve?mapboxId=${mapboxId}`);
			const data = (await res.json()) as unknown;
			console.log(data);
			locationSearchValue = name;
			mapboxSuggestions = [];
		} catch (error) {
			console.error(error);
		}

		console.log(mapboxId);
	};

	$: isOnFirstPage = chunkIndex === 0;
	$: isOnLastPage = chunkIndex === chunks.length - 1;
</script>

<main class="flex flex-col font-mono text-white">
	<div class="sticky top-20 z-10 flex flex-col gap-2 bg-spotiblack py-3">
		<!-- For larger screens -->
		<div class="hidden items-center justify-between pl-8 md:flex">
			<span class="sm:text-md text-sm font-bold md:text-xl">{label}</span>
			<div class="w-5/12">
				<SearchBar placeholder="Search artists..." bind:value={searchValue} />
			</div>
			<div class="flex gap-4 pr-6">
				<Button disabled={isOnFirstPage} on:click={prevPage}>Previous</Button>
				<Button disabled={isOnLastPage} on:click={nextPage}>Next</Button>
			</div>
		</div>

		<!-- For smaller screens -->
		<div class="flex flex-col items-center justify-center gap-2 px-6 md:hidden">
			<div class="flex w-full items-center justify-between gap-2">
				<span class="sm:text-md text-sm font-bold md:text-xl">{label}</span>
				<div class="flex gap-4">
					<Button disabled={isOnFirstPage} on:click={prevPage}>Previous</Button>
					<Button disabled={isOnLastPage} on:click={nextPage}>Next</Button>
				</div>
			</div>
			<div class="w-full">
				<SearchBar placeholder="Search artists..." bind:value={searchValue} />
			</div>
		</div>
	</div>

	<div class="flex flex-wrap items-center justify-center">
		{#each chunks[chunkIndex] as artist, indx}
			<ArtistCard
				imageUrl={artist.images[0].url}
				name={artist.name}
				popularity={artist.popularity ? artist.popularity : 0}
				genres={artist.genres}
				followers={artist.followers.total}
				width={artist.images[0].width}
				height={artist.images[0].height}
				on:click={() => openModal(indx)}
			/>
		{/each}
		<Modal artist={chunks[chunkIndex][currArtistIndex]} {isModalOpen} on:closeModal={() => isModalOpen = false} />
	</div>

	<div class="sticky bottom-4 m-4 flex flex-col items-end justify-center gap-2">
		<div
			class:hide={!isOpen}
			class="flex w-11/12 flex-col gap-3 rounded-lg bg-white p-3 text-start text-spotiblack shadow-lg md:w-[33%]"
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

			<span class="flex flex-col gap-1">
				<label for="city" class="italic">Point of Reference:</label>
				<!-- <input
					type="search"
					id="city"
					name="city"
					class="rounded-md p-1 outline outline-2 outline-stone-300 focus:outline-spotigreen"
					placeholder="Enter city or location..."
					on:input={getAutoCompleteOptions}
					bind:value={locationSearchValue}
				/> -->
				<SearchBar placeholder="Enter city or location..." bind:value={locationSearchValue} on:input={getAutoCompleteOptions} />
			</span>

			{#if mapboxSuggestions.length > 0}
				<ul
					class=" max-h-44 divide-y-2 overflow-y-auto rounded-md p-1 outline outline-stone-300 md:max-h-48"
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
		<button
			class="flex size-11 items-center justify-center rounded-full bg-spotigreen shadow-lg active:opacity-80 md:size-14"
			on:click={() => (isOpen = !isOpen)}
		>
			<Locate />
		</button>
	</div>
</main>

<style lang="postcss">
	.hide {
		visibility: hidden;
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
