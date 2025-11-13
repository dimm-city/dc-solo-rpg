<script>
	import { onMount } from 'svelte';
	import { gameState, transitionTo } from '../stores/gameStore.svelte.js';
	import { exitGame } from '../stores/gameActions.svelte.js';
	import { hasSeenInstructions, markInstructionsAsSeen } from '../utils/instructionsStorage.js';
</script>

<div class="content instructions dc-fade-in">
	<h1>How To Play</h1>

	<h2>The Die</h2>
	<p>
		This determines how many tasks you must face in each scene. It's also used for tests to see if
		you are successful on the salvation mechanism and failure checks.
	</p>

	<h2>The Oracle (a deck of cards)</h2>
	<p>
		The deck provides the tasks and challenges you face. Generally, a deck has four topics/areas.
		There are four cards in the deck that act as your countdowns to failure, one from each topic.
		When all four failure cards are revealed, something in your setting ends your quest. This may
		mean death, giving up, becoming lost, or something else. The primary success card acts as a
		salvation mechanism (see below). The success cards of the other topics give some bonus. Other
		cards require you to roll a failure check, while others are safe.
	</p>

	<h2>Success Checks</h2>
	<p>
		Each game has a way of winning. This mechanism arrives with the primary success card. Once the
		card is drawn, the player rolls a success check at the end of each round. If their roll is
		successful, they earn a success token. After the player has collected all of the required
		success tokens, their character completes their quest! This may come with a final roll or a
		failure check. If your health meter drops to zero at this stage, it would snatch conquest away
		at the last moment.
	</p>

	<h2>Failure Checks</h2>
	<p>
		Your health meter is one of your countdowns to losing. Some of your tasks from the deck will
		make you roll a failure check. It represents the fragility of your path to completing your task.
		When your health meter reaches zero, you fail.
	</p>

	<h2>Tokens</h2>
	<p>
		The tokens are used to track the progress of the salvation mechanism on the Ace of Hearts.
		Tokens can be anything physical that players can easily keep track of, but it is recommended
		that you suggest something fitting to the theme of your game. For example, The Wretched tasks
		the player with trying to repair their ship, and the suggested tokens are screws, nuts, and
		bolts.
	</p>

	<h2>The Journal</h2>
	<p>
		Wretched and Alone games are best recorded and documented. Depending on the theme and topic of
		the game, this might be video/audio logs, a handwritten diary, a typed document, or something
		else entirely.
	</p>

	<h2>Win Conditions</h2>
	<p>
		If you complete all of the required success checks, the game is over and you have won! Some
		games may allow for additional win conditions.
	</p>
</div>

<style>
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
</style>
