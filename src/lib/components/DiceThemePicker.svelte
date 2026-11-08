<script>
	/**
	 * DiceThemePicker - "Dice": pick how the dice look, from a small render of a d20 per theme.
	 * Built on ContentModal like every other dialog. Choosing a theme applies it at once.
	 * The previews in /dice/previews were rendered once with the app's own dice-box.
	 */
	import { untrack } from 'svelte';
	import ContentModal from './ContentModal.svelte';
	import { getAllDiceThemes } from '../configuration/DiceThemes.js';
	import { gameState } from '../stores/gameStore.svelte.js';
	import {
		getDiceTheme as getSavedDiceKey,
		updateSettings
	} from '../stores/settingsStore.svelte.js';
	import { updateDiceTheme } from '../stores/diceStore.svelte.js';

	let { isOpen = $bindable(false) } = $props();

	// 'default' is dice-box's white set, so the separate 'white' entry would be a duplicate
	const themes = getAllDiceThemes().filter((theme) => theme.key !== 'white');
	const nameOf = (theme) => (theme.key === 'default' ? 'White' : theme.name);
	const sameKey = (key) => (key === 'white' ? 'default' : key);

	const currentKey = () =>
		sameKey(gameState.config?.options?.dice?.key ?? getSavedDiceKey() ?? themes[0].key);
	let selectedKey = $state(currentKey());

	// The theme may have changed elsewhere (Settings) since the picker was last open
	$effect(() => {
		if (isOpen) selectedKey = untrack(currentKey);
	});

	function selectTheme(theme) {
		selectedKey = theme.key;

		// Update game config, the saved settings and the live dice box
		if (gameState.config) {
			gameState.config.options = { ...gameState.config.options, dice: theme };
		}
		updateSettings({ diceTheme: theme.key });
		updateDiceTheme(theme);
	}
</script>

<ContentModal {isOpen} title="Dice theme" onClose={() => (isOpen = false)}>
	<div class="themes-grid" role="radiogroup" aria-label="Dice theme">
		{#each themes as theme (theme.key)}
			<button
				type="button"
				class="theme-card"
				role="radio"
				aria-checked={selectedKey === theme.key}
				onclick={() => selectTheme(theme)}
				data-testid="dice-theme-{theme.key}"
			>
				<img
					class="preview"
					src="/dice/previews/{theme.key}.webp"
					alt=""
					width="64"
					height="64"
					loading="lazy"
					decoding="async"
				/>
				<span class="theme-name">{nameOf(theme)}</span>
			</button>
		{/each}
	</div>
</ContentModal>

<style>
	.themes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: var(--space-sm, 0.5rem);
	}

	.theme-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs, 0.25rem);
		min-height: 44px;
		padding: var(--space-sm, 0.5rem) var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 6px;
		color: #fff;
		cursor: pointer;
		transition:
			background-color 120ms ease-out,
			border-color 120ms ease-out;
	}

	.theme-card:hover {
		background: rgba(0, 255, 255, 0.06);
		border-color: rgba(0, 255, 255, 0.5);
	}

	.theme-card:focus-visible {
		outline: 3px solid var(--color-neon-cyan, #00ffff);
		outline-offset: 2px;
	}

	.theme-card[aria-checked='true'] {
		background: rgba(255, 215, 0, 0.08);
		border: 2px solid var(--color-brand-yellow, #ffd700);
	}

	/* Selected: a check in the corner, as well as the gold frame */
	.theme-card[aria-checked='true']::after {
		content: '';
		position: absolute;
		top: 6px;
		right: 8px;
		width: 6px;
		height: 11px;
		border-right: 2px solid var(--color-brand-yellow, #ffd700);
		border-bottom: 2px solid var(--color-brand-yellow, #ffd700);
		transform: rotate(45deg);
	}

	.preview {
		width: 64px;
		height: 64px;
	}

	.theme-name {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		text-align: center;
		color: rgba(255, 255, 255, 0.9);
	}

	.theme-card[aria-checked='true'] .theme-name {
		color: var(--color-brand-yellow, #ffd700);
	}

	@media (max-width: 640px) {
		.themes-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.theme-card {
			transition: none;
		}
	}
</style>
