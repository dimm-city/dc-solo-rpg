<script>
	import {
		getAudioSettings,
		getGameplaySettings,
		updateAudioSettings,
		updateGameplaySettings,
		getAvailableVoices
	} from '../../stores/audioStore.svelte.js';
	import { onMount } from 'svelte';

	const audioSettings = $derived(getAudioSettings());
	const gameplaySettings = $derived(getGameplaySettings());

	let availableVoices = $state([]);

	onMount(async () => {
		// Load available voices
		availableVoices = await getAvailableVoices();
	});

	function handleAudioSettingChange(key, value) {
		updateAudioSettings({ [key]: value });
	}

	function handleGameplaySettingChange(key, value) {
		updateGameplaySettings({ [key]: value });
	}
</script>

<div class="audio-settings-container">
	<h3>Audio Settings</h3>

	<div class="settings-section">
		<h4>Text-to-Speech</h4>

		<div class="setting-row">
			<label class="setting-label">
				<input
					type="checkbox"
					checked={audioSettings.autoReadCards}
					onchange={(e) => handleAudioSettingChange('autoReadCards', e.target.checked)}
				/>
				<span>Auto-read cards</span>
			</label>
			<p class="setting-description">Automatically read card content aloud when revealed</p>
		</div>

		<div class="setting-row">
			<label class="setting-label">
				<input
					type="checkbox"
					checked={audioSettings.autoReadPrompts}
					onchange={(e) => handleAudioSettingChange('autoReadPrompts', e.target.checked)}
				/>
				<span>Auto-read prompts</span>
			</label>
			<p class="setting-description">Read screen prompts and instructions</p>
		</div>

		<div class="setting-row">
			<label class="setting-label">
				<input
					type="checkbox"
					checked={audioSettings.autoAnnounceRolls}
					onchange={(e) => handleAudioSettingChange('autoAnnounceRolls', e.target.checked)}
				/>
				<span>Auto-announce dice rolls</span>
			</label>
			<p class="setting-description">Announce dice roll results aloud</p>
		</div>

		<div class="setting-row">
			<label for="reading-speed">Reading speed</label>
			<select
				id="reading-speed"
				value={audioSettings.readingSpeed}
				onchange={(e) => handleAudioSettingChange('readingSpeed', e.target.value)}
			>
				<option value="slow">Slow</option>
				<option value="normal">Normal</option>
				<option value="fast">Fast</option>
			</select>
		</div>

		{#if availableVoices.length > 0}
			<div class="setting-row">
				<label for="tts-voice">Voice</label>
				<select
					id="tts-voice"
					value={audioSettings.ttsVoice || ''}
					onchange={(e) => handleAudioSettingChange('ttsVoice', e.target.value || null)}
				>
					<option value="">Default</option>
					{#each availableVoices as voice}
						<option value={voice.id}>{voice.name} ({voice.language})</option>
					{/each}
				</select>
			</div>
		{/if}
	</div>

	<h3>Gameplay Automation</h3>

	<div class="settings-section">
		<h4>Auto-Play</h4>

		<div class="setting-row">
			<label class="setting-label">
				<input
					type="checkbox"
					checked={gameplaySettings.autoRollDice}
					onchange={(e) => handleGameplaySettingChange('autoRollDice', e.target.checked)}
				/>
				<span>Auto-roll dice</span>
			</label>
			<p class="setting-description">Automatically trigger dice rolls</p>
		</div>

		<div class="setting-row">
			<label class="setting-label">
				<input
					type="checkbox"
					checked={gameplaySettings.autoContinueAfterReading}
					onchange={(e) =>
						handleGameplaySettingChange('autoContinueAfterReading', e.target.checked)}
				/>
				<span>Auto-continue after reading</span>
			</label>
			<p class="setting-description">Automatically advance after TTS completes</p>
		</div>

		<div class="setting-row">
			<label for="auto-advance-delay">
				Auto-advance delay: {(gameplaySettings.autoAdvanceDelay / 1000).toFixed(1)}s
			</label>
			<input
				type="range"
				id="auto-advance-delay"
				min="500"
				max="10000"
				step="500"
				value={gameplaySettings.autoAdvanceDelay}
				oninput={(e) =>
					handleGameplaySettingChange('autoAdvanceDelay', parseInt(e.target.value))}
			/>
			<div class="range-labels">
				<span>0.5s</span>
				<span>10s</span>
			</div>
		</div>

		<div class="setting-row">
			<label for="journal-handling">Journaling mode</label>
			<select
				id="journal-handling"
				value={gameplaySettings.autoHandleJournaling}
				onchange={(e) => handleGameplaySettingChange('autoHandleJournaling', e.target.value)}
			>
				<option value="manual">Manual (must click to continue)</option>
				<option value="skip">Skip (auto-continue immediately)</option>
				<option value="timed">Timed (pause with countdown)</option>
			</select>
		</div>

		{#if gameplaySettings.autoHandleJournaling === 'timed'}
			<div class="setting-row">
				<label for="journal-pause-time">
					Journal pause time: {(gameplaySettings.journalPauseTime / 1000).toFixed(1)}s
				</label>
				<input
					type="range"
					id="journal-pause-time"
					min="3000"
					max="30000"
					step="1000"
					value={gameplaySettings.journalPauseTime}
					oninput={(e) =>
						handleGameplaySettingChange('journalPauseTime', parseInt(e.target.value))}
				/>
				<div class="range-labels">
					<span>3s</span>
					<span>30s</span>
				</div>
			</div>
		{/if}
	</div>

	<div class="preset-buttons">
		<button
			onclick={() => {
				// Full auto-play preset
				updateAudioSettings({
					autoReadCards: true,
					autoReadPrompts: true,
					autoAnnounceRolls: true
				});
				updateGameplaySettings({
					autoRollDice: true,
					autoContinueAfterReading: true,
					autoAdvanceDelay: 2000,
					autoHandleJournaling: 'timed',
					journalPauseTime: 10000
				});
			}}
			class="preset-button"
		>
			Full Auto-Play
		</button>

		<button
			onclick={() => {
				// Audio only preset
				updateAudioSettings({
					autoReadCards: true,
					autoReadPrompts: true,
					autoAnnounceRolls: true
				});
				updateGameplaySettings({
					autoRollDice: false,
					autoContinueAfterReading: false,
					autoHandleJournaling: 'manual'
				});
			}}
			class="preset-button"
		>
			Audio Only
		</button>

		<button
			onclick={() => {
				// Disable all
				updateAudioSettings({
					autoReadCards: false,
					autoReadPrompts: false,
					autoAnnounceRolls: false
				});
				updateGameplaySettings({
					autoRollDice: false,
					autoContinueAfterReading: false,
					autoHandleJournaling: 'manual'
				});
			}}
			class="preset-button"
		>
			Disable All
		</button>
	</div>
</div>

<style>
	.audio-settings-container {
		padding: var(--space-md, 1rem);
		max-height: 70vh;
		overflow-y: auto;
	}

	h3 {
		margin: var(--space-md, 1rem) 0 var(--space-sm, 0.5rem) 0;
		font-size: 1.2rem;
		color: var(--dc-default-text-color, inherit);
	}

	h3:first-child {
		margin-top: 0;
	}

	h4 {
		margin: var(--space-sm, 0.5rem) 0;
		font-size: 1rem;
		color: var(--dc-accent-color, #3a9fc7);
	}

	.settings-section {
		margin-bottom: var(--space-lg, 1.5rem);
	}

	.setting-row {
		margin-bottom: var(--space-md, 1rem);
		padding: var(--space-sm, 0.5rem);
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
	}

	.setting-label {
		display: flex;
		align-items: center;
		gap: var(--space-sm, 0.5rem);
		cursor: pointer;
		font-weight: 500;
	}

	.setting-label input[type='checkbox'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
	}

	.setting-description {
		margin: var(--space-xs, 0.25rem) 0 0 26px;
		font-size: 0.85rem;
		opacity: 0.7;
	}

	label:not(.setting-label) {
		display: block;
		margin-bottom: var(--space-xs, 0.25rem);
		font-weight: 500;
	}

	select {
		width: 100%;
		padding: var(--space-sm, 0.5rem);
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		color: var(--dc-default-text-color, inherit);
		font-size: 0.9rem;
	}

	input[type='range'] {
		width: 100%;
		margin-top: var(--space-xs, 0.25rem);
	}

	.range-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		opacity: 0.6;
		margin-top: var(--space-xs, 0.25rem);
	}

	.preset-buttons {
		display: flex;
		gap: var(--space-sm, 0.5rem);
		flex-wrap: wrap;
		margin-top: var(--space-lg, 1.5rem);
		padding-top: var(--space-md, 1rem);
		border-top: 1px solid rgba(255, 255, 255, 0.2);
	}

	.preset-button {
		flex: 1;
		min-width: 120px;
		padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
		background: var(--dc-button-bg, #1387b9);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.preset-button:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.preset-button:active {
		transform: translateY(0);
	}
</style>
