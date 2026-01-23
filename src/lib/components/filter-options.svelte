<script lang="ts">
	import { X } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import { slide } from 'svelte/transition';
	import { getOnFilterContext, getSelectedFiltersContext } from '$lib/context';

	interface Props {
		options: Record<string, string[]>;
		oncancel: () => void;
		class?: string;
	}

	let { options, oncancel, class: myClass = undefined }: Props = $props();

	const selectedFilters = getSelectedFiltersContext();
	let selected: string[] = $state(selectedFilters.value);

	const onfilter = getOnFilterContext();

	const applyFilters = async () => {
		selectedFilters.value = selected;
		oncancel();
		onfilter(selected);
	};
</script>

<div
	class={twMerge(
		'absolute top-full right-5 bg-neutral-50 text-black p-3 rounded-xl shadow-lg shadow-black/50 w-80 gap-4 flex flex-col max-h-[440px]',
		myClass
	)}
	in:slide
	out:slide
>
	<!-- Header -->
	<div class="flex flex-col gap-3 sticky top-0">
		<div class="flex items-center justify-between">
			<div class="font-semibold text-sm">Filters</div>
			<button
				class="rounded-lg border text-slate-500 transition-all duration-200 active:scale-90 active:bg-neutral-200 filter-button"
				onclick={oncancel}
			>
				<X />
			</button>
		</div>
		<!-- <SearchBar
			placeholder="Search filters..."
			onInputChange={() => {}}
			onSearchCanceled={() => {}}
			value=""
			class="bg-neutral-50 border-2 rounded-lg focus-within:outline-none py-[3px]"
		/> -->
	</div>

	<!-- Filters -->
	<div class="flex flex-col gap-2 overflow-y-auto p-1">
		{#each Object.entries(options) as [header, picks]}
			<fieldset class="flex flex-col gap-2">
				<legend class="text-sm font-semibold text-slate-500 uppercase">{header}</legend>
				{#each picks as option}
					<label
						class=" border rounded-xl p-2 text-sm font-medium cursor-pointer has-[:checked]:shadow-md has-[:checked]:shadow-neutral-700/20 select-none capitalize transition-all duration-200 active:scale-[0.98] active:bg-neutral-100 filter-option"
					>
						<input
							type="checkbox"
							name={header.toLowerCase()}
							value={option.toLowerCase()}
							bind:group={selected}
						/>
						{option}
					</label>
				{/each}
			</fieldset>
		{/each}
	</div>

	<hr class="-my-3 -mx-3 border-t border-gray-200" />

	<!-- Footer -->
	<div class="flex items-center justify-between font-semibold text-sm py-2 sticky bottom-0">
		<button
			class="ring-1 ring-neutral-200 rounded-xl px-2 py-2 transition-all duration-200 active:scale-90 active:bg-neutral-200 filter-button"
			onclick={() => {
				selected = [];
				selectedFilters.value = [];
			}}>Clear</button
		>
		<div>
			<button
				class="ring-1 ring-neutral-200 rounded-xl px-2 py-2 transition-all duration-200 active:scale-90 active:bg-neutral-200 filter-button"
				onclick={oncancel}>Cancel</button
			>
			<button
				class="rounded-xl px-4 py-2 text-zinc-100 bg-zinc-950 transition-all duration-200 active:scale-90 active:bg-zinc-800 filter-button"
				onclick={applyFilters}>Apply</button
			>
		</div>
	</div>
</div>
