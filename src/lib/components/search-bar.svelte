<script lang="ts">
	import { X } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import { scale } from 'svelte/transition';

	export let placeholder: string;
	export let value: string;
	export let id: string = '';
	export let shouldFocusOnClear: boolean = true;
	let searchBarElement: HTMLElement;

	const dispatch = createEventDispatcher();
	const dispatchInputChangeEvent = (
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		dispatch('inputChange', { value: e.currentTarget.value });
	};

	const clearSearchBar = () => {
		if (shouldFocusOnClear) searchBarElement.focus();
		value = '';
		dispatch('searchCanceled');
	};
</script>

<div
	class="flex w-full items-center justify-between rounded-lg bg-stone-300 bg-search bg-left-center bg-no-repeat py-2 pl-12 text-spotiblack outline outline-2 outline-transparent focus-within:outline-spotigreen"
>
	<input
		{id}
		type="text"
		class="w-full bg-inherit outline-none"
		on:input={dispatchInputChangeEvent}
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
