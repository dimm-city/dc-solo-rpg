// src/lib/tts/tts-attachment.ts
import type { ActionReturn } from 'svelte/action';
import { ttsManager } from './tts-manager';
import type { TTSMode } from './tts-manager';

export interface TTSAttachmentConfig {
	regionId: string;
	text: string;
	mode: TTSMode;
	voiceName?: string;
}

export function createTTSAttachment(config: TTSAttachmentConfig): (node: HTMLElement) => ActionReturn<TTSAttachmentConfig> {
	return (element: HTMLElement, initialConfig: TTSAttachmentConfig) => {
		let currentConfig = initialConfig;

		// Optional: mark element for a11y tooling
		element.setAttribute('data-tts-region', currentConfig.regionId);

		// Auto-play behavior: only when mode is 'auto'
		const maybeAutoPlay = (cfg: TTSAttachmentConfig) => {
			if (cfg.mode === 'auto' && cfg.text) {
				ttsManager.speak({
					regionId: cfg.regionId,
					text: cfg.text,
					voiceName: cfg.voiceName
				});
			}
		};

		// Initial autoplay
		maybeAutoPlay(currentConfig);

		// Cleanup: stop speaking when element is detached or attachment re-runs
		return {
			update(newConfig: TTSAttachmentConfig) {
				const modeChanged = currentConfig.mode !== newConfig.mode;
				const textChanged = currentConfig.text !== newConfig.text;

				currentConfig = newConfig;

				// Auto-play when switching to auto mode, or when text changes in auto mode
				if (modeChanged || textChanged) {
					// Stop any existing speech first
					ttsManager.stop(newConfig.regionId);

					// Then maybe start new autoplay
					maybeAutoPlay(newConfig);
				}
			},
			destroy() {
				ttsManager.stop(currentConfig.regionId);
			}
		};
	};
}
