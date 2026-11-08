<script>
	/**
	 * StoryRound - One round in story mode, led by the player's own writing (SM-01)
	 *
	 * The round's cards sit as a single line of chips ("J♣ · 4♦ · K♠"), each expandable to the
	 * card's text and roll. Below them the journal entry, in a reading face (Inter about 18px,
	 * 640px measure), or the voice note. A round with no entry shows the card prompts instead,
	 * so it still reads. The last round closes with how the run ended, then the final log the
	 * player wrote after it.
	 */

	import AudioPlayer from './AudioPlayer.svelte';
	import FinalLog from './story/FinalLog.svelte';
	import GameOverMessage from './story/GameOverMessage.svelte';
	import RoundStats from './story/RoundStats.svelte';
	import SuitText from './card/SuitText.svelte';
	import { getCardName } from './card/cardInfo.js';
	import { sanitizeHtml } from '../utils/sanitizeHtml.js';
	import {
		cardShort,
		cardName,
		cardTypeLabel,
		isRedSuit,
		modifierLine,
		rollLine
	} from './story/storyCards.js';

	let {
		round = null, // From useEnrichedRounds
		roundNumber = 0,
		totalRounds = 0,
		outcome = '', // e.g. "Taken by the fourth King"; pass it on the last round only
		showStats = true
	} = $props();

	const uid = $props.id();
	const headingId = `story-round-${uid}`;
	const panelId = `story-card-panel-${uid}`;

	/** Index of the card whose text is open, or null */
	let openCard = $state(null);
	let card = $derived(openCard === null ? null : round?.cards?.[openCard]);
	let hasText = $derived(!!round?.journalEntry?.text);
	let hasAudio = $derived(!!round?.journalEntry?.audio);

	function toggle(index) {
		openCard = openCard === index ? null : index;
	}
</script>

{#if round}
	<article class="story-round" aria-labelledby={headingId}>
		<header class="round-head">
			<h2 class="round-title" id={headingId}>
				Round {roundNumber}&nbsp;<span class="round-of">of {totalRounds}</span>
			</h2>
		</header>

		{#if round.cards?.length}
			<ul class="card-chips" aria-label="Cards drawn this round">
				{#each round.cards as chip, index (index)}
					<li>
						<button
							type="button"
							class="chip"
							class:red={isRedSuit(chip)}
							class:king={chip.card === 'K'}
							class:ace={chip.card === 'A'}
							aria-expanded={openCard === index}
							aria-controls={panelId}
							onclick={() => toggle(index)}
						>
							<span aria-hidden="true"><SuitText text={cardShort(chip)} /></span>
							<span class="sr-only">{getCardName(chip)}</span>
						</button>
						{#if index < round.cards.length - 1}
							<span class="chip-sep" aria-hidden="true">·</span>
						{/if}
					</li>
				{/each}
			</ul>

			<div class="card-panel-slot" id={panelId}>
				{#if card}
					<section class="card-panel" aria-label={cardName(card)}>
						<p class="card-panel-title">
							<span class="card-panel-name">{cardName(card)}</span>
							<span class="card-panel-type">{cardTypeLabel(card.type)}</span>
						</p>
						{#if card.description}
							<p class="card-panel-desc">{card.description}</p>
						{/if}
						{#if card.story}
							<div class="card-panel-story">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized via sanitizeHtml -->
								{@html sanitizeHtml(card.story.replace(/\n/g, '<br>'))}
							</div>
						{/if}
						{#if modifierLine(card)}
							<p class="card-panel-note"><SuitText text={modifierLine(card)} /></p>
						{/if}
						{#if rollLine(card)}
							<p class="card-panel-note">{rollLine(card)}</p>
						{/if}
					</section>
				{/if}
			</div>
		{/if}

		<div class="journal">
			{#if hasAudio}
				<div class="voice-note">
					<p class="voice-label">Voice note</p>
					<AudioPlayer audioData={round.journalEntry.audio} />
				</div>
			{/if}

			{#if hasText}
				<div class="journal-text">{round.journalEntry.text}</div>
			{:else if !hasAudio}
				<p class="no-entry">You didn't write this round. The cards said:</p>
				<ul class="card-prompts">
					{#each round.cards as prompt, index (index)}
						{#if prompt.description}
							<li>
								<span class="prompt-card" class:red={isRedSuit(prompt)} aria-hidden="true"
									><SuitText text={cardShort(prompt)} /></span
								>
								<span class="sr-only">{cardName(prompt)}:</span>
								{prompt.description}
							</li>
						{/if}
					{/each}
				</ul>
			{/if}
		</div>

		{#if outcome || round.gameOverMessage}
			<GameOverMessage {outcome} message={round.gameOverMessage} isWon={round.isWon} />
		{/if}

		{#if round.finalEntry}
			<FinalLog entry={round.finalEntry} />
		{/if}

		{#if showStats}
			<RoundStats state={round.endState} />
		{/if}
	</article>
{/if}

<style>
	.story-round {
		display: flex;
		flex-direction: column;
		gap: 20px;
		width: 100%;
		max-width: 640px;
		margin: 0 auto;
		font-family: var(--font-body);
	}

	.round-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}

	/* 28px and up: the display face is legible here (MN-07) */
	.round-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: 0.04em;
		color: var(--color-brand-yellow);
		text-shadow: none;
	}

	.round-of {
		margin-left: 0.15em;
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 400;
		letter-spacing: 0;
		text-transform: none;
		color: #aebbcc;
	}

	/* The round's cards on one line */
	.card-chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 0;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.card-chips li {
		display: flex;
		align-items: center;
		margin: 0;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 52px;
		min-height: 44px;
		padding: 4px 12px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.28);
		border-radius: 4px;
		color: #e6edf5;
		font-family: var(--font-body);
		font-size: 1.125rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition:
			background-color 150ms ease-out,
			border-color 150ms ease-out;
	}

	.chip.red {
		color: #ff9ab0;
	}

	.chip.king {
		border-color: rgba(255, 77, 109, 0.75);
	}

	.chip.ace {
		border-color: rgba(255, 215, 0, 0.75);
	}

	.chip:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.chip[aria-expanded='true'] {
		background: rgba(0, 255, 255, 0.12);
		border-color: var(--color-neon-cyan);
	}

	.chip-sep {
		padding: 0 8px;
		color: #6f8197;
	}

	/* The open card's text */
	.card-panel-slot:empty {
		display: none;
	}

	.card-panel {
		padding: 16px 20px;
		background: rgba(7, 16, 26, 0.85);
		border-left: 3px solid var(--color-neon-cyan);
	}

	.card-panel-title {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 12px;
		margin: 0 0 8px;
	}

	.card-panel-name {
		font-size: 1rem;
		font-weight: 600;
		color: #fff;
	}

	.card-panel-type {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-neon-cyan);
	}

	.card-panel-desc {
		margin: 0 0 8px;
		font-size: 1.125rem;
		line-height: 1.6;
		font-style: italic;
		color: #eef3f8;
	}

	.card-panel-story {
		font-size: 1rem;
		line-height: 1.65;
		color: #c9d4e0;
	}

	.card-panel-note {
		margin: 8px 0 0;
		font-size: 0.875rem;
		color: #aebbcc;
	}

	/* The player's writing: the heart of the page */
	.journal {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.journal-text {
		font-size: 1.125rem;
		line-height: 1.75;
		color: #f2f5f9;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	.voice-label {
		margin: 0 0 8px;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #aebbcc;
	}

	.no-entry {
		margin: 0;
		font-size: 0.875rem;
		color: #aebbcc;
	}

	.card-prompts {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.card-prompts li {
		display: flex;
		align-items: baseline;
		gap: 12px;
		margin: 0;
		font-size: 1.125rem;
		line-height: 1.7;
		font-style: italic;
		color: #d5dfeb;
	}

	.prompt-card {
		flex: 0 0 3ch;
		font-style: normal;
		font-weight: 600;
		font-size: 0.875rem;
		color: #aebbcc;
	}

	.prompt-card.red {
		color: #ff9ab0;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 640px) {
		.story-round {
			gap: 16px;
		}

		.journal-text,
		.card-prompts li {
			font-size: 1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.chip {
			transition: none;
		}
	}
</style>
