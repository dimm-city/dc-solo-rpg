<script>
	/**
	 * RuleCaption - shows the current one-time rule caption, docked above the step button,
	 * beside the action it explains (design polish DP-1-09). GameScreen renders it inside the
	 * step anchor; it is placed absolutely above it, so it never covers the text column, the
	 * hint line or the button, and its arrival moves nothing.
	 *
	 * `captions` is the useRuleCaptions() instance owned by GameScreen, which also announces
	 * each caption through the game's single live region (after the result line), so this
	 * region is not live itself. A covered caption is hidden; its countdown is paused. A tap or
	 * Escape dismisses it.
	 *
	 * Its frame is the readout's (visual-layout-s-04): chamfered top-left and bottom-right
	 * corners, a 1px border at the readout's 55% gradient and the same fill, so this secondary
	 * help never outranks the readout. In the landscape action column it is the step button's
	 * width.
	 */
	import { fade } from 'svelte/transition';
	import { ANIMATION_DURATION } from '../constants/animations.js';

	let { captions } = $props();
	const reduceMotion =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

	function onKeydown(event) {
		if (event.key === 'Escape' && captions.current) captions.dismiss();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#key captions.current?.id}
	{#if captions.current && !captions.paused}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="rule-caption"
			data-testid="rule-caption"
			transition:fade={{ duration: reduceMotion ? 0 : ANIMATION_DURATION.NORMAL }}
			onclick={(event) => {
				event.stopPropagation();
				captions.dismiss();
			}}
		>
			<span class="rule-frame" data-augmented-ui="tl-clip br-clip border" aria-hidden="true"></span>
			<span class="rule-label">Rule</span>
			<span class="rule-text">{captions.current.text}</span>
		</div>
	{/if}
{/key}

<style>
	/* Docked 12px above the step anchor (the hint line and the button), centred on it */
	.rule-caption {
		position: absolute;
		bottom: calc(100% + 12px);
		left: 0;
		right: 0;
		z-index: 2;
		isolation: isolate;
		box-sizing: border-box;
		width: min(100%, 420px);
		margin-inline: auto;
		display: flex;
		align-items: baseline;
		gap: 10px;
		padding: 8px 12px;
		text-align: left;
		pointer-events: auto;
		cursor: pointer;
		color: var(--color-text, #f2f2fa);
		font-family: var(--font-body, 'Inter', system-ui, sans-serif);
		font-size: 0.875rem;
		line-height: 1.4;
	}

	/* The readout's frame (ContextBackground .readout-frame), behind the text */
	.rule-frame {
		--aug-border-all: 1px;
		--aug-border-bg: linear-gradient(135deg, rgba(0, 255, 255, 0.55), rgba(217, 70, 239, 0.55));
		--aug-tl: 8px;
		--aug-br: 8px;
		position: absolute;
		inset: 0;
		z-index: -1;
		display: block;
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.9), rgba(15, 15, 25, 0.85));
	}

	.rule-text {
		text-wrap: balance;
	}

	.rule-label {
		flex: none;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-neon-cyan, #0ff);
	}

	/* Landscape phones: the width of the action column, edge to edge with the step button */
	@media (max-height: 500px) and (orientation: landscape) {
		.rule-caption {
			width: 100%;
		}
	}
</style>
