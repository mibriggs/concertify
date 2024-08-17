<script lang="ts">
	import { MapPinned, Calendar, X } from 'lucide-svelte';
	import { concertEventSuccessSchema, type Artist, type Concert } from '../types';
	import { onMount } from 'svelte';

	export let artist: Artist;

	let modal: HTMLDialogElement | null;
	let isClosing: boolean = false;
	let isLoading: boolean = false;
	let concert: Concert;

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

	$: {
		if (artist) {
			fetchData();
		}
	}

	const fetchData = async () => {
		isLoading = true;
		try {
			const res = await fetch(`/api/concert?artist=${artist.name}`);

			if (res.ok) {
				const data = (await res.json()) as unknown;
				const maybeConcerts = concertEventSuccessSchema.safeParse(data);

				if (maybeConcerts.success) {
					const concertData: Concert = maybeConcerts.data;
					concert = concertData;
					// console.log(concert);
				} else {
					console.log(maybeConcerts.error.errors);
				}
			}
		} catch (error) {
			console.error(error);
		} finally {
			isLoading = false;
		}
	};
</script>

<dialog
	id="modal"
	class="h-fit w-11/12 max-w-[560px] rounded-xl border-2 border-gray-400 bg-stone-200 text-spotiblack shadow-lg backdrop:bg-spotiblack backdrop:bg-opacity-70 backdrop:backdrop-blur-md md:w-2/3 lg:w-1/2"
	data-closing={isClosing ? 'true' : null}
>
	<div
		class="flex w-full flex-col items-center justify-center break-words py-4 font-mono md:text-lg"
	>
		<button
			class=" absolute right-2 top-2 h-fit w-fit rounded-full bg-red-500 p-1 text-white"
			on:click={closeModal}
		>
			<X />
		</button>
		{#if isLoading}
			<div class=" flex w-full flex-col gap-2 px-4">
				<div class="h-6 w-1/4 animate-skeleton self-center rounded-sm opacity-70" />
				<div class="h-6 w-8/12 animate-skeleton rounded-sm opacity-70" />
				<div class="h-6 w-1/2 animate-skeleton self-center rounded-sm opacity-70" />
				<div class="h-6 w-1/4 animate-skeleton rounded-sm opacity-70" />
				<div class="h-6 w-1/4 animate-skeleton rounded-sm opacity-70" />
				<div class="h-6 w-1/4 animate-skeleton self-end rounded-sm opacity-70" />
			</div>
		{:else}
			{#if artist}
				<div class="py-4 font-semibold">
					{artist.name}
				</div>
			{/if}
			{#if concert && concert.page.totalElements > 0}
				<div class="flex items-center gap-4 self-start p-4 text-sm md:text-base">
					<span class="flex items-center justify-center gap-1">
						<MapPinned />
						<span>House of Blues</span>
					</span>
					<span class="flex items-center justify-center gap-1">
						<Calendar />
						<span>April 14, 2024</span>
					</span>
				</div>
				<div>Image goes here</div>
				<div class="self-start pl-4 font-semibold">About Event</div>
				<div class="self-start pl-4 font-semibold">Ticket Choices</div>
				<button class="mx-4 w-fit self-end rounded-lg bg-spotigreen px-4 py-1 disabled:bg-gray-400">
					Buy Tickets
				</button>
			{:else}
				<div class="italic">No upcoming concerts in your area</div>
			{/if}
		{/if}
	</div>
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
		animation: slide-up 350ms forwards, fade-in 650ms forwards;
	}

	#modal[data-closing='true'] {
		display: block;
		pointer-events: none;
		inset: 0;
		animation: slide-down 275ms forwards, fade-out 275ms forwards;
	}
</style>
