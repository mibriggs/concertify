<script lang="ts">
	import { twJoin } from 'tailwind-merge';

	interface Props {
		count: number;
		applyClicked?: boolean;
		class?: string;
	}

	const { count, class: clazz = '', applyClicked = true }: Props = $props();
</script>

{#if count > 0 && applyClicked}
	<div class={twJoin('', clazz)}>{count}</div>
{/if}
