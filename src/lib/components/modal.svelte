<script lang="ts">
	import { X } from 'lucide-svelte';
	import type { Artist } from '../types';

	export let artist: Artist;
	export let id: string;

	const closeModal = () => {
		const modal: HTMLDialogElement | null = document.querySelector(`#${id}`);
		modal?.close();
	};
</script>

<dialog
	{id}
	class="h-1/4 w-5/6 max-w-[550px] rounded-3xl border border-gray-400 bg-spotiblack text-white shadow-lg backdrop:bg-spotiblack backdrop:bg-opacity-70 backdrop:backdrop-blur-md md:w-2/3 lg:w-1/2"
>
	<div class="flex items-center justify-center py-6">
		<span class="font-mono text-lg font-semibold">{artist.name}</span>
		<button on:click={closeModal} class="absolute right-5">
			<X />
		</button>
	</div>
	<div class="border-b border-gray-400" />
</dialog>
