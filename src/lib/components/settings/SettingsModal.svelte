<script>
	/**
	 * SettingsModal - opens with what most players change (difficulty, play mode, rule tips),
	 * then the GitHub repositories games are loaded from; every finer control (voice, read-aloud
	 * switches, auto-play timing) sits under Advanced.
	 */
	import ContentModal from '../ContentModal.svelte';
	import AudioSettings from './AudioSettings.svelte';
	import GameSourcesSection from './GameSourcesSection.svelte';
	import { getSettings, updateSettings } from '../../stores/settingsStore.svelte.js';
	import {
		getAudioSettings,
		getGameplaySettings,
		updateAudioSettings,
		updateGameplaySettings
	} from '../../stores/audioStore.svelte.js';
	import { PLAY_MODES, playModeSettings, detectPlayMode } from '../../utils/playMode.js';
	import { areRuleTipsEnabled, setRuleTipsEnabled } from '../../utils/instructionsStorage.js';
	import { DIFFICULTY } from '../../constants/difficulty.js';

	let { isOpen = $bindable(false), onClose } = $props();

	// Select values are strings; settings store null (game default) or a difficulty level
	const DIFFICULTY_VALUES = {
		default: null,
		easy: DIFFICULTY.EASY,
		normal: DIFFICULTY.NORMAL,
		hard: DIFFICULTY.HARD
	};

	/** The options, easiest first, each with what it changes (only the selected one is shown) */
	const DIFFICULTY_OPTIONS = [
		{ value: 'default', label: 'Game default', help: 'Each game sets its own; most use Normal.' },
		{
			value: 'easy',
			label: 'Easy',
			help: 'The Ace of Hearts starts revealed, and surviving the fourth Ace wins.'
		},
		{ value: 'normal', label: 'Normal', help: 'Tokens only ever fall. Remove them all to escape.' },
		{
			value: 'hard',
			label: 'Hard',
			help: 'A missed Salvation roll adds a Token (two on a natural 1).'
		}
	];

	let difficultyValue = $derived(
		Object.keys(DIFFICULTY_VALUES).find(
			(key) => DIFFICULTY_VALUES[key] === getSettings().difficulty
		) ?? 'default'
	);
	// The help under the select describes the selected option only
	let difficultyHelp = $derived(
		`${DIFFICULTY_OPTIONS.find((option) => option.value === difficultyValue)?.help ?? ''} Applies from your next game.`
	);

	let playMode = $derived(detectPlayMode(getAudioSettings(), getGameplaySettings()));
	let playModeHelp = $derived(
		PLAY_MODES.find((m) => m.id === playMode)?.help ??
			'Custom: your own mix of the settings under Advanced.'
	);

	function choosePlayMode(mode) {
		const { audio, gameplay } = playModeSettings(mode);
		updateGameplaySettings(gameplay);
		updateAudioSettings(audio);
	}

	// Rule tips live in localStorage; re-read whenever the modal opens
	let ruleTips = $state(true);
	$effect(() => {
		if (isOpen) ruleTips = areRuleTipsEnabled();
	});

	function toggleRuleTips(enabled) {
		ruleTips = enabled;
		setRuleTipsEnabled(enabled);
	}
</script>

<ContentModal {isOpen} title="Settings" {onClose}>
	<section class="cm-section" aria-labelledby="gameplay-heading">
		<h3 class="cm-section-title" id="gameplay-heading">Gameplay</h3>
		<div class="cm-rows">
			<div class="cm-row">
				<div>
					<label class="cm-label" for="difficulty">Difficulty</label>
					<p class="cm-help" id="difficulty-help" data-testid="difficulty-help">
						{difficultyHelp}
					</p>
				</div>
				<select
					id="difficulty"
					class="cm-control"
					aria-describedby="difficulty-help"
					value={difficultyValue}
					onchange={(e) => updateSettings({ difficulty: DIFFICULTY_VALUES[e.target.value] })}
				>
					{#each DIFFICULTY_OPTIONS as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div class="cm-row play-mode-row">
				<div>
					<span class="cm-label" id="play-mode-label">Play mode</span>
					<p class="cm-help" id="play-mode-help">{playModeHelp}</p>
				</div>
				<div
					class="segmented"
					role="radiogroup"
					aria-labelledby="play-mode-label"
					aria-describedby="play-mode-help"
				>
					{#each PLAY_MODES as mode (mode.id)}
						<label class="segment" class:selected={playMode === mode.id}>
							<input
								type="radio"
								name="play-mode"
								value={mode.id}
								checked={playMode === mode.id}
								onchange={() => choosePlayMode(mode.id)}
							/>
							<span>{mode.label}</span>
						</label>
					{/each}
				</div>
			</div>

			<div class="cm-row cm-row-toggle">
				<div>
					<label class="cm-label" for="rule-tips">Rule tips</label>
					<p class="cm-help" id="rule-tips-help">
						A short note the first time a rule comes up in a game. The Game Guide lists the ones you
						have met.
					</p>
				</div>
				<input
					id="rule-tips"
					class="cm-switch"
					type="checkbox"
					role="switch"
					aria-describedby="rule-tips-help"
					checked={ruleTips}
					onchange={(e) => toggleRuleTips(e.target.checked)}
				/>
			</div>
		</div>
	</section>

	<GameSourcesSection />

	<details class="settings-advanced">
		<summary>
			<span class="advanced-title">Advanced</span>
			<span class="advanced-desc">Voice, read-aloud details, auto-play timing</span>
		</summary>
		<AudioSettings />
	</details>
</ContentModal>

<style>
	/* The play mode row stacks: label and help, then the control across the full width */
	.play-mode-row {
		grid-template-columns: minmax(0, 1fr);
	}

	/* Three-way segmented control over native radios (arrow keys move between them) */
	.segmented {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border: 1px solid #6a87a3;
		border-radius: 4px;
		overflow: hidden;
	}

	.segment {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 4px 6px;
		margin: 0;
		white-space: nowrap;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		line-height: 1.2;
		text-align: center;
		text-transform: uppercase;
		color: #d5dfeb;
		cursor: pointer;
		transition:
			background-color 120ms ease-out,
			color 120ms ease-out;
	}

	.segment + .segment {
		border-left: 1px solid #6a87a3;
	}

	.segment input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	.segment:hover {
		background: rgba(0, 255, 255, 0.08);
	}

	.segment.selected {
		background: var(--color-neon-cyan, #00ffff);
		color: #04121a;
	}

	.segment:has(input:focus-visible) {
		outline: 3px solid var(--color-neon-cyan, #00ffff);
		outline-offset: -3px;
		z-index: 1;
	}

	.segment.selected:has(input:focus-visible) {
		outline-color: #fff;
	}

	/* Advanced: one disclosure for every finer control */
	.settings-advanced {
		margin-top: 24px;
		border-top: 1px solid rgba(255, 255, 255, 0.14);
	}

	.settings-advanced > summary {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 12px;
		min-height: 48px;
		padding: 20px 0 12px;
		list-style: none;
		cursor: pointer;
	}

	.settings-advanced > summary::-webkit-details-marker {
		display: none;
	}

	.settings-advanced > summary::before {
		content: '';
		align-self: center;
		width: 8px;
		height: 8px;
		border-right: 2px solid var(--color-neon-cyan, #00ffff);
		border-bottom: 2px solid var(--color-neon-cyan, #00ffff);
		transform: rotate(-45deg);
		transition: transform 120ms ease-out;
	}

	.settings-advanced[open] > summary::before {
		transform: rotate(45deg);
	}

	.settings-advanced > summary:focus-visible {
		outline: 3px solid var(--color-neon-cyan, #00ffff);
		outline-offset: 2px;
	}

	/* A section heading, like .cm-section-title */
	.advanced-title {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.25;
		color: var(--color-neon-cyan, #00ffff);
	}

	.advanced-desc {
		font-size: 0.875rem;
		color: #b8c5d6;
	}

	@media (prefers-reduced-motion: reduce) {
		.segment,
		.settings-advanced > summary::before {
			transition: none;
		}
	}
</style>
