<script>
  import Cube from "./Cube.svelte";

</script>

<div id="start-banner">
  <h1>TETRIS</h1>
  <h2>Welcome to Tetris WebGL Game</h2>
  <Cube/>
  <p>press any key to start</p>
</div>

<style>
  #start-banner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    background: linear-gradient(to bottom right, #00bcff, #007cff);
  }
  h1,
  h2 {
    margin: 0;
    font-weight: normal;
  }
</style>
