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
</style>
