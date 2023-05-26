<script>
	import { onMount } from 'svelte';
	import DiceBox from '@3d-dice/dice-box';
	import { gameConfig } from './WAAStore.js';

	export let rollDuration = gameConfig.options?.rollDuration ?? 3000; // Duration of rolling animation in milliseconds
	export let rolling = false;
	export let header = '';

	let container;
	let canvas;
	let diceBox;
	onMount(() => {
		console.log('dice mount', gameConfig);
		diceBox = new DiceBox('#dc-dice-canvas', {
			assetPath: '/assets/',
			settleTimeout: rollDuration,
			scale: 6,
			themeColor: gameConfig.options?.dice?.color ?? '#1387b9',
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
		<slot>
			<div class="dc-header">
				<h4>{header}</h4>
			</div>
		</slot>
	</div>
	{#if !rolling}

		<button class="dc-fade-in" on:click on:keyup>{header}</button>
	{/if}
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
		cursor: pointer;
		height: 99%;
		width: 100%;
		box-sizing: border-box;
	}

	.dc-dice-roller-container button {
		position: absolute;
		display: grid;
		justify-self: center;
		align-self: center;
		
	}
	/* .dc-dice-roller-header {
		position: absolute;
		display: grid;
		width: min(65ch, 100% - 1rem);
		justify-self: center;
	} */
</style>
