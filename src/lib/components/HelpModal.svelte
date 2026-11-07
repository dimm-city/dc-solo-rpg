<script>
	/**
	 * HelpModal - the Game Guide in a ContentModal, plus the rule tips the player has met.
	 * The rules themselves live in GameGuide.svelte (also the body of /how-to).
	 */
	import ContentModal from './ContentModal.svelte';
	import GameGuide from './GameGuide.svelte';
	import { getSeenRuleTips } from '../utils/instructionsStorage.js';

	let { isOpen = false, onClose } = $props();

	/** One line per rule tip id (see createRuleCaptions in useRuleCaptions.svelte.js) */
	const RULE_TIP_SUMMARIES = {
		odd: 'Odd cards call for a Stability check. Low rolls cost Stability.',
		king: 'Kings are the threat. The fourth one ends the game.',
		salvation:
			'The Ace of Hearts unlocks Salvation: at the end of each round, roll to remove a Token.',
		ace: 'Every Ace you reveal makes Salvation easier.',
		lucid: 'Lucid: your next roll uses two dice and keeps the higher.',
		surreal: 'Surreal: your next roll uses two dice and keeps the lower.',
		token: 'A failed Salvation roll adds a Token.'
	};

	const MET_ID = 'help-rules-met';

	// Re-read each time the guide opens, so tips met since the last look are listed
	let metRules = $derived(isOpen ? getSeenRuleTips().filter((id) => id in RULE_TIP_SUMMARIES) : []);
</script>

<ContentModal {isOpen} title="Game Guide" {onClose}>
	<GameGuide extraContents={metRules.length ? [{ id: MET_ID, label: "Rules you've met" }] : []}>
		{#if metRules.length}
			<section class="guide-section" aria-labelledby={MET_ID}>
				<h3 id={MET_ID} class="guide-title" tabindex="-1">Rules you've met</h3>
				<ul class="met-list">
					{#each metRules as id (id)}
						<li>{RULE_TIP_SUMMARIES[id]}</li>
					{/each}
				</ul>
			</section>
		{/if}
	</GameGuide>
</ContentModal>

<style>
	.met-list {
		margin: 0;
		padding-left: 24px;
		color: #e2e9f2;
	}

	.met-list li {
		margin-bottom: 8px;
	}
</style>
