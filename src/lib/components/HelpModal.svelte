<script>
	import { fade } from 'svelte/transition';
	import OverlayModal from './OverlayModal.svelte';
	import TTSRegion from '$lib/tts/TTSRegion.svelte';

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
				"Kings represent looming doom. Each King revealed brings you closer to failure. Reveal all 4 Kings and the game ends immediately in defeat."
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
				"You play with a standard 52-card deck. Each round, roll a d20 to determine how many cards to draw. The deck shrinks as your journey progresses. Watch the progress bar to see how close you are to the end."
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

<OverlayModal isVisible={isOpen} zIndex={1000} fixedHeight="70vh" animateHeight={true}>
	<div class="help-card-content">
		<h2 class="help-main-title">Game Guide</h2>

		{#each helpSections as section, index}
			<div class="help-section">
				<h3 class="help-title">{section.title}</h3>
				<TTSRegion regionId="help-section-{index}" text={section.message}>
					<p class="help-message">{section.message}</p>
				</TTSRegion>
			</div>
		{/each}

		<button class="dismiss-button" onclick={onClose}>
			<span>Got it</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M5 12h14" />
				<path d="m12 5 7 7-7 7" />
			</svg>
		</button>
	</div>
</OverlayModal>

<style>
	.help-card-content {
		width: 100%;
		height: 100%;
		padding: var(--space-xl);
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.help-main-title {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-shadow:
			0 0 15px rgba(0, 255, 255, 1),
			0 0 30px rgba(0, 255, 255, 0.5);
		margin: 0 0 var(--space-md) 0;
		letter-spacing: 0.08em;
		text-align: center;
		text-transform: uppercase;
		border-bottom: 2px solid rgba(0, 255, 255, 0.3);
		padding-bottom: var(--space-md);
	}

	.help-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: rgba(0, 0, 0, 0.2);
		border-left: 3px solid var(--color-neon-cyan);
		border-radius: 4px;
	}

	.help-title {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-shadow:
			0 0 10px rgba(0, 255, 255, 0.8),
			0 0 20px rgba(0, 255, 255, 0.4);
		margin: 0;
		letter-spacing: 0.05em;
	}

	.help-message {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--text-base);
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
	}

	.dismiss-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-lg);
		background: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		border: none;
		border-radius: 4px;
		color: white;
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		cursor: pointer;
		transition: all 0.2s ease;
		align-self: flex-end;
		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.3),
			inset 0 0 10px rgba(255, 255, 255, 0.1);
	}

	.dismiss-button:hover {
		transform: translateY(-2px);
		box-shadow:
			0 0 25px rgba(0, 255, 255, 0.5),
			0 0 40px rgba(217, 70, 239, 0.3),
			inset 0 0 15px rgba(255, 255, 255, 0.15);
	}

	.dismiss-button:active {
		transform: translateY(0);
	}

	/* Tablet responsive */
	@media (max-width: 900px) {
		.help-card-content {
			padding: var(--space-lg);
			gap: var(--space-md);
		}

		.help-main-title {
			font-size: var(--text-xl);
			margin-bottom: var(--space-sm);
		}

		.help-section {
			padding: var(--space-sm) var(--space-md);
		}

		.help-title {
			font-size: var(--text-base);
		}

		.help-message {
			font-size: var(--text-sm);
		}
	}

	/* Mobile responsive */
	@media (max-width: 600px) {
		.help-card-content {
			padding: var(--space-md);
			gap: var(--space-sm);
		}

		.help-main-title {
			font-size: var(--text-lg);
			padding-bottom: var(--space-sm);
			margin-bottom: var(--space-sm);
		}

		.help-section {
			padding: var(--space-sm);
			gap: var(--space-xs);
		}

		.help-title {
			font-size: var(--text-sm);
		}

		.help-message {
			font-size: var(--text-xs);
			line-height: 1.5;
		}

		.dismiss-button {
			width: 100%;
			padding: var(--space-md);
			font-size: var(--text-sm);
		}
	}

	/* Extra small mobile */
	@media (max-width: 400px) {
		.help-card-content {
			padding: var(--space-sm);
		}

		.help-main-title {
			font-size: var(--text-base);
		}

		.help-title {
			font-size: var(--text-xs);
		}

		.help-message {
			font-size: 0.75rem;
		}
	}

	/* Landscape mobile optimization */
	@media (max-height: 600px) and (orientation: landscape) {
		.help-card-content {
			padding: var(--space-sm) var(--space-md);
			gap: var(--space-xs);
		}

		.help-section {
			padding: var(--space-xs) var(--space-sm);
		}

		.help-main-title {
			font-size: var(--text-base);
			margin-bottom: var(--space-xs);
			padding-bottom: var(--space-xs);
		}

		.dismiss-button {
			padding: var(--space-sm) var(--space-md);
			font-size: var(--text-xs);
		}
	}

	/* Accessibility - Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.dismiss-button:hover {
			transform: none;
		}
	}
</style>
