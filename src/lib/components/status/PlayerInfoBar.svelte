<script>
	/**
	 * PlayerInfoBar - the in-game header: exit, help, the game's title and round, and the
	 * settings, dice theme, auto-play and read-aloud controls.
	 *
	 * One grid, mirrored around the title: two sides of the same width (the wider group's), so
	 * the title is centred on the bar whatever sits beside it, and a long one wraps to a second
	 * line. Above 720px every control is an icon with a 12px label under it (EXIT, GUIDE,
	 * SETTINGS, PLAYER | title | ROUND, DICE, AUTO-PLAY, READ ALOUD); each label is part of its
	 * control's accessible name, and the two toggles fill when on (aria-pressed says so). The
	 * player segment shows only for a named player, never "Guest". On phones the bar keeps Exit
	 * and the Guide, the round and one "⋯" menu for the rest.
	 *
	 * The frame is cut so that its two side points sit on the bar's centre line (the top steps
	 * are half the height of the bottom bevels), and every control and label is centred on that
	 * line, the same inset (--hdr-inset) in from either end. The frame is its own layer
	 * (.bar-frame) behind the controls, so where the bar docks at the bottom of the screen
	 * (phones in portrait, OWN-3: StatusDisplay) the frame alone is mirrored, its bevels facing
	 * the board, and the ⋯ menu opens upward.
	 *
	 * The ⋯ menu is a menu button (visual-layout-s-03): opening it focuses its first item; the
	 * arrow keys, Home and End move between the four items; Tab, Shift+Tab or Escape closes it
	 * and puts focus back on ⋯, so nothing under the menu (the step button) takes focus while it
	 * is open. Its fill is opaque.
	 *
	 * The AUTO toggle writes the same gameplay settings as before (playMode.js AUTO_PLAY_ON/OFF);
	 * GameScreen watches them to arm auto-play.
	 *
	 * @component
	 */
	import { onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import { gameState } from '../../stores/gameStore.svelte.js';
	import {
		getAudioSettings,
		getGameplaySettings,
		updateAudioSettings,
		updateGameplaySettings
	} from '../../stores/audioStore.svelte.js';
	import {
		AUTO_PLAY_ON,
		AUTO_PLAY_OFF,
		READ_ALOUD_ON,
		READ_ALOUD_OFF,
		isAutoPlayOn,
		isReadAloudOn
	} from '../../utils/playMode.js';
	import { ANIMATION_DURATION } from '../../constants/animations.js';
	import DiceThemePicker from '../DiceThemePicker.svelte';
	import { menuPlacement } from './menuPlacement.js';

	let {
		/** Handler for exit button click */
		onExitClick,
		/** Handler for help button click */
		onHelpClick,
		/** Handler for settings button click */
		onSettingsClick = () => {}
	} = $props();

	let showDiceThemePicker = $state(false);
	let menuOpen = $state(false);
	let wrapEl = $state();
	let menuEl = $state();
	let moreButton = $state();
	/** Where the menu sits: on the side of the ⋯ button with more room, right edges aligned */
	let menuPosition = $state({ top: undefined, bottom: undefined, right: 0 });

	const MENU_ID = 'game-more-menu';
	const audioEnabled = $derived(isReadAloudOn(getAudioSettings()));
	const autoPlayEnabled = $derived(isAutoPlayOn(getGameplaySettings()));
	const roundLabel = $derived(gameState.config?.labels?.statusDisplayRoundText ?? 'Round');
	/** A named player only: no segment (and no room kept) for a guest */
	const playerName = $derived(
		(gameState.player?.name ?? '').trim().toLowerCase() === 'guest'
			? ''
			: (gameState.player?.name ?? '').trim()
	);

	function toggleAudio() {
		updateAudioSettings(audioEnabled ? READ_ALOUD_OFF : READ_ALOUD_ON);
	}

	function toggleAutoPlay() {
		updateGameplaySettings(autoPlayEnabled ? AUTO_PLAY_OFF : AUTO_PLAY_ON);
	}

	const menuItems = () => [...(menuEl?.querySelectorAll('.game-menu-item') ?? [])];

	/** Open the menu and focus one of its items: the first, or the last ('last') */
	async function openMenu(focus = 'first') {
		if (moreButton) menuPosition = menuPlacement(moreButton.getBoundingClientRect(), window);
		menuOpen = true;
		await tick();
		const items = menuItems();
		(focus === 'last' ? items.at(-1) : items[0])?.focus();
	}

	function toggleMenu() {
		if (menuOpen) closeMenu();
		else openMenu();
	}

	/** On ⋯: the down and up arrows open the menu on its first and last item */
	function onMoreKeydown(event) {
		if (menuOpen || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
		event.preventDefault();
		openMenu(event.key === 'ArrowUp' ? 'last' : 'first');
	}

	/** Inside the menu: the arrows, Home and End move between the items; Tab leaves to ⋯ */
	function onMenuKeydown(event) {
		const items = menuItems();
		const index = items.indexOf(document.activeElement);
		const move = {
			ArrowDown: (index + 1) % items.length,
			ArrowUp: (index - 1 + items.length) % items.length,
			Home: 0,
			End: items.length - 1
		}[event.key];
		if (move !== undefined) {
			event.preventDefault();
			items[move]?.focus();
		} else if (event.key === 'Tab') {
			event.preventDefault();
			closeMenu({ restoreFocus: true });
		}
	}

	/** Focus leaving the menu and ⋯ (a tap elsewhere) closes it */
	function onMenuFocusOut(event) {
		const next = event.relatedTarget;
		if (next && (menuEl?.contains(next) || next === moreButton)) return;
		if (next) closeMenu();
	}

	/** Svelte action: the menu's keyboard model (the menu is a group of buttons) */
	function menuKeys(node) {
		node.addEventListener('keydown', onMenuKeydown);
		node.addEventListener('focusout', onMenuFocusOut);
		return {
			destroy() {
				node.removeEventListener('keydown', onMenuKeydown);
				node.removeEventListener('focusout', onMenuFocusOut);
			}
		};
	}

	/**
	 * Render the menu at the end of <body>: the header sits in a stacking context under the
	 * table, so a menu inside it would paint over the table but not take its taps.
	 */
	function portal(node) {
		document.body.appendChild(node);
		return { destroy: () => node.remove() };
	}

	function closeMenu({ restoreFocus = false } = {}) {
		if (!menuOpen) return;
		menuOpen = false;
		if (restoreFocus) moreButton?.focus();
	}

	/**
	 * Menu items that open something close the menu first, with focus back on ⋯: the dialog then
	 * records ⋯ as its trigger (not the vanishing item), takes focus, and gives it back to ⋯ on
	 * close (visual-layout-s-07)
	 */
	const fromMenu = (handler) => () => {
		closeMenu({ restoreFocus: true });
		handler();
	};

	const menuFade = () => ({
		duration: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
			? 0
			: ANIMATION_DURATION.FAST
	});

	onMount(() => {
		// A tap outside closes the menu and nothing else: the table would otherwise take the same
		// tap as "press the primary button"
		const swallowClick = (event) => {
			event.stopPropagation();
			event.preventDefault();
		};
		const onPointerDown = (event) => {
			if (!menuOpen || wrapEl?.contains(event.target) || menuEl?.contains(event.target)) return;
			closeMenu();
			document.addEventListener('click', swallowClick, { capture: true, once: true });
			setTimeout(() => document.removeEventListener('click', swallowClick, true), 500);
		};
		const onKeydown = (event) => {
			if (event.key === 'Escape' && menuOpen) {
				event.stopPropagation();
				event.preventDefault();
				closeMenu({ restoreFocus: true });
			}
		};
		// Synthetic resize events fire during play (layout code dispatches them), so only a real
		// change of width closes the menu
		let width = window.innerWidth;
		const onResize = () => {
			if (window.innerWidth !== width) closeMenu();
			width = window.innerWidth;
		};
		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onKeydown, true);
		window.addEventListener('resize', onResize);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeydown, true);
			window.removeEventListener('resize', onResize);
		};
	});
</script>

{#snippet icon(name)}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill={name === 'auto' ? 'currentColor' : 'none'}
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		{#if name === 'exit'}
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		{:else if name === 'help'}
			<circle cx="12" cy="12" r="10" />
			<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
			<path d="M12 17h.01" />
		{:else if name === 'settings'}
			<path
				d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
			/>
			<circle cx="12" cy="12" r="3" />
		{:else if name === 'dice'}
			<rect width="12" height="12" x="2" y="10" rx="2" ry="2" />
			<path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6" />
			<path d="M6 18h.01" />
			<path d="M10 14h.01" />
			<path d="M15 6h.01" />
			<path d="M18 9h.01" />
		{:else if name === 'auto'}
			<polygon points="6 4 20 12 6 20 6 4" />
		{:else if name === 'voice'}
			<path d="M2 10v3" />
			<path d="M6 6v11" />
			<path d="M10 3v18" />
			<path d="M14 8v7" />
			<path d="M18 5v13" />
			<path d="M22 10v3" />
		{:else if name === 'more'}
			<circle cx="5" cy="12" r="1.5" fill="currentColor" />
			<circle cx="12" cy="12" r="1.5" fill="currentColor" />
			<circle cx="19" cy="12" r="1.5" fill="currentColor" />
		{/if}
	</svg>
{/snippet}

<div class="player-bar-wrap" bind:this={wrapEl}>
	<div class="player-round-bar header-fade-in">
		<span
			class="bar-frame"
			data-augmented-ui="tl-2-clip-x tr-2-clip-x br-clip bl-clip border"
			aria-hidden="true"
		></span>
		<div class="bar-group bar-start">
			<button class="status-bar-button exit-button" onclick={onExitClick} aria-label="Exit game">
				{@render icon('exit')}<span class="btn-label">Exit</span>
			</button>
			<button class="status-bar-button help-button" onclick={onHelpClick} aria-label="Game Guide">
				{@render icon('help')}<span class="btn-label">Guide</span>
			</button>
			<button class="status-bar-button settings-button wide-only" onclick={onSettingsClick}>
				{@render icon('settings')}<span class="btn-label">Settings</span>
			</button>
			{#if playerName}
				<div class="info-segment player-segment wide-only">
					<span class="label">Player</span>
					<span class="value">{playerName}</span>
				</div>
			{/if}
		</div>

		<h5 class="game-title">{gameState.config?.title}</h5>

		<div class="bar-group bar-end">
			<div class="info-segment round-segment">
				<span class="label">{roundLabel}</span>
				<span class="value">{gameState?.round}</span>
			</div>
			<button
				class="status-bar-button dice-theme-button wide-only"
				onclick={() => (showDiceThemePicker = true)}
				aria-label="Dice theme"
			>
				{@render icon('dice')}<span class="btn-label">Dice</span>
			</button>
			<button
				class="status-bar-button toggle-button wide-only"
				class:active={autoPlayEnabled}
				onclick={toggleAutoPlay}
				aria-pressed={autoPlayEnabled}
			>
				{@render icon('auto')}<span class="btn-label">Auto-play</span>
			</button>
			<button
				class="status-bar-button toggle-button wide-only"
				class:active={audioEnabled}
				onclick={toggleAudio}
				aria-pressed={audioEnabled}
			>
				{@render icon('voice')}<span class="btn-label">Read aloud</span>
			</button>
			<button
				bind:this={moreButton}
				class="status-bar-button more-button phone-only"
				class:active={autoPlayEnabled || audioEnabled}
				onclick={toggleMenu}
				onkeydown={onMoreKeydown}
				aria-label="More game options"
				aria-expanded={menuOpen}
				aria-controls={MENU_ID}
			>
				{@render icon('more')}
			</button>
		</div>
	</div>

	{#if menuOpen}
		<div
			id={MENU_ID}
			class="game-menu"
			role="group"
			aria-label="More game options"
			bind:this={menuEl}
			use:portal
			use:menuKeys
			style:top={menuPosition.top === undefined ? undefined : `${menuPosition.top}px`}
			style:bottom={menuPosition.bottom === undefined ? undefined : `${menuPosition.bottom}px`}
			style:right="{menuPosition.right}px"
			transition:fade={menuFade()}
		>
			<button class="game-menu-item" onclick={fromMenu(onSettingsClick)}>
				{@render icon('settings')}<span>Settings</span>
			</button>
			<button class="game-menu-item" onclick={fromMenu(() => (showDiceThemePicker = true))}>
				{@render icon('dice')}<span>Dice theme</span>
			</button>
			<button
				class="game-menu-item toggle-item"
				class:active={autoPlayEnabled}
				onclick={toggleAutoPlay}
				aria-pressed={autoPlayEnabled}
			>
				{@render icon('auto')}<span>Auto-play</span>
				<span class="state" aria-hidden="true">{autoPlayEnabled ? 'On' : 'Off'}</span>
			</button>
			<button
				class="game-menu-item toggle-item"
				class:active={audioEnabled}
				onclick={toggleAudio}
				aria-pressed={audioEnabled}
			>
				{@render icon('voice')}<span>Read aloud</span>
				<span class="state" aria-hidden="true">{audioEnabled ? 'On' : 'Off'}</span>
			</button>
		</div>
	{/if}
</div>

<!-- Dice Theme Picker Modal -->
<DiceThemePicker bind:isOpen={showDiceThemePicker} />

<style>
	.player-bar-wrap {
		position: relative;
	}

	/* One 200ms fade as the table appears (no slide-down) */
	.header-fade-in {
		animation: header-in 200ms ease-out both;
	}

	@keyframes header-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.player-round-bar {
		/* The inset from either end, and each side's width: the wider group's (ROUND, DICE,
		   AUTO-PLAY, READ ALOUD), so the title is centred on the bar */
		--hdr-inset: var(--space-md);
		--hdr-side: 18rem;

		display: grid;
		grid-template-columns: var(--hdr-side) minmax(0, 1fr) var(--hdr-side);
		align-items: center;
		column-gap: var(--space-sm);
		/* From 1024px the bar is as wide as the HUD under it, edge for edge */
		max-width: 960px;
		margin-inline: auto;
		min-height: 52px;
		padding: 4px var(--hdr-inset);
		box-sizing: border-box;
		position: relative;
		/* The frame layer stays behind the controls, inside the bar */
		isolation: isolate;
	}

	/* The frame: its own layer, so it can be mirrored without touching the controls */
	.bar-frame {
		--aug-border-all: 2px;
		--aug-border-bg: var(
			--frame-border,
			linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta))
		);
		/* Two 9px top steps (18px) mirror the 18px bottom bevels: the side points sit on the
		   centre line, where the controls are */
		--aug-tl: 9px;
		--aug-tr: 9px;
		--aug-br: 18px;
		--aug-bl: 18px;
		position: absolute;
		inset: 0;
		z-index: -1;
		display: block;
		pointer-events: none;
		background: linear-gradient(
			135deg,
			rgba(100, 50, 200, 0.3),
			rgba(50, 150, 255, 0.25),
			rgba(100, 50, 200, 0.2)
		);
		/* No backdrop-filter: Chromium paints it outside the clip-path (filled corners), and the
		   blur re-ran every frame over a near-black table anyway */
		box-shadow:
			0 0 30px rgba(0, 238, 255, 0.5),
			inset 0 0 30px rgba(255, 0, 255, 0.2);
	}

	/* Each side is one row of controls: the start group from the left, the end group from the
	   right */
	.bar-group {
		display: flex;
		align-items: center;
		gap: 2px;
		min-width: 0;
	}

	.bar-end {
		justify-content: flex-end;
	}

	/* Icon over a 12px label; at least 44px wide and tall */
	.status-bar-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		flex: none;
		box-sizing: border-box;
		min-width: 44px;
		min-height: 44px;
		padding: 2px 4px;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		color: #00eeff;
		cursor: pointer;
		transition:
			color 120ms ease-out,
			background-color 120ms ease-out,
			border-color 120ms ease-out;
	}

	.status-bar-button svg {
		filter: drop-shadow(0 0 4px currentColor);
	}

	.btn-label {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
		color: #c8d6e5;
	}

	.status-bar-button:hover {
		color: #fff;
		background: rgba(0, 238, 255, 0.1);
	}

	.status-bar-button:focus-visible,
	.game-menu-item:focus-visible {
		outline: 3px solid var(--color-neon-cyan);
		outline-offset: 1px;
	}

	/* On: filled, and the label says so in cyan */
	.toggle-button.active {
		color: #04121a;
		background: var(--color-neon-cyan);
		border-color: var(--color-neon-cyan);
	}

	.toggle-button.active svg {
		filter: none;
	}

	.toggle-button.active .btn-label {
		color: #04121a;
	}

	.toggle-button.active:hover {
		color: #04121a;
		background: #7ffcff;
	}

	.info-segment {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		flex: none;
		min-width: 56px;
		max-width: 7rem;
		padding-inline: 4px;
		text-transform: uppercase;
	}

	.info-segment .label {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.06em;
		white-space: nowrap;
		color: #00ffff;
	}

	.info-segment .value {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.15;
		color: #fff;
	}

	/* Centred on the bar: the middle track of a mirrored grid. A long title takes a second
	   line (balanced) rather than an ellipsis; the bar's height does not change. */
	.game-title {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		margin: 0;
		min-width: 0;
		overflow: hidden;
		text-wrap: balance;
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.25;
		letter-spacing: 0.02em;
		text-transform: none;
		color: #fff;
		text-align: center;
	}

	.phone-only {
		display: none;
	}

	.game-menu {
		position: fixed;
		z-index: 1500;
		min-width: 220px;
		padding: 4px;
		/* Opaque: nothing on the board (the step button's glow) shows through */
		background: rgb(8, 12, 22);
		border: 1px solid rgba(0, 255, 255, 0.5);
		border-radius: 6px;
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
	}

	.game-menu-item {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		min-height: 48px;
		padding: 0 12px;
		background: transparent;
		border: none;
		border-radius: 4px;
		color: #e2e9f2;
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-align: left;
		cursor: pointer;
	}

	.game-menu-item svg {
		flex-shrink: 0;
		color: var(--color-neon-cyan);
	}

	.game-menu-item:hover {
		background: rgba(0, 255, 255, 0.1);
	}

	.toggle-item .state {
		margin-left: auto;
		padding: 2px 8px;
		border: 1px solid #6a87a3;
		border-radius: 3px;
		font-size: 0.75rem;
		color: #c8d6e5;
	}

	.toggle-item.active .state {
		background: var(--color-neon-cyan);
		border-color: var(--color-neon-cyan);
		color: #04121a;
	}

	/* Tablets and landscape phones: the sides at the end group's own width */
	@media (max-width: 1023px) {
		.player-round-bar {
			--hdr-inset: var(--space-sm);
			--hdr-side: 17.25rem;
		}
	}

	/* Phones: Exit and Help | the title | the round and one menu for the rest */
	@media (max-width: 720px) {
		.player-round-bar {
			--hdr-inset: var(--space-sm);
			--hdr-side: calc(2 * 44px + 2px);
			min-height: 48px;
			padding-block: 2px;
		}

		.bar-group {
			gap: 2px;
		}

		.info-segment {
			min-width: 44px;
		}

		.wide-only {
			display: none;
		}

		.phone-only {
			display: flex;
		}

		.btn-label {
			display: none;
		}

		.status-bar-button svg {
			width: 22px;
			height: 22px;
		}

		.more-button.active {
			color: var(--color-neon-cyan);
			border-color: rgba(0, 255, 255, 0.5);
		}

		/* The round's label may be a little wider than its track; it stays centred on it */
		.round-segment {
			justify-self: center;
		}
	}

	@media (max-width: 600px) {
		.game-title {
			font-size: 0.875rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.header-fade-in {
			animation: none;
		}

		.status-bar-button {
			transition: none;
		}
	}
</style>
