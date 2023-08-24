<script lang="ts">
  import Navbar from "./lib/Navbar.svelte";
  import Menu from "./lib/Menu.svelte";
  import { appState, route, tfDirs } from "./stores/appStore";
  import { INSTALLER, MAIN } from "./state/route";
  import Installer from "./lib/Installer.svelte";
  import { onMount } from "svelte";
  import { load } from "./state/appState";
    import { fetchDownloaded } from "./state/tagResponse";

  onMount(async () => {
    const loadedState = await load();
    $appState.tf_dirs = loadedState.tf_dirs;
    $tfDirs = loadedState.tf_dirs;

    await fetchDownloaded();
  });
</script>

<main>
  <Navbar/>

  {#if $route == MAIN}
    <Menu/>
  {:else if $route == INSTALLER}
    <Installer/>
  {/if}
</main>


<style>
 
</style>