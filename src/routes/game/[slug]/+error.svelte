<script>
	import { page } from '$app/stores';
	import AugmentedButton from '$lib/components/AugmentedButton.svelte';

	const slug = $page.params.slug;
</script>

<div class="game-error">
	<div class="error-content">
		<h1>Game Not Found</h1>
		<p class="game-name">The game "{slug}" could not be loaded.</p>
		<p class="error-details">{$page.error?.message}</p>

		<div class="actions">
			<AugmentedButton href="/" target="_self" text="Browse Games" variant="primary" />
		</div>
	</div>
</div>

<style>
	.game-error {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		background: var(--game-bg, #1a1a1a);
		color: var(--game-text, #ffffff);
	}

	.error-content {
		text-align: center;
		max-width: 500px;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: var(--dc-primary-color, #00ff88);
	}

	.game-name {
		font-size: 1.25rem;
		margin-bottom: 0.5rem;
	}

	.error-details {
		color: #888;
		font-size: 0.875rem;
		margin-bottom: 2rem;
	}

	.actions {
		margin-top: 2rem;
	}
</style>
