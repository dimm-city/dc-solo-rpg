<script>
	/**
	 * OverlayModal - Full-viewport dialog layer over a dark scrim (card, journal, ending).
	 *
	 * The layer is moved to <body> so no transformed or clipped ancestor in the game
	 * board can shrink its fixed positioning: the scrim always covers the whole
	 * viewport, HUD included. Children size their own panel (card, journal sheet).
	 * Focus moves into the dialog on open, is trapped while open and returns on close.
	 *
	 * Motion: the dialog entrance used everywhere (200ms fade plus an 8px rise, cubicOut; 140ms
	 * out). The transitions are global, so they also play when the game screen mounts or drops the
	 * overlay. The scrim is a static gradient: only its opacity animates. An ending tone
	 * ('victory' | 'loss') shows at full opacity at once, so the cut from one ending layer to the
	 * next never passes through black.
	 */
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';

	let {
		children,
		isVisible = true,
		zIndex = 5000, // Above the HUD (1000) and below content modals (9999)
		label = 'Dialog', // Accessible name for the dialog
		tone = 'default' // 'victory' | 'loss' tint the scrim for the ending
	} = $props();

	const IN_MS = ANIMATION_DURATION.NORMAL; // 200
	const OUT_MS = 140;
	const RISE_PX = 8;

	const FOCUSABLE =
		'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

	const reducedMotion = () =>
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

	const isEnding = $derived(tone === 'victory' || tone === 'loss');
	// Another overlay is still fading out underneath (e.g. card to journal): its scrim already
	// covers the board, so this one need not fade in over a glimpse of the table
	const startsCovered =
		typeof document !== 'undefined' && !!document.querySelector('.overlay-layer');

	/**
	 * Svelte action: move the node to <body> so fixed positioning is viewport-relative.
	 * When a parent block is torn down Svelte only removes the nodes at the original
	 * location, so the moved node must remove itself.
	 */
	function portal(node) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	/** Svelte action: move focus in, trap Tab, restore focus on close */
	function focusTrap(node) {
		const previous = document.activeElement;
		const tabbables = () => [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent);

		// Prefer an explicit autofocus target, otherwise the dialog itself
		const initial = node.querySelector('[data-autofocus]');
		(initial ?? node).focus({ preventScroll: true });

		function onKeydown(event) {
			if (event.key !== 'Tab') return;
			const items = tabbables();
			if (items.length === 0) {
				event.preventDefault();
				node.focus();
				return;
			}
			const first = items[0];
			const last = items[items.length - 1];
			const active = document.activeElement;
			if (event.shiftKey && (active === first || active === node)) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && active === last) {
				event.preventDefault();
				first.focus();
			} else if (!node.contains(active)) {
				event.preventDefault();
				first.focus();
			}
		}
		node.addEventListener('keydown', onKeydown);

		return {
			destroy() {
				node.removeEventListener('keydown', onKeydown);
				// Give focus back only if it is still ours: the next dialog may already hold it
				const active = document.activeElement;
				const ours = !active || active === document.body || node.contains(active);
				if (ours && previous instanceof HTMLElement && document.contains(previous)) {
					previous.focus({ preventScroll: true });
				}
			}
		};
	}

	const scrimIn = () => ({ duration: isEnding || startsCovered || reducedMotion() ? 0 : IN_MS });
	const scrimOut = () => ({ duration: reducedMotion() ? 0 : OUT_MS });
	const stageIn = () => ({
		y: RISE_PX,
		duration: reducedMotion() ? 0 : IN_MS,
		easing: cubicOut
	});
	const stageOut = () => ({ start: 0.98, duration: reducedMotion() ? 0 : OUT_MS });

	/**
	 * A layer on its way out must not take input meant for the screen under it, however slowly
	 * the device paints the fade. The component is paused during an outro, so set it on the DOM.
	 */
	function release(event) {
		const layer = event.currentTarget.closest('.overlay-layer');
		if (!layer) return;
		layer.inert = true;
		layer.style.pointerEvents = 'none';
		layer.querySelector('.scrim')?.style.setProperty('pointer-events', 'none');
	}
</script>

{#if isVisible}
	<!-- One root element so the whole layer can live in <body> -->
	<div
		class="overlay-layer"
		style="z-index: {zIndex};"
		use:portal
		role="dialog"
		aria-modal="true"
		aria-label={label}
		tabindex="-1"
		use:focusTrap
	>
		<!-- Scrim: opaque enough that nothing from the board or HUD shows through -->
		<div
			class="scrim"
			class:victory={tone === 'victory'}
			class:loss={tone === 'loss'}
			aria-hidden="true"
			in:fade|global={scrimIn()}
			out:fade|global={scrimOut()}
		></div>

		<!-- Stage: centres the panel the child renders. Entry/exit is opacity + transform only. -->
		<div
			class="stage"
			in:fly|global={stageIn()}
			out:scale|global={stageOut()}
			onoutrostart={release}
		>
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.overlay-layer {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100dvh;
		display: grid;
		/* One viewport-sized track, so the stage (and the panel in it) can never outgrow the screen */
		grid-template: minmax(0, 1fr) / minmax(0, 1fr);
		place-items: center;
		overflow: hidden;
		outline: none;
		/* Never let a gesture on the overlay scroll or rubber-band the board behind it */
		overscroll-behavior: contain;
	}

	/* Scrim: a static gradient (no filters, no per-frame work). Captures every pointer
	   event so the board is inert. */
	.scrim {
		position: absolute;
		inset: 0;
		pointer-events: auto;
		cursor: default;
		background-color: rgb(4, 7, 15);
		background-image:
			radial-gradient(ellipse 70% 55% at 50% 42%, rgba(0, 60, 90, 0.42), transparent 70%),
			radial-gradient(ellipse 60% 50% at 18% 88%, rgba(70, 24, 96, 0.3), transparent 70%),
			radial-gradient(ellipse 55% 45% at 85% 12%, rgba(0, 70, 110, 0.22), transparent 70%);
	}

	/* The ending tints the scrim instead of drawing its own backdrop (same as GameOver) */
	.scrim.loss {
		background-color: #05070a;
		background-image:
			radial-gradient(circle at 50% 50%, rgba(255, 0, 255, 0.08), transparent 75%),
			radial-gradient(circle at 25% 75%, rgba(255, 42, 109, 0.1), transparent 70%);
	}

	.scrim.victory {
		background-color: #05070a;
		background-image:
			radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.12), transparent 75%),
			radial-gradient(circle at 25% 75%, rgba(0, 255, 100, 0.1), transparent 70%);
	}

	.stage {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		/* One track exactly the size of the stage, so a panel's percentage height
		   resolves against the viewport instead of growing with its content */
		grid-template: minmax(0, 1fr) / minmax(0, 1fr);
		/* Panels stay clear of notches and home indicators */
		padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px)
			env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
		box-sizing: border-box;
		/* The stage itself is empty space; only the panel takes pointer events */
		pointer-events: none;
	}

	.stage > :global(*) {
		pointer-events: auto;
	}
</style>
