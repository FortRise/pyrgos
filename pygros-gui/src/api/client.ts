import { invoke } from "@tauri-apps/api";
import type { AppState } from "../state/appState";
import { tfDirs } from "../stores/appStore";

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