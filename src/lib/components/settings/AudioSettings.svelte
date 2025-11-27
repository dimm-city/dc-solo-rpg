<script>
	import {
		getAudioSettings,
		getGameplaySettings,
		updateAudioSettings,
		updateGameplaySettings
	} from '../../stores/audioStore.svelte.js';
	import TTSSection from './TTSSection.svelte';

	function handleAudioSettingChange(key, value) {
		updateAudioSettings({ [key]: value });
	}

	function handleGameplaySettingChange(key, value) {
		updateGameplaySettings({ [key]: value });
	}
</script>

<div class="audio-settings-container">
	<!-- TTS Provider Configuration -->
	<TTSSection />

	<div class="settings-section">
		<h3>Audio Behavior</h3>

		<div class="setting-row">
			<label class="setting-label">
				<input
					type="checkbox"
					checked={getAudioSettings().autoReadCards}
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
					checked={getAudioSettings().autoReadPrompts}
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
					checked={getAudioSettings().autoAnnounceRolls}
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
				value={getAudioSettings().readingSpeed}
				onchange={(e) => handleAudioSettingChange('readingSpeed', e.target.value)}
			>
				<option value="slow">Slow</option>
				<option value="normal">Normal</option>
				<option value="fast">Fast</option>
			</select>
		</div>
	</div>

	<h3>Gameplay Automation</h3>

	<div class="settings-section">
		<h4>Auto-Play</h4>

		<div class="setting-row">
			<label class="setting-label">
				<input
					type="checkbox"
					checked={getGameplaySettings().autoRollDice}
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
					checked={getGameplaySettings().autoContinueAfterReading}
					onchange={(e) =>
						handleGameplaySettingChange('autoContinueAfterReading', e.target.checked)}
				/>
				<span>Auto-continue after reading</span>
			</label>
			<p class="setting-description">Automatically advance after TTS completes</p>
		</div>

		<div class="setting-row">
			<label for="auto-advance-delay">
				Auto-advance delay: {(getGameplaySettings().autoAdvanceDelay / 1000).toFixed(1)}s
			</label>
			<input
				type="range"
				id="auto-advance-delay"
				min="500"
				max="10000"
				step="500"
				value={getGameplaySettings().autoAdvanceDelay}
				oninput={(e) => handleGameplaySettingChange('autoAdvanceDelay', parseInt(e.target.value))}
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
				value={getGameplaySettings().autoHandleJournaling}
				onchange={(e) => handleGameplaySettingChange('autoHandleJournaling', e.target.value)}
			>
				<option value="manual">Manual (must click to continue)</option>
				<option value="skip">Skip (auto-continue immediately)</option>
				<option value="timed">Timed (pause with countdown)</option>
			</select>
		</div>

		{#if getGameplaySettings().autoHandleJournaling === 'timed'}
			<div class="setting-row">
				<label for="journal-pause-time">
					Journal pause time: {(getGameplaySettings().journalPauseTime / 1000).toFixed(1)}s
				</label>
				<input
					type="range"
					id="journal-pause-time"
					min="3000"
					max="30000"
					step="1000"
					value={getGameplaySettings().journalPauseTime}
					oninput={(e) => handleGameplaySettingChange('journalPauseTime', parseInt(e.target.value))}
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
	h3 {
		margin: var(--space-md, 1rem) 0 var(--space-sm, 0.5rem) 0;
		font-size: 1.2rem;
		font-family: var(--font-display, var(--main-font-family));
		color: var(--third-accent, #ff15cb);
		border-bottom: 2px solid var(--secondary-accent-muted, rgba(199, 67, 255, 0.68));
		padding-bottom: var(--space-sm, 0.5rem);
	}

	h3:first-child {
		margin-top: 0;
	}

	h4 {
		margin: var(--space-sm, 0.5rem) 0;
		font-size: 1rem;
		color: var(--secondary-accent, #c643ff);
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

	.setting-label {
		display: flex;
		align-items: center;
		gap: var(--space-sm, 0.5rem);
		cursor: pointer;
		font-weight: 500;
		color: var(--light, rgba(255, 255, 255, 0.9));
	}

	.setting-label input[type='checkbox'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: var(--third-accent, #ff15cb);
	}

	.setting-description {
		margin: var(--space-xs, 0.25rem) 0 0 26px;
		font-size: 0.85rem;
		color: var(--light, rgba(255, 255, 255, 0.9));
		opacity: 0.7;
	}

	label:not(.setting-label) {
		display: block;
		margin-bottom: var(--space-xs, 0.25rem);
		font-weight: 500;
		color: var(--light, rgba(255, 255, 255, 0.9));
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
		transition: all 0.2s ease;
	}

	select:focus {
		outline: none;
		border-color: var(--third-accent, #ff15cb);
		box-shadow: 0 0 10px var(--secondary-accent-muted, rgba(199, 67, 255, 0.3));
	}

	/* Fix select option visibility */
	select option {
		background: var(--opaque-dark, rgba(17, 17, 17, 0.925));
		color: var(--light, rgba(255, 255, 255, 0.9));
		padding: 0.5rem;
	}

	select option:disabled {
		color: var(--disabled-color, rgb(196, 192, 192));
	}

	input[type='range'] {
		width: 100%;
		margin-top: var(--space-xs, 0.25rem);
		accent-color: var(--third-accent, #ff15cb);
	}

	.range-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--light, rgba(255, 255, 255, 0.9));
		opacity: 0.6;
		margin-top: var(--space-xs, 0.25rem);
	}

	.preset-buttons {
		display: flex;
		gap: var(--space-sm, 0.5rem);
		flex-wrap: wrap;
		margin-top: var(--space-lg, 1.5rem);
		padding-top: var(--space-md, 1rem);
		border-top: 1px solid var(--secondary-accent-muted, rgba(199, 67, 255, 0.68));
	}

	.preset-button {
		flex: 1;
		min-width: 120px;
		padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
		background: var(--translucent-dark, rgba(17, 17, 17, 0.75));
		color: var(--light, white);
		border: 1px solid var(--secondary-accent, #c643ff);
		border-radius: var(--dc-default-border-radius, 0.175rem);
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		font-family: var(--main-font-family);
		transition: all 0.2s ease;
	}

	.preset-button:hover {
		background: var(--secondary-accent, #c643ff);
		border-color: var(--third-accent, #ff15cb);
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(199, 67, 255, 0.3);
	}

	.preset-button:active {
		transform: translateY(0);
	}
</style>
