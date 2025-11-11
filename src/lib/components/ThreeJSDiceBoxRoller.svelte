<script>
	import { onMount } from 'svelte';
	import DiceBox from '@3d-dice/dice-box-threejs';
	import { gameState } from '../stores/gameStore.svelte.js';
	import AugmentedButton from './AugmentedButton.svelte';

	let {
		rolling = $bindable(false),
		header = '',
		onrollstart = () => {},
		onrollcomplete = () => {},
		onclick = () => {},
		onkeyup = () => {}
	} = $props();

	const defaultConfig = {
		assetPath: '/dice',
		framerate: 1 / 60,
		sounds: false,
		volume: 100,
		color_spotlight: 0xefdfd5,
		shadows: true,
		theme_surface: 'default',
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

	let diceBox = $state();
	onMount(async () => {
		defaultConfig.theme_colorset = gameState.config.options?.dice ?? defaultConfig.theme_colorset;

		let config = {
			assetPath: '/dice/',
			sounds: true,
			volume: 100,
			//theme_colorset:  gameState.config.options?.dice?.key ?? 'pinkdreams',
			//theme_customColorset: gameState.config.options?.dice,
			baseScale: 100,
			strength: 1.5
		};

		if (gameState.config.options?.dice?.key) {
			config.theme_colorset = gameState.config.options?.dice?.key ?? 'pinkdreams';
		} else {
			config.theme_customColorset = gameState.config.options?.dice;
		}

		diceBox = new DiceBox('#dice-roller-container', config);
		await diceBox.initialize();
		diceBox.resizeWorld();
	});
	export async function roll(values = null) {
		if (rolling) return;
		rolling = true;

		// Call roll start callback
		onrollstart();

		const rollString = values ? `1d6@${values}` : '1d6';
		let result = await diceBox.roll(rollString);

		rolling = false;

		// Call roll complete callback
		onrollcomplete({ result: result.total });

		return result.total;
	}
</script>

<div
	id="dice-roller-container"
	class="dc-dice-roller-container"
	disabled={rolling}
	role="button"
	tabindex="0"
	{onclick}
	{onkeyup}
>
	{#if !rolling}
		<div class="dc-dice-roller-header dc-header">
			<AugmentedButton text={header} {onclick} class="dc-fade-in" />
		</div>
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

	:global(.dc-dice-roller-container > canvas) {
		display: grid;
		cursor: pointer;
		height: 99%;
		width: 100%;
		box-sizing: border-box;
	}

	.dc-dice-roller-container :global(.aug-button-wrapper) {
		width: 100%;
	}

	.dc-dice-roller-container :global(.aug-button) {
		display: grid;
		justify-self: center;
		align-self: center;
		width: 100%;
		margin: 0;
	}
</style>
