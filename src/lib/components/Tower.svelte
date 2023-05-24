<script>
	import HealthMeter from './HealthMeter.svelte';
	import DiceRoller from './3DiceRoller.svelte';
	import { gameStore, pullFromTower, confirmTowerPull } from './WAAStore.js';

	let diceRoller;
	let rolling;
	let result;

	async function doCheck() {
		if (rolling) return;
		if ($gameStore.state == 'pullFromTower') {
			result = await diceRoller.roll();
			await pullFromTower(result);
		} else {
			await confirmTowerPull();
		}
	}
</script>

<div class="dc-tower-container">
	<DiceRoller bind:this={diceRoller} bind:rolling on:click={doCheck} on:keyup={doCheck}>
		<div class="dc-dice-header dc-header-container">
			{#if result}
				<h4>Click to continue...</h4>
			{:else}
				<h4>Failure check</h4>
			{/if}
			<!-- <div class="health-meter">
				<HealthMeter />
			</div> -->
		</div>
	</DiceRoller>
</div>

<style>
	.dc-tower-container {
		width: 100%;
		height: 100%;
		display: grid;
		text-align: center;
	}
	.dc-dice-header{
		margin-top: 0.5rem;
	}
	/* .dc-dice-header > .health-meter {
		display: none;
		position: absolute;
		right: 3rem;
		height: 5rem;
	} */
</style>
