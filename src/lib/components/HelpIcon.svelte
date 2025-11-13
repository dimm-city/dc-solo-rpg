<script>
	let { onclick, ariaLabel = 'Show help' } = $props();
</script>

<button class="help-icon" {onclick} aria-label={ariaLabel} type="button">
	<!-- HelpCircle SVG icon -->
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
	>
		<circle cx="12" cy="12" r="10" />
		<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
		<path d="M12 17h.01" />
	</svg>
</button>

<style>
	.help-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		cursor: pointer;
		color: rgba(255, 255, 255, 0.6);
		transition: all 0.2s;
		/* Touch-friendly size */
		min-width: 32px;
		min-height: 32px;
		padding: 0;
	}

	.help-icon:hover,
	.help-icon:focus {
		background: rgba(255, 255, 255, 0.1);
		color: var(--color-neon-cyan, #00ffff);
		border-color: var(--color-neon-cyan, #00ffff);
		box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
	}

	.help-icon svg {
		pointer-events: none;
	}

	/* Accessibility */
	.help-icon:focus-visible {
		outline: 2px solid var(--color-neon-cyan, #00ffff);
		outline-offset: 2px;
	}
</style>
