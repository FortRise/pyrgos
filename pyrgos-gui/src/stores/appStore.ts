import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import { load, type AppState } from "../state/appState";
import { MAIN } from "../state/route";

export type DialogOpen = {
    dialogOpen: boolean,
    title: string,
    yesRecommended: boolean,
    onConfirm?: () => Promise<void>;
}

export let appState: Writable<AppState> = writable({ tf_dirs: [], currentRoute: MAIN });
export let route: Writable<number> = writable(MAIN);
export let tags: Writable<string[]> = writable([]);
export let tfDirs: Writable<TFDir[]> = writable([]);
export let availableInstaller: Writable<string[]> = writable([]);
export let isClosed = writable(false);
export let downloads: Writable<number> = writable(0);
export let dialogOpen: Writable<DialogOpen> = writable({
    dialogOpen: false,
    title: "",
    yesRecommended: true,
    onConfirm: null
});
export let fadeOpen = writable(false);