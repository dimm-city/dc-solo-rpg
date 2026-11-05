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
	<section class="cm-section" aria-labelledby="gameplay-heading">
		<h3 class="cm-section-title" id="gameplay-heading">Gameplay</h3>
		<p class="cm-section-desc">How the game starts. Changes apply the next time a game begins.</p>
		<div class="cm-rows">
			<div class="cm-row">
				<div>
					<label class="cm-label" for="difficulty">Difficulty</label>
					<p class="cm-help" id="difficulty-help">
						Easy starts with the Ace of Hearts already revealed.
					</p>
				</div>
				<select
					id="difficulty"
					class="cm-control"
					aria-describedby="difficulty-help"
					value={difficultyValue}
					onchange={(e) => updateSettings({ difficulty: DIFFICULTY_VALUES[e.target.value] })}
				>
					<option value="default">Game default</option>
					<option value="normal">Normal</option>
					<option value="easy">Easy</option>
				</select>
			</div>
		</div>
	</section>
	<AudioSettings />
</ContentModal>
