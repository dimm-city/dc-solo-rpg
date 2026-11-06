<script>
	/**
	 * AISettings - AI story summary settings in a dialog of their own.
	 *
	 * Built on ContentModal, so it is a real modal dialog: focus moves in and is trapped, and
	 * Escape closes only this dialog (SM-03). Like the game's other settings, changes apply when
	 * the dialog closes; "Test key" checks a key before the player leaves. Story mode shows the
	 * same form inside its AI summary dialog instead (StoryGenerationPanel).
	 */
	import ContentModal from './ContentModal.svelte';
	import AISettingsForm from './story/AISettingsForm.svelte';

	let { isOpen = true, onClose = () => {} } = $props();

	let form = $state();

	async function saveAndClose() {
		await form?.save();
		onClose();
	}
</script>

<ContentModal {isOpen} title="AI settings" onClose={saveAndClose} footerButtonText="Done">
	<AISettingsForm bind:this={form} />
</ContentModal>
