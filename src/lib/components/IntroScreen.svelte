<script>
	import { transitionTo } from '../stores/gameStore.svelte.js';
	import { exitGame } from '../stores/gameActions.svelte.js';
	import ContinueButton from './ContinueButton.svelte';
	import ButtonBar from './ButtonBar.svelte';
	import HowToPlay from './HowToPlay.svelte';
	import ChoiceCard from './intro/ChoiceCard.svelte';
	import { useInstructionsPreference } from '$lib/composables/useInstructionsPreference.svelte.js';

	const pref = useInstructionsPreference(transitionTo, exitGame);
</script>

<div class="dc-intro-container">
	{#if pref.currentView === 'choice'}
		<div class="content choice dc-fade-in">
			<h1>How To Play</h1>
			<p class="subtitle">
				Would you like to learn the game mechanics, or skip straight to the story?
			</p>

			<div class="choice-cards">
				<ChoiceCard
					title="Learn How to Play"
					description="Understand the mechanics before diving into the story"
					recommendation="Recommended for first-time players"
					variant="learn"
					onclick={pref.handleLearnToPlay}
				>
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
				</ChoiceCard>

				<ChoiceCard
					title="Skip Once"
					description="Skip to the story this time, show instructions again next time"
					recommendation="Try the game first"
					variant="skip"
					onclick={pref.handleSkipOnce}
				>
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
				</ChoiceCard>

				<ChoiceCard
					title="Skip Always"
					description="I know how to play, never show instructions again"
					recommendation="For experienced players"
					variant="skip-always"
					onclick={pref.handleSkipAlways}
				>
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
				</ChoiceCard>
			</div>
		</div>
	{:else if pref.currentView === 'instructions'}
		<HowToPlay></HowToPlay>
	{/if}

	<ButtonBar>
		{#if pref.currentView === 'choice'}
			<ContinueButton text="Exit" onclick={pref.handleBack} testid="intro-exit-button" />
			<ContinueButton text="Skip Once" onclick={pref.handleSkipOnce} testid="intro-skip-once-button" />
		{:else}
			<ContinueButton text="Exit" onclick={exitGame} testid="intro-exit-button" />
			<ContinueButton text="Skip Once" onclick={pref.handleSkipOnce} testid="intro-skip-once-button" />
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
	}

	@media (max-width: 450px) {
		.choice {
			padding: var(--space-md);
		}
	}
</style>
