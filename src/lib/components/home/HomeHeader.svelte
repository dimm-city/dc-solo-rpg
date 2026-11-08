<script>
	/**
	 * HomeHeader - brand plus the home screen's actions.
	 *
	 * 900px and up: Story Library, Settings and Guide inline with text labels, and a "More" menu
	 * for the rest. Below 900px: one menu button ("Menu") holding every action. Each feature has
	 * one name everywhere: Story Library, Game Guide, Dice theme.
	 */
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { ANIMATION_DURATION } from '../../constants/animations.js';

	let {
		uploading = false,
		signedIn = false,
		onupload,
		onstories,
		onsettings,
		ondice,
		onabout,
		onhelp,
		onsignout
	} = $props();

	let menuOpen = $state(false);
	let headerEl = $state();
	/** The control that opened the menu, so focus can go back to it */
	let opener = null;

	const MENU_ID = 'home-menu';
	const menuFade = () => ({
		duration: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
			? 0
			: ANIMATION_DURATION.FAST
	});

	function toggleMenu(event) {
		opener = event.currentTarget;
		menuOpen = !menuOpen;
	}

	function closeMenu({ restoreFocus = false } = {}) {
		if (!menuOpen) return;
		menuOpen = false;
		if (restoreFocus) opener?.focus();
	}

	/** Run a menu or header action, closing the menu first */
	const act = (handler) => (event) => {
		closeMenu();
		handler?.(event);
	};

	onMount(() => {
		const onPointerDown = (event) => {
			if (menuOpen && headerEl && !headerEl.contains(event.target)) closeMenu();
		};
		const onKeydown = (event) => {
			if (event.key === 'Escape' && menuOpen) {
				event.stopPropagation();
				closeMenu({ restoreFocus: true });
			}
		};
		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onKeydown, true);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeydown, true);
		};
	});
</script>

{#snippet icon(name, size = 20)}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		{#if name === 'upload'}
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
			<polyline points="17 8 12 3 7 8"></polyline>
			<line x1="12" x2="12" y1="3" y2="15"></line>
		{:else if name === 'stories'}
			<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
			<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
		{:else if name === 'settings'}
			<path
				d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
			/>
			<circle cx="12" cy="12" r="3" />
		{:else if name === 'dice'}
			<rect x="3" y="3" width="18" height="18" rx="2" />
			<circle cx="8.5" cy="8.5" r="1.5" />
			<circle cx="15.5" cy="15.5" r="1.5" />
		{:else if name === 'about'}
			<circle cx="12" cy="12" r="10"></circle>
			<path d="M12 16v-4"></path>
			<path d="M12 8h.01"></path>
		{:else if name === 'help'}
			<circle cx="12" cy="12" r="10"></circle>
			<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
			<path d="M12 17h.01"></path>
		{:else if name === 'signout'}
			<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
			<polyline points="16 17 21 12 16 7"></polyline>
			<line x1="21" y1="12" x2="9" y2="12"></line>
		{:else if name === 'chevron'}
			<path d="m6 9 6 6 6-6" />
		{:else if name === 'menu'}
			<line x1="3" y1="12" x2="21" y2="12"></line>
			<line x1="3" y1="6" x2="21" y2="6"></line>
			<line x1="3" y1="18" x2="21" y2="18"></line>
		{:else if name === 'close'}
			<line x1="18" y1="6" x2="6" y2="18"></line>
			<line x1="6" y1="6" x2="18" y2="18"></line>
		{/if}
	</svg>
{/snippet}

<header class="page-header" bind:this={headerEl}>
	<div class="header-logo">
		<img src="/d20-150.png" alt="Dream Console logo" class="logo-dice" width="56" height="56" />
		<div class="brand">
			<span class="version-text">Dream Console</span>
			<span class="maker">Dimm City</span>
		</div>
	</div>

	<nav class="header-nav" aria-label="Main">
		<div class="header-buttons">
			<button class="header-button library-button" onclick={act(onstories)}>
				{@render icon('stories', 18)}<span>Story Library</span>
			</button>
			<button class="header-button settings-button" onclick={act(onsettings)}>
				{@render icon('settings', 18)}<span>Settings</span>
			</button>
			<button class="header-button help-button" onclick={act(onhelp)} aria-label="Game Guide">
				{@render icon('help', 18)}<span>Guide</span>
			</button>
			<button
				class="header-button more-button"
				onclick={toggleMenu}
				aria-expanded={menuOpen}
				aria-controls={MENU_ID}
			>
				<span>More</span>{@render icon('chevron', 16)}
			</button>
		</div>

		<button
			class="hamburger-button"
			onclick={toggleMenu}
			aria-label="Menu"
			aria-expanded={menuOpen}
			aria-controls={MENU_ID}
		>
			{@render icon(menuOpen ? 'close' : 'menu', 28)}
		</button>
	</nav>

	{#if menuOpen}
		<div id={MENU_ID} class="mobile-menu" transition:fade={menuFade()}>
			<button class="mobile-menu-item" onclick={act(onupload)} disabled={uploading}>
				{@render icon('upload')}<span>Upload game</span>
			</button>
			<button class="mobile-menu-item inline-on-desktop" onclick={act(onstories)}>
				{@render icon('stories')}<span>Story Library</span>
			</button>
			<button class="mobile-menu-item inline-on-desktop" onclick={act(onsettings)}>
				{@render icon('settings')}<span>Settings</span>
			</button>
			<button class="mobile-menu-item" onclick={act(ondice)}>
				{@render icon('dice')}<span>Dice theme</span>
			</button>
			<button class="mobile-menu-item" onclick={act(onabout)}>
				{@render icon('about')}<span>About</span>
			</button>
			<button class="mobile-menu-item inline-on-desktop" onclick={act(onhelp)}>
				{@render icon('help')}<span>Game Guide</span>
			</button>
			{#if signedIn}
				<button class="mobile-menu-item signout-menu-item" onclick={act(onsignout)}>
					{@render icon('signout')}<span>Sign out</span>
				</button>
			{/if}
		</div>
	{/if}
</header>

<style>
	.page-header {
		position: sticky;
		top: 0;
		z-index: 100;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-md);
		/* Clear of the notch and rounded corners in landscape (viewport-fit=cover; visual-layout-s-14) */
		padding: var(--space-sm)
			max(clamp(var(--space-md), 3vw, var(--space-xl)), env(safe-area-inset-right, 0px))
			var(--space-sm)
			max(clamp(var(--space-md), 3vw, var(--space-xl)), env(safe-area-inset-left, 0px));
		background: rgba(5, 7, 13, 0.55);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-bottom: 1px solid rgba(0, 255, 255, 0.12);
	}

	.header-logo {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-width: 0;
	}

	.logo-dice {
		width: 48px;
		height: 48px;
		filter: drop-shadow(0 0 10px rgba(217, 70, 239, 0.55));
	}

	.brand {
		display: flex;
		flex-direction: column;
		line-height: 1.15;
	}

	.version-text {
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
	}

	/* The maker line: 12px, and light enough to hold 4.5:1 even over the logo's glow */
	.maker {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #b4c4d6;
	}

	.header-nav {
		display: flex;
		align-items: center;
	}

	/* Inline, labelled actions: 900px and up */
	.header-buttons {
		display: none;
		align-items: center;
		gap: var(--space-xs);
	}

	.header-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0 14px;
		background: none;
		border: 1px solid transparent;
		border-radius: 4px;
		color: #e2e9f2;
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		cursor: pointer;
		transition:
			color 120ms ease-out,
			border-color 120ms ease-out,
			background-color 120ms ease-out;
	}

	.header-button svg {
		color: var(--color-neon-cyan);
	}

	.header-button:hover,
	.header-button[aria-expanded='true'] {
		color: #fff;
		border-color: rgba(0, 255, 255, 0.4);
		background: rgba(0, 255, 255, 0.08);
	}

	.hamburger-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		padding: 0;
		background: none;
		border: none;
		border-radius: 50%;
		color: var(--color-brand-yellow);
		cursor: pointer;
		transition: transform var(--transition-fast);
	}

	.hamburger-button svg {
		filter: drop-shadow(0 0 4px var(--color-brand-yellow));
	}

	.hamburger-button:hover {
		color: var(--color-neon-cyan);
		transform: scale(1.1);
	}

	.header-button:focus-visible,
	.hamburger-button:focus-visible,
	.mobile-menu-item:focus-visible {
		outline: 3px solid var(--color-neon-cyan);
		outline-offset: 2px;
	}

	.mobile-menu {
		position: absolute;
		top: calc(100% + 4px);
		right: max(clamp(var(--space-md), 3vw, var(--space-xl)), env(safe-area-inset-right, 0px));
		z-index: 1001;
		min-width: 220px;
		padding: var(--space-xs);
		background: rgba(8, 12, 22, 0.97);
		border: 1px solid rgba(0, 255, 255, 0.5);
		border-radius: 6px;
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.18),
			0 12px 32px rgba(0, 0, 0, 0.6);
	}

	.mobile-menu-item {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		width: 100%;
		min-height: 48px;
		padding: 0 var(--space-md);
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
		transition: background-color 120ms ease-out;
	}

	.mobile-menu-item svg {
		flex-shrink: 0;
		color: var(--color-neon-cyan);
	}

	.mobile-menu-item:hover:not(:disabled) {
		background: rgba(0, 255, 255, 0.1);
		color: #fff;
	}

	.mobile-menu-item:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.signout-menu-item svg {
		color: #ff8fa3;
	}

	@media (min-width: 900px) {
		.header-buttons {
			display: flex;
		}

		.hamburger-button {
			display: none;
		}

		/* Stories, Settings and Help are already in the header row */
		.mobile-menu-item.inline-on-desktop {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.logo-dice {
			width: 40px;
			height: 40px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.header-button,
		.hamburger-button,
		.mobile-menu-item {
			transition: none;
		}

		.hamburger-button:hover {
			transform: none;
		}
	}
</style>
