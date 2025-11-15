<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import ContinueButton from './ContinueButton.svelte';
	import ButtonBar from './ButtonBar.svelte';
	import { onMount } from 'svelte';

	let {
		journalText = $bindable(''),
		audioData = $bindable(null),
		onSave,
		onNext,
		onRestart,
		onExit,
		journalSaved = false
	} = $props();

	const currentEvents = $derived(gameState.log.filter((l) => l.round === gameState.round));

	// Audio recording state
	let mediaRecorder = $state(null);
	let audioChunks = $state([]);
	let isRecording = $state(false);
	let isPaused = $state(false);
	let recordingTime = $state(0);
	let recordingInterval = $state(null);
	let audioURL = $state(null);
	let isPlaying = $state(false);
	let audioElement = $state(null);
	let hasAudioPermission = $state(true);
	let audioError = $state(null);

	// Format time as MM:SS
	function formatTime(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	// Start recording
	async function startRecording() {
		try {
			audioError = null;
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			// Create MediaRecorder with appropriate format
			const options = { mimeType: 'audio/webm' };
			if (!MediaRecorder.isTypeSupported('audio/webm')) {
				options.mimeType = 'audio/mp4';
			}
			if (!MediaRecorder.isTypeSupported(options.mimeType)) {
				options.mimeType = '';
			}

			mediaRecorder = new MediaRecorder(stream, options);
			audioChunks = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunks.push(event.data);
				}
			};

			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				audioURL = URL.createObjectURL(audioBlob);

				// Convert to base64 for storage
				const reader = new FileReader();
				reader.readAsDataURL(audioBlob);
				reader.onloadend = () => {
					audioData = reader.result;
				};

				// Stop all tracks
				stream.getTracks().forEach((track) => track.stop());
			};

			mediaRecorder.start();
			isRecording = true;
			isPaused = false;
			recordingTime = 0;

			// Start timer
			recordingInterval = setInterval(() => {
				if (!isPaused) {
					recordingTime++;
				}
			}, 1000);
		} catch (error) {
			console.error('Error starting recording:', error);
			hasAudioPermission = false;
			audioError = 'Microphone access denied. Please enable microphone permissions.';
		}
	}

	// Pause/resume recording
	function togglePause() {
		if (!mediaRecorder) return;

		if (isPaused) {
			mediaRecorder.resume();
			isPaused = false;
		} else {
			mediaRecorder.pause();
			isPaused = true;
		}
	}

	// Stop recording
	function stopRecording() {
		if (mediaRecorder && isRecording) {
			mediaRecorder.stop();
			isRecording = false;
			isPaused = false;
			if (recordingInterval) {
				clearInterval(recordingInterval);
				recordingInterval = null;
			}
		}
	}

	// Play audio
	function playAudio() {
		if (!audioURL) return;

		if (audioElement && !audioElement.paused) {
			audioElement.pause();
			audioElement.currentTime = 0;
			isPlaying = false;
		} else {
			if (!audioElement) {
				audioElement = new Audio(audioURL);
				audioElement.onended = () => {
					isPlaying = false;
				};
			}
			audioElement.play();
			isPlaying = true;
		}
	}

	// Delete audio
	function deleteAudio() {
		if (audioElement) {
			audioElement.pause();
			audioElement = null;
		}
		if (audioURL) {
			URL.revokeObjectURL(audioURL);
		}
		audioURL = null;
		audioData = null;
		isPlaying = false;
		recordingTime = 0;
		audioError = null;
	}

	// Cleanup on unmount
	onMount(() => {
		return () => {
			if (recordingInterval) {
				clearInterval(recordingInterval);
			}
			if (audioElement) {
				audioElement.pause();
			}
			if (audioURL) {
				URL.revokeObjectURL(audioURL);
			}
			if (mediaRecorder && isRecording) {
				mediaRecorder.stream.getTracks().forEach((track) => track.stop());
			}
		};
	});

	// Reset audio when journal is saved
	$effect(() => {
		if (journalSaved && audioURL) {
			// Keep the audio for playback but stop recording
			if (isRecording) {
				stopRecording();
			}
		}
	});
</script>

<div class="dc-journal-container">
	<div class="journal-header-area">
		<h6>{gameState.config?.labels?.journalEntryHeader ?? 'Journal Entry'}</h6>
		<blockquote>
			{gameState.config?.labels?.journalEntrySubHeader ?? 'Record your progress'}
		</blockquote>

		{#each currentEvents as event (event.id)}
			<p>{event.description}</p>
		{/each}
	</div>

	<div class="text-entry-area">
		<textarea
			bind:value={journalText}
			rows="5"
			placeholder="Write your journal entry here..."
			disabled={journalSaved}
		></textarea>
	</div>

	<div class="audio-entry-area">
		<div class="audio-section-header">
			<span class="audio-icon">🎙️</span>
			<span>Audio Recording (Optional)</span>
		</div>

		{#if audioError}
			<div class="audio-error">
				<span class="error-icon">⚠️</span>
				{audioError}
			</div>
		{/if}

		{#if !audioURL && !isRecording}
			<!-- Initial state: No recording -->
			<button class="audio-button record-button" onclick={startRecording} disabled={journalSaved}>
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
						onclick={togglePause}
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

					<button class="audio-button stop-button" onclick={stopRecording} title="Stop Recording">
						<svg class="audio-button-icon" viewBox="0 0 24 24" fill="currentColor">
							<rect x="6" y="6" width="12" height="12" />
						</svg>
					</button>
				</div>
			</div>
		{:else if audioURL}
			<!-- Recording complete: Playback controls -->
			<div class="playback-controls">
				<div class="audio-info">
					<span class="audio-duration">{formatTime(recordingTime)}</span>
					<span class="audio-status">
						{#if isPlaying}
							Playing...
						{:else}
							Ready to play
						{/if}
					</span>
				</div>

				<div class="playback-buttons">
					<button
						class="audio-button play-button"
						onclick={playAudio}
						title={isPlaying ? 'Stop' : 'Play'}
					>
						{#if isPlaying}
							<svg class="audio-button-icon" viewBox="0 0 24 24" fill="currentColor">
								<rect x="6" y="4" width="4" height="16" />
								<rect x="14" y="4" width="4" height="16" />
							</svg>
						{:else}
							<svg class="audio-button-icon" viewBox="0 0 24 24" fill="currentColor">
								<path d="M8 5v14l11-7z" />
							</svg>
						{/if}
					</button>

					{#if !journalSaved}
						<button
							class="audio-button delete-button"
							onclick={deleteAudio}
							title="Delete Recording"
						>
							<svg
								class="audio-button-icon"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<polyline points="3 6 5 6 21 6" />
								<path
									d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
								/>
							</svg>
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<div class="button-area">
		{#if journalSaved}
			{#if gameState.gameOver}
				<ButtonBar bordered={false} gameBackground={false}>
					<ContinueButton
						text={gameState.config?.labels?.journalEntryRestartButtonText ?? 'Restart'}
						onclick={onRestart}
						testid="journal-restart-button"
					/>
					<ContinueButton
						text={gameState.config?.labels?.journalEntryExitButtonText ?? 'Exit'}
						onclick={onExit}
						testid="journal-exit-button"
					/>
				</ButtonBar>
			{:else}
				<ContinueButton
					text={gameState.config?.labels?.journalEntryNextButtonText ?? 'Continue to Next Round'}
					onclick={onNext}
					testid="journal-next-button"
				/>
			{/if}
		{:else}
			<ContinueButton
				text={gameState.config?.labels?.journalEntrySaveButtonText ?? 'Record Entry'}
				onclick={onSave}
				testid="journal-save-button"
			/>
		{/if}
	</div>
</div>

<style>
	.dc-journal-container {
		display: grid;
		height: 100%;
		padding: var(--space-xl);
		grid-template-columns: 1fr;
		grid-template-rows: 1fr auto auto auto;
		row-gap: var(--space-lg);
		grid-auto-flow: row;
		grid-template-areas:
			'header-area'
			'text-entry-area'
			'audio-entry-area'
			'button-area';
		box-sizing: border-box;
		overflow: hidden;
	}

	.button-area {
		grid-area: button-area;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.journal-header-area {
		grid-area: header-area;
		overflow-y: auto;
		max-height: 30vh;
		p {
			margin: var(--space-sm) 0;
		}
	}

	.text-entry-area {
		grid-area: text-entry-area;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	textarea {
		width: 100%;
		flex: 1;
		min-height: 6rem;
		max-height: 10rem;
		box-sizing: border-box;
		resize: vertical;
		font-family: 'Courier New', monospace;
		font-size: 1rem;
		padding: var(--space-md);
		background: rgba(0, 0, 0, 0.4);
		border: 2px solid rgba(0, 255, 255, 0.3);
		border-radius: 4px;
		color: var(--color-text);
		transition: all 0.3s ease;
	}

	textarea:focus {
		outline: none;
		border-color: var(--color-neon-cyan);
		box-shadow:
			0 0 10px rgba(0, 255, 255, 0.3),
			inset 0 0 10px rgba(0, 255, 255, 0.1);
	}

	textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	textarea::placeholder {
		color: rgba(255, 255, 255, 0.3);
	}

	/* Audio Entry Area */
	.audio-entry-area {
		grid-area: audio-entry-area;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-md);
		background: rgba(0, 0, 0, 0.3);
		border: 2px solid rgba(138, 43, 226, 0.3);
		border-radius: 4px;
		min-height: 0;
	}

	.audio-section-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: 0.875rem;
		color: rgba(138, 43, 226, 0.9);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.audio-icon {
		font-size: 1.25rem;
		filter: drop-shadow(0 0 4px rgba(138, 43, 226, 0.6));
	}

	.audio-error {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm);
		background: rgba(255, 0, 0, 0.1);
		border: 1px solid rgba(255, 0, 0, 0.3);
		border-radius: 4px;
		color: rgba(255, 100, 100, 0.9);
		font-size: 0.875rem;
	}

	.error-icon {
		font-size: 1rem;
	}

	/* Audio Buttons */
	.audio-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-lg);
		background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.3));
		border: 2px solid rgba(138, 43, 226, 0.5);
		border-radius: 4px;
		color: rgba(186, 85, 211, 1);
		font-family: 'Courier New', monospace;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		min-height: 44px;
	}

	.audio-button:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(75, 0, 130, 0.4));
		border-color: rgba(186, 85, 211, 0.8);
		box-shadow:
			0 0 15px rgba(138, 43, 226, 0.4),
			inset 0 0 10px rgba(138, 43, 226, 0.1);
		transform: translateY(-2px);
	}

	.audio-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.audio-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.audio-button-icon {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}

	.record-button {
		width: 100%;
	}

	/* Recording Controls */
	.recording-controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		align-items: center;
	}

	.recording-indicator {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		background: rgba(220, 20, 60, 0.1);
		border: 2px solid rgba(220, 20, 60, 0.4);
		border-radius: 4px;
		width: 100%;
		justify-content: center;
	}

	.pulse-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: rgba(220, 20, 60, 1);
		box-shadow: 0 0 10px rgba(220, 20, 60, 0.8);
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
			transform: scale(1.2);
		}
	}

	.recording-time {
		font-family: 'Courier New', monospace;
		font-size: 1.25rem;
		color: rgba(220, 20, 60, 1);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-shadow: 0 0 10px rgba(220, 20, 60, 0.5);
	}

	.recording-buttons {
		display: flex;
		gap: var(--space-md);
		width: 100%;
	}

	.pause-button,
	.stop-button {
		flex: 1;
		min-width: 0;
	}

	.stop-button {
		background: linear-gradient(135deg, rgba(220, 20, 60, 0.2), rgba(139, 0, 0, 0.3));
		border-color: rgba(220, 20, 60, 0.5);
		color: rgba(255, 69, 96, 1);
	}

	.stop-button:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(220, 20, 60, 0.3), rgba(139, 0, 0, 0.4));
		border-color: rgba(255, 69, 96, 0.8);
		box-shadow:
			0 0 15px rgba(220, 20, 60, 0.4),
			inset 0 0 10px rgba(220, 20, 60, 0.1);
	}

	/* Playback Controls */
	.playback-controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.audio-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		background: rgba(138, 43, 226, 0.1);
		border: 1px solid rgba(138, 43, 226, 0.3);
		border-radius: 4px;
	}

	.audio-duration {
		font-family: 'Courier New', monospace;
		font-size: 1rem;
		color: rgba(186, 85, 211, 1);
		font-weight: 700;
		letter-spacing: 0.1em;
	}

	.audio-status {
		font-size: 0.875rem;
		color: rgba(186, 85, 211, 0.8);
		font-style: italic;
	}

	.playback-buttons {
		display: flex;
		gap: var(--space-md);
		width: 100%;
	}

	.play-button {
		flex: 1;
		background: linear-gradient(135deg, rgba(0, 255, 127, 0.2), rgba(0, 139, 69, 0.3));
		border-color: rgba(0, 255, 127, 0.5);
		color: rgba(0, 255, 127, 1);
	}

	.play-button:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(0, 255, 127, 0.3), rgba(0, 139, 69, 0.4));
		border-color: rgba(0, 255, 127, 0.8);
		box-shadow:
			0 0 15px rgba(0, 255, 127, 0.4),
			inset 0 0 10px rgba(0, 255, 127, 0.1);
	}

	.delete-button {
		flex: 0 0 auto;
		padding: var(--space-md);
		background: linear-gradient(135deg, rgba(255, 69, 0, 0.2), rgba(178, 34, 34, 0.3));
		border-color: rgba(255, 69, 0, 0.5);
		color: rgba(255, 99, 71, 1);
	}

	.delete-button:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(255, 69, 0, 0.3), rgba(178, 34, 34, 0.4));
		border-color: rgba(255, 99, 71, 0.8);
		box-shadow:
			0 0 15px rgba(255, 69, 0, 0.4),
			inset 0 0 10px rgba(255, 69, 0, 0.1);
	}

	/* Responsive Design */
	@media (max-width: 640px) {
		.dc-journal-container {
			padding: var(--space-md);
			row-gap: var(--space-md);
		}

		.audio-entry-area {
			padding: var(--space-sm);
		}

		.audio-section-header {
			font-size: 0.75rem;
		}

		.audio-button {
			padding: var(--space-sm) var(--space-md);
			font-size: 0.75rem;
			min-height: 40px;
		}

		.recording-time {
			font-size: 1rem;
		}

		.playback-buttons {
			flex-direction: column;
		}

		.delete-button {
			flex: 1;
		}
	}

	@media (max-height: 700px) {
		.dc-journal-container {
			padding: var(--space-md);
			row-gap: var(--space-sm);
		}

		.journal-header-area {
			max-height: 20vh;
		}

		textarea {
			min-height: 4rem;
			max-height: 6rem;
		}

		.audio-entry-area {
			padding: var(--space-sm);
		}

		.audio-button {
			padding: var(--space-sm);
			font-size: 0.75rem;
			min-height: 36px;
		}
	}
</style>
