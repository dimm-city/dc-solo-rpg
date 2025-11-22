<script>
	/**
	 * SettingsModal - In-game settings modal (audio/TTS settings)
	 * Now uses ContentModal as base
	 */
	import ContentModal from '../ContentModal.svelte';
	import AudioSettings from './AudioSettings.svelte';

	let { isOpen = $bindable(false), onClose } = $props();
</script>

<ContentModal {isOpen} title="Game Settings" {onClose}>
	<AudioSettings />
</ContentModal>
