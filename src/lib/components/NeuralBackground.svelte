<script>
	/**
	 * NeuralBackground - A static scan grid with a slow drift of glowing motes
	 *
	 * The motes are the screen's one ambient loop: each lives one 8s cycle, fading in and
	 * out. The loop pauses while a dialog or overlay covers the page ([aria-modal="true"]),
	 * while the tab is hidden and under reduced motion (then only the grid shows).
	 * Motes are drawn from two pre-rendered glow sprites (no per-frame shadowBlur) and live
	 * in a plain array: nothing reactive changes per frame.
	 *
	 * The host sets the layer with --neural-z (the game puts it behind every screen).
	 */
	import { onMount } from 'svelte';
	import { createMote, stepMote, moteAlpha, shouldAnimate } from '../utils/ambientMotes.js';

	const COLORS = ['0, 255, 255', '217, 70, 239']; // cyan, magenta
	const SPRITE = 32; // px; a soft disc that stands in for a blurred glow

	/** @type {HTMLCanvasElement | undefined} */
	let canvas;

	/** A radial-gradient disc per colour, drawn once */
	function makeSprites() {
		return COLORS.map((rgb) => {
			const sprite = document.createElement('canvas');
			sprite.width = sprite.height = SPRITE;
			const g = sprite.getContext('2d');
			const r = SPRITE / 2;
			const gradient = g.createRadialGradient(r, r, 0, r, r, r);
			gradient.addColorStop(0, `rgba(${rgb}, 1)`);
			gradient.addColorStop(0.25, `rgba(${rgb}, 0.6)`);
			gradient.addColorStop(1, `rgba(${rgb}, 0)`);
			g.fillStyle = gradient;
			g.fillRect(0, 0, SPRITE, SPRITE);
			return sprite;
		});
	}

	onMount(() => {
		const ctx = canvas?.getContext('2d');
		// No 2D canvas (tests, old browsers): the grid alone is fine
		if (!ctx || typeof ctx.drawImage !== 'function') return;

		let sprites;
		try {
			sprites = makeSprites();
		} catch {
			return;
		}

		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
		const motes = [];
		let width = 0;
		let height = 0;
		let raf = 0;
		let last = 0;
		let running = false;

		function resize() {
			width = canvas.width = canvas.offsetWidth;
			height = canvas.height = canvas.offsetHeight;
			const target = width < 768 ? 16 : 36;
			motes.length = Math.min(motes.length, target);
			while (motes.length < target) motes.push(createMote(width, height));
		}

		function draw() {
			ctx.clearRect(0, 0, width, height);
			for (const mote of motes) {
				const r = mote.size * 4;
				ctx.globalAlpha = moteAlpha(mote);
				ctx.drawImage(sprites[mote.hue], mote.x - r, mote.y - r, r * 2, r * 2);
			}
			ctx.globalAlpha = 1;
		}

		function frame(now) {
			// Cap the step so a stalled frame does not jump the field
			const dt = Math.min(now - last, 50);
			last = now;
			for (let i = 0; i < motes.length; i++) {
				if (!stepMote(motes[i], dt, width, height)) {
					motes[i] = { ...createMote(width, height), age: 0 };
				}
			}
			draw();
			raf = requestAnimationFrame(frame);
		}

		/** Start or stop the loop to match what the viewer can see */
		function sync() {
			const run = shouldAnimate({
				hidden: document.hidden,
				reducedMotion: reduce.matches,
				covered: document.querySelector('[aria-modal="true"]') !== null
			});
			if (run && !running) {
				running = true;
				last = performance.now();
				raf = requestAnimationFrame(frame);
			} else if (!run && running) {
				running = false;
				cancelAnimationFrame(raf);
				if (reduce.matches) ctx.clearRect(0, 0, width, height);
			}
		}

		// Dialogs mount and unmount anywhere in the page: re-check once per batch of changes
		let queued = false;
		const observer = new MutationObserver(() => {
			if (queued) return;
			queued = true;
			queueMicrotask(() => {
				queued = false;
				sync();
			});
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['aria-modal']
		});

		const resizer = new ResizeObserver(() => {
			resize();
			if (!running && !reduce.matches) draw();
		});
		resizer.observe(canvas);
		document.addEventListener('visibilitychange', sync);
		reduce.addEventListener('change', sync);

		resize();
		sync();

		return () => {
			running = false;
			cancelAnimationFrame(raf);
			observer.disconnect();
			resizer.disconnect();
			document.removeEventListener('visibilitychange', sync);
			reduce.removeEventListener('change', sync);
		};
	});
</script>

<div class="neural-background" aria-hidden="true">
	<div class="scan-grid"></div>
	<canvas class="particle-field" bind:this={canvas}></canvas>
</div>

<style>
	.neural-background {
		position: absolute;
		inset: 0;
		pointer-events: none;
		/* The host decides the layer: the game puts it behind every screen (-1) */
		z-index: var(--neural-z, 10);
	}

	.particle-field {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/* A static grid: the motes are the screen's one ambient loop */
	.scan-grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(0deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
		background-size: 40px 40px;
		opacity: 0.4;
	}

	@media (max-width: 768px) {
		.scan-grid {
			background-size: 30px 30px;
		}
	}

	@media (max-width: 450px) {
		.scan-grid {
			background-size: 25px 25px;
		}
	}
</style>
