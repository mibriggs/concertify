<script lang="ts">
	import type { PageData } from './$types';
	import toast from 'svelte-french-toast';
	import { afterNavigate } from '$app/navigation';

	export let data: PageData;

	afterNavigate(() => {
		if (data.isSignedOut && data.isSignedOut === true) {
			toast.error('You must be signed in to view this page', { duration: 900 });
		}
	});
</script>

<main class="flex h-screen flex-col items-center justify-center bg-spotiblack font-mono text-white">
	Home page
</main>
