<script lang="ts">
	export let placeholder: string;
	export let value: string;
	export let extraStyling: string;

	const fullStyle = `${extraStyling} search rounded-xl bg-stone-300 pl-12 py-2 text-spotiblack outline-none`;
</script>

<input id="search" type="text" class={fullStyle} {placeholder} bind:value />

<style>
	.search {
		background-image: url('$lib/assets/search.svg');
		background-repeat: no-repeat;
		background-position: left 2% bottom 50%;
	}
</style>
