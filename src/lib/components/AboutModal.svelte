<script>
	/**
	 * AboutModal - About information for the application
	 * Standardized home page modal
	 */
	import InfoModal from './InfoModal.svelte';

	let { isVisible = false, onClose, appVersion = '0.2.0' } = $props();
</script>

<InfoModal {isVisible} title="About Dream Console" {onClose}>
	<p>
		Dream Console is a narrative-driven solo role-playing game built on the Wretched and Alone
		system. Each playthrough offers a unique adventure through the cyberpunk streets of Dimm City.
	</p>
	<p>
		The game uses a standard 52-card deck and dice rolls to guide your story, presenting challenges
		and shaping the narrative as you draw cards and make decisions.
	</p>
	<p class="version-info">
		Version {appVersion}
	</p>
	<p class="attribution">
		This work is based on The Wretched (loottheroom.itch.io/wretched), product of Chris Bissette and
		Loot The Room, and licensed under CC Attribution 3.0 Unported.
	</p>
</InfoModal>

<style>
	p {
		margin: 0;
	}

	.version-info {
		font-size: var(--text-sm);
		color: rgba(255, 255, 255, 0.5);
		font-weight: 400;
		text-align: center;
		margin-top: var(--space-md);
		text-shadow: 0 0 4px rgba(255, 255, 255, 0.2);
	}

	.attribution {
		font-size: var(--text-sm);
		color: rgba(255, 255, 255, 0.7);
		font-style: italic;
		padding-top: var(--space-md);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		margin-top: auto;
	}

	@media (max-width: 600px) {
		.attribution {
			font-size: var(--text-xs);
		}
	}
</style>
