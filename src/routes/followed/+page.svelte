<script lang="ts">
	import { browser } from '$app/environment';
	import type { Artist } from '$lib/types';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Modal from '$components/modal.svelte';
	import ArtistCard from '$components/artist-card.svelte';
	import Button from '$components/button.svelte';

	export let data: PageData;

	const chunkSize = 12;
	const chunks: Artist[][] = [];
	let modal: HTMLDialogElement | null;
	let chunkIndex = 0;
	let artistIndex = 0;

	if (data.artists) {
		for (let i = 0; i < data.artists.length; i += chunkSize) {
			const chunk = data.artists.slice(i, i + chunkSize);
			chunks.push(chunk);
		}
	}

	const openModal = (newArtistIndex: number) => {
		artistIndex = newArtistIndex;
		modal?.showModal();
	};

	onMount(() => {
		if (browser) {
			modal = document.querySelector('#modal');
		}
	});
</script>

{#if data.artists}
	<main class="flex flex-col font-mono text-white">
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between pl-8">
				<span class="sm:text-md text-sm font-bold md:text-xl">Artists you Follow</span>
				<input
					type="text"
					class="search hidden w-1/3 rounded-xl bg-stone-300 p-2 text-spotiblack outline-none md:block"
					placeholder="Search artists..."
				/>
				<div class="flex gap-4 pr-6">
					<Button disabled={chunkIndex === 0} on:click={() => (chunkIndex -= 1)}>Previous</Button>
					<Button disabled={chunkIndex === chunks.length - 1} on:click={() => (chunkIndex += 1)}>
						Next
					</Button>
				</div>
			</div>
			<input
				type="text"
				class="search w-11/12 self-center rounded-xl bg-stone-300 p-2 text-spotiblack outline-none md:hidden"
				placeholder="Search artists..."
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
			{/each}
			<Modal artist={chunks[chunkIndex][artistIndex]} />
		</div>
	</main>
{/if}

<style>
	.search {
		background-image: url('$lib/assets/search.svg');
		background-repeat: no-repeat;
		background-position: left 95% bottom 50%;
	}
</style>
