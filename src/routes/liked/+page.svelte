<script lang="ts">
	import Button from '$components/button.svelte';
	import SearchBar from '$components/search-bar.svelte';

	let searchValue: string = '';
</script>

<main class="flex flex-col font-mono text-white">
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between pl-8">
			<span class="sm:text-md text-sm font-bold md:text-xl">Artists you Like</span>
			<SearchBar
				placeholder="Search liked artists..."
				extraStyling="hidden w-1/3 md:block"
				bind:value={searchValue}
			/>
			<div class="flex gap-4 pr-6">
				<Button>Previous</Button>
				<Button>Next</Button>
			</div>
		</div>
		<SearchBar
			placeholder="Search liked artists..."
			extraStyling="w-11/12 self-center md:hidden"
			bind:value={searchValue}
		/>
	</div>
</main>
