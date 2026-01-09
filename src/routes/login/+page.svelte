<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import toast from 'svelte-french-toast';
	import { afterNavigate, goto } from '$app/navigation';

	export let data: PageData;

	afterNavigate(() => {
		if (data.isSignedOut && data.isSignedOut === true) {
			toast.error('You must be signed in to view this page', { duration: 900 });
			goto('.', { replaceState: true });
		}
	});
</script>

<main
	class="flex min-h-screen flex-col items-center justify-center bg-spotiblack px-4 font-mono text-white"
>
	<div class="max-w-2xl text-center">
		<h1 class="mb-6 text-4xl font-bold md:text-6xl">See Your Favorite Artists Live</h1>

		<p class="mb-8 text-lg text-gray-300 md:text-xl">
			Connect your Spotify to discover upcoming concerts from artists you love. Search by location,
			view venue maps, and buy tickets—all in seconds.
		</p>

		<form method="post" action="?/authWithSpotify" use:enhance class="flex justify-center">
			<button
				type="submit"
				class="flex items-center gap-3 rounded-full bg-spotigreen px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-green-500"
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
						fill="currentColor"
					/>
				</svg>
				Login with Spotify
			</button>
		</form>

		<p class="mt-6 text-sm text-gray-400">We'll never post anything without your permission</p>
	</div>
</main>
