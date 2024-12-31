<script lang="ts">
	import type { PageData } from './$types';
	import { severalArtistsSchema, type Artist } from '$lib/types';
	import ArtistCard from '$components/artist-card.svelte';
	import ArtistGallery from '$components/artist-gallery.svelte';
	import Modal from '$components/modal.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { SPOTIFY_BASE_URL } from '$lib';

	export let data: PageData;

	let artists: Artist[] = data.artists ? data.artists : [];
	let nextArtistId = data.nextArtistId;
	let currArtistIndex: number;
	let isModalOpen: boolean = false;
	let observer: IntersectionObserver;
	let container: HTMLDivElement;
	let batchNo = data.batchNo;
	let startIndex = data.start;
	let endIndex = data.end;
	let artistIds = data.artistIds;

	const openModal = (artistIndex: number) => {
		currArtistIndex = artistIndex;
		isModalOpen = true;
		const modalId = '#modal';
		const modal: HTMLDialogElement | null = document.querySelector(modalId);
		modal?.showModal();
	};

	onMount(() => {
		if (browser) {
			const intersectionObserverCallback: IntersectionObserverCallback = async (
				entries,
				observer
			) => {
				let lastCard = entries[0];
				if (lastCard.isIntersecting && nextArtistId) {
					observer.unobserve(lastCard.target);
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
					await tick();
					let newLastCard = container.children[container.childElementCount - 2];
					observer.observe(newLastCard);
				}
			};

			const options: IntersectionObserverInit = { threshold: 0, rootMargin: '300px' };
			observer = new IntersectionObserver(intersectionObserverCallback, options);
			observer.observe(container.children[container.childElementCount - 2]);
		}
	});

	onDestroy(() => {
		if (observer) {
			observer.disconnect();
		}
	});
</script>

{#if data.artists}
	<ArtistGallery label="Top Artists">
		<div class="flex flex-wrap items-center justify-center" bind:this={container}>
			{#each artists as artist, indx}
				<ArtistCard
					imageUrl={artist.images[0].url}
					name={artist.name}
					popularity={artist.popularity ? artist.popularity : 0}
					genres={artist.genres}
					followers={artist.followers.total}
					width={artist.images[0].width}
					height={artist.images[0].height}
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
