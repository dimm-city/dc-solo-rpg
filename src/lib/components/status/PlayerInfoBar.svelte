<script>
	/**
	 * PlayerInfoBar - Player and round information bar with action buttons
	 *
	 * Displays player name, game title, current round, and action buttons (exit, dice theme, automation presets, settings, help).
	 * Uses Augmented UI styling with glassmorphism effects.
	 *
	 * @component
	 */

	import { gameState } from '../../stores/gameStore.svelte.js';
	import {
		getAudioSettings,
		getGameplaySettings,
		updateAudioSettings,
		updateGameplaySettings
	} from '../../stores/audioStore.svelte.js';
	import DiceThemePicker from '../DiceThemePicker.svelte';

	let {
		/** Handler for exit button click */
		onExitClick,
		/** Handler for help button click */
		onHelpClick,
		/** Handler for settings button click */
		onSettingsClick = () => {}
	} = $props();

	let showDiceThemePicker = $state(false);

	// Reactive state to detect if features are enabled
	const audioEnabled = $derived(() => {
		const audio = getAudioSettings();
		return audio.autoReadCards || audio.autoReadPrompts || audio.autoAnnounceRolls;
	});

	const autoPlayEnabled = $derived(() => {
		const gameplay = getGameplaySettings();
		return (
			gameplay.autoRollDice ||
			gameplay.autoContinueAfterReading ||
			gameplay.autoHandleJournaling === 'timed'
		);
	});

	// Toggle functions
	function toggleAudio() {
		const audio = getAudioSettings();
		const isEnabled = audio.autoReadCards || audio.autoReadPrompts || audio.autoAnnounceRolls;

		// Toggle all audio features on or off
		updateAudioSettings({
			autoReadCards: !isEnabled,
			autoReadPrompts: !isEnabled,
			autoAnnounceRolls: !isEnabled
		});
	}

	function toggleAutoPlay() {
		const gameplay = getGameplaySettings();
		const isEnabled =
			gameplay.autoRollDice ||
			gameplay.autoContinueAfterReading ||
			gameplay.autoHandleJournaling === 'timed';

		if (!isEnabled) {
			// Enable automation
			updateGameplaySettings({
				autoRollDice: true,
				autoContinueAfterReading: true,
				autoAdvanceDelay: 2000,
				autoHandleJournaling: 'timed',
				journalPauseTime: 10000
			});
		} else {
			// Disable automation
			updateGameplaySettings({
				autoRollDice: false,
				autoContinueAfterReading: false,
				autoHandleJournaling: 'manual'
			});
		}
	}
</script>

<div
	class="player-round-bar slide-down"
	data-augmented-ui="tl-2-clip-x tr-2-clip-x br-clip bl-clip border"
	style="animation-delay: 0s; animation-duration: 0.6s"
>
	<!-- Exit Button on far left -->
	<button class="status-bar-button exit-button" onclick={onExitClick} aria-label="Exit game">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	</button>

	<div class="info-segment">
		<span class="label">PLAYER</span>
		<span class="value">{gameState.player.name.toUpperCase()}</span>
	</div>
	<div>
		<h5>{gameState.config?.title}</h5>
	</div>
	<div class="info-segment">
		<div>
			<span class="value">{gameState?.round}</span>
			<span class="label">{gameState.config?.labels.statusDisplayRoundText ?? 'ROUND'}</span>
		</div>
	</div>

	<!-- Dice Theme Picker Button -->
	<button
		class="status-bar-button dice-theme-button"
		onclick={() => (showDiceThemePicker = true)}
		aria-label="Change dice theme"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<rect width="12" height="12" x="2" y="10" rx="2" ry="2" />
			<path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6" />
			<path d="M6 18h.01" />
			<path d="M10 14h.01" />
			<path d="M15 6h.01" />
			<path d="M18 9h.01" />
		</svg>
	</button>

	<!-- Toggle Buttons -->
	<button
		class="status-bar-button toggle-button"
		class:active={autoPlayEnabled()}
		onclick={toggleAutoPlay}
		aria-label="Toggle Auto-Play"
		title="Toggle Auto-Play"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<polygon points="5 3 19 12 5 21 5 3" />
		</svg>
	</button>

	<button
		class="status-bar-button toggle-button"
		class:active={audioEnabled()}
		onclick={toggleAudio}
		aria-label="Toggle Audio"
		title="Toggle Audio"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
			<path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
		</svg>
	</button>

	<!-- Settings Button -->
	<button
		class="status-bar-button settings-button"
		onclick={onSettingsClick}
		aria-label="Game settings"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path
				d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
			/>
			<circle cx="12" cy="12" r="3" />
		</svg>
	</button>

	<!-- Help Button on far right -->
	<button class="status-bar-button help-button" onclick={onHelpClick} aria-label="Game help">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" />
			<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
			<path d="M12 17h.01" />
		</svg>
	</button>
</div>

<!-- Dice Theme Picker Modal -->
<DiceThemePicker bind:isOpen={showDiceThemePicker} />

<style>
	/* Animation */
	.slide-down {
		animation: slideDown 0.4s linear forwards;
		opacity: 0;
	}

	@keyframes slideDown {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	/* Player/Round Info Bar - Augmented UI with Glassmorphism */
	.player-round-bar {
		/* Augmented UI Configuration - Uniform corner clips */
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, #00eeff 0%, #ff00ff 50%, #00ffaa 100%);
		--aug-tl: 14px;
		--aug-tr: 14px;
		--aug-br: 14px;
		--aug-bl: 14px;

		/* Layout with buttons on both ends + dice theme picker + toggle buttons */
		display: grid;
		align-items: center;
		grid-template-columns: auto 1fr auto 1fr auto auto auto auto auto;
		gap: var(--space-sm);
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		position: relative;

		/* Glassmorphism Effect */
		background: linear-gradient(
			135deg,
			rgba(100, 50, 200, 0.3),
			rgba(50, 150, 255, 0.25),
			rgba(100, 50, 200, 0.2)
		);
		backdrop-filter: blur(12px) saturate(180%);
		-webkit-backdrop-filter: blur(12px) saturate(180%);

		/* Enhanced Multi-layer Glow */
		box-shadow:
			0 0 30px rgba(0, 238, 255, 0.7),
			0 0 60px rgba(0, 238, 255, 0.4),
			0 0 90px rgba(0, 238, 255, 0.2),
			inset 0 0 30px rgba(255, 0, 255, 0.25),
			inset 0 0 50px rgba(0, 255, 255, 0.1);
	}

	/* Status Bar Buttons */
	.status-bar-button {
		background: transparent;
		border: none;
		color: #00eeff;
		cursor: pointer;
		padding: var(--space-xs);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.2s ease;
		position: relative;
	}

	.status-bar-button:hover {
		color: #fff;
		background: rgba(0, 238, 255, 0.1);
		box-shadow: 0 0 10px rgba(0, 238, 255, 0.3);
	}

	.status-bar-button:active {
		transform: scale(0.95);
	}

	.status-bar-button svg {
		filter: drop-shadow(0 0 4px currentColor);
	}

	/* Toggle button active state */
	.toggle-button.active {
		color: #ff00ff;
		background: rgba(255, 0, 255, 0.15);
		box-shadow: 0 0 15px rgba(255, 0, 255, 0.4);
	}

	.toggle-button.active:hover {
		color: #ff00ff;
		background: rgba(255, 0, 255, 0.2);
		box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
	}

	.info-segment {
		display: flex;
		gap: 0.5rem;
		text-transform: uppercase;
		justify-content: center;
	}

	.info-segment:first-of-type {
		display: flex;
		flex-direction: column;
		gap: 0;
		justify-content: center;
		align-items: center;
	}

	.info-segment .label {
		font-size: var(--text-xs);
		font-weight: 900; /* Increased weight for better readability */
		color: #00ffff; /* Pure cyan for better contrast */
		text-shadow:
			0 0 12px rgba(0, 255, 255, 1),
			0 0 24px rgba(0, 255, 255, 0.7),
			0 1px 2px rgba(0, 0, 0, 0.9); /* Dark outline for contrast */
		letter-spacing: 0.1em;
	}

	.info-segment .value {
		font-size: 1rem;
		font-weight: bold;
		color: #fff;
		text-shadow:
			0 0 10px rgba(255, 255, 255, 1),
			0 0 20px rgba(255, 255, 255, 0.5);
	}

	.info-segment:last-of-type {
		display: flex;

		& > div {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0;
		}
	}

	h5 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: #fff;
		text-align: center;
	}

	/* Mobile responsive */
	@media (max-width: 600px) {
		.player-round-bar {
			grid-template-columns: auto 1fr auto auto auto auto;
			gap: var(--space-xs);
		}

		.player-round-bar h5 {
			font-size: 0.875rem;
		}

		.info-segment {
			font-size: 0.75rem;
		}

		.info-segment:nth-child(4) {
			display: none; /* Hide round on mobile for space */
		}

		/* Hide toggle buttons on mobile to save space */
		.toggle-button {
			display: none;
		}
	}

	/* Extra small screens - hide game title too */
	@media (max-width: 400px) {
		.player-round-bar {
			grid-template-columns: auto 1fr auto auto auto;
		}

		.player-round-bar h5 {
			display: none;
		}

		.info-segment {
			font-size: 0.7rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.slide-down {
			animation: none;
			opacity: 1;
		}

		.status-bar-button {
			transition: none;
		}

		.status-bar-button:active {
			transform: none;
		}
	}
</style>
