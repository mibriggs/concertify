import type { AuthTokenWithDate } from '$lib/types';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			spotifyAccessTokens: AuthTokenWithDate;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
