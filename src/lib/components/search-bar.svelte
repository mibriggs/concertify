<script lang="ts">
	import type { InputChangeEvent } from '$lib/types';
	import { X } from 'lucide-svelte';
	import { scale } from 'svelte/transition';

	interface Props {
		placeholder: string;
		value: string;
		id?: string;
		shouldFocusOnClear?: boolean;
		onInputChange: (e: InputChangeEvent) => void;
		onSearchCanceled: () => void;
	}

	let {
		placeholder,
		value = $bindable(),
		id = '',
		shouldFocusOnClear = true,
		onInputChange,
		onSearchCanceled
	}: Props = $props();
	let searchBarElement: HTMLElement | undefined = $state();

	const clearSearchBar = () => {
		if (shouldFocusOnClear) searchBarElement?.focus();
		value = '';
		onSearchCanceled();
	};
</script>

<div
	class="flex w-full items-center justify-between rounded-lg bg-stone-300 bg-search bg-left-center bg-no-repeat py-2 pl-12 text-spotiblack outline outline-2 outline-transparent focus-within:outline-spotigreen"
>
	<input
		{id}
		type="text"
		class="w-full bg-inherit outline-none"
		oninput={onInputChange}
		{placeholder}
		bind:value
		bind:this={searchBarElement}
	/>
	{#if value.length > 0}
		<button
			onclick={clearSearchBar}
			class=" mr-2 flex h-fit w-fit items-center justify-center text-spotiblack"
			in:scale
			out:scale
		>
			<X />
		</button>
	{/if}
</div>
