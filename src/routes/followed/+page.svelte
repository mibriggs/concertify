<script lang="ts">
	import ArtistGallery from '$components/artist-gallery.svelte';
	import ArtistCard from '$components/artist-card.svelte';
	import Modal from '$components/modal.svelte';
	import LoadingIndicator from '$components/loading-indicator.svelte';
	import SkeletonCard from '$components/skeleton-card.svelte';
	import { type Artist } from '$lib/types';
	import { getFollowedArtists } from '$lib/remote-functions/spotify.remote';
	import { setOnFilterContext, setSelectedFiltersContext } from '$lib/context';
	import { geoHashStore, radiusStore, setLoading } from '$lib/stores/store.svelte';
	import { getUpcomingEvents } from '$lib/remote-functions/ticketmaster.remote';

	const followedArtists = getFollowedArtists(undefined);

	let allArtists: Artist[] = $state([]);
	let initialState: Artist[] = $state([]);
	let nextUrl: string | null = $state(null);
	let currArtistIndex: number = $state(-1);
	let isModalOpen: boolean = $state(false);
	let isLoadingMore = $state(false);

	setSelectedFiltersContext({ value: [] });

	const openModal = (artistIndex: number) => {
		currArtistIndex = artistIndex;
		isModalOpen = true;
		const modal: HTMLDialogElement | null = document.querySelector('#modal');
		modal?.showModal();
	};

	const loadMoreArtists = async () => {
		if (!nextUrl || isLoadingMore) return;

		const moreArtists = await getFollowedArtists(nextUrl);
		allArtists = [...allArtists, ...moreArtists.artists.items];
		nextUrl = moreArtists.artists.next;
	};
	$effect(() => {
		if (followedArtists.ready) {
			allArtists = followedArtists.current.artists.items;
			nextUrl = followedArtists.current.artists.next;
		}
	});

	$effect(() => {
		if (nextUrl !== null) {
			loadMoreArtists();
		}
	});

	setOnFilterContext(async (selectedFilters: string[]) => {
		if (selectedFilters.includes('upcoming concerts')) {
			setLoading(true);
			let stillLoadingArtists = true;
			while (stillLoadingArtists) {
				if (allArtists.length > 0 && nextUrl === null) {
					stillLoadingArtists = false;
				}
			}

			console.log(geoHashStore.value);
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
			setLoading(false);
		} else if (selectedFilters.length === 0) {
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
			{#each allArtists as artist, indx}
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
	</ArtistGallery>

	<Modal
		{isModalOpen}
		artist={allArtists[currArtistIndex]}
		onModalClose={() => (isModalOpen = false)}
	/>
{/if}
