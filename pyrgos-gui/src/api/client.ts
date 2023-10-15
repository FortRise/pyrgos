import { fs, http, invoke, os } from "@tauri-apps/api";
import type { AppState } from "../state/appState";
import { availableInstaller, dialogOpen, downloads, fadeOpen, tfDirs } from "../stores/appStore";
import type { Tag } from "../state/tagResponse";
import { appDataDir, resolve } from "@tauri-apps/api/path";
import { download } from "tauri-plugin-upload-api";

export async function changeState(path: string, state: number) {
    await invoke("plugin:client|change_state", { path, state});
}

export async function save(path: string) {
    await invoke("plugin:client|save", { path });
}

export async function load(path: string): Promise<AppState> {
    return await invoke("plugin:client|load", { path }) as AppState;
}

export async function add_tf_path(name: string, path: string, tfType: number) {
    await invoke("plugin:client|add_tf_path", { name, path, tfType })
}

export async function remove_tf_path(path: string) {
    await invoke("plugin:client|remove_tf_path", { path })
}

export async function get_tf_path(): Promise<TFDir[]> {
    return await invoke("plugin:client|get_tf_path") as TFDir[];
}

export async function update() {
    const tfPaths = await get_tf_path();
    tfDirs.update(x => x = tfPaths);
}

export function showDialog(title: string, yesRecommended: boolean, onConfirm: () => Promise<void>) {
    dialogOpen.set({
        dialogOpen: true,
        yesRecommended,
        title,
        onConfirm
    });
    fadeOpen.set(true);
}

export function hideDialog() {
    dialogOpen.set({
        dialogOpen: false,
        yesRecommended: false,
        title: null,
        onConfirm: null
    });
    fadeOpen.set(false);
}

export async function fetchLastVersion() {
    const client = await http.getClient();
    const response = await client.get<Tag[]>("https://api.github.com/repos/Terria-K/FortRise/git/refs/tags", {
      responseType: http.ResponseType.JSON,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246"
      }
    });

    const latestVersion = response.data
        .filter(x => x != undefined)
        .filter(x => !x.ref.includes("pre"))
        .reverse()[0];
    return latestVersion;
}

export async function downloadInstaller(name: string, update: (text: string, bytes: number) => void) {
    downloads.update(x => x += 1);
    update("Downloading...", 0);
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
    let bytes = 0;
    let totalBytes = "";

    try 
    {
      await download(url, zipPath, (x, total) => {
        const value = (x / 1024) / 1024;
        if (totalBytes != total.toFixed(2)) 
        {
          totalBytes = (total / 1024/ 1024).toFixed(2);
        }
        bytes += value;
        update(bytes.toFixed(2) + "/" + totalBytes + "MB", bytes);
      });

      update("Extracting...", bytes);
      await invoke('plugin:fix_fs|extract', { path: zipPath, outPath: installerPath });
      const path = await resolve(dirName, "installer", name, folderName);
      const newPath = await resolve(dirName, "installer", name, "executable");
      await fs.renameFile(path, newPath);
      availableInstaller.update(x => {
        x.push(name);
        return x;
      });

      update("Cleaning up...", bytes);
      await fs.removeFile(zipPath);
    }
    catch (e)
    {
      if (fs.exists(zipPath))
        await fs.removeFile(zipPath);
      update("Error while downloading the installer", bytes);
      console.log(e);
    }
    finally 
    {
      downloads.update(x => x -= 1);
      totalBytes = "";
    }
  }