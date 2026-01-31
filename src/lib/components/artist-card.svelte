<script lang="ts">
	import { formatNumber } from '$lib';
	import type { ArtistImage } from '$lib/types';
	import { UserCheck } from 'lucide-svelte';
	import NoImage from '$lib/assets/no-image-found.jpg';

	interface Props {
		artistImages?: ArtistImage[];
		id: string;
		name: string;
		popularity: number | undefined;
		genres: string[];
		followers: number;
		onArtistCardClicked: (artistId: string, artistName: string) => void;
	}

	let {
		artistImages = [],
		id,
		name,
		popularity,
		genres,
		followers,
		onArtistCardClicked
	}: Props = $props();

	let src = $derived(artistImages.length > 0 ? artistImages[0].url : NoImage);
	let width = $derived(artistImages.length > 0 ? (artistImages[0].width ?? 288) : 288);
	let height = $derived(artistImages.length > 0 ? (artistImages[0].height ?? 320) : 320);
</script>

<button
	class="m-6 flex w-80 transform flex-col items-center gap-1 rounded-xl bg-stone-500 p-4 text-start transition-all duration-[225ms] hover:scale-[1.08] hover:opacity-60"
	onclick={() => onArtistCardClicked(id, name)}
>
	<img {src} alt="Artist" class="mb-4 rounded-lg shadow-lg" loading="lazy" {width} {height} />
	<span class="text-xl font-bold">{name}</span>
	<span class="flex self-start text-sm italic">Popularity: {popularity ?? 'N/A'}</span>
	<span class="flex flex-1 self-start text-wrap text-sm italic">Genres: {genres.join(', ')}</span>
	<div class="flex items-stretch justify-center gap-2 self-end">
		<span>{formatNumber(followers)}</span>
		<UserCheck size="20" stroke="1" />
	</div>
</button>
