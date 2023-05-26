<script>
import { gameStore, gameConfig, exitGame } from "./WAAStore.js";
</script>

<style>
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
  }
  .toolbar h3{
    margin: 0;
  }

  .left {
    text-align: left;
  }

  .center {
    display: flex;
    justify-content: center;
    align-items: center;
  }


  .right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .right button {
    margin-left: 1rem;
    height: min-content;
  }
</style>
<div class="toolbar">
  <div class="left">
    <h3>{gameConfig?.title ?? 'Please select a game'}</h3>
  </div>
  <div class="center">
   
  </div>
  <div class="right">
    <button class="dc-exit-button" on:click={exitGame}>exit</button>
  </div>
</div>
