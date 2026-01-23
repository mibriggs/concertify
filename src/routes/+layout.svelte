<script lang="ts">
	import '../app.css';
	import { enhance } from '$app/forms';
	import type { LayoutData } from './$types';
	import { Toaster } from 'svelte-french-toast';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { Menu, X } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getIsLoading } from '$lib/stores/store.svelte';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	let showHamburgerMenu = $state(false);
	let menuRef: HTMLElement | undefined = $state();
	let currentUrl: string;

	const detectServiceWorkerUpdate = async () => {
		const registration = await navigator.serviceWorker.ready;
		registration.addEventListener('updatefound', () => {
			const newServiceWorker = registration.installing;
			newServiceWorker?.addEventListener('statechange', () => {
				if (newServiceWorker.state === 'installing') {
					if (confirm('A new version is available! Please reload to update')) {
						newServiceWorker.postMessage({ type: 'SKIP_WAITING' });
						window.location.reload();
					}
				}
			});
		});
	};

	const handleClickOutside = (e: MouseEvent) => {
		if (menuRef && !menuRef.contains(e.target as Node)) {
			showHamburgerMenu = false;
		}
	};

	onMount(() => {
		detectServiceWorkerUpdate();
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

{#if getIsLoading()}
	<div class="overlay" aria-busy="true" aria-live="polite">
		<div class="panel">
			<div class="spinner" aria-hidden="true"></div>
			<div class="label">Fetching upcoming concerts...</div>
		</div>
	</div>
{/if}
<Toaster />
<nav
	class="sticky top-0 z-10 hidden items-center justify-start gap-2 bg-spotiblack p-6 font-mono text-white md:flex"
>
	<div class="flex">
		<a
			href="/leaders"
			data-sveltekit-preload-data
			class="cutoff-text rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-spotigreen"
		>
			Trending Artists
		</a>
		<a
			href="/followed"
			data-sveltekit-preload-data
			class="cutoff-text rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-spotigreen"
		>
			Followed Artists
		</a>
		<a
			href="/liked"
			data-sveltekit-preload-data
			class="cutoff-text rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-spotigreen"
		>
			Liked Artists
		</a>
	</div>
	{#if data.spotifyToken}
		<form
			method="post"
			action="/?/logoutUser"
			use:enhance
			class="signed-in ml-auto self-end rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-spotigreen"
		>
			<button class="cutoff-text text-white">Logout</button>
		</form>
	{:else}
		<a
			href="/login"
			class="ml-auto self-end rounded-md px-2 py-1 transition-all hover:scale-105 hover:bg-spotigreen"
		>
			Login
		</a>
	{/if}
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
			onclick={() => (showHamburgerMenu = !showHamburgerMenu)}
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
						<a
							href="/leaders"
							class="block rounded bg-spotigreen px-3 py-2 text-white"
							aria-current="page"
						>
							Trending Artists
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
						<a
							href="/liked"
							class="block rounded px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
						>
							Liked Artists
						</a>
					</li>
					<li>
						{#if data.spotifyToken}
							<form method="post" action="/?/logoutUser" use:enhance class="signed-in">
								<button
									class="block w-full rounded px-3 py-2 text-start text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
									>Logout</button
								>
							</form>
						{:else}
							<a
								href="/login"
								class="block rounded px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
							>
								Login
							</a>
						{/if}
					</li>
				</ul>
			</div>
		{/if}
	</div>
</nav>

{@render children?.()}

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

	.overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;

		/* Blocks the entire UI */
		pointer-events: auto;

		/* Visual treatment */
		background: rgba(255, 255, 255, 0.45);
		backdrop-filter: blur(3px);

		display: grid;
		place-items: center;
	}

	.panel {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;

		border: 1px solid #e5e7eb;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.85);
		box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
		color: #0f172a;
		font-weight: 600;
		font-size: 14px;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border-radius: 999px;

		border: 3px solid #e5e7eb;
		border-top-color: #0f172a;

		animation: spin 0.9s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
