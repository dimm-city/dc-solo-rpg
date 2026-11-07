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

	/* NV-03: these page rules hold only while a game is on screen (:has), because a route's
	   stylesheet stays loaded after a client-side navigation away from it. As plain global
	   rules they outlived the game, and the home page could no longer scroll. */

	/* Hide site header/footer for fullscreen games */
	:global(body:has(.game-layout) > header),
	:global(body:has(.game-layout) > footer) {
		display: none;
	}

	:global(body > main:has(.game-layout)) {
		padding: 0;
		margin: 0;
		height: 100vh;
		overflow: hidden;
	}

	/* Allow overflow on mobile for toolbar elements to appear above toolbar */
	@media (max-width: 450px) or (max-height: 600px) {
		.game-layout,
		:global(body > main:has(.game-layout)),
		:global(body:has(.game-layout)) {
			overflow: visible;
		}
	}
</style>
