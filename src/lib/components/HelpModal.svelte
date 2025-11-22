<script>
	/**
	 * HelpModal - Game guide and mechanics help
	 * Uses ContentModal as base
	 */
	import ContentModal from './ContentModal.svelte';

	let { isOpen = false, onClose } = $props();

	// Define all help content sections
	const helpSections = [
		{
			title: 'Stability (Your Life)',
			message:
				'Stability represents your mental and physical state. You start with 20 Stability. Failing challenges causes you to lose Stability. If it reaches 0, you lose the game.'
		},
		{
			title: 'Tokens (Path to Victory)',
			message:
				'You start with 10 Tokens. Your goal is to remove all tokens to escape. Draw the Ace of Hearts to unlock Salvation checks. Each Ace you reveal makes success easier. Remove all tokens to win!'
		},
		{
			title: 'Abilities (Aces)',
			message:
				'Narrative cards (Aces) are powerful abilities. Each Ace you reveal improves your chances in Salvation checks. With 1 Ace: 20% success. With 2 Aces: 35% success. With 3 Aces: 50% success. With 4 Aces: automatic success!'
		},
		{
			title: 'Failure Counter (Kings)',
			message:
				'Kings represent looming doom. Each King revealed brings you closer to failure. Reveal all 4 Kings and the game ends immediately in defeat.'
		},
		{
			title: 'Lucid & Surreal States',
			message:
				'Roll a natural 20 to gain Lucid (advantage on next roll). Roll a natural 1 to gain Surreal (disadvantage on next roll). These states add tactical depth to your decisions.'
		},
		{
			title: 'Card Types',
			message:
				'Challenge cards (odd ranks: 3, 5, 7, 9) trigger Stability checks. Event cards (even ranks: 2, 4, 6, 8, 10, J, Q) are safe moments. Narrative cards (Aces) improve your abilities. Kings are threats. The Ace of Hearts unlocks Salvation.'
		},
		{
			title: 'The Deck',
			message:
				'You play with a standard 52-card deck. Each round, roll a d20 to determine how many cards to draw. The deck shrinks as your journey progresses. Watch the progress bar to see how close you are to the end.'
		},
		{
			title: 'How to Win',
			message:
				'Draw the Ace of Hearts to unlock Salvation checks. Collect more Aces to improve your success rate. Successfully remove all 10 tokens through Salvation checks to escape and win!'
		},
		{
			title: 'How to Lose',
			message:
				'You lose if your Stability reaches 0 from failed challenges, or if you reveal all 4 Kings. Manage your resources and states carefully to survive until you can achieve victory.'
		}
	];
</script>

<ContentModal {isOpen} title="Game Guide" {onClose} footerButtonText="Got it">
	<div class="help-content">
		{#each helpSections as section}
			<div class="help-section">
				<h3 class="help-title">{section.title}</h3>
				<p class="help-message">{section.message}</p>
			</div>
		{/each}
	</div>
</ContentModal>

<style>
	.help-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg, 1.5rem);
	}

	.help-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm, 0.5rem);
		padding: var(--space-md, 1rem);
		background: rgba(0, 0, 0, 0.2);
		border-left: 3px solid var(--dc-accent-color, #3a9fc7);
		border-radius: 4px;
	}

	.help-title {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--dc-accent-color, #3a9fc7);
		margin: 0;
		letter-spacing: 0.05em;
	}

	.help-message {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--dc-default-text-color, #ffffff);
		margin: 0;
	}

	/* Mobile responsive */
	@media (max-width: 600px) {
		.help-content {
			gap: var(--space-md, 1rem);
		}

		.help-section {
			padding: var(--space-sm, 0.75rem);
			gap: var(--space-xs, 0.25rem);
		}

		.help-title {
			font-size: 1rem;
		}

		.help-message {
			font-size: 0.9rem;
			line-height: 1.5;
		}
	}
</style>
