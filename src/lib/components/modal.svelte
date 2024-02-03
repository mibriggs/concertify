<script lang="ts">
	import { MapPinned, Calendar } from 'lucide-svelte';
	import type { Artist, Concert } from '../types';
	import { onMount } from 'svelte';

	export let artist: Artist;
	export let concertLocation: string;
	export let concertDate: string;
	export let concertInfo: Concert | undefined;

	let modal: HTMLDialogElement | null; 
	let isClosing: boolean = false;
	
	onMount(() => {
		modal = document.querySelector('#modal');
		modal?.addEventListener('click', closeWithOutsideTap)
	});

	const closeWithOutsideTap = (event: MouseEvent) => {
		const target = event.target;
		if (target instanceof HTMLElement && target.nodeName === 'DIALOG') {
			closeModal();
		}
	}

	const closeModal = () => {
		isClosing = true;
		modal?.addEventListener('animationend', () => {
			isClosing = false;
			modal?.close();
		}, { once: true });
	};
</script>

<dialog
	id="modal"
	class="max-w-[550px h-fit w-5/6 rounded-3xl border border-gray-400 bg-spotiblack text-white shadow-lg backdrop:bg-spotiblack backdrop:bg-opacity-70 backdrop:backdrop-blur-md md:w-2/3 lg:w-1/2"
	data-closing={isClosing? "true" : null}
>
	{#if artist}
		<div class="flex flex-col items-center justify-center break-words font-mono md:text-lg w-full py-4">
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

<style>
	@keyframes fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
	@keyframes fade-out {
		100% {
			opacity: 0;
		}
		0% {
			opacity: 1;
		}
	}
	@keyframes slide-up {
		0% {
			transform: translateY(100%);
		}
		100% {
			transform: translateY(0%);
		}
	}
	@keyframes slide-down {
		100% {
			transform: translateY(100%);
		}
		0% {
			transform: translateY(0%);
		}
	}

	#modal[open] {
		animation:
		slide-up 600ms forwards,
		fade-in 650ms forwards;
	}

	#modal[data-closing='true'] {
		display: block;
		pointer-events: none;
		inset: 0;
		animation:
		slide-down 275ms forwards,
		fade-out 275ms forwards;
	}
</style>
