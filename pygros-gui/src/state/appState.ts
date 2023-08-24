import { appDataDir, resolve } from "@tauri-apps/api/path";
import { save as saveClient, load as loadClient } from "../api/client";

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
  const appState: AppState = await loadClient(resolved);
  return appState;
}