<script lang="ts">
	import type { PageData } from './$types';
	import ArtistGallery from '$components/artist-gallery.svelte';
	import ArtistCard from '$components/artist-card.svelte';
	import Modal from '$components/modal.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import {
		followedArtistsSuccessReponseSchema,
		type Artist,
		type FollowedArtists
	} from '$lib/types';

	export let data: PageData;

	let artists: Artist[] = data.artists ? data.artists.artists.items : [];
	let nextUrl: string | null = data.artists ? data.artists.artists.next : null;
	let currArtistIndex: number;
	let isModalOpen: boolean = false;
	let observer: IntersectionObserver;
	let container: HTMLDivElement;

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
				if (lastCard.isIntersecting && nextUrl !== null) {
					observer.unobserve(lastCard.target);
					const response = await fetch(nextUrl, {
						method: 'GET',
						headers: {
							Authorization: `Bearer ${data.spotifyToken?.access_token}`
						}
					});
					if (response.ok) {
						const data = (await response.json()) as unknown;
						const artistsData: FollowedArtists = followedArtistsSuccessReponseSchema.parse(data);
						nextUrl = artistsData.artists.next;
						const newArtists: Artist[] = artistsData.artists.items;
						artists = [...artists, ...newArtists];
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
	<ArtistGallery label="Artists you Follow">
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
		</div>
	</ArtistGallery>
{/if}
