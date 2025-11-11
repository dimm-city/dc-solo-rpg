<script>
	import { page } from '$app/stores';
	import AugmentedButton from '$lib/components/AugmentedButton.svelte';
</script>

<div class="error-container">
	<h1>Oops! Something went wrong</h1>
	<p class="error-message">{$page.error?.message || 'An unexpected error occurred'}</p>
	<p class="error-code">Error code: {$page.status || 500}</p>
	<AugmentedButton href="/" text="Return Home" />
</div>

<style>
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		text-align: center;
		background: var(--dc-bg-color, #0a0a0a);
		color: var(--dc-text-color, #ffffff);
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: var(--dc-primary-color, #00ff88);
	}

	.error-message {
		color: var(--color-error, #ef4444);
		margin: 1rem 0;
		font-size: 1.125rem;
	}

	.error-code {
		color: #888;
		font-size: 0.875rem;
		margin-bottom: 2rem;
	}
</style>
