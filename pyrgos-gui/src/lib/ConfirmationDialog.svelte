<script lang="ts">
  import { hideDialog } from "../api/client";

  type ButtonColor = "blue" | "gray";
  export let title: string;
  export let yesColor: ButtonColor = "blue";
  export let noColor: ButtonColor = "gray";
  export let onConfirm: () => Promise<void>;
</script>


<div class="dialog-holder">
  <div class="dialog">
    <p class="dialog-title">{title}</p>
    <button class={yesColor} on:click={async () => await onConfirm()}>Yes</button>
    <button class={noColor} on:click={() => {
      hideDialog();
    }}>No</button>
  </div>
</div>

<style>
.dialog-holder {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.dialog {
  text-align: center;
  background-color: rgb(27, 27, 27);
  border-radius: 8px 8px 8px 8px;
  border-left: 4px solid rgb(101, 255, 242);
  width: 50%;
  height: auto;
  padding-bottom: 16px;
}

.dialog-title {
  font-size: 24px;
}

.blue {
  cursor: pointer;
  background-color: rgb(101, 255, 242);
}

.gray {
  cursor: pointer;
  color: white;
  background-color: rgb(68, 68, 68);
}
</style>