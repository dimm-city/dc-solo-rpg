<script>
	/**
	 * HelpModal - Game guide and mechanics help
	 * Uses ContentModal as base. Rules match docs/d20-mechanics-guide.md and
	 * src/lib/services/d20Mechanics.js (every roll is a d20).
	 */
	import ContentModal from './ContentModal.svelte';

	let { isOpen = false, onClose } = $props();

	const stabilityTable = [
		{ roll: '1', result: 'Lose 3 Stability and become Surreal' },
		{ roll: '2 to 5', result: 'Lose 2 Stability' },
		{ roll: '6 to 10', result: 'Lose 1 Stability' },
		{ roll: '11 to 19', result: 'No loss' },
		{ roll: '20', result: 'Gain 1 Stability (max 20) and become Lucid' }
	];

	const drawTable = [
		{ roll: '1', cards: '1 card' },
		{ roll: '2 to 5', cards: '2 cards' },
		{ roll: '6 to 10', cards: '3 cards' },
		{ roll: '11 to 15', cards: '4 cards' },
		{ roll: '16 to 19', cards: '5 cards' },
		{ roll: '20', cards: '6 cards' }
	];

	const salvationTable = [
		{ aces: '1 Ace', target: 'Roll 17 or higher' },
		{ aces: '2 Aces', target: 'Roll 14 or higher' },
		{ aces: '3 Aces', target: 'Roll 11 or higher' },
		{ aces: '4 Aces', target: 'Automatic success' }
	];

	const contents = [
		{ id: 'help-goal', label: 'The goal' },
		{ id: 'help-rounds', label: 'Rounds and cards' },
		{ id: 'help-stability', label: 'Stability checks' },
		{ id: 'help-states', label: 'Lucid and Surreal' },
		{ id: 'help-salvation', label: 'Salvation' },
		{ id: 'help-end', label: 'How it ends' }
	];

	function jumpTo(id) {
		const target = document.getElementById(id);
		if (!target) return;
		const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		target.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
		target.focus({ preventScroll: true });
	}
</script>

<ContentModal {isOpen} title="Game Guide" {onClose} footerButtonText="Got it">
	<div class="help-content">
		<p class="help-intro">
			Draw cards, write what happens, and try to escape before your Stability runs out. Every roll
			in the game is a d20.
		</p>

		<nav class="help-nav" aria-label="Guide contents">
			<ul>
				{#each contents as item (item.id)}
					<li>
						<button type="button" class="cm-chip" onclick={() => jumpTo(item.id)}>
							{item.label}
						</button>
					</li>
				{/each}
			</ul>
		</nav>

		<section class="help-section">
			<h3 id="help-goal" class="cm-section-title" tabindex="-1">The goal</h3>
			<p>
				You start with <strong>20 Stability</strong> (your grip on yourself) and
				<strong>10 Tokens</strong>
				(what keeps you trapped). Remove every Token to escape. If Stability hits 0, or all 4 Kings are
				revealed, you lose.
			</p>
			<p>The game teaches the rest as you play. This page is here whenever you want a reminder.</p>
		</section>

		<section class="help-section">
			<h3 id="help-rounds" class="cm-section-title" tabindex="-1">Rounds and cards</h3>
			<p>Each round starts with a d20 roll that sets how many cards you draw.</p>
			<table class="help-table">
				<caption class="sr-only">Cards drawn per round</caption>
				<thead><tr><th scope="col">Roll</th><th scope="col">Cards drawn</th></tr></thead>
				<tbody>
					{#each drawTable as row (row.roll)}
						<tr><th scope="row">{row.roll}</th><td>{row.cards}</td></tr>
					{/each}
				</tbody>
			</table>
			<p>What each card does depends on its rank:</p>
			<ul>
				<li>
					<strong>Odd cards</strong> (Ace, 3, 5, 7, 9) trigger a Stability check.
				</li>
				<li>
					<strong>Even cards</strong> (2, 4, 6, 8, 10, Jack, Queen) are quiet moments. Write, breathe,
					move on.
				</li>
				<li><strong>Kings</strong> are the threat. Four revealed ends the game.</li>
			</ul>
		</section>

		<section class="help-section">
			<h3 id="help-stability" class="cm-section-title" tabindex="-1">Stability checks</h3>
			<p>
				When a check is called for, roll a d20. The roll decides the damage, not the card. A
				Narrative card can waive its own check.
			</p>
			<table class="help-table">
				<caption class="sr-only">Stability check results</caption>
				<thead><tr><th scope="col">Roll</th><th scope="col">Result</th></tr></thead>
				<tbody>
					{#each stabilityTable as row (row.roll)}
						<tr><th scope="row">{row.roll}</th><td>{row.result}</td></tr>
					{/each}
				</tbody>
			</table>
		</section>

		<section class="help-section">
			<h3 id="help-states" class="cm-section-title" tabindex="-1">Lucid and Surreal</h3>
			<p>
				A natural 20 on a Stability check makes you <strong>Lucid</strong>: your next roll uses two
				d20s and keeps the higher. A natural 1 makes you <strong>Surreal</strong>: your next roll
				keeps the lower.
			</p>
			<p>
				The state lasts for one roll. You can only be one at a time, and a new 1 or 20 replaces the
				old state.
			</p>
		</section>

		<section class="help-section">
			<h3 id="help-salvation" class="cm-section-title" tabindex="-1">Salvation</h3>
			<p>
				Drawing the <strong>Ace of Hearts</strong> unlocks Salvation. At the end of each round after
				that, you roll to remove Tokens. Every other Ace you reveal lowers the number you need.
			</p>
			<table class="help-table">
				<caption class="sr-only">Salvation target by Aces revealed</caption>
				<thead><tr><th scope="col">Aces revealed</th><th scope="col">To succeed</th></tr></thead>
				<tbody>
					{#each salvationTable as row (row.aces)}
						<tr><th scope="row">{row.aces}</th><td>{row.target}</td></tr>
					{/each}
				</tbody>
			</table>
			<p>
				Meeting the target removes 1 Token; missing it adds 1. A natural 20 removes 2 Tokens. A
				natural 1 adds 2.
			</p>
		</section>

		<section class="help-section">
			<h3 id="help-end" class="cm-section-title" tabindex="-1">How it ends</h3>
			<ul>
				<li><strong>You escape</strong> when your last Token is removed.</li>
				<li><strong>You fall</strong> when Stability reaches 0.</li>
				<li><strong>You are taken</strong> when the fourth King is revealed.</li>
			</ul>
			<p>Either way, your journal keeps the story you wrote.</p>
		</section>
	</div>
</ContentModal>

<style>
	.help-content {
		max-width: 65ch;
		color: #fff;
	}

	.help-content p,
	.help-content ul {
		margin: 0 0 16px;
		color: #e2e9f2;
	}

	.help-content strong {
		color: var(--color-brand-yellow, #ffd700);
		font-weight: 600;
	}

	.help-intro {
		font-size: 1.1875rem;
		color: #d5dfeb;
	}

	.help-nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0 0 8px;
		padding: 0;
		list-style: none;
	}

	/* Contents chips */
	.help-nav :global(.cm-chip) {
		min-height: 44px;
		padding: 8px 16px;
		background: transparent;
		border: 1px solid #6a87a3;
		border-radius: 22px;
		color: #fff;
		font-family: inherit;
		font-size: 0.9375rem;
		cursor: pointer;
		transition: background-color 150ms ease-out;
	}

	.help-nav :global(.cm-chip:hover) {
		background: rgba(0, 255, 255, 0.14);
		border-color: var(--color-neon-cyan, #00ffff);
	}

	.help-section {
		margin-top: 24px;
		padding-top: 32px;
		border-top: 1px solid rgba(255, 255, 255, 0.14);
	}

	.help-section .cm-section-title {
		margin-bottom: 12px;
		scroll-margin-top: 8px;
		outline: none;
	}

	.help-section ul {
		padding-left: 24px;
	}

	.help-section li {
		margin-bottom: 8px;
	}

	.help-table {
		width: 100%;
		margin: 0 0 16px;
		border-collapse: collapse;
		font-size: 1rem;
	}

	.help-table th,
	.help-table td {
		padding: 10px 12px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.12);
		text-align: left;
		line-height: 1.5;
	}

	.help-table thead th {
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: #aebbcc;
		border-bottom-color: rgba(255, 255, 255, 0.3);
	}

	.help-table tbody th {
		width: 9em;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
		font-weight: 400;
		color: var(--color-neon-cyan, #00ffff);
		white-space: nowrap;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.help-intro {
			font-size: 1.0625rem;
		}

		.help-table tbody th {
			width: 6.5em;
		}

		/* One scrolling row instead of three wrapped rows of chips */
		.help-nav ul {
			flex-wrap: nowrap;
			overflow-x: auto;
			margin-right: -20px;
			padding-right: 20px;
			scrollbar-width: none;
		}

		.help-nav :global(.cm-chip) {
			white-space: nowrap;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.help-nav :global(.cm-chip) {
			transition: none;
		}
	}
</style>
