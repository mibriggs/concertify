<script lang="ts">
	import ArtistCard from '$components/artist-card.svelte';
	import ArtistGallery from '$components/artist-gallery.svelte';
	import Modal from '$components/modal.svelte';
	import SkeletonCard from '$components/skeleton-card.svelte';
	import { type Artist } from '$lib/types';
	import { getLikedArtists } from '$lib/remote-functions/spotify.remote';
	import { setOnFilterContext } from '$lib/context';
	import { geoHashStore, radiusStore, setLoading } from '$lib/stores/store.svelte';
	import { getUpcomingEvents } from '$lib/remote-functions/ticketmaster.remote';

	const likedArtists = getLikedArtists(undefined);

	let allArtists: Artist[] = $state([]);
	let initialState: Artist[] = $state([]);
	let artistIds: Set<string> = $state(new Set());
	let nextUrl: string | undefined = $state(undefined);
	let isModalOpen: boolean = $state(false);
	let artistName: string = $state('');

	let loadingComplete: Promise<void> | undefined = $state();
	let resolveLoading: (() => void) | undefined = $state();

	$effect(() => console.log(artistIds.size));
	$effect(() => {
		startLoading();
		if (likedArtists.ready) {
			allArtists = likedArtists.current.artists;
			nextUrl = likedArtists.current.nextUrl;
			artistIds = new Set(likedArtists.current.artists.map((artist) => artist.id));
			if (!likedArtists.current.nextUrl) finishLoading();
		}
	});

	$effect(() => {
		if (nextUrl) {
			loadMoreArtists();
		}
	});

	// Create the promise
	function startLoading() {
		loadingComplete = new Promise((resolve) => {
			resolveLoading = resolve;
		});
	}

	// Call this when everything is done loading
	function finishLoading() {
		if (resolveLoading) resolveLoading();
	}

	const openModal = (clickedArtist: string) => {
		artistName = clickedArtist;
		isModalOpen = true;
		const modal: HTMLDialogElement | null = document.querySelector('#modal');
		modal?.showModal();
	};

	const loadMoreArtists = async () => {
		if (!nextUrl) return;

		const moreArtists = await getLikedArtists(nextUrl);
		const artistsToAdd = moreArtists.artists.filter((artist) => !artistIds.has(artist.id));
		allArtists = [...allArtists, ...artistsToAdd];
		artistIds = new Set([...artistIds, ...artistsToAdd.map((artist) => artist.id)]);
		nextUrl = moreArtists.nextUrl;

		if (!moreArtists.nextUrl) finishLoading();
	};

	setOnFilterContext(async (selectedFilters: string[]) => {
		if (selectedFilters.includes('upcoming concerts')) {
			setLoading(true);
			console.time('Fetching upcoming concerts');

			if (loadingComplete !== undefined) await loadingComplete;

			if (initialState.length !== 0) {
				allArtists = initialState;
				initialState = [];
			}

			let radius = radiusStore.value;
			let geoHash = undefined;

			if (geoHashStore.value.name !== '') {
				geoHash = geoHashStore.value.geoHash;
			}
			const performingArtistNames = await getUpcomingEvents({ geoHash, radius });
			const newList = allArtists.filter((artist) =>
				performingArtistNames.includes(artist.name.toLowerCase())
			);
			initialState = allArtists;
			allArtists = [...newList];
			console.timeEnd('Fetching upcoming concerts');
			setLoading(false);
		} else if (selectedFilters.length === 0 && initialState.length !== 0) {
			allArtists = initialState;
		}
	});
</script>

{#if likedArtists.loading}
	<ArtistGallery label="Artists from Saved Tracks">
		<div class="flex flex-wrap items-center justify-center">
			{#each Array(32) as _}
				<SkeletonCard />
			{/each}
		</div>
	</ArtistGallery>
{:else if likedArtists.ready}
	<ArtistGallery label="Artists from Saved Tracks">
		<div class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] justify-items-center gap-4">
			{#each allArtists as artist (artist.id)}
				<ArtistCard
					artistImages={artist.images}
					name={artist.name}
					popularity={artist.popularity}
					genres={artist.genres}
					followers={artist.followers.total}
					onArtistCardClicked={openModal}
				/>
			{/each}
		</div>
		<Modal {isModalOpen} onModalClose={() => (isModalOpen = false)} bind:artistName />
	</ArtistGallery>
{/if}
