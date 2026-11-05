<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import ContinueButton from './ContinueButton.svelte';
	import RunRecap from './RunRecap.svelte';
	import { onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
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

	const SUIT_GLYPHS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
	const cardLabel = (event) => `${event.card}${SUIT_GLYPHS[event.suit] ?? ''}`;

	// Touch devices would open the keyboard over the sheet, so only focus the page on pointer devices
	const autofocusWriting =
		typeof matchMedia !== 'undefined' && !matchMedia('(pointer: coarse)').matches;

	// When the entry is saved on the final log the epitaph replaces the textarea: keep focus inside the dialog
	let epitaphEl = $state();
	$effect(() => {
		if (journalSaved && isFinal) tick().then(() => epitaphEl?.focus({ preventScroll: true }));
	});

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

<div
	class="journal-sheet dc-journal-container"
	class:final={isFinal}
	data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
>
	<!-- 1. Header: what this is, and where you stand -->
	<header class="sheet-header">
		<h2 class="sheet-title">
			{isFinal ? 'Final Log' : (gameState.config?.labels?.journalEntryHeader ?? 'Journal Entry')}
		</h2>
		{#if !isFinal}
			<p class="status-line" data-testid="journal-status-line">{statusLine}</p>
		{/if}
	</header>

	<div class="sheet-body">
		<!-- 2. What happened -->
		{#if isFinal}
			<section class="recap" aria-labelledby="recap-label">
				<h3 id="recap-label" class="section-label">Your run</h3>
				<div class="recap-scroll">
					<RunRecap compact showMoments />
				</div>
			</section>
		{:else if currentEvents.length > 0}
			<section class="round-log" aria-labelledby="round-log-label">
				<h3 id="round-log-label" class="section-label">This round</h3>
				<ul class="round-list">
					{#each currentEvents as event (event.id)}
						<li data-type={event.type}>
							<span class="round-card" aria-hidden="true">{cardLabel(event)}</span>
							<span class="round-text">{event.description}</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if journalSaved && isFinal}
			<!-- Epitaph: the saved entry, shown back -->
			<div
				class="epitaph"
				data-testid="journal-epitaph"
				tabindex="-1"
				bind:this={epitaphEl}
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
			<!-- 3. Prompts -->
			<div class="prompt-chips" role="group" aria-label="Prompts to reflect on">
				{#each prompts as prompt (prompt)}
					<button
						type="button"
						class="chip"
						disabled={saving || journalSaved}
						onclick={() => usePrompt(prompt)}>{prompt}</button
					>
				{/each}
			</div>

			<!-- 4. Writing: the main element -->
			<section class="writing">
				<h3 id="writing-label" class="section-label">Your entry</h3>
				<textarea
					bind:value={journalText}
					aria-labelledby="writing-label"
					placeholder={prompts[0] ?? 'Write your journal entry here...'}
					disabled={saving || journalSaved}
					data-autofocus={autofocusWriting ? '' : undefined}
					oninput={() => cancelAutoJournalTimer()}
				></textarea>
			</section>

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
	</div>

	<!-- 5. Actions, pinned to the bottom of the sheet -->
	<footer class="sheet-actions">
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
			<div class="action-row">
				{#if !showAudio && !audioURL && !isRecording}
					<button
						type="button"
						class="voice-toggle"
						disabled={saving}
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
				<ContinueButton
					class="record-entry"
					variant="primary"
					text={gameState.config?.labels?.journalEntrySaveButtonText ?? 'Record Entry'}
					onclick={() => handleSave()}
					testid="journal-save-button"
				/>
			</div>
		{/if}
	</footer>
</div>

<style>
	/* ============================================
	   JOURNAL SHEET
	   Full-screen sheet on phones, large centred panel on desktop.
	   Rows: header / body (flexes) / actions. The panel itself never scrolls.
	   ============================================ */

	.journal-sheet {
		display: flex;
		flex-direction: column;
		width: min(880px, 92vw);
		height: min(88dvh, 100%);
		box-sizing: border-box;
		/* 8px grid: 32px sides, 24px top/bottom */
		padding: var(--space-lg) var(--space-xl);
		gap: var(--space-md);
		overflow: hidden;
		background: rgba(8, 10, 18, 0.97);

		/* Theme frame instead of the default white border */
		--aug-border-all: 2px;
		--aug-border-bg: var(
			--frame-border,
			linear-gradient(135deg, var(--color-neon-cyan, #0ff), var(--color-cyber-magenta, #f0f))
		);
		--aug-tl: 16px;
		--aug-tr: 16px;
		--aug-br: 16px;
		--aug-bl: 16px;
	}

	/* Header */
	.sheet-header,
	.sheet-actions {
		width: 100%;
		max-width: 46rem;
		margin-inline: auto;
	}

	.sheet-header {
		flex: none;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-xs) var(--space-md);
		padding-bottom: var(--space-md);
		border-bottom: 1px solid rgba(255, 255, 255, 0.12);
	}

	.sheet-title {
		margin: 0;
		font-family: var(--font-display, inherit);
		font-size: 1.5rem;
		line-height: 1.2;
		letter-spacing: 0.04em;
		color: var(--color-brand-yellow, #ffe400);
	}

	.status-line {
		margin: 0;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
		font-size: 0.9375rem;
		letter-spacing: 0.05em;
		color: rgba(255, 255, 255, 0.8);
	}

	/* Body: sections stacked on a 16px rhythm, centred in a readable column */
	.sheet-body {
		flex: 1 1 auto;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		width: 100%;
		max-width: 46rem;
		margin: 0 auto;
		/* Safety valve for very short viewports only; normally nothing here scrolls */
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.section-label {
		margin: 0 0 var(--space-xs);
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 0.8125rem;
		font-weight: 400;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		text-shadow: none;
		color: rgba(255, 255, 255, 0.72);
	}

	/* What happened this round: compact, scrolls inside itself when long */
	.round-log {
		flex: none;
	}

	.round-list {
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: min(22dvh, 11rem);
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: thin;
		scrollbar-color: rgba(0, 255, 255, 0.5) transparent;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.03);
	}

	.round-list li {
		display: flex;
		align-items: baseline;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		font-size: 0.9375rem;
		line-height: 1.45;
		color: rgba(255, 255, 255, 0.92);
		border-left: 3px solid var(--round-accent, rgba(255, 255, 255, 0.3));
	}

	.round-list li + li {
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.round-list li[data-type='challenge'] {
		--round-accent: #ff8800;
	}
	.round-list li[data-type='event'] {
		--round-accent: #00ff88;
	}
	.round-list li[data-type='narrative'] {
		--round-accent: var(--color-neon-cyan, #0ff);
	}
	.round-list li[data-type='primary-success'] {
		--round-accent: var(--color-brand-yellow, #ffe400);
	}
	.round-list li[data-type='failure-counter'] {
		--round-accent: var(--color-danger, #ff4d6d);
	}

	.round-card {
		flex: none;
		min-width: 2.5rem;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
		color: var(--round-accent, rgba(255, 255, 255, 0.7));
	}

	/* The final log shows the whole run; it scrolls inside itself if long */
	.recap {
		flex: none;
	}

	.recap-scroll {
		max-height: min(34dvh, 18rem);
		overflow-y: auto;
		overscroll-behavior: contain;
		display: flex;
		justify-content: center;
	}

	/* Prompts */
	.prompt-chips {
		flex: none;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.chip {
		min-height: 44px;
		padding: var(--space-sm) var(--space-md);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.9375rem;
		line-height: 1.3;
		text-align: left;
		color: var(--color-neon-cyan, #0ff);
		background: transparent;
		border: 1px solid rgba(0, 255, 255, 0.45);
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

	/* Writing: takes every pixel the other sections leave */
	.writing {
		flex: 1 1 0;
		min-height: 10rem;
		display: flex;
		flex-direction: column;
	}

	textarea {
		flex: 1;
		width: 100%;
		min-height: 0;
		margin: 0;
		box-sizing: border-box;
		resize: none;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1.125rem;
		line-height: 1.6;
		padding: var(--space-md) var(--space-lg);
		color: var(--color-text-primary, #fff);
		background: rgba(0, 0, 0, 0.45);
		border: 1px solid rgba(217, 70, 239, 0.7);
		cursor: text;
		transition:
			border-color 200ms cubic-bezier(0.4, 0, 0.6, 1),
			box-shadow 200ms cubic-bezier(0.4, 0, 0.6, 1),
			background 200ms cubic-bezier(0.4, 0, 0.6, 1);
	}

	textarea:hover {
		border-color: rgba(217, 70, 239, 0.7);
		box-shadow: none;
	}

	textarea:focus {
		outline: none;
		border-color: var(--color-neon-cyan, #0ff);
		background: rgba(0, 0, 0, 0.6);
		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.3),
			inset 0 0 15px rgba(0, 255, 255, 0.1);
	}

	textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background: rgba(0, 0, 0, 0.3);
	}

	textarea::placeholder {
		color: rgba(255, 255, 255, 0.6);
	}

	/* Audio panel: a secondary section, opened from the voice note button */
	.audio-entry-area {
		flex: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 20, 30, 0.3));
		border: 2px solid rgba(0, 255, 255, 0.4);
		border-radius: 4px;
		min-height: 0;
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

	/* Epitaph: the saved entry, shown back */
	.epitaph {
		flex: 1 1 0;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--space-md);
		outline: none;
	}

	.epitaph blockquote {
		margin: 0;
		padding: var(--space-md) var(--space-lg);
		white-space: pre-wrap;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1.375rem;
		font-style: italic;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.95);
		border-left: 3px solid var(--color-neon-cyan, #0ff);
		text-align: left;
	}

	.epitaph blockquote.empty {
		color: rgba(255, 255, 255, 0.75);
	}

	.epitaph-by {
		margin: 0;
		padding-left: var(--space-lg);
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 0.8125rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.72);
	}

	/* Actions: pinned, primary on the right, voice note secondary on the left */
	.sheet-actions {
		flex: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding-top: var(--space-md);
		border-top: 1px solid rgba(255, 255, 255, 0.12);
	}

	.action-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
	}

	.action-row > :global(.aug-button-wrapper.record-entry) {
		margin: 0 0 0 auto;
	}

	.voice-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		min-height: 44px;
		padding: var(--space-sm) var(--space-md);
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 0.9375rem;
		color: rgba(255, 255, 255, 0.85);
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.35);
		border-radius: 4px;
		cursor: pointer;
	}

	.voice-toggle:hover:not(:disabled),
	.voice-toggle:focus-visible {
		color: var(--color-neon-cyan, #0ff);
		border-color: var(--color-neon-cyan, #0ff);
	}

	.saved-beat {
		margin: 0;
		text-align: center;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 1.125rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-brand-yellow, #ffe400);
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
		max-width: 18rem;
	}

	@media (prefers-reduced-motion: reduce) {
		textarea,
		.chip {
			transition: none;
		}
	}

	/* Phones: a full-screen sheet; the stage already insets it for notches */
	@media (max-width: 600px) {
		.journal-sheet {
			width: 100%;
			height: 100%;
			padding: var(--space-md);
			gap: var(--space-sm);
			--aug-tl: 0px;
			--aug-tr: 0px;
			--aug-br: 0px;
			--aug-bl: 0px;
			--aug-border-all: 0px;
		}

		.sheet-header {
			padding-bottom: var(--space-sm);
		}

		.round-list {
			max-height: 16dvh;
		}

		/* One scrollable row of chips: the writing area keeps the height */
		.prompt-chips {
			flex-wrap: nowrap;
			overflow-x: auto;
			scrollbar-width: none;
			overscroll-behavior-x: contain;
		}

		.chip {
			flex: none;
			white-space: nowrap;
		}

		textarea {
			font-size: 1.0625rem;
			padding: var(--space-md);
		}

		.sheet-actions {
			padding-top: var(--space-sm);
		}

		.action-row {
			flex-wrap: wrap-reverse;
			justify-content: center;
		}
	}

	/* Landscape phones: keep the writing area usable */
	@media (max-height: 500px) {
		.journal-sheet {
			padding: var(--space-sm) var(--space-md);
		}

		.round-list {
			max-height: 5.5rem;
		}

		.writing {
			min-height: 6rem;
		}
	}
</style>
