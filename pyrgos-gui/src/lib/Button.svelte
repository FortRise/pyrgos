<script lang="ts">
  import { downloads } from "../stores/appStore";

  export let onClick = () => {};
</script>

{#if $downloads == 0}
<button class="nav-button" on:click={onClick}>
  <slot/>
</button>
{:else}
<button class="nav-button" disabled>
  <slot/>
</button>
{/if}

<style>
.nav-button {
  width: 70px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
  text-align: center;
  box-shadow: none;
  color: #ffffff;
  background-color: transparent;
  cursor: pointer;
  transition: 500ms;
}

.nav-button:disabled {
  color: #6b6b6b;
}

.nav-button:hover {
  background-color: #b8b8b857;
}
.nav-button:active {
  border-color: #396cd8;
  background-color: #e8e8e8;
}
</style>