<script>
	import { afterUpdate, onDestroy, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import DiceBox from '@3d-dice/dice-box';

	let diceBox;
	onMount(() => {
		diceBox = new DiceBox('#dice-roller-container', {
			assetPath: '/assets/',
			settleTimeout: rollDuration,
			scale: 6,
			themeColor: '#1387b9',
			offscreen: false
		});
	});

	export let rollDuration = 3000; // Duration of rolling animation in milliseconds
	export let rolling = false;
	export async function roll() {
		rolling = true;
		return diceBox.init().then(() => {
			return diceBox.roll('1d6').then((result) => {
				console.log(result);
				rolling = false;
				return result[0].value;
			});
		});
	}
</script>

<div
	id="dice-roller-container"
	class="dice-roller-container"
	disabled={rolling}
	on:click
	on:keyup
/>

<style>
	.dice-roller-container {
		cursor: pointer;
		display: grid;
		height: 100%;
		width: 100%;
		justify-content: center;
	}
	:global(.dice-roller-container > canvas) {
		display: grid;
		height: 100%;
		aspect-ratio: 9/16;
	}
</style>
