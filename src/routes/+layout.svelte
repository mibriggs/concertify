<script>
	import { enhance } from '$app/forms';
	import '../app.css';
</script>

<nav class="flex text-white items-center justify-start gap-2 p-8">
	<a href="/">Home</a>
	<a href="/followed">Followed Artists</a>
	<form method="post" action="/?/authWithSpotify" use:enhance>
		<button class="text-white">Get Started</button>
	</form>
</nav>
<slot />

<style lang="postcss">
	:global(body) {
		background-color: theme(colors.spotiblack);
	}
</style>
