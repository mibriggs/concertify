<script lang="ts">
	export let disabled: boolean = false;
</script>

<button
	class="rounded-lg bg-slate-200 px-2 py-1 text-spotiblack disabled:bg-spotigreen disabled:text-white"
	{disabled}
	on:click
>
	<slot />
</button>
