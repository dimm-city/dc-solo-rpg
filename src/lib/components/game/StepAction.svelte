<script>
	/**
	 * StepAction - The one primary button of a round step, always in the same slot
	 *
	 * GameScreen mounts it once, outside the per-screen {#key} block: moving to the next
	 * step changes only its label (a 120ms crossfade), so the button never blinks out.
	 *
	 * The button is one fixed 48px frame with a one-line verb label (DP-1-05). Its text and its
	 * accessible name are the label alone.
	 *
	 * `hint` is the Lucid/Surreal modifier the roll will use ("Lucid · two dice, keep the
	 * higher"). It sits on its own line directly above the button, in the HUD's colour with the
	 * HUD's arrow. The line is always there (empty when there is no hint), so a hint appearing
	 * moves nothing; while it shows, the button is described by it.
	 *
	 * `changed` briefly highlights a button that has just changed meaning (GameScreen ignores
	 * presses for that moment, so a press meant for the old button never lands on the new one).
	 * `advancing` means the game is about to move on by itself (a result hold): a thin line along
	 * the bottom of the button runs out as `advanceProgress()` goes from 0 to 1. It follows the
	 * hold's own clock, so it stops while the hold is paused and never drifts from it. While the
	 * hold waits for the voice to finish reading the result (`advanceWaiting`), the line is full
	 * and dimmed: the countdown has not started.
	 *
	 * @component
	 */

	import { fade } from 'svelte/transition';
	import AugmentedButton from '../AugmentedButton.svelte';
	import ButtonBar from '../ButtonBar.svelte';
	import { ANIMATION_DURATION } from '../../constants/animations.js';

	let {
		text,
		hint = null,
		onclick,
		disabled = false,
		busy = false,
		changed = false,
		advancing = false,
		advanceProgress = () => 0,
		advancePaused = false,
		advanceWaiting = false,
		testid,
		id = undefined
	} = $props();

	/** The label swap: a 120ms state change (shorter than FAST), or instant under reduced motion */
	const LABEL_SWAP_MS = Math.min(120, ANIMATION_DURATION.FAST);
	const reduceMotion =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
	const swap = { duration: reduceMotion ? 0 : LABEL_SWAP_MS };

	/** Which modifier the hint names: its colour and its HUD arrow */
	const hintKind = $derived(hint ? (hint.startsWith('Surreal') ? 'surreal' : 'lucid') : null);
	const HINT_ID = 'step-hint';

	// The HUD's arrows (status/RollCell.svelte): up for Lucid, down for Surreal
	const ARROW = {
		lucid: 'M12 3.25 19.75 11h-4.9v9.75h-5.7V11H4.25z',
		surreal: 'M12 20.75 4.25 13h4.9V3.25h5.7V13h4.9z'
	};

	// The run-out line: what is left of the hold, read from its clock every frame. Under reduced
	// motion it steps down in quarters instead of gliding (like the card's auto-play hold line).
	let remaining = $state(1);
	$effect(() => {
		if (!advancing) return;
		let frame;
		const tick = () => {
			const progress = Math.min(1, Math.max(0, advanceProgress()));
			remaining = 1 - (reduceMotion ? Math.floor(progress * 4) / 4 : progress);
			frame = requestAnimationFrame(tick);
		};
		tick();
		return () => cancelAnimationFrame(frame);
	});
</script>

<div class="step-action" class:changed {id}>
	<!-- The modifier the roll will use: always a line, so it appearing moves nothing -->
	<p
		class="step-hint {hintKind ?? ''}"
		class:empty={!hint}
		id={HINT_ID}
		data-testid="roll-modifier"
		aria-hidden={hint ? undefined : 'true'}
	>
		{#if hint}
			<svg class="hint-arrow" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d={ARROW[hintKind]} />
			</svg>
			<span class="hint-text">{hint}</span>
		{:else}
			&nbsp;
		{/if}
	</p>
	<ButtonBar>
		<AugmentedButton
			{text}
			{onclick}
			{disabled}
			{testid}
			describedby={hint ? HINT_ID : undefined}
			class="step-button{busy ? ' busy' : ''}"
			hint="Space"
		>
			<span class="label-stack" aria-hidden="true">
				{#key text}
					<span class="label" in:fade={swap} out:fade={swap}>
						<span class="label-main">{text}</span>
					</span>
				{/key}
			</span>
			{#if advancing}
				<span
					class="advance-line"
					class:paused={advancePaused}
					class:waiting={advanceWaiting}
					style:transform="scaleX({remaining})"
					data-testid="step-advance"
					aria-hidden="true"
				></span>
			{/if}
		</AugmentedButton>
	</ButtonBar>
</div>

<style>
	.step-action {
		display: grid;
		justify-items: center;
		width: 100%;
	}

	/* The modifier line: its own reserved line above the button, sentence case, in the HUD's
	   colour for the modifier (14.5:1 and 8.3:1 on the table) */
	.step-hint {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		box-sizing: border-box;
		width: 100%;
		height: 20px;
		margin: 0 0 4px;
		padding-inline: var(--space-md, 16px);
		font-family: var(--font-body, 'Inter', system-ui, sans-serif);
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 20px;
		letter-spacing: 0.02em;
		text-transform: none;
		white-space: nowrap;
		color: #00ffaa;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.9);
		pointer-events: none;
	}

	.step-hint.surreal {
		color: #f07cff;
	}

	.step-hint.empty {
		visibility: hidden;
	}

	.hint-arrow {
		flex: none;
		width: 12px;
		height: 12px;
	}

	/* Old and new labels share one cell, so the swap is a crossfade with no layout jump */
	.label-stack {
		display: grid;
		place-items: center;
	}

	.label {
		grid-area: 1 / 1;
		display: grid;
		justify-items: center;
	}

	/* One line, always: every step label is a verb of 20 characters or fewer */
	.label-main {
		white-space: nowrap;
	}

	/* One fixed 48px frame at every width, the label centred in it */
	.step-action :global(.aug-button) {
		box-sizing: border-box;
		height: 48px;
		padding-block: 0;
	}

	/* The button has just changed meaning: a short highlight while presses are held off
	   (on the button itself, so the wrapper's glow filter is left alone) */
	.step-action.changed :global(.aug-button) {
		filter: brightness(1.4);
	}

	.step-action :global(.step-button.busy .aug-button) {
		cursor: progress;
	}

	/* The game moves on by itself: a thin line inside the frame runs out, right to left, like the
	   card's auto-play hold line (its scale is set from the hold's clock in the script) */
	.advance-line {
		position: absolute;
		left: 18px;
		right: 18px;
		bottom: 5px;
		height: 2px;
		border-radius: 1px;
		background: currentColor;
		opacity: 0.7;
		transform-origin: left center;
		pointer-events: none;
	}

	/* Waiting for the voice: the line is full and dim, so it never reads as a countdown */
	.advance-line.waiting {
		opacity: 0.3;
	}

	/* Landscape phones: a 16px label in the action column, and a 12px hint that fits it */
	@media (max-height: 500px) and (orientation: landscape) {
		.step-hint {
			font-size: 0.75rem;
			padding-inline: 8px;
			gap: 4px;
		}

		.step-action :global(.aug-button) {
			font-size: 1rem;
			padding-inline: 16px;
		}
	}
</style>
