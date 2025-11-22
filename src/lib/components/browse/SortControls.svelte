<!--
 * SortControls - Sort dropdown for game library
 *
 * Provides sorting options for completed games list
 *
 * @component ⭐ REUSABLE
 * @example
 * <SortControls bind:sortBy={sortBy} />
 -->

<script>
	let { sortBy = $bindable('recent') } = $props();
</script>

<div class="sort-controls">
	<label for="sort-select">Sort by:</label>
	<select id="sort-select" bind:value={sortBy}>
		<option value="recent">Most Recent</option>
		<option value="oldest">Oldest First</option>
		<option value="won">Victories Only</option>
		<option value="lost">Defeats Only</option>
	</select>
</div>

<style>
	.sort-controls {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.sort-controls select {
		padding: var(--space-sm) var(--space-md);
		background: rgba(0, 0, 0, 0.4);
		border: 2px solid rgba(138, 43, 226, 0.4);
		border-radius: 4px;
		color: rgba(255, 255, 255, 0.9);
		font-family: var(--font-body);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.sort-controls select:hover,
	.sort-controls select:focus {
		border-color: rgba(186, 85, 211, 0.6);
		background: rgba(0, 0, 0, 0.6);
		outline: none;
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.sort-controls {
			width: 100%;
			flex-wrap: wrap;
			gap: var(--space-sm);
		}

		.sort-controls :global(button) {
			flex: 1;
			min-width: calc(50% - var(--space-xs));
			font-size: 0.8125rem;
			padding: var(--space-xs) var(--space-sm);
		}
	}
</style>
