<script lang="ts">
  export let onClick = () => {};
</script>

<button class="nav-button" on:click={onClick}>
  <slot/>
</button>

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

.nav-button:hover {
  background-color: #b8b8b857;
}
.nav-button:active {
  border-color: #396cd8;
  background-color: #e8e8e8;
}
</style>