<script lang="ts">
	import ArtistGallery from '$components/artist-gallery.svelte';
	import ArtistCard from '$components/artist-card.svelte';
	import SkeletonCard from '$components/skeleton-card.svelte';
	import { type Artist } from '$lib/types';
	import { getFollowedArtists } from '$lib/remote-functions/spotify.remote';
	import { setOnFilterContext } from '$lib/context';
	import { geoHashStore, radiusStore, setLoading } from '$lib/stores/store.svelte';
	import { getUpcomingEvents } from '$lib/remote-functions/ticketmaster.remote';
	import Modal from '$components/modal.svelte';

	const followedArtists = getFollowedArtists(undefined);

	let allArtists: Artist[] = $state([]);
	let initialState: Artist[] = $state([]);
	let nextUrl: string | null = $state(null);
	let artistName: string = $state('');
	let artistId: string = $state('');
	let isModalOpen: boolean = $state(false);

	let loadingComplete: Promise<void> | undefined = $state();
	let resolveLoading: (() => void) | undefined = $state();

	$effect(() => {
		startLoading();
		if (followedArtists.ready) {
			allArtists = followedArtists.current.artists.items;
			nextUrl = followedArtists.current.artists.next;
			if (followedArtists.current.artists.next === null) finishLoading();
		}
	});

	$effect(() => {
		if (nextUrl !== null) {
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

	const openModal = (clickedId: string, clickedArtist: string) => {
		artistId = clickedId;
		artistName = clickedArtist;
		isModalOpen = true;
		const modal: HTMLDialogElement | null = document.querySelector('#modal');
		modal?.showModal();
	};

	const loadMoreArtists = async () => {
		if (nextUrl === null) return;

		const moreArtists = await getFollowedArtists(nextUrl);
		allArtists = [...allArtists, ...moreArtists.artists.items];
		nextUrl = moreArtists.artists.next;
		if (moreArtists.artists.next === null) finishLoading();
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

{#if followedArtists.loading}
	<ArtistGallery label="Artists you Follow">
		<div class="flex flex-wrap items-center justify-center">
			{#each Array(32) as _}
				<SkeletonCard />
			{/each}
		</div>
	</ArtistGallery>
{:else if followedArtists.ready}
	<ArtistGallery label="Artists you Follow">
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
	</ArtistGallery>

	<Modal {isModalOpen} bind:artistName bind:artistId onModalClose={() => (isModalOpen = false)} />
{/if}
