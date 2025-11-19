<script>
/**
 * CardTypeInfo - Card type information badge
 *
 * Displays information about card types in the Wretched and Alone system.
 * Shows type name, icon, and optional description.
 *
 * @component
 * @example
 * <CardTypeInfo type="primary-success" showDescription={true} />
 * <CardTypeInfo type="challenge" variant="compact" />
 */

import { fade } from 'svelte/transition';
import { ANIMATION_DURATION } from '$lib/constants/animations.js';

let {
	/** Card type: 'primary-success' | 'failure-counter' | 'narrative' | 'challenge' | 'event' */
	type,
	/** Variant: 'full' | 'compact' | 'badge' */
	variant = 'full',
	/** Show description text */
	showDescription = false,
	/** Optional CSS class for container */
	class: className = ''
} = $props();

// Card type metadata
const typeInfo = {
	'primary-success': {
		name: 'Primary Success',
		shortName: 'Salvation',
		icon: '♥',
		color: '#e74c3c',
		description: 'Ace of Hearts - Unlocks Salvation checks. Win condition.'
	},
	'failure-counter': {
		name: 'Failure Counter',
		shortName: 'King',
		icon: '👑',
		color: '#8e44ad',
		description: 'All 4 Kings - Revealing all 4 triggers instant game over.'
	},
	narrative: {
		name: 'Narrative',
		shortName: 'Ability',
		icon: '✨',
		color: '#3498db',
		description: 'Remaining 3 Aces - Reflective moments and abilities.'
	},
	challenge: {
		name: 'Challenge',
		shortName: 'Challenge',
		icon: '⚡',
		color: '#f39c12',
		description: 'Odd cards (3,5,7,9) - Usually trigger Stability checks.'
	},
	event: {
		name: 'Event',
		shortName: 'Event',
		icon: '🌟',
		color: '#2ecc71',
		description: 'Even cards (2,4,6,8,10,J,Q) - Usually safe from checks.'
	}
};

const info = $derived(typeInfo[type] || typeInfo.event);
const displayName = $derived(variant === 'compact' ? info.shortName : info.name);
</script>

{#if variant === 'badge'}
	<span
		class="card-type-badge {className}"
		style="--type-color: {info.color}"
		title={info.description}
		in:fade={{ duration: ANIMATION_DURATION.FAST }}
	>
		<span class="badge-icon">{info.icon}</span>
		<span class="badge-name">{info.shortName}</span>
	</span>
{:else}
	<div
		class="card-type-info {variant} {className}"
		style="--type-color: {info.color}"
		in:fade={{ duration: ANIMATION_DURATION.NORMAL }}
	>
		<div class="type-header">
			<span class="type-icon">{info.icon}</span>
			<span class="type-name">{displayName}</span>
		</div>

		{#if showDescription && variant === 'full'}
			<p class="type-description">{info.description}</p>
		{/if}
	</div>
{/if}

<style>
	/* Badge variant */
	.card-type-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs, 0.25rem);
		padding: 0.25rem 0.5rem;
		background: var(--type-color);
		color: #ffffff;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.badge-icon {
		font-size: 0.875rem;
	}

	/* Full/Compact variants */
	.card-type-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs, 0.25rem);
	}

	.type-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm, 0.5rem);
	}

	.type-icon {
		font-size: 1.5rem;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.type-name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--type-color);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.card-type-info.compact .type-icon {
		font-size: 1.25rem;
	}

	.card-type-info.compact .type-name {
		font-size: 0.875rem;
	}

	.type-description {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-secondary, #a0a0a0);
		line-height: 1.5;
		padding-left: calc(1.5rem + var(--space-sm, 0.5rem));
	}
</style>
