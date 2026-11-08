<script>
	/**
	 * Toast - one short line over the page, bottom centre. Both live regions stay mounted so
	 * screen readers hear each new message.
	 * - A status ("Save deleted") is polite and clears itself after a few seconds (the parent's
	 *   timer).
	 * - An error is an alert: it stays at least 10 seconds (the parent's timer) and can be
	 *   dismissed.
	 *
	 * @prop {string} message Text to show; empty hides the toast
	 * @prop {'status'|'error'} [tone] An error is announced at once and can be dismissed
	 * @prop {() => void} [ondismiss] Called by the error's dismiss button
	 */
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '../../constants/animations.js';

	let { message = '', tone = 'status', ondismiss = () => {} } = $props();

	const isError = $derived(tone === 'error');

	const motion = () => ({
		y: 8,
		duration: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
			? 0
			: ANIMATION_DURATION.NORMAL,
		easing: cubicOut
	});
</script>

<div class="toast-region" role="status" aria-live="polite">
	{#if message && !isError}
		<div class="home-toast" data-testid="home-toast" transition:fly={motion()}>{message}</div>
	{/if}
</div>

<div class="toast-region" role="alert">
	{#if message && isError}
		<div class="home-toast error" data-testid="home-toast" transition:fly={motion()}>
			<span class="toast-text">{message}</span>
			<button type="button" class="toast-dismiss" aria-label="Dismiss" onclick={ondismiss}>
				<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</button>
		</div>
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
		font-size: 0.875rem;
		font-weight: 400;
		line-height: 1.45;
		color: #e2e9f2;
		text-align: center;
		text-wrap: pretty;
	}

	/* An error: the danger edge, text left-aligned beside its dismiss button */
	.home-toast.error {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding-right: var(--space-xs);
		border-color: var(--color-danger, #ff4d6d);
		text-align: left;
		pointer-events: auto;
	}

	.toast-text {
		flex: 1 1 auto;
		min-width: 0;
	}

	.toast-dismiss {
		flex: none;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		padding: 0;
		background: none;
		border: none;
		border-radius: 4px;
		color: #e2e9f2;
		cursor: pointer;
	}

	.toast-dismiss svg {
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
	}

	.toast-dismiss:hover {
		color: #fff;
	}

	.toast-dismiss:focus-visible {
		outline: 3px solid var(--color-neon-cyan);
		outline-offset: -3px;
	}
</style>
