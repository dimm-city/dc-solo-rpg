<script>
	import { rollDice } from '../stores/diceStore.svelte.js';
	import { gameState } from '../stores/gameStore.svelte.js';
	import { performFinalDamageRoll } from '../stores/gameActions.svelte.js';
	import ContinueButton from './ContinueButton.svelte';

	let rolling = $state(false);
	let result = $state();

	// Reset state when entering finalDamageRoll screen
	$effect(() => {
		if (gameState.state === 'finalDamageRoll') {
			result = undefined;
			rolling = false;
		}
	});

	async function doFinalRoll() {
		// Atomic check-and-set to prevent race conditions on rapid clicks
		if (rolling || result !== undefined) return;
		if (gameState.state !== 'finalDamageRoll') return;

		// Set flags immediately before any async operations
		rolling = true;
		const rollResult = Math.floor(Math.random() * 6) + 1;
		result = rollResult;

		try {
			// Animate the dice
			await rollDice(rollResult);

			// Apply the final damage roll
			performFinalDamageRoll(rollResult);
		} finally {
			// Ensure rolling flag is cleared even if dice animation fails
			rolling = false;
		}
	}

	const header = $derived(
		result
			? gameState.win
				? 'You survived! Click to continue'
				: 'Victory slipped away... Click to continue'
			: 'Roll for your final test'
	);
</script>

<div class="dc-final-damage-roll-container">
	<div class="dc-final-damage-description">
		<h2>The Final Test</h2>
		<p>
			You've completed the countdown, but salvation comes with one final risk. Roll one last time
			to see if you truly escape...
		</p>
		<div class="dc-final-damage-stats">
			<p><strong>Current Resources:</strong> {gameState.tower}</p>
			<p><strong>Bonus Counter:</strong> {gameState.bonus}</p>
			<p><strong>Possible Damage:</strong> 1-6, reduced by bonus</p>
		</div>
	</div>

	<div class="dc-dice-roller-header dc-header">
		<ContinueButton
			text={header}
			onclick={doFinalRoll}
			disabled={rolling}
			testid="final-damage-roll-button"
		/>
	</div>
</div>

<style>
	.dc-final-damage-roll-container {
		height: 100%;
		width: 100%;
		display: grid;
		text-align: center;
		padding: 2rem;
	}

	.dc-final-damage-description {
		margin-bottom: 2rem;
	}

	.dc-final-damage-description h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: var(--dc-accent-color, #ff6b6b);
	}

	.dc-final-damage-description p {
		font-size: 1.2rem;
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.dc-final-damage-stats {
		margin: 1.5rem auto;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
		max-width: 400px;
	}

	.dc-final-damage-stats p {
		margin: 0.5rem 0;
		font-size: 1.1rem;
	}
</style>
