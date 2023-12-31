<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import GameOverBanner from "./banners/GameOverBanner.svelte";
  import PauseBanner from "./banners/PauseBanner.svelte";
  import StartBanner from "./banners/StartBanner.svelte";
  import Keys from "./components/Keys.svelte";
  import Next from "./components/Next.svelte";
  import Scene from "./components/Scene.svelte";
  import type { Array10, TGameField } from "./components/types";
  import { Figures } from "./figures/figures";
  import { TickManager } from "./tick-manager";
  import { removeFilledLines, fallDown } from "./game-utils";

  let started = false;
  let paused = false;
  let gameOver = false;
  let sound = true;

  let level = 1;
  let score = 0;
  let nextFigure = "";
  let linesRemovedOnLevel = 0;

  const durations = [400, 300, 220, 160, 120, 80, 60];
  let tickDuration = getTickDuration(level);

  const tickManager = new TickManager(tickDuration);
  let tick = 0;

  let isDropDown = false;

  // create an empty game field
  const GameField: TGameField = new Array<Array10>(24) as TGameField;
  fillField(0);

  function isBanner() {
    return !started || paused || gameOver;
  }

  onMount(() => {
    document.addEventListener("keydown", processKeysDown);
    document.addEventListener("keyup", processKeysUp);
    waitGame();
  });

  onDestroy(() => {
    tickManager.dispose();
    document.removeEventListener("keydown", processKeysDown);
    document.removeEventListener("keyup", processKeysUp);
  });

  function togglePause() {
    if (!started || gameOver) {
      return;
    }
    paused = !paused;
  }

  function toggleSound() {
    if (!started || gameOver) {
      return;
    }
    sound = !sound;
  }

  function startGame() {
    if (started || gameOver) {
      return;
    }
    started = true;
    paused = false;
    gameOver = false;
    level = 1;
    isDropDown = false;
    score = 0;
    fillField(0);

    startNewTurn();
    linesRemovedOnLevel = 0;

    setTickDuration();

    tickManager.addTask(processTick, 1); // first - process + redraw
    tickManager.addTask(() => {
      const removed = removeFilledLines(GameField);

      if (removed > 0) {
        score += removed * removed * level;
        linesRemovedOnLevel += removed;
      }

      if (linesRemovedOnLevel >= 10) {
        levelUp();
      }
    }, 2); // second - remove lines and add score

    tickManager.run();
  }

  function processTick() {
    if (paused) {
      return;
    }
    const result = fallDown(GameField);

    if (result.finished) {
      if (result.stopRow <= 19) {
        startNewTurn();
      } else {
        gameOverGame();
      }
    }
    tick++;
  }

  function levelUp() {
    level++;
    linesRemovedOnLevel = 0;
    setTickDuration();
  }

  function waitGame() {
    started = false;
    paused = false;
    gameOver = false;
  }

  function gameOverGame() {
    started = true;
    paused = false;
    gameOver = true;
    tickManager.dispose();
  }

  function processKeysDown(ev) {
    let e = ev.key;

    if (!started) {
      // "any key" on not started -> to start game
      startGame();
      return;
    }

    if (gameOver) {
      // "any key" on game over -> to not started
      waitGame();
      return;
    }

    if (e === "Escape") {
      if (started) {
        gameOverGame();
      }
      return;
    }

    if (ev.keyCode === 80) {
      // P
      togglePause();
      return;
    }

    if (ev.keyCode === 83) {
      // S
      toggleSound();
      return;
    }

    if (e === "Space" || e === " ") {
      // drop
      if (!started || paused) {
        return;
      }
      isDropDown = true;
      setTickDuration(5);
      score += 1;
      return;
    }

    if (e === "ArrowDown") {
      // move down
      setTickDuration(20);
      processTick();
      tickManager.immediateRestart();
    }

    if (e === "ArrowLeft") {
      // move left
    }

    if (e === "ArrowRight") {
      // move right
    }

    if (e === "ArrowUp") {
      // rotate
    }

    if (e === "Pause") {
      togglePause();
    }
    if (e === "Sound") {
      toggleSound();
    }
  }

  function processKeysUp(ev) {
    if (ev.key === "ArrowDown") {
      setTickDuration();
      processTick();
    }
  }

  const standardFigs = "SZILTOJ".split("").filter((s) => s !== " ");
  const complexFigs = "SSS ZZZ II LLL TTT OO JJJ"
    .split("")
    .filter((s) => s !== " ");

  function getRandomFigure(complex = false) {
    return complex
      ? complexFigs[Math.floor(Math.random() * complexFigs.length)]
      : standardFigs[Math.floor(Math.random() * standardFigs.length)];
  }

  function startNewTurn() {
    if (!nextFigure) {
      // generate first figure
      nextFigure = getRandomFigure(level > 6);
    }

    addFigureToField(GameField, nextFigure);
    nextFigure = getRandomFigure(level > 6);

    if (isDropDown) {
      // end drop down
      isDropDown = false;
      setTickDuration();
    }
  }

  function addFigureToField(GameField: TGameField, type: string) {
    const symbol = Figures[type];
    if (!symbol) {
      throw new Error(`Unknown figure "${type}"!`);
    }

    const maxHeight = symbol.length;
    let maxWidth = symbol.reduce((prev, current) => {
      return Math.max(prev, current.length);
    }, 0);

    const x = Math.floor(5 - maxWidth / 2);
    const y = 19 + maxHeight;

    for (let line = 0; line < maxHeight; line++) {
      let matrix = symbol[line].split("");
      for (let cell = 0; cell < matrix.length; cell++) {
        if (matrix[cell] !== " ") {
          GameField[y - line][x + cell] = 1;
        }
      }
    }
  }

  function getTickDuration(gameLevel) {
    return durations[gameLevel - 1] || 50;
  }

  function setTickDuration(duration?) {
    tickDuration = duration && duration > 0 ? duration : getTickDuration(level);
    tickManager.updateTickDuration(tickDuration);
  }

  function fillField(num) {
    for (let row = 0; row < GameField.length; row++) {
      if (!GameField[row]) {
        GameField[row] = new Array<number>(10) as Array10;
      }
      for (let col = 0; col < GameField[row].length; col++) {
        // num can be a static value, or if it is negative, random value 0..4
        GameField[row][col] =
          num >= 0
            ? num
            : Math.random() > 0.7
            ? Math.floor(Math.random() * 4)
            : 0;
      }
    }
  }
</script>

<main>
  <div id="main-container">
    <div id="scene-container">
      <Scene {GameField} {tick} />
    </div>

    <div id="info-container">
      <Next figure={nextFigure} />
      <div id="score-container">
        <h1>{score}</h1>
        <h2>level {level}</h2>
      </div>
    </div>
  </div>
  <div id="help-container">
    <Keys />
  </div>
</main>

{#if isBanner()}
  <div id="banner">
    {#if !started}
      <StartBanner />
    {/if}
    {#if paused}
      <PauseBanner currentLevel={level} currentScore={score} />
    {/if}
    {#if gameOver}
      <GameOverBanner finalLevel={level} finalScore={score} />
    {/if}
  </div>
{/if}

<style>
  #main-container {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    align-content: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    bottom: 100px;
  }
  #scene-container {
    width: auto;
    aspect-ratio: 10 / 24;
    height: 100%;
    align-self: center;
    position: relative;
    margin-left: 60px;
  }
  #info-container {
    height: 100%;
    width: 120px;
    text-align: center;
  }
  #info-container h1,
  #info-container h2 {
    font-weight: normal;
    margin: 0;
    padding: 0;
  }
  #help-container {
    display: flex;
    justify-content: center;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
  }
  #banner {
    position: fixed;
    z-index: 1;

    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }
</style>
