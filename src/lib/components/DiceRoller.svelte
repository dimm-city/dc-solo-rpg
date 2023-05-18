<script>
	import { currentState, isWaitingForDice, diceRollResolver } from './GameStore.js';

	import { afterUpdate, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';

	const diceList = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']; // Dice characters
	export let autoConfirm = false;
	export let rollDuration = 500; // Duration of rolling animation in milliseconds
	export let characterList = [...diceList, ...generateRandomCharacters()];

	let rolling = false;
	let characters = [];
	let character = '';
	let finalNumber = null;
	let rollTimer = null;

	function generateRandomCharacters() {
		const characterList = [];
		const numCharacters = 50;

		for (let i = 0; i < numCharacters; i++) {
			const randomCodePoint = Math.floor(Math.random() * (0xffff - 0x20) + 0x20);
			const randomCharacter = String.fromCodePoint(randomCodePoint);
			characterList.push(randomCharacter);
		}

		return characterList;
	}

	export async function rollDice() {
		rolling = true;
		characters = [];

		const rollInterval = rollDuration / 15; // Interval between character changes in milliseconds

		rollTimer = setInterval(() => {
			// characters = Array.from(
			// 	{ length: 3 },
			// 	() => characterList[Math.floor(Math.random() * characterList.length)]
			// );
			character = characterList[Math.floor(Math.random() * characterList.length)];
		}, rollInterval);

		finalNumber = await generateNumber();

		clearInterval(rollTimer);
		rolling = false;
	}

	export function confirmRoll() {
		$diceRollResolver(finalNumber);
	}

	afterUpdate(() => {
		if (autoConfirm && finalNumber !== null) {
			setTimeout(() => {
				confirmRoll();
				finalNumber = null;
				characters = [];
			}, 3000);
		}
	});

	onDestroy(() => {
		clearInterval(rollTimer);
	});

	async function generateNumber() {
		// const response = await fetch('https://api.random.org/json-rpc/2/invoke', {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/json'
		// 	},
		// 	body: JSON.stringify({
		// 		jsonrpc: '2.0',
		// 		method: 'generateIntegers',
		// 		params: {
		// 			apiKey: 'YOUR_RANDOM_ORG_API_KEY',
		// 			n: 1,
		// 			min: 1,
		// 			max: 6,
		// 			replacement: true
		// 		},
		// 		id: 1
		// 	})
		// });

		// const data = await response.json();
		// return data.result.random.data[0];
		return fetch(
			'https://www.random.org/integers/?num=1&min=1&max=6&col=1&base=10&format=plain&rnd=new'
		)
			.then((response) => response.text())
			.then((data) => {
				const randomNumber = parseInt(data, 10);
				console.log(randomNumber);
				return randomNumber;
			})
			.catch((error) => {
				console.error('Error fetching random number:', error);
			});

		// return new Promise((resolve) => {
		// 	setTimeout(() => resolve(getRandomNumber()), rollDuration);
		// });
	}

	function getRandomNumber() {
		return Math.floor(Math.random() * (6 - 2) + 1);
	}
</script>

<div class="dice-roller-container">
	<div>
		{$currentState.status}
	</div>
	<div>
		<div class="dice-roller" on:click={rollDice} on:keydown={rollDice}>
			{#if rolling}
				<!-- {#each characters as character, i} key={i}-->
				<span in:fade>
					{character}
				</span>
				<!-- {/each} -->
			{:else if finalNumber > 0}
				{diceList[finalNumber - 1]}
			{/if}
		</div>
	</div>
	<div>
		{#if !rolling && finalNumber > 0}
			<button on:click={confirmRoll}>confirm</button>
		{:else}
			<button on:click={rollDice} disabled={rolling}>roll</button>
		{/if}
	</div>
</div>

<style>
	.dice-roller-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		align-items: center;
		justify-content: center;
	}
	/* Component styles go here */
	.dice-roller {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 200px;
		height: 200px;
		font-size: 4rem;
		/* cursor: pointer;
		border: 1px solid #000; */
		border-radius: 8px;
		transition: opacity 0.3s ease;
	}

	.dice-roller:hover {
		opacity: 0.8;
	}
</style>
