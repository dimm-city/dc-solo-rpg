<script>
	/**
	 * StepAction - The one primary button of a round step, always in the same slot
	 *
	 * Wraps ContinueButton in a ButtonBar and, when the player is Lucid or Surreal,
	 * shows a small chip above it so they know before they roll.
	 *
	 * @component
	 */

	import { gameState } from '../../stores/gameStore.svelte.js';
	import ContinueButton from '../ContinueButton.svelte';
	import ButtonBar from '../ButtonBar.svelte';

	let { text, onclick, disabled = false, testid } = $props();

	const chip = $derived(
		gameState.isLucid
			? { kind: 'lucid', label: 'Lucid', hint: 'roll two dice, keep the higher' }
			: gameState.isSurreal
				? { kind: 'surreal', label: 'Surreal', hint: 'roll two dice, keep the lower' }
				: null
	);
</script>

<div class="step-action">
	{#if chip}
		<p class="state-chip {chip.kind}" data-testid="state-chip">
			<strong>{chip.label}</strong>
			<span>{chip.hint}</span>
		</p>
	{/if}
	<ButtonBar>
		<ContinueButton {text} {onclick} {disabled} {testid} />
	</ButtonBar>
</div>

<style>
	.step-action {
		display: grid;
		justify-items: center;
		gap: var(--space-xs, 0.25rem);
		width: 100%;
	}

	.state-chip {
		margin: 0;
		padding: 0.25rem 0.75rem;
		border: 1px solid currentColor;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.6);
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: var(--text-sm, 0.875rem);
		letter-spacing: 0.04em;
		text-align: center;
		color: var(--color-neon-cyan, #00ffff);
	}

	.state-chip.surreal {
		color: var(--color-cyber-magenta, #ff00ff);
	}

	.state-chip strong {
		text-transform: uppercase;
		margin-right: 0.5ch;
	}

	.state-chip span {
		color: #fff;
	}
</style>
