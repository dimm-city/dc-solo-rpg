<script>
	import { rollDice } from '../stores/diceStore.svelte.js';
	import { gameState } from '../stores/gameStore.svelte.js';
	import {
		getFailureCheckRoll,
		applyFailureCheckResult,
		confirmFailureCheck
	} from '../stores/gameActions.svelte.js';
	import ContinueButton from './ContinueButton.svelte';

	let { onfailurecheckcompleted = () => {} } = $props();

	let rolling = $state(false);
	let result = $state();

	// Reset state when entering failureCheck screen
	$effect(() => {
		if (gameState.state === 'failureCheck') {
			result = undefined;
			rolling = false;
		}
	});

	async function doCheck() {
		if (rolling) return;
		if (gameState.state == 'failureCheck' && !result) {
			rolling = true;

			// Get roll result WITHOUT updating health yet
			const rollResult = getFailureCheckRoll();
			result = rollResult;

			// Animate the dice
			await rollDice(rollResult);

			rolling = false;

			// NOW apply the health consequences AFTER animation
			applyFailureCheckResult(rollResult);

			// The state has now changed - trigger the screen transition
			// to the new screen (drawCard, log, or gameOver)
			await confirmFailureCheck();
			onfailurecheckcompleted(gameState.state);
		} else if (result) {
			// This branch is for when user clicks "continue" after seeing result
			await confirmFailureCheck();
		}
	}

	const header = $derived(result ? 'Click to continue' : 'Roll failure check');
</script>

<div class="dc-failure-check-container">
	{#if gameState.currentCard && !result}
		<div class="card-info">
			<p class="card-description">{gameState.currentCard.description}</p>
			<small class="card-id">
				{gameState.currentCard.card} of {gameState.currentCard.suit}
			</small>
		</div>
	{/if}
	<div class="dc-dice-roller-header dc-header">
		<ContinueButton
			text={header}
			onclick={doCheck}
			disabled={rolling}
			testid="failure-check-button"
		/>
	</div>
</div>

<style>
	.dc-failure-check-container {
		width: 100%;
		height: 100%;
		display: grid;
		text-align: center;
		grid-template-rows: auto 1fr;
		gap: 1rem;
		align-items: center;
		justify-content: center;
	}

	.card-info {
		padding: var(--space-md, 1rem);
		background: linear-gradient(
			135deg,
			rgba(10, 10, 10, 0.95) 0%,
			rgba(26, 26, 26, 0.9) 50%,
			rgba(10, 10, 10, 0.95) 100%
		);
		border: 2px solid var(--color-neon-cyan, #00ffff);
		border-radius: 8px;
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.3),
			0 0 40px rgba(217, 70, 239, 0.2);
		max-width: 500px;
		margin: 0 auto;
		width: 90%;
	}

	.card-description {
		font-size: var(--text-lg, 1.125rem);
		color: var(--color-text-secondary, rgba(255, 255, 255, 0.85));
		margin: 0 0 0.5rem 0;
	}

	.card-id {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-xs, 0.75rem);
		letter-spacing: var(--letter-spacing-wider, 0.1em);
		color: var(--color-neon-cyan, #00ffff);
		text-transform: uppercase;
	}

	@media (max-width: 768px) {
		.card-info {
			padding: var(--space-sm, 0.5rem);
		}

		.card-description {
			font-size: var(--text-base, 1rem);
		}
	}
</style>
