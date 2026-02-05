<script lang="ts">
	import type { Artist } from '$lib/types';
	import ArtistCard from '$components/artist-card.svelte';
	import ArtistGallery from '$components/artist-gallery.svelte';
	import SkeletonCard from '$components/skeleton-card.svelte';
	import { getArtists, getTopArtists } from '$lib/remote-functions/spotify.remote';
	import { setOnFilterContext } from '$lib/context';
	import { geoHashStore, radiusStore, setLoading } from '$lib/stores/store.svelte';
	import { getUpcomingEvents } from '$lib/remote-functions/ticketmaster.remote';
	import Modal from '$components/modal.svelte';

	const artistIds = getTopArtists();

	let allArtists: Artist[] = $state([]);
	let initialState: Artist[] = $state([]);

	let shouldFetchMore: boolean = $state(false);
	let isModalOpen: boolean = $state(false);

	let numOfRequests: number = $state(0);
	let artistName: string = $state('');
	let artistId: string = $state('');

	let loadingComplete: Promise<void> | undefined = $state();
	let resolveLoading: (() => void) | undefined = $state();

	$effect(() => {
		startLoading();
		if (artistIds.ready && artistIds.current.ids.length > 0) {
			getArtists(artistIds.current.ids[0]).then((artists) => {
				allArtists = [...artists.artists];
				numOfRequests = artistIds.current.ids.length;
				shouldFetchMore = artistIds.current.ids.length > 1;
			});
		}
	});

	$effect(() => {
		if (shouldFetchMore) {
			loadMoreArtists();
		}
	});

	const loadMoreArtists = async () => {
		for (let i = 1; i < numOfRequests; i++) {
			const fetchedArtists = await getArtists(artistIds.current?.ids[i] ?? []);
			allArtists = [...allArtists, ...fetchedArtists.artists];
		}
		finishLoading();
	};

	$effect(() => console.log(isModalOpen));

	const openModal = (clickedId: string, clickedArtist: string) => {
		artistId = clickedId;
		artistName = clickedArtist;
		console.log(clickedId, clickedArtist);
		isModalOpen = true;
		const modal: HTMLDialogElement | null = document.querySelector('#modal');
		if (modal !== null) modal.showModal();
	};

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

	const handleSearch = async (searchValue: string) => {
		console.log(searchValue);
	};
</script>

{#if !artistIds.ready || (artistIds.ready && allArtists.length === 0)}
	<ArtistGallery label="Spotify's Top Artists">
		<div class="flex flex-wrap items-center justify-center">
			{#each Array(32) as _}
				<SkeletonCard />
			{/each}
		</div>
	</ArtistGallery>
{:else if artistIds.ready && allArtists.length > 0}
	<ArtistGallery label="Spotify's Top Artists" onsearch={handleSearch}>
		<div class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] justify-items-center gap-4">
			{#each allArtists as artist (artist.id)}
				<ArtistCard
					id={artist.id}
					artistImages={artist.images}
					name={artist.name}
					popularity={artist.popularity}
					genres={artist.genres}
					followers={artist.followers.total}
					onArtistCardClicked={openModal}
				/>
			{/each}
		</div>
		<Modal {isModalOpen} bind:artistId bind:artistName onModalClose={() => (isModalOpen = false)} />
	</ArtistGallery>
{:else}
	<div class="text-white">Some other state im not sure about</div>
{/if}
