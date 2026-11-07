<script>
	/**
	 * Toast - one short status line over the page, bottom centre. The live region stays mounted
	 * so screen readers hear each new message; the parent clears the message after a few seconds.
	 *
	 * @prop {string} message Text to show; empty hides the toast
	 */
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '../../constants/animations.js';

	let { message = '' } = $props();

	const motion = () => ({
		y: 8,
		duration: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
			? 0
			: ANIMATION_DURATION.NORMAL,
		easing: cubicOut
	});
</script>

<div class="toast-region" role="status" aria-live="polite">
	{#if message}
		<div class="home-toast" transition:fly={motion()}>{message}</div>
	{/if}
</div>

<style>
	.toast-region {
		position: fixed;
		left: 50%;
		bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
		z-index: 2000;
		transform: translateX(-50%);
		width: max-content;
		max-width: calc(100vw - 2 * var(--space-md));
		pointer-events: none;
	}

	.home-toast {
		padding: 12px var(--space-lg);
		background: rgba(8, 12, 22, 0.96);
		border: 1px solid rgba(0, 255, 255, 0.55);
		border-radius: 4px;
		box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55);
		font-family: var(--font-body);
		font-size: 0.9375rem;
		font-weight: 500;
		color: #e2e9f2;
		text-align: center;
	}
</style>
