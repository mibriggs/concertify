<script lang="ts">
	import type { PageData } from './$types';
	import ArtistGallery from '$components/artist-gallery.svelte';
	import ArtistCard from '$components/artist-card.svelte';
	import Modal from '$components/modal.svelte';
	import LoadingIndicator from '$components/loading-indicator.svelte';
	import { onDestroy, tick } from 'svelte';
	import {
		followedArtistsSuccessReponseSchema,
		type Artist,
		type FollowedArtists
	} from '$lib/types';
	import SkeletonCard from '$components/skeleton-card.svelte';

	export let data: PageData;

	let artists: Artist[] = [];
	let nextUrl: string | null = null;
	let currArtistIndex: number;
	let isModalOpen: boolean = false;
	let observer: IntersectionObserver;
	let container: HTMLDivElement;
	let isPageLoading = true;
	let isLoadingMore = false;

	const openModal = (artistIndex: number) => {
		currArtistIndex = artistIndex;
		isModalOpen = true;
		const modalId = '#modal';
		const modal: HTMLDialogElement | null = document.querySelector(modalId);
		modal?.showModal();
	};

	const setupObserver = () => {
		const intersectionObserverCallback = async (
			entries: IntersectionObserverEntry[],
			observer: IntersectionObserver
		) => {
			let lastCard = entries[0];
			if (lastCard.isIntersecting && nextUrl !== null && !isLoadingMore) {
				observer.unobserve(lastCard.target);
				isLoadingMore = true;
				const response = await fetch(nextUrl, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${data.spotifyToken?.access_token}`
					}
				});
				if (response.ok) {
					const data = (await response.json()) as unknown;
					const artistsData: FollowedArtists = followedArtistsSuccessReponseSchema.parse(data);
					nextUrl = artistsData.artists.next;
					const newArtists: Artist[] = artistsData.artists.items;
					artists = [...artists, ...newArtists];
				}
				isLoadingMore = false;
				await tick();
				if (nextUrl !== null) {
					const artistCardIndex = artists.length - 2;
					const allButtons = Array.from(container.querySelectorAll('button'));
					let newLastCard = allButtons[artistCardIndex];
					if (newLastCard) observer.observe(newLastCard);
				}
			}
		};

		const options = { threshold: 0, rootMargin: '300px' };
		observer = new IntersectionObserver(intersectionObserverCallback, options);
		const allButtons = Array.from(container.querySelectorAll('button'));
		const initialCard = allButtons[allButtons.length - 2];
		if (initialCard) observer.observe(initialCard);
	};

	data.artists.then((firstBatch) => {
		if (firstBatch?.artists.items) {
			artists = firstBatch.artists.items;
			nextUrl = firstBatch.artists.next;
			tick().then(() => {
				if (container) setupObserver();
			});
			isPageLoading = false;
		}
	});

	onDestroy(() => {
		if (observer) {
			observer.disconnect();
		}
	});
</script>

{#if isPageLoading}
	<ArtistGallery label="Artists you Follow">
		<div class="flex flex-wrap items-center justify-center">
			{#each Array(32) as _}
				<SkeletonCard />
			{/each}
		</div>
	</ArtistGallery>
{:else}
	<ArtistGallery label="Artists you Follow">
		<div
			class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] justify-items-center gap-4"
			bind:this={container}
		>
			{#each artists as artist, indx}
				<ArtistCard
					artistImages={artist.images}
					name={artist.name}
					popularity={artist.popularity}
					genres={artist.genres}
					followers={artist.followers.total}
					on:click={() => openModal(indx)}
				/>
			{/each}
			<Modal
				artist={artists[currArtistIndex]}
				{isModalOpen}
				on:modalClose={() => (isModalOpen = false)}
			/>
			{#if isLoadingMore}
				<LoadingIndicator />
			{/if}
		</div>
	</ArtistGallery>
{/if}
