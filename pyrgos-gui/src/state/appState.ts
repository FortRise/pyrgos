import { BaseDirectory, appDataDir, resolve } from "@tauri-apps/api/path";
import { save as saveClient, load as loadClient } from "../api/client";
import { fs } from "@tauri-apps/api";

export type AppState = {
  tf_dirs: TFDir[],
  currentRoute: number
}

export async function save() {
  const path = await appDataDir();
  const resolved = await resolve(path, "saves", "saveData.json");
  await saveClient(resolved);
}

export async function load() {
  const path = await appDataDir();
  const resolved = await resolve(path, "saves", "saveData.json");
  const exists = await fs.exists("saves", { dir: BaseDirectory.AppData });
  if (!exists)
    await fs.createDir("saves", { dir: BaseDirectory.AppData });
  const appState: AppState = await loadClient(resolved);
  return appState;
}