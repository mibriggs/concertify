<script lang="ts">
	import type { Artist } from '$lib/types';
	import Modal from '$components/modal.svelte';
	import ArtistCard from '$components/artist-card.svelte';
	import Button from '$components/button.svelte';
	import SearchBar from '$components/search-bar.svelte';
	import { Locate } from 'lucide-svelte';

	export let artists: Artist[];
	export let label: string;

	const chunkSize = 12;
	const chunks: Artist[][] = [];

	let chunkIndex = 0;
	let searchValue: string = '';
	let isOpen: boolean = false;
	let sliderVal: number = 5;

	for (let i = 0; i < artists.length; i += chunkSize) {
		const chunk = artists.slice(i, i + chunkSize);
		chunks.push(chunk);
	}

	let currArtistIndex: number;
	const openModal = (artistIndex: number) => {
		currArtistIndex = artistIndex;
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
		<Modal artist={chunks[chunkIndex][currArtistIndex]} radius={sliderVal} />
	</div>

	<div class="sticky bottom-4 m-4 flex flex-col items-end justify-center gap-2">
		<div
			class:hide={!isOpen}
			class="flex w-11/12 flex-col gap-3 rounded-lg bg-white p-3 text-start text-spotiblack shadow-lg md:w-[33%]"
		>
			<span>
				<label for="city" class="italic">City:</label>
				<input type="text" id="city" name="city" class="outline-slate-300 border-2 rounded-md" />
			</span>
			<span class="flex flex-col gap-2">
				<label for="radius" class="italic">Search Radius: {sliderVal} miles</label>
				<input
					type="range"
					min="5"
					max="50"
					step="5"
					id="radius"
					name="radius"
					bind:value={sliderVal}
				/>
			</span>
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
