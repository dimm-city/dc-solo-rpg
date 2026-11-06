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
	// 	/** Keyboard shortcut shown as a key-cap inside the button on pointer devices, e.g. "Space" */
	// 	hint?: string;
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
		hint = undefined,
		children = undefined
	} = $props();
</script>

<!-- Wrapper provides outer glow layer that follows clipped shape -->
<div class="aug-button-wrapper {variant} {className}">
	{#if href}
		<!-- href is a caller-supplied URL (internal or external), so it cannot be passed through resolve() -->
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
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
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
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
			{#if hint}
				<!-- Decorative: the accessible name stays the label; shown on pointer devices only -->
				<kbd class="key-hint" aria-hidden="true">{hint}</kbd>
			{/if}
		</button>
	{/if}
</div>

<style>
	/* ============================================
	   WRAPPER - outer glow that follows the clipped shape (static: no loops)
	   ============================================ */

	.aug-button-wrapper {
		margin: 0 auto;
		width: fit-content;
		/* Desktop: never stretch the CTA across the whole screen (phones are narrower than the cap) */
		max-width: min(100%, var(--cta-max, 480px));
		display: block;
		position: relative;

		/* Drop-shadow follows the clip-path of the child element */
		filter: var(--glow-cta-secondary);
		transition: filter var(--dur-state, 120ms) var(--ease-enter, ease-out);
	}

	.aug-button-wrapper.primary {
		filter: var(--glow-cta-primary);
	}

	.aug-button-wrapper:hover {
		filter: var(--glow-cta-secondary-hover);
	}

	.aug-button-wrapper.primary:hover {
		filter: var(--glow-cta-primary-hover);
	}

	/* Atmospheric glow behind the button: a fixed soft halo, never animated */
	.aug-button-wrapper::before {
		content: '';
		position: absolute;
		inset: -32px;
		background: var(--aug-atmosphere-secondary);
		opacity: 0.5;
		z-index: -1;
		pointer-events: none;
	}

	.aug-button-wrapper.primary::before {
		background: var(--aug-atmosphere-primary);
		inset: -36px;
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

		/* Layout & Typography: the UI face (Inter 600, uppercase, 0.08em) */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.75em;
		padding: 0.75rem;
		font-family: var(--font-ui, var(--font-body, sans-serif));
		font-size: 1.125rem;
		font-weight: var(--font-ui-weight, 600);
		line-height: 1.2;
		text-transform: uppercase;
		letter-spacing: var(--tracking-ui, 0.08em);
		color: var(--color-brand-yellow);
		text-decoration: none;

		/* Background & Visual Treatment */
		/* Deep magenta to violet: yellow text on it measures 5.4:1+ (WCAG AA) */
		background: linear-gradient(135deg, #831d98, #6d22c7);
		border: none;
		cursor: pointer;

		/* Inner glow (static) */
		box-shadow:
			inset 0 0 8px rgba(255, 215, 0, 0.05),
			0 0 8px rgba(0, 255, 255, 0.15);

		/* State changes (hover, press, focus) use the 120ms token */
		transition:
			transform var(--dur-state, 120ms) var(--ease-enter, ease-out),
			box-shadow var(--dur-state, 120ms) var(--ease-enter, ease-out),
			filter var(--dur-state, 120ms) var(--ease-enter, ease-out);

		/* Position relative for stacking context */
		position: relative;

		/* Remove default button styling */
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
	}
	.aug-button.large {
		padding: 1.25rem 3rem;
	}
	/* Disabled state for buttons */
	.aug-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		filter: grayscale(0.5);
		pointer-events: none;
	}

	/* Primary variant: a fixed yellow-to-magenta gradient and a static glow */
	.aug-button.primary {
		background: linear-gradient(135deg, var(--color-brand-yellow), var(--color-cyber-magenta));
		box-shadow:
			inset 0 0 12px rgba(255, 215, 0, 0.2),
			0 0 16px rgba(255, 215, 0, 0.25),
			0 0 24px rgba(217, 70, 239, 0.2);

		/* Color override for better contrast on gradient */
		color: var(--color-bg-primary);
	}

	/* Hover: brighter, with a warmer border */
	.aug-button:hover {
		filter: brightness(1.08);
		box-shadow:
			inset 0 0 12px rgba(255, 215, 0, 0.1),
			0 0 12px rgba(0, 255, 255, 0.25);
		--aug-border-bg: linear-gradient(135deg, #ffd700, #00ffff);
	}

	.aug-button.primary:hover {
		transform: translateY(-2px);
	}

	/* Press */
	.aug-button:active {
		transform: translateY(1px);
		filter: brightness(1.12);
	}

	/* Focus: keyboard focus only. The button is clip-pathed, so an outline would be cut off.
	   Instead the augmented-ui border turns 3px white and an inner glow lights the inside of
	   the frame (both inside the clip), with a cyan halo on the unclipped wrapper. */
	.aug-button:focus {
		outline: none;
	}

	.aug-button:focus-visible {
		--aug-border-all: 3px;
		--aug-border-bg: #ffffff;
		box-shadow:
			inset 0 0 0 2px rgba(255, 255, 255, 0.35),
			inset 0 0 18px rgba(255, 255, 255, 0.45);
	}

	.aug-button-wrapper:has(.aug-button:focus-visible),
	.aug-button-wrapper.primary:has(.aug-button:focus-visible) {
		filter: drop-shadow(0 0 3px var(--color-neon-cyan)) drop-shadow(0 0 12px var(--color-neon-cyan));
	}

	/* ============================================
	   KEY-CAP HINT - "Space" inside the button, pointer devices only
	   ============================================ */

	.key-hint {
		display: none;
		flex: none;
		padding: 0.15em 0.45em;
		border: 1px solid currentColor;
		border-radius: 4px;
		font-family: var(--font-ui, var(--font-body, sans-serif));
		font-size: 0.6875rem; /* 11px */
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		opacity: 0.75;
		background: rgba(0, 0, 0, 0.18);
	}

	@media (hover: hover) and (pointer: fine) {
		.key-hint {
			display: inline-block;
		}
	}

	/* ============================================
	   RESPONSIVE & ACCESSIBILITY
	   ============================================ */

	@media (max-width: 768px) {
		.aug-button-wrapper {
			/* Lighter glow on phones */
			filter: drop-shadow(0 0 6px rgba(217, 70, 239, 0.3))
				drop-shadow(0 0 12px rgba(217, 70, 239, 0.2));
		}

		.aug-button-wrapper::before {
			inset: -16px;
		}

		.aug-button-wrapper.primary::before {
			inset: -20px;
		}

		.aug-button {
			padding: 0.75rem 1.5rem;
			font-size: 1rem;
		}
	}

	/* Reduced motion: no movement on hover or press */
	@media (prefers-reduced-motion: reduce) {
		.aug-button-wrapper,
		.aug-button {
			transition: none;
		}
		.aug-button:hover,
		.aug-button.primary:hover,
		.aug-button:active {
			transform: none;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.aug-button {
			outline: 2px solid currentColor;
		}
	}
</style>
