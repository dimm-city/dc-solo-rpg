<script>
	let { children } = $props();
</script>

<div class="game-layout">
	{@render children()}
</div>

<style>
	.game-layout {
		position: fixed;
		inset: 0;
		overflow: hidden;
	}

	/* Hide site header/footer for fullscreen games */
	:global(body > header),
	:global(body > footer) {
		display: none;
	}

	:global(body > main) {
		padding: 0;
		margin: 0;
		height: 100vh;
		overflow: hidden;
	}

	/* Allow overflow on mobile for toolbar elements to appear above toolbar */
	@media (max-width: 450px) or (max-height: 600px) {
		.game-layout,
		:global(body > main),
		:global(body) {
			overflow: visible;
		}
	}
</style>
