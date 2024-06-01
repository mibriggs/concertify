<script lang="ts">
	import Button from '$components/button.svelte';
	import SearchBar from '$components/search-bar.svelte';

	let searchValue: string = '';
</script>

<main class="flex flex-col font-mono text-white">
	<div class="sticky top-[5rem] z-10 flex flex-col gap-2 bg-spotiblack pb-3">
		<!-- For larger screens -->
		<div class="hidden items-center justify-between pl-8 md:flex">
			<span class="sm:text-md text-sm font-bold md:text-xl">Artists you Follow</span>
			<div class="w-5/12">
				<SearchBar placeholder="Search artists..." bind:value={searchValue} />
			</div>
			<div class="flex gap-4 pr-6">
				<Button disabled={true}>Previous</Button>
				<Button disabled={false}>Next</Button>
			</div>
		</div>

		<!-- For smaller screens -->
		<div class="flex flex-col items-center justify-center gap-2 px-6 md:hidden">
			<div class="flex w-full items-center justify-between gap-2">
				<span class="sm:text-md text-sm font-bold md:text-xl">Artists you Follow</span>
				<div class="flex gap-4">
					<Button disabled={true}>Previous</Button>
					<Button disabled={false}>Next</Button>
				</div>
			</div>
			<div class="w-full">
				<SearchBar placeholder="Search artists..." bind:value={searchValue} />
			</div>
		</div>
	</div>
</main>
