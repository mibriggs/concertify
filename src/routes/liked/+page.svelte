<!-- <script lang="ts">
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

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let artists: Artist[] = $state([]);
	let artistIds: Set<string> = $derived(data.artistIds);
	let nextUrl: string | undefined = $derived(data.nextUrl);
	let container: HTMLDivElement | undefined = $state();
	let currArtistIndex: number = $state(-1);
	let isModalOpen: boolean = $state(false);
	let observer: IntersectionObserver;
	let isPageLoading = $state(true);
	let isLoadingMore = $state(false);

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
						const allButtons = Array.from(container?.querySelectorAll('button') ?? []);
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

		const options = { threshold: 0, rootMargin: '300px' };
		observer = new IntersectionObserver(intersectionObserverCallback, options);
		const targetIndex = (container?.childElementCount ?? 0) - 2;
		const targetElement = container?.children[targetIndex];
		if (targetElement) {
			observer.observe(targetElement);
		}
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
		<div class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] justify-items-center gap-4">
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
					popularity={artist.popularity}
					genres={artist.genres}
					followers={artist.followers.total}
					onArtistCardClicked={() => openModal(indx)}
				/>
			{/each}
			<Modal
				{isModalOpen}
				artist={artists[currArtistIndex]}
				onModalClose={() => (isModalOpen = false)}
			/>
			{#if isLoadingMore}
				<LoadingIndicator />
			{/if}
		</div>
	</ArtistGallery>
{/if} -->

<script lang="ts">
	import type { PageData } from './$types';
	import ArtistCard from '$components/artist-card.svelte';
	import ArtistGallery from '$components/artist-gallery.svelte';
	import Modal from '$components/modal.svelte';
	import LoadingIndicator from '$components/loading-indicator.svelte';
	import SkeletonCard from '$components/skeleton-card.svelte';
	import { type Artist, savedTracksSuccessResponseSchema, severalArtistsSchema } from '$lib/types';
	import { SPOTIFY_BASE_URL } from '$lib';
	import { createInfiniteScroll } from '$lib/use-infinite-scroll.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let artists: Artist[] = $state([]);
	let artistIds: Set<string> = $state(new Set());
	let nextUrl: string | undefined = $state(undefined);
	let container: HTMLDivElement | undefined = $state();
	let currArtistIndex: number = $state(-1);
	let isModalOpen: boolean = $state(false);
	let initialized = $state(false);
	let isLoadingMore = $state(false);

	const openModal = (artistIndex: number) => {
		currArtistIndex = artistIndex;
		isModalOpen = true;
		const modal: HTMLDialogElement | null = document.querySelector('#modal');
		modal?.showModal();
	};

	const loadMore = async (): Promise<void> => {
		if (!nextUrl || isLoadingMore) return;

		isLoadingMore = true;

		const response = await fetch(nextUrl, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${data.spotifyToken?.access_token}`
			}
		});

		if (!response.ok) {
			isLoadingMore = false;
			return;
		}

		const jsonData = (await response.json()) as unknown;
		const savedTracks = savedTracksSuccessResponseSchema.parse(jsonData);

		const newArtistIds: string[] = [];
		savedTracks.items.forEach((song) => {
			const primaryArtist = song.track.artists[0];
			if (primaryArtist && !artistIds.has(primaryArtist.id)) {
				newArtistIds.push(primaryArtist.id);
				artistIds.add(primaryArtist.id);
			}
		});

		nextUrl = savedTracks.next ?? undefined;

		if (newArtistIds.length === 0) {
			isLoadingMore = false;
			if (nextUrl) await loadMore();
			return;
		}

		const artistResponse = await fetch(
			`${SPOTIFY_BASE_URL}/artists?ids=${newArtistIds.join(',')}`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${data.spotifyToken?.access_token}`
				}
			}
		);

		if (artistResponse.ok) {
			const artistJson = (await artistResponse.json()) as unknown;
			const artistsData = severalArtistsSchema.parse(artistJson);
			artists = [...artists, ...artistsData.artists];
		}

		isLoadingMore = false;
	};

	// Initialize from streamed promise
	$effect(() => {
		data.artists.then((firstBatch) => {
			if (firstBatch) {
				artists = firstBatch;
				artistIds = data.artistIds;
				nextUrl = data.nextUrl;
				initialized = true;
			}
		});
	});

	// Infinite scroll
	createInfiniteScroll({
		container: () => container,
		itemCount: () => artists.length,
		hasMore: () => !!nextUrl,
		loadMore
	});
</script>

{#if !initialized}
	<ArtistGallery label="Artists from Saved Tracks">
		<div class="flex flex-wrap items-center justify-center">
			{#each Array(32) as _}
				<SkeletonCard />
			{/each}
		</div>
	</ArtistGallery>
{:else}
	<ArtistGallery label="Artists from Saved Tracks">
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
