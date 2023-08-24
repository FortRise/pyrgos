<script lang="ts">
  import FaHome from 'svelte-icons/fa/FaHome.svelte';
  import FaHammer from 'svelte-icons/fa/FaHammer.svelte';
  import FaCogs from 'svelte-icons/fa/FaCogs.svelte';
  import Button from './Button.svelte';
  import IoMdExit from 'svelte-icons/io/IoMdExit.svelte';

  import { exit } from '@tauri-apps/api/process';
  import { route } from '../stores/appStore';
  import { INSTALLER, MAIN } from '../state/route';
</script>

<div class="nav">
  <li class="nav-li">
    <Button onClick={() => route.update(x => x = MAIN)}>
      <FaHome/>
    </Button>
    <Button onClick={() => route.update(x => x = INSTALLER)}>
      <FaHammer/>
    </Button>
    <Button>
      <FaCogs/>
    </Button>

    <div class="nav-exit">
      <Button onClick={async () => await exit(0)}><IoMdExit/></Button>
    </div>
  </li>
</div>

<style>
.nav {
  position: absolute;
  width: 80px;
  height: 100%;
  background-color: rgb(65, 65, 65);
  outline-style: solid;
  outline-color: rgb(128, 201, 206);
  display: flex;
  justify-content: center;
}

.nav-li {
  list-style-type: none;
  margin-top: 20px;
  margin-left: 5px;
  margin-right: 5px;
}

.nav-exit {
  padding-top: 300px;
}
</style>