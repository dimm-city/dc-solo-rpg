<script>
	/**
	 * StatusDisplay - The in-game header and the status HUD
	 *
	 * - PlayerInfoBar: player, game title, round and the header actions
	 * - StatusHUD: Stability, Kings, Aces, tokens, cards and the last roll in one row
	 *
	 * The whole block fades in once with the table (GameScreen); nothing in it slides.
	 */

	import PlayerInfoBar from './status/PlayerInfoBar.svelte';
	import StatusHUD from './status/StatusHUD.svelte';

	let { onHelpClick, onExitClick, onSettingsClick = () => {} } = $props();
</script>

<div class="status-display-container">
	<PlayerInfoBar {onExitClick} {onHelpClick} {onSettingsClick} />
	<StatusHUD />
</div>

<style>
	.status-display-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		overflow: visible;
	}
</style>
