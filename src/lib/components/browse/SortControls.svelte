<!--
 * SortControls - Order or filter the Story Library
 *
 * A compact select sized to its content (it used to stretch across the whole header).
 *
 * @component
 * @example
 * <SortControls bind:sortBy={sortBy} />
 -->

<script>
	let { sortBy = $bindable('recent') } = $props();
</script>

<div class="sort-controls">
	<label for="sort-select">Show</label>
	<select id="sort-select" bind:value={sortBy}>
		<option value="recent">Newest first</option>
		<option value="oldest">Oldest first</option>
		<option value="won">Escapes only</option>
		<option value="lost">Losses only</option>
	</select>
</div>

<style>
	.sort-controls {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		flex: 0 0 auto;
	}

	/* Overrides the global uppercase label style: this is a control label, not a heading */
	.sort-controls label {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0;
		text-transform: none;
		color: #d5dfeb;
	}

	.sort-controls select {
		box-sizing: border-box;
		width: auto;
		min-height: 44px;
		margin: 0;
		padding: 8px 40px 8px 14px;
		appearance: none;
		background-color: #07101a;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 14px center;
		background-size: 14px;
		border: 1px solid #6a87a3;
		border-radius: 4px;
		box-shadow: none;
		color: #fff;
		font-family: var(--font-body);
		font-size: 1rem;
		cursor: pointer;
	}

	.sort-controls select:hover {
		border-color: #9ab4cc;
	}

	.sort-controls select:focus-visible {
		outline: 2px solid var(--color-neon-cyan);
		outline-offset: 2px;
		border-color: var(--color-neon-cyan);
	}

	.sort-controls option {
		background: #07101a;
		color: #fff;
	}
</style>
