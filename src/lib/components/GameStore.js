import { writable, derived } from 'svelte/store';
import { Game } from '../waa/Game.js';
import { State } from '$lib/waa/State.js';

let gameInstance;

const internalState = writable(gameInstance?.state);

async function loadGame(url) {
	const response = await fetch(url);
	const c = await response.json();
	return c;
}

export const gameEngine = writable(null);
// Initialize the game when the store is first subscribed to
gameEngine.subscribe((game) => {
	if (!game) {
		// Create an instance of the Game object
		gameInstance = new Game();
		// // Start the game flow
		// gameInstance.startGame

		// Update the store with the game instance
		gameEngine.set(gameInstance);
	}
});

export const startGame = async (url) => {
	const gameConfig = await loadGame(url);
	selectedGame.set(gameConfig);
	await gameInstance.startGame(gameConfig, null);
	internalState.set(gameInstance.state);
};

export async function nextRound() {
	if (gameInstance.state.currentRound > 0) {
		await gameInstance.endRound({
			text: 'testing'
		});
	}

	await gameInstance.beginRound();
	internalState.set(gameInstance.state);
}
export const currentState = derived([internalState], ($internalState) => {
	console.log('updating state', $internalState[0]);
	return $internalState[0] ?? new State();
});

export const selectedPlayer = writable(null);
export const selectedGame = writable(null);
export const availableGames = writable([
	{ title: 'Game 1', url: '/games/ExampleGame.json' },
	{ title: 'Game 2', url: '/games/ExampleGame.json' }
]);
