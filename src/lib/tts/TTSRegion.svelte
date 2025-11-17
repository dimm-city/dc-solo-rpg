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

	function changeMode(newMode: TTSMode, event?: MouseEvent) {
		event?.stopPropagation();
		setRegionMode(regionId, newMode);
		if (newMode === 'off') {
			ttsManager.stop(regionId);
		}
		showModeMenu = false;
	}

	function play(event?: MouseEvent) {
		event?.stopPropagation();
		const currentMode = get(prefsStore).mode;
		const currentVoiceName = get(prefsStore).voiceName;
		if (!text) return;
		if (currentMode === 'off') return;

		ttsManager.speak({ regionId, text, voiceName: currentVoiceName });
	}

	function stop(event?: MouseEvent) {
		event?.stopPropagation();
		ttsManager.stop(regionId);
	}

	function toggleModeMenu(event?: MouseEvent) {
		event?.stopPropagation();
		showModeMenu = !showModeMenu;
	}

	onDestroy(() => {
		ttsManager.stop(regionId);
	});
</script>

<div class="tts-region">
	<div class="tts-controls" onclick={(e) => e.stopPropagation()}>
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
			<div class="mode-menu" onclick={(e) => e.stopPropagation()}>
				<button
					class="mode-option"
					class:active={mode === 'manual'}
					onclick={(e) => changeMode('manual', e)}
				>
					Manual
				</button>
				<button
					class="mode-option"
					class:active={mode === 'auto'}
					onclick={(e) => changeMode('auto', e)}
				>
					Auto
				</button>
				<button class="mode-option" class:active={mode === 'off'} onclick={(e) => changeMode('off', e)}>
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
		display: flex;
		gap: 4px;
		align-items: center;
		justify-content: flex-end;
		opacity: 0.2;
		transition: opacity 0.2s ease;
		margin-bottom: 4px;
	}

	.tts-controls:hover {
		opacity: 1;
	}

	.tts-btn {
		background: rgba(0, 0, 0, 0.3);
		border: none;
		color: rgba(255, 255, 255, 0.5);
		padding: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
	}

	.tts-btn:hover:not(:disabled) {
		background: rgba(0, 255, 255, 0.2);
		color: rgba(0, 255, 255, 1);
	}

	.tts-btn:disabled {
		opacity: 0.2;
		cursor: not-allowed;
	}

	.tts-btn svg {
		width: 12px;
		height: 12px;
	}

	.mode-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 2px;
		background: rgba(10, 10, 20, 0.98);
		border: 1px solid rgba(0, 255, 255, 0.3);
		border-radius: 4px;
		padding: 4px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
		min-width: 80px;
		z-index: 100;
	}

	.mode-option {
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.7);
		padding: 6px 10px;
		cursor: pointer;
		font-size: 0.75rem;
		text-align: left;
		transition: all 0.15s ease;
		border-radius: 3px;
	}

	.mode-option:hover {
		background: rgba(0, 255, 255, 0.15);
		color: rgba(0, 255, 255, 1);
	}

	.mode-option.active {
		background: rgba(0, 255, 255, 0.2);
		color: rgba(0, 255, 255, 1);
		font-weight: 600;
	}

	.tts-content {
		position: relative;
	}

	/* Accessibility - make controls more visible for keyboard users */
	.tts-controls:focus-within {
		opacity: 1;
	}

	.tts-btn:focus-visible {
		outline: 2px solid rgba(0, 255, 255, 0.6);
		outline-offset: 2px;
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.tts-controls {
			opacity: 0.4;
			gap: 6px;
		}

		.tts-btn {
			width: 32px;
			height: 32px;
			padding: 8px;
		}

		.tts-btn svg {
			width: 14px;
			height: 14px;
		}

		.mode-menu {
			min-width: 100px;
		}

		.mode-option {
			padding: 10px 12px;
			font-size: 0.875rem;
		}
	}

	/* Touch device optimization */
	@media (hover: none) and (pointer: coarse) {
		.tts-controls {
			opacity: 0.6;
		}

		.tts-btn {
			width: 36px;
			height: 36px;
		}

		.tts-btn svg {
			width: 16px;
			height: 16px;
		}
	}
</style>
