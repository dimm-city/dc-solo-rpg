<script>
/**
 * LoadingSpinner - Reusable loading indicator
 *
 * Displays a spinning loader with optional text.
 * Uses mechanical easing for smooth, controlled rotation.
 *
 * @component
 * @example
 * <LoadingSpinner size="large" text="Loading game..." />
 * <LoadingSpinner size="small" />
 */

import { fade } from 'svelte/transition';
import { ANIMATION_DURATION, ANIMATION_EASING } from '$lib/constants/animations.js';

let {
	/** Size variant: 'small' | 'medium' | 'large' */
	size = 'medium',
	/** Optional loading text */
	text = null,
	/** Optional CSS class for container */
	class: className = ''
} = $props();

// Size mappings (in pixels)
const sizes = {
	small: 24,
	medium: 48,
	large: 72
};

const spinnerSize = $derived(sizes[size] || sizes.medium);
</script>

<div
	class="loading-spinner {className}"
	in:fade={{ duration: ANIMATION_DURATION.FAST, easing: ANIMATION_EASING.EASE_OUT }}
>
	<svg
		class="spinner"
		width={spinnerSize}
		height={spinnerSize}
		viewBox="0 0 50 50"
		xmlns="http://www.w3.org/2000/svg"
		aria-label="Loading"
		role="status"
	>
		<circle
			class="spinner-track"
			cx="25"
			cy="25"
			r="20"
			fill="none"
			stroke="currentColor"
			stroke-width="4"
		/>
		<circle
			class="spinner-head"
			cx="25"
			cy="25"
			r="20"
			fill="none"
			stroke="currentColor"
			stroke-width="4"
			stroke-linecap="round"
		/>
	</svg>

	{#if text}
		<p class="loading-text">{text}</p>
	{/if}
</div>

<style>
	.loading-spinner {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-md, 1rem);
		padding: var(--space-md, 1rem);
	}

	.spinner {
		color: var(--primary-color, #4a9eff);
	}

	.spinner-track {
		opacity: 0.15;
	}

	.spinner-head {
		stroke-dasharray: 80, 200;
		stroke-dashoffset: 0;
		animation: spinner-rotate 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
		transform-origin: center;
	}

	@keyframes spinner-rotate {
		0% {
			stroke-dasharray: 1, 200;
			stroke-dashoffset: 0;
			transform: rotate(0deg);
		}

		50% {
			stroke-dasharray: 100, 200;
			stroke-dashoffset: -15;
			transform: rotate(450deg);
		}

		100% {
			stroke-dasharray: 100, 200;
			stroke-dashoffset: -125;
			transform: rotate(1080deg);
		}
	}

	.loading-text {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-secondary, #a0a0a0);
		text-align: center;
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner-head {
			animation: spinner-rotate-reduced 2s linear infinite;
		}

		@keyframes spinner-rotate-reduced {
			0% {
				transform: rotate(0deg);
			}

			100% {
				transform: rotate(360deg);
			}
		}
	}
</style>
