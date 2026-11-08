<script>
	/**
	 * FirstRunPanel - the one first-time choice, as a single compact panel.
	 *
	 * Primary: play now (the game teaches through rule tips). Secondary: read the Game Guide
	 * first. Text link: play without tips (they can be turned back on in Settings).
	 */
	let { onplay, onreadrules, onskiptips } = $props();
</script>

<section class="instructions-choice-container" aria-labelledby="first-run-title">
	<div class="first-run-panel" data-augmented-ui="tl-clip br-clip border">
		<p class="first-run-brand">Dimm City</p>
		<h1 id="first-run-title" class="first-run-title">Dream Console</h1>
		<p class="first-run-pitch">A solo journaling game. Draw, roll, write.</p>

		<!-- choice-card/skip-card: kept for the playthrough capture scripts that skip this screen -->
		<button class="first-run-play choice-card skip-card" onclick={onplay}>
			<span class="play-label">Play</span>
			<span class="play-detail">The game teaches you as you go.</span>
		</button>

		<button class="first-run-rules" onclick={onreadrules}>Read the rules first</button>

		<button class="first-run-skip" onclick={onskiptips}>I know how to play: skip the tips</button>
	</div>
</section>

<style>
	.instructions-choice-container {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100dvh;
		padding: var(--space-xl) var(--space-md);
	}

	.first-run-panel {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--space-md);
		width: 100%;
		max-width: 480px;
		padding: clamp(var(--space-lg), 5vw, var(--space-2xl));
		background: rgba(8, 12, 22, 0.9);
		text-align: center;

		--aug-border-all: 2px;
		--aug-border-bg: var(--frame-border);
		--aug-tl: 16px;
		--aug-br: 16px;
	}

	.first-run-brand {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #b4c4d6;
	}

	/* Screen title: the display face at 28px and up */
	.first-run-title {
		margin: 0;
		font-size: clamp(1.75rem, 7vw, 2.25rem);
		line-height: 1.1;
		letter-spacing: 0.04em;
	}

	.first-run-pitch {
		margin: 0 0 var(--space-sm);
		font-size: 1rem;
		text-wrap: balance;
		color: #d5dfeb;
	}

	.first-run-play,
	.first-run-rules {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		min-height: 56px;
		/* 16px sides: the Play subtitle fits one line at 360px (VT-1-14) */
		padding: 10px var(--space-md);
		border-radius: 4px;
		font-family: var(--font-body);
		cursor: pointer;
		transition:
			transform 120ms ease-out,
			opacity 120ms ease-out,
			background-color 120ms ease-out;
	}

	.first-run-play {
		background: linear-gradient(135deg, #831d98, #6d22c7);
		border: 1px solid var(--color-cyber-magenta);
		color: var(--color-brand-yellow);
	}

	.first-run-play:hover {
		transform: translateY(-1px);
		opacity: 0.94;
	}

	.play-label {
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	/* Narrower than 360px it wraps, balanced: never one word on a line of its own */
	.play-detail {
		font-size: 0.875rem;
		text-wrap: balance;
		text-align: center;
		font-weight: 400;
		color: #fde68a;
	}

	.first-run-rules {
		min-height: 48px;
		background: transparent;
		border: 1px solid rgba(0, 255, 255, 0.55);
		color: var(--color-neon-cyan);
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.first-run-rules:hover {
		background: rgba(0, 255, 255, 0.1);
	}

	.first-run-skip {
		align-self: center;
		min-height: 44px;
		padding: 0 var(--space-sm);
		background: none;
		border: none;
		font-family: var(--font-body);
		font-size: 0.875rem;
		color: #b8c5d6;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}

	.first-run-skip:hover {
		color: #fff;
	}

	.first-run-play:focus-visible,
	.first-run-rules:focus-visible,
	.first-run-skip:focus-visible {
		outline: 3px solid var(--color-neon-cyan);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.first-run-play,
		.first-run-rules {
			transition: none;
		}

		.first-run-play:hover {
			transform: none;
		}
	}
</style>
