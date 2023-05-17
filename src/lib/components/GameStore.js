import { writable, derived } from 'svelte/store';
import { Game } from '../waa/Game.js';
import { State } from '$lib/waa/State.js';

let gameInstance = new Game();

const internalState = writable(gameInstance?.state);
function updateGameState() {
	internalState.set(gameInstance.state);
}
async function rollDiceAwaiter() {
		isWaitingForDice.set(true);
		return new Promise((resolve) => {
			diceRollResolver.set(async (data) => {
				updateGameState();
				await resolve(data);
				isWaitingForDice.set(false);
			});
		});
	
}

async function loadGameConfig(url) {
	const response = await fetch(url);
	const configJson = await response.json();

	configJson.rollDice = rollDiceAwaiter;
	return configJson;
}

export const isWaitingForDice = writable(false);
export const diceRollResolver = writable(null);

export const loadGame = async (url, player) => {
	const gameConfig = await loadGameConfig(url);
	await gameInstance.loadGame(gameConfig, null);
	gameInstance.state.player = player;
	updateGameState();
};

export async function startGame() {
	await gameInstance.startGame();
	updateGameState();
	await gameInstance.beginRound();
	updateGameState();
}

export async function recordRound(journalEntry) {
	await gameInstance.endRound(journalEntry);
	await gameInstance.beginRound();
	updateGameState();
}

export async function endGame(journalEntry) {
	await gameInstance.endGame(journalEntry);
	updateGameState();
}

export async function exitGame() {
	await gameInstance.endGame({text: "i quit"});
	// gameInstance.state.mode = 'start';
	console.log('exit', gameInstance);
	updateGameState();
}

export const currentState = derived([internalState], ($internalState) => {
	console.log('updating state', $internalState[0]);
	return $internalState[0] ?? new State();
});

export const failurePercent = derived(
	[currentState],
	($currentState) => `${100 - $currentState[0].primaryFailureCounter}%`
);

export const successPercent = derived(
	[currentState],
	($currentState) => `${$currentState[0].successCounter * 10}%`
);
