<script lang="ts">
	import Button from '$components/button.svelte';
</script>

<main class="flex flex-col font-mono text-white">
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between pl-8">
			<span class="sm:text-md text-sm font-bold md:text-xl">Artists you Like</span>
			<input
				type="text"
				class="search hidden w-1/3 rounded-xl bg-stone-300 p-2 text-spotiblack outline-none md:block"
				placeholder="Search artists..."
			/>
			<div class="flex gap-4 pr-6">
				<Button>Previous</Button>
				<Button>Next</Button>
			</div>
		</div>
		<input
			type="text"
			class="search w-11/12 self-center rounded-xl bg-stone-300 p-2 text-spotiblack outline-none md:hidden"
			placeholder="Search artists..."
		/>
	</div>
</main>

<style>
	.search {
		background-image: url('$lib/assets/search.svg');
		background-repeat: no-repeat;
		background-position: left 95% bottom 50%;
	}
</style>
