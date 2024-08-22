<script lang="ts">
	import type { PageData } from './$types';
	import ArtistGallery from '$components/artist-gallery.svelte';

	export let data: PageData;

</script>

{#if data.artists}
	<ArtistGallery artists={data.artists} label="Top 50 Artists" />
{/if}
