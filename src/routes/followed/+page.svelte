<script lang="ts">
	import { browser } from '$app/environment';
	import type { Artist } from '$lib/types';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { fly } from 'svelte/transition';

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

	const closeModal = () => {
		modal?.close();
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
				<span>Artists you Follow</span>
				<input
					type="text"
					class="hidden w-1/3 rounded-xl bg-stone-300 p-2 text-spotiblack outline-none md:block"
					placeholder="Search artists..."
				/>
				<div class="flex gap-4 pr-6">
					<button
						class="rounded-lg bg-slate-200 px-2 py-1 text-spotiblack disabled:bg-spotigreen disabled:text-white"
						disabled={chunkIndex === 0}
						on:click={() => (chunkIndex -= 1)}
					>
						Previous
					</button>
					<button
						class="rounded-lg bg-slate-200 px-2 py-1 text-spotiblack disabled:bg-spotigreen disabled:text-white"
						disabled={chunkIndex === chunks.length - 1}
						on:click={() => (chunkIndex += 1)}
					>
						Next
					</button>
				</div>
			</div>
			<input
				type="text"
				class="w-11/12 self-center rounded-xl bg-stone-300 p-2 text-spotiblack outline-none md:hidden"
				placeholder="Search artists..."
			/>
		</div>

		<div class="flex flex-wrap items-center justify-center">
			{#each chunks[chunkIndex] as artist, indx}
				<button
					class="m-6 flex w-80 flex-col items-center justify-center rounded-xl bg-stone-500 p-4 text-start"
					on:click={() => openModal(indx)}
				>
					<img
						src={artist.images[0].url}
						alt="Artist"
						class="mb-4 h-auto w-auto rounded-lg shadow-lg"
						loading="lazy"
					/>
					<span class="text-xl font-bold">{artist.name}</span>
					<span class="flex text-wrap text-sm italic">Genres: {artist.genres.join(', ')}</span>
				</button>
			{/each}
			<dialog
				id="modal"
				class="modal w-5/6 rounded-xl backdrop:bg-spotiblack backdrop:bg-opacity-70 md:w-2/3 lg:w-1/2"
			>
				<div
					class="flex flex-col items-center justify-center gap-2 p-8"
					in:fly={{ duration: 5000 }}
				>
					<span>{chunks[chunkIndex][artistIndex].name}</span>
					<button on:click={closeModal} class="rounded-lg bg-spotigreen px-4 py-2 text-white"
						>Close</button
					>
				</div>
			</dialog>
		</div>
	</main>
{/if}
