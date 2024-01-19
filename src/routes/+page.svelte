<script lang="ts">
	import type { PageData } from './$types';
	import toast from 'svelte-french-toast';
	import { afterNavigate, goto } from '$app/navigation';
	import { getGeoLocation } from '$lib';

	export let data: PageData;

	afterNavigate(() => {
		console.log('Navigation ended');
		getGeoLocation();
		if (data.isSignedOut && data.isSignedOut === true) {
			toast.error('You must be signed in to view this page', { duration: 900 });
			goto('.', { replaceState: true });
		}
	});
</script>

<main class="flex h-screen flex-col items-center justify-center bg-spotiblack font-mono text-white">
	Home page
</main>
