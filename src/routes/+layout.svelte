<script>
	import '../app.css';
</script>

<slot />

<style lang="postcss">
	:global(body) {
		background-color: theme(colors.spotiblack);
		height: 100vh;
	}
</style>

<!-- .clicked {
	background-color: theme(colors.alabaster);
	border-color: theme(colors.teal.600);
	color: theme(colors.teal.600);
} -->
