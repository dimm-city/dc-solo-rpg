<script>
	/**
	 * StaticPage - shell for the reading pages (/about, /how-to): a back link to the console,
	 * a screen title and one 720px reading column.
	 *
	 * @prop {string} title Screen title (also the tab title: "<title> · Dream Console")
	 * @prop {import('svelte').Snippet} children Page body
	 */
	import { resolve } from '$app/paths';
	import NeuralBackground from './NeuralBackground.svelte';

	let { title, children } = $props();
</script>

<svelte:head>
	<title>{title} · Dream Console</title>
</svelte:head>

<NeuralBackground />

<div class="static-page">
	<nav class="static-nav" aria-label="Page">
		<a class="back-link" href={resolve('/')}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="m15 18-6-6 6-6" />
			</svg>
			Back to the console
		</a>
	</nav>

	<article class="static-column">
		<h1 class="static-title">{title}</h1>
		{@render children()}
	</article>
</div>

<style>
	.static-page {
		position: relative;
		z-index: 1;
		min-height: 100%;
		padding: var(--space-lg) var(--space-md) var(--space-3xl);
	}

	.static-nav,
	.static-column {
		max-width: var(--content-max, 720px);
		margin: 0 auto;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		min-height: 44px;
		padding: 0 var(--space-sm) 0 0;
		color: var(--color-neon-cyan);
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
		transition: color 120ms ease-out;
	}

	.back-link:hover {
		color: #fff;
	}

	.back-link:focus-visible {
		outline: 3px solid var(--color-neon-cyan);
		outline-offset: 2px;
	}

	.static-column {
		margin-top: var(--space-lg);
		padding: clamp(var(--space-lg), 4vw, var(--space-2xl));
		background: rgba(11, 22, 34, 0.86);
		border: 1px solid rgba(0, 255, 255, 0.22);
		border-radius: 4px;
		font-size: 1.0625rem;
		line-height: 1.6;
	}

	/* Screen title: the display face, at 28px and up */
	.static-title {
		margin: 0 0 var(--space-lg);
		font-size: clamp(1.75rem, 6vw, 2.75rem);
		letter-spacing: var(--letter-spacing-wide);
		overflow-wrap: normal;
	}

	@media (prefers-reduced-motion: reduce) {
		.back-link {
			transition: none;
		}
	}
</style>
