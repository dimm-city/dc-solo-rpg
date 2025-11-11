<script>
	import { onMount } from 'svelte';
	import { initializeDiceBox, rollDice, resizeDiceBox } from '../stores/diceStore.svelte.js';
	import AugmentedButton from './AugmentedButton.svelte';

	let {
		rolling = $bindable(false),
		header = '',
		onrollstart = () => {},
		onrollcomplete = () => {},
		onclick = () => {},
		onkeyup = () => {}
	} = $props();

	let containerElement = $state();

	onMount(async () => {
		// Initialize or reattach the shared DiceBox instance
		await initializeDiceBox(containerElement);

		// Trigger resize after a delay to account for layout settling
		setTimeout(() => {
			resizeDiceBox();
		}, 600);
	});

	export async function roll(values = null) {
		if (rolling) return;
		rolling = true;

		// Call roll start callback
		onrollstart();

		try {
			const result = await rollDice(values);

			rolling = false;

			// Call roll complete callback
			onrollcomplete({ result });

			return result;
		} catch (error) {
			console.error('[ThreeJSDiceBoxRoller] Error rolling dice:', error);
			rolling = false;
			throw error;
		}
	}
</script>

<div
	bind:this={containerElement}
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
		display: block;
		cursor: pointer;
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		grid-row: 1;
		grid-column: 1;
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
