<script>
	import { currentState } from './GameStore';

	export let successScore = 0; // Player's success score

	const numTokens = 10;
	$: tokens = Array.from({ length: numTokens }, (_, index) => index < successScore);
</script>

<div class="success-counters-container">
	<h4>{$currentState.config?.labels?.successCounters ?? 'Success Counters'}</h4>
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
	
	h4 {
		margin-block: var(--dc-header-block-margin);
	}
	.token {
		width: 2rem;
		height: 2rem;
		stroke: var(--dc-accent-color);
		stroke-width: 3;
		fill: transparent;
		transition: fill 0.3s ease;
	}

	.filled {
		fill: var(--dc-accent-color);
		transition: fill 0.3s ease-in-out;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, min-content);
		grid-template-rows: repeat(5, 1fr);
		gap: 0.25rem;
        justify-content: center;
	}
</style>
