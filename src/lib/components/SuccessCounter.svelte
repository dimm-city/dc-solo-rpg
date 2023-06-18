<script>
	import { gameStore, gameConfig } from '../stores/WAAStore.js';

	const numTokens = 10;
	$: tokens = Array.from({ length: numTokens }, (_, index) => index < $gameStore.tokens);
</script>

<div class="success-counters-container">
	<h4>{gameConfig?.labels?.successCounters ?? 'Success Counters'}</h4>
	<!-- Success: {$currentState.successCounter} -->
	<div class="grid">
		{#each tokens as token, index}
			<svg class="token" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<polygon points="50,5 95,30 95,70 50,95 5,70 5,30" class:filled={token} />
			</svg>
		{/each}
	</div>
</div>

<style>
	:root{
		--dc-success-counter-grid-flow: row;
	}
	h4 {
		margin-block: var(--dc-header-block-margin);
	}
	.token {
		
		stroke: var(--dc-accent-color);
		stroke-width: 3;
		fill: transparent;
		transition: all 0.3s ease;
		max-width: 2rem;
	}

	.filled {
		fill: var(--dc-accent-color);	
		transition: all 0.3s ease-in-out;
	}

	.grid {
		display: flex;
		flex-flow: column;
		flex-wrap: wrap;
		max-height: 13rem;
		grid-auto-flow: var(--dc-success-counter-grid-flow);
		/*grid-template-columns: repeat(1, min-content);
		 grid-template-rows: repeat(10, 1fr); */
		gap: 0.25rem;
		justify-content: center;
	}
</style>
