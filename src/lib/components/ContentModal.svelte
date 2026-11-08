<script>
	/**
	 * ContentModal - the base for every dialog (settings, help, about, dice, confirmations)
	 *
	 * Structure: sticky header (title + 44px close) / scrolling body / sticky footer.
	 * The footer is one "Done" button unless the dialog passes its own `footer` snippet
	 * (a confirmation's Cancel and destructive action).
	 * Sizes: 'default' is a full-screen sheet on phones and a centred panel up to 720px wide on
	 * desktop; 'compact' (confirmations) is a small centred panel everywhere.
	 * Motion: 200ms fade plus an 8px rise, cubicOut; 140ms out. Opacity and transform only.
	 * Portal-rendered; focus moves in on open, is trapped, and returns on close.
	 *
	 * Also owns the shared "cm-*" form/section styles so Settings, Help and About
	 * share one type scale, spacing grid and control set (see the :global block below).
	 */
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '../constants/animations.js';
	import { scrollEdges } from './journal/scrollEdges.js';

	let {
		children,
		isOpen = $bindable(false),
		title = '',
		onClose,
		showFooter = true,
		footerButtonText = 'Done',
		/** Replaces the Done button, e.g. a confirmation's two actions */
		footer = undefined,
		/** 'default' | 'compact' */
		size = 'default'
	} = $props();

	const uid = $props.id();
	const titleId = `content-modal-title-${uid}`;

	const IN_MS = ANIMATION_DURATION.NORMAL; // 200
	const OUT_MS = 140;

	let portalTarget = $state();
	let modalElement = $state();
	let dialogElement = $state();
	let previouslyFocused = null;
	/** Whether the body has content past its top or bottom edge (visual-layout-s-15) */
	let bodyEdges = $state({ above: false, below: false });

	const prefersReducedMotion = () =>
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

	const FOCUSABLE =
		'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

	onMount(() => {
		// Create a portal container at the body level
		portalTarget = document.createElement('div');
		portalTarget.className = 'content-modal-portal';
		document.body.appendChild(portalTarget);
	});

	onDestroy(() => {
		// Clean up portal when component is destroyed
		if (portalTarget && portalTarget.parentNode) {
			portalTarget.parentNode.removeChild(portalTarget);
		}
	});

	// Move the modal into the portal, move focus in, and give focus back on close
	$effect(() => {
		if (isOpen && modalElement && portalTarget) {
			portalTarget.appendChild(modalElement);
			if (!previouslyFocused) {
				previouslyFocused = document.activeElement;
				dialogElement?.focus({ preventScroll: true });
			}
		} else if (!isOpen && previouslyFocused) {
			previouslyFocused.focus?.({ preventScroll: true });
			previouslyFocused = null;
		}
		// Don't remove on cleanup - let Svelte transitions handle it
	});

	function handleBackdropClick(event) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(event) {
		if (event.key === 'Escape') {
			event.stopPropagation();
			onClose();
			return;
		}
		if (event.key !== 'Tab' || !dialogElement) return;

		// Keep Tab / Shift+Tab inside the dialog
		const items = [...dialogElement.querySelectorAll(FOCUSABLE)].filter(
			(el) => el.getClientRects().length > 0
		);
		if (items.length === 0) {
			event.preventDefault();
			dialogElement.focus();
			return;
		}
		const first = items[0];
		const last = items[items.length - 1];
		const active = document.activeElement;
		if (event.shiftKey && (active === first || active === dialogElement)) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		}
	}

	const duration = (ms) => (prefersReducedMotion() ? 0 : ms);
</script>

{#if isOpen}
	<!-- Scrim: pointer-only dismissal; keyboard users have Escape and the close button -->
	<div
		bind:this={modalElement}
		class="content-modal-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="presentation"
		in:fade={{ duration: duration(IN_MS) }}
		out:fade={{ duration: duration(OUT_MS) }}
	>
		<div
			class="content-modal-wrapper"
			class:compact={size === 'compact'}
			data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
			in:fly={{ y: 8, duration: duration(IN_MS), easing: cubicOut }}
			out:fade={{ duration: duration(OUT_MS) }}
		>
			<div
				bind:this={dialogElement}
				class="content-modal-container"
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				tabindex="-1"
			>
				<div class="content-header">
					<h2 id={titleId}>{title}</h2>
					<button class="close-button" onclick={onClose} aria-label="Close {title}">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							aria-hidden="true"
						>
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>

				<!-- While content remains below the fold, the journal's cue: a 40px fade and the cyan
				     chevron; a 24px fade at the top once scrolled (visual-layout-s-15) -->
				<div class="content-body-frame">
					<div
						class="content-body-wrapper"
						class:more-below={bodyEdges.below}
						class:more-above={bodyEdges.above}
						use:scrollEdges={(edges) => {
							if (edges.above !== bodyEdges.above || edges.below !== bodyEdges.below)
								bodyEdges = edges;
						}}
						data-testid="content-body"
					>
						<div class="content-body">
							{@render children()}
						</div>
					</div>
					<span
						class="more-cue"
						class:visible={bodyEdges.below}
						aria-hidden="true"
						data-testid="content-more-cue"
					>
						<svg viewBox="0 0 24 24" width="16" height="16">
							<path d="m6 9 6 6 6-6" />
						</svg>
					</span>
				</div>

				{#if footer}
					<div class="content-footer">
						{@render footer()}
					</div>
				{:else if showFooter}
					<div class="content-footer">
						<button class="done-button" onclick={onClose}>
							<span>{footerButtonText}</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* Portal container: full viewport, lets the backdrop take pointer events */
	:global(.content-modal-portal) {
		position: fixed;
		inset: 0;
		z-index: 9999;
		pointer-events: none;
	}

	/* Full-viewport scrim */
	.content-modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(3, 7, 14, 0.88);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		pointer-events: all;
	}

	/* Augmented-UI frame: theme gradient border, clipped corners */
	.content-modal-wrapper {
		width: min(720px, 92vw);
		max-height: 88dvh;
		display: flex;

		--modal-bg: #0b1622;
		--modal-bg-raised: #10202f;
		--modal-divider: rgba(255, 255, 255, 0.14);

		--aug-border-all: 2px;
		--aug-border-bg: var(--frame-border, linear-gradient(135deg, #00ffff, #d946ef));
		--aug-tl: 16px;
		--aug-tr: 16px;
		--aug-br: 16px;
		--aug-bl: 16px;
	}

	.content-modal-container {
		position: relative;
		width: 100%;
		background: var(--modal-bg);
		color: #fff;
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		outline: none;
		font-family: var(--font-body, 'Inter', sans-serif);
	}

	/* Sticky header */
	.content-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-md, 1rem);
		padding: var(--space-md, 1rem) var(--space-lg, 1.5rem);
		border-bottom: 1px solid var(--modal-divider);
		background: var(--modal-bg-raised);
		flex-shrink: 0;
	}

	/* One title style for every dialog, at every width: Inter 600 caps, 18px. The display face
	   stays out of dialogs (it is for 28px and up, MN-07), which also frees landscape room. */
	.content-header h2 {
		margin: 0;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1.125rem;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-shadow: none;
		text-wrap: balance;
		color: #fff;
	}

	.content-modal-wrapper.compact {
		width: min(480px, calc(100vw - 32px));
	}

	.close-button {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		margin-right: calc(var(--space-sm, 0.5rem) * -1);
		padding: 0;
		background: none;
		border: 1px solid transparent;
		border-radius: 4px;
		color: #fff;
		cursor: pointer;
		opacity: 0.8;
		transition:
			opacity 150ms ease-out,
			border-color 150ms ease-out;
	}

	.close-button:hover {
		opacity: 1;
		border-color: rgba(255, 255, 255, 0.4);
	}

	.close-button:focus-visible,
	.done-button:focus-visible {
		outline: 3px solid var(--color-neon-cyan, #00ffff);
		outline-offset: 2px;
		opacity: 1;
	}

	/* Scrolling body, in a frame that holds its "more below" chevron */
	.content-body-frame {
		position: relative;
		flex: 1;
		min-height: 0; /* Important for flex scrolling */
		display: flex;
		flex-direction: column;
	}

	.content-body-wrapper {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
		min-height: 0;
	}

	/* Content past an edge fades out there, as the journal's lists do: 40px at the bottom with
	   the chevron, 24px at the top once the body is scrolled down (visual-layout-s-15) */
	.content-body-wrapper.more-below {
		-webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 40px), transparent 100%);
		mask-image: linear-gradient(to bottom, #000 calc(100% - 40px), transparent 100%);
	}

	.content-body-wrapper.more-above {
		-webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 24px);
		mask-image: linear-gradient(to bottom, transparent 0, #000 24px);
	}

	.content-body-wrapper.more-above.more-below {
		-webkit-mask-image: linear-gradient(
			to bottom,
			transparent 0,
			#000 24px,
			#000 calc(100% - 40px),
			transparent 100%
		);
		mask-image: linear-gradient(
			to bottom,
			transparent 0,
			#000 24px,
			#000 calc(100% - 40px),
			transparent 100%
		);
	}

	/* The journal's "more below" chevron, at the body's bottom-right corner; opacity only */
	.more-cue {
		position: absolute;
		right: var(--space-sm, 0.5rem);
		bottom: 4px;
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		color: var(--color-neon-cyan, #0ff);
		opacity: 0;
		transition: opacity var(--dur-enter, 200ms) ease-out;
		pointer-events: none;
	}

	.more-cue.visible {
		opacity: 1;
	}

	.more-cue svg {
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.content-body {
		padding: var(--space-lg, 1.5rem) var(--space-xl, 2rem) var(--space-xl, 2rem);
		font-size: 1rem; /* 16px body */
		line-height: 1.6;
	}

	/* Sticky footer */
	.content-footer {
		padding: var(--space-md, 1rem) var(--space-lg, 1.5rem);
		border-top: 1px solid var(--modal-divider);
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-sm, 0.5rem);
		background: var(--modal-bg-raised);
		flex-shrink: 0;
	}

	.done-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm, 0.5rem);
		min-width: 160px;
		min-height: 48px;
		padding: var(--space-sm, 0.5rem) var(--space-lg, 1.5rem);
		/* Themed: deep magenta to violet with yellow text (5.4:1 contrast) */
		background: linear-gradient(135deg, #831d98, #6d22c7);
		color: var(--color-brand-yellow, #ffd700);
		border: 1px solid var(--color-cyber-magenta, #d946ef);
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: var(--letter-spacing-wider, 0.1em);
		text-transform: uppercase;
		cursor: pointer;
		transition:
			opacity 150ms ease-out,
			transform 150ms ease-out;
		font-family: var(--font-body, 'Inter', sans-serif);
	}

	.done-button:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.done-button:active {
		transform: translateY(0);
	}

	/* Footer actions a dialog passes in (confirmations), Inter 600 caps, 48px tall.
	   The safe action (Cancel, Keep it) is quiet; the confirming action carries the weight:
	   outlined red when it destroys something, the Done button's fill otherwise. */
	:global(.cm-action) {
		min-width: 140px;
		min-height: 48px;
		padding: var(--space-sm, 0.5rem) var(--space-lg, 1.5rem);
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		color: rgba(255, 255, 255, 0.78);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		cursor: pointer;
		transition:
			background-color 120ms ease-out,
			border-color 120ms ease-out,
			color 120ms ease-out;
	}

	:global(.cm-action:hover) {
		color: #fff;
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.45);
	}

	:global(.cm-action.danger) {
		color: #ff8fa3;
		font-weight: 600;
		border: 2px solid var(--color-danger, #ff4d6d);
	}

	:global(.cm-action.danger:hover) {
		color: #ffb3c1;
		background: rgba(255, 77, 109, 0.14);
		border-color: #ff8fa3;
	}

	:global(.cm-action.primary) {
		color: var(--color-brand-yellow, #ffd700);
		font-weight: 600;
		background: linear-gradient(135deg, #831d98, #6d22c7);
		border: 1px solid var(--color-cyber-magenta, #d946ef);
	}

	:global(.cm-action.primary:hover) {
		color: var(--color-brand-yellow, #ffd700);
		background: linear-gradient(135deg, #9325ab, #7a2bd6);
		border-color: var(--color-cyber-magenta, #d946ef);
	}

	:global(.cm-action:focus-visible) {
		outline: 3px solid var(--color-neon-cyan, #00ffff);
		outline-offset: 2px;
	}

	/* Phones: full-screen sheet, no clipped corners, safe-area aware */
	@media (max-width: 640px) {
		.content-modal-wrapper:not(.compact) {
			width: 100%;
			height: 100dvh;
			max-height: none;
			--aug-border-all: 0px;
			--aug-tl: 0px;
			--aug-tr: 0px;
			--aug-br: 0px;
			--aug-bl: 0px;
		}

		.content-header {
			padding: calc(var(--space-sm, 0.5rem) + env(safe-area-inset-top, 0px))
				calc(var(--space-md, 1rem) + env(safe-area-inset-right, 0px)) var(--space-sm, 0.5rem)
				calc(var(--space-lg, 1.25rem) + env(safe-area-inset-left, 0px));
			min-height: 64px;
		}

		.content-body {
			padding: var(--space-lg, 1.25rem);
			padding-left: calc(var(--space-lg, 1.25rem) + env(safe-area-inset-left, 0px));
			padding-right: calc(var(--space-lg, 1.25rem) + env(safe-area-inset-right, 0px));
		}

		.content-footer {
			padding: var(--space-md, 1rem)
				calc(var(--space-lg, 1.25rem) + env(safe-area-inset-right, 0px))
				calc(var(--space-md, 1rem) + env(safe-area-inset-bottom, 0px))
				calc(var(--space-lg, 1.25rem) + env(safe-area-inset-left, 0px));
		}

		.done-button {
			width: 100%;
		}

		/* Side by side when the labels fit on one line; otherwise each takes a full row */
		:global(.cm-action) {
			flex: 1 1 auto;
			min-width: 8rem;
			padding-inline: var(--space-md, 1rem);
			white-space: nowrap;
		}

		/* A compact panel keeps its frame and margins on phones */
		.compact .content-header {
			min-height: 0;
			padding: var(--space-md, 1rem) var(--space-sm, 0.5rem) var(--space-sm, 0.5rem)
				var(--space-lg, 1.25rem);
		}

		.compact .content-footer {
			padding: var(--space-md, 1rem) var(--space-lg, 1.25rem);
		}
	}

	/* Landscape phones and short windows: the dialog takes the height, with an 8px margin, and its
	   header and footer slim down (both stay pinned; only the body scrolls) */
	@media (max-height: 500px) {
		.content-modal-wrapper,
		.content-modal-wrapper:not(.compact) {
			max-height: calc(100dvh - 16px);
		}

		.content-header,
		.compact .content-header,
		.content-footer,
		.compact .content-footer {
			min-height: 0;
			padding: var(--space-sm, 0.5rem) var(--space-lg, 1.5rem);
		}

		.content-body {
			padding-top: var(--space-md, 1rem);
			padding-bottom: var(--space-md, 1rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.close-button,
		.done-button,
		.more-cue,
		:global(.cm-action) {
			transition: none;
		}

		.done-button:hover {
			transform: none;
		}
	}

	/* ------------------------------------------------------------------
	   Shared "cm-*" building blocks for modal content (Settings, Help, About).
	   Type scale: section title 16px / label 16px / body 16px / helper 14px; Inter 400 and 600.
	   Spacing: 8px grid.
	   ------------------------------------------------------------------ */
	:global(.cm-section + .cm-section) {
		margin-top: 24px;
		padding-top: 32px;
		border-top: 1px solid rgba(255, 255, 255, 0.14);
	}

	:global(.cm-section-title) {
		/* Overrides the global h3 / label / input rules in styles.css */
		margin: 0;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.25;
		letter-spacing: 0;
		text-transform: none;
		color: var(--color-neon-cyan, #00ffff);
	}

	:global(.cm-section-desc) {
		margin: 8px 0 0;
		max-width: var(--measure, 30em);
		font-size: 0.875rem;
		line-height: 1.5;
		color: #b8c5d6;
	}

	:global(.cm-rows) {
		margin-top: 8px;
	}

	/* A setting: label + helper left, control right (stacked on phones) */
	:global(.cm-row) {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(200px, 280px);
		align-items: center;
		gap: 8px 24px;
		padding: 16px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	:global(.cm-row:last-child) {
		border-bottom: 0;
	}

	:global(.cm-row-toggle) {
		grid-template-columns: minmax(0, 1fr) auto;
	}

	:global(.cm-label) {
		display: block;
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: 0;
		text-transform: none;
		color: #fff;
	}

	/* Helper and section text keep the reading measure, about 65 characters a line at any size
	   (visual-layout-s-18; 65ch and no cap ran 84-85) */
	:global(.cm-help) {
		margin: 4px 0 0;
		max-width: var(--measure, 30em);
		font-size: 0.875rem;
		font-weight: 400;
		line-height: 1.5;
		color: #aebbcc; /* 8.9:1 on the panel */
	}

	:global(.cm-value) {
		display: block;
		margin-bottom: 4px;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
		font-size: 1rem;
		color: var(--color-brand-yellow, #ffd700);
		text-align: right;
	}

	/* Selects and text inputs: 44px tall, 16px text (no iOS zoom) */
	:global(.cm-control.cm-control) {
		box-sizing: border-box;
		width: 100%;
		min-height: 44px;
		padding: 10px 14px;
		background-color: #07101a;
		border: 1px solid #6a87a3;
		margin: 0;
		border-radius: 4px;
		box-shadow: none;
		color: #fff;
		font-family: inherit;
		font-size: 1rem;
		line-height: 1.4;
	}

	:global(.cm-control.cm-control:hover),
	:global(.cm-switch:hover) {
		border-color: #9ab4cc;
		box-shadow: none;
	}

	:global(.cm-control.cm-control::placeholder) {
		color: #8296ab;
	}

	:global(select.cm-control.cm-control) {
		appearance: none;
		padding-right: 40px;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 14px center;
		background-size: 14px;
		cursor: pointer;
	}

	:global(select.cm-control option) {
		background: #07101a;
		color: #fff;
	}

	:global(.cm-control.cm-control:focus-visible),
	:global(.cm-range:focus-visible),
	:global(.cm-switch:focus-visible),
	:global(.cm-btn:focus-visible),
	:global(.cm-advanced summary:focus-visible),
	:global(.cm-chip:focus-visible) {
		outline: 2px solid var(--color-neon-cyan, #00ffff);
		outline-offset: 2px;
	}

	:global(.cm-control.cm-control:focus-visible) {
		border-color: var(--color-neon-cyan, #00ffff);
		box-shadow: none;
	}

	/* Range slider */
	:global(.cm-range) {
		display: block;
		width: 100%;
		height: 44px;
		margin: 0;
		accent-color: var(--color-neon-cyan, #00ffff);
		cursor: pointer;
	}

	:global(.cm-range-ends) {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
		color: #aebbcc;
	}

	/* Toggle switch: 44px-tall hit area, 52x30 track drawn with pseudo-elements */
	:global(.cm-switch) {
		appearance: none;
		position: relative;
		width: 56px;
		height: 44px;
		margin: 0;
		background: none;
		border: 0;
		border-radius: 8px;
		box-shadow: none;
		cursor: pointer;
	}

	:global(.cm-switch::before) {
		content: '';
		position: absolute;
		left: 2px;
		top: 7px;
		width: 52px;
		height: 30px;
		box-sizing: border-box;
		border: 2px solid #6a87a3;
		border-radius: 15px;
		background: #07101a;
		transition: background-color 150ms ease-out;
	}

	:global(.cm-switch::after) {
		content: '';
		position: absolute;
		left: 8px;
		top: 13px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #c7d3e0;
		transition:
			transform 150ms ease-out,
			background-color 150ms ease-out;
	}

	:global(.cm-switch:checked::before) {
		background: #0e7490;
		border-color: var(--color-neon-cyan, #00ffff);
	}

	:global(.cm-switch:checked::after) {
		transform: translateX(22px);
		background: #fff;
	}

	/* Buttons */
	:global(.cm-btn-group) {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 16px;
	}

	:global(.cm-btn) {
		flex: 1 1 160px;
		min-height: 44px;
		padding: 8px 16px;
		background: transparent;
		border: 1px solid var(--color-neon-cyan, #00ffff);
		border-radius: 4px;
		color: #fff;
		font-family: inherit;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 150ms ease-out,
			transform 150ms ease-out;
	}

	:global(.cm-btn:hover) {
		background: rgba(0, 255, 255, 0.14);
	}

	:global(.cm-btn:active) {
		transform: translateY(1px);
	}

	/* Collapsed-by-default advanced options */
	:global(.cm-advanced) {
		margin-top: 8px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.03);
	}

	:global(.cm-advanced summary) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		min-height: 48px;
		padding: 8px 16px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		list-style: none;
	}

	:global(.cm-advanced summary::-webkit-details-marker) {
		display: none;
	}

	:global(.cm-advanced summary::after) {
		content: '';
		flex-shrink: 0;
		width: 10px;
		height: 10px;
		border-right: 2px solid #fff;
		border-bottom: 2px solid #fff;
		transform: rotate(45deg);
		transition: transform 150ms ease-out;
	}

	:global(.cm-advanced[open] summary::after) {
		transform: rotate(-135deg);
	}

	:global(.cm-advanced-status) {
		margin-left: auto;
		font-size: 0.875rem;
		font-weight: 400;
		white-space: nowrap;
		color: #aebbcc;
	}

	:global(.cm-advanced > .cm-rows) {
		margin: 0;
		padding: 0 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.12);
	}

	/* Messages */
	:global(.cm-error) {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		margin-top: 8px;
		padding: 12px 16px;
		background: rgba(255, 77, 109, 0.12);
		border: 1px solid var(--color-danger, #ff4d6d);
		border-radius: 4px;
		color: #ff8fa3;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	:global(.cm-note) {
		margin: 16px 0 0;
		padding: 12px 16px;
		border-left: 3px solid var(--color-neon-cyan, #00ffff);
		background: rgba(0, 255, 255, 0.06);
		font-size: 0.875rem;
		line-height: 1.5;
		color: #d5dfeb;
	}

	/* Phones: stack label above control */
	@media (max-width: 640px) {
		:global(.cm-row) {
			grid-template-columns: minmax(0, 1fr);
		}

		:global(.cm-row-toggle) {
			grid-template-columns: minmax(0, 1fr) auto;
		}

		:global(.cm-section + .cm-section) {
			margin-top: 16px;
			padding-top: 24px;
		}

		:global(.cm-value) {
			text-align: left;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.cm-switch::before),
		:global(.cm-switch::after),
		:global(.cm-btn),
		:global(.cm-advanced summary::after) {
			transition: none;
		}
	}
</style>
