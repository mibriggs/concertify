<script lang="ts">
	import { MapPinned, Calendar, X } from 'lucide-svelte';
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
		modal?.addEventListener('click', closeWithOutsideTap);
	});

	const closeWithOutsideTap = (event: MouseEvent) => {
		const target = event.target;
		if (target instanceof HTMLElement && target.nodeName === 'DIALOG') {
			closeModal();
		}
	};

	const closeModal = () => {
		isClosing = true;
		modal?.addEventListener('animationend', closeModalHelper, { once: true });
	};

	const closeModalHelper = () => {
		isClosing = false;
		modal?.close();
	};
</script>

<dialog
	id="modal"
	class="h-fit w-11/12 max-w-[560px] rounded-xl border-2 border-gray-400 bg-stone-200 text-spotiblack shadow-lg backdrop:bg-spotiblack backdrop:bg-opacity-70 backdrop:backdrop-blur-md md:w-2/3 lg:w-1/2"
	data-closing={isClosing ? 'true' : null}
>
	{#if artist}
		<div
			class="flex w-full flex-col items-center justify-center break-words py-4 font-mono md:text-lg"
		>
			<button
				class=" absolute right-2 top-2 h-fit w-fit rounded-full bg-red-500 p-1 text-white"
				on:click={closeModal}
			>
				<X />
			</button>
			<div class="py-4 font-semibold">
				{artist.name}
			</div>
			{#if concertInfo}
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
				<button
					class="mx-4 w-fit self-end rounded-lg bg-spotigreen px-4 py-1 disabled:bg-gray-400"
					disabled={concertInfo ? false : true}>Buy Tickets</button
				>
			{:else}
				<div class="italic">No upcoming concerts in your area</div>
			{/if}
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
		animation: slide-up 650ms forwards, fade-in 650ms forwards;
	}

	#modal[data-closing='true'] {
		display: block;
		pointer-events: none;
		inset: 0;
		animation: slide-down 275ms forwards, fade-out 275ms forwards;
	}
</style>
