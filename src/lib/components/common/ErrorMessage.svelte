<script>
/**
 * ErrorMessage - Reusable error message component
 *
 * Displays error messages with consistent styling and optional retry action.
 * Supports different severity levels (error, warning, info).
 *
 * @component
 * @example
 * <ErrorMessage
 *   title="Failed to load game"
 *   message="The game file could not be found"
 *   severity="error"
 *   onRetry={() => loadGame()}
 * />
 */

import { fade, scale } from 'svelte/transition';
import { ANIMATION_DURATION, ANIMATION_EASING } from '$lib/constants/animations.js';

let {
	/** Error title */
	title = 'Error',
	/** Error message/description */
	message,
	/** Severity level: 'error' | 'warning' | 'info' */
	severity = 'error',
	/** Optional retry button text */
	retryText = 'Retry',
	/** Optional retry handler */
	onRetry = null,
	/** Optional dismiss handler */
	onDismiss = null,
	/** Optional CSS class for container */
	class: className = ''
} = $props();

// Severity icons
const icons = {
	error: '⚠️',
	warning: '⚠️',
	info: 'ℹ️'
};

const icon = $derived(icons[severity] || icons.error);
</script>

<div
	class="error-message {severity} {className}"
	role="alert"
	aria-live="assertive"
	in:scale={{ duration: ANIMATION_DURATION.NORMAL, easing: ANIMATION_EASING.EASE_OUT, start: 0.95 }}
	out:fade={{ duration: ANIMATION_DURATION.FAST }}
>
	<div class="error-content">
		<div class="error-icon">{icon}</div>

		<div class="error-text">
			<h3 class="error-title">{title}</h3>
			<p class="error-message-text">{message}</p>
		</div>

		{#if onDismiss}
			<button class="error-dismiss" onclick={onDismiss} aria-label="Dismiss error">
				×
			</button>
		{/if}
	</div>

	{#if onRetry}
		<div class="error-actions">
			<button class="error-retry" onclick={onRetry}>
				{retryText}
			</button>
		</div>
	{/if}
</div>

<style>
	.error-message {
		background: var(--error-bg, rgba(220, 53, 69, 0.1));
		border: 1px solid var(--error-border, rgba(220, 53, 69, 0.3));
		border-radius: 8px;
		padding: var(--space-md, 1rem);
		margin: var(--space-md, 1rem) 0;
		max-width: 600px;
	}

	.error-message.warning {
		background: var(--warning-bg, rgba(255, 193, 7, 0.1));
		border-color: var(--warning-border, rgba(255, 193, 7, 0.3));
	}

	.error-message.info {
		background: var(--info-bg, rgba(74, 158, 255, 0.1));
		border-color: var(--info-border, rgba(74, 158, 255, 0.3));
	}

	.error-content {
		display: flex;
		align-items: flex-start;
		gap: var(--space-sm, 0.5rem);
		position: relative;
	}

	.error-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.error-text {
		flex: 1;
		min-width: 0;
	}

	.error-title {
		margin: 0 0 var(--space-xs, 0.25rem) 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--error-color, #dc3545);
	}

	.error-message.warning .error-title {
		color: var(--warning-color, #ffc107);
	}

	.error-message.info .error-title {
		color: var(--info-color, #4a9eff);
	}

	.error-message-text {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-secondary, #a0a0a0);
		line-height: 1.5;
	}

	.error-dismiss {
		background: none;
		border: none;
		color: var(--text-secondary, #a0a0a0);
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 150ms cubic-bezier(0.4, 0, 0.6, 1);
		flex-shrink: 0;
	}

	.error-dismiss:hover {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-primary, #e0e0e0);
	}

	.error-actions {
		margin-top: var(--space-md, 1rem);
		padding-top: var(--space-md, 1rem);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		gap: var(--space-sm, 0.5rem);
	}

	.error-retry {
		background: var(--primary-color, #4a9eff);
		color: var(--text-on-primary, #ffffff);
		border: none;
		border-radius: 6px;
		padding: var(--space-xs, 0.25rem) var(--space-md, 1rem);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 150ms cubic-bezier(0.4, 0, 0.6, 1);
	}

	.error-retry:hover {
		background: var(--primary-color-hover, #3a8eef);
	}

	.error-retry:active {
		transform: scale(0.98);
	}

	@media (prefers-reduced-motion: reduce) {
		.error-dismiss,
		.error-retry {
			transition: none;
		}

		.error-retry:active {
			transform: none;
		}
	}
</style>
