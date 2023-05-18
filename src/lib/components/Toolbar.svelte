<script>

import { currentState, exitGame } from './GameStore.js';
</script>

<style>
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f1f1f1;
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
    <span>{$currentState?.player?.name} </span>
  </div>
  <div class="center">
    <h3>{$currentState?.config?.title ?? 'Please select a game'}</h3>
    <!-- <span>Round: {$currentState.currentRound}</span> -->
  </div>
  <div class="right">
    <!-- <button>Button 1</button>
    <button>Button 2</button> -->
    <button on:click={exitGame}>exit</button>
  </div>
</div>
