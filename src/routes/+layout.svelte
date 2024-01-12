<script lang="ts">
	import '../app.css';
	import { enhance } from '$app/forms';
	import type { LayoutData } from './$types';
	import { Toaster } from 'svelte-french-toast';

	export let data: LayoutData;
</script>

<Toaster />
<nav class="flex items-center justify-start gap-2 p-8 font-mono text-white">
	<a href="/">Home</a>
	<a href="/leaders" data-sveltekit-preload-data>Top Artists</a>
	<a href="/followed" data-sveltekit-preload-data>Followed Artists</a>
	<a href="/liked" data-sveltekit-preload-data>Liked Artists</a>
	{#if !data.spotifyToken}
		<form method="post" action="/?/authWithSpotify" use:enhance class="ml-auto self-end">
			<button class="text-white">Get Started</button>
		</form>
	{:else}
		<form method="post" action="/?/logoutUser" use:enhance class="ml-auto self-end">
			<button class="text-white">Logout</button>
		</form>
	{/if}
</nav>
<slot />

<style lang="postcss">
	:global(body) {
		background-color: theme(colors.spotiblack);
	}
</style>
