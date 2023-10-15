<script lang="ts">
  import SubButton from "./SubButton.svelte";
  import FaTrashAlt from 'svelte-icons/fa/FaTrashAlt.svelte';
  import FaFolder from 'svelte-icons/fa/FaFolder.svelte'
  import IoMdDownload from 'svelte-icons/io/IoMdDownload.svelte'
  import { appDataDir, resolve} from '@tauri-apps/api/path';
  import { onMount } from "svelte";
  import { fs, invoke, os } from "@tauri-apps/api";
  import { writable } from "svelte/store";
  import { availableInstaller, downloads } from "../stores/appStore";
  import { downloadInstaller as downloadInstallerAPI, load } from "../api/client";

  export let name: string;

  let found = false;
  let loading = false;

  const downloaderText = writable("");

  onMount(async () => {
    const dirName: string = await appDataDir();

    const installerPath = await resolve(dirName, "installer", name);
    const exists = await fs.exists(installerPath);
    if (exists) {
      found = true;
    }
  })

  async function downloadInstaller() {
    loading = true;
    await downloadInstallerAPI(name, (text, bytes) => {
      $downloaderText = text;
    });
    loading = false;
    found = true;
  }

  async function openInstallerDirectory() {
    const dirName: string = await appDataDir();
    const installerPath = await resolve(dirName, "installer", name);
    try 
    {
      await invoke("plugin:fix_fs|open", { path: installerPath });
    }
    catch (e)
    {
      console.log(e);
    }
  }

  async function removeInstaller() {
    const dirName: string = await appDataDir();
    const installerPath = await resolve(dirName, "installer", name);
    await fs.removeDir(installerPath, { recursive: true });
    $availableInstaller = $availableInstaller.filter(x => x != name);
    found = false;
  }
</script>


<div class="installer-panel">
  <div class="installer">
    <p class="installer-text">{name}</p>
  </div>


  <div class="installer-buttons">
    {#if loading}
      <p>{$downloaderText}</p>
    {:else if !found}
    <SubButton onClick={downloadInstaller}>
      <IoMdDownload/>
    </SubButton>
    {:else}
    <SubButton onClick={openInstallerDirectory}>
      <FaFolder/>
    </SubButton>
    <SubButton onClick={removeInstaller}>
      <FaTrashAlt/>
    </SubButton>
    {/if}
  </div>
</div>

<style>
.installer {
  height: 50px;
  justify-content: center;
  align-items: center;
  display: flex;
}

.installer-buttons {
  margin-right: 10px;
}

.installer-panel {
  justify-content: space-between;
  display: flex;
  align-items: center;
  padding-left: 10px;
  margin-bottom: 8px;
  border-radius: 0px 0px 8px 8px;
  height: 50px;
  background-color: rgba(43, 43, 43, 0.2);
  box-shadow: 0 2px 0px rgba(255, 255, 255, 255);
}

.installer-text {
  margin-left: 8px;
  font-size: 18px;
  font-weight: bold;
}
</style>