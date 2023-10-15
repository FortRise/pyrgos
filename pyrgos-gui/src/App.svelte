<script lang="ts">
  import Navbar from "./lib/Navbar.svelte";
  import Menu from "./lib/Menu.svelte";
  import { appState, dialogOpen, fadeOpen, route, tfDirs } from "./stores/appStore";
  import { INSTALLER, MAIN, MODS } from "./state/route";
  import Installer from "./lib/Installer.svelte";
  import { onMount } from "svelte";
  import { load } from "./state/appState";
  import { fetchDownloaded } from "./state/tagResponse";
  import ConfirmationDialog from "./lib/ConfirmationDialog.svelte";
    import Fade from "./lib/Fade.svelte";

  onMount(async () => {
    const loadedState = await load();
    $appState.tf_dirs = loadedState.tf_dirs;
    $tfDirs = loadedState.tf_dirs;

    await fetchDownloaded();
  });
</script>

<main>
  <Navbar/>

  {#if $fadeOpen}
    <Fade>
      {#if $dialogOpen.dialogOpen}
      <ConfirmationDialog 
        onConfirm={$dialogOpen.onConfirm} 
        title={$dialogOpen.title} 
        yesColor={`${$dialogOpen.yesRecommended ? "blue" : "gray"}`}/>
      {/if}
    </Fade>
  {/if}

  {#if $route == MAIN}
    <Menu/>
  {:else if $route == INSTALLER}
    <Installer/>
  {:else if $route == MODS}
    <div></div>
  {/if}
</main>


<style>
 
</style>