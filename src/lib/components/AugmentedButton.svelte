<script>
	/**
	 * AugmentedButton - Reusable CTA button with augmented-ui styling and enhanced outer glow
	 * Supports primary (hero CTA) and secondary (campaign status) variants
	 * Renders as <a> if href is provided, otherwise renders as <button>
	 */
	// interface AugmentedButtonProps {
	// 	/** Button text content */
	// 	text: string;
	// 	/** Link URL (if provided, renders as <a>, otherwise renders as <button>) */
	// 	href?: string;
	// 	/** Visual variant: primary for hero CTAs, secondary for other CTAs */
	// 	variant?: 'primary' | 'secondary';
	// 	/** Optional click handler */
	// 	onclick?: (event: MouseEvent) => void;
	// 	/** Link target (default: _blank) - only used if href is provided */
	// 	target?: string;
	// 	/** Link rel attribute (default: noopener noreferrer) - only used if href is provided */
	// 	rel?: string;
	// 	/** Accessible label (falls back to text) */
	// 	ariaLabel?: string;
	// 	/** Custom CSS class for additional styling */
	// 	class?: string;
	// 	/** Disabled state - only used for button element */
	// 	disabled?: boolean;
	// 	/** Button type - only used for button element */
	// 	type?: 'button' | 'submit' | 'reset';
	// 	/** Data test ID for testing */
	// 	testid?: string;
	// }

	let {
		text,
		href = undefined,
		variant = 'secondary',
		onclick,
		target = '_blank',
		rel = 'noopener noreferrer',
		ariaLabel,
		class: className = '',
		disabled = false,
		type = 'button',
		testid = undefined,
		children = undefined
	} = $props();
</script>

<!-- Wrapper provides outer glow layer that follows clipped shape -->
<div class="aug-button-wrapper {variant} {className}">
	{#if href}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a
			{href}
			class="aug-button {variant}"
			data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
			{onclick}
			{target}
			{rel}
			aria-label={ariaLabel || text}
			data-testid={testid}
		>
			{#if children}
				{@render children()}
			{:else}
				{text}
			{/if}
		</a>
	{:else}
		<button
			class="aug-button {variant}"
			data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
			{onclick}
			{disabled}
			{type}
			aria-label={ariaLabel || text}
			data-testid={testid}
		>
			{#if children}
				{@render children()}
			{:else}
				{text}
			{/if}
		</button>
	{/if}
</div>

<style>
	/* ============================================
	   WRAPPER - Provides outer glow via drop-shadow
	   ============================================ */

	.aug-button-wrapper {
		margin: 0 auto;
		width: fit-content;
		display: block;
		position: relative;

		/* Drop-shadow follows the clip-path of the child element */
		filter: var(--glow-cta-secondary);
		transition: filter var(--transition-base);

		/* Performance optimization */
		will-change: filter;
	}

	.aug-button-wrapper.primary {
		filter: var(--glow-cta-primary);
	}

	.aug-button-wrapper.secondary {
		filter: var(--glow-cta-secondary);
	}

	.aug-button-wrapper:hover {
		filter: var(--glow-cta-secondary-hover);
	}

	.aug-button-wrapper.primary:hover {
		filter: var(--glow-cta-primary-hover);
	}

	/* Atmospheric glow background - creates volumetric lighting effect */
	.aug-button-wrapper::before {
		content: '';
		position: absolute;
		inset: -40px;
		background: var(--aug-atmosphere-secondary);
		z-index: -1;
		pointer-events: none;
		animation: atmospheric-pulse 3s ease-in-out infinite;
	}

	.aug-button-wrapper.primary::before {
		background: var(--aug-atmosphere-primary);
	}

	@keyframes atmospheric-pulse {
		0%,
		100% {
			opacity: 0.4;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(1.03);
		}
	}

	/* ============================================
	   BUTTON - The actual augmented-ui element
	   ============================================ */

	.aug-button {
		/* Augmented-UI Custom Properties - defaults for secondary */
		--aug-border-all: var(--aug-border-default);
		--aug-border-bg: linear-gradient(135deg, #d946ef, #00ffff);
		--aug-tl: var(--aug-clip-lg);
		--aug-tr: var(--aug-clip-lg);
		--aug-br: var(--aug-clip-lg);
		--aug-bl: var(--aug-clip-lg);

		/* Layout & Typography - defaults for secondary */
		display: inline-block;
	padding: .75rem;
		font-size: 1.25rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
		color: var(--color-brand-yellow);
		text-decoration: none;

		/* Background & Visual Treatment */
		background: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-cyber-magenta-alt));
		border: none;
		cursor: pointer;

		/* Inner glow (box-shadow still useful for layering) */
		box-shadow:
			inset 0 0 8px rgba(255, 215, 0, 0.05),
			0 0 8px rgba(0, 255, 255, 0.15);

		/* Transitions */
		transition:
			transform var(--transition-base),
			box-shadow var(--transition-base),
			filter var(--transition-base),
			--aug-border-bg var(--transition-base);

		/* Position relative for stacking context */
		position: relative;

		/* Remove default button styling */
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
	}
.aug-button.large{
		padding: 1.25rem 3rem;
}
	/* Disabled state for buttons */
	.aug-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		filter: grayscale(0.5);
		pointer-events: none;
	}

	/* Primary variant - DRAMATICALLY larger and more prominent (hero CTA) */
	.aug-button.primary {
		--aug-border-all: var(--aug-border-thin);
		--aug-tl: var(--aug-clip-md);
		--aug-tr: var(--aug-clip-md);
		--aug-br: var(--aug-clip-md);
		--aug-bl: var(--aug-clip-md);

		padding: 1.75rem 4.5rem;
		font-size: 1.75rem;
		font-weight: 900;

		/* Animated gradient background - Yellow to Magenta pulsing */
		background: linear-gradient(
			135deg,
			var(--color-brand-yellow),
			var(--color-cyber-magenta),
			var(--color-brand-yellow)
		);
		background-size: 200% 200%;
		animation: gradient-shift 3s ease-in-out infinite;

		/* Enhanced glow animation */
		animation:
			gradient-shift 3s ease-in-out infinite,
			primary-glow-pulse 2s ease-in-out infinite;
		will-change: background-position, box-shadow;

		/* Color override for better contrast on gradient */
		color: var(--color-bg-primary);
	}

	/* Gradient animation - smooth shifting background */
	@keyframes gradient-shift {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	/* Pulsing glow animation for primary CTA */
	@keyframes primary-glow-pulse {
		0%,
		100% {
			box-shadow:
				inset 0 0 10px rgba(255, 215, 0, 0.15),
				0 0 12px rgba(255, 215, 0, 0.2),
				0 0 20px rgba(217, 70, 239, 0.15);
		}
		50% {
			box-shadow:
				inset 0 0 15px rgba(255, 215, 0, 0.25),
				0 0 20px rgba(255, 215, 0, 0.3),
				0 0 30px rgba(217, 70, 239, 0.25);
		}
	}

	/* Hover state */
	.aug-button:hover {
		/* Enhance brightness and lift button */
		filter: brightness(1.15);
		/* transform: translateY(-3px); */

		/* Enhance inner glow on hover */
		box-shadow:
			inset 0 0 12px rgba(255, 215, 0, 0.1),
			0 0 12px rgba(0, 255, 255, 0.25);

		/* Shift border to yellow-cyan gradient */
		--aug-border-bg: linear-gradient(135deg, #ffd700, #00ffff);
	}

	.aug-button.primary:hover {
		transform: translateY(-2px);
	}

	/* Focus state */
	.aug-button:focus {
		/* Focus ring outside the glow effects */
		outline: 3px solid var(--color-brand-yellow);
		outline-offset: 8px;
	}

	.aug-button.primary:focus {
		outline: 2px solid var(--color-brand-yellow);
		outline-offset: 6px;
	}

	/* Active state - pressed feeling */
	.aug-button:active {
		transform: translateY(-1px);
		filter: brightness(1.1);
	}

	/* ============================================
	   RESPONSIVE & ACCESSIBILITY
	   ============================================ */

	@media (max-width: 768px) {
		.aug-button-wrapper {
			/* Reduce glow intensity on mobile for battery performance */
			filter: drop-shadow(0 0 6px rgba(217, 70, 239, 0.3))
				drop-shadow(0 0 12px rgba(217, 70, 239, 0.2));
		}

		.aug-button-wrapper::before {
			/* Reduce atmospheric glow on mobile */
			inset: -20px;
			animation: none; /* Disable animation on mobile */
		}

		.aug-button {
			padding: 0.875rem 2rem;
			font-size: 1rem;
		}

		.aug-button.primary {
			/* Still prominent on mobile, but scaled down */
			padding: 1.25rem 3rem;
			font-size: 1.25rem;
		}
	}

	/* Reduced motion accessibility */
	@media (prefers-reduced-motion: reduce) {
		.aug-button-wrapper,
		.aug-button-wrapper::before,
		.aug-button,
		.aug-button.primary {
			animation: none !important;
			transition-duration: 0.01ms !important;
		}

		/* Provide static gradient for primary when animations are disabled */
		.aug-button.primary {
			background: linear-gradient(135deg, var(--color-brand-yellow), var(--color-cyber-magenta));
			background-size: 100% 100%;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.aug-button {
			outline: 2px solid currentColor;
		}
	}
</style>
