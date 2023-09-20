<script lang="ts">
	import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;
</script>

<div class="flex flex-col w-full items-center justify-center">
    <a href="/login">Get Started</a>
    {#if data.access_token}
    <form method="post" action="?/viewFollowedArtists">
        <button>View artists you follow</button>
    </form>
    {/if}

    {#if form?.artists}
        {#each form.artists as artist}
            <div>{artist}</div>
        {/each}
    {/if}
</div>