<script>
	import { fade } from 'svelte/transition';
	import { useRuleCaptions } from '../composables/useRuleCaptions.svelte.js';
	import { ANIMATION_DURATION } from '../constants/animations.js';

	const captions = useRuleCaptions();
	const reduceMotion =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

	function onKeydown(event) {
		if (event.key === 'Escape' && captions.current) captions.dismiss();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="rule-caption-region" aria-live="polite" aria-atomic="true">
	{#key captions.current?.id}
		{#if captions.current}
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
				<span class="rule-label">RULE</span>
				<span class="rule-text">{captions.current.text}</span>
			</div>
		{/if}
	{/key}
</div>

<style>
	.rule-caption-region {
		position: absolute;
		top: var(--space-sm, 8px);
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		padding-inline: 16px;
		pointer-events: none;
		z-index: 5;
	}

	.rule-caption {
		pointer-events: auto;
		cursor: pointer;
		box-sizing: border-box;
		max-width: min(100%, 420px);
		display: flex;
		align-items: baseline;
		gap: 10px;
		padding: 8px 12px;
		background: rgba(8, 8, 20, 0.92);
		border: 1px solid transparent;
		border-image: var(--frame-border, linear-gradient(135deg, #0ff, #f0f)) 1;
		color: var(--color-text, #f2f2fa);
		font-family: var(--font-body, 'Inter', system-ui, sans-serif);
		font-size: 0.875rem;
		line-height: 1.4;
	}

	.rule-label {
		flex: none;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		color: var(--color-neon-cyan, #0ff);
	}
</style>
