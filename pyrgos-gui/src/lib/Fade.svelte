<div class="fade">
  <slot/>
</div>

<style>
.fade {
  user-select: none;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.39);
}
</style>