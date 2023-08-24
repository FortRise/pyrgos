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
  transition: 500ms;
  box-shadow: none;
  background-color: transparent;
}

.sub-button:hover {
  color: rgb(128, 201, 206);
}

.sub-button:active {
  color: rgb(212, 252, 255);;
}
</style>