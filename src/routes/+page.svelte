<script lang="ts">
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

<main class="flex flex-col items-center justify-start bg-spotiblack font-mono text-white">
	Home page
</main>
