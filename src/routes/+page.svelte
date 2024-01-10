<script lang="ts">
	import type { PageData } from './$types';
	import toast from 'svelte-french-toast';
	import { goto } from '$app/navigation';

	export let data: PageData;

	$: if (data.toSignIn) {
		toast.error('You must be signed in to view this page');
		goto('/');
	}
</script>

<main class="flex h-screen flex-col items-center justify-center bg-spotiblack font-mono text-white">
	Home page
</main>
