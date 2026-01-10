<script lang="ts">
	import type { PageData } from './$types';
	import { severalArtistsSchema, type Artist } from '$lib/types';
	import ArtistCard from '$components/artist-card.svelte';
	import ArtistGallery from '$components/artist-gallery.svelte';
	import Modal from '$components/modal.svelte';
	import LoadingIndicator from '$components/loading-indicator.svelte';
	import { onDestroy, tick } from 'svelte';
	import { getTopSongsArtists, SPOTIFY_BASE_URL } from '$lib';
	import SkeletonCard from '$components/skeleton-card.svelte';

	export let data: PageData;

	let artists: Artist[] = [];
	let nextArtistId: string | undefined = '';
	let artistIds: string[] = [];

	let currArtistIndex: number;
	let isModalOpen: boolean = false;
	let observer: IntersectionObserver;
	let container: HTMLDivElement;
	let batchNo = data.batchNo;
	let startIndex = data.start;
	let endIndex = data.end;
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
			if (lastCard.isIntersecting && nextArtistId && !isLoadingMore) {
				observer.unobserve(lastCard.target);
				isLoadingMore = true;
				batchNo++;
				startIndex = endIndex;
				endIndex = data.count * batchNo;
				nextArtistId = artistIds[endIndex];
				const ids = artistIds.slice(startIndex, endIndex).join(',');
				const fetchUrl = `${SPOTIFY_BASE_URL}/artists?ids=${ids}`;
				const response = await fetch(fetchUrl, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${data.spotifyToken?.access_token}`
					}
				});

				if (response.ok) {
					const data = (await response.json()) as unknown; // need to batch now
					const maybeArtistsData = severalArtistsSchema.safeParse(data);
					if (maybeArtistsData.success) {
						artists = [...artists, ...maybeArtistsData.data.artists];
					} else {
						throw new Error(maybeArtistsData.error.message);
					}
				}
				isLoadingMore = false;
				await tick();
				if (nextArtistId) {
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

	data.artistIds.then((firstArtistIds) => {
		artistIds = Array.from(firstArtistIds);
		if (data.spotifyToken) {
			getTopSongsArtists(data.spotifyToken, artistIds.slice(0, 25)).then((firstBatch) => {
				if (firstBatch) {
					artists = firstBatch;
					nextArtistId = Array.from(firstArtistIds)[0];
					tick().then(() => {
						if (container) setupObserver();
					});
					isPageLoading = false;
				}
			});
		}
	});

	onDestroy(() => {
		if (observer) {
			observer.disconnect();
		}
	});
</script>

{#if isPageLoading}
	<ArtistGallery label="Spotify's Top Artists">
		<div class="flex flex-wrap items-center justify-center">
			{#each Array(32) as _}
				<SkeletonCard />
			{/each}
		</div>
	</ArtistGallery>
{:else}
	<ArtistGallery label="Spotify's Top Artists">
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
