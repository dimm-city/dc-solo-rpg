// Reexport your entry components here
export { default as Game } from './components/Game.svelte';
export { default as GameSelector } from './components/GameSelector.svelte';
export { default as Splash } from './components/Splash.svelte';
export { gameState, getCurrentScreen, getGameStats } from './stores/gameStore.svelte.js';
export * from './stores/gameActions.svelte.js';
export { hasSavedGame, getSaveMetadata } from './stores/gameSave.js';
export { getCustomGames, getCustomGame, addCustomGame, removeCustomGame } from './stores/customGames.js';
export { parseGameFile, ValidationError } from './parsers/markdownParser.js';
