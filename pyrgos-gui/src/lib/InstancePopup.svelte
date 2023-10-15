<script lang="ts">
  import MdInfoOutline from "svelte-icons/md/MdInfoOutline.svelte";

  export let launchingText: string;
  export let launching: boolean;
</script>

<div class={`instance-popup ${launching ? 'show' : ''}`}>
  <p>{launchingText}</p>
  <div class="instance-icon">
    <MdInfoOutline/>
  </div>
</div>

<style>
.instance-popup {
  visibility: hidden;
  transform: scale(0, 0);
  position: absolute;
  background-color: rgb(27, 27, 27);
  border-radius: 8px 8px 8px 8px;
  border-left: 4px solid rgb(101, 255, 242);
  right: 20px;
  bottom: 20px;
  width: 400px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.instance-popup.show {
  animation-name: show;
  animation-duration: 6s;
}

@keyframes show {
  0% {
    visibility: hidden;
    transform: scale(0, 0);
  }
  5% {
    visibility: visible;
    transform: scale(1, 1);
  }
  95% {
    visibility: visible;
    transform: scale(1, 1);
  }
  100% {
    visibility: hidden;
    transform: scale(0, 0);
  }
}

.instance-icon {
  width: 50px;
  height: 50px;
  margin-right: 10px;
  color: rgb(101, 255, 242);
}

.instance-popup p {
  font-size: 20px;
  font-weight: bolder;
  margin-left: 8px;
  margin-top: 16px;
}
</style>