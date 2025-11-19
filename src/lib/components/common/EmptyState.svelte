<script>
/**
 * EmptyState - Reusable empty state component
 *
 * Displays a centered message when there's no data to show.
 * Used across the application for consistent empty state UX.
 *
 * @component
 * @example
 * <EmptyState
 *   icon="📭"
 *   title="No games found"
 *   description="Start a new game to begin your journey"
 *   actionText="Start Game"
 *   onAction={() => startGame()}
 * />
 */

import { fade } from 'svelte/transition';
import { ANIMATION_DURATION, ANIMATION_EASING } from '$lib/constants/animations.js';

let {
	/** Icon or emoji to display */
	icon = '📭',
	/** Main title text */
	title = 'Nothing here',
	/** Optional description text */
	description = null,
	/** Optional action button text */
	actionText = null,
	/** Optional action button handler */
	onAction = null,
	/** Optional CSS class for container */
	class: className = ''
} = $props();
</script>

<div
	class="empty-state {className}"
	in:fade={{ duration: ANIMATION_DURATION.NORMAL, easing: ANIMATION_EASING.EASE_OUT }}
>
	{#if icon}
		<div class="empty-state-icon">{icon}</div>
	{/if}

	<h2 class="empty-state-title">{title}</h2>

	{#if description}
		<p class="empty-state-description">{description}</p>
	{/if}

	{#if actionText && onAction}
		<button class="empty-state-action" onclick={onAction}>
			{actionText}
		</button>
	{/if}
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-xl, 2rem);
		text-align: center;
		min-height: 300px;
	}

	.empty-state-icon {
		font-size: 4rem;
		margin-bottom: var(--space-md, 1rem);
		opacity: 0.6;
	}

	.empty-state-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 var(--space-sm, 0.5rem) 0;
		color: var(--text-primary, #e0e0e0);
	}

	.empty-state-description {
		font-size: 1rem;
		margin: 0 0 var(--space-lg, 1.5rem) 0;
		color: var(--text-secondary, #a0a0a0);
		max-width: 400px;
	}

	.empty-state-action {
		background: var(--primary-color, #4a9eff);
		color: var(--text-on-primary, #ffffff);
		border: none;
		border-radius: 8px;
		padding: var(--space-sm, 0.5rem) var(--space-lg, 1.5rem);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 150ms cubic-bezier(0.4, 0, 0.6, 1);
	}

	.empty-state-action:hover {
		background: var(--primary-color-hover, #3a8eef);
		transform: translateY(-1px);
	}

	.empty-state-action:active {
		transform: translateY(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.empty-state-action {
			transition: none;
		}

		.empty-state-action:hover {
			transform: none;
		}
	}
</style>
