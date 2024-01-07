<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	onMount(() =>  console.log('Page mount', form));
</script>

<div class="flex flex-col h-full items-center justify-center bg-spotiblack">
	{#if data.spotifyToken}
		<form method="post" action="?/viewFollowedArtists">
			<button class="text-white">View artists you follow </button>
		</form>
	{:else}
		<!-- <a href="/api/login" class="text-white">Get Started</a> -->
		<form method="post" action="?/authWithSpotify" use:enhance>
			<button class="text-white">Get Started</button>
		</form>
	{/if}

	{#if form?.artists}
		<div class="flex gap-4 flex-wrap p-4">
			{#each form.artists as artist}
				<div class="flex items-center justify-center p-4 bg-spotigreen rounded-lg text-white w-fit">
					{artist.name}
				</div>
			{/each}
		</div>
	{/if}
</div>
