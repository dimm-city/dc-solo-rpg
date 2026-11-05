<div class="load-screen" role="status" aria-live="polite">
	<span class="load-ring" aria-hidden="true"></span>
	<span class="load-label">Loading</span>
</div>

<style>
	.load-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-md, 1rem);
		min-height: 40dvh;
		color: var(--color-text-muted, rgba(255, 255, 255, 0.6));
	}

	.load-ring {
		width: 48px;
		height: 48px;
		border: 2px solid var(--color-neon-cyan, #00ffff);
		border-radius: 50%;
		opacity: 0.5;
		animation: load-pulse 1.6s ease-in-out infinite;
	}

	.load-label {
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: var(--text-sm, 0.875rem);
		letter-spacing: var(--letter-spacing-widest, 0.15em);
		text-transform: uppercase;
	}

	@keyframes load-pulse {
		0%,
		100% {
			opacity: 0.25;
			transform: scale(0.9);
		}
		50% {
			opacity: 0.8;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.load-ring {
			animation: none;
		}
	}
</style>
