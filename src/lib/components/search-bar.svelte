<script lang="ts">
	import { X } from 'lucide-svelte';

	export let placeholder: string;
	export let value: string;

	const clearSearchBar = () => {
		const searchElement: HTMLElement | null = document.getElementById('search');
		if (searchElement) {
			console.log("Search element exists")
			searchElement.focus();
			value = "";
		}
	}
</script>

<div
	class="flex w-full rounded-xl bg-stone-300 bg-search bg-left-center bg-no-repeat py-2 pl-12 text-spotiblack outline-none items-center justify-between"
>
	<input id="search" type="text" class="bg-inherit outline-none w-full" {placeholder} bind:value />
	<button on:click={clearSearchBar} class=" pr-2">
		<div class=" border-2 rounded-full border-spotiblack hover:border-red-600 hover:text-red-600">
			<X />
		</div>
	</button>
</div>
