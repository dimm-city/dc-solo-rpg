<!--
 * TTSSection - Text-to-Speech configuration section
 *
 * Provides UI for configuring TTS provider settings
 *
 * @component ⭐ REUSABLE
 * @example
 * <TTSSection
 *   bind:ttsProvider={ttsProvider}
 *   bind:ttsApiKey={ttsApiKey}
 *   bind:ttsVoice={ttsVoice}
 *   bind:ttsRate={ttsRate}
 *   bind:ttsPitch={ttsPitch}
 *   {availableVoices}
 * />
 -->

<script>
	let {
		ttsProvider = $bindable('browser'),
		ttsApiKey = $bindable(''),
		ttsVoice = $bindable(''),
		ttsRate = $bindable(1.0),
		ttsPitch = $bindable(1.0),
		availableVoices = []
	} = $props();
</script>

<section class="settings-section">
	<h3>Text-to-Speech (Optional)</h3>
	<p class="section-description">
		Generate audio narration of your story. Browser TTS is free but quality varies. API providers
		offer higher quality voices.
	</p>

	<div class="form-group">
		<label for="tts-provider">TTS Provider</label>
		<select id="tts-provider" bind:value={ttsProvider}>
			<option value="browser">Browser (Free, No API Key)</option>
			<option value="supertonic">Supertonic Neural TTS (On-Device, Requires Models)</option>
			<option value="openai">OpenAI TTS</option>
			<option value="elevenlabs">ElevenLabs</option>
		</select>
	</div>

	{#if ttsProvider !== 'browser'}
		<div class="form-group">
			<label for="tts-api-key">TTS API Key</label>
			<input
				id="tts-api-key"
				type="password"
				bind:value={ttsApiKey}
				placeholder="Enter your TTS API key"
			/>
		</div>
	{/if}

	{#if ttsProvider === 'browser'}
		<div class="form-group">
			<label for="tts-voice">Voice</label>
			<select id="tts-voice" bind:value={ttsVoice}>
				<option value="">Default System Voice</option>
				{#each availableVoices as voice}
					<option value={voice.name}>{voice.name} ({voice.lang})</option>
				{/each}
			</select>
		</div>

		<div class="form-group">
			<label for="tts-rate">Speed: {ttsRate.toFixed(1)}x</label>
			<input id="tts-rate" type="range" min="0.5" max="2.0" step="0.1" bind:value={ttsRate} />
		</div>

		<div class="form-group">
			<label for="tts-pitch">Pitch: {ttsPitch.toFixed(1)}</label>
			<input id="tts-pitch" type="range" min="0.5" max="2.0" step="0.1" bind:value={ttsPitch} />
		</div>
	{:else if ttsProvider === 'supertonic'}
		<div class="info-box">
			<p>
				<strong>Note:</strong> Supertonic requires ONNX models to be downloaded and placed in
				<code>static/tts-models/</code>. See documentation for setup instructions.
			</p>
		</div>

		<div class="form-group">
			<label for="tts-voice">Voice Style</label>
			<select id="tts-voice" bind:value={ttsVoice}>
				<option value="F1">Female Voice 1 (F1)</option>
				<option value="F2">Female Voice 2 (F2)</option>
				<option value="M1">Male Voice 1 (M1)</option>
				<option value="M2">Male Voice 2 (M2)</option>
			</select>
		</div>

		<div class="form-group">
			<label for="tts-rate">Speed: {ttsRate.toFixed(1)}x</label>
			<input id="tts-rate" type="range" min="0.5" max="2.0" step="0.1" bind:value={ttsRate} />
		</div>
	{:else if ttsProvider === 'openai'}
		<div class="form-group">
			<label for="tts-voice">Voice</label>
			<select id="tts-voice" bind:value={ttsVoice}>
				<option value="alloy">Alloy</option>
				<option value="echo">Echo</option>
				<option value="fable">Fable</option>
				<option value="onyx">Onyx</option>
				<option value="nova">Nova</option>
				<option value="shimmer">Shimmer</option>
			</select>
		</div>
	{/if}
</section>

<style>
	.settings-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.settings-section h3 {
		font-family: var(--font-display);
		font-size: 1.25rem;
		color: var(--color-neon-cyan);
		margin: 0;
		padding-bottom: var(--space-sm);
		border-bottom: 2px solid rgba(0, 255, 255, 0.3);
	}

	.section-description {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.5;
		margin: 0;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.form-group input,
	.form-group select {
		padding: var(--space-md);
		background: rgba(0, 0, 0, 0.4);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.9rem;
		transition: all var(--transition-base);
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: var(--color-neon-cyan);
		box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
	}

	.form-group input[type='range'] {
		padding: 0;
		height: 6px;
		cursor: pointer;
	}

	.info-box {
		padding: var(--space-md);
		background: rgba(0, 255, 255, 0.1);
		border: 1px solid rgba(0, 255, 255, 0.3);
		border-radius: 4px;
		margin: var(--space-sm) 0;
	}

	.info-box p {
		margin: 0;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.5;
	}

	.info-box strong {
		color: var(--color-neon-cyan);
	}

	.info-box code {
		background: rgba(0, 0, 0, 0.4);
		padding: 2px 6px;
		border-radius: 3px;
		font-family: monospace;
		font-size: 0.9em;
		color: rgba(255, 255, 255, 0.9);
	}
</style>
