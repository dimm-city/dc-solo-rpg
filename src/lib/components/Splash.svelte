<script>
	/**
	 * Splash - the Dream Console title card, once per install.
	 *
	 * 1.2s in all: the name rises in (300ms), holds, then one 300ms fade-out from 900ms.
	 * onComplete fires when the fade ends, and the parent unmounts the splash before the
	 * next screen appears, so the two never overlap. Any tap, click or key skips straight
	 * to the fade. Under reduced motion nothing moves: the card shows, then is gone.
	 */
	import { onMount } from 'svelte';

	let { onComplete = () => {} } = $props();

	const TOTAL_MS = 1200;
	const FADE_MS = 300;

	let leaving = $state(false);
	let timers = [];
	let done = false;

	function finish() {
		if (done) return;
		done = true;
		timers.forEach(clearTimeout);
		onComplete();
	}

	function leave() {
		if (leaving) return;
		leaving = true;
		const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		timers.push(setTimeout(finish, reduce ? 0 : FADE_MS));
	}

	onMount(() => {
		timers.push(setTimeout(leave, TOTAL_MS - FADE_MS));
		const skip = () => leave();
		window.addEventListener('pointerdown', skip);
		window.addEventListener('keydown', skip);
		return () => {
			timers.forEach(clearTimeout);
			window.removeEventListener('pointerdown', skip);
			window.removeEventListener('keydown', skip);
		};
	});
</script>

<div class="splash-overlay" class:leaving role="presentation">
	<div class="splash-content">
		<p class="splash-maker">Dimm City</p>
		<h1 class="splash-title">Dream Console</h1>
		<p class="splash-status">Connecting to the ether…</p>
	</div>
</div>

<style>
	.splash-overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		background:
			radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.08), transparent 70%),
			radial-gradient(circle at 20% 80%, rgba(217, 70, 239, 0.1), transparent 65%), #05070a;
		opacity: 1;
		transition: opacity 300ms ease-out;
		cursor: default;
	}

	.splash-overlay.leaving {
		opacity: 0;
	}

	.splash-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		text-align: center;
		animation: splash-in 300ms ease-out both;
	}

	@keyframes splash-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.splash-maker {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--color-cyber-magenta);
	}

	.splash-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 8.5vw, 4rem);
		letter-spacing: 0.05em;
		line-height: 1.05;
		color: var(--color-brand-yellow);
		text-shadow:
			0 0 2px var(--color-brand-yellow),
			0 0 10px rgba(0, 255, 255, 0.6);
	}

	.splash-status {
		margin: var(--space-sm) 0 0;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--color-neon-cyan);
	}

	@media (prefers-reduced-motion: reduce) {
		.splash-overlay {
			transition: none;
		}

		.splash-content {
			animation: none;
		}
	}
</style>
