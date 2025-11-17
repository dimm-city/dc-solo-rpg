<!-- src/lib/tts/TTSRegion.svelte -->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { ttsManager, type TTSMode } from './tts-manager';
	import { regionPrefs, setRegionMode } from './tts-preferences';
	import { createTTSAttachment } from './tts-attachment';
	import { get } from 'svelte/store';

	// Runes-style props
	let { regionId, text, children } = $props<{
		regionId: string;
		text: string;
		children?: any;
	}>();

	const prefsStore = regionPrefs(regionId);

	// Reactive derivations
	let mode = $derived(get(prefsStore).mode);
	let voiceName = $derived(get(prefsStore).voiceName);

	function changeMode(newMode: TTSMode) {
		setRegionMode(regionId, newMode);
		if (newMode === 'off') {
			ttsManager.stop(regionId);
		}
	}

	function play() {
		const currentMode = get(prefsStore).mode;
		const currentVoiceName = get(prefsStore).voiceName;
		if (!text) return;
		if (currentMode === 'off') return;

		ttsManager.speak({ regionId, text, voiceName: currentVoiceName });
	}

	function stop() {
		ttsManager.stop(regionId);
	}

	onDestroy(() => {
		ttsManager.stop(regionId);
	});
</script>

<div class="tts-region">
	<div class="tts-controls">
		<button type="button" aria-label="Play narration" onclick={play} disabled={mode === 'off'}>
			▶
		</button>

		<button type="button" aria-label="Stop narration" onclick={stop}> ⏹ </button>

		<label>
			<input
				type="radio"
				name={`tts-mode-${regionId}`}
				value="manual"
				checked={mode === 'manual'}
				onchange={() => changeMode('manual')}
			/>
			Click to play
		</label>

		<label>
			<input
				type="radio"
				name={`tts-mode-${regionId}`}
				value="auto"
				checked={mode === 'auto'}
				onchange={() => changeMode('auto')}
			/>
			Autoplay
		</label>

		<label>
			<input
				type="radio"
				name={`tts-mode-${regionId}`}
				value="off"
				checked={mode === 'off'}
				onchange={() => changeMode('off')}
			/>
			Off
		</label>
	</div>

	<!--
		The content element has the attachment.
		Whenever `text` or `mode` changes, the attachment re-runs and
		may trigger autoplay depending on prefs.
	-->
	<div class="tts-content" use:createTTSAttachment={{ regionId, text, mode, voiceName }}>
		{@render children?.()}
	</div>
</div>

<style>
	.tts-region {
		position: relative;
	}

	.tts-controls {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-size: 0.85rem;
		opacity: 0.75;
		margin-bottom: 0.5rem;
	}

	.tts-controls button {
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(217, 70, 239, 0.1));
		border: 1px solid var(--color-neon-cyan, #00ffff);
		color: var(--color-text-primary, #ffffff);
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.2s;
		min-width: 2rem;
	}

	.tts-controls button:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(217, 70, 239, 0.2));
		box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
	}

	.tts-controls button:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.tts-controls label {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.8rem;
		color: var(--color-text-secondary, #cccccc);
		cursor: pointer;
	}

	.tts-controls input[type='radio'] {
		cursor: pointer;
	}

	.tts-content {
		margin-top: 0.25rem;
	}
</style>
