<script lang="ts">
	import { MapPinned, Calendar } from 'lucide-svelte';
	import type { Artist, Concert } from '../types';

	export let artist: Artist;
	export let concertLocation: string;
	export let concertDate: string;
	export let concertInfo: Concert | undefined;

	const closeModal = () => {
		const modal: HTMLDialogElement | null = document.querySelector('#modal');
		modal?.close();
	};
</script>

<dialog
	id="modal"
	class="max-w-[550px h-fit w-5/6 rounded-3xl border border-gray-400 bg-spotiblack py-4 text-white shadow-lg backdrop:bg-spotiblack backdrop:bg-opacity-70 backdrop:backdrop-blur-md md:w-2/3 lg:w-1/2"
>
	{#if artist}
		<div class="flex flex-col items-center justify-center break-words font-mono md:text-lg">
			<div class="py-4 font-semibold">
				{artist.name}
			</div>
			<div class="flex items-center gap-4 self-start p-4 text-sm md:text-base">
				<span class="flex items-center justify-center gap-1">
					<MapPinned />
					<span>{concertLocation}</span>
				</span>
				<span class="flex items-center justify-center gap-1">
					<Calendar />
					<span>{concertDate}</span>
				</span>
			</div>
			<div>Image goes here</div>
			<div class="self-start pl-4 font-semibold">About Event</div>
			<div class="self-start pl-4 font-semibold">Ticket Choices</div>
			<div class="flex gap-4">
				<button
					class="w-fit self-start rounded-lg bg-spotigreen px-4 py-1 disabled:bg-gray-400"
					disabled={concertInfo ? false : true}>Buy Tickets</button
				>
				<button class="w-fit rounded-lg bg-red-600 px-4 py-1" on:click={closeModal}>Close</button>
			</div>
		</div>
	{/if}
</dialog>
