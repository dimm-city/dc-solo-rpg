<script>
	import ConfirmModal from './ConfirmModal.svelte';

	let { isOpen = false, helpKey, onClose } = $props();

	// Define help content for different game concepts
	const helpContent = {
		tower: {
			title: 'Tower (Health)',
			message:
				'Your Tower represents your health. Each time you take damage, blocks fall from the Tower. If it reaches 0, you lose the game. Start with 54 blocks (on normal difficulty).'
		},
		kings: {
			title: 'Kings (Failure Counter)',
			message:
				"Kings are your doom. Each time you reveal a King, you're one step closer to failure. Reveal all 4 Kings and the game ends immediately in defeat."
		},
		tokens: {
			title: 'Tokens (Win Condition)',
			message:
				'Tokens are your path to victory. You need 10 tokens to attempt the final challenge. Gain tokens through Narrative (Bonus) cards. With 10 tokens, drawing the Ace of Hearts lets you roll for victory.'
		},
		bonus: {
			title: 'Luck (Bonus)',
			message:
				'Luck tokens reduce damage you take. Each Luck token absorbs one point of damage when you fail a challenge. Gain Luck by drawing Narrative cards (Aces).'
		},
		cardTypes: {
			title: 'Card Types',
			message:
				'Challenge cards (odd ranks) trigger damage rolls. Event cards (even ranks) are safe moments. Narrative cards give bonuses. Kings are threats. The Ace of Hearts is your win condition.'
		},
		progress: {
			title: 'Cards Progress',
			message:
				"The progress bar shows how many cards you've drawn from the 52-card deck. As you progress, tension builds - every card drawn brings you closer to victory or defeat."
		},
		deck: {
			title: 'Deck Visualization',
			message:
				'The deck stack shows how many cards remain. Watch it shrink as you progress through your journey. Each card contains a new challenge, story moment, or turning point.'
		}
	};

	const content = $derived(
		helpContent[helpKey] || { title: 'Help', message: 'No help available for this topic.' }
	);
</script>

<ConfirmModal
	{isOpen}
	title={content.title}
	message={content.message}
	confirmText="Got it"
	cancelText=""
	onConfirm={onClose}
	onCancel={onClose}
/>
