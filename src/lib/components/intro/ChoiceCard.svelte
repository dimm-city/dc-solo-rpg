<!--
 * ChoiceCard - Individual choice card for instructions preference
 *
 * Displays a card with icon, title, description, and recommendation
 * Variant determines color scheme (cyan, magenta, yellow)
 *
 * @component ⭐ HIGHLY REUSABLE
 * @example
 * <ChoiceCard
 *   title="Learn How to Play"
 *   description="Understand the mechanics"
 *   recommendation="Recommended for first-time players"
 *   variant="learn"
 *   onclick={handleLearnToPlay}
 * >
 *   <svg slot="icon">...</svg>
 * </ChoiceCard>
 -->

<script>
	let {
		title = '',
		description = '',
		recommendation = '',
		variant = 'learn', // 'learn', 'skip', 'skip-always'
		onclick = () => {},
		children
	} = $props();
</script>

<button
	class="choice-card"
	class:skip-card={variant === 'skip'}
	class:skip-always-card={variant === 'skip-always'}
	{onclick}
>
	<div
		class="icon-wrapper"
		class:skip-icon={variant === 'skip'}
		class:skip-always-icon={variant === 'skip-always'}
	>
		{@render children()}
	</div>
	<h3>{title}</h3>
	<p>{description}</p>
	<span
		class="recommendation"
		class:skip-recommendation={variant === 'skip'}
		class:skip-always-recommendation={variant === 'skip-always'}
	>
		{recommendation}
	</span>
</button>

<style>
	.choice-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-xl);
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.8), rgba(15, 15, 25, 0.7));
		border: 2px solid rgba(0, 255, 255, 0.3);
		border-radius: var(--dc-default-border-radius);
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.2),
			inset 0 0 20px rgba(0, 255, 255, 0.05);
		min-height: 180px;
		text-align: center;
	}

	.choice-card:hover,
	.choice-card:focus {
		background: linear-gradient(135deg, rgba(20, 20, 35, 0.9), rgba(25, 25, 40, 0.8));
		border-color: var(--color-neon-cyan);
		transform: translateY(-4px);
		box-shadow:
			0 0 30px rgba(0, 255, 255, 0.4),
			0 0 60px rgba(0, 255, 255, 0.2),
			inset 0 0 30px rgba(0, 255, 255, 0.1);
	}

	.choice-card:active {
		transform: translateY(-2px);
	}

	/* Skip Once variant */
	.skip-card {
		border-color: rgba(217, 70, 239, 0.3);
		box-shadow:
			0 0 20px rgba(217, 70, 239, 0.2),
			inset 0 0 20px rgba(217, 70, 239, 0.05);
	}

	.skip-card:hover,
	.skip-card:focus {
		border-color: var(--color-cyber-magenta);
		box-shadow:
			0 0 30px rgba(217, 70, 239, 0.4),
			0 0 60px rgba(217, 70, 239, 0.2),
			inset 0 0 30px rgba(217, 70, 239, 0.1);
	}

	/* Skip Always variant */
	.skip-always-card {
		border-color: rgba(255, 215, 0, 0.3);
		box-shadow:
			0 0 20px rgba(255, 215, 0, 0.2),
			inset 0 0 20px rgba(255, 215, 0, 0.05);
	}

	.skip-always-card:hover,
	.skip-always-card:focus {
		border-color: var(--color-brand-yellow);
		box-shadow:
			0 0 30px rgba(255, 215, 0, 0.4),
			0 0 60px rgba(255, 215, 0, 0.2),
			inset 0 0 30px rgba(255, 215, 0, 0.1);
	}

	/* Icon variants */
	.icon-wrapper {
		color: var(--color-neon-cyan);
		filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.6));
	}

	.skip-icon {
		color: var(--color-cyber-magenta);
		filter: drop-shadow(0 0 10px rgba(217, 70, 239, 0.6));
	}

	.skip-always-icon {
		color: var(--color-brand-yellow);
		filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
	}

	/* Typography */
	h3 {
		font-size: var(--text-xl);
		font-weight: 600;
		color: white;
		margin: 0;
	}

	p {
		font-size: var(--text-base);
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.5;
		margin: 0;
	}

	.recommendation {
		font-size: var(--text-sm);
		color: var(--color-neon-cyan);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: var(--space-xs);
	}

	.skip-recommendation {
		color: var(--color-cyber-magenta);
	}

	.skip-always-recommendation {
		color: var(--color-brand-yellow);
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.choice-card {
			padding: var(--space-lg);
			min-height: 160px;
		}

		.icon-wrapper :global(svg) {
			width: 36px;
			height: 36px;
		}

		h3 {
			font-size: var(--text-lg);
		}

		p {
			font-size: var(--text-sm);
		}
	}

	@media (max-width: 450px) {
		.choice-card {
			padding: var(--space-md);
			min-height: 140px;
		}

		.icon-wrapper :global(svg) {
			width: 32px;
			height: 32px;
		}
	}

	/* Accessibility - Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.choice-card {
			transition: none !important;
		}

		.choice-card:hover,
		.choice-card:focus {
			transform: none;
		}
	}
</style>
