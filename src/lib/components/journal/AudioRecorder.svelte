<script>
	/**
	 * AudioRecorder - Audio recording interface component
	 *
	 * Displays recording controls: start button, pause/resume, stop button
	 * Shows recording indicator with timer
	 * Handles error states and disabled states
	 *
	 * @component
	 * @example
	 * <AudioRecorder
	 *   {isRecording}
	 *   {isPaused}
	 *   {recordingTime}
	 *   {journalSaved}
	 *   {audioError}
	 *   {hasAudio URL}
	 *   onStart={startRecording}
	 *   onPause={togglePause}
	 *   onStop={stopRecording}
	 * />
	 */

	let {
		isRecording = false,
		isPaused = false,
		recordingTime = 0,
		journalSaved = false,
		audioError = null,
		hasAudioURL = false,
		onStart = () => {},
		onPause = () => {},
		onStop = () => {}
	} = $props();

	// Format time as MM:SS
	function formatTime(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div class="audio-recorder">
	<div class="audio-section-header">
		<svg
			class="audio-header-icon"
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
			<circle cx="12" cy="10" r="3" />
			<path d="M9 10v2a3 3 0 006 0v-2" />
			<path d="M12 15v5" />
			<path d="M9 20h6" />
		</svg>
		<span>Audio Recording (Optional)</span>
	</div>

	{#if audioError}
		<div class="audio-error">
			<svg
				class="error-icon"
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
				<path
					d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
				/>
				<line x1="12" y1="9" x2="12" y2="13" />
				<line x1="12" y1="17" x2="12.01" y2="17" />
			</svg>
			{audioError}
		</div>
	{/if}

	{#if !hasAudioURL && !isRecording}
		<!-- Initial state: No recording -->
		<button class="audio-button record-button" onclick={onStart} disabled={journalSaved}>
			<svg
				class="audio-button-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<circle cx="12" cy="10" r="3" />
				<path d="M9 10v2a3 3 0 006 0v-2" />
				<path d="M12 15v5" />
				<path d="M9 20h6" />
			</svg>
			<span>Start Recording</span>
		</button>
	{:else if isRecording}
		<!-- Recording in progress -->
		<div class="recording-controls">
			<div class="recording-indicator">
				<span class="pulse-dot"></span>
				<span class="recording-time">{formatTime(recordingTime)}</span>
			</div>

			<div class="recording-buttons">
				<button
					class="audio-button pause-button"
					onclick={onPause}
					title={isPaused ? 'Resume' : 'Pause'}
				>
					{#if isPaused}
						<svg class="audio-button-icon" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z" />
						</svg>
					{:else}
						<svg class="audio-button-icon" viewBox="0 0 24 24" fill="currentColor">
							<rect x="6" y="4" width="4" height="16" />
							<rect x="14" y="4" width="4" height="16" />
						</svg>
					{/if}
				</button>

				<button class="audio-button stop-button" onclick={onStop} title="Stop Recording">
					<svg class="audio-button-icon" viewBox="0 0 24 24" fill="currentColor">
						<rect x="6" y="6" width="12" height="12" />
					</svg>
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.audio-recorder {
		width: 100%;
	}

	.audio-section-header {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		margin-bottom: var(--space-sm);
		color: var(--color-neon-cyan);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		letter-spacing: var(--letter-spacing-wide);
		text-transform: uppercase;
	}

	.audio-header-icon {
		color: var(--color-neon-cyan);
	}

	.audio-error {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-sm);
		background: rgba(255, 0, 0, 0.1);
		border: 1px solid rgba(255, 0, 0, 0.3);
		border-radius: 4px;
		color: rgba(255, 100, 100, 0.9);
		font-size: var(--text-sm);
		margin-bottom: var(--space-sm);
	}

	.error-icon {
		color: rgba(255, 100, 100, 0.9);
		flex-shrink: 0;
	}

	.audio-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(217, 70, 239, 0.1));
		border: 2px solid var(--color-neon-cyan);
		border-radius: 4px;
		color: var(--color-neon-cyan);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		letter-spacing: var(--letter-spacing-wide);
		text-transform: uppercase;
		cursor: pointer;
		transition:
			background 0.2s,
			border-color 0.2s,
			transform 0.1s;
		width: 100%;
	}

	.audio-button:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(217, 70, 239, 0.2));
		border-color: var(--color-neon-pink);
		box-shadow:
			0 0 10px rgba(0, 255, 255, 0.3),
			0 0 20px rgba(217, 70, 239, 0.2);
	}

	.audio-button:active:not(:disabled) {
		transform: translateY(1px);
		box-shadow:
			0 0 5px rgba(0, 255, 255, 0.2),
			0 0 10px rgba(217, 70, 239, 0.1);
	}

	.audio-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.audio-button-icon {
		width: 20px;
		height: 20px;
	}

	.recording-controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.recording-indicator {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm);
		background: rgba(255, 0, 0, 0.1);
		border: 1px solid rgba(255, 0, 0, 0.3);
		border-radius: 4px;
	}

	.pulse-dot {
		width: 12px;
		height: 12px;
		background: #ff0000;
		border-radius: 50%;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.1);
		}
	}

	.recording-time {
		font-family: 'Courier New', monospace;
		font-size: var(--text-lg);
		color: var(--color-text-primary);
		font-weight: 600;
	}

	.recording-buttons {
		display: flex;
		gap: var(--space-sm);
	}

	.recording-buttons .audio-button {
		flex: 1;
	}

	.pause-button {
		background: linear-gradient(135deg, rgba(255, 200, 0, 0.1), rgba(255, 150, 0, 0.1));
		border-color: rgba(255, 200, 0, 0.6);
		color: rgba(255, 200, 0, 0.9);
	}

	.pause-button:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(255, 200, 0, 0.2), rgba(255, 150, 0, 0.2));
		border-color: rgba(255, 200, 0, 0.9);
	}

	.stop-button {
		background: linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(200, 0, 0, 0.1));
		border-color: rgba(255, 0, 0, 0.6);
		color: rgba(255, 100, 100, 0.9);
	}

	.stop-button:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(255, 0, 0, 0.2), rgba(200, 0, 0, 0.2));
		border-color: rgba(255, 0, 0, 0.9);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.audio-section-header {
			font-size: var(--text-xs);
		}

		.audio-header-icon {
			width: 14px;
			height: 14px;
		}

		.audio-button {
			padding: var(--space-xs) var(--space-sm);
			font-size: var(--text-xs);
		}

		.recording-time {
			font-size: var(--text-base);
		}
	}

	@media (max-width: 480px) {
		.audio-button span {
			display: none;
		}

		.audio-button-icon {
			width: 24px;
			height: 24px;
		}

		.recording-time {
			font-size: var(--text-sm);
		}
	}

	/* Accessibility: Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.pulse-dot {
			animation: none;
			opacity: 1;
		}

		.audio-button {
			transition: none;
		}
	}
</style>
