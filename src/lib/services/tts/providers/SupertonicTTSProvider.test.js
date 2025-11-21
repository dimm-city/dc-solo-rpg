/**
 * Unit tests for SupertonicTTSProvider
 * Tests the Supertonic neural TTS provider
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupertonicTTSProvider, SUPERTONIC_VOICES } from './SupertonicTTSProvider.js';

// Mock ONNX Runtime
vi.mock('onnxruntime-web', () => ({
	InferenceSession: {
		create: vi.fn().mockResolvedValue({
			run: vi.fn().mockResolvedValue({
				encoded: { data: new Float32Array(128) },
				mel: { data: new Float32Array(256) },
				audio: { data: new Float32Array(22050) }
			})
		})
	},
	Tensor: vi.fn((type, data, dims) => ({ type, data, dims })),
	env: {
		wasm: {
			proxy: false,
			numThreads: 4
		}
	}
}));

// Mock Web Audio API
class MockAudioContext {
	constructor() {
		this.state = 'running';
		this.destination = {};
	}
	createBuffer(channels, length, sampleRate) {
		return {
			copyToChannel: vi.fn()
		};
	}
	createBufferSource() {
		return {
			buffer: null,
			connect: vi.fn(),
			start: vi.fn(),
			stop: vi.fn(),
			disconnect: vi.fn(),
			onended: null
		};
	}
	suspend() {
		this.state = 'suspended';
		return Promise.resolve();
	}
	resume() {
		this.state = 'running';
		return Promise.resolve();
	}
	close() {
		return Promise.resolve();
	}
}

describe('SupertonicTTSProvider', () => {
	let provider;

	beforeEach(() => {
		// Setup global mocks
		global.window = {
			AudioContext: MockAudioContext,
			fetch: vi.fn()
		};
		global.navigator = {
			hardwareConcurrency: 4
		};
		global.WebAssembly = {};

		provider = new SupertonicTTSProvider();
	});

	describe('Constructor', () => {
		it('should initialize with default values', () => {
			expect(provider.sessions.encoder).toBeNull();
			expect(provider.sessions.decoder).toBeNull();
			expect(provider.sessions.vocoder).toBeNull();
			expect(provider.currentVoice).toBe('F1');
			expect(provider.isInitialized).toBe(false);
			expect(provider.isPlaying).toBe(false);
			expect(provider.config.speed).toBe(1.0);
		});
	});

	describe('getName', () => {
		it('should return correct provider name', () => {
			expect(provider.getName()).toBe('Supertonic (Neural TTS)');
		});
	});

	describe('isSupported', () => {
		it('should return true when Web Audio and WASM are supported', () => {
			expect(provider.isSupported()).toBe(true);
		});

		it('should return false when WebAssembly is not supported', () => {
			const originalWasm = global.WebAssembly;
			delete global.WebAssembly;
			expect(provider.isSupported()).toBe(false);
			global.WebAssembly = originalWasm;
		});
	});

	describe('getVoices', () => {
		it('should return all available voices', async () => {
			const voices = await provider.getVoices();
			expect(voices).toHaveLength(4);
			expect(voices).toEqual([
				{ id: 'M1', name: 'Male Voice 1', language: 'en-US' },
				{ id: 'M2', name: 'Male Voice 2', language: 'en-US' },
				{ id: 'F1', name: 'Female Voice 1', language: 'en-US' },
				{ id: 'F2', name: 'Female Voice 2', language: 'en-US' }
			]);
		});
	});

	describe('SUPERTONIC_VOICES', () => {
		it('should have correct voice structure', () => {
			expect(SUPERTONIC_VOICES.F1).toEqual({
				id: 'F1',
				name: 'Female Voice 1',
				language: 'en-US',
				stylePath: '/tts-models/voice_styles/F1.json'
			});
		});

		it('should have all 4 voices', () => {
			expect(Object.keys(SUPERTONIC_VOICES)).toHaveLength(4);
			expect(SUPERTONIC_VOICES).toHaveProperty('M1');
			expect(SUPERTONIC_VOICES).toHaveProperty('M2');
			expect(SUPERTONIC_VOICES).toHaveProperty('F1');
			expect(SUPERTONIC_VOICES).toHaveProperty('F2');
		});
	});

	describe('stop', () => {
		it('should stop current playback', () => {
			provider.isPlaying = true;
			const mockSource = {
				stop: vi.fn(),
				disconnect: vi.fn()
			};
			provider.currentSource = mockSource;

			provider.stop();

			expect(mockSource.stop).toHaveBeenCalled();
			expect(mockSource.disconnect).toHaveBeenCalled();
			expect(provider.isPlaying).toBe(false);
			expect(provider.currentSource).toBeNull();
		});

		it('should handle missing source gracefully', () => {
			provider.currentSource = null;
			expect(() => provider.stop()).not.toThrow();
		});
	});

	describe('pause and resume', () => {
		beforeEach(() => {
			provider.audioContext = new MockAudioContext();
		});

		it('should pause audio context', () => {
			provider.pause();
			expect(provider.isPaused).toBe(true);
		});

		it('should resume audio context', () => {
			provider.audioContext.state = 'suspended';
			provider.resume();
			expect(provider.isPaused).toBe(false);
		});
	});

	describe('isSpeaking', () => {
		it('should return false when not playing', () => {
			provider.isPlaying = false;
			expect(provider.isSpeaking()).toBe(false);
		});

		it('should return false when paused', () => {
			provider.isPlaying = true;
			provider.isPaused = true;
			expect(provider.isSpeaking()).toBe(false);
		});

		it('should return true when playing and not paused', () => {
			provider.isPlaying = true;
			provider.isPaused = false;
			expect(provider.isSpeaking()).toBe(true);
		});
	});

	describe('setVoice', () => {
		it('should reject invalid voice', async () => {
			await expect(provider.setVoice('INVALID')).rejects.toThrow('Unknown voice: INVALID');
		});
	});

	describe('getCurrentVoice', () => {
		it('should return current voice', () => {
			expect(provider.getCurrentVoice()).toBe('F1');
		});

		it('should update when voice changes', () => {
			provider.currentVoice = 'M1';
			expect(provider.getCurrentVoice()).toBe('M1');
		});
	});

	describe('Text Processing', () => {
		it('should sanitize text correctly', () => {
			const input = '# Heading\n\nThis is **bold** and *italic* text.';
			const output = provider.sanitizeText(input);
			expect(output).toBe('Heading This is bold and italic text.');
		});

		it('should handle empty text', () => {
			expect(provider.sanitizeText('')).toBe('');
			expect(provider.sanitizeText(null)).toBe('');
		});
	});

	describe('dispose', () => {
		it('should clean up resources', async () => {
			provider.audioContext = new MockAudioContext();
			provider.isInitialized = true;

			const closeSpy = vi.spyOn(provider.audioContext, 'close');

			await provider.dispose();

			expect(closeSpy).toHaveBeenCalled();
			expect(provider.isInitialized).toBe(false);
			expect(provider.audioContext).toBeNull();
		});
	});

	describe('Configuration', () => {
		it('should have correct default config', () => {
			expect(provider.config).toEqual({
				speed: 1.0,
				denoisingSteps: 1.0,
				maxChunkLength: 200
			});
		});
	});
});
