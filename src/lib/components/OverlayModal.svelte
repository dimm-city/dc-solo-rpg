<script>
	/**
	 * OverlayModal - Full-viewport dialog layer with a fog scrim.
	 *
	 * The layer is moved to <body> so no transformed or clipped ancestor in the game
	 * board can shrink its fixed positioning: the scrim always covers the whole
	 * viewport, HUD included. Children size their own panel (card, journal sheet).
	 * Focus moves into the dialog on open, is trapped while open and returns on close.
	 */
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';

	let {
		children,
		isVisible = true,
		zIndex = 5000, // Above the HUD (1000) and below content modals (9999)
		label = 'Dialog', // Accessible name for the dialog
		tone = 'default' // 'victory' | 'loss' tint the scrim for the ending
	} = $props();

	const FOCUSABLE =
		'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
				if (previous instanceof HTMLElement && document.contains(previous)) {
					previous.focus({ preventScroll: true });
				}
			}
		};
	}

	/**
	 * Cloud fog transition for modal backdrop
	 * Speed: 200ms (mechanical/ethereal aesthetic)
	 * Effect: Fades in/out fog with subtle scale (0.95 to 1.0)
	 */
	function cloudFogTransition(node, { delay = 0, duration = ANIMATION_DURATION.NORMAL }) {
		return {
			delay,
			duration,
			tick: (t) => {
				const eased = cubicOut(t);
				const cloudScale = 0.95 + eased * 0.05;

				node.querySelectorAll('.cloud').forEach((cloud) => {
					cloud.style.transform = `translate(-50%, -50%) scale(${cloudScale})`;
				});

				node.style.opacity = `${eased}`;
			}
		};
	}
</script>

<!-- SVG filters for realistic fog clouds -->
<svg width="0" height="0" aria-hidden="true" style="position: absolute;">
	<defs>
		<!-- Back layer: subtle turbulence with soft edges -->
		<filter id="fog-filter-back" x="-20%" y="-20%" width="140%" height="140%">
			<feTurbulence
				type="fractalNoise"
				baseFrequency="0.006"
				numOctaves="4"
				seed="5"
				result="noise"
			/>
			<feDisplacementMap
				in="SourceGraphic"
				in2="noise"
				scale="160"
				xChannelSelector="R"
				yChannelSelector="G"
			/>
		</filter>
		<!-- Middle layer: moderate turbulence -->
		<filter id="fog-filter-mid" x="-20%" y="-20%" width="140%" height="140%">
			<feTurbulence
				type="fractalNoise"
				baseFrequency="0.009"
				numOctaves="4"
				seed="7"
				result="noise"
			/>
			<feDisplacementMap
				in="SourceGraphic"
				in2="noise"
				scale="120"
				xChannelSelector="G"
				yChannelSelector="B"
			/>
		</filter>
		<!-- Front layer: sharper details, closer to viewer -->
		<filter id="fog-filter-front" x="-20%" y="-20%" width="140%" height="140%">
			<feTurbulence
				type="fractalNoise"
				baseFrequency="0.013"
				numOctaves="3"
				seed="11"
				result="noise"
			/>
			<feDisplacementMap
				in="SourceGraphic"
				in2="noise"
				scale="90"
				xChannelSelector="B"
				yChannelSelector="R"
			/>
		</filter>
	</defs>
</svg>

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
			in:cloudFogTransition={{ duration: ANIMATION_DURATION.NORMAL, delay: 0 }}
			out:cloudFogTransition={{ duration: ANIMATION_DURATION.NORMAL, delay: 0 }}
		>
			<div class="cloud back"></div>
			<div class="cloud mid"></div>
			<div class="cloud front"></div>
		</div>

		<!-- Stage: centres the panel the child renders. Entry/exit is opacity + scale only. -->
		<div
			class="stage"
			in:scale={{
				duration: ANIMATION_DURATION.NORMAL,
				start: 0.95,
				opacity: 0,
				easing: cubicOut
			}}
			out:scale={{
				duration: ANIMATION_DURATION.NORMAL,
				start: 0.95,
				opacity: 0,
				easing: cubicOut
			}}
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
		place-items: center;
		overflow: hidden;
		outline: none;
		/* Never let a gesture on the overlay scroll or rubber-band the board behind it */
		overscroll-behavior: contain;
	}

	/* Scrim: dark base plus fog. Captures every pointer event so the board is inert. */
	.scrim {
		position: absolute;
		inset: 0;
		pointer-events: auto;
		overflow: hidden;
		background: rgba(3, 5, 12, 0.97);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		cursor: default;
	}

	/* The ending tints the scrim instead of drawing its own backdrop */
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

	/* Cloud layers for realistic fog */
	.scrim .cloud {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) scale(1);
		border-radius: 50%;
	}

	.scrim .cloud.back {
		width: 220vw;
		height: 200vh;
		background: rgba(8, 20, 40, 0.3);
		box-shadow:
			0 0 300px 150px rgba(8, 20, 40, 0.5),
			0 0 600px 300px rgba(8, 20, 40, 0.3);
		filter: url(#fog-filter-back);
		opacity: 0.25;
	}

	.scrim .cloud.mid {
		width: 180vw;
		height: 160vh;
		background: rgba(20, 10, 30, 0.35);
		box-shadow:
			0 0 250px 120px rgba(20, 10, 30, 0.6),
			0 0 500px 240px rgba(20, 10, 30, 0.4);
		filter: url(#fog-filter-mid);
		opacity: 0.4;
	}

	.scrim .cloud.front {
		width: 140vw;
		height: 120vh;
		background: rgba(0, 40, 60, 0.4);
		box-shadow:
			0 0 200px 100px rgba(0, 80, 120, 0.7),
			0 0 400px 200px rgba(0, 60, 90, 0.5);
		filter: url(#fog-filter-front);
		opacity: 0.55;
	}

	/* Phones and reduced motion: the three feTurbulence fog layers are expensive to
	   rasterize, so use a static gradient instead */
	@media (max-width: 600px) {
		.scrim {
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
			background-image: radial-gradient(
				ellipse at 50% 40%,
				rgba(0, 40, 60, 0.7),
				rgba(5, 8, 18, 0.95)
			);
		}

		.scrim .cloud {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scrim {
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
			background-image: radial-gradient(
				ellipse at 50% 40%,
				rgba(0, 40, 60, 0.7),
				rgba(5, 8, 18, 0.95)
			);
		}

		.scrim.loss,
		.scrim.victory {
			background-image: none;
		}

		.scrim .cloud {
			display: none;
		}
	}
</style>
