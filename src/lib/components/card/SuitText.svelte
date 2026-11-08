<script>
	/**
	 * SuitText - a line of text whose suit symbols (♠ ♥ ♦ ♣) are drawn with the HUD's own pip
	 * shapes (status/AcesCell.svelte) instead of a system fallback font (design polish VT-1-17).
	 * Each symbol becomes an inline SVG, 0.9em tall, in the text's colour, named for screen
	 * readers. Shared by the board (eyebrow, notices) and the card, journal, timeline and story.
	 */
	let { text = '' } = $props();

	const NAMES = { '♠': 'spades', '♥': 'hearts', '♦': 'diamonds', '♣': 'clubs' };
	const parts = $derived(
		String(text ?? '')
			.replace(/\uFE0E/gu, '')
			.split(/([♠♥♦♣])/u)
			.filter((part) => part !== '')
	);
</script>

{#each parts as part, index (index)}{#if NAMES[part]}<svg
			class="suit"
			viewBox="0 0 24 24"
			fill="currentColor"
			role="img"
			aria-label={NAMES[part]}
			>{#if part === '♥'}<path
					d="M12 20.5S3.5 14.6 3.5 9.1C3.5 6.3 5.6 4.25 8.1 4.25c1.75 0 3.1.95 3.9 2.35.8-1.4 2.15-2.35 3.9-2.35 2.5 0 4.6 2.05 4.6 4.85 0 5.5-8.5 11.4-8.5 11.4z"
				/>{:else if part === '♠'}<path
					d="M12 3c-2.4 3.4-8 6.9-8 11a3.9 3.9 0 0 0 7 2.35L9.8 20.75h4.4L13 16.35A3.9 3.9 0 0 0 20 14c0-4.1-5.6-7.6-8-11z"
				/>{:else if part === '♦'}<path d="M12 2.75 19 12l-7 9.25L5 12z" />{:else}<circle
					cx="12"
					cy="7.25"
					r="4.1"
				/><circle cx="7.1" cy="13.6" r="4.1" /><circle cx="16.9" cy="13.6" r="4.1" /><path
					d="M12 10.5 14.4 20.75H9.6z"
				/>{/if}</svg
		>{:else}{part}{/if}{/each}

<style>
	.suit {
		display: inline-block;
		width: 0.9em;
		height: 0.9em;
		vertical-align: -0.1em;
	}
</style>
