<script lang="ts">
  import { http } from "@tauri-apps/api";
  import { parseVersion } from "../state/version";
  import { fetchDownloaded, type Tag } from "../state/tagResponse";
  import { availableInstaller, isClosed, tags } from "../stores/appStore";
  import InstallerButton from "./InstallerButton.svelte";
  import { onMount } from "svelte";
  import MdReplay from 'svelte-icons/md/MdReplay.svelte'
  import SubButton from "./SubButton.svelte";
  
  onMount(async () => {
    if (!$isClosed) {
      await fetch();
      $isClosed = true;
    }
  });

  async function fetch() {
      availableInstaller.update(x => x = []);
      tags.update(x => x = []);
      await fetchDownloaded();
      await fetchVersions();
  }

  async function fetchVersions() {
    const client = await http.getClient();
    const response = await client.get<Tag[]>("https://api.github.com/repos/Terria-K/FortRise/git/refs/tags", {
      responseType: http.ResponseType.JSON,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246"
      }
    });
    const responseRev = response.data
      .map(x => {
        const version = x.ref.replace("refs/tags/", "");
        const parsedVersion = parseVersion(version);
        if ($tags.includes(version)) {
          return;
        }
        if (parsedVersion) 
        {
          if (parsedVersion.major >= 4) 
          {
            return version;
          }
        }
      })
      .filter(x => x != undefined)
      .reverse();
    
    tags.update(x => {
      responseRev.forEach(y => x.push(y));
      return x;
    });
  }
</script>

<div class="installer">
  <p class="installer-text">PATCHERS</p>
  <div class="installer-reset">
    <SubButton onClick={fetch}>
      <MdReplay/>
    </SubButton>
  </div>
  <div class="installer-downloaded">
    {#each $tags as tag}
      <InstallerButton name={tag}/>
    {/each}
  </div>
</div>


<style>
.installer {
  padding-top: 40px;
  padding-left: 120px;
  padding-right: 40px;
  text-align: center;
  justify-content: center;
  display: flexbox;
  vertical-align: middle;
  user-select: none;
}

.installer-reset {
  position: absolute;
  top: 80px;
  right: 50px;
}

.installer-text {
  font-size: 40px;
  font-weight: bold;
}

.installer-downloaded {
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  height: 400px;
  overflow-y: auto;
  background-color: rgb(22, 22, 22);
  border-radius: 6px;
  outline-color: #ffffff;
  outline-style: solid;
}
</style>