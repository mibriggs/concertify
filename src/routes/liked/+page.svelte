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
					savedTracks.items.forEach((song) => {
						const primaryArtist = song.track.artists[0];
						if (primaryArtist && !artistIds.has(primaryArtist.id)) {
							newArtists.add(primaryArtist.id);
							artistIds.add(primaryArtist.id);
						}
					});

					const ids = Array.from(newArtists).join(',');
					const fetchUrl = `${SPOTIFY_BASE_URL}/artists?ids=${ids}`;
					const artistResponse = await fetch(fetchUrl, {
						method: 'GET',
						headers: {
							Authorization: `Bearer ${data.spotifyToken?.access_token}`
						}
					});

					const newArtistsList: Artist[] = [];
					if (artistResponse.ok) {
						const jsonData = (await artistResponse.json()) as unknown;
						const artistsData = severalArtistsSchema.parse(jsonData);
						newArtistsList.push(...artistsData.artists);
					}

					artists = [...artists, ...newArtistsList];
					nextUrl = savedTracks.next === null ? undefined : savedTracks.next;
					await tick();
					if (nextUrl && newArtistsList.length > 0) {
						const artistCardIndex = artists.length - 2;
						const allButtons = Array.from(container.querySelectorAll('button'));
						let newLastCard = allButtons[artistCardIndex];
						if (newLastCard) observer.observe(newLastCard);
					} else if (nextUrl && newArtistsList.length === 0) {
						// No new artists in this batch, fetch next batch immediately
						isLoadingMore = false;
						intersectionObserverCallback(
							[{ isIntersecting: true, target: entries[0].target } as IntersectionObserverEntry],
							observer
						);
						return;
					}
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
		<div
			class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] justify-items-center gap-4"
			bind:this={container}
		>
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
