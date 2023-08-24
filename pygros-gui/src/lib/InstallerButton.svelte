<script lang="ts">
  import SubButton from "./SubButton.svelte";
  import FaTrashAlt from 'svelte-icons/fa/FaTrashAlt.svelte';
  import FaFolder from 'svelte-icons/fa/FaFolder.svelte'
  import IoMdDownload from 'svelte-icons/io/IoMdDownload.svelte'
  import { appDataDir, resolve} from '@tauri-apps/api/path';
  import { onMount } from "svelte";
  import { fs, invoke, os } from "@tauri-apps/api";
  import { download } from 'tauri-plugin-upload-api';
  import { writable } from "svelte/store";
  import { availableInstaller } from "../stores/appStore";

  export let name: string;

  let found = false;
  let loading = false;

  const bytes = writable(0);
  const downloaderText = writable("");
  let totalBytes: string = "";

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
    downloaderText.update(x => x = "Downloading...");
    const dirName: string = await appDataDir();
    const installerPath = await resolve(dirName, "installer", name);
    const zipPath = await resolve(dirName, "installer", name + '.zip');

    const platform = await os.platform()
    let postFix = 'NoANSI'
    if (platform == 'linux' || platform == 'darwin')
      postFix = "OSXLinux"

    const folderName = `FortRise.Installer.v${name}-${postFix}`;
    const zipName = `${folderName}.zip`;
    const url = `https://github.com/Terria-K/FortRise/releases/download/${name}/${zipName}`;

    try 
    {
      await download(url, zipPath, (x, total) => {
        const value = (x / 1024) / 1024;
        if (totalBytes != total.toFixed(2)) 
        {
          totalBytes = (total / 1024/ 1024).toFixed(2);
        }
        bytes.update(x => x += value);
        downloaderText.update(x => x = $bytes.toFixed(2) + "/" + totalBytes + "MB");
      });

      downloaderText.update(x => x = "Extracting...");
      await invoke('plugin:fix_fs|extract', { path: zipPath, outPath: installerPath });
      const path = await resolve(dirName, "installer", name, folderName);
      const newPath = await resolve(dirName, "installer", name, "executable");
      await fs.renameFile(path, newPath);

      downloaderText.update(x => x = "Cleaning up...");
      await fs.removeFile(zipPath);
      loading = false;
      found = true;
    }
    catch (e)
    {
      if (fs.exists(zipPath))
        await fs.removeFile(zipPath);
      downloaderText.update(x => x = "Error while downloading the installer");
      console.log(e);
    }

    totalBytes = "";
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