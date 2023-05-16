import { writable, get, derived } from 'svelte/store';
import { Game } from '../waa/Game.js';
import { State } from '$lib/waa/State.js';

let gameInstance = new Game();

const internalState = writable(gameInstance?.state);

async function loadGame(url) {
	const response = await fetch(url);
	const configJson = await response.json();

	configJson.rollDice = () => {
		isWaitingForDice.set(true);
		return new Promise((resolve) => {
			diceRollResolver.set(resolve);
		});
	};
	return configJson;
}

export const isWaitingForDice = writable(false);
export const diceRollResolver = writable(null);


export function displayFinalOutput() {
	for (let index = 1; index <= gameInstance.state.currentRound; index++) {
		console.log('============ROUND==============');
		console.log('Round', index);
		let tasks = gameInstance.state.completedTasks.filter((t) => t.roundCompleted === index);
		tasks.forEach((t) => {
			console.log(t.title);
		});

		console.log('===========JOURNAL=============');
		let entries = gameInstance.state.journalEntries.filter((e) => e.round == index);
		entries.forEach((e) => {
			console.log(e.text);
		});
	}

	console.log('===============================');
	console.log('Status:', gameInstance.state.status);
	console.log(
		`${gameInstance.state.successCounter * 10}% success | ${
			100 - gameInstance.state.primaryFailureCounter
		}% failure`
	);
}

export const startGame = async (url, player) => {
	const gameConfig = await loadGame(url);
	await gameInstance.startGame(gameConfig, null);
	gameInstance.state.player = player;
	internalState.set(gameInstance.state);
	selectedGame.set(gameConfig);

	selectedPlayer.set(player);
};

export async function nextRound() {
	await gameInstance.beginRound();
	internalState.set(gameInstance.state);
}

export async function recordRound(journalEntry) {
	await gameInstance.endRound(journalEntry);
	await gameInstance.beginRound();
	internalState.set(gameInstance.state);
}

export async function endGame(journalEntry) {
	await gameInstance.endGame(journalEntry);
	internalState.set(gameInstance.state);
}

export const currentState = derived([internalState], ($internalState) => {
	console.log('updating state', $internalState[0]);
	return $internalState[0] ?? new State();
});

const selectedPlayer = writable(null);
export const selectedGame = writable(null);

export const failurePercent = derived(
	[currentState],
	($currentState) => `${100 - $currentState[0].primaryFailureCounter}%`
);

export const successPercent = derived(
	[currentState],
	($currentState) => `${$currentState[0].successCounter * 10}%`
);
