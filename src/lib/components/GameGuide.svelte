<script>
	/**
	 * GameGuide - the one source of the rules, shown in the Help modal and on /how-to.
	 *
	 * Every rule here is checked against src/lib/services/d20Mechanics.js and
	 * src/lib/stores/gameActions.svelte.js. It describes what happens, not which button to
	 * press, so it stays true when the round flow changes.
	 *
	 * @prop {2|3} [level=3] Heading level of the section titles (3 inside a modal, 2 on a page)
	 * @prop {{ id: string, label: string }[]} [extraContents] Extra chips for sections the host adds
	 * @prop {import('svelte').Snippet} [children] Extra sections, rendered after the rules
	 */
	let { level = 3, extraContents = [], children } = $props();

	const uid = $props.id();
	const headingTag = `h${level}`;

	const drawTable = [
		{ roll: '1', cards: '1 card' },
		{ roll: '2 to 5', cards: '2 cards' },
		{ roll: '6 to 10', cards: '3 cards' },
		{ roll: '11 to 15', cards: '4 cards' },
		{ roll: '16 to 19', cards: '5 cards' },
		{ roll: '20', cards: '6 cards' }
	];

	const stabilityTable = [
		{ roll: '1', result: 'Lose 3 Stability and become Surreal' },
		{ roll: '2 to 5', result: 'Lose 2 Stability' },
		{ roll: '6 to 10', result: 'Lose 1 Stability' },
		{ roll: '11 to 19', result: 'No loss' },
		{ roll: '20', result: 'Gain 1 Stability (max 20) and become Lucid' }
	];

	const salvationTable = [
		{ aces: '1 Ace', target: 'Roll 17 or higher' },
		{ aces: '2 Aces', target: 'Roll 14 or higher' },
		{ aces: '3 Aces', target: 'Roll 11 or higher' },
		{ aces: '4 Aces', target: 'No target: the fourth Ace ends the game' }
	];

	const sections = [
		{ id: 'goal', label: 'The goal' },
		{ id: 'rounds', label: 'Rounds and cards' },
		{ id: 'stability', label: 'Stability checks' },
		{ id: 'states', label: 'Lucid and Surreal' },
		{ id: 'salvation', label: 'Salvation' },
		{ id: 'end', label: 'How it ends' },
		{ id: 'difficulty', label: 'Difficulty' }
	];

	const sectionId = (id) => `guide-${uid}-${id}`;
	const contents = $derived([
		...sections.map((s) => ({ ...s, id: sectionId(s.id) })),
		...extraContents
	]);

	/** The nearest ancestor that scrolls (the modal body, or the page) */
	function scrollParent(el) {
		for (let node = el.parentElement; node; node = node.parentElement) {
			const { overflowY } = getComputedStyle(node);
			if (
				(overflowY === 'auto' || overflowY === 'scroll') &&
				node.scrollHeight > node.clientHeight
			) {
				return node;
			}
		}
		return document.scrollingElement;
	}

	// Scroll only the scroller: scrollIntoView would also shift overflow-hidden ancestors
	// (the modal frame) when the section is near the end
	function jumpTo(id) {
		const target = document.getElementById(id);
		if (!target) return;
		const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		const scroller = scrollParent(target);
		const top =
			target.getBoundingClientRect().top -
			scroller.getBoundingClientRect().top +
			scroller.scrollTop -
			8;
		scroller.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
		target.focus({ preventScroll: true });
	}
</script>

<div class="game-guide">
	<p class="guide-intro">
		Draw cards, write what happens, and try to escape before your Stability runs out. Every roll in
		the game is a d20.
	</p>

	<nav class="guide-nav" aria-label="Guide contents">
		<ul>
			{#each contents as item (item.id)}
				<li>
					<button type="button" class="guide-chip" onclick={() => jumpTo(item.id)}>
						{item.label}
					</button>
				</li>
			{/each}
		</ul>
	</nav>

	<section class="guide-section">
		<svelte:element this={headingTag} id={sectionId('goal')} class="guide-title" tabindex="-1">
			The goal
		</svelte:element>
		<p>
			You start with <strong>20 Stability</strong> (your grip on yourself) and
			<strong>10 Tokens</strong> (what keeps you trapped). Remove every Token, or reveal the fourth Ace
			and survive its Stability check, to escape. If Stability hits 0, or all 4 Kings are revealed, you
			lose.
		</p>
		<p>The game teaches the rest as you play. This guide is here whenever you want a reminder.</p>
	</section>

	<section class="guide-section">
		<svelte:element this={headingTag} id={sectionId('rounds')} class="guide-title" tabindex="-1">
			Rounds and cards
		</svelte:element>
		<p>Each round starts with a d20 roll that sets how many cards you draw.</p>
		<table class="guide-table">
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
			<li><strong>Odd cards</strong> (Ace, 3, 5, 7, 9) call for a Stability check.</li>
			<li>
				<strong>Even cards</strong> (2, 4, 6, 8, 10, Jack, Queen) are quiet moments. Read, breathe, move
				on.
			</li>
			<li><strong>Kings</strong> are the threat. The fourth one ends the game.</li>
		</ul>
		<p>
			A few cards say they do something more: skip their own Stability check, or send a revealed
			King back into the deck.
		</p>
		<p>When the round's cards are done, you write in your journal what happened.</p>
	</section>

	<section class="guide-section">
		<svelte:element this={headingTag} id={sectionId('stability')} class="guide-title" tabindex="-1">
			Stability checks
		</svelte:element>
		<p>
			A Stability check is a d20 roll. The roll decides the loss, not the card. The opening roll for
			instability, before the first round, uses the same table.
		</p>
		<table class="guide-table">
			<caption class="sr-only">Stability check results</caption>
			<thead><tr><th scope="col">Roll</th><th scope="col">Result</th></tr></thead>
			<tbody>
				{#each stabilityTable as row (row.roll)}
					<tr><th scope="row">{row.roll}</th><td>{row.result}</td></tr>
				{/each}
			</tbody>
		</table>
	</section>

	<section class="guide-section">
		<svelte:element this={headingTag} id={sectionId('states')} class="guide-title" tabindex="-1">
			Lucid and Surreal
		</svelte:element>
		<p>
			Any natural 20 makes you <strong>Lucid</strong>; any natural 1 makes you
			<strong>Surreal</strong>. That holds for every roll in the game: the opening roll, the roll
			for cards, Stability checks and Salvation.
		</p>
		<p>
			Lucid: your next roll uses two d20s and keeps the higher. Surreal: your next roll uses two
			d20s and keeps the lower. Only the die you keep counts, so only it can make you Lucid or
			Surreal.
		</p>
		<p>
			The state is used up by your next roll, whichever roll that is. You are only ever one of the
			two, and a new 1 or 20 replaces the old state.
		</p>
	</section>

	<section class="guide-section">
		<svelte:element this={headingTag} id={sectionId('salvation')} class="guide-title" tabindex="-1">
			Salvation
		</svelte:element>
		<p>
			Drawing the <strong>Ace of Hearts</strong> unlocks Salvation. From then on, at the end of each
			round, you roll to remove Tokens. Every Ace you have revealed, the Ace of Hearts included, lowers
			the number you need.
		</p>
		<table class="guide-table">
			<caption class="sr-only">Salvation target by Aces revealed</caption>
			<thead><tr><th scope="col">Aces revealed</th><th scope="col">To succeed</th></tr></thead>
			<tbody>
				{#each salvationTable as row (row.aces)}
					<tr><th scope="row">{row.aces}</th><td>{row.target}</td></tr>
				{/each}
			</tbody>
		</table>
		<p>
			Meeting the target removes 1 Token, and a natural 20 removes 2. Missing it changes nothing: a
			natural 1 is a miss too (and makes you Surreal). Tokens only ever fall.
		</p>
		<p>
			<strong>The fourth Ace ends the game.</strong> Like every Ace it calls for a Stability check, and
			that check is the last roll you make: if you still have Stability after it, you escape, whatever
			Tokens remain. If it takes your last Stability, you fall. A fourth Ace that skips its check frees
			you outright.
		</p>
		<p>Hard plays Salvation differently; see Difficulty below.</p>
	</section>

	<section class="guide-section">
		<svelte:element this={headingTag} id={sectionId('end')} class="guide-title" tabindex="-1">
			How it ends
		</svelte:element>
		<ul>
			<li>
				<strong>You escape</strong> when your last Token is removed, or when the fourth Ace is revealed
				and you survive its Stability check.
			</li>
			<li><strong>You fall</strong> when Stability reaches 0.</li>
			<li><strong>You are taken</strong> when the fourth King is revealed.</li>
			<li><strong>You are lost</strong> if the deck runs out first.</li>
		</ul>
		<p>Whatever the ending, your journal keeps the story you wrote.</p>
	</section>

	<section class="guide-section">
		<svelte:element
			this={headingTag}
			id={sectionId('difficulty')}
			class="guide-title"
			tabindex="-1"
		>
			Difficulty
		</svelte:element>
		<p>
			Each game has a default difficulty; you can choose your own in Settings, and it applies the
			next time a game begins.
		</p>
		<ul>
			<li>
				<strong>Easy</strong> plays by the Normal rules, with the Ace of Hearts already revealed, so
				Salvation is open from the first round.
			</li>
			<li>
				<strong>Normal</strong> is everything above: Tokens only ever fall, and the fourth Ace ends the
				game.
			</li>
			<li>
				<strong>Hard</strong> changes two things. A missed Salvation roll adds 1 Token (a natural 1 adds
				2), so Tokens can rise above where they started. And the fourth Ace does not end the game: with
				all four Aces there is no target, but each Salvation roll is a Stability check, read on the Stability
				table, and 1 Token comes off only if you still have Stability after it. Winning on Hard means
				removing every Token.
			</li>
		</ul>
	</section>

	{@render children?.()}
</div>

<style>
	.game-guide {
		max-width: 65ch;
		color: #fff;
	}

	.game-guide p,
	.game-guide ul {
		margin: 0 0 16px;
		color: #e2e9f2;
	}

	.game-guide strong {
		color: var(--color-brand-yellow, #ffd700);
		font-weight: 600;
	}

	.guide-intro {
		font-size: 1.1875rem;
		color: #d5dfeb;
	}

	.guide-nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0 0 8px;
		padding: 0;
		list-style: none;
	}

	.guide-chip {
		min-height: 44px;
		padding: 8px 16px;
		background: transparent;
		border: 1px solid #6a87a3;
		border-radius: 22px;
		color: #fff;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.9375rem;
		cursor: pointer;
		transition: background-color 150ms ease-out;
	}

	.guide-chip:hover {
		background: rgba(0, 255, 255, 0.14);
		border-color: var(--color-neon-cyan, #00ffff);
	}

	.guide-chip:focus-visible {
		outline: 3px solid var(--color-neon-cyan, #00ffff);
		outline-offset: 2px;
	}

	/* Also used by sections a host adds after the rules (see HelpModal) */
	.game-guide :global(.guide-section) {
		margin-top: 24px;
		padding-top: 32px;
		border-top: 1px solid rgba(255, 255, 255, 0.14);
	}

	/* Inter, not the display face: these titles are 18px (display face is for 28px and up) */
	.game-guide :global(.guide-title) {
		margin: 0 0 12px;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1.3;
		letter-spacing: 0.02em;
		text-transform: none;
		text-shadow: none;
		color: var(--color-neon-cyan, #00ffff);
		scroll-margin-top: 8px;
		outline: none;
	}

	.guide-section ul {
		padding-left: 24px;
	}

	.guide-section li {
		margin-bottom: 8px;
	}

	.guide-table {
		width: 100%;
		margin: 0 0 16px;
		border-collapse: collapse;
		font-size: 1rem;
	}

	.guide-table th,
	.guide-table td {
		padding: 10px 12px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.12);
		text-align: left;
		line-height: 1.5;
		color: #e2e9f2;
	}

	.guide-table thead th {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: #aebbcc;
		border-bottom-color: rgba(255, 255, 255, 0.3);
	}

	.guide-table tbody th {
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
		.guide-intro {
			font-size: 1.0625rem;
		}

		.guide-table tbody th {
			width: 6.5em;
		}

		/* One scrolling row instead of three wrapped rows of chips */
		.guide-nav ul {
			flex-wrap: nowrap;
			overflow-x: auto;
			margin-right: -20px;
			padding-right: 20px;
			scrollbar-width: none;
		}

		.guide-chip {
			white-space: nowrap;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.guide-chip {
			transition: none;
		}
	}
</style>
