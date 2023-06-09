<script>
	import { marked } from 'marked';
	import { nextScreen, gameStore, exitGame } from '../stores/WAAStore.js';
	let currentView = 'rules';
	$: backButtonText = currentView == 'intro' ? 'back' : 'exit';
	$: nextButtonText = currentView == 'intro' ? 'start' : 'continue';
	$: intro = marked($gameStore.config?.introduction ?? '');
	function next() {
		if (currentView == 'rules') {
			currentView = 'intro';
		} else {
			nextScreen('rollForTasks');
		}
	}
	function back() {
		if (currentView == 'rules') {
			exitGame();
		} else {
			currentView = 'rules';
		}
	}
</script>

<div class="dc-intro-container">
	{#if currentView == 'rules'}
		<div class="content rules dc-fade-in">
			<h1>How To Play</h1>

			<h2>The Die</h2>
			<p>
				This determines how many tasks you must face in each scene. It also used for tests to see if
				you are successful on the salvation mechanism and failure checks.
			</p>

			<h2>The Oracle (a deck of cards)</h2>
			<p>
				The deck provides the tasks and challenges you face. Generally, a deck has four
				topics/areas. The are four cards in the deck that act as your countdowns to failure, one
				from each topic. When all four failure cards are revealed something in your setting ends
				your quest. This may mean death, giving up, becoming lost, or something else. The primary
				success card acts as a salvation mechanism (see below). The success cards of the other
				topics give some bonus. Other cards require you to roll a failure check and while others are
				safe.
			</p>

			<h2>Success Checks</h2>
			<p>
				Each game has a way of winning. This mechanism arrives with the primary success card. Once
				the card is drawn, the player rolls a success check at the end of each round. If their roll
				is successful they earn a success token. After the player has collected all of the required
				success tokens, their character completes their quest! This may come with a final roll a
				failure check. If your health meter drops to zero at this stage would snatch conquest away
				at the last moment.
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
				of the game, this might be video/audio logs, a handwritten diary, a typed document or
				something else entirely.
			</p>

			<h2>Win Conditions</h2>
			<p>
				If you complete all of the required success checks, the game is over an you have won! Some
				games may allow for additional win conditions.
			</p>
		</div>
	{:else}
		<div class="content intro dc-fade-in">
			{@html intro}
		</div>
	{/if}
	<div class="button-bar dc-game-bg">
		<button on:click={back}>{backButtonText}</button>
		<button on:click={next}>{nextButtonText}</button>
	</div>
</div>

<style>
	.dc-intro-container {
		display: grid;
		grid-template-rows: minmax(100%, 70svh) min-content;
		height: 100%;
		width: 100%;
		border-radius: 1rem;
	}
	.content {
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: start;
		height: 100%;
		overflow-y: auto;
		padding: 0.75rem;
		padding-bottom: 5rem;
		background-color: transparent;
	}

	:global(.content h1) {
		padding-bottom: 1rem;
	}

	:global(.content h2) {
		padding-bottom: 0.3rem;
	}

	:global(.content h3) {
		padding-bottom: 0.2rem;
	}

	:global(.content p) {
		padding-bottom: 0.75rem;
	}

	:global(.content:last-child) {
		padding-bottom: 3rem;
	}

	.button-bar {
		position: sticky;
		bottom: 0;
		width: 100%;
		display: flex;
		justify-content: space-between;
		padding-block: 0.5rem;
		border-radius: var(--dc-default-border-radius);
	}
	.button-bar button {
		margin-inline: 0.25rem;
	}
</style>
