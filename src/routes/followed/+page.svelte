<script lang="ts">
	import type { Artist } from '$lib/types';
	import type { PageData } from './$types';

	export let data: PageData;

	const chunkSize = 12;
	const chunks: Artist[][] = [];

	if (data.artists) {
		for (let i = 0; i < data.artists.length; i += chunkSize) {
			const chunk = data.artists.slice(i, i + chunkSize);
			chunks.push(chunk);
		}
	}

	let currIndex = 0;
</script>

{#if data.artists}
	<main class="flex-col text-white font-mono">
		<div class="flex justify-between pl-8 items-center">
			<span>Artists you Follow</span>
			<input
				type="text"
				class="w-1/3 rounded-xl bg-stone-300 p-2 text-spotiblack outline-none"
				placeholder="Search options..."
			/>
			<div class="flex gap-4 pr-6">
				<button
					class=" bg-slate-200 rounded-lg px-2 py-1 text-spotiblack disabled:bg-spotigreen disabled:text-white"
					disabled={currIndex === 0}
					on:click={() => (currIndex -= 1)}
				>
					Previous
				</button>
				<button
					class=" bg-slate-200 rounded-lg px-2 py-1 text-spotiblack disabled:bg-spotigreen disabled:text-white"
					disabled={currIndex === chunks.length - 1}
					on:click={() => (currIndex += 1)}
				>
					Next
				</button>
			</div>
		</div>
		<div class="flex flex-wrap items-center justify-center m-8 md:justify-start">
			{#each chunks[currIndex] as artist}
				<div
					class="flex-col items-center justify-center p-4 text-start w-72 bg-stone-500 rounded-xl m-6"
				>
					<img
						src={artist.images[0].url}
						alt="Artist"
						class="w-72 h-auto rounded-lg shadow-lg mb-4"
					/>
					<span class=" text-xl font-bold">{artist.name}</span>
					<span class="flex text-sm text-wrap italic">Genres: {artist.genres.join(', ')}</span>
				</div>
			{/each}
		</div>
	</main>
{/if}
