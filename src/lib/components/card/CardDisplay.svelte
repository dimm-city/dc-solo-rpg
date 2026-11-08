<script>
	/**
	 * CardDisplay - one drawn card: corner index, type badge, headline, story and a footer that
	 * says what the card does.
	 *
	 * Stages: idle (nothing) -> materializing (the face rises with all its text) -> revealed
	 * (stable; Enter, Space or a tap continues) -> dismissing, or doom for the fourth King.
	 * Animations touch opacity and transform only; their timings come in as CSS variables.
	 *
	 * @component
	 */
	import { getCardName, splitNote, TYPE_LABELS } from './cardInfo.js';
	import SuitText from './SuitText.svelte';
	import { storyHtml } from './storyText.js';

	let {
		card = null,
		animationStage = 'idle',
		onDismiss = () => {},
		clickable = true,
		/** Mechanic note for the footer, e.g. "3 of 4"; it breaks only at a ' · ' */
		note = '',
		/** What a special card does, e.g. "No Stability check for this Ace" */
		modifierNote = '',
		/** 1-4 on a King: lights that many skull pips */
		kingNumber = 0,
		/** What continuing does, for the hint: 'continue', 'face the end' or 'escape' */
		continueAction = 'continue',
		/** Auto-play hold, 0 to 1, or null when auto-play is not holding this card */
		holdProgress = null,
		/** Called with true while the player is reading (pointer, focus or scroll), false after */
		onReadingChange = () => {},
		/** Rise and dismiss timings in ms, so CSS and JS agree */
		riseMs = 250,
		dismissMs = 220
	} = $props();

	const uid = $props.id();
	const SUIT_GLYPHS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };

	// Corner index text, e.g. "K♠" or "10♥"
	let cornerIndex = $derived(card ? `${card.card}${SUIT_GLYPHS[card.suit] ?? ''}` : '');
	let cardName = $derived(getCardName(card));
	// Each clause stays whole on a line; a line breaks only after a separator
	let noteClauses = $derived(splitNote(note));
	let canDismiss = $derived(clickable && animationStage === 'revealed');

	// Keyboard focus lands on the card once it can be dismissed (Enter/Space continue).
	// Focus also announces the card: its name comes from its content.
	let cardEl = $state();
	$effect(() => {
		if (canDismiss) cardEl?.focus({ preventScroll: true });
	});

	// A scroll or drag is not a tap: only a short, still press on the card dismisses it
	const TAP_SLOP_PX = 10;
	const SCROLL_GRACE_MS = 250;
	let pressStart = null;
	let lastScrollAt = 0;

	// Story scroll cue: fade the text edge that has more beyond it
	let moreBelow = $state(false);
	let scrolled = $state(false);

	// Reading: the pointer moved over the card, focus is inside it, or the story was just scrolled.
	// A pointer resting where the last card was is not reading, so it must move first.
	const MOVE_SLOP_PX = 4;
	const SCROLL_READING_MS = 2000;
	let pointerOver = $state(false);
	let focusInside = $state(false);
	let scrolling = $state(false);
	let moveOrigin = null;
	let scrollTimer = null;

	$effect(() => {
		onReadingChange(pointerOver || focusInside || scrolling);
	});

	// A new card starts with nobody reading it
	$effect(() => {
		if (animationStage === 'materializing') {
			pointerOver = false;
			moveOrigin = null;
		}
	});

	function onPointerMove(event) {
		if (event.pointerType !== 'mouse' || pointerOver) return;
		if (!moveOrigin) {
			moveOrigin = { x: event.clientX, y: event.clientY };
		} else if (
			Math.hypot(event.clientX - moveOrigin.x, event.clientY - moveOrigin.y) > MOVE_SLOP_PX
		) {
			pointerOver = true;
		}
	}

	function onPointerLeave() {
		pointerOver = false;
		moveOrigin = null;
	}

	function onFocusIn(event) {
		focusInside = event.target !== cardEl;
	}

	function onFocusOut(event) {
		if (!cardEl?.contains(event.relatedTarget) || event.relatedTarget === cardEl) {
			focusInside = false;
		}
	}

	function onPointerDown(event) {
		pressStart = { x: event.clientX, y: event.clientY };
	}

	function onCardClick(event) {
		if (!canDismiss) return;
		if (
			pressStart &&
			Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y) > TAP_SLOP_PX
		) {
			return;
		}
		if (performance.now() - lastScrollAt < SCROLL_GRACE_MS) return;
		// A click on the story's scrollbar (right of its content box) is not a tap either
		const scroller = event.target.closest?.('.story-scroll');
		if (scroller && event.clientX > scroller.getBoundingClientRect().left + scroller.clientWidth) {
			return;
		}
		onDismiss();
	}

	function onCardKeydown(event) {
		if (!canDismiss) return;
		// Space on the focused story scrolls it; Enter (or Space on the card) continues
		if (event.target !== event.currentTarget && event.key === ' ') return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onDismiss();
		}
	}

	/** Svelte action: track whether the story overflows and which edges have more */
	function scrollCue(node) {
		const update = () => {
			scrolled = node.scrollTop > 2;
			moreBelow = node.scrollTop + node.clientHeight < node.scrollHeight - 2;
		};
		const onScroll = () => {
			lastScrollAt = performance.now();
			scrolling = true;
			clearTimeout(scrollTimer);
			scrollTimer = setTimeout(() => (scrolling = false), SCROLL_READING_MS);
			update();
		};
		node.addEventListener('scroll', onScroll, { passive: true });
		const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
		observer?.observe(node);
		if (node.firstElementChild) observer?.observe(node.firstElementChild);
		update();
		return {
			destroy() {
				node.removeEventListener('scroll', onScroll);
				clearTimeout(scrollTimer);
				observer?.disconnect();
			}
		};
	}
</script>

<!-- The card is a button only once it can be dismissed; until then it is not focusable -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={cardEl}
	class="byte-container"
	data-type={card?.type}
	data-testid="card"
	class:materializing={animationStage === 'materializing'}
	class:revealed={animationStage === 'revealed'}
	class:dismissing={animationStage === 'dismissing'}
	class:doom={animationStage === 'doom'}
	class:clickable={canDismiss}
	style:--rise-ms="{riseMs}ms"
	style:--dismiss-ms="{dismissMs}ms"
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerleave={onPointerLeave}
	onfocusin={onFocusIn}
	onfocusout={onFocusOut}
	onclick={onCardClick}
	role={canDismiss ? 'button' : 'presentation'}
	tabindex={canDismiss ? '0' : '-1'}
	aria-labelledby={canDismiss ? `${uid}-name ${uid}-title` : undefined}
	aria-describedby={canDismiss
		? [modifierNote && `${uid}-mod`, `${uid}-story`, note && `${uid}-note`, `${uid}-hint`]
				.filter(Boolean)
				.join(' ')
		: undefined}
	onkeydown={onCardKeydown}
>
	{#if animationStage !== 'idle' && card}
		<div class="byte-shell" data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
			<div class="byte-content">
				<div class="card-head">
					<span class="corner-index" aria-hidden="true"><SuitText text={cornerIndex} /></span>
					<span class="sr-only" id="{uid}-name">{cardName}:</span>
					{#if TYPE_LABELS[card.type]}
						<div class="card-type-badge" data-type={card.type} aria-hidden="true">
							{#if card.type === 'primary-success'}
								<svg class="type-icon" viewBox="0 0 24 24" width="16" height="16">
									<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
								</svg>
							{:else if card.type === 'failure-counter'}
								<svg class="type-icon" viewBox="0 0 24 24" width="16" height="16">
									<circle cx="9" cy="12" r="1" />
									<circle cx="15" cy="12" r="1" />
									<path d="M8 20v2h8v-2" />
									<path d="m12.5 17-.5-1-.5 1h1z" />
									<path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20" />
								</svg>
							{:else if card.type === 'narrative'}
								<svg class="type-icon" viewBox="0 0 24 24" width="16" height="16">
									<polygon
										points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
									/>
								</svg>
							{:else if card.type === 'challenge'}
								<svg class="type-icon" viewBox="0 0 24 24" width="16" height="16">
									<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
								</svg>
							{:else}
								<svg class="type-icon" viewBox="0 0 24 24" width="16" height="16">
									<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
									<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
								</svg>
							{/if}
							<span class="type-label">{TYPE_LABELS[card.type]}</span>
						</div>
					{/if}
				</div>

				{#if card.description}
					<p class="byte-data" id="{uid}-title">{card.description}</p>
				{/if}

				{#if modifierNote}
					<p class="modifier-note" id="{uid}-mod" data-testid="card-modifier">
						<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
							{#if card.modifier === 'return-king'}
								<path d="M3 12a9 9 0 1 0 3-6.7" />
								<path d="M3 3v5h5" />
							{:else}
								<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
							{/if}
						</svg>
						<span>{modifierNote}</span>
					</p>
				{/if}

				<!-- Only the story scrolls; frame, header, headline and footer stay put -->
				<div class="story-wrap">
					<!-- Focusable so keyboard users can scroll a long story -->
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div
						class="story-scroll"
						style:--fade-top={scrolled ? '28px' : '0px'}
						style:--fade-bottom={moreBelow ? '40px' : '0px'}
						tabindex="0"
						role="region"
						aria-label="Card story"
						use:scrollCue
					>
						<!-- The author's emphasis as italic (storyText.js); escaped, then sanitized -->
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized via sanitizeHtml -->
						<p class="byte-story" id="{uid}-story">{@html storyHtml(card.story)}</p>
					</div>
					<span class="more-cue" class:visible={moreBelow} aria-hidden="true">
						<svg viewBox="0 0 24 24" width="16" height="16">
							<path d="m6 9 6 6 6-6" />
						</svg>
					</span>
				</div>

				<div class="card-foot">
					{#if note}
						<p class="mechanic-note" id="{uid}-note" data-testid="card-mechanic">
							{#if kingNumber > 0}
								<span class="pips" aria-hidden="true">
									{#each [1, 2, 3, 4] as n (n)}
										<svg
											class="pip"
											class:lit={n < kingNumber}
											class:igniting={n === kingNumber}
											style:--n={n}
											viewBox="0 0 24 24"
											width="14"
											height="14"
										>
											<path
												d="M12 2C7.6 2 4 5.4 4 9.7c0 2.5 1.2 4.6 3 6V19a1 1 0 0 0 1 1h1v2h2v-2h2v2h2v-2h1a1 1 0 0 0 1-1v-3.3c1.8-1.4 3-3.5 3-6C20 5.4 16.4 2 12 2Zm-3.5 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
											/>
										</svg>
									{/each}
								</span>
							{/if}
							<span class="note-text">
								{#each noteClauses as clause, index (index)}
									<span class="clause"
										>{clause}{#if index < noteClauses.length - 1}&nbsp;·{/if}</span
									>{index < noteClauses.length - 1 ? ' ' : ''}
								{/each}
							</span>
						</p>
					{/if}
					<div class="foot-row">
						{#if clickable}
							<span class="tap-hint" aria-hidden="true">
								<span class="hint-touch">Tap to {continueAction}</span>
								<span class="hint-pointer">Click to {continueAction}</span>
							</span>
							<span class="sr-only" id="{uid}-hint">Press Enter to {continueAction}.</span>
						{/if}
						<span class="corner-index mirrored" aria-hidden="true"
							><SuitText text={cornerIndex} /></span
						>
					</div>
				</div>
			</div>

			{#if holdProgress !== null}
				<!-- Auto-play: the line shrinks as the hold runs out, and stops while you read -->
				<span
					class="hold-line"
					style:transform="scaleX({1 - holdProgress})"
					data-testid="card-hold"
					aria-hidden="true"
				></span>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* ============================================
	   BYTE CONTAINER
	   Most of the viewport at every size (owner decision): the card fills the deck column
	   below the progress line, capped at 85dvh on desktop and tablet (a tall portrait card)
	   and 90dvh on phones; landscape phones get whatever height is left. Header, headline,
	   mechanic note and footer stay put; only the story scrolls, so a short story leaves
	   calm space in the body. Animations touch opacity + transform only.
	   ============================================ */

	.byte-container {
		/* Tint by card type; unknown types fall back to the shared frame colours */
		--card-accent: var(--color-neon-cyan, #00ffff);
		--card-border: var(--frame-border, linear-gradient(135deg, #00ffff, #d946ef));
		--card-glow: rgba(0, 255, 255, 0.35);

		position: relative;
		display: flex;
		flex: 1 1 auto;
		min-height: 0;
		width: min(92vw, 36rem);
		max-height: 85dvh;
		max-width: 100%;
		opacity: 0;
		/* Static glow: the shell is clip-pathed, so box-shadow would be cut off */
		filter: drop-shadow(0 0 16px var(--card-glow));
	}

	.byte-container[data-type='event'] {
		--card-accent: #00ff88;
		--card-glow: rgba(0, 255, 136, 0.28);
	}

	.byte-container[data-type='challenge'] {
		--card-accent: #ff8800;
		--card-glow: rgba(255, 136, 0, 0.32);
	}

	.byte-container[data-type='narrative'] {
		--card-accent: var(--color-neon-cyan, #00ffff);
		--card-glow: rgba(0, 255, 255, 0.35);
	}

	.byte-container[data-type='primary-success'] {
		--card-accent: var(--color-brand-yellow, #ffd700);
		--card-glow: rgba(255, 215, 0, 0.45);
	}

	/* Kings: unmistakable danger red */
	.byte-container[data-type='failure-counter'] {
		--card-accent: var(--color-danger, #ff4d6d);
		--card-glow: rgba(255, 77, 109, 0.6);
		filter: drop-shadow(0 0 22px var(--card-glow));
	}

	.byte-container[data-type]:not([data-type='']) {
		--card-border: linear-gradient(
			135deg,
			var(--card-accent),
			color-mix(in srgb, var(--card-accent) 40%, var(--color-cyber-magenta, #d946ef))
		);
	}

	.byte-container.clickable {
		cursor: pointer;
	}

	/* Visible keyboard focus: the shell is clipped, so thicken and whiten its border */
	.byte-container:focus {
		outline: none;
	}

	.byte-container:focus-visible .byte-shell {
		--aug-border-all: 5px;
		--aug-border-bg: #ffffff;
	}

	/* The face rises with all its text present: no card back, no blank face */
	.byte-container.materializing {
		animation: card-rise var(--rise-ms) cubic-bezier(0.33, 1, 0.68, 1) both;
	}

	.byte-container.revealed,
	.byte-container.doom {
		opacity: 1;
	}

	.byte-container.dismissing {
		animation: card-dismiss var(--dismiss-ms) ease-in forwards;
	}

	@keyframes card-rise {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@keyframes card-dismiss {
		from {
			opacity: 1;
			transform: none;
		}
		to {
			opacity: 0;
			transform: translateY(-12px);
		}
	}

	/* ============================================
	   BYTE SHELL - MAIN CARD
	   ============================================ */

	.byte-shell {
		--aug-border-all: 3px;
		--aug-border-bg: var(--card-border);
		--aug-tl: 16px;
		--aug-tr: 16px;
		--aug-br: 16px;
		--aug-bl: 16px;

		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		padding: var(--space-lg, 1.5rem);
		overflow: hidden;
		box-sizing: border-box;

		/* Opaque panel: no backdrop-filter, so the container can animate smoothly */
		background:
			radial-gradient(
				ellipse at 50% 0%,
				color-mix(in srgb, var(--card-accent) 14%, transparent),
				transparent 60%
			),
			linear-gradient(160deg, rgb(20, 20, 30) 0%, rgb(10, 10, 20) 55%, rgb(15, 15, 25) 100%);
	}

	.byte-container[data-type='failure-counter'] .byte-shell {
		background:
			radial-gradient(ellipse at 50% 0%, rgba(255, 77, 109, 0.22), transparent 65%),
			linear-gradient(160deg, rgb(30, 12, 18) 0%, rgb(16, 8, 14) 55%, rgb(24, 10, 16) 100%);
	}

	/* The fourth King: the frame burns, the story steps back, the skulls flare */
	.byte-container.doom .byte-shell {
		--aug-border-all: 4px;
		--aug-border-bg: var(--color-danger, #ff4d6d);
	}

	.byte-container.doom .story-wrap,
	.byte-container.doom .foot-row {
		opacity: 0.45;
		transition: opacity 300ms ease-out;
	}

	/* ============================================
	   BYTE CONTENT
	   ============================================ */

	.byte-content {
		position: relative;
		z-index: 1;
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-md, 1rem);
		color: var(--color-text-primary, #fff);
	}

	.byte-data {
		flex: none;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1.25rem;
		line-height: 1.3;
		color: #ffffff;
		margin: 0;
		font-weight: 600;
		/* A headline of up to four lines: even lines, never a lone last word (visual-layout-s-09) */
		text-wrap: balance;
	}

	/* What a special card does, on its face */
	.modifier-note {
		flex: none;
		display: flex;
		align-items: center;
		gap: var(--space-sm, 0.5rem);
		margin: 0;
		padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.35;
		color: var(--card-accent);
		background: color-mix(in srgb, var(--card-accent) 10%, transparent);
		border-left: 3px solid var(--card-accent);
	}

	.modifier-note svg {
		flex: none;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* The story: the only part of the card that scrolls */
	.story-wrap {
		position: relative;
		flex: 1 1 auto;
		min-height: 0;
		display: flex;
	}

	.story-scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		touch-action: pan-y;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
		scrollbar-color: var(--card-accent) transparent;
		padding-right: var(--space-sm, 0.5rem);
		/* Fade the edge that has more text beyond it; stops are 0 when nothing is hidden */
		--fade-top: 0px;
		--fade-bottom: 0px;
		-webkit-mask-image: linear-gradient(
			to bottom,
			transparent 0,
			#000 var(--fade-top),
			#000 calc(100% - var(--fade-bottom)),
			transparent 100%
		);
		mask-image: linear-gradient(
			to bottom,
			transparent 0,
			#000 var(--fade-top),
			#000 calc(100% - var(--fade-bottom)),
			transparent 100%
		);
	}

	.story-scroll:focus {
		outline: none;
	}

	.story-scroll:focus-visible {
		outline: 2px solid var(--card-accent);
		outline-offset: 4px;
	}

	.byte-story {
		max-width: 65ch;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1.125rem;
		line-height: 1.6;
		color: var(--color-text-secondary, rgba(255, 255, 255, 0.85));
		margin: 0;
		font-weight: 400;
		white-space: pre-line;
		text-wrap: pretty;
	}

	/* Chevron that says "more below"; opacity only */
	.more-cue {
		position: absolute;
		right: 0;
		bottom: 0;
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		color: var(--card-accent);
		opacity: 0;
		transition: opacity 200ms ease-out;
		pointer-events: none;
	}

	.more-cue.visible {
		opacity: 1;
	}

	.more-cue svg,
	.type-icon {
		flex-shrink: 0;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* Header: corner index + type badge */
	.card-head {
		flex: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md, 1rem);
	}

	.corner-index {
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 1.25rem;
		line-height: 1;
		color: var(--card-accent);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	/* Footer: what the card does, then the hint and the mirrored corner index */
	.card-foot {
		flex: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm, 0.5rem);
	}

	.mechanic-note {
		display: flex;
		align-items: center;
		gap: var(--space-sm, 0.5rem);
		margin: 0;
		padding-top: var(--space-sm, 0.5rem);
		border-top: 1px solid color-mix(in srgb, var(--card-accent) 35%, transparent);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.5;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--card-accent);
	}

	/* One clause of the note, kept whole: a line breaks only after a ' ·', which stays at the
	   line end. A clause wider than the card (Easy's fourth Ace on a phone) wraps inside
	   itself, balanced, rather than overflow. */
	.clause {
		display: inline-block;
		max-width: 100%;
		text-wrap: balance;
	}

	.foot-row {
		display: flex;
		align-items: center;
		gap: var(--space-md, 1rem);
		min-height: 24px;
	}

	/* The second index, upright (a rotated "7♠" only reads as a typo on a screen), and quieter
	   by size, not opacity: at full colour it keeps 4.5:1 on the card face (visual-layout-v-02) */
	.corner-index.mirrored {
		margin-left: auto;
		font-size: 1rem;
	}

	/* King count: lit skulls for the Kings already out; this card's skull ignites */
	.pips {
		display: inline-flex;
		gap: 4px;
	}

	.pip {
		fill: currentColor;
		opacity: 0.25;
	}

	.pip.lit,
	.byte-container.dismissing .pip.igniting {
		opacity: 1;
	}

	.byte-container.revealed .pip.igniting {
		animation: pip-ignite 250ms ease-out 300ms both;
	}

	@keyframes pip-ignite {
		from {
			opacity: 0.25;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* The fourth King: all four flare in turn, 120ms apart */
	.byte-container.doom .pip {
		opacity: 1;
		animation: pip-flare 250ms ease-out calc((var(--n) - 1) * 120ms) both;
	}

	@keyframes pip-flare {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.45);
		}
		100% {
			transform: scale(1.15);
		}
	}

	/* "Tap to continue": in once revealed, pulses twice, then stays */
	.tap-hint {
		flex: 1;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-secondary, rgba(255, 255, 255, 0.85));
		opacity: 0;
		transition: opacity 200ms ease-out 200ms;
	}

	.byte-container.revealed .tap-hint {
		opacity: 1;
		animation: hint-pulse 1.2s ease-in-out 1s 2;
	}

	@keyframes hint-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.hint-pointer {
		display: none;
	}

	@media (hover: hover) and (pointer: fine) {
		.hint-touch {
			display: none;
		}
		.hint-pointer {
			display: inline;
		}
	}

	/* Auto-play hold: a thin line along the bottom edge, shrinking from the right */
	/* Inside the frame (the augmented-ui border covers the edge), clear of the clipped corners */
	.hold-line {
		position: absolute;
		left: 18px;
		right: 18px;
		bottom: 5px;
		height: 3px;
		border-radius: 2px;
		background: var(--card-accent);
		transform-origin: left center;
		pointer-events: none;
	}

	/* Card Type Badge Styles */
	.card-type-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.75rem;
		border-radius: 0.5rem;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		border: 2px solid;
	}

	.card-type-badge[data-type='primary-success'] {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.15));
		border-color: var(--color-brand-yellow, #ffd700);
		color: var(--color-brand-yellow, #ffd700);
	}

	.card-type-badge[data-type='failure-counter'] {
		background: linear-gradient(135deg, rgba(255, 77, 109, 0.22), rgba(185, 28, 28, 0.15));
		border-color: var(--color-danger, #ff4d6d);
		color: var(--color-danger, #ff4d6d);
	}

	.card-type-badge[data-type='narrative'] {
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 200, 200, 0.15));
		border-color: var(--color-neon-cyan, #00ffff);
		color: var(--color-neon-cyan, #00ffff);
	}

	.card-type-badge[data-type='challenge'] {
		background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.15));
		border-color: #ff8800;
		color: #ff8800;
	}

	.card-type-badge[data-type='event'] {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.15));
		border-color: #00ff88;
		color: #00ff88;
	}

	.type-label {
		white-space: nowrap;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	/* Phones: 92vw wide, from just under the progress line to near the bottom edge */
	@media screen and (max-width: 600px) {
		.byte-container {
			width: 92vw;
			max-height: 90dvh;
		}

		.byte-shell {
			padding: var(--space-md, 1rem);
		}

		.byte-content {
			gap: var(--space-sm, 0.75rem);
		}

		.byte-story {
			font-size: 1rem;
		}
	}

	/* Landscape phones and short windows: wider, and as tall as the column allows, with a few
	   pixels of breathing space at the bottom edge for the glow */
	@media (max-height: 500px) {
		.byte-container {
			width: min(92vw, 720px);
			max-height: calc(100dvh - 2.75rem);
		}

		.byte-shell {
			padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
		}

		.byte-content {
			gap: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
		}

		.byte-data {
			font-size: 1.125rem;
		}

		.byte-story {
			font-size: 1rem;
			line-height: 1.5;
		}

		.modifier-note {
			padding: 0.25rem var(--space-sm, 0.5rem);
			font-size: 0.875rem;
		}

		.mechanic-note {
			padding-top: var(--space-xs, 0.25rem);
		}

		.corner-index {
			font-size: 1rem;
		}

		.corner-index.mirrored {
			font-size: 0.875rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.byte-container.materializing,
		.byte-container.dismissing,
		.byte-container.revealed .tap-hint,
		.byte-container .pip {
			animation: none !important;
		}

		.byte-container.materializing {
			opacity: 1;
		}

		.byte-container.dismissing {
			opacity: 0;
		}

		.tap-hint,
		.more-cue,
		.byte-container.doom .story-wrap,
		.byte-container.doom .foot-row {
			transition: none;
		}

		.pip.igniting {
			opacity: 1;
		}
	}
</style>
