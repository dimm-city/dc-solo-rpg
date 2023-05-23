<script>
	import { afterUpdate, onDestroy, onMount, beforeUpdate } from 'svelte';
	import { fade } from 'svelte/transition';
	import DiceBox from '@3d-dice/dice-box';

	let container;
	let canvas;
	let diceBox;
	onMount(() => {
		diceBox = new DiceBox('#dice-canvas', {
			assetPath: '/assets/',
			settleTimeout: rollDuration,
			scale: 6,
			themeColor: '#1387b9',
			offscreen: true
		});
		if (canvas && container && !rolling) {
			canvas.height = container.offsetHeight;
			canvas.width = container.offsetWidth;
		}
	});

	beforeUpdate(() => {
		// if (canvas && container && !rolling) {
		// 	canvas.height = container.offsetHeight;
		// 	canvas.width = container.offsetWidth;
		// }
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
	bind:this={container}
	on:click
	on:keyup
>
	<canvas bind:this={canvas} id="dice-canvas" />
</div>

<style>
	.dice-roller-container {
		cursor: pointer;
		display: grid;
		height: 100%;
		width: 100%;
		justify-content: center;
	}
	.dice-roller-container > canvas {
		display: grid;
		height: 99%;
		width: 100%;
		box-sizing: border-box;
		background: aliceblue;
	}
</style>
