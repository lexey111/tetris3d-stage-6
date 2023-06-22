<script>
  import Cube from "./Cube.svelte";

  export let currentScore = 0;
  export let currentLevel = 0;
</script>

<div id="pause-banner">
  <h1>PAUSE</h1>
  <h3>Current score: {currentScore} on level {currentLevel}</h3>
  <Cube />
  <p>press "P" to continiue or "ESC" to quit</p>
</div>

<style>
  #pause-banner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    background: linear-gradient(to bottom right, #00dd52, #00b80d);
  }
  h1,
  h3 {
    margin: 0;
    font-weight: normal;
  }
</style>
