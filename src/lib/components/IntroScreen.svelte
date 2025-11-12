<script>
	import { onMount } from 'svelte';
	import { gameState, transitionTo } from '../stores/gameStore.svelte.js';
	import { exitGame } from '../stores/gameActions.svelte.js';
	import ContinueButton from './ContinueButton.svelte';
	import {
		hasSeenInstructions,
		markInstructionsAsSeen
	} from '../utils/instructionsStorage.js';

	let currentView = $state('choice'); // 'choice' or 'instructions'
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		// Check if user has already seen instructions
		const instructionsSeen = hasSeenInstructions();

		if (instructionsSeen) {
			// Skip directly to game intro overlay
			transitionTo('showIntro');
		}
	});

	function handleLearnToPlay() {
		currentView = 'instructions';
	}

	function handleSkipOnce() {
		// Skip to story without storing preference
		transitionTo('showIntro');
	}

	function handleSkipAlways() {
		// Skip to story and remember preference
		markInstructionsAsSeen();
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
		<div class="content instructions dc-fade-in">
			<h1>How To Play</h1>

			<h2>The Die</h2>
			<p>
				This determines how many tasks you must face in each scene. It's also used for tests to see
				if you are successful on the salvation mechanism and failure checks.
			</p>

			<h2>The Oracle (a deck of cards)</h2>
			<p>
				The deck provides the tasks and challenges you face. Generally, a deck has four
				topics/areas. There are four cards in the deck that act as your countdowns to failure, one
				from each topic. When all four failure cards are revealed, something in your setting ends
				your quest. This may mean death, giving up, becoming lost, or something else. The primary
				success card acts as a salvation mechanism (see below). The success cards of the other
				topics give some bonus. Other cards require you to roll a failure check, while others are
				safe.
			</p>

			<h2>Success Checks</h2>
			<p>
				Each game has a way of winning. This mechanism arrives with the primary success card. Once
				the card is drawn, the player rolls a success check at the end of each round. If their roll
				is successful, they earn a success token. After the player has collected all of the required
				success tokens, their character completes their quest! This may come with a final roll or a
				failure check. If your health meter drops to zero at this stage, it would snatch conquest
				away at the last moment.
			</p>

			<h2>Failure Checks</h2>
			<p>
				Your health meter is one of your countdowns to losing. Some of your tasks from the deck will
				make you roll a failure check. It represents the fragility of your path to completing your
				task. When your health meter reaches zero, you fail.
			</p>

			<h2>Tokens</h2>
			<p>
				The tokens are used to track the progress of the salvation mechanism on the Ace of Hearts.
				Tokens can be anything physical that players can easily keep track of, but it is recommended
				that you suggest something fitting to the theme of your game. For example, The Wretched
				tasks the player with trying to repair their ship, and the suggested tokens are screws,
				nuts, and bolts.
			</p>

			<h2>The Journal</h2>
			<p>
				Wretched and Alone games are best recorded and documented. Depending on the theme and topic
				of the game, this might be video/audio logs, a handwritten diary, a typed document, or
				something else entirely.
			</p>

			<h2>Win Conditions</h2>
			<p>
				If you complete all of the required success checks, the game is over and you have won! Some
				games may allow for additional win conditions.
			</p>
		</div>
	{/if}

	<div class="button-bar dc-game-bg">
		{#if currentView === 'choice'}
			<ContinueButton text="Exit" onclick={handleBack} testid="intro-exit-button" />
		{:else}
			<ContinueButton text="Back" onclick={handleBack} testid="intro-back-button" />
			<ContinueButton
				text="Continue to Story"
				onclick={handleInstructionsContinue}
				testid="intro-continue-button"
			/>
		{/if}
	</div>
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

	.button-bar {
		flex-shrink: 0;
		width: 100%;
		display: flex;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-bg-primary);
		border-top: 2px solid var(--color-cyber-magenta);
		position: relative;
		z-index: 10;
	}

	.button-bar :global(.aug-button-wrapper) {
		flex: 1;
	}

	.button-bar :global(.aug-button) {
		width: 100%;
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
