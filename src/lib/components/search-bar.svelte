<script lang="ts">
	import { X } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';

	export let placeholder: string;
	export let value: string;

	const clearSearchBar = () => {
		const searchElement: HTMLElement | null = document.getElementById('search');
		if (searchElement) {
			searchElement.focus();
			value = '';
		}
	};
</script>

<div
	class="flex w-full items-center justify-between rounded-xl bg-stone-300 bg-search bg-left-center bg-no-repeat py-2 pl-12 text-spotiblack outline-none"
>
	<input id="search" type="text" class="w-full bg-inherit outline-none" {placeholder} bind:value />
	{#if value.length > 0}
		<button
			on:click={clearSearchBar}
			class=" mr-2 flex h-fit w-fit items-center justify-center text-spotiblack"
			in:scale
			out:scale
		>
			<X />
		</button>
	{/if}
</div>
