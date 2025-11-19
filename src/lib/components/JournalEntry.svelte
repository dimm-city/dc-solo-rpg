<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import ContinueButton from './ContinueButton.svelte';
	import ButtonBar from './ButtonBar.svelte';
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';
	import { getAudioSettings, getGameplaySettings, speak } from '../stores/audioStore.svelte.js';
	import AudioRecorder from './journal/AudioRecorder.svelte';
	import AudioPlayback from './journal/AudioPlayback.svelte';
	import AutoJournalTimer from './journal/AutoJournalTimer.svelte';

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

	// Auto-journal timer state
	let autoJournalTimer = $state(null);
	let autoJournalTimeRemaining = $state(0);
	let autoJournalInterval = $state(null);

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

	// Auto-journal timer effect
	$effect(() => {
		const gameplaySettings = getGameplaySettings();
		const audioSettings = getAudioSettings();

		// Clear any existing timer
		if (autoJournalInterval) {
			clearInterval(autoJournalInterval);
			autoJournalInterval = null;
		}
		if (autoJournalTimer) {
			clearTimeout(autoJournalTimer);
			autoJournalTimer = null;
		}

		// Only run timer if not saved yet
		if (!journalSaved) {
			// Speak prompt if enabled
			if (audioSettings.autoReadPrompts) {
				speak('Take a moment to reflect on what just happened.');
			}

			// Skip mode: immediately save
			if (gameplaySettings.autoHandleJournaling === 'skip') {
				// Small delay to allow UI to settle
				autoJournalTimer = setTimeout(() => {
					onSave();
				}, 500);
			}
			// Timed mode: countdown timer
			else if (gameplaySettings.autoHandleJournaling === 'timed') {
				const pauseTime = gameplaySettings.journalPauseTime;
				autoJournalTimeRemaining = pauseTime;

				// Update countdown every 100ms for smooth UI
				autoJournalInterval = setInterval(() => {
					autoJournalTimeRemaining = Math.max(0, autoJournalTimeRemaining - 100);

					if (autoJournalTimeRemaining <= 0) {
						clearInterval(autoJournalInterval);
						autoJournalInterval = null;
						onSave();
					}
				}, 100);
			}
		}

		// Cleanup on unmount or when saved
		return () => {
			if (autoJournalInterval) {
				clearInterval(autoJournalInterval);
			}
			if (autoJournalTimer) {
				clearTimeout(autoJournalTimer);
			}
		};
	});

	// Cancel timer if user starts interacting
	function cancelAutoJournalTimer() {
		if (autoJournalTimer) {
			clearTimeout(autoJournalTimer);
			autoJournalTimer = null;
		}
		if (autoJournalInterval) {
			clearInterval(autoJournalInterval);
			autoJournalInterval = null;
		}
		autoJournalTimeRemaining = 0;
	}

	// Cancel timer on user interaction
	$effect(() => {
		if (journalText || audioData || isRecording) {
			cancelAutoJournalTimer();
		}
	});
</script>

<div class="dc-journal-container" in:fade={{ duration: ANIMATION_DURATION.NORMAL }} data-augmented-ui="tl-clip br-clip tr-clip bl-clip border">
	<div
		class="journal-header-area"
		in:fade={{ duration: ANIMATION_DURATION.SLOW, delay: ANIMATION_DURATION.FAST }}
	>
		<h6>{gameState.config?.labels?.journalEntryHeader ?? 'Journal Entry'}</h6>
		

		{#each currentEvents as event (event.id)}
			<p>{event.description}</p>
		{/each}
	</div>

	<div
		class="text-entry-area"
		in:scale={{
			duration: ANIMATION_DURATION.SLOW,
			delay: ANIMATION_DURATION.NORMAL,
			easing: cubicOut,
			start: 0.95
		}}
	>
		<textarea
			bind:value={journalText}
			rows="5"
			placeholder="Write your journal entry here..."
			disabled={journalSaved}
		></textarea>
	</div>

	<div
		class="audio-entry-area"
		augmented-ui="tl-clip br-clip border"
		in:scale={{
			duration: ANIMATION_DURATION.SLOW,
			delay: ANIMATION_DURATION.SLOW,
			easing: cubicOut,
			start: 0.95
		}}
	>
		{#if audioURL}
			<AudioPlayback
				{recordingTime}
				{isPlaying}
				{journalSaved}
				onPlay={playAudio}
				onDelete={deleteAudio}
			/>
		{:else}
			<AudioRecorder
				{isRecording}
				{isPaused}
				{recordingTime}
				{journalSaved}
				{audioError}
				hasAudioURL={!!audioURL}
				onStart={startRecording}
				onPause={togglePause}
				onStop={stopRecording}
			/>
		{/if}
	</div>

	<div class="button-area">
		<AutoJournalTimer
			timeRemaining={autoJournalTimeRemaining}
			totalTime={getGameplaySettings().journalPauseTime}
		/>

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
		width: 80%;
		padding: var(--space-md);
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr auto auto auto;
		row-gap: var(--space-md);
		grid-auto-flow: row;
		grid-template-areas:
			'header-area'
			'.'
			'text-entry-area'
			'audio-entry-area'
			'button-area';
		box-sizing: border-box;
		overflow: hidden;
		align-items: end;
		background: var(--translucent-dark, black);
	}

	.button-area {
		grid-area: button-area;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: var(--space-md);
		padding: var(--space-xs) 0;
	}

	.journal-header-area {
		grid-area: header-area;
		overflow-y: auto;
		max-height: 25svh;
		margin-bottom: var(--space-sm);
	}

	.journal-header-area h6 {
		text-wrap: balance;
		text-wrap-mode: wrap;
		text-wrap-style: pretty;
		text-align: center;

	}

	.journal-header-area p {
		margin: var(--space-sm) 0;
		line-height: var(--line-height-base);
	}

	.text-entry-area {
		grid-area: text-entry-area;
		display: flex;
		flex-direction: column;
		min-height: 0;
		margin-bottom: var(--space-sm);
	}

	textarea {
		width: 100%;
		flex: 1;
		min-height: 4rem;
		max-height: 8rem;
		box-sizing: border-box;
		resize: vertical;
		font-family: 'Courier New', monospace;
		font-size: var(--text-base);
		line-height: var(--line-height-base);
		padding: var(--space-md);
		color: var(--color-text);
		margin-bottom: 0;
		transition:
			border-color 200ms cubic-bezier(0.4, 0, 0.6, 1),
			box-shadow 200ms cubic-bezier(0.4, 0, 0.6, 1),
			background 200ms cubic-bezier(0.4, 0, 0.6, 1);
	}

	textarea:focus {
		outline: none;
		border-color: var(--color-neon-cyan);
		background: rgba(0, 0, 0, 0.6);
		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.4),
			inset 0 0 15px rgba(0, 255, 255, 0.15);
	}

	textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background: rgba(0, 0, 0, 0.3);
	}

	textarea::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	@media (prefers-reduced-motion: reduce) {
		textarea {
			transition: none;
		}
	}

	/* Audio Entry Area */
	.audio-entry-area {
		grid-area: audio-entry-area;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 20, 30, 0.3));
		border: 2px solid rgba(0, 255, 255, 0.4);
		border-radius: 4px;
		min-height: 0;
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.15),
			inset 0 0 20px rgba(0, 255, 255, 0.05);

		/* Augmented UI */
		--aug-border-all: 2px;
		--aug-border-bg: rgba(0, 255, 255, 0.2);
		--aug-tl: 12px;
		--aug-br: 12px;
	}


	/* Responsive Design */
	@media (max-width: 640px) {
		.dc-journal-container {
			padding: var(--space-sm);
			row-gap: var(--space-sm);
			width: 100%;
		}

		.journal-header-area h6 {
			margin-bottom: var(--space-sm);
		}

		.audio-entry-area {
			padding: var(--space-sm);
			gap: var(--space-xs);
		}

	}

	@media (max-height: 700px) {
		.dc-journal-container {
			padding: var(--space-sm);
			row-gap: var(--space-sm);
		}

		.journal-header-area h6 {
			font-size: var(--text-xl);
			margin-bottom: var(--space-sm);
		}

		.journal-header-area blockquote {
			margin-bottom: var(--space-sm);
		}

		textarea {
			min-height: 3rem;
			max-height: 5rem;
			padding: var(--space-sm);
		}

		.audio-entry-area {
			padding: var(--space-sm);
		}

	}
</style>
