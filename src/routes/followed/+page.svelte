<script lang="ts">
	import type { Artist } from '$lib/types';
	import type { PageData } from './$types';
	import Modal from '$components/modal.svelte';
	import ArtistCard from '$components/artist-card.svelte';
	import Button from '$components/button.svelte';
	import { enhance } from '$app/forms';
	import SearchBar from '$components/search-bar.svelte';

	export let data: PageData;

	const chunkSize = 12;
	const chunks: Artist[][] = [];
	let chunkIndex = 0;
	let searchValue: string = '';

	if (data.artists) {
		for (let i = 0; i < data.artists.length; i += chunkSize) {
			const chunk = data.artists.slice(i, i + chunkSize);
			chunks.push(chunk);
		}
	}

	const openModal = (currArtistIndex: number) => {
		const modalId = `#modal${chunkIndex}${currArtistIndex}`;
		const modal: HTMLDialogElement | null = document.querySelector(modalId);
		modal?.showModal();
	};

	$: isOnFirstPage = chunkIndex === 0;
	$: isOnLastPage = chunkIndex === chunks.length - 1;
</script>

{#if data.artists}
	<main class="flex flex-col font-mono text-white">
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between pl-8">
				<span class="sm:text-md text-sm font-bold md:text-xl">Artists you Follow</span>
				<SearchBar
					placeholder="Search followed artists..."
					extraStyling="hidden w-1/3 md:block"
					bind:value={searchValue}
				/>
				<div class="flex gap-4 pr-6">
					<Button disabled={isOnFirstPage} on:click={() => (chunkIndex -= 1)}>Previous</Button>
					<Button disabled={isOnLastPage} on:click={() => (chunkIndex += 1)}>Next</Button>
				</div>
			</div>
			<SearchBar
				placeholder="Search followed artists..."
				extraStyling="w-11/12 self-center md:hidden"
				bind:value={searchValue}
			/>
		</div>

		<div class="flex flex-wrap items-center justify-center">
			{#each chunks[chunkIndex] as artist, indx}
				<ArtistCard
					imageUrl={artist.images[0].url}
					name={artist.name}
					popularity={artist.popularity}
					genres={artist.genres}
					followers={artist.followers.total}
					on:click={() => openModal(indx)}
				/>
				<Modal artist={chunks[chunkIndex][indx]} id={`modal${chunkIndex}${indx}`} />
			{/each}
		</div>
	</main>
{/if}
