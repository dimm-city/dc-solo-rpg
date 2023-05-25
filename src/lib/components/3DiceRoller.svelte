<script>
	import { onMount } from 'svelte';
	import DiceBox from '@3d-dice/dice-box';
	import { gameConfig } from './WAAStore.js';

	
	export let rollDuration = 3000; // Duration of rolling animation in milliseconds
	export let rolling = false;


	let container;
	let canvas;
	let diceBox;
	onMount(() => {
		diceBox = new DiceBox('#dc-dice-canvas', {
			assetPath: '/assets/',
			settleTimeout: rollDuration,
			scale: 6,
			themeColor: gameConfig.options?.diceColor ?? '#1387b9',
			offscreen: true
		});
		if (canvas && container && !rolling) {
			canvas.height = container.offsetHeight;
			canvas.width = container.offsetWidth;
		}
	});
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
	class="dc-dice-roller-container"
	disabled={rolling}
	bind:this={container}
	on:click
	on:keyup
>
	<canvas bind:this={canvas} id="dc-dice-canvas" />
	<div class="dc-dice-roller-header dc-header">
		<slot />
	</div>
</div>

<style>
	.dc-dice-roller-container {
		cursor: pointer;
		display: grid;
		height: 100%;
		width: 100%;
		justify-content: center;
	}
	.dc-dice-roller-container > canvas {
		display: grid;
		height: 99%;
		width: 100%;
		box-sizing: border-box;
	}
	/* .dc-dice-roller-header {
		position: absolute;
		display: grid;
		width: min(65ch, 100% - 1rem);
		justify-self: center;
	} */
</style>
