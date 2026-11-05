<script>
	/**
	 * SettingsModal - In-game settings modal (difficulty and audio/TTS settings)
	 * Now uses ContentModal as base
	 */
	import ContentModal from '../ContentModal.svelte';
	import AudioSettings from './AudioSettings.svelte';
	import { getSettings, updateSettings } from '../../stores/settingsStore.svelte.js';

	let { isOpen = $bindable(false), onClose } = $props();

	// Select values are strings; settings store null (game default), 0 (Easy) or 1 (Normal)
	const DIFFICULTY_VALUES = { default: null, normal: 1, easy: 0 };

	let difficultyValue = $derived(
		Object.keys(DIFFICULTY_VALUES).find(
			(key) => DIFFICULTY_VALUES[key] === getSettings().difficulty
		)
	);
</script>

<ContentModal {isOpen} title="Game Settings" {onClose}>
	<div class="settings-section">
		<h3 id="difficulty-heading">Difficulty</h3>
		<div class="setting-row">
			<select
				id="difficulty"
				aria-labelledby="difficulty-heading"
				value={difficultyValue}
				onchange={(e) => updateSettings({ difficulty: DIFFICULTY_VALUES[e.target.value] })}
			>
				<option value="default">Game default</option>
				<option value="normal">Normal</option>
				<option value="easy">Easy</option>
			</select>
			<p class="setting-description">
				Easy starts with the Ace of Hearts already revealed. Applies when a game starts or restarts.
			</p>
		</div>
	</div>
	<AudioSettings />
</ContentModal>

<style>
	h3 {
		margin: 0 0 var(--space-sm, 0.5rem) 0;
		/* Display font is for 24px+ titles only; section headings use the body face */
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: var(--letter-spacing-wide, 0.05em);
		text-transform: uppercase;
		font-family: var(--font-body, var(--main-font-family));
		color: var(--third-accent, #ff15cb);
		border-bottom: 2px solid var(--secondary-accent-muted, rgba(199, 67, 255, 0.68));
		padding-bottom: var(--space-sm, 0.5rem);
	}

	.settings-section {
		margin-bottom: var(--space-lg, 1.5rem);
	}

	.setting-row {
		margin-bottom: var(--space-md, 1rem);
		padding: var(--space-sm, 0.5rem);
		background: var(--translucent-dark, rgba(17, 17, 17, 0.5));
		border: 1px solid var(--secondary-accent-muted, rgba(199, 67, 255, 0.3));
		border-radius: var(--dc-default-border-radius, 0.175rem);
	}

	.setting-description {
		margin: var(--space-xs, 0.25rem) 0 0 0;
		font-size: 0.85rem;
		color: var(--light, rgba(255, 255, 255, 0.9));
		opacity: 0.7;
	}

	select {
		width: 100%;
		padding: var(--space-sm, 0.5rem);
		background: var(--translucent-dark, rgba(17, 17, 17, 0.75));
		border: 1px solid var(--secondary-accent-muted, rgba(199, 67, 255, 0.68));
		border-radius: var(--dc-default-border-radius, 0.175rem);
		color: var(--light, rgba(255, 255, 255, 0.9));
		font-size: 0.9rem;
		font-family: var(--main-font-family);
	}

	select option {
		background: var(--opaque-dark, rgba(17, 17, 17, 0.925));
		color: var(--light, rgba(255, 255, 255, 0.9));
	}
</style>
