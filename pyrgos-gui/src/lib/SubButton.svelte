<script lang="ts">
  export let onClick;
</script>


<button class="sub-button" on:click={onClick}>
  <slot/>
</button>



<style>
.sub-button {
  color: white;
  background-color: transparent;
  margin-top: 6px;
  margin-left: 8px;
  padding: 0;
  cursor: pointer;
  width: 40px;
  height: 40px;
}
</style>