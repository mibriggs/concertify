<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatNumber } from '$lib';
	import { UserCheck } from 'lucide-svelte';

	export let imageUrl: string;
	export let name: string;
	export let popularity: number;
	export let genres: string[];
	export let followers: number;
</script>

<form method="post" action="?/getConcertInfo" use:enhance>
	<input type="hidden" name="artist" value={name} />

	<button
		class="m-6 flex w-80 flex-col items-center justify-center gap-1 rounded-xl bg-stone-500 p-4 text-start"
		on:click
	>
		<img
			src={imageUrl}
			alt="Artist"
			class="mb-4 h-auto w-auto rounded-lg shadow-lg"
			loading="lazy"
		/>
		<span class="text-xl font-bold">{name}</span>
		<span class="flex self-start text-sm italic">Popularity: {popularity}</span>
		<span class="flex self-start text-wrap text-sm italic">Genres: {genres.join(', ')}</span>
		<div class="flex items-stretch justify-center gap-2 self-end">
			<span>{formatNumber(followers)}</span>
			<UserCheck size="20" stroke="1" />
		</div>
	</button>
</form>
