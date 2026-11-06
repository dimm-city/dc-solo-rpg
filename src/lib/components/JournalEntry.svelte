<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import ContinueButton from './ContinueButton.svelte';
	import RunRecap from './RunRecap.svelte';
	import { onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';
	import { getAudioSettings, getGameplaySettings, speak } from '../stores/audioStore.svelte.js';
	import VoiceNote from './journal/VoiceNote.svelte';
	import AutoJournalTimer from './journal/AutoJournalTimer.svelte';
	import { getEndingCause, getStatusLine } from '../utils/endingSummary.js';
	import { getJournalPrompts, getFinalPrompts } from '../configuration/journalPrompts.js';

	// How long "Saved to your log" shows before the game moves on
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
	const sheetLabel = $derived(
		isFinal
			? `Round ${gameState.round}`
			: (gameState.config?.labels?.journalEntryHeader ?? 'Journal')
	);
	const sheetTitle = $derived(isFinal ? 'Final Log' : `Round ${gameState.round}`);

	// Save flow: write -> "Saved to your log" beat -> next round (or epitaph on the final log)
	let saving = $state(false);
	let savedText = $state('');
	let beatTimeout = null;
	const epitaphText = $derived(
		savedText ||
			gameState.journalEntries.find((entry) => entry.round === gameState.round)?.text ||
			''
	);

	let voiceNote = $state();

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

	// Auto-journal timer state
	let autoJournalTimer = $state(null);
	let autoJournalTimeRemaining = $state(0);
	let autoJournalInterval = $state(null);

	onMount(() => () => clearTimeout(beatTimeout));

	$effect(() => {
		// Only react to settings and journal saved state
		const gameplaySettings = getGameplaySettings();
		const audioSettings = getAudioSettings();
		const isSaved = journalSaved;
		return setupAutoJournaling(gameplaySettings, audioSettings, isSaved);
	});

	/**
	 * Set up auto-journaling timers; returns the cleanup
	 */
	function setupAutoJournaling(gameplaySettings, audioSettings, isSaved) {
		let interval = null;
		let timeout = null;
		let timeRemaining = 0;

		if (!isSaved) {
			if (audioSettings.autoReadPrompts) {
				speak('Take a moment to reflect on what just happened.');
			}

			if (gameplaySettings.autoHandleJournaling === 'skip') {
				// Skip mode: save straight away, after the sheet has settled
				timeout = setTimeout(() => handleSave(false), 500);
			} else if (gameplaySettings.autoHandleJournaling === 'timed') {
				// Timed mode: countdown, updated every 100ms
				timeRemaining = gameplaySettings.journalPauseTime;
				autoJournalTimeRemaining = timeRemaining;
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

		autoJournalTimer = timeout;
		autoJournalInterval = interval;

		return () => {
			if (interval) clearInterval(interval);
			if (timeout) clearTimeout(timeout);
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

	// Stops any recording, shows "Saved to your log" for a beat, then saves
	function handleSave(withBeat = true) {
		if (saving) return;
		saving = true;
		cancelAutoJournalTimer();
		voiceNote?.stop();
		savedText = journalText.trim();
		beatTimeout = setTimeout(() => onSave(), withBeat ? SAVED_BEAT : 0);
	}
</script>

<div
	class="journal-sheet dc-journal-container"
	class:final={isFinal}
	class:won={isFinal && gameState.win}
	class:saving
	data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
>
	<!-- 1. Header: what this is, and where you stand -->
	<header class="sheet-header">
		<div class="sheet-heading">
			<p class="sheet-label">{sheetLabel}</p>
			<h2 class="sheet-title">{sheetTitle}</h2>
		</div>
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
		{/if}
	</div>

	<!-- 5. Actions, pinned to the bottom of the sheet: voice note left, Record Entry right -->
	<footer class="sheet-actions">
		<AutoJournalTimer
			timeRemaining={autoJournalTimeRemaining}
			totalTime={getGameplaySettings().journalPauseTime}
		/>

		{#if journalSaved && isFinal}
			<div class="final-actions">
				<ContinueButton
					text="Read your story"
					variant="primary"
					onclick={() => window.location.assign('/?story=1')}
					testid="journal-story-button"
				/>
				<div class="text-actions">
					<button
						type="button"
						class="text-action"
						onclick={onRestart}
						data-testid="journal-restart-button"
					>
						{gameState.config?.labels?.journalEntryRestartButtonText ?? 'Play again'}
					</button>
					<button
						type="button"
						class="text-action"
						onclick={onExit}
						data-testid="journal-exit-button"
					>
						Home
					</button>
				</div>
			</div>
		{:else}
			<div class="action-row">
				{#if !journalSaved}
					<VoiceNote
						bind:this={voiceNote}
						bind:audioData
						disabled={saving}
						onstart={cancelAutoJournalTimer}
					/>
				{/if}
				<!-- One slot: the button, then the saved beat in its place -->
				<div class="save-slot">
					{#if saving}
						<p
							class="saved-beat"
							role="status"
							data-testid="journal-saved"
							in:fade={{ duration: ANIMATION_DURATION.FAST }}
						>
							<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
								<path d="M20 6 9 17l-5-5" />
							</svg>
							Saved to your log
						</p>
					{:else}
						<ContinueButton
							class="record-entry"
							variant="primary"
							text={gameState.config?.labels?.journalEntrySaveButtonText ?? 'Record Entry'}
							onclick={() => handleSave()}
							testid="journal-save-button"
						/>
					{/if}
				</div>
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

	/* The ending: the frame takes the ending's colour */
	.journal-sheet.final {
		--aug-border-bg: linear-gradient(135deg, #ff2a6d, var(--color-cyber-magenta, #f0f));
	}

	.journal-sheet.final.won {
		--aug-border-bg: linear-gradient(135deg, #ffe400, #00ff64);
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
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-xs) var(--space-md);
		padding-bottom: var(--space-md);
		border-bottom: 1px solid rgba(255, 255, 255, 0.12);
	}

	.sheet-heading {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.sheet-label,
	.section-label {
		margin: 0;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-shadow: none;
		color: rgba(255, 255, 255, 0.72);
	}

	.sheet-label {
		color: var(--color-neon-cyan, #0ff);
	}

	/* Display face only at 28px and up */
	.sheet-title {
		margin: 0;
		font-family: var(--font-display, inherit);
		font-size: 2rem;
		font-weight: normal;
		line-height: 1.1;
		letter-spacing: 0.04em;
		white-space: nowrap;
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
		margin-bottom: var(--space-xs);
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

	/* Prompts: chips wrap, on every screen */
	.prompt-chips {
		flex: none;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.chip {
		min-height: 44px;
		max-width: 100%;
		padding: var(--space-sm) var(--space-md);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.9375rem;
		line-height: 1.3;
		text-align: left;
		color: var(--color-neon-cyan, #0ff);
		background: transparent;
		border: 1px solid rgba(0, 255, 255, 0.45);
		border-radius: 22px;
		cursor: pointer;
		transition:
			background 120ms ease-out,
			border-color 120ms ease-out;
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
			background 200ms cubic-bezier(0.4, 0, 0.6, 1),
			opacity 200ms ease-out;
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

	/* The saved beat: what you wrote steps back while the confirmation takes the button's place */
	.journal-sheet.saving textarea:disabled {
		opacity: 0.6;
		cursor: default;
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
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.72);
	}

	/* Actions: pinned, voice note on the left, Record Entry on the right */
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
		gap: var(--space-md);
		min-height: 52px;
	}

	.save-slot {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		min-height: 52px;
		margin-left: auto;
	}

	.save-slot :global(.aug-button-wrapper.record-entry) {
		margin: 0;
	}

	.saved-beat {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		margin: 0;
		padding: 0 var(--space-md);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1.0625rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--color-neon-cyan, #0ff);
		text-shadow: 0 0 12px rgba(0, 255, 255, 0.45);
	}

	.saved-beat svg {
		fill: none;
		stroke: currentColor;
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* The ending's actions: one primary, two quiet text buttons */
	.final-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
	}

	.text-actions {
		display: flex;
		justify-content: center;
		gap: var(--space-lg);
	}

	.text-action {
		min-height: 44px;
		padding: 0 var(--space-md);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.82);
		background: none;
		border: none;
		cursor: pointer;
		text-decoration: underline;
		text-decoration-color: rgba(255, 255, 255, 0.3);
		text-underline-offset: 0.3em;
	}

	.text-action:hover,
	.text-action:focus-visible {
		color: var(--color-neon-cyan, #0ff);
		text-decoration-color: currentColor;
	}

	.text-action:focus-visible {
		outline: 2px solid var(--color-neon-cyan, #0ff);
		outline-offset: 2px;
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

		.sheet-title {
			font-size: 1.75rem;
		}

		.round-list {
			max-height: 16dvh;
		}

		textarea {
			font-size: 1.0625rem;
			padding: var(--space-md);
		}

		.sheet-actions {
			padding-top: var(--space-sm);
		}

		/* One row: the 44px mic, then Record Entry filling the rest */
		.action-row {
			gap: var(--space-sm);
		}

		.save-slot {
			flex: 1;
			justify-content: center;
		}

		.save-slot :global(.aug-button-wrapper.record-entry) {
			flex: 1;
			max-width: none;
		}

		.save-slot :global(.aug-button-wrapper.record-entry .aug-button) {
			width: 100%;
			padding-inline: var(--space-sm);
			white-space: nowrap;
		}
	}

	/* Landscape phones: keep the writing area usable */
	@media (max-height: 500px) {
		.journal-sheet {
			padding: var(--space-sm) var(--space-md);
			gap: var(--space-sm);
		}

		.sheet-header {
			padding-bottom: var(--space-xs);
		}

		.sheet-title {
			font-size: 1.75rem;
		}

		/* Landscape phones: the writing area comes first; labels go, the lists shrink to a row */
		.section-label {
			display: none;
		}

		.sheet-body {
			gap: var(--space-sm);
		}

		.round-list {
			max-height: 2.75rem;
		}

		.round-list li {
			padding-block: var(--space-xs);
		}

		.prompt-chips {
			flex-wrap: nowrap;
			overflow-x: auto;
			scrollbar-width: none;
		}

		.chip {
			flex: none;
			white-space: nowrap;
		}

		/* The Game Over screen just showed the recap: here the writing gets the room */
		.journal-sheet.final .recap {
			display: none;
		}

		.chip {
			min-height: 36px;
			padding: 0.25rem var(--space-md);
		}

		.writing {
			min-height: 5rem;
		}

		.sheet-actions {
			padding-top: var(--space-xs);
		}

		.action-row,
		.save-slot {
			min-height: 44px;
		}
	}
</style>
