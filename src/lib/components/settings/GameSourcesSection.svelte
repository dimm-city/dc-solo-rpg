<script>
	/**
	 * GameSourcesSection - the public GitHub repositories games are loaded from: add one by
	 * owner/repo (a folder and @branch are optional), see what each holds and when it was last
	 * checked, refresh them all, or remove one. Uses the shared cm-* styles from ContentModal.
	 */
	import {
		getGameSources,
		addGameSource,
		removeGameSource,
		refreshGameSources,
		isRefreshingSources
	} from '../../stores/gameSources.svelte.js';
	import { sourceLabel, sourceStatusLine } from '../../services/githubGames.js';

	let text = $state('');
	let error = $state('');
	const sources = $derived(getGameSources());
	const refreshing = $derived(isRefreshingSources());

	// "checked 5 min ago" keeps up while the modal stays open
	let now = $state(Date.now());
	$effect(() => {
		const timer = setInterval(() => (now = Date.now()), 60 * 1000);
		return () => clearInterval(timer);
	});

	function add(event) {
		event.preventDefault();
		const result = addGameSource(text);
		if (!result.ok) {
			error = result.error;
			return;
		}
		text = '';
		error = '';
	}
</script>

<section class="cm-section" aria-labelledby="game-sources-heading">
	<h3 class="cm-section-title" id="game-sources-heading">Game sources</h3>
	<p class="cm-section-desc">
		Public GitHub repositories to load games from. Every .game.md file in the folder you name shows
		up on the home screen, and is checked for changes about once an hour.
	</p>

	<form class="add-source" onsubmit={add} novalidate>
		<label class="cm-label" for="game-source">Add a repository</label>
		<p class="cm-help" id="game-source-help">
			owner/repo, or a folder in it: owner/repo/games. Add @branch for a branch other than the
			default. A github.com link works too.
		</p>
		<div class="add-row">
			<input
				id="game-source"
				class="cm-control"
				type="text"
				autocomplete="off"
				autocapitalize="off"
				spellcheck="false"
				placeholder="owner/repo"
				aria-describedby="game-source-help"
				aria-invalid={error ? 'true' : undefined}
				bind:value={text}
				oninput={() => (error = '')}
			/>
			<button type="submit" class="cm-btn add-button">Add repository</button>
		</div>
		{#if error}
			<p class="cm-error" role="alert">{error}</p>
		{/if}
	</form>

	{#if sources.length}
		<ul class="source-list">
			{#each sources as source (source.id)}
				<li class="source-row" data-testid="game-source-{source.id}">
					<div class="source-text">
						<span class="source-name">
							{sourceLabel(source)}{#if source.branch}<span class="source-branch">
									@{source.branch}</span
								>{/if}
						</span>
						<p
							class="source-status"
							class:failed={source.error && !source.refreshing}
							role="status"
						>
							{sourceStatusLine(source, now)}
						</p>
					</div>
					<button
						type="button"
						class="remove-button"
						onclick={() => removeGameSource(source.id)}
						aria-label="Remove {sourceLabel(source)}"
					>
						Remove
					</button>
				</li>
			{/each}
		</ul>
		<div class="source-actions">
			<button
				type="button"
				class="cm-btn refresh-button"
				onclick={() => refreshGameSources({ force: true })}
				disabled={refreshing}
			>
				{refreshing ? 'Checking…' : 'Refresh now'}
			</button>
			<p class="cm-help">
				Removing a repository takes its games off the home screen; your saved games stay.
			</p>
		</div>
	{:else}
		<p class="cm-help no-sources">
			No repositories yet. The games you add here sit beside the built-in and uploaded ones, and
			stay playable offline.
		</p>
	{/if}
</section>

<style>
	.add-source {
		margin-top: 16px;
	}

	.add-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
	}

	.add-row input {
		flex: 1 1 220px;
	}

	.add-button {
		flex: 0 0 auto;
		min-width: 140px;
	}

	.source-list {
		margin: 16px 0 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.source-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px 16px;
		padding: 12px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.source-text {
		min-width: 0;
		flex: 1 1 auto;
	}

	.source-name {
		display: block;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 1rem;
		line-height: 1.4;
		color: #fff;
		overflow-wrap: anywhere;
	}

	.source-branch {
		color: #aebbcc;
	}

	.source-status {
		margin: 4px 0 0;
		font-size: 0.875rem;
		line-height: 1.5;
		color: #aebbcc;
	}

	.source-status.failed {
		color: #ff8fa3;
	}

	.remove-button {
		flex: 0 0 auto;
		min-height: 44px;
		padding: 0 8px;
		background: none;
		border: none;
		font-family: inherit;
		font-size: 0.875rem;
		color: #ff8fa3;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}

	.remove-button:hover {
		color: var(--color-danger, #ff4d6d);
	}

	.remove-button:focus-visible {
		outline: 2px solid var(--color-neon-cyan, #00ffff);
		outline-offset: 2px;
	}

	.source-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
		margin-top: 16px;
	}

	.refresh-button {
		flex: 0 0 auto;
		min-width: 140px;
	}

	.refresh-button:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	.source-actions .cm-help {
		flex: 1 1 240px;
		margin: 0;
	}

	.no-sources {
		margin-top: 16px;
	}
</style>
