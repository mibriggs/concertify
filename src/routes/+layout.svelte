<script lang="ts">
	import '../app.css';
	import { enhance } from '$app/forms';
	import type { LayoutData } from './$types';
	import { Toaster } from 'svelte-french-toast';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { getGeoLocation } from '$lib';
	import { Menu, X } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	export let data: LayoutData;

	afterNavigate(() => {
		getGeoLocation();
	});

	let showHamburgerMenu = false;
	let menuRef: HTMLElement;
	let currentUrl: string;

	const handleClickOutside = (e: MouseEvent) => {
		if (menuRef && !menuRef.contains(e.target as Node)) {
			showHamburgerMenu = false;
		}
	};

	onMount(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	});

	beforeNavigate(() => {
		currentUrl = $page.url.pathname;
	});

	afterNavigate(() => {
		const newUrl = $page.url.pathname;
		if (newUrl !== currentUrl) {
			showHamburgerMenu = false;
		}
	});
</script>

<Toaster />
<nav
	class="sticky top-0 z-10 hidden items-center justify-start gap-2 bg-spotiblack p-6 font-mono text-white md:flex"
>
	<div class="flex">
		<a href="/" class="rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-spotigreen">
			Home
		</a>
		<a
			href="/leaders"
			data-sveltekit-preload-data
			class="cutoff-text rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-spotigreen"
		>
			Top Artists
		</a>
		<a
			href="/followed"
			data-sveltekit-preload-data
			class="cutoff-text rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-spotigreen"
		>
			Followed Artists
		</a>
		<!-- <a
			href="/liked"
			data-sveltekit-preload-data
			class="cutoff-text rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-spotigreen"
		>
			Liked Artists
		</a> -->
	</div>
	<form
		method="post"
		action={!data.spotifyToken ? '/?/authWithSpotify' : '/?/logoutUser'}
		use:enhance
		class="ml-auto self-end rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-spotigreen"
		class:signed-in={data.spotifyToken}
	>
		<button class="cutoff-text text-white">{!data.spotifyToken ? 'Login' : 'Logout'}</button>
	</form>
</nav>

<nav class="sticky top-0 z-[1000] border-gray-200 bg-spotiblack md:hidden">
	<div class="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
		<a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
			<span class="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
				Concertify
			</span>
		</a>
		<button
			data-collapse-toggle="navbar-hamburger"
			type="button"
			class="inline-flex size-fit items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
			aria-controls="navbar-hamburger"
			aria-expanded="false"
			on:click={() => (showHamburgerMenu = !showHamburgerMenu)}
		>
			<span class="sr-only">Open main menu</span>
			{#if !showHamburgerMenu}
				<Menu size="32" />
			{:else}
				<X size="32" />
			{/if}
		</button>
		{#if showHamburgerMenu}
			<div class="fixed left-0 top-14 w-full" id="navbar-hamburger" in:slide out:slide>
				<ul
					class="mt-4 flex flex-col rounded-lg bg-gray-200 font-medium dark:border-gray-700 dark:bg-gray-800"
					bind:this={menuRef}
				>
					<li>
						<a href="/" class="block rounded bg-spotigreen px-3 py-2 text-white" aria-current="page"
							>Home</a
						>
					</li>
					<li>
						<a
							href="/leaders"
							class="block rounded px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
						>
							Top Artists
						</a>
					</li>
					<li>
						<a
							href="/followed"
							class="block rounded px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:text-white"
						>
							Followed Artists
						</a>
					</li>
					<li>
						<!-- <a
							href="/liked"
							class="block rounded px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
						>
							Liked Artists
						</a> -->
					</li>
					<li>
						<form
							method="post"
							action={!data.spotifyToken ? '/?/authWithSpotify' : '/?/logoutUser'}
							use:enhance
							class:signed-in={data.spotifyToken}
						>
							<button
								class="block w-full rounded px-3 py-2 text-start text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
								>{!data.spotifyToken ? 'Login' : 'Logout'}</button
							>
						</form>
					</li>
				</ul>
			</div>
		{/if}
	</div>
</nav>

<slot />

<style lang="postcss">
	:global(body) {
		background-color: theme(colors.spotiblack);
	}

	.cutoff-text {
		--max-lines: 1;

		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: var(--max-lines);
		width: fit-content;
	}

	.signed-in {
		@apply hover:bg-red-600;
	}
</style>
