<script>
	import {
		getAudioSettings,
		getGameplaySettings,
		updateAudioSettings,
		updateGameplaySettings,
		getAvailableVoices
	} from '../../stores/audioStore.svelte.js';
	import { onMount } from 'svelte';

	// Direct access to reactive state - don't use $derived here
	let availableVoices = $state([]);
	let providerError = $state(null);
	let providerAvailability = $state({
		browser: true,
		supertonic: false, // Will check on mount
		openai: true,
		elevenlabs: true
	});

	onMount(async () => {
		// Load available voices
		availableVoices = await getAvailableVoices();

		// Check if Supertonic models are available
		await checkSupertonicAvailability();
	});

	async function checkSupertonicAvailability() {
		try {
			// Check if ONNX models are available from Hugging Face CDN
			const response = await fetch(
				'https://huggingface.co/Supertone/supertonic/resolve/main/onnx/tts.json'
			);
			providerAvailability.supertonic = response.ok;
		} catch (error) {
			providerAvailability.supertonic = false;
		}
	}

	async function handleAudioSettingChange(key, value) {
		// Clear previous errors
		if (key === 'ttsProvider') {
			providerError = null;
		}

		try {
			await updateAudioSettings({ [key]: value });

			// Reload voices when provider changes
			if (key === 'ttsProvider') {
				await loadVoices();
			}
		} catch (error) {
			// Show user-friendly error message
			if (key === 'ttsProvider') {
				if (value === 'supertonic') {
					providerError = `Supertonic TTS initialization failed: ${error.message}`;
				} else if (value === 'openai' || value === 'elevenlabs') {
					providerError = `Failed to initialize ${value}. Please check your API key.`;
				} else {
					providerError = `Failed to switch to ${value} provider: ${error.message}`;
				}
			}
		}
	}

	function handleGameplaySettingChange(key, value) {
		updateGameplaySettings({ [key]: value });
	}

	async function loadVoices() {
		availableVoices = await getAvailableVoices();
	}

	// Helper to get current settings
	function getSettings() {
		return {
			audio: getAudioSettings(),
			gameplay: getGameplaySettings()
		};
	}
</script>

<div class="audio-settings-container">
	<h3>Audio Settings</h3>

	<div class="settings-section">
		<h4>Text-to-Speech</h4>

		<div class="setting-row">
			<label for="tts-provider">TTS Provider</label>
			<select
				id="tts-provider"
				value={getAudioSettings().ttsProvider}
				onchange={(e) => handleAudioSettingChange('ttsProvider', e.target.value)}
			>
				<option value="browser">Browser (Free, No API Key)</option>
				<option value="supertonic" disabled={!providerAvailability.supertonic}>
					Supertonic Neural TTS {providerAvailability.supertonic
						? '(Free, Downloads from HF)'
						: '(HF Unavailable)'}
				</option>
				<option value="openai">OpenAI TTS</option>
				<option value="elevenlabs">ElevenLabs</option>
			</select>
			<p class="setting-description">Choose your text-to-speech provider</p>

			{#if providerError}
				<div class="error-message">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" y1="8" x2="12" y2="12"></line>
						<line x1="12" y1="16" x2="12.01" y2="16"></line>
					</svg>
					<span>{providerError}</span>
				</div>
			{/if}
		</div>

		{#if getAudioSettings().ttsProvider !== 'browser' && getAudioSettings().ttsProvider !== 'supertonic'}
			<div class="setting-row">
				<label for="tts-api-key">API Key</label>
				<input
					id="tts-api-key"
					type="password"
					value={getAudioSettings().ttsApiKey || ''}
					oninput={(e) => handleAudioSettingChange('ttsApiKey', e.target.value || null)}
					placeholder="Enter your API key"
				/>
				<p class="setting-description">Required for {getAudioSettings().ttsProvider} TTS</p>
			</div>
		{/if}

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

		{#if availableVoices.length > 0}
			<div class="setting-row">
				<label for="tts-voice">Voice</label>
				<select
					id="tts-voice"
					value={getAudioSettings().ttsVoice || ''}
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
	.audio-settings-container {
		/* Padding and scrolling handled by ContentModal */
	}

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

	select,
	input[type='password'],
	input[type='text'] {
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

	select:focus,
	input[type='password']:focus,
	input[type='text']:focus {
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

	input[type='password']::placeholder,
	input[type='text']::placeholder {
		color: var(--disabled-color, rgba(196, 192, 192, 0.6));
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

	.error-message {
		display: flex;
		align-items: center;
		gap: var(--space-sm, 0.5rem);
		padding: var(--space-sm, 0.5rem);
		margin-top: var(--space-sm, 0.5rem);
		background: rgba(220, 38, 38, 0.1);
		border: 1px solid rgba(220, 38, 38, 0.5);
		border-radius: var(--dc-default-border-radius, 0.175rem);
		color: #ff6b6b;
		font-size: 0.85rem;
		line-height: 1.4;
	}

	.error-message svg {
		flex-shrink: 0;
		color: #ff6b6b;
	}
</style>
