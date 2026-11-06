<script>
	/**
	 * AboutModal - About information for the application
	 * Uses ContentModal as base; the text lives in AboutContent.svelte (also the body of /about)
	 */
	import ContentModal from './ContentModal.svelte';
	import AboutContent from './AboutContent.svelte';

	let { isOpen = false, onClose, appVersion = '0.2.0' } = $props();
</script>

<ContentModal {isOpen} title="About" {onClose}>
	<AboutContent {appVersion} />
</ContentModal>
