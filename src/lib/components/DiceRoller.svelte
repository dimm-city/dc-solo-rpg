<script>
	import { currentState, isWaitingForDice, diceRollResolver } from './GameStore.js';

	let result = '';
	function getRandomNumber() {
		return Math.floor(Math.random() * (6 - 2) + 1);
	}
	async function onDiceRoll() {
		result = await getRandomNumber();
		console.log('dice rolled');
		setTimeout(() => {
			$diceRollResolver(result);
		}, 500);
	}
</script>

<div class="dice-roller-container">
	<h4>{$currentState.status}</h4>
	<button on:click={onDiceRoll}>roll dice</button>
	<div> {result}</div>
</div>

<style>
	.dice-roller-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		align-items: center;
		justify-content: center;
	}
</style>
