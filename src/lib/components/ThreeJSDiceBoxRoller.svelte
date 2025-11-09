<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import DiceBox from '@3d-dice/dice-box-threejs';
	import { gameStore } from '../stores/WAAStore.js';

	const dispatch = createEventDispatcher();

	export let rolling = false;
	export let header = '';

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

	let diceBox;
	onMount(async () => {
		defaultConfig.theme_colorset = $gameStore.config.options?.dice ?? defaultConfig.theme_colorset;

		let config = {
			assetPath: '/dice/',
			sounds: true,
			volume: 100,
			//theme_colorset:  $gameStore.config.options?.dice?.key ?? 'pinkdreams',
			//theme_customColorset: $gameStore.config.options?.dice,
			baseScale: 100,
			strength: 1.5
		};

		if ($gameStore.config.options?.dice?.key) {
			config.theme_colorset = $gameStore.config.options?.dice?.key ?? 'pinkdreams';
		} else {
			config.theme_customColorset = $gameStore.config.options?.dice;
		}

		diceBox = new DiceBox('#dice-roller-container', config);
		await diceBox.initialize();
		diceBox.resizeWorld();
	});
	export async function roll(values = null) {
		if (rolling) return;
		rolling = true;

		// Dispatch roll start event
		dispatch('rollstart');

		const rollString = values ? `1d6@${values}` : '1d6';
		let result = await diceBox.roll(rollString);

		rolling = false;

		// Dispatch roll complete event
		dispatch('rollcomplete', { result: result.total });

		return result.total;
	}
	
</script>

<div
	id="dice-roller-container"
	class="dc-dice-roller-container"
	disabled={rolling}
	role="button"
	tabindex="0"
	on:click
	on:keyup
>
	{#if !rolling}
		<div class="dc-dice-roller-header dc-header">
			<slot>
				<button class="dc-fade-in" on:click on:keyup>{header}</button>
			</slot>
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

	.dc-dice-roller-container button {
		/* position: absolute; */
		display: grid;
		justify-self: center;
		align-self: center;
		width: 100%;
		margin: 0;
		background-color: var(--dc-default-container-bg);
	}
</style>
