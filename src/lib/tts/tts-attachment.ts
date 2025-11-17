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

export function createTTSAttachment(config: TTSAttachmentConfig): (node: HTMLElement) => ActionReturn {
	return (element: HTMLElement) => {
		// Optional: mark element for a11y tooling
		element.setAttribute('data-tts-region', config.regionId);

		// Auto-play behavior: only when mode is 'auto'
		if (config.mode === 'auto' && config.text) {
			ttsManager.speak({
				regionId: config.regionId,
				text: config.text,
				voiceName: config.voiceName
			});
		}

		// Cleanup: stop speaking when element is detached or attachment re-runs
		return {
			destroy() {
				ttsManager.stop(config.regionId);
			}
		};
	};
}
