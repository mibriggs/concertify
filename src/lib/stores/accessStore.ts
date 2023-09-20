import type { AccessTokenStoreType } from "$lib/types";
import { writable } from "svelte/store";

export const accessTokenStore = writable<AccessTokenStoreType>();