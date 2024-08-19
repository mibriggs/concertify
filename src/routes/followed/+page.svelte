<script lang="ts">
	import type { Artist } from '$lib/types';
	import type { PageData } from './$types';
	import Modal from '$components/modal.svelte';
	import ArtistCard from '$components/artist-card.svelte';
	import Button from '$components/button.svelte';
	import SearchBar from '$components/search-bar.svelte';

	export let data: PageData;

	const chunkSize = 12;
	const chunks: Artist[][] = [];
	let chunkIndex = 0;
	let searchValue: string = '';

	if (data.artists) {
		for (let i = 0; i < data.artists.length; i += chunkSize) {
			const chunk = data.artists.slice(i, i + chunkSize);
			chunks.push(chunk);
		}
	}

	let currArtistIndex: number;
	const openModal = (artistIndex: number) => {
		currArtistIndex = artistIndex;
		const modalId = '#modal';
		const modal: HTMLDialogElement | null = document.querySelector(modalId);
		modal?.showModal();
	};

	const nextPage = () => {
		chunkIndex += 1;
		scrollToElement();
	}

	const prevPage = () => {
		chunkIndex -= 1;
		scrollToElement();
	}

	const scrollToElement = () => {
        window.scrollTo({top: 0, behavior: "smooth"});
    };

	$: isOnFirstPage = chunkIndex === 0;
	$: isOnLastPage = chunkIndex === chunks.length - 1;
</script>

{#if data.artists}
	<main class="flex flex-col font-mono text-white">
		<div class="sticky top-20 z-10 flex flex-col gap-2 bg-spotiblack py-3">
			<!-- For larger screens -->
			<div class="hidden items-center justify-between pl-8 md:flex">
				<span class="sm:text-md text-sm font-bold md:text-xl">Artists you Follow</span>
				<div class="w-5/12">
					<SearchBar placeholder="Search artists..." bind:value={searchValue} />
				</div>
				<div class="flex gap-4 pr-6">
					<Button disabled={isOnFirstPage} on:click={prevPage}>Previous</Button>
					<Button disabled={isOnLastPage} on:click={nextPage}>Next</Button>
				</div>
			</div>

			<!-- For smaller screens -->
			<div class="flex flex-col items-center justify-center gap-2 px-6 md:hidden">
				<div class="flex w-full items-center justify-between gap-2">
					<span class="sm:text-md text-sm font-bold md:text-xl">Artists you Follow</span>
					<div class="flex gap-4">
						<Button disabled={isOnFirstPage} on:click={prevPage}>Previous</Button>
						<Button disabled={isOnLastPage} on:click={nextPage}>Next</Button>
					</div>
				</div>
				<div class="w-full">
					<SearchBar placeholder="Search artists..." bind:value={searchValue} />
				</div>
			</div>
		</div>

		<div class="flex flex-wrap items-center justify-center">
			{#each chunks[chunkIndex] as artist, indx}
				<ArtistCard
					imageUrl={artist.images[0].url}
					name={artist.name}
					popularity={artist.popularity}
					genres={artist.genres}
					followers={artist.followers.total}
					width={artist.images[0].width}
					height={artist.images[0].height}
					on:click={() => openModal(indx)}
				/>
			{/each}
			<Modal artist={chunks[chunkIndex][currArtistIndex]} />
		</div>
	</main>
{/if}
