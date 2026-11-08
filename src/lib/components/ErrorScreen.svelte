<script>
	/**
	 * ErrorScreen - the one error layout (404s, failed loads, a game that cannot be found)
	 *
	 * @prop {string} message One sentence that says what went wrong
	 */
	import { resolve } from '$app/paths';

	let { message } = $props();
</script>

<svelte:head>
	<title>Signal lost · Dream Console</title>
</svelte:head>

<section class="error-screen" aria-labelledby="error-title">
	<div class="error-panel">
		<h1 id="error-title" class="error-title">Signal lost</h1>
		<p class="error-message">{message}</p>
		<a class="error-action" href={resolve('/')}>Back to home</a>
	</div>
</section>

<style>
	.error-screen {
		position: fixed;
		inset: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-lg) var(--space-md);
		background:
			repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 0 1px, transparent 1px 4px),
			radial-gradient(circle at 30% 20%, rgba(0, 255, 255, 0.12), transparent 55%),
			radial-gradient(circle at 75% 85%, rgba(217, 70, 239, 0.16), transparent 60%), #05070a;
		text-align: center;
	}

	.error-panel {
		width: 100%;
		max-width: 480px;
	}

	/* Display face, never below 28px; short enough not to wrap on a 360px phone */
	.error-title {
		margin: 0 0 var(--space-md);
		font-size: clamp(1.75rem, 8vw, 3rem);
		letter-spacing: var(--letter-spacing-wide);
		overflow-wrap: normal;
		color: var(--color-brand-yellow);
	}

	.error-message {
		margin: 0 0 var(--space-xl);
		font-size: 1.0625rem;
		line-height: 1.6;
		color: #d5dfeb;
	}

	.error-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		padding: 0 var(--space-xl);
		background: linear-gradient(135deg, #831d98, #6d22c7);
		border: 1px solid var(--color-cyber-magenta);
		border-radius: 4px;
		color: var(--color-brand-yellow);
		font-family: var(--font-body);
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
		transition:
			opacity 120ms ease-out,
			transform 120ms ease-out;
	}

	.error-action:hover {
		opacity: 0.92;
		transform: translateY(-1px);
	}

	.error-action:focus-visible {
		outline: 3px solid var(--color-neon-cyan);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.error-action {
			transition: none;
		}

		.error-action:hover {
			transform: none;
		}
	}
</style>
