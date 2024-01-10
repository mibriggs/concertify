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
	<main class="flex-col font-mono text-white">
		<div class="flex items-center justify-between pl-8">
			<span>Artists you Follow</span>
			<input
				type="text"
				class="w-1/3 rounded-xl bg-stone-300 p-2 text-spotiblack outline-none"
				placeholder="Search artists..."
			/>
			<div class="flex gap-4 pr-6">
				<button
					class="rounded-lg bg-slate-200 px-2 py-1 text-spotiblack disabled:bg-spotigreen disabled:text-white"
					disabled={currIndex === 0}
					on:click={() => (currIndex -= 1)}
				>
					Previous
				</button>
				<button
					class="rounded-lg bg-slate-200 px-2 py-1 text-spotiblack disabled:bg-spotigreen disabled:text-white"
					disabled={currIndex === chunks.length - 1}
					on:click={() => (currIndex += 1)}
				>
					Next
				</button>
			</div>
		</div>
		<div class="m-8 flex flex-wrap items-center justify-center">
			{#each chunks[currIndex] as artist}
				<div
					class="m-6 w-72 flex-col items-center justify-center rounded-xl bg-stone-500 p-4 text-start"
				>
					<img
						src={artist.images[0].url}
						alt="Artist"
						class="mb-4 h-auto w-72 rounded-lg shadow-lg"
					/>
					<span class="text-xl font-bold">{artist.name}</span>
					<span class="flex text-wrap text-sm italic">Genres: {artist.genres.join(', ')}</span>
				</div>
			{/each}
		</div>
	</main>
{/if}
