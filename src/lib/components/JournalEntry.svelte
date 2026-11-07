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
	import { getStatusLine } from '../utils/endingSummary.js';

	// How long "Saved to your log" shows before the game moves on
	const SAVED_BEAT = 800;
	// A result moves on by itself, and on a phone Record Entry opens where the step button was:
	// a press in the sheet's first 400ms was meant for that button (the same guard it has when
	// it changes meaning), so Record Entry ignores it rather than saving an empty entry.
	const OPEN_GUARD_MS = 400;
	const openedAt = typeof performance === 'undefined' ? 0 : performance.now();

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

	// Desktop only: a touch device would open its keyboard over the sheet (owner decision), so the
	// page is focused only where a mouse or trackpad drives it
	const autofocusWriting =
		typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches;

	// When the entry is saved on the final log the epitaph replaces the textarea: keep focus inside the dialog
	let epitaphEl = $state();
	$effect(() => {
		if (journalSaved && isFinal) tick().then(() => epitaphEl?.focus({ preventScroll: true }));
	});

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

	/** Record Entry, unless the sheet has only just opened (see OPEN_GUARD_MS) */
	function recordEntry() {
		if (performance.now() - openedAt < OPEN_GUARD_MS) return;
		handleSave();
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
	class:saved={journalSaved}
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

	<!-- 3. Voice note. Before the writing in the DOM, so the tab order runs voice note, entry,
	     Record Entry (Shift+Tab from the entry reaches it); the grid shows it on the footer row. -->
	{#if !journalSaved}
		<div class="voice-slot">
			<VoiceNote
				bind:this={voiceNote}
				bind:audioData
				disabled={saving}
				onstart={cancelAutoJournalTimer}
			/>
		</div>
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
		<!-- 4. Writing: the main element. No prompts (owner decision): the round's cards above
		     are the material, and the page is the player's own. -->
		<section class="writing">
			<h3 id="writing-label" class="section-label">Your entry</h3>
			<textarea
				bind:value={journalText}
				aria-labelledby="writing-label"
				placeholder={isFinal ? 'Write your final entry' : 'Write about this round'}
				disabled={saving || journalSaved}
				data-autofocus={autofocusWriting ? '' : undefined}
				oninput={() => cancelAutoJournalTimer()}
			></textarea>
		</section>
	{/if}

	<!-- 5. Footer, pinned: the rule (and the auto-journal countdown) across the sheet, then the
	     voice note (above) on the left and Record Entry on the right -->
	<div class="timer-slot">
		<AutoJournalTimer
			timeRemaining={autoJournalTimeRemaining}
			totalTime={getGameplaySettings().journalPauseTime}
		/>
	</div>

	<div class="sheet-actions">
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
						onclick={recordEntry}
						testid="journal-save-button"
					/>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	/* ============================================
	   JOURNAL SHEET
	   Full-screen sheet on phones, a 46rem reading column on desktop.
	   Grid rows: header / the round's cards / the writing (flexes) / footer rule / footer row.
	   The footer row is two cells, the voice note and Record Entry: the voice note comes before
	   the writing in the DOM (tab order), the grid puts it on the footer row. Only a pane ever
	   scrolls, never the sheet.
	   ============================================ */

	.journal-sheet {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		grid-template-rows: auto auto minmax(0, 1fr) auto auto;
		grid-template-areas:
			'header header'
			'log log'
			'main main'
			'timer timer'
			'voice actions';
		column-gap: var(--space-md);
		/* 46rem of content plus 32px sides (8px grid: 32px sides, 24px top/bottom) */
		width: min(calc(46rem + 2 * var(--space-xl)), 92vw);
		height: min(88dvh, 100%);
		box-sizing: border-box;
		padding: var(--space-lg) var(--space-xl);
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
	.sheet-header {
		grid-area: header;
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-xs) var(--space-md);
		margin-bottom: var(--space-md);
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

	.section-label {
		margin-bottom: var(--space-xs);
	}

	/* What happened this round: every card of the round, with no scroller of its own (owner
	   decision). A typical round (up to 6 cards) fits; past that the list scrolls. */
	.round-log,
	.recap {
		grid-area: log;
		margin-bottom: var(--space-md);
	}

	.round-list {
		list-style: none;
		margin: 0;
		padding: 0;
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
	.recap-scroll {
		max-height: min(34dvh, 18rem);
		overflow-y: auto;
		overscroll-behavior: contain;
		display: flex;
		justify-content: center;
	}

	/* Writing: takes every pixel the round list leaves, never under about four lines */
	.writing {
		grid-area: main;
		min-height: 11rem;
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
		grid-area: main;
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

	/* Footer: the rule (and the auto-journal countdown) across the sheet, then one row with the
	   voice note on the left and Record Entry on the right */
	.timer-slot {
		grid-area: timer;
		margin-top: var(--space-md);
		padding-top: var(--space-md);
		border-top: 1px solid rgba(255, 255, 255, 0.12);
	}

	.timer-slot:has(:global(.auto-journal-timer)) {
		padding-bottom: var(--space-sm);
	}

	.voice-slot {
		grid-area: voice;
		display: flex;
		align-items: center;
		min-height: 52px;
	}

	.sheet-actions {
		grid-area: actions;
		display: flex;
		align-items: center;
		min-height: 52px;
	}

	/* Once the final entry is saved there is no voice note: the actions take the whole row */
	.journal-sheet.saved .sheet-actions {
		grid-column: 1 / -1;
	}

	.save-slot {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		width: 100%;
		min-height: 52px;
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
		textarea {
			transition: none;
		}
	}

	/* Phones: a full-screen sheet; the stage already insets it for notches */
	/* Small screens (phones, and short windows): a long round's list scrolls inside itself, so
	   the writing keeps its room and Record Entry stays on screen (owner decision) */
	@media (max-width: 600px), (max-height: 760px) {
		.round-list {
			max-height: min(28dvh, 16rem);
			overflow-y: auto;
			overscroll-behavior: contain;
		}

		/* Still four lines of writing under its label */
		.writing {
			min-height: 9.5rem;
		}
	}

	@media (max-width: 600px) {
		.journal-sheet {
			width: 100%;
			height: 100%;
			padding: var(--space-md);
			--aug-tl: 0px;
			--aug-tr: 0px;
			--aug-br: 0px;
			--aug-bl: 0px;
			--aug-border-all: 0px;
		}

		.sheet-header {
			margin-bottom: var(--space-sm);
			padding-bottom: var(--space-sm);
		}

		.sheet-title {
			font-size: 1.75rem;
		}

		textarea {
			font-size: 1.0625rem;
			padding: var(--space-md);
		}

		/* One row: the 44px mic, then Record Entry filling the rest */
		.journal-sheet {
			column-gap: var(--space-sm);
		}

		.timer-slot {
			margin-top: var(--space-sm);
			padding-top: var(--space-sm);
		}

		.save-slot {
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
		}

		.sheet-header {
			margin-bottom: var(--space-sm);
			padding-bottom: var(--space-xs);
		}

		.sheet-title {
			font-size: 1.75rem;
		}

		/* Landscape phones: labels go and the list rows tighten; the writing keeps its room */
		.section-label {
			display: none;
		}

		.round-list {
			max-height: min(30dvh, 10rem);
			overflow-y: auto;
			overscroll-behavior: contain;
		}

		.round-list li {
			padding-block: var(--space-xs);
		}

		/* The Game Over screen just showed the recap: here the writing gets the room */
		.journal-sheet.final .recap {
			display: none;
		}

		.writing {
			min-height: 5rem;
		}

		.timer-slot {
			margin-top: var(--space-xs);
			padding-top: var(--space-xs);
		}

		.voice-slot,
		.sheet-actions,
		.save-slot {
			min-height: 44px;
		}
	}
</style>
