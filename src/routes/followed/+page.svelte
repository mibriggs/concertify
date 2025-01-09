<script lang="ts">
	import type { PageData } from './$types';
	import ArtistGallery from '$components/artist-gallery.svelte';
	import ArtistCard from '$components/artist-card.svelte';
	import Modal from '$components/modal.svelte';
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

	const openModal = (artistIndex: number) => {
		currArtistIndex = artistIndex;
		isModalOpen = true;
		const modalId = '#modal';
		const modal: HTMLDialogElement | null = document.querySelector(modalId);
		modal?.showModal();
	};

	const setupObserver = () => {
		const intersectionObserverCallback: IntersectionObserverCallback = async (
			entries,
			observer
		) => {
			let lastCard = entries[0];
			if (lastCard.isIntersecting && nextUrl !== null) {
				observer.unobserve(lastCard.target);
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
				await tick();
				let newLastCard = container.children[container.childElementCount - 2];
				observer.observe(newLastCard);
			}
		};

		const options: IntersectionObserverInit = { threshold: 0, rootMargin: '300px' };
		observer = new IntersectionObserver(intersectionObserverCallback, options);
		observer.observe(container.children[container.childElementCount - 2]);
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

<svelte:window on:wheel|nonpassive={e => {
    if(isModalOpen) e.preventDefault()
}} />

{#if isPageLoading}
	<ArtistGallery label="Top Artists">
		<div class="flex flex-wrap items-center justify-center">
			{#each Array(32) as _}
				<SkeletonCard />
			{/each}
		</div>
	</ArtistGallery>
{:else}
	<ArtistGallery label="Artists you Follow">
		<div class="flex flex-wrap items-center justify-center" bind:this={container}>
			{#each artists as artist, indx}
				<ArtistCard
					artistImages={artist.images}
					name={artist.name}
					popularity={artist.popularity ? artist.popularity : 0}
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
		</div>
	</ArtistGallery>
{/if}
