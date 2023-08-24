import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import { load, type AppState } from "../state/appState";
import { MAIN } from "../state/route";

export let appState: Writable<AppState> = writable({ tf_dirs: [], currentRoute: MAIN });
export let route: Writable<number> = writable(MAIN);
export let tags: Writable<string[]> = writable([]);
export let tfDirs: Writable<TFDir[]> = writable([]);
export let availableInstaller: Writable<string[]> = writable([]);
export let isClosed = writable(false);