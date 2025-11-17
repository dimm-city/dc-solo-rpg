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
	let showModeMenu = $state(false);

	function changeMode(newMode: TTSMode) {
		setRegionMode(regionId, newMode);
		if (newMode === 'off') {
			ttsManager.stop(regionId);
		}
		showModeMenu = false;
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

	function toggleModeMenu() {
		showModeMenu = !showModeMenu;
	}

	onDestroy(() => {
		ttsManager.stop(regionId);
	});
</script>

<div class="tts-region">
	<div class="tts-controls">
		<button
			type="button"
			class="tts-btn play-btn"
			aria-label="Play narration"
			onclick={play}
			disabled={mode === 'off'}
			title="Play"
		>
			<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
				<path d="M2 1 L2 9 L8 5 Z" />
			</svg>
		</button>

		<button
			type="button"
			class="tts-btn stop-btn"
			aria-label="Stop narration"
			onclick={stop}
			title="Stop"
		>
			<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
				<rect x="2" y="2" width="6" height="6" />
			</svg>
		</button>

		<button
			type="button"
			class="tts-btn mode-btn"
			aria-label="TTS mode"
			onclick={toggleModeMenu}
			title="TTS Mode: {mode}"
		>
			<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
				<circle cx="5" cy="5" r="1.5" />
				<circle cx="5" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="0.5" />
			</svg>
		</button>

		{#if showModeMenu}
			<div class="mode-menu">
				<button
					class="mode-option"
					class:active={mode === 'manual'}
					onclick={() => changeMode('manual')}
				>
					Manual
				</button>
				<button
					class="mode-option"
					class:active={mode === 'auto'}
					onclick={() => changeMode('auto')}
				>
					Auto
				</button>
				<button class="mode-option" class:active={mode === 'off'} onclick={() => changeMode('off')}>
					Off
				</button>
			</div>
		{/if}
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
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		gap: 2px;
		align-items: center;
		opacity: 0.15;
		transition: opacity 0.2s ease;
		z-index: 10;
	}

	.tts-controls:hover {
		opacity: 0.8;
	}

	.tts-btn {
		background: rgba(0, 0, 0, 0.2);
		border: none;
		color: rgba(255, 255, 255, 0.6);
		padding: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 2px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
	}

	.tts-btn:hover:not(:disabled) {
		background: rgba(0, 255, 255, 0.15);
		color: rgba(0, 255, 255, 0.9);
	}

	.tts-btn:disabled {
		opacity: 0.2;
		cursor: not-allowed;
	}

	.tts-btn svg {
		width: 10px;
		height: 10px;
	}

	.mode-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 2px;
		background: rgba(10, 10, 20, 0.95);
		border: 1px solid rgba(0, 255, 255, 0.2);
		border-radius: 3px;
		padding: 2px;
		display: flex;
		flex-direction: column;
		gap: 1px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		min-width: 60px;
	}

	.mode-option {
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.6);
		padding: 4px 8px;
		cursor: pointer;
		font-size: 0.7rem;
		text-align: left;
		transition: all 0.15s ease;
		border-radius: 2px;
	}

	.mode-option:hover {
		background: rgba(0, 255, 255, 0.1);
		color: rgba(0, 255, 255, 0.9);
	}

	.mode-option.active {
		background: rgba(0, 255, 255, 0.15);
		color: rgba(0, 255, 255, 1);
	}

	.tts-content {
		position: relative;
	}

	/* Accessibility - make controls more visible for keyboard users */
	.tts-controls:focus-within {
		opacity: 0.9;
	}

	.tts-btn:focus-visible {
		outline: 1px solid rgba(0, 255, 255, 0.5);
		outline-offset: 1px;
	}
</style>
