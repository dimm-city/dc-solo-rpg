<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import ContinueButton from './ContinueButton.svelte';
	import RunRecap from './RunRecap.svelte';
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';
	import { getAudioSettings, getGameplaySettings, speak } from '../stores/audioStore.svelte.js';
	import { logger } from '../utils/logger.js';
	import AudioRecorder from './journal/AudioRecorder.svelte';
	import AudioPlayback from './journal/AudioPlayback.svelte';
	import AutoJournalTimer from './journal/AutoJournalTimer.svelte';
	import { getEndingCause, getStatusLine } from '../utils/endingSummary.js';
	import { getJournalPrompts, getFinalPrompts } from '../configuration/journalPrompts.js';

	// How long "Entry saved" shows before the game moves on
	const SAVED_BEAT = 800;

	let {
		journalText = $bindable(''),
		audioData = $bindable(null),
		onSave,
		onRestart,
		onExit,
		journalSaved = false
	} = $props();

	const currentEvents = $derived(gameState.log.filter((l) => l.round === gameState.round));

	// The final log belongs to the ending: it covers the whole run
	const isFinal = $derived(gameState.gameOver);
	const statusLine = $derived(getStatusLine(gameState));
	const prompts = $derived(
		isFinal
			? getFinalPrompts(getEndingCause(gameState), gameState.win)
			: getJournalPrompts(currentEvents)
	);

	// Save flow: write -> "Entry saved" beat -> next round (or epitaph on the final log)
	let saving = $state(false);
	let savedText = $state('');
	let beatTimeout = null;
	const epitaphText = $derived(
		savedText ||
			gameState.journalEntries.find((entry) => entry.round === gameState.round)?.text ||
			''
	);
	let showAudio = $state(false);

	function usePrompt(prompt) {
		cancelAutoJournalTimer();
		journalText = journalText ? `${journalText.trimEnd()}\n\n${prompt}\n` : `${prompt}\n`;
	}

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
	let audioError = $state(null);

	// Auto-journal timer state
	let autoJournalTimer = $state(null);
	let autoJournalTimeRemaining = $state(0);
	let autoJournalInterval = $state(null);

	// Start recording
	async function startRecording() {
		// Cancel auto-journal timer when user starts interacting
		cancelAutoJournalTimer();

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
			logger.error('[JournalEntry] Error starting recording:', error);
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
			clearTimeout(beatTimeout);
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

	// ✅ FIXED: Extract timer logic to pure function, use proper cleanup pattern
	$effect(() => {
		// Only react to settings and journal saved state
		const gameplaySettings = getGameplaySettings();
		const audioSettings = getAudioSettings();
		const isSaved = journalSaved;

		// Setup timers based on current settings
		const cleanup = setupAutoJournaling(gameplaySettings, audioSettings, isSaved);

		// Cleanup on effect re-run or unmount
		return cleanup;
	});

	/**
	 * Pure function to setup auto-journaling timers
	 * Returns cleanup function
	 */
	function setupAutoJournaling(gameplaySettings, audioSettings, isSaved) {
		let interval = null;
		let timeout = null;
		let timeRemaining = 0;

		// Only run timer if not saved yet
		if (!isSaved) {
			// Speak prompt if enabled
			if (audioSettings.autoReadPrompts) {
				speak('Take a moment to reflect on what just happened.');
			}

			// Skip mode: immediately save
			if (gameplaySettings.autoHandleJournaling === 'skip') {
				// Small delay to allow UI to settle
				timeout = setTimeout(() => {
					handleSave(false);
				}, 500);
			}
			// Timed mode: countdown timer
			else if (gameplaySettings.autoHandleJournaling === 'timed') {
				const pauseTime = gameplaySettings.journalPauseTime;
				timeRemaining = pauseTime;
				autoJournalTimeRemaining = timeRemaining;

				// Update countdown every 100ms for smooth UI
				interval = setInterval(() => {
					timeRemaining = Math.max(0, timeRemaining - 100);
					autoJournalTimeRemaining = timeRemaining;

					if (timeRemaining <= 0) {
						clearInterval(interval);
						interval = null;
						handleSave();
					}
				}, 100);
			}
		}

		// Store references for cancelAutoJournalTimer
		autoJournalTimer = timeout;
		autoJournalInterval = interval;

		// Return cleanup function
		return () => {
			if (interval) {
				clearInterval(interval);
			}
			if (timeout) {
				clearTimeout(timeout);
			}
		};
	}

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

	// Wrapper for onSave: stops recording, shows "Entry saved" for a beat, then saves
	function handleSave(withBeat = true) {
		if (saving) return;
		saving = true;
		cancelAutoJournalTimer();
		if (isRecording) {
			stopRecording();
		}
		savedText = journalText.trim();
		beatTimeout = setTimeout(() => onSave(), withBeat ? SAVED_BEAT : 0);
	}
</script>

{#if isFinal}
	<div class="final-backdrop" class:victory={gameState.win} aria-hidden="true"></div>
{/if}

<div
	class="dc-journal-container"
	class:final={isFinal}
	in:fade={{ duration: ANIMATION_DURATION.NORMAL }}
	data-augmented-ui="tl-clip br-clip tr-clip bl-clip border"
>
	<div
		class="journal-header-area"
		in:fade={{ duration: ANIMATION_DURATION.SLOW, delay: ANIMATION_DURATION.FAST }}
	>
		<h6>
			{isFinal ? 'Final Log' : (gameState.config?.labels?.journalEntryHeader ?? 'Journal Entry')}
		</h6>

		{#if isFinal}
			<RunRecap compact showMoments />
		{:else}
			<p class="status-line" data-testid="journal-status-line">{statusLine}</p>
			{#each currentEvents as event (event.id)}
				<p>{event.description}</p>
			{/each}
		{/if}
	</div>

	{#if journalSaved && isFinal}
		<div
			class="epitaph"
			data-testid="journal-epitaph"
			in:fade={{ duration: ANIMATION_DURATION.SLOW }}
		>
			{#if epitaphText}
				<blockquote>{epitaphText}</blockquote>
			{:else}
				<blockquote class="empty">You left no words. The silence is a record too.</blockquote>
			{/if}
			<p class="epitaph-by">
				{gameState.player?.name ?? ''}, round {gameState.round}
			</p>
		</div>
	{:else}
		<div
			class="text-entry-area"
			in:scale={{
				duration: ANIMATION_DURATION.SLOW,
				delay: ANIMATION_DURATION.NORMAL,
				easing: cubicOut,
				start: 0.95
			}}
		>
			<div class="prompt-chips" aria-label="Prompts to reflect on">
				{#each prompts as prompt (prompt)}
					<button
						type="button"
						class="chip"
						disabled={saving || journalSaved}
						onclick={() => usePrompt(prompt)}>{prompt}</button
					>
				{/each}
			</div>
			<textarea
				bind:value={journalText}
				rows="5"
				placeholder={prompts[0] ?? 'Write your journal entry here...'}
				disabled={saving || journalSaved}
				oninput={() => cancelAutoJournalTimer()}
			></textarea>
			{#if !showAudio && !audioURL && !isRecording}
				<button
					type="button"
					class="voice-toggle"
					disabled={saving}
					aria-label="Add a voice note"
					title="Add a voice note"
					data-testid="journal-voice-toggle"
					onclick={() => (showAudio = true)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<rect x="9" y="2" width="6" height="12" rx="3" />
						<path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" />
					</svg>
					<span>Voice note</span>
				</button>
			{/if}
		</div>

		{#if showAudio || audioURL || isRecording}
			<div
				class="audio-entry-area"
				augmented-ui="tl-clip br-clip border"
				in:fade={{ duration: ANIMATION_DURATION.NORMAL }}
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
		{/if}
	{/if}

	<div class="button-area">
		<AutoJournalTimer
			timeRemaining={autoJournalTimeRemaining}
			totalTime={getGameplaySettings().journalPauseTime}
		/>

		{#if journalSaved && isFinal}
			<div class="final-actions">
				<ContinueButton
					text="Read your story"
					onclick={() => window.location.assign('/?story=1')}
					testid="journal-story-button"
				/>
				<ContinueButton
					text={gameState.config?.labels?.journalEntryRestartButtonText ?? 'Play again'}
					onclick={onRestart}
					testid="journal-restart-button"
				/>
				<ContinueButton text="Home" onclick={onExit} testid="journal-exit-button" />
			</div>
		{:else if saving}
			<p
				class="saved-beat"
				role="status"
				data-testid="journal-saved"
				in:fade={{ duration: ANIMATION_DURATION.FAST }}
			>
				Entry saved
			</p>
		{:else}
			<ContinueButton
				text={gameState.config?.labels?.journalEntrySaveButtonText ?? 'Record Entry'}
				onclick={() => handleSave()}
				testid="journal-save-button"
			/>
		{/if}
	</div>
</div>

<style>
	/* Final log sits over the Game Over backdrop */
	.final-backdrop {
		position: fixed;
		inset: 0;
		z-index: 0;
		background-color: #05070a;
		background-image:
			radial-gradient(circle at 50% 50%, rgba(255, 0, 255, 0.08), transparent 75%),
			radial-gradient(circle at 25% 75%, rgba(255, 42, 109, 0.1), transparent 70%);
	}

	.final-backdrop.victory {
		background-image:
			radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.12), transparent 75%),
			radial-gradient(circle at 25% 75%, rgba(0, 255, 100, 0.1), transparent 70%);
	}

	.dc-journal-container {
		position: relative;
		z-index: 1;
		display: grid;
		height: 100%;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr auto auto auto;

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
		max-width: min(90svw, var(--content-max, 720px));
		padding: var(--space-md);
		row-gap: var(--space-sm);

		/* Theme frame instead of the default white border */
		--aug-border-all: 2px;
		--aug-border-bg: var(
			--frame-border,
			linear-gradient(135deg, var(--color-neon-cyan, #0ff), var(--color-cyber-magenta, #f0f))
		);
		background: rgba(5, 7, 10, 0.85);
	}

	.button-area {
		grid-area: button-area;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: var(--space-md);
		padding: var(--space-xs) 0;
	}

	.saved-beat {
		margin: 0;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 1.125rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-brand-yellow, #ffe400);
	}

	.journal-header-area {
		grid-area: header-area;
		overflow-y: auto;
		max-height: 25svh;
		margin-bottom: var(--space-sm);
	}

	/* The final log shows the whole run, so it needs the room */
	.final .journal-header-area {
		max-height: none;
	}

	.final-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-sm);
		width: 100%;
	}

	.final-actions :global(button) {
		flex: 1 1 8rem;
		max-width: 14rem;
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

	.journal-header-area .status-line {
		text-align: center;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
		font-size: 0.875rem;
		letter-spacing: 0.05em;
		color: var(--color-brand-yellow, #ffe400);
	}

	.text-entry-area {
		grid-area: text-entry-area;
		display: flex;
		flex-direction: column;
		min-height: 0;
		margin-bottom: var(--space-sm);
	}

	.prompt-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs) var(--space-sm);
		margin-bottom: var(--space-sm);
	}

	.chip {
		padding: 0.25rem 0.75rem;
		min-height: 2rem;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.8125rem;
		color: var(--color-neon-cyan, #0ff);
		background: transparent;
		border: 1px solid rgba(0, 255, 255, 0.4);
		border-radius: 999px;
		cursor: pointer;
		transition:
			background 150ms ease-out,
			border-color 150ms ease-out;
	}

	.chip:hover:not(:disabled),
	.chip:focus-visible {
		background: rgba(0, 255, 255, 0.12);
		border-color: var(--color-neon-cyan, #0ff);
	}

	.chip:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.voice-toggle {
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		margin-top: var(--space-sm);
		padding: 0.25rem 0.5rem;
		min-height: 2rem;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 0.8125rem;
		color: rgba(255, 255, 255, 0.75);
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 4px;
		cursor: pointer;
	}

	.voice-toggle:hover:not(:disabled),
	.voice-toggle:focus-visible {
		color: var(--color-neon-cyan, #0ff);
		border-color: var(--color-neon-cyan, #0ff);
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
		color: rgba(255, 255, 255, 0.55);
	}

	/* Epitaph: the saved entry, shown back */
	.epitaph {
		grid-area: text-entry-area;
		margin-bottom: var(--space-sm);
		text-align: center;
	}

	.epitaph blockquote {
		margin: 0;
		padding: var(--space-md);
		max-height: 30svh;
		overflow-y: auto;
		white-space: pre-wrap;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1.125rem;
		font-style: italic;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.92);
		border-left: 2px solid var(--color-neon-cyan, #0ff);
		text-align: left;
	}

	.epitaph blockquote.empty {
		color: rgba(255, 255, 255, 0.7);
	}

	.epitaph-by {
		margin: var(--space-sm) 0 0;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 0.8125rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.7);
	}

	@media (prefers-reduced-motion: reduce) {
		textarea,
		.chip {
			transition: none;
		}
	}

	/* Audio Entry Area: a secondary panel, opened from the voice note button */
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

	/* The audio heading must not outrank "Journal entry" */
	.audio-entry-area :global(.audio-section-header) {
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.75);
	}

	.audio-entry-area :global(.audio-section-header .audio-header-icon) {
		color: inherit;
	}

	/* Responsive Design */
	@media (max-width: 640px) {
		.dc-journal-container {
			padding: var(--space-sm);
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
		}

		.journal-header-area h6 {
			font-size: var(--text-xl);
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
