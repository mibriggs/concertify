<script lang="ts">
	import '../app.css';
	import { enhance } from '$app/forms';
	import type { LayoutData } from './$types';
	import { Toaster } from 'svelte-french-toast';
	import { afterNavigate } from '$app/navigation';
	import { getGeoLocation } from '$lib';

	export let data: LayoutData;

	afterNavigate(() => {
		console.log('Navigation ended');
		getGeoLocation();
	});
</script>

<Toaster />
<nav
	class="sticky top-0 z-10 flex items-center justify-start gap-2 bg-spotiblack p-8 font-mono text-white"
>
	<a href="/" class="rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-spotigreen"
		>Home</a
	>
	<a
		href="/leaders"
		data-sveltekit-preload-data
		class="cutoff-text rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-spotigreen"
		>Top Artists</a
	>
	<a
		href="/followed"
		data-sveltekit-preload-data
		class="cutoff-text rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-spotigreen"
		>Followed Artists</a
	>
	<a
		href="/liked"
		data-sveltekit-preload-data
		class="cutoff-text rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-spotigreen"
		>Liked Artists</a
	>
	<form
		method="post"
		action={!data.spotifyToken ? '/?/authWithSpotify' : '/?/logoutUser'}
		use:enhance
		class="ml-auto self-end rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-red-600"
	>
		<button class="text-white">{!data.spotifyToken ? 'Get Started' : 'Logout'}</button>
	</form>
</nav>
<slot />

<style lang="postcss">
	:global(body) {
		background-color: theme(colors.spotiblack);
	}

	.cutoff-text {
		--max-lines: 1;

		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: var(--max-lines);
		width: fit-content;
	}
</style>
