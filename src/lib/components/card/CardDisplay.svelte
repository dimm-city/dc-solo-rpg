<script>
	/**
	 * CardDisplay - Card visual display component
	 *
	 * Renders the card with:
	 * - Augmented UI byte shell
	 * - Bio-pulse animation rings
	 * - Card type badges with icons
	 * - Card content (description, story, ID)
	 * - Animation states (materializing, revealed, dismissing)
	 *
	 * This component is HIGHLY REUSABLE - can be used in Story Mode, Browse Games, etc.
	 *
	 * @component
	 */

	let { card = null, animationStage = 'idle', onDismiss = () => {}, clickable = true } = $props();

	const SUIT_GLYPHS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };

	// Corner index text, e.g. "K♠" or "10♥"
	let cornerIndex = $derived(card ? `${card.card}${SUIT_GLYPHS[card.suit] ?? ''}` : '');
	let canDismiss = $derived(clickable && animationStage === 'revealed');

	// Keyboard focus lands on the card once it can be dismissed (Enter/Space continue)
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
				observer?.disconnect();
			}
		};
	}
</script>

<div
	bind:this={cardEl}
	class="byte-container"
	data-type={card?.type}
	class:anticipating={animationStage === 'anticipating'}
	class:materializing={animationStage === 'materializing'}
	class:revealed={animationStage === 'revealed'}
	class:dismissing={animationStage === 'dismissing'}
	class:clickable={canDismiss}
	onpointerdown={onPointerDown}
	onclick={onCardClick}
	role={canDismiss ? 'button' : 'presentation'}
	tabindex={canDismiss ? '0' : '-1'}
	aria-label={canDismiss ? 'Continue' : undefined}
	onkeydown={onCardKeydown}
>
	{#if animationStage !== 'idle'}
		<div class="byte-shell" data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
			<!-- Bio-pulse rings -->
			<div class="bio-pulse" aria-hidden="true"></div>

			<!-- Card back: shown immediately on draw, fades out as the face is revealed -->
			<div class="card-back" aria-hidden="true">
				<span class="card-back-mark">Dream Console</span>
			</div>

			<!-- Card face. Reveal order: header, headline, body, footer -->
			{#if card}
				<div class="byte-content">
					<div class="card-head reveal">
						<span class="corner-index" aria-hidden="true">{cornerIndex}</span>
						{#if card.type}
							<div class="card-type-badge" data-type={card.type}>
								{#if card.type === 'primary-success'}
									<!-- Crown icon for Primary Success -->
									<svg
										class="type-icon"
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
									</svg>
									<span class="type-label">Victory</span>
								{:else if card.type === 'failure-counter'}
									<!-- Skull icon for Failure Counter (Kings) -->
									<svg
										class="type-icon"
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<circle cx="9" cy="12" r="1" />
										<circle cx="15" cy="12" r="1" />
										<path d="M8 20v2h8v-2" />
										<path d="m12.5 17-.5-1-.5 1h1z" />
										<path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20" />
									</svg>
									<span class="type-label">Doom</span>
								{:else if card.type === 'narrative'}
									<!-- Star icon for Narrative (Bonus/Help) -->
									<svg
										class="type-icon"
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<polygon
											points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
										/>
									</svg>
									<span class="type-label">Bonus</span>
								{:else if card.type === 'challenge'}
									<!-- Zap icon for Challenge -->
									<svg
										class="type-icon"
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
									</svg>
									<span class="type-label">Challenge</span>
								{:else if card.type === 'event'}
									<!-- BookOpen icon for Event -->
									<svg
										class="type-icon"
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
										<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
									</svg>
									<span class="type-label">Event</span>
								{/if}
							</div>
						{/if}
					</div>

					{#if card.description}
						<p class="byte-data reveal">{card.description}</p>
					{/if}
					<!-- Only the story scrolls; frame, header, headline and footer stay put -->
					<div class="story-wrap reveal">
						<!-- Focusable so keyboard users can scroll a long story -->
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<div
							class="story-scroll"
							class:more={moreBelow}
							class:scrolled
							style:--fade-top={scrolled ? '28px' : '0px'}
							style:--fade-bottom={moreBelow ? '40px' : '0px'}
							tabindex="0"
							role="region"
							aria-label="Card story"
							use:scrollCue
						>
							<p class="byte-story">{card.story}</p>
						</div>
						<span class="more-cue" class:visible={moreBelow} aria-hidden="true">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="m6 9 6 6 6-6" />
							</svg>
						</span>
					</div>

					<div class="card-foot reveal">
						{#if clickable}
							<span class="tap-hint">
								<span class="hint-touch">Tap to continue</span>
								<span class="hint-pointer">Click to continue</span>
							</span>
						{/if}
						<small class="byte-id">
							BYTE-{card.card}-{card.suit?.slice(0, 3).toUpperCase() || 'UNK'}
						</small>
						<span class="corner-index inverted" aria-hidden="true">{cornerIndex}</span>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* ============================================
	   BYTE CONTAINER
	   Portrait card on desktop, full-width on phones.
	   Animations touch opacity + transform only.
	   ============================================ */

	.byte-container {
		/* Tint by card type; unknown types fall back to the shared frame colours */
		--card-accent: var(--color-neon-cyan, #00ffff);
		--card-border: var(--frame-border, linear-gradient(135deg, #00ffff, #d946ef));
		--card-glow: rgba(0, 255, 255, 0.35);

		/* Phones: nearly the whole viewport. Desktop (below): a tall portrait card. */
		--card-h: 86dvh;

		position: relative;
		width: 92vw;
		height: var(--card-h);
		max-width: 100%;
		max-height: 100%;
		margin: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transform: scale(0.96);
		transition: none;
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

	@media (min-width: 601px) {
		.byte-container {
			--card-h: min(85dvh, 920px);

			height: var(--card-h);
			/* Portrait playing-card proportion, capped on narrow windows */
			width: min(92vw, calc(var(--card-h) * 5 / 7));
		}
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

	/* Back appears at once when drawing starts (anticipating); same animation name on
	   materializing so the switch does not restart it */
	.byte-container.anticipating,
	.byte-container.materializing {
		animation: card-appear 250ms ease-out both;
	}

	.byte-container.revealed {
		opacity: 1;
		transform: scale(1);
	}

	.byte-container.dismissing {
		animation: byte-dismiss 600ms cubic-bezier(0.4, 0, 0.6, 1) forwards;
	}

	@keyframes card-appear {
		0% {
			opacity: 0;
			transform: translateY(12px) scale(0.96);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes byte-dismiss {
		0% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
		100% {
			opacity: 0;
			transform: translateY(-30px) scale(0.95);
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
		width: 100%;
		height: 100%;
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

	.byte-container.materializing .byte-shell {
		animation: glitch-effect 200ms steps(2) 2;
	}

	@keyframes glitch-effect {
		0%,
		100% {
			transform: translate(0);
		}
		25% {
			transform: translate(-2px, 1px);
		}
		75% {
			transform: translate(2px, -1px);
		}
	}

	/* ============================================
	   CARD BACK (anticipation)
	   ============================================ */

	.card-back {
		position: absolute;
		inset: 0;
		z-index: 3;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		background:
			repeating-linear-gradient(45deg, rgba(217, 70, 239, 0.08) 0 8px, transparent 8px 16px),
			linear-gradient(160deg, rgb(24, 14, 36), rgb(10, 10, 22));
		opacity: 1;
	}

	.card-back-mark {
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: var(--text-sm, 0.875rem);
		letter-spacing: var(--letter-spacing-widest, 0.15em);
		text-transform: uppercase;
		color: var(--color-text-muted, rgba(255, 255, 255, 0.6));
	}

	.byte-container.materializing .card-back {
		animation: back-out 250ms ease-out forwards;
	}

	.byte-container.revealed .card-back,
	.byte-container.dismissing .card-back {
		opacity: 0;
		visibility: hidden;
	}

	@keyframes back-out {
		to {
			opacity: 0;
		}
	}

	/* ============================================
	   BIO-PULSE RINGS
	   ============================================ */

	.bio-pulse {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 100px;
		height: 100px;
		transform: translate(-50%, -50%);
		pointer-events: none;
		z-index: 0;
	}

	.bio-pulse::before,
	.bio-pulse::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 100%;
		height: 100%;
		border: 2px solid var(--card-accent);
		border-radius: 50%;
		transform: translate(-50%, -50%) scale(1);
		animation: bio-pulse-ring 4s ease-out infinite;
		opacity: 0;
	}

	.bio-pulse::after {
		animation-delay: 2s;
	}

	@keyframes bio-pulse-ring {
		0% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.2;
		}
		100% {
			transform: translate(-50%, -50%) scale(3);
			opacity: 0;
		}
	}

	/* ============================================
	   BYTE CONTENT
	   ============================================ */

	.byte-content {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: var(--space-md, 1rem);
		color: var(--color-text-primary, #fff);
		/* Fixed frame: head, headline and foot never scroll; .story-wrap takes the rest */
		height: 100%;
		min-height: 0;
		overflow: hidden;
	}

	/* Staggered reveal: header, then headline, then body, then footer.
	   Hidden until the card face is materializing; opacity + transform only. */
	.reveal {
		opacity: 0;
		transform: translateY(8px);
	}

	.byte-container.materializing .reveal {
		animation: text-materialize 300ms ease-out both;
	}

	.byte-container.materializing .card-head {
		animation-delay: 150ms;
	}
	.byte-container.materializing .byte-data {
		animation-delay: 300ms;
	}
	.byte-container.materializing .story-wrap {
		animation-delay: 450ms;
	}
	.byte-container.materializing .card-foot {
		animation-delay: 600ms;
	}

	.byte-container.revealed .reveal,
	.byte-container.dismissing .reveal {
		opacity: 1;
		transform: none;
	}

	@keyframes text-materialize {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.byte-data {
		flex: none;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1.375rem;
		line-height: 1.3;
		color: #ffffff;
		margin: 0;
		font-weight: 600;
		text-wrap: balance;
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

	/* Header: corner index + type badge */
	.card-head {
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

	/* Footer: muted ID, tap hint and mirrored corner index */
	.card-foot {
		flex: none;
		display: flex;
		align-items: center;
		gap: var(--space-md, 1rem);
		padding-top: var(--space-sm, 0.5rem);
	}

	.corner-index.inverted {
		transform: rotate(180deg);
		margin-left: auto;
	}

	.byte-id {
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: var(--text-xs, 0.75rem);
		letter-spacing: var(--letter-spacing-wider, 0.1em);
		color: var(--color-text-muted, rgba(255, 255, 255, 0.6));
		text-transform: uppercase;
	}

	/* "Tap to continue" hint: fades in once the card is revealed */
	.tap-hint {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-secondary, rgba(255, 255, 255, 0.85));
		opacity: 0;
		/* Own the hint's visibility; never let it animate with the .reveal stagger */
		transition: opacity 300ms ease-out 300ms;
		order: 1;
		flex: 1;
		text-align: center;
	}

	.byte-container.revealed .tap-hint {
		opacity: 1;
		animation: hint-pulse 2.4s ease-in-out 1s infinite;
	}

	@keyframes hint-pulse {
		0%,
		100% {
			opacity: 0.55;
		}
		50% {
			opacity: 1;
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

	.byte-id {
		order: 0;
	}

	.corner-index.inverted {
		order: 2;
	}

	/* Card Type Badge Styles */
	.card-type-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.75rem;
		border-radius: 0.5rem;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: var(--text-sm, 0.875rem);
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		border: 2px solid;
	}

	/* Primary Success - Victory (Gold) */
	.card-type-badge[data-type='primary-success'] {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.15));
		border-color: var(--color-brand-yellow, #ffd700);
		color: var(--color-brand-yellow, #ffd700);
	}

	/* Failure Counter - Doom (Danger red) */
	.card-type-badge[data-type='failure-counter'] {
		background: linear-gradient(135deg, rgba(255, 77, 109, 0.22), rgba(185, 28, 28, 0.15));
		border-color: var(--color-danger, #ff4d6d);
		color: var(--color-danger, #ff4d6d);
	}

	/* Narrative - Bonus (Cyan) */
	.card-type-badge[data-type='narrative'] {
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 200, 200, 0.15));
		border-color: var(--color-neon-cyan, #00ffff);
		color: var(--color-neon-cyan, #00ffff);
	}

	/* Challenge - Danger (Orange) */
	.card-type-badge[data-type='challenge'] {
		background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.15));
		border-color: #ff8800;
		color: #ff8800;
	}

	/* Event - Safe (Green) */
	.card-type-badge[data-type='event'] {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.15));
		border-color: #00ff88;
		color: #00ff88;
	}

	.type-icon {
		flex-shrink: 0;
	}

	.type-label {
		white-space: nowrap;
	}

	@media screen and (max-width: 600px) {
		.byte-container {
			max-height: calc(100% - 8px);
		}

		.byte-shell {
			padding: var(--space-md, 1rem);
		}

		.byte-content {
			gap: var(--space-sm, 0.75rem);
		}

		.byte-data {
			font-size: 1.25rem;
		}

		.byte-story {
			font-size: 1.0625rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.byte-container.anticipating,
		.byte-container.materializing,
		.byte-container.dismissing,
		.byte-container.materializing .byte-shell,
		.byte-container.materializing .reveal,
		.byte-container.materializing .card-back,
		.bio-pulse::before,
		.bio-pulse::after,
		.byte-container.revealed .tap-hint {
			animation: none !important;
		}

		.byte-container.anticipating,
		.byte-container.materializing,
		.byte-container.revealed {
			opacity: 1;
			transform: none;
		}

		.byte-container.dismissing {
			opacity: 0;
		}

		.byte-container.materializing .card-back {
			opacity: 0;
		}

		.reveal,
		.tap-hint,
		.more-cue {
			transition: none;
		}

		.byte-container.materializing .reveal,
		.byte-container.revealed .tap-hint {
			opacity: 1;
			transform: none;
		}
	}
</style>
