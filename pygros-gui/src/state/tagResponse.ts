import { fs, path } from "@tauri-apps/api";
import { BaseDirectory, resolve } from "@tauri-apps/api/path";
import { availableInstaller, tags } from "../stores/appStore";

export type Tag = {
    ref: string,
    node_id: string,
    url: string,
    object: {
        sha: string,
        type: string,
        url: string
    }
}

export async function fetchDownloaded() {
  const dirs: fs.FileEntry[] = await fs.readDir("installer", { dir: BaseDirectory.App });
  dirs.forEach(async x => {
    if (x.children) {
      const installer = await resolve(x.path, "executable", "Installer.NoAnsi.exe");
      if (fs.exists(installer)) {
        const verName = await path.basename(x.name);
        tags.update(x => {
          x.push(verName);
          availableInstaller.update(y => { 
              y.push(verName);
              y.reverse();
              return y;
          });
          x.reverse();
          return x;
        });
      }
    }
  })
}