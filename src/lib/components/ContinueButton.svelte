<script>
	/**
	 * ContinueButton - Unified reusable button component for game action screens
	 *
	 * Used across all game flow screens (roll for tasks, success check, failure check, etc.)
	 * to provide consistent button styling and behavior.
	 *
	 * Built on top of AugmentedButton for consistent cyberpunk aesthetics.
	 */
	import AugmentedButton from './AugmentedButton.svelte';

	let {
		/** Button text label */
		text = 'Continue',
		/** Click handler function */
		onclick = () => {},
		/** Disabled state */
		disabled = false,
		/** Custom CSS class */
		class: className = '',
		/** Data test ID for testing */
		testid = 'continue-button',
		/** Button variant (primary or secondary) */
		variant = 'secondary'
	} = $props();
</script>

<AugmentedButton {text} {onclick} {disabled} class="dc-fade-in {className}" {testid} {variant} />
