<!--
 * GameCard - One finished run in the Story Library (an <li> of the library's list)
 *
 * Title, how it ended in the Guide's verbs ("Escaped", "Taken by the fourth King", "Fell when
 * Stability reached 0"), rounds and date. The whole card opens the story; Delete lives in an
 * overflow menu, away from that tap, and asks for confirmation (the parent owns the
 * confirmation dialog).
 *
 * @component
 * @example
 * <GameCard {game} {index} onSelect={viewGame} onDelete={askToDelete} {formatDate} />
 -->

<script>
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';
	import { getStoryOutcome, formatRounds } from '$lib/utils/storyOutcome.js';

	let {
		game = null,
		index = 0,
		onSelect = () => {},
		onDelete = () => {},
		formatDate = (d) => d
	} = $props();

	const uid = $props.id();
	const menuId = `story-card-menu-${uid}`;

	let outcome = $derived(getStoryOutcome(game));
	let title = $derived(game.gameTitle || 'Untitled game');

	let menuOpen = $state(false);
	let menuButton = $state();
	let menuElement = $state();

	const reducedMotion = () =>
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

	function openMenu(focusFirst = false) {
		menuOpen = true;
		if (focusFirst) {
			requestAnimationFrame(() => menuElement?.querySelector('[role="menuitem"]')?.focus());
		}
	}

	function closeMenu({ returnFocus = false } = {}) {
		menuOpen = false;
		if (returnFocus) menuButton?.focus();
	}

	function toggleMenu(event) {
		// A keyboard press (detail 0) moves focus into the menu, as menu buttons do
		if (menuOpen) closeMenu();
		else openMenu(event.detail === 0);
	}

	function handleMenuKeydown(event) {
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			closeMenu({ returnFocus: true });
		} else if (event.key === 'Tab') {
			closeMenu();
		}
	}

	function handleWindowPointer(event) {
		if (!menuOpen) return;
		if (menuElement?.contains(event.target) || menuButton?.contains(event.target)) return;
		closeMenu();
	}

	function chooseDelete() {
		closeMenu();
		onDelete(game);
	}
</script>

<svelte:window onpointerdown={handleWindowPointer} />

<li
	class="story-card"
	class:won={outcome.won}
	data-outcome={outcome.kind}
	data-testid="story-card"
	data-augmented-ui="tl-clip br-clip border"
	in:fly={{
		y: 20,
		duration: reducedMotion() ? 0 : ANIMATION_DURATION.SLOW,
		delay: reducedMotion() ? 0 : index * 50,
		easing: quintOut
	}}
>
	<button type="button" class="card-open" onclick={() => onSelect(game)}>
		<span class="card-title">{title}</span>
		<span class="card-outcome">
			{#if outcome.kind === 'escaped'}
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M14 4h5v16h-5" />
					<path d="M3 12h11" />
					<path d="M10 8l4 4-4 4" />
				</svg>
			{:else if outcome.kind === 'kings'}
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M4 18h16" />
					<path d="M4 15l-1-9 5 4 4-6 4 6 5-4-1 9z" />
				</svg>
			{:else}
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M2 12h5l2-5 3 10 2-5h8" />
				</svg>
			{/if}
			{outcome.label}
		</span>
		<span class="card-meta">
			{formatRounds(game.roundsSurvived)} · {formatDate(game.lastPlayed || game.savedAt)}
		</span>
		<span class="card-read" aria-hidden="true">
			Read story
			<svg viewBox="0 0 20 20"><path d="M8 4l6 6-6 6" /></svg>
		</span>
	</button>

	<div class="card-menu">
		<button
			bind:this={menuButton}
			type="button"
			class="menu-button"
			aria-label="More options for {title}"
			aria-haspopup="menu"
			aria-expanded={menuOpen}
			aria-controls={menuOpen ? menuId : undefined}
			onclick={toggleMenu}
			onkeydown={handleMenuKeydown}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<circle cx="5" cy="12" r="1.6" />
				<circle cx="12" cy="12" r="1.6" />
				<circle cx="19" cy="12" r="1.6" />
			</svg>
		</button>

		{#if menuOpen}
			<div
				bind:this={menuElement}
				id={menuId}
				class="menu"
				role="menu"
				tabindex="-1"
				aria-label="Options for {title}"
				onkeydown={handleMenuKeydown}
			>
				<button type="button" class="menu-item danger" role="menuitem" onclick={chooseDelete}>
					Delete story…
				</button>
			</div>
		{/if}
	</div>
</li>

<style>
	.story-card {
		position: relative;
		display: flex;
		margin: 0;
		background: linear-gradient(135deg, rgba(100, 50, 200, 0.16), rgba(20, 30, 50, 0.4));
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		transition: background-color 150ms ease-out;
		--aug-tl: 14px;
		--aug-br: 14px;
		--aug-border-all: 1px;
		--aug-border-bg: rgba(186, 85, 211, 0.55);
	}

	.story-card.won {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(20, 30, 50, 0.4));
		--aug-border-bg: rgba(255, 215, 0, 0.55);
	}

	.card-open {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		min-width: 0;
		padding: 20px 24px;
		background: none;
		border: 0;
		color: inherit;
		font-family: var(--font-body);
		text-align: left;
		cursor: pointer;
	}

	.story-card:hover {
		background-color: rgba(138, 43, 226, 0.12);
	}

	.card-open:focus-visible {
		outline: 3px solid var(--color-neon-cyan);
		outline-offset: -6px;
		box-shadow: none;
	}

	/* Display face is for titles of 28px and up; card titles use Inter (MN-07) */
	.card-title {
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.3;
		letter-spacing: 0.02em;
		color: #fff;
		overflow-wrap: anywhere;
		/* Only the title shares a row with the overflow button (top 8px, 44px tall, 8px from the
		   right): it keeps clear of it, and is tall enough (28px on phones) that the outcome line
		   below starts under the button, so that line can use the card's full width */
		align-self: stretch;
		padding-right: 40px;
	}

	.card-outcome {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 1rem;
		font-weight: 600;
		color: #ff8fa3;
	}

	.story-card.won .card-outcome {
		color: var(--color-brand-yellow);
	}

	.card-outcome svg {
		flex-shrink: 0;
		width: 18px;
		height: 18px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.card-meta {
		font-size: 0.875rem;
		color: #b8c5d6;
		font-variant-numeric: tabular-nums;
	}

	.card-read {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin-top: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-neon-cyan);
	}

	.card-read svg {
		width: 16px;
		height: 16px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: transform 150ms ease-out;
	}

	.card-open:hover .card-read svg {
		transform: translateX(3px);
	}

	.card-menu {
		position: absolute;
		top: 8px;
		right: 8px;
	}

	.menu-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		min-height: 44px;
		padding: 0;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		color: #d5dfeb;
		cursor: pointer;
	}

	.menu-button svg {
		flex-shrink: 0;
		width: 22px;
		height: 22px;
		fill: currentColor;
	}

	.menu-button:hover,
	.menu-button[aria-expanded='true'] {
		border-color: rgba(255, 255, 255, 0.35);
		background: rgba(0, 0, 0, 0.35);
	}

	/* Opens inside the card: the clipped frame would cut off anything outside it */
	.menu {
		position: absolute;
		top: 48px;
		right: 0;
		z-index: 2;
		min-width: 180px;
		padding: 4px;
		background: #0b1622;
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 4px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
	}

	.menu-item {
		display: block;
		width: 100%;
		min-height: 44px;
		padding: 8px 12px;
		background: none;
		border: 0;
		border-radius: 2px;
		color: #fff;
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 600;
		text-align: left;
		cursor: pointer;
	}

	.menu-item.danger {
		color: #ff8fa3;
	}

	.menu-item:hover,
	.menu-item:focus-visible {
		background: rgba(255, 77, 109, 0.16);
		outline: none;
		box-shadow: inset 0 0 0 2px var(--color-danger, #ff4d6d);
	}

	@media (max-width: 640px) {
		.card-open {
			padding: 16px 20px;
		}

		.card-title {
			min-height: 28px;
			font-size: 1.125rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.story-card,
		.card-read svg {
			transition: none;
		}

		.card-open:hover .card-read svg {
			transform: none;
		}
	}
</style>
