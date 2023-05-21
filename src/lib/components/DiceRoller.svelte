<script>
	import { afterUpdate, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';

	const diceList = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']; // Dice characters
	export let autoConfirm = false;
	export let rollDuration = 500; // Duration of rolling animation in milliseconds
	export let characterList = [...diceList]; //add random characters, ...generateRandomCharacters()];

	export let rolling = false;
	export let finalNumber = null;

	let characters = [];
	let character = '';
	let rollTimer = null;

	export async function roll(number = -1) {
		rolling = true;
		characters = [];

		const rollInterval = rollDuration / 15; // Interval between character changes in milliseconds

		rollTimer = setInterval(() => {
			character = characterList[Math.floor(Math.random() * characterList.length)];
		}, rollInterval);

		var timerPromise = new Promise((timerResolver) => {
			setTimeout(() => {
				rolling = false;
				timerResolver();
			}, rollDuration);
		});

		var numberPromise = new Promise(async (resolve) => {
			finalNumber = number > 0 ? number : await generateRandomNumber();
			resolve();
		});

		await Promise.all([timerPromise, numberPromise])
		clearInterval(rollTimer);

		return finalNumber;
	}

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

	// function onClick() {
	// 	if (finalNumber > 0) confirmRoll();
	// 	else if (finalNumber == null && !rolling) rollDice();
	// }
	// export async function rollDice() {
	// 	if (rolling || finalNumber > 0) return;
	// 	rolling = true;
	// 	characters = [];

	// 	const rollInterval = rollDuration / 15; // Interval between character changes in milliseconds

	// 	rollTimer = setInterval(() => {
	// 		// characters = Array.from(
	// 		// 	{ length: 3 },
	// 		// 	() => characterList[Math.floor(Math.random() * characterList.length)]
	// 		// );
	// 		character = characterList[Math.floor(Math.random() * characterList.length)];
	// 	}, rollInterval);

	// 	finalNumber = await generateNumber();

	// 	clearInterval(rollTimer);
	// 	rolling = false;
	// }

	// export function confirmRoll() {
	// 	$diceRollResolver(finalNumber);
	// }

	afterUpdate(() => {
		// if (autoConfirm && finalNumber !== null) {
		// 	setTimeout(() => {
		// 		confirmRoll();
		// 		finalNumber = null;
		// 		characters = [];
		// 	}, 3000);
		// }
	});

	onDestroy(() => {
		clearInterval(rollTimer);
	});

	async function generateRandomNumber() {
		// return Math.floor(Math.random() * (6 - 2) + 1);
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


</script>

<!-- on:click={onClick} on:keydown={onClick} -->
<div class="dice-roller-container" disabled={rolling} on:click on:keyup>
	<!-- <div>
		{$currentState.status}
	</div>
	<div> -->
		<div class="dice-roller">
			{#if rolling}
				<!-- {#each characters as character, i} key={i}-->
				<span in:fade>
					{character}
				</span>
				<!-- {/each} -->
			{:else if finalNumber > 0}
				<!-- svelte-ignore a11y-click-events-have-key-events  on:click={confirmRoll}-->
				<span class="result" in:fade> {diceList[finalNumber - 1]}</span>
			{:else}
				<!-- svelte-ignore a11y-click-events-have-key-events  on:click={rollDice} -->
				<span in:fade> {diceList[0]}</span>
			{/if}
		</div>
	<!-- </div>
	<div>
		{#if !rolling && finalNumber > 0}
			<button on:click={confirmRoll}>confirm</button>
		{:else}
			<button on:click={rollDice} disabled={rolling}>roll</button>
		{/if}
	</div> -->
</div>

<style>
	.dice-roller-container {
		cursor: pointer;
		display: flex;
		flex-direction: column;
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
	.dice-roller span {
		cursor: pointer;
	}
</style>
