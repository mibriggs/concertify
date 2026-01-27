<script lang="ts">
	import { MapPinned, Calendar, X } from 'lucide-svelte';
	import { concertEventSuccessSchema, type Concert } from '../types';
	import { onMount } from 'svelte';
	import { convertTo12HourFormat, makeDateHumanReadable } from '$lib';
	import { geoHashStore } from '$lib/stores/store.svelte';
	import VenueMap from './venue-map.svelte';
	import { radiusStore } from '$lib/stores/store.svelte';

	interface Props {
		artistName: string;
		isModalOpen: boolean;
		onModalClose: () => void;
	}

	let { isModalOpen, onModalClose, artistName = $bindable('') }: Props = $props();

	let modal: HTMLDialogElement | undefined = $state();
	let isClosing: boolean = $state(false);
	let isLoading: boolean = $state(false);
	let concert: Concert | undefined = $state();

	onMount(() => {
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
		onModalClose();
	};

	const closeModalHelper = () => {
		isClosing = false;
		modal?.close();
	};

	const fetchData = async () => {
		if (artistName === '') return;
		isLoading = true;
		try {
			const fetchUrl = `/api/concert?artist=${encodeURIComponent(artistName)}&radius=${radiusStore.value}&loc=${
				geoHashStore.value.geoHash
			}`;
			const res = await fetch(fetchUrl);
			const data = (await res.json()) as unknown;
			console.log('API Response for artist:', artistName, data);
			// if (!res.ok) {
			// 	console.error('API failed with status:', res.status, data);
			// 	// API returned an error, set concert to show "no concerts found"
			// 	concert = {
			// 		page: {
			// 			totalElements: 0,
			// 			size: 0,
			// 			totalPages: 0,
			// 			number: 0
			// 		}
			// 	};
			// 	return;
			// }
			concert = concertEventSuccessSchema.parse(data);
		} catch (error) {
			console.error('Error fetching/parsing concert data:', error);
			// // On parsing error, set concert to show "no concerts found"
			// concert = {
			// 	page: {
			// 		totalElements: 0,
			// 		size: 0,
			// 		totalPages: 0,
			// 		number: 0
			// 	}
			// };
		} finally {
			isLoading = false;
		}
	};

	$effect(() => {
		if (isModalOpen) {
			fetchData();
		}
	});

	$effect(() => {
		if (isModalOpen) {
			const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
			const scrollY = window.scrollY;

			document.body.style.position = 'fixed';
			document.body.style.top = `-${scrollY}px`;
			document.body.style.width = '100%';
			document.body.style.paddingRight = `${scrollbarWidth}px`;
		} else {
			const scrollY = document.body.style.top;
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.width = '';
			document.body.style.paddingRight = '';
			window.scrollTo(0, parseInt(scrollY || '0') * -1);
		}
	});
</script>

<dialog
	id="modal"
	class="h-fit w-11/12 max-w-[560px] rounded-xl border-2 border-gray-400 bg-stone-200 text-spotiblack shadow-lg backdrop:bg-spotiblack backdrop:bg-opacity-70 backdrop:backdrop-blur-md md:w-2/3 lg:w-1/2"
	data-closing={isClosing ? 'true' : 'false'}
	bind:this={modal}
>
	<div
		class="flex w-full flex-col items-center justify-center break-words py-4 font-mono md:text-lg"
	>
		<button
			class=" absolute right-2 top-2 h-fit w-fit rounded-full bg-red-500 p-1 text-zinc-100"
			onclick={closeModal}
		>
			<X />
		</button>
		{#if isLoading}
			<div class=" flex w-full flex-col gap-2 px-4">
				<div class="h-6 w-1/4 animate-skeleton self-center rounded-sm opacity-70"></div>
				<div class="h-6 w-8/12 animate-skeleton rounded-sm opacity-70"></div>
				<div class="h-6 w-1/2 animate-skeleton self-center rounded-sm opacity-70"></div>
				<div class="h-6 w-1/4 animate-skeleton rounded-sm opacity-70"></div>
				<div class="h-6 w-1/4 animate-skeleton rounded-sm opacity-70"></div>
				<div class="h-6 w-1/4 animate-skeleton self-end rounded-sm opacity-70"></div>
			</div>
		{:else}
			{#if artistName !== ''}
				<div class="py-4 font-semibold">
					{artistName}
				</div>
			{/if}
			{#if concert && concert.page.totalElements > 0}
				<div
					class="flex items-center gap-2 self-center px-1 py-4 text-sm md:gap-4 md:self-start md:p-4 md:text-base"
				>
					<span class="flex items-center justify-center gap-1">
						<MapPinned />
						<span>{concert._embedded?.events[0]._embedded.venues[0].name || 'Not included'}</span>
					</span>
					<span class="flex items-center justify-center gap-1">
						<Calendar />
						<span>{makeDateHumanReadable(concert._embedded?.events[0].dates.start.localDate)}</span>
					</span>
				</div>
				<div class="w-full px-4">
					<VenueMap
						longitude={parseFloat(
							concert._embedded?.events[0]._embedded.venues[0].location?.longitude || '0'
						)}
						latitude={parseFloat(
							concert._embedded?.events[0]._embedded.venues[0].location?.latitude || '0'
						)}
						venueName={concert._embedded?.events[0]._embedded.venues[0].name || 'Venue'}
					/>
				</div>
				<div class="self-start pl-4 font-semibold">About Event</div>
				<ul class=" self-start pl-4">
					<li>
						Address: {concert._embedded?.events[0]._embedded.venues[0].address?.line1 ||
							'Not available'}
					</li>
					<li>
						Doors Open: {convertTo12HourFormat(concert._embedded?.events[0].dates.start.localTime)}
					</li>
				</ul>
				<div class="self-start pl-4 font-semibold">Ticket Choices</div>
				<a
					class="mx-4 w-fit self-end rounded-lg bg-spotigreen px-4 py-1 disabled:bg-gray-400"
					href={concert._embedded?.events[0].url}
					target="_blank"
				>
					Buy Tickets
				</a>
			{:else}
				<div class="text-center italic px-4">
					No concerts with tickets on sale found within <span class="font-bold not-italic"
						>{radiusStore.value} miles</span
					>
					of
					<span class="font-bold not-italic">{geoHashStore.value.name || 'your location'}</span>
					in the next <span class="font-bold not-italic">4 months</span>
				</div>
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
		animation:
			slide-up 350ms forwards,
			fade-in 350ms forwards;
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
