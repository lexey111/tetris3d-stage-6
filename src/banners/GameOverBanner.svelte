<script>
  import Cube from "./Cube.svelte";

  export let finalScore = 0;
  export let finalLevel = 0;
</script>

<div id="gameover-banner">
  <h1>GAME OVER</h1>
  <h2>Final score: {finalScore} on level {finalLevel}</h2>
  <Cube/>
  <p>press any key to continue</p>
</div>

<style>
  #gameover-banner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    background: linear-gradient(to bottom right, #FFC900, #FF8500);
    color: #63212F
  }
  h1,
  h2 {
    margin: 0;
    font-weight: normal;
  }
</style>
