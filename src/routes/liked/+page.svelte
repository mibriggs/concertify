<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import type { PageData } from './$types';
	import ArtistCard from '$components/artist-card.svelte';
	import ArtistGallery from '$components/artist-gallery.svelte';
	import Modal from '$components/modal.svelte';
	import LoadingIndicator from '$components/loading-indicator.svelte';
	import {
		type Artist,
		type SavedTracks,
		savedTracksSuccessResponseSchema,
		severalArtistsSchema
	} from '$lib/types';
	import { SPOTIFY_BASE_URL } from '$lib';
	import SkeletonCard from '$components/skeleton-card.svelte';

	export let data: PageData;

	let artists: Artist[] = [];
	let artistIds: Set<string> = data.artistIds;
	let nextUrl: string | undefined = data.nextUrl;
	let container: HTMLDivElement;
	let currArtistIndex: number;
	let isModalOpen: boolean = false;
	let observer: IntersectionObserver;
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
		const intersectionObserverCallback: IntersectionObserverCallback = async (
			entries,
			observer
		) => {
			const artistCard = entries[0];
			if (artistCard.isIntersecting && nextUrl && !isLoadingMore) {
				observer.unobserve(artistCard.target);
				isLoadingMore = true;
				let response = await fetch(nextUrl, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${data.spotifyToken?.access_token}`
					}
				});
				if (response.ok) {
					const jsonData = (await response.json()) as unknown;
					const savedTracks: SavedTracks = savedTracksSuccessResponseSchema.parse(jsonData);
					const newArtists = new Set();
					savedTracks.items.forEach((song) =>
						song.track.artists
							.filter((artist) => !artistIds.has(artist.id))
							.forEach((artist) => {
								newArtists.add(artist.id);
								artistIds.add(artist.id);
							})
					);

					const ids = Array.from(newArtists).join(',');
					const fetchUrl = `${SPOTIFY_BASE_URL}/artists?ids=${ids}`;
					response = await fetch(fetchUrl, {
						method: 'GET',
						headers: {
							Authorization: `Bearer ${data.spotifyToken?.access_token}`
						}
					});

					if (response.ok) {
						const jsonData = (await response.json()) as unknown; // need to batch now
						const artistsData = severalArtistsSchema.parse(jsonData);
						artists = [...artists, ...artistsData.artists];
						await tick();
						if (nextUrl) {
							let newLastCard = container.children[container.childElementCount - 2];
							observer.observe(newLastCard);
						}
					}
					nextUrl = savedTracks.next === null ? undefined : savedTracks.next;
				}
				isLoadingMore = false;
			}
		};

		const options: IntersectionObserverInit = { threshold: 0, rootMargin: '300px' };
		observer = new IntersectionObserver(intersectionObserverCallback, options);
		observer.observe(container.children[container.childElementCount - 2]);
	};

	data.artists.then((firstBatch) => {
		if (firstBatch) {
			artists = firstBatch;
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
	<ArtistGallery label="Artists you Like">
		<div class="flex flex-wrap items-center justify-center">
			{#each Array(32) as _}
				<SkeletonCard />
			{/each}
		</div>
	</ArtistGallery>
{:else}
	<ArtistGallery label="Artists you Like">
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
			{#if isLoadingMore}
				<LoadingIndicator />
			{/if}
		</div>
	</ArtistGallery>
{/if}
