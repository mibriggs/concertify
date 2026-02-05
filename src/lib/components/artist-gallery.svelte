<script lang="ts">
	import SearchBar from '$components/search-bar.svelte';
	import { ChevronDown, SlidersHorizontalIcon } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { twJoin } from 'tailwind-merge';
	import FilterOptions from './filter-options.svelte';
	import Badge from './badge.svelte';

	interface Props {
		label: string;
		children?: Snippet;
		onsearch?: (searchValue: string) => void;
		onsearchcancelled?: () => void;
	}

	const filters = {
		concerts: ['upcoming concerts']
	};

	let {
		label,
		children = undefined,
		onsearch = undefined,
		onsearchcancelled = undefined
	}: Props = $props();

	let badgeCount: number = $state(0);
	let isFilterDropdownOpen: boolean = $state(false);
	let searchValue: string = $state('');
	let selectedFilters: string[] = $state([]);
</script>

<main class="flex flex-col font-mono text-zinc-100 pb-20">
	<div class="sticky top-20 z-10 flex flex-col gap-2 bg-spotiblack py-3">
		<!-- For larger screens -->
		<div class="hidden items-center justify-between gap-4 pl-8 pr-8 md:flex">
			<span class="sm:text-md text-sm font-bold md:text-xl">{label}</span>
			<div class="flex w-6/12 items-center gap-2">
				<SearchBar
					id="search"
					placeholder="Enter to search artists..."
					bind:value={searchValue}
					onInputChange={() => console.log('input changed')}
					onSearchCanceled={() => onsearchcancelled?.()}
					onenter={() => onsearch?.(searchValue)}
				/>
				<button
					class={twJoin(
						'flex items-center gap-2 rounded-lg bg-stone-700 px-4 py-2 text-zinc-100 transition-all hover:bg-stone-600 active:scale-95 border relative',
						isFilterDropdownOpen ? 'border-stone-400 shadow-lg shadow-black/20' : 'border-stone-500'
					)}
					onclick={() => (isFilterDropdownOpen = !isFilterDropdownOpen)}
				>
					<SlidersHorizontalIcon />
					<span>Filter</span>
					<Badge
						count={badgeCount}
						class="bg-slate-50 p-1 text-black text-xs font-semibold rounded-full size-6 flex items-center justify-center"
					/>
					<ChevronDown
						class={twJoin(
							'transition-transform duration-200',
							isFilterDropdownOpen && 'rotate-180'
						)}
					/>
				</button>
				{#if isFilterDropdownOpen}
					<FilterOptions
						bind:selectedFilters
						options={filters}
						class="bg-neutral-50"
						oncancel={() => (isFilterDropdownOpen = false)}
						onapply={() => (badgeCount = selectedFilters.length)}
					/>
				{/if}
			</div>
		</div>

		<!-- For smaller screens -->
		<div class="flex flex-col items-center justify-center gap-2 px-6 md:hidden">
			<div class="flex w-full items-center justify-between gap-2">
				<span class="sm:text-md text-sm font-bold md:text-xl">{label}</span>
				<button
					class={twJoin(
						'flex items-center gap-2 rounded-lg bg-stone-700 px-4 py-2 text-zinc-100 transition-all duration-200 hover:bg-stone-600 active:scale-90 active:bg-stone-800 border relative filter-button-mobile',
						isFilterDropdownOpen ? 'border-stone-400 shadow-lg shadow-black/20' : 'border-stone-500'
					)}
					onclick={() => (isFilterDropdownOpen = !isFilterDropdownOpen)}
				>
					<SlidersHorizontalIcon />
					<Badge
						count={badgeCount}
						class="bg-slate-50 p-1 text-black text-xs font-semibold rounded-full size-6 flex items-center justify-center"
					/>
				</button>
				{#if isFilterDropdownOpen}
					<FilterOptions
						bind:selectedFilters
						options={filters}
						class="top-[55%] right-[6%]"
						oncancel={() => (isFilterDropdownOpen = false)}
						onapply={() => (badgeCount = selectedFilters.length)}
					/>
				{/if}
			</div>
			<div class="w-full">
				<SearchBar
					id="search-mobile"
					placeholder="Enter to search artists..."
					bind:value={searchValue}
					onInputChange={() => console.log('input changed')}
					onSearchCanceled={() => onsearchcancelled?.()}
					onenter={() => onsearch?.(searchValue)}
				/>
			</div>
		</div>
	</div>

	{#if children}
		{@render children()}
	{/if}
</main>

<style lang="postcss">
	@keyframes tap-feedback {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(0.9);
		}
		100% {
			transform: scale(1);
		}
	}

	.filter-button-mobile:active {
		animation: tap-feedback 0.2s ease-in-out;
	}
</style>
