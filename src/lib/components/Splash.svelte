<script>
	import { fade } from 'svelte/transition';

	/**
	 * Splash screen component - animated "Dimm City" loading screen
	 * Based on the neon signage flickering effect from splash2.html
	 */
	let { visible = true, onComplete = () => {} } = $props();

	let isVisible = $state(visible);
	let shouldFadeOut = $state(false);

	// Auto-hide after animation completes
	$effect(() => {
		if (visible) {
			isVisible = true;
			shouldFadeOut = false;

			const timer = setTimeout(() => {
				shouldFadeOut = true;
				// Call onComplete immediately when fade starts
				onComplete();
				// Hide component after fade completes
				setTimeout(() => {
					isVisible = false;
				}, 850); // Slightly longer than fade duration
			}, 2500); // Animation duration + slight delay

			return () => clearTimeout(timer);
		}
	});
</script>

{#if isVisible}
	<div class="splash-overlay" class:fade-out={shouldFadeOut} transition:fade={{ duration: 800 }}>
		<div class="splash-content">
			<div class="title">
				<span>D</span><span>I</span><span>M</span><span>M</span>
				<div class="title-divider"></div>
				<span>C</span><span>I</span><span>T</span><span>Y</span>
			</div>
			<div class="subtitle">Connecting to the aether...</div>
		</div>
	</div>
{/if}

<style>
	:root {
		--bg-color: #05070a;
		--neon-yellow: #ffe400;
		--neon-cyan: #00ffff;
		--neon-magenta: #ff00ff;
	}

	.splash-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: var(--bg-color);
		/* Add a subtle radial gradient for depth */
		background-image:
			radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.08), transparent 70%),
			radial-gradient(circle at 20% 80%, rgba(255, 0, 255, 0.1), transparent 65%);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	/* Horizontal scanlines overlay */
	.splash-overlay::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		background-image: repeating-linear-gradient(
			to bottom,
			rgba(255, 255, 255, 0.05) 0px,
			rgba(255, 255, 255, 0.05) 2px,
			transparent 2px,
			transparent 4px
		);
		animation: scan 12s linear infinite;
	}

	@keyframes scan {
		0% {
			transform: translateY(0);
		}
		100% {
			transform: translateY(-4px);
		}
	}

	.splash-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	/* Title container */
	.title {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		font-family: 'lixdu', 'Orbitron', sans-serif;
		font-size: 4rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
		padding: 0;
		text-shadow:
			0 0 2px var(--neon-yellow),
			0 0 5px var(--neon-yellow),
			0 0 10px var(--neon-cyan);
		color: var(--neon-yellow);
	}
.title-divider {
		width: 90%;
		height: 2px;
		margin: 0.5rem 0;
		background: linear-gradient(90deg, var(--neon-magenta), var(--neon-cyan));
		box-shadow:
			0 0 8px var(--neon-yellow),
			0 0 16px var(--neon-cyan);
	}
	.title span {
		display: inline-block;
		opacity: 0;
		transform: translateY(60px);
		animation: slideIn 0.9s forwards;
	}

	/* Delay each letter slightly for the cascading effect */
	.title span:nth-child(1) {
		animation-delay: 0.1s;
	}
	.title span:nth-child(2) {
		animation-delay: 0.25s;
	}
	.title span:nth-child(3) {
		animation-delay: 0.4s;
	}
	.title span:nth-child(4) {
		animation-delay: 0.55s;
	}
	.title span:nth-child(5) {
		animation-delay: 0.7s;
	}
	.title span:nth-child(6) {
		animation-delay: 0.85s;
	}
	.title span:nth-child(7) {
		animation-delay: 1s;
	}
	.title span:nth-child(8) {
		animation-delay: 1.15s;
	}

	@keyframes slideIn {
		0% {
			opacity: 0;
			transform: translateY(60px);
			filter: blur(4px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
		}
	}

	/* Subtitle with flicker effect */
	.subtitle {
		margin-top: 1rem;
		font-family: 'Share Tech Mono', monospace;
		font-size: 1rem;
		color: var(--neon-cyan);
		text-shadow: 0 0 10px var(--neon-cyan);
		animation: flicker 3s infinite;
	}

	@keyframes flicker {
		0%,
		15%,
		20%,
		27%,
		60%,
		100% {
			opacity: 1;
		}
		16%,
		22%,
		24%,
		34%,
		58% {
			opacity: 0.3;
		}
	}

	/* Responsive font sizes */
	@media (max-width: 768px) {
		.title {
			font-size: 3rem;
		}

		.subtitle {
			font-size: 0.875rem;
		}
	}

	@media (max-width: 480px) {
		.title {
			font-size: 2rem;
		}

		.subtitle {
			font-size: 0.75rem;
		}
	}
</style>
