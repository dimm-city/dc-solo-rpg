<script>
	/**
	 * AboutModal - About information for the application
	 * Uses ContentModal as base
	 */
	import ContentModal from './ContentModal.svelte';

	let { isOpen = false, onClose, appVersion = '0.2.0' } = $props();
</script>

<ContentModal {isOpen} title="About Dream Console" {onClose}>
	<div class="about-content">
		<p>
			Dream Console is a narrative-driven solo role-playing game built on the Wretched and Alone
			system. Each playthrough offers a unique adventure through the cyberpunk streets of Dimm City.
		</p>
		<p>
			The game uses a standard 52-card deck and dice rolls to guide your story, presenting
			challenges and shaping the narrative as you draw cards and make decisions.
		</p>
		<p class="version-info">
			Version {appVersion}
		</p>
		<p class="attribution">
			This work is based on The Wretched (loottheroom.itch.io/wretched), product of Chris Bissette
			and Loot The Room, and licensed under CC Attribution 3.0 Unported.
		</p>
	</div>
</ContentModal>

<style>
	.about-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-md, 1rem);
	}

	.about-content p {
		margin: 0;
		line-height: 1.6;
		color: var(--dc-default-text-color, #ffffff);
	}

	.version-info {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 400;
		text-align: center;
		margin-top: var(--space-md, 1rem);
		padding-top: var(--space-md, 1rem);
		border-top: 1px solid rgba(255, 255, 255, 0.2);
	}

	.attribution {
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.7);
		font-style: italic;
		padding-top: var(--space-sm, 0.5rem);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		margin-top: var(--space-sm, 0.5rem);
	}

	@media (max-width: 600px) {
		.about-content p {
			font-size: 0.9rem;
		}

		.version-info,
		.attribution {
			font-size: 0.8rem;
		}
	}
</style>
