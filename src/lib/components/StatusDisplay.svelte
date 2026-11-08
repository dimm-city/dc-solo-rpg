<script>
	/**
	 * StatusDisplay - The in-game header and the status HUD
	 *
	 * - PlayerInfoBar: player, game title, round and the header actions
	 * - StatusHUD: Stability, Kings, Aces, tokens, cards and the last roll in one row
	 *
	 * The header sits above the HUD, except on phones in portrait (up to 600px wide), where it
	 * docks at the bottom of the screen, under the step button (OWN-3): this block then lays
	 * itself out as two items of GameScreen's grid (display: contents), the HUD in its
	 * status-area row at the top and the header in its toolbar-area row at the bottom, with the
	 * header's frame mirrored so its bevels face the board. Landscape phones keep the header at
	 * the top (no reach problem there, and the action column is too narrow for it).
	 *
	 * The whole block fades in once with the table (GameScreen); nothing in it slides.
	 */

	import PlayerInfoBar from './status/PlayerInfoBar.svelte';
	import StatusHUD from './status/StatusHUD.svelte';

	let { onHelpClick, onExitClick, onSettingsClick = () => {} } = $props();
</script>

<div class="status-display-container">
	<div class="dock-toolbar" data-testid="game-toolbar">
		<PlayerInfoBar {onExitClick} {onHelpClick} {onSettingsClick} />
	</div>
	<div class="dock-hud">
		<StatusHUD />
	</div>
</div>

<style>
	.status-display-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		overflow: visible;
	}

	/* OWN-3: phones in portrait. The same query as GameScreen's .status-display-area. */
	@media (max-width: 600px) and (orientation: portrait) {
		.status-display-container {
			display: contents;
		}

		.dock-hud {
			grid-area: status-area;
			min-width: 0;
		}

		.dock-toolbar {
			grid-area: toolbar-area;
			min-width: 0;
		}

		/* The frame alone is mirrored: the 18px bevels on top, facing the board */
		.dock-toolbar :global(.bar-frame) {
			transform: scaleY(-1);
		}
	}
</style>
