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
</script>

<div
	class="byte-container"
	data-type={card?.type}
	class:anticipating={animationStage === 'anticipating'}
	class:materializing={animationStage === 'materializing'}
	class:revealed={animationStage === 'revealed'}
	class:dismissing={animationStage === 'dismissing'}
	class:clickable={canDismiss}
	onclick={() => {
		if (canDismiss) onDismiss();
	}}
	role={canDismiss ? 'button' : 'presentation'}
	tabindex={canDismiss ? '0' : '-1'}
	onkeydown={(e) => {
		if (canDismiss && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			onDismiss();
		}
	}}
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

					<p class="byte-data reveal">{card.description || ''}</p>
					<p class="byte-story reveal">{card.story}</p>

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

		position: relative;
		width: 100%;
		height: 100%;
		max-height: calc(100% - 24px);
		max-width: min(560px, 92vw);
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
			width: auto;
			aspect-ratio: 5 / 7;
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
		padding: var(--space-md, 1rem);
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
		padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
		overflow-y: auto;
		height: 100%;
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
	.byte-container.materializing .byte-story {
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
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--text-xl, 1.25rem);
		line-height: var(--line-height-base, 1.5);
		color: #ffffff;
		margin: 0;
		font-weight: 600;
	}

	.byte-story {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--text-base, 1rem);
		line-height: 1.6;
		color: var(--color-text-secondary, rgba(255, 255, 255, 0.85));
		margin: 0;
		font-weight: 400;
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
		display: flex;
		align-items: center;
		gap: var(--space-md, 1rem);
		margin-top: auto;
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
			padding: var(--space-sm, 0.5rem);
		}

		.byte-content {
			padding: var(--space-sm, 0.5rem);
			gap: var(--space-md, 1rem);
		}

		.byte-data {
			font-size: var(--text-lg, 1.125rem);
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
		.tap-hint {
			transition: none;
		}

		.byte-container.materializing .reveal,
		.byte-container.revealed .tap-hint {
			opacity: 1;
			transform: none;
		}
	}
</style>
