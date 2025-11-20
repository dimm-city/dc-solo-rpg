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

let {
	card = null,
	animationStage = 'idle',
	onDismiss = () => {},
	clickable = true
} = $props();
</script>

<div
	class="byte-container"
	class:materializing={animationStage === 'materializing'}
	class:revealed={animationStage === 'revealed'}
	class:dismissing={animationStage === 'dismissing'}
	class:clickable={animationStage === 'revealed' && clickable}
	onclick={() => {
		if (animationStage === 'revealed' && clickable) onDismiss();
	}}
	role={clickable && animationStage === 'revealed' ? 'button' : 'presentation'}
	tabindex={clickable && animationStage === 'revealed' ? '0' : '-1'}
	onkeydown={(e) => {
		if (clickable && animationStage === 'revealed' && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			onDismiss();
		}
	}}
>
	{#if animationStage !== 'idle' && animationStage !== 'anticipating'}
		<div class="byte-shell" data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
			<!-- Bio-pulse rings -->
			<div class="bio-pulse" aria-hidden="true"></div>

			<!-- Byte content -->
			{#if card}
				<div class="byte-content">
					<!-- Card Type Indicator -->
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

					<p class="byte-data">{card.description || ''}</p>
					<small class="byte-id">
						BYTE-{card.card}-{card.suit?.slice(0, 3).toUpperCase() || 'UNK'}
					</small>
					<p>
						{card.story}
					</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* ============================================
	   BYTE CONTAINER
	   ============================================ */

	.byte-container {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 400px;
		max-width: 80svw;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transform: scale(0.8);
		transition: none;
	}

	/* Clickable state when revealed */
	.byte-container.clickable {
		cursor: pointer;
		transition: none;
	}

	.byte-container.materializing {
		animation: byte-materialize 800ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	.byte-container.revealed {
		opacity: 1;
		transform: scale(1);
	}

	.byte-container.dismissing {
		animation: byte-dismiss 600ms cubic-bezier(0.4, 0, 0.6, 1) forwards;
	}

	@keyframes byte-materialize {
		0% {
			opacity: 0;
			transform: scale(0.95) translateY(10px);
			filter: blur(8px) brightness(0.8);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
			filter: blur(0px) brightness(1);
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
			filter: blur(3px);
		}
	}

	/* ============================================
	   BYTE SHELL - MAIN CARD
	   ============================================ */

	.byte-shell {
		/* Augmented UI Configuration */
		--aug-border-all: 3px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 16px;
		--aug-tr: 16px;
		--aug-br: 16px;
		--aug-bl: 16px;

		position: relative;
		width: 100%;
		height: 100%;
		padding: var(--space-xl, 2rem);
		margin-bottom: var(--space-lg, 1.5rem);
		overflow-y: hidden;
		overflow-x: hidden;
		box-sizing: border-box;

		/* Glassmorphism Effect */
		background: linear-gradient(
			135deg,
			rgba(20, 20, 30, 0.95) 0%,
			rgba(10, 10, 20, 0.9) 50%,
			rgba(15, 15, 25, 0.95) 100%
		);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);

		/* Multi-layer Glow */
		box-shadow:
			0 0 40px rgba(0, 255, 255, 0.5),
			0 0 80px rgba(217, 70, 239, 0.3),
			0 0 120px rgba(0, 255, 255, 0.15),
			inset 0 0 40px rgba(217, 70, 239, 0.15),
			inset 0 0 60px rgba(0, 255, 255, 0.08);
	}

	.byte-container.materializing .byte-shell {
		animation: glitch-effect 200ms steps(2) 3;
	}

	@keyframes glitch-effect {
		0%,
		100% {
			transform: translate(0);
			filter: hue-rotate(0deg);
		}
		25% {
			transform: translate(-2px, 2px);
			filter: hue-rotate(90deg);
		}
		75% {
			transform: translate(2px, -2px);
			filter: hue-rotate(-90deg);
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
		border: 2px solid var(--color-cyber-magenta, #d946ef);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		animation: bio-pulse-ring 4s ease-out infinite;
		opacity: 0;
	}

	.bio-pulse::after {
		animation-delay: 2s;
	}

	@keyframes bio-pulse-ring {
		0% {
			width: 100px;
			height: 100px;
			opacity: 0.2;
		}
		100% {
			width: 300px;
			height: 300px;
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
		gap: var(--space-lg, 1.5rem);
		color: var(--color-text-primary, #fff);
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.4) 100%);
		padding: var(--space-lg, 1.5rem);
		border-radius: 8px;
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);

		overflow-y: auto;
		height: 100%;
	}

	.byte-content p {
		color: #ffffff;
		text-shadow:
			0 2px 8px rgba(0, 0, 0, 0.9),
			0 0 4px rgba(0, 0, 0, 0.8);
		font-weight: 400;
		line-height: 1.6;
		margin: 0;
	}

	/* Card Type Badge Styles */
	.card-type-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-sm, 0.875rem);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		align-self: flex-start;
		opacity: 0;
		animation: badge-materialize 150ms ease-out 400ms forwards;
		border: 2px solid;
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}

	/* Primary Success - Victory (Gold) */
	.card-type-badge[data-type='primary-success'] {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.15));
		border-color: var(--color-brand-yellow, #ffd700);
		color: var(--color-brand-yellow, #ffd700);
		box-shadow:
			0 0 15px rgba(255, 215, 0, 0.4),
			inset 0 0 10px rgba(255, 215, 0, 0.1);
	}

	.card-type-badge[data-type='primary-success'] .type-icon {
		color: var(--color-brand-yellow, #ffd700);
		filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
	}

	/* Failure Counter - Doom (Red) */
	.card-type-badge[data-type='failure-counter'] {
		background: linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(185, 28, 28, 0.15));
		border-color: #ff0055;
		color: #ff0055;
		box-shadow:
			0 0 15px rgba(255, 0, 85, 0.4),
			inset 0 0 10px rgba(255, 0, 85, 0.1);
	}

	.card-type-badge[data-type='failure-counter'] .type-icon {
		color: #ff0055;
		filter: drop-shadow(0 0 4px rgba(255, 0, 85, 0.6));
	}

	/* Narrative - Bonus (Cyan) */
	.card-type-badge[data-type='narrative'] {
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 200, 200, 0.15));
		border-color: var(--color-neon-cyan, #00ffff);
		color: var(--color-neon-cyan, #00ffff);
		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.4),
			inset 0 0 10px rgba(0, 255, 255, 0.1);
	}

	.card-type-badge[data-type='narrative'] .type-icon {
		color: var(--color-neon-cyan, #00ffff);
		filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.6));
	}

	/* Challenge - Danger (Orange) */
	.card-type-badge[data-type='challenge'] {
		background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.15));
		border-color: #ff8800;
		color: #ff8800;
		box-shadow:
			0 0 15px rgba(255, 136, 0, 0.4),
			inset 0 0 10px rgba(255, 136, 0, 0.1);
	}

	.card-type-badge[data-type='challenge'] .type-icon {
		color: #ff8800;
		filter: drop-shadow(0 0 4px rgba(255, 136, 0, 0.6));
	}

	/* Event - Safe (Green) */
	.card-type-badge[data-type='event'] {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.15));
		border-color: #00ff88;
		color: #00ff88;
		box-shadow:
			0 0 15px rgba(0, 255, 136, 0.4),
			inset 0 0 10px rgba(0, 255, 136, 0.1);
	}

	.card-type-badge[data-type='event'] .type-icon {
		color: #00ff88;
		filter: drop-shadow(0 0 4px rgba(0, 255, 136, 0.6));
	}

	@keyframes badge-materialize {
		0% {
			opacity: 0;
			transform: scale(0.95);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	.type-icon {
		flex-shrink: 0;
	}

	.type-label {
		white-space: nowrap;
	}

	.byte-data {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--text-lg, 1.125rem);
		line-height: var(--line-height-relaxed, 1.75);
		color: #ffffff;
		margin: 0;
		opacity: 0;
		animation: text-materialize 800ms ease-out 200ms forwards;
		text-shadow:
			0 2px 8px rgba(0, 0, 0, 0.9),
			0 0 4px rgba(0, 0, 0, 0.8);
		font-weight: 500;
	}

	.byte-id {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-xs, 0.75rem);
		letter-spacing: var(--letter-spacing-wider, 0.1em);
		color: var(--color-neon-cyan, #00ffff);
		text-transform: uppercase;
		opacity: 0;
		animation: text-materialize 600ms ease-out 600ms forwards;
		text-shadow:
			0 0 12px rgba(0, 255, 255, 1),
			0 0 24px rgba(0, 255, 255, 0.7),
			0 2px 6px rgba(0, 0, 0, 0.9);
		font-weight: 700;
	}

	@keyframes text-materialize {
		0% {
			opacity: 0;
			transform: translateY(10px);
			filter: blur(5px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.byte-container.materializing,
		.byte-container.dismissing,
		.byte-shell,
		.bio-pulse::before,
		.bio-pulse::after,
		.card-type-badge,
		.byte-data,
		.byte-id {
			animation: none !important;
		}

		.byte-container.materializing,
		.byte-container.revealed {
			opacity: 1;
			transform: scale(1);
		}

		.card-type-badge,
		.byte-data,
		.byte-id {
			opacity: 1;
			transform: none;
		}
	}
</style>
