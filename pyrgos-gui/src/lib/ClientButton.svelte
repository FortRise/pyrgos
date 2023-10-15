<script lang="ts">
  import GiArrowCluster from 'svelte-icons/gi/GiArrowCluster.svelte';
  import FaSteam from 'svelte-icons/fa/FaSteam.svelte';
  import FaTrashAlt from 'svelte-icons/fa/FaTrashAlt.svelte';
  import FaHammer from 'svelte-icons/fa/FaHammer.svelte';
  import FaFolder from 'svelte-icons/fa/FaFolder.svelte';
  import IoMdPlay from 'svelte-icons/io/IoMdPlay.svelte';
  import FaScrewdriver from 'svelte-icons/fa/FaScrewdriver.svelte';
  import { tfDirs } from '../stores/appStore';
  import { invoke } from '@tauri-apps/api';
  import SubButton from './SubButton.svelte';
  import { save } from '../state/appState';
  import { dirname } from '@tauri-apps/api/path';
  import PlayCogs from './PlayCogs.svelte';

  export let client: TFDir;
  export let onPatchClick: (client: TFDir) => Promise<void>;
  export let onUnpatchClick: (client: TFDir) => Promise<void>;
  export let onLaunch: (vanilla: boolean) => void;

  async function deleteDirectory() {
    await invoke("plugin:client|remove_tf_path", { path: client.path });
    const tfResultDirs: TFDir[] = await invoke("plugin:client|get_tf_path");
    tfDirs.update(x => x = tfResultDirs);
    await save();
  }

  async function openDirectory() {
    try 
    {
      await invoke("plugin:fix_fs|open", { path: client.path});
    }
    catch (e)
    {
      console.log(e);
    }
  }

  async function playVanilla() {
    const basePath = await dirname(client.path);
    await invoke("plugin:process|execute", { path: client.path, workingDir: basePath, args: ["--vanilla"] });
    onLaunch(true);
  }

  async function play() {
    const basePath = await dirname(client.path);
    await invoke("plugin:process|execute", { path: client.path, workingDir: basePath, args: [] });
    onLaunch(!(client.tf_type == 3 || client.tf_type == 2));
  }

</script>

<div class="client-panel">
  <div class="client">
    <div class="client-icon">
      {#if client.tf_type == 1 || client.tf_type == 3}
        <FaSteam/>
      {:else}
        <GiArrowCluster/>
      {/if}
    </div>
    <p class="client-text">{client.name}</p>
    {#if client.tf_type == 3}
      <p class="client-fortrise-text">(+ FortRise)</p>
    {/if}
  </div>



  <div class="client-buttons">

    {#if client.tf_type == 3 || client.tf_type == 2}
    <SubButton onClick={play}>
      <PlayCogs/>
    </SubButton>
    <SubButton onClick={playVanilla}>
      <IoMdPlay/>
    </SubButton>
    <SubButton onClick={async () => await onPatchClick(client)}>
      <FaHammer/>
    </SubButton>
    <SubButton onClick={async () => await onUnpatchClick(client)}>
      <FaScrewdriver/>
    </SubButton>
    {:else}
    <SubButton onClick={play}>
      <IoMdPlay/>
    </SubButton>
    <SubButton onClick={async () => await onPatchClick(client)}>
      <FaHammer/>
    </SubButton>
    {/if}
    <SubButton onClick={openDirectory}>
      <FaFolder/>
    </SubButton>
    <SubButton onClick={deleteDirectory}>
      <FaTrashAlt/>
    </SubButton>
  </div>
</div>

<style>
.client {
  height: 50px;
  justify-content: center;
  align-items: center;
  display: flex;
}

.client-buttons {
  margin-right: 10px;
}

.client-panel {
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

.client-icon {
  margin-top: 2px;
  width: 40px;
}

.client-text {
  margin-left: 8px;
}

.client-fortrise-text {
  margin-left: 8px;
  color: rgb(119, 119, 119);
  font-weight: bold;
}
</style>