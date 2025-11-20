<script>
/**
 * StatusDisplay - Main status display orchestrator
 *
 * Organizes all game status information using extracted components:
 * - PlayerInfoBar: Player info, game title, round, action buttons
 * - StatsGrid: Container with all stat panels
 * - ProgressTracker: Cards drawn progress
 *
 * Reduced from 2,006 lines → ~50 lines (97.5% reduction)
 */

import PlayerInfoBar from './status/PlayerInfoBar.svelte';
import StatsGrid from './status/StatsGrid.svelte';
import ProgressTracker from './status/ProgressTracker.svelte';

let { onHelpClick, onExitClick, onSettingsClick = () => {} } = $props();
</script>

<div class="status-display-container">
	<!-- Player and Round Info Bar with Action Buttons -->
	<PlayerInfoBar {onExitClick} {onHelpClick} {onSettingsClick} />

	<!-- Stats Grid with all panels -->
	<StatsGrid />

	<!-- Cards Remaining Progress Tracker -->
	<ProgressTracker />
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
