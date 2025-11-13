<script>
	import { fade } from 'svelte/transition';
	import OverlayModal from './OverlayModal.svelte';

	let { isOpen = false, onClose } = $props();

	// Define all help content sections
	const helpSections = [
		{
			title: 'Health (Tower)',
			message:
				'Your Tower represents your health. Each time you take damage, blocks fall from the Tower. If it reaches 0, you lose the game. Start with 54 blocks (on normal difficulty).'
		},
		{
			title: 'Failure Counter (Kings)',
			message:
				"Kings are your doom. Each time you reveal a King, you're one step closer to failure. Reveal all 4 Kings and the game ends immediately in defeat."
		},
		{
			title: 'Luck (Bonus)',
			message:
				'Luck tokens reduce damage you take. Each Luck token absorbs one point of damage when you fail a challenge. Gain Luck by drawing Narrative cards (Aces).'
		},
		{
			title: 'Success (Tokens)',
			message:
				'Tokens are your path to victory. You need 10 tokens to attempt the final challenge. Gain tokens through Narrative (Bonus) cards. With 10 tokens, drawing the Ace of Hearts lets you roll for victory.'
		},
		{
			title: 'Card Types',
			message:
				'Challenge cards (odd ranks: 3, 5, 7, 9) trigger damage rolls. Event cards (even ranks: 2, 4, 6, 8, 10, J, Q) are safe moments. Narrative cards (Aces) give bonuses. Kings are threats. The Ace of Hearts is your win condition.'
		},
		{
			title: 'The Deck',
			message:
				"You play with a standard 52-card deck. Watch the deck shrink as you progress through your journey. Each card contains a new challenge, story moment, or turning point. The progress bar shows how many cards you've drawn - every card brings you closer to victory or defeat."
		},
		{
			title: 'How to Win',
			message:
				'Collect 10 tokens by drawing Narrative cards. Then, if you draw the Ace of Hearts, you can attempt the final challenge by rolling dice. Roll higher than your remaining tower blocks to win.'
		},
		{
			title: 'How to Lose',
			message:
				'You lose if your Tower (health) reaches 0 from failed challenges, or if you reveal all 4 Kings. Manage your resources carefully to survive until you can attempt victory.'
		}
	];
</script>

<OverlayModal isVisible={isOpen} zIndex={1000}>
	<div class="help-card-content">
		<h2 class="help-main-title">Game Guide</h2>

		{#each helpSections as section}
			<div class="help-section">
				<h3 class="help-title">{section.title}</h3>
				<p class="help-message">{section.message}</p>
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
