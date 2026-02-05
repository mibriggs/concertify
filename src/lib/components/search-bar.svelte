<script lang="ts">
	import type { InputChangeEvent } from '$lib/types';
	import { X } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
	import { twJoin } from 'tailwind-merge';

	interface Props {
		placeholder: string;
		value: string;
		id?: string;
		shouldFocusOnClear?: boolean;
		onSearchCanceled: () => void;
		onenter?: () => void;
		onInputChange?: (e: InputChangeEvent) => void;
		class?: string;
	}

	let {
		placeholder,
		value = $bindable(),
		id = '',
		shouldFocusOnClear = true,
		class: clazz = undefined,
		onInputChange = undefined,
		onenter = undefined,
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
	class={twJoin(
		'flex w-full items-center justify-between rounded-lg bg-stone-300 bg-search bg-left-center bg-no-repeat py-2 pl-12 text-spotiblack outline outline-2 outline-transparent focus-within:outline-spotigreen',
		clazz
	)}
>
	<input
		{id}
		type="text"
		class="w-full bg-inherit outline-none"
		onkeydown={(e) => {
			if (e.key === 'Enter' && onenter) {
				console.log('Enter pressed');
				onenter();
			}
		}}
		oninput={(e) => {
			if (onInputChange) {
				onInputChange(e);
			}
		}}
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
