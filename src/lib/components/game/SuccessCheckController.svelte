<script>
	/**
	 * SuccessCheckController - Success Check screen controller
	 *
	 * Manages the Success Check (Salvation) screen using the useSuccessCheck composable.
	 * Handles button state, token removal rolls, and auto-play integration.
	 *
	 * @component
	 */

	import ContinueButton from '../ContinueButton.svelte';
	import ButtonBar from '../ButtonBar.svelte';

	// successCheck: the useSuccessCheck() instance owned by GameScreen, shared with its
	// table-tap and auto-play handlers so they all see the same roll state
	let { successCheck, triggerAutoPlay = null } = $props();

	// Handle button click
	async function handleClick() {
		await successCheck.handleSuccessCheck(triggerAutoPlay);
	}
</script>

<div class="success-check-screen">
	<ButtonBar>
		<ContinueButton
			text={successCheck.buttonText}
			onclick={handleClick}
			disabled={successCheck.rolling}
			testid="success-check-button"
		/>
	</ButtonBar>
</div>

<style>
	.success-check-screen {
		height: 100%;
		width: 100%;
		display: grid;
		text-align: center;
		align-items: end;
	}
</style>
