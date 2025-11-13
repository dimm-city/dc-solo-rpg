<script>
	import { fade } from 'svelte/transition';
	import OverlayModal from './OverlayModal.svelte';

	let { isOpen = false, helpKey, onClose } = $props();

	// Define help content for different game concepts
	const helpContent = {
		tower: {
			title: 'Tower (Health)',
			message:
				'Your Tower represents your health. Each time you take damage, blocks fall from the Tower. If it reaches 0, you lose the game. Start with 54 blocks (on normal difficulty).'
		},
		kings: {
			title: 'Kings (Failure Counter)',
			message:
				"Kings are your doom. Each time you reveal a King, you're one step closer to failure. Reveal all 4 Kings and the game ends immediately in defeat."
		},
		tokens: {
			title: 'Tokens (Win Condition)',
			message:
				'Tokens are your path to victory. You need 10 tokens to attempt the final challenge. Gain tokens through Narrative (Bonus) cards. With 10 tokens, drawing the Ace of Hearts lets you roll for victory.'
		},
		bonus: {
			title: 'Luck (Bonus)',
			message:
				'Luck tokens reduce damage you take. Each Luck token absorbs one point of damage when you fail a challenge. Gain Luck by drawing Narrative cards (Aces).'
		},
		cardTypes: {
			title: 'Card Types',
			message:
				'Challenge cards (odd ranks) trigger damage rolls. Event cards (even ranks) are safe moments. Narrative cards give bonuses. Kings are threats. The Ace of Hearts is your win condition.'
		},
		progress: {
			title: 'Cards Progress',
			message:
				"The progress bar shows how many cards you've drawn from the 52-card deck. As you progress, tension builds - every card drawn brings you closer to victory or defeat."
		},
		deck: {
			title: 'Deck Visualization',
			message:
				'The deck stack shows how many cards remain. Watch it shrink as you progress through your journey. Each card contains a new challenge, story moment, or turning point.'
		}
	};

	const content = $derived(
		helpContent[helpKey] || { title: 'Help', message: 'No help available for this topic.' }
	);

	function handleBackdropClick(e) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}
</script>

<OverlayModal isVisible={isOpen} zIndex={1000}>
	<div class="help-card-content">
		<h3 class="help-title">{content.title}</h3>
		<p class="help-message">{content.message}</p>
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
		gap: var(--space-md);
	}

	.help-title {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-xl);
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

	/* Mobile responsive */
	@media (max-width: 600px) {
		.help-title {
			font-size: var(--text-lg);
		}

		.help-message {
			font-size: var(--text-sm);
		}

		.dismiss-button {
			width: 100%;
			padding: var(--space-md);
		}
	}

	/* Accessibility - Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.dismiss-button:hover {
			transform: none;
		}
	}
</style>
