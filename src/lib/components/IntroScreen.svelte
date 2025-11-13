<script>
	import { onMount } from 'svelte';
	import { gameState, transitionTo } from '../stores/gameStore.svelte.js';
	import { exitGame } from '../stores/gameActions.svelte.js';
	import ContinueButton from './ContinueButton.svelte';
	import ButtonBar from './ButtonBar.svelte';
	import {
		hasSeenInstructions,
		markInstructionsAsSeen,
		hasShownInstructionsInSession,
		markInstructionsShownInSession
	} from '../utils/instructionsStorage.js';
	import HowToPlay from './HowToPlay.svelte';

	let currentView = $state('choice'); // 'choice' or 'instructions'
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		// Check if user has already seen instructions or if shown this session
		const instructionsSeen = hasSeenInstructions();
		const instructionsShownInSession = hasShownInstructionsInSession();

		if (instructionsSeen || instructionsShownInSession) {
			// Skip directly to game intro overlay
			transitionTo('showIntro');
		}
	});

	function handleLearnToPlay() {
		// Mark as shown for this session
		markInstructionsShownInSession();
		currentView = 'instructions';
	}

	function handleSkipOnce() {
		// Skip to story without storing preference (but mark session as shown)
		markInstructionsShownInSession();
		transitionTo('showIntro');
	}

	function handleSkipAlways() {
		// Skip to story and remember preference permanently
		markInstructionsAsSeen();
		markInstructionsShownInSession();
		transitionTo('showIntro');
	}

	function handleInstructionsContinue() {
		// Don't mark as seen when continuing from instructions
		// User chose to learn, so don't auto-skip next time
		transitionTo('showIntro');
	}

	function handleBack() {
		if (currentView === 'instructions') {
			currentView = 'choice';
		} else {
			exitGame();
		}
	}
</script>

<div class="dc-intro-container">
	{#if currentView === 'choice'}
		<div class="content choice dc-fade-in">
			<h1>How To Play</h1>
			<p class="subtitle">
				Would you like to learn the game mechanics, or skip straight to the story?
			</p>

			<div class="choice-cards">
				<button class="choice-card" onclick={handleLearnToPlay}>
					<div class="icon-wrapper">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
							<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
						</svg>
					</div>
					<h3>Learn How to Play</h3>
					<p>Understand the mechanics before diving into the story</p>
					<span class="recommendation">Recommended for first-time players</span>
				</button>

				<button class="choice-card skip-card" onclick={handleSkipOnce}>
					<div class="icon-wrapper">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polygon points="5 4 15 12 5 20 5 4" />
							<line x1="19" x2="19" y1="5" y2="19" />
						</svg>
					</div>
					<h3>Skip Once</h3>
					<p>Skip to the story this time, show instructions again next time</p>
					<span class="recommendation">Try the game first</span>
				</button>

				<button class="choice-card skip-always-card" onclick={handleSkipAlways}>
					<div class="icon-wrapper">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polygon points="5 4 15 12 5 20 5 4" />
							<polygon points="13 4 23 12 13 20 13 4" />
						</svg>
					</div>
					<h3>Skip Always</h3>
					<p>I know how to play, never show instructions again</p>
					<span class="recommendation">For experienced players</span>
				</button>
			</div>
		</div>
	{:else if currentView === 'instructions'}
		<HowToPlay></HowToPlay>
	{/if}

	<ButtonBar>
		{#if currentView === 'choice'}
			<ContinueButton text="Exit" onclick={handleBack} testid="intro-exit-button" />
			<ContinueButton text="Skip Once" onclick={handleSkipOnce} testid="intro-skip-once-button" />
		{:else}
			<ContinueButton text="Exit" onclick={exitGame} testid="intro-exit-button" />
			<ContinueButton text="Skip Once" onclick={handleSkipOnce} testid="intro-skip-once-button" />
		{/if}
	</ButtonBar>
</div>

<style>
	.dc-intro-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		width: 100%;
		border-radius: 0;
		position: relative;
		overflow: visible;
		box-sizing: border-box;
	}

	.content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: var(--space-md);
		background-color: transparent;
		min-height: 0;
	}

	:global(.content h1) {
		font-size: var(--text-2xl);
		margin-bottom: var(--space-md);
	}

	:global(.content h2) {
		font-size: var(--text-xl);
		margin-top: var(--space-lg);
		margin-bottom: var(--space-xs);
	}

	:global(.content h3) {
		font-size: var(--text-lg);
		margin-top: var(--space-md);
		margin-bottom: var(--space-xs);
	}

	:global(.content p) {
		margin-bottom: var(--space-sm);
		line-height: 1.6;
	}

	/* Choice screen styles */
	.choice {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: var(--space-xl);
	}

	.choice h1 {
		font-size: var(--text-3xl);
		margin-bottom: var(--space-sm);
		color: var(--color-neon-cyan);
		text-shadow:
			0 0 20px rgba(0, 255, 255, 0.6),
			0 0 40px rgba(0, 255, 255, 0.3);
	}

	.subtitle {
		font-size: var(--text-lg);
		margin-bottom: var(--space-xl);
		color: rgba(255, 255, 255, 0.8);
	}

	.choice-cards {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		width: 100%;
		max-width: 600px;
	}

	.choice-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-xl);
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.8), rgba(15, 15, 25, 0.7));
		border: 2px solid rgba(0, 255, 255, 0.3);
		border-radius: var(--dc-default-border-radius);
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.2),
			inset 0 0 20px rgba(0, 255, 255, 0.05);
		min-height: 180px;
		text-align: center;
	}

	.choice-card:hover,
	.choice-card:focus {
		background: linear-gradient(135deg, rgba(20, 20, 35, 0.9), rgba(25, 25, 40, 0.8));
		border-color: var(--color-neon-cyan);
		transform: translateY(-4px);
		box-shadow:
			0 0 30px rgba(0, 255, 255, 0.4),
			0 0 60px rgba(0, 255, 255, 0.2),
			inset 0 0 30px rgba(0, 255, 255, 0.1);
	}

	.choice-card:active {
		transform: translateY(-2px);
	}

	.skip-card {
		border-color: rgba(217, 70, 239, 0.3);
		box-shadow:
			0 0 20px rgba(217, 70, 239, 0.2),
			inset 0 0 20px rgba(217, 70, 239, 0.05);
	}

	.skip-card:hover,
	.skip-card:focus {
		border-color: var(--color-cyber-magenta);
		box-shadow:
			0 0 30px rgba(217, 70, 239, 0.4),
			0 0 60px rgba(217, 70, 239, 0.2),
			inset 0 0 30px rgba(217, 70, 239, 0.1);
	}

	.skip-always-card {
		border-color: rgba(255, 215, 0, 0.3);
		box-shadow:
			0 0 20px rgba(255, 215, 0, 0.2),
			inset 0 0 20px rgba(255, 215, 0, 0.05);
	}

	.skip-always-card:hover,
	.skip-always-card:focus {
		border-color: var(--color-brand-yellow);
		box-shadow:
			0 0 30px rgba(255, 215, 0, 0.4),
			0 0 60px rgba(255, 215, 0, 0.2),
			inset 0 0 30px rgba(255, 215, 0, 0.1);
	}

	.icon-wrapper {
		color: var(--color-neon-cyan);
		filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.6));
	}

	.skip-card .icon-wrapper {
		color: var(--color-cyber-magenta);
		filter: drop-shadow(0 0 10px rgba(217, 70, 239, 0.6));
	}

	.skip-always-card .icon-wrapper {
		color: var(--color-brand-yellow);
		filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
	}

	.choice-card h3 {
		font-size: var(--text-xl);
		font-weight: 600;
		color: white;
		margin: 0;
	}

	.choice-card p {
		font-size: var(--text-base);
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.5;
		margin: 0;
	}

	.recommendation {
		font-size: var(--text-sm);
		color: var(--color-neon-cyan);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: var(--space-xs);
	}

	.skip-card .recommendation {
		color: var(--color-cyber-magenta);
	}

	.skip-always-card .recommendation {
		color: var(--color-brand-yellow);
	}

	@media (max-width: 768px) {
		.choice {
			padding: var(--space-lg);
		}

		.choice h1 {
			font-size: var(--text-2xl);
		}

		.subtitle {
			font-size: var(--text-base);
		}

		.choice-cards {
			gap: var(--space-md);
		}

		.choice-card {
			padding: var(--space-lg);
			min-height: 160px;
		}

		.icon-wrapper svg {
			width: 36px;
			height: 36px;
		}

		.choice-card h3 {
			font-size: var(--text-lg);
		}

		.choice-card p {
			font-size: var(--text-sm);
		}
	}

	@media (max-width: 450px) {
		.choice {
			padding: var(--space-md);
		}

		.choice-card {
			padding: var(--space-md);
			min-height: 140px;
		}

		.icon-wrapper svg {
			width: 32px;
			height: 32px;
		}
	}

	/* Accessibility - Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.choice-card {
			transition: none !important;
		}

		.choice-card:hover,
		.choice-card:focus {
			transform: none;
		}
	}
</style>
