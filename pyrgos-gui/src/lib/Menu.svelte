<script lang="ts">
  import { path, dialog, fs, tauri, cli, invoke } from "@tauri-apps/api";
  import { availableInstaller, route, tfDirs } from '../stores/appStore';
  import ClientButton from "./ClientButton.svelte";
  import { save } from "../state/appState";
  import { event } from "@tauri-apps/api"
  import { INSTALLER } from "../state/route";
  import { appDataDir, resolve } from "@tauri-apps/api/path";
  import { changeState, update as updateClient } from "../api/client";
  import { writable } from "svelte/store";
  import type { Writable } from "svelte/store";

  let patchingType = 0;
  let currentClient: TFDir = null;
  let onPatchingState = 0;
  let commandLineTexts: Writable<string[]> = writable([]);
  let consoleWindow: Element;

  async function openDirectory() {
    const selected: string | string[] | null = await dialog.open({
      directory: true,
      multiple: false
    }) as string;

    if (selected == null) {
      return;
    }
    const tfPath = await path.join(selected, "TowerFall.exe");

    if (await fs.exists(tfPath)) {
      const fortRisePath = await path.join(selected, "TowerFall.FortRise.mm.dll");
      const isPatched = await fs.exists(fortRisePath);
      let type = 0;
      if (isPatched) {
        type |= 2;
      }
      let name = "TowerFall";
      const darkWorld = await path.join(selected, "DarkWorldContent");
      const steam = await path.join(selected, "Steamworks.NET.dll");
      if (fs.exists(darkWorld)) {
        name += " Dark World";
      }
      else
        name += " Ascension";
      if (fs.exists(steam)) {
        type |= 1;
      }
      const dir: TFDir = {
        name,
        path: tfPath,
        tf_type: type
      };
      await tauri.invoke("plugin:client|add_tf_path", { name, path: dir.path, tfType: dir.tf_type });
      try 
      {
        const tfResultDirs: TFDir[] = await tauri.invoke("plugin:client|get_tf_path");
        tfDirs.update(x => x = tfResultDirs)
        await save();
      }
      catch (fall) 
      {
        console.log(fall);
      }
    }
  }

  async function onPatch(client: TFDir) {
    patchingType = 1;
    currentClient = client;
  }

  async function onUnpatch(client: TFDir) {
    patchingType = 2;
    currentClient = client;
  }

  async function patching(version: string) {
    const dirName: string = await appDataDir();
    const installerFolder = await resolve(dirName, "installer", version, "executable");
    const installerPath = await resolve(installerFolder, "Installer.NoAnsi.exe");
    const patchType = patchingType == 1 ? "--patch" : "--unpatch";
    const basePath = await path.dirname(currentClient.path);
    const unlisten = await event.listen<{message: string}>('console-stdout', (x) => {
      $commandLineTexts.push(x.payload.message + "\n");
      commandLineTexts.update(x => x = $commandLineTexts);
      consoleWindow.lastElementChild.scrollIntoView();
    });
    onPatchingState = 1;
    const code: number = await invoke("execute_interactive", { 
      path: installerPath,
      args: [patchType, basePath],
      workingDir: installerFolder
    });

    unlisten();

    onPatchingState = 2;
    
    if (code == 1) {
      return;
    }

    if (patchingType == 2) {
      let clientState = currentClient.tf_type;
      clientState &= ~2;
      changeState(currentClient.path, clientState);
      updateClient();
      save();
      return;
    }
    let clientState = currentClient.tf_type;
    clientState |= 2;
    changeState(currentClient.path, clientState);
    updateClient();
    save();
  }
  function onPatchExit() {
    $commandLineTexts = [];
    onPatchingState = 0;
    patchingType = 0;
  }
</script>

{#if patchingType != 0}
<div class="patch-fade-modal">
  <div class="patch-modal">
    {#if patchingType == 2}
    <p class="patch-title-text">SELECT UNINSTALLERS</p>
    {:else}
    <p class="patch-title-text">SELECT INSTALLERS</p>
    {/if}
    <div class="patch-inside">
      {#each $availableInstaller as installer}
      <button class="installer-panels" on:click={() => patching(installer)}>
        <p>{installer}</p>
      </button>
      {/each}
      <button class="installer-panels download" on:click={() => {
        patchingType = 0;
        currentClient = null;
        $route = INSTALLER;
       }}>
        <p>+ Download Patchers</p>
      </button>
    </div>
    <button class="patch-button" on:click={() => {
      patchingType = 0;
      currentClient = null;
    }}>Close</button>
  </div>
</div>
{/if}

{#if onPatchingState >= 1}
<div class="patch-fade-modal">
  <div class="patch-modal big">
    <p class="patch-title-text">Console Output</p>
    <div class="patch-inside console" bind:this={consoleWindow}>
      {#each $commandLineTexts as text}
        <p>{text}</p>
      {/each}
    </div>
    {#if onPatchingState == 2}
    <button class="patch-button" on:click={onPatchExit}>Close</button>
    {/if}
  </div>
</div>
{/if}

<div class="menu">
  <p class="menu-title">PYRGOS</p>
  <div>
    <p class="menu-fortrisetext">FortRise Launcher</p>
    <button class="menu-selectbutton" on:click={openDirectory}>+ Add Directory</button>
    {#if $tfDirs.length != 0}
    <div class="menu-clients">
    {#each $tfDirs as dir}
    <ClientButton client={dir} onPatchClick={onPatch} onUnpatchClick={onUnpatch}/>
    {/each}
    </div>
    {/if}
  </div>
</div>

<style>
.installer-panels {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 10px;
  margin-bottom: 8px;
  border-radius: 0px 0px 8px 8px;
  height: 50px;
  background-color: rgb(27, 27, 27);
  box-shadow: 0 2px 0px rgba(255, 255, 255, 255);
  font-weight: bold;
  font-size: 24px;
  cursor: pointer;
  transition: 500ms;
  user-select: none;
  width: 100%;
  color: white;
}

.installer-panels p {
  margin-left: 12px;
}

.download {
  font-size: 16px;
  height: 30px;
}

.installer-panels:hover {
  background-color: rgb(75, 75, 75);
}

.installer-panels:active {
  background-color: rgb(127, 216, 197);
}

.patch-fade-modal {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.39);
  justify-content: center;
  align-items: center;
  display: flex;
}

.patch-modal {
  background-color: rgb(36, 36, 36);
  border-radius: 12px;
  outline-color: white;
  outline-style: solid;
  width: 450px;
  height: 450px;
  text-align: center;
  user-select: none;
}

.patch-modal.big {
  width: 600px;
  height: 500px;
}

.patch-title-text {
  font-size: 24px;
  font-weight: 600;
}

.patch-inside {
  margin-left: 20px;
  margin-right: 20px;
  background-color: rgb(14, 14, 14);
  height: 320px;
  overflow-y: auto;
  border-radius: 4px;
  outline-color: white;
  outline-width: 0.15rem;
  outline-style: solid;
}

.patch-inside.console {
  user-select: text;
  text-align: start;
  font-size: 16px;
  padding-left: 5px;
}


.patch-inside.console p {
  height: auto;
}

.patch-button {
  margin-top: 10px;
  border-radius: 4px;
  font-weight: bold;
  background-color: #7694c0;
  color: white;
  cursor: pointer;
  transition: 500ms;
}

.patch-button:hover {
  background-color: rgb(128, 201, 206)
}

.patch-button:active {
  background-color: rgb(38, 91, 99);
}

.menu {
  padding-top: 40px;
  padding-left: 120px;
  padding-right: 40px;
  text-align: center;
  justify-content: center;
  display: flexbox;
  vertical-align: middle;
  user-select: none;
}

.menu-title {
  font-size: 40px;
  margin-bottom: -10px;
}

.menu-fortrisetext {
  color: rgb(163, 163, 163);
  font-weight: 400;
  font-size: 18px;
  margin-bottom: 40px;
}

.menu-clients {
  margin-top: 20px;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: rgb(22, 22, 22);
  border-radius: 6px;
  width: 100%;
  height: 300px;
  outline-color: #ffffff;
  outline-style: solid;
  overflow-y: auto;
}

.menu-selectbutton {
  background-color: #7694c0;
  color: white;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
  transition: 500ms;
  cursor: pointer;
}

.menu-selectbutton:hover {
  background-color: rgb(128, 201, 206)}

.menu-selectbutton:active {
  background-color: rgb(38, 91, 99);
}
</style>