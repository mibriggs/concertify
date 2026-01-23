<script lang="ts">
	import type { PageData } from './$types';
	import { severalArtistsSchema, type Artist } from '$lib/types';
	import ArtistCard from '$components/artist-card.svelte';
	import ArtistGallery from '$components/artist-gallery.svelte';
	import Modal from '$components/modal.svelte';
	import LoadingIndicator from '$components/loading-indicator.svelte';
	import SkeletonCard from '$components/skeleton-card.svelte';
	import { getTopSongsArtists, SPOTIFY_BASE_URL } from '$lib';
	import { createInfiniteScroll } from '$lib/use-infinite-scroll.svelte';
	import { setSelectedFiltersContext } from '$lib/context';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let artists: Artist[] = $state([]);
	let artistIds: string[] = $state([]);
	let currentEndIndex = $state(0);

	let currArtistIndex: number = $state(-1);
	let isModalOpen: boolean = $state(false);
	let container: HTMLDivElement | undefined = $state();
	let initialized = $state(false);
	let isLoadingMore = $state(false);

	setSelectedFiltersContext({ value: [] });

	// Are there more artists to load?
	let hasMore = $derived(currentEndIndex < artistIds.length);

	const openModal = (artistIndex: number) => {
		currArtistIndex = artistIndex;
		isModalOpen = true;
		const modal: HTMLDialogElement | null = document.querySelector('#modal');
		modal?.showModal();
	};

	const loadMore = async () => {
		if (!hasMore || isLoadingMore) return;

		isLoadingMore = true;

		const startIndex = currentEndIndex;
		const endIndex = Math.min(currentEndIndex + data.count, artistIds.length);
		const ids = artistIds.slice(startIndex, endIndex).join(',');

		const response = await fetch(`${SPOTIFY_BASE_URL}/artists?ids=${ids}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${data.spotifyToken?.access_token}`
			}
		});

		if (response.ok) {
			const json = (await response.json()) as unknown;
			const result = severalArtistsSchema.safeParse(json);
			if (result.success) {
				artists = [...artists, ...result.data.artists];
				currentEndIndex = endIndex;
			} else {
				throw new Error(result.error.message);
			}
		}

		isLoadingMore = false;
	};

	// Initialize from streamed promise
	$effect(() => {
		data.artistIds.then((ids) => {
			artistIds = Array.from(ids);

			if (data.spotifyToken) {
				getTopSongsArtists(data.spotifyToken, artistIds.slice(0, data.count)).then((firstBatch) => {
					if (firstBatch) {
						artists = firstBatch;
						currentEndIndex = data.count;
						initialized = true;
					}
				});
			}
		});
	});

	// Infinite scroll
	createInfiniteScroll({
		container: () => container,
		itemCount: () => artists.length,
		hasMore: () => hasMore,
		loadMore
	});
</script>

{#if !initialized}
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
					onArtistCardClicked={() => openModal(indx)}
				/>
			{/each}
			{#if isLoadingMore}
				<LoadingIndicator />
			{/if}
		</div>
		<Modal
			{isModalOpen}
			artist={artists[currArtistIndex]}
			onModalClose={() => (isModalOpen = false)}
		/>
	</ArtistGallery>
{/if}
