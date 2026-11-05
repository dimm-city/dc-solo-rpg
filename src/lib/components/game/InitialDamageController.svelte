<script>
	/**
	 * InitialDamageController - Initial instability roll controller
	 *
	 * Uses the useInitialDamage instance owned by GameScreen, so the button, the
	 * table tap and auto-play all share one roll state.
	 *
	 * @component
	 */

	import StepAction from './StepAction.svelte';

	let { initialDamage, triggerAutoPlay = null } = $props();

	async function handleClick() {
		await initialDamage.handleInitialDamageRoll(triggerAutoPlay);
	}
</script>

<div class="step-screen">
	<StepAction
		text={initialDamage.buttonText}
		onclick={handleClick}
		disabled={initialDamage.rolling}
		testid="initial-damage-button"
	/>
</div>

<style>
	.step-screen {
		width: 100%;
		height: 100%;
		display: grid;
		align-items: end;
		text-align: center;
	}
</style>
