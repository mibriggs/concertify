<script lang="ts">
	import { X } from 'lucide-svelte';
	import { scale } from 'svelte/transition';

	export let placeholder: string;
	export let value: string;
	let searchBarElement: HTMLElement;

	const clearSearchBar = () => {
		searchBarElement.focus();
		value = '';
	};
</script>

<div
	class="flex w-full items-center justify-between rounded-lg bg-stone-300 bg-search bg-left-center bg-no-repeat py-2 pl-12 text-spotiblack outline-none"
>
	<input
		id="search"
		type="text"
		class="w-full bg-inherit outline-none"
		on:input
		{placeholder}
		bind:value
		bind:this={searchBarElement}
	/>
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
