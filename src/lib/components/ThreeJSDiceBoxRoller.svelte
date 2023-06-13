<script>
	import { onMount } from 'svelte';
	import DiceBox from '@3d-dice/dice-box-threejs';
	import { gameConfig } from './WAAStore.js';

	export let rolling = false;
	export let header = '';

	const defaultConfig = {
		assetPath: '/dice',
		framerate: 1 / 60,
		sounds: false,
		volume: 100,
		color_spotlight: 0xefdfd5,
		shadows: true,
		theme_surface: 'default', //cyberpunk
		sound_dieMaterial: 'plastic',
		theme_customColorset: null,
		theme_colorset: '', // white  see available colorsets in https://github.com/3d-dice/dice-box-threejs/blob/main/src/const/colorsets.js
		theme_texture: '', // see available textures in https://github.com/3d-dice/dice-box-threejs/blob/main/src/const/texturelist.js
		theme_material: 'glass', // "none" | "metal" | "wood" | "glass" | "plastic"
		gravity_multiplier: 400,
		light_intensity: 0.7,
		baseScale: 100,
		strength: 1, // toss strength of dice
		onRollComplete: () => {}
	};

	let diceBox;
	onMount(async () => {
		defaultConfig.theme_colorset = gameConfig.options?.dice ?? defaultConfig.theme_colorset;

		let config = {
			assetPath: '/dice/',
			sounds: true,
			volume: 100,
			//theme_colorset:  gameConfig.options?.dice?.key ?? 'pinkdreams',
			//theme_customColorset: gameConfig.options?.dice,
			baseScale: 140,
			strength: 1
		};

		if (gameConfig.options?.dice?.key) {
			config.theme_colorset = gameConfig.options?.dice?.key ?? 'pinkdreams';
		} else {
			config.theme_customColorset = gameConfig.options?.dice;
		}

		diceBox = new DiceBox('#dice-roller-container', config);
		await diceBox.initialize();
	});
	export async function roll() {
		if (rolling) return;
		rolling = true;
		let result = await diceBox.roll('1d6');

		console.log('return', result);
		rolling = false;
		return result.total;
	}
</script>

<div
	id="dice-roller-container"
	class="dc-dice-roller-container"
	disabled={rolling}
	on:click
	on:keyup
>
	<div class="dc-dice-roller-header dc-header">
		<slot>
			<h4 class="dc-fade-in">{header}</h4>
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
	.dc-dice-roller-header {
		width: 100%;
	}
	:global(.dc-dice-roller-container > canvas) {
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
</style>
