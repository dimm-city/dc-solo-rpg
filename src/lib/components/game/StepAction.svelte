<script>
	/**
	 * StepAction - The one primary button of a round step, always in the same slot
	 *
	 * GameScreen mounts it once, outside the per-screen {#key} block: moving to the next
	 * step changes only its label (a 120ms crossfade), so the button never blinks out.
	 *
	 * `hint` is the Lucid/Surreal modifier the roll will use ("Lucid: 2 dice, keep high").
	 * Only roll buttons pass one, and it is part of the label, never a separate chip.
	 * `changed` briefly highlights a button that has just changed meaning (GameScreen ignores
	 * presses for that moment, so a press meant for the old button never lands on the new one).
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
		testid,
		id = undefined
	} = $props();

	/** The label swap: a 120ms state change (shorter than FAST), or instant under reduced motion */
	const LABEL_SWAP_MS = Math.min(120, ANIMATION_DURATION.FAST);
	const reduceMotion =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
	const swap = { duration: reduceMotion ? 0 : LABEL_SWAP_MS };

	const label = $derived(hint ? `${text} · ${hint}` : text);
</script>

<div class="step-action" class:changed {id}>
	<ButtonBar>
		<AugmentedButton
			text={label}
			{onclick}
			{disabled}
			{testid}
			class="step-button{busy ? ' busy' : ''}"
		>
			<span class="label-stack" aria-hidden="true">
				{#key label}
					<span class="label" in:fade={swap} out:fade={swap}>
						<span class="label-main">{text}</span>
						{#if hint}
							<span
								class="label-hint"
								class:surreal={hint.startsWith('Surreal')}
								data-testid="roll-modifier">{hint}</span
							>
						{/if}
					</span>
				{/key}
			</span>
		</AugmentedButton>
	</ButtonBar>
</div>

<style>
	.step-action {
		display: grid;
		justify-items: center;
		width: 100%;
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
		gap: 0.125rem;
	}

	.label-hint {
		font-family: var(--font-body, 'Inter', system-ui, sans-serif);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: none;
		color: var(--color-neon-cyan, #00ffff);
	}

	.label-hint.surreal {
		color: var(--color-cyber-magenta, #ff00ff);
	}

	/* The button has just changed meaning: a short highlight while presses are held off
	   (on the button itself, so the wrapper's glow filter is left alone) */
	.step-action.changed :global(.aug-button) {
		filter: brightness(1.4);
	}

	.step-action :global(.step-button.busy .aug-button) {
		cursor: progress;
	}
</style>
