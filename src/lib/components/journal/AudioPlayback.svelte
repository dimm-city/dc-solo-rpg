<script>
/**
 * AudioPlayback - Audio playback controls component
 *
 * Displays playback controls: play/pause button, delete button
 * Shows audio duration and playback status
 *
 * @component
 * @example
 * <AudioPlayback
 *   {recordingTime}
 *   {isPlaying}
 *   {journalSaved}
 *   onPlay={playAudio}
 *   onDelete={deleteAudio}
 * />
 */

let {
	recordingTime = 0,
	isPlaying = false,
	journalSaved = false,
	onPlay = () => {},
	onDelete = () => {}
} = $props();

// Format time as MM:SS
function formatTime(seconds) {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
</script>

<div class="audio-playback">
	<div class="audio-section-header">
		<svg
			class="audio-header-icon"
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="12" cy="10" r="3" />
			<path d="M9 10v2a3 3 0 006 0v-2" />
			<path d="M12 15v5" />
			<path d="M9 20h6" />
		</svg>
		<span>Audio Recording (Optional)</span>
	</div>

	<div class="playback-controls">
		<div class="audio-info">
			<span class="audio-duration">{formatTime(recordingTime)}</span>
			<span class="audio-status">
				{#if isPlaying}
					Playing...
				{:else}
					Ready to play
				{/if}
			</span>
		</div>

		<div class="playback-buttons">
			<button class="audio-button play-button" onclick={onPlay} title={isPlaying ? 'Stop' : 'Play'}>
				{#if isPlaying}
					<svg class="audio-button-icon" viewBox="0 0 24 24" fill="currentColor">
						<rect x="6" y="4" width="4" height="16" />
						<rect x="14" y="4" width="4" height="16" />
					</svg>
				{:else}
					<svg class="audio-button-icon" viewBox="0 0 24 24" fill="currentColor">
						<path d="M8 5v14l11-7z" />
					</svg>
				{/if}
			</button>

			{#if !journalSaved}
				<button class="audio-button delete-button" onclick={onDelete} title="Delete Recording">
					<svg
						class="audio-button-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
					</svg>
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.audio-playback {
		width: 100%;
	}

	.audio-section-header {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		margin-bottom: var(--space-sm);
		color: var(--color-neon-cyan);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		letter-spacing: var(--letter-spacing-wide);
		text-transform: uppercase;
	}

	.audio-header-icon {
		color: var(--color-neon-cyan);
	}

	.playback-controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.audio-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		padding: var(--space-sm);
		background: rgba(0, 255, 255, 0.05);
		border: 1px solid rgba(0, 255, 255, 0.2);
		border-radius: 4px;
	}

	.audio-duration {
		font-family: 'Courier New', monospace;
		font-size: var(--text-lg);
		color: var(--color-neon-cyan);
		font-weight: 600;
	}

	.audio-status {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		font-style: italic;
	}

	.playback-buttons {
		display: flex;
		gap: var(--space-sm);
	}

	.playback-buttons .audio-button {
		flex: 1;
	}

	.audio-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(217, 70, 239, 0.1));
		border: 2px solid var(--color-neon-cyan);
		border-radius: 4px;
		color: var(--color-neon-cyan);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		letter-spacing: var(--letter-spacing-wide);
		text-transform: uppercase;
		cursor: pointer;
		transition:
			background 0.2s,
			border-color 0.2s,
			transform 0.1s;
	}

	.audio-button:hover {
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(217, 70, 239, 0.2));
		border-color: var(--color-neon-pink);
		box-shadow:
			0 0 10px rgba(0, 255, 255, 0.3),
			0 0 20px rgba(217, 70, 239, 0.2);
	}

	.audio-button:active {
		transform: translateY(1px);
		box-shadow:
			0 0 5px rgba(0, 255, 255, 0.2),
			0 0 10px rgba(217, 70, 239, 0.1);
	}

	.audio-button-icon {
		width: 20px;
		height: 20px;
	}

	.play-button {
		background: linear-gradient(135deg, rgba(0, 255, 0, 0.1), rgba(0, 200, 0, 0.1));
		border-color: rgba(0, 255, 0, 0.6);
		color: rgba(0, 255, 0, 0.9);
	}

	.play-button:hover {
		background: linear-gradient(135deg, rgba(0, 255, 0, 0.2), rgba(0, 200, 0, 0.2));
		border-color: rgba(0, 255, 0, 0.9);
		box-shadow:
			0 0 10px rgba(0, 255, 0, 0.3),
			0 0 20px rgba(0, 200, 0, 0.2);
	}

	.delete-button {
		background: linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(200, 0, 0, 0.1));
		border-color: rgba(255, 0, 0, 0.6);
		color: rgba(255, 100, 100, 0.9);
	}

	.delete-button:hover {
		background: linear-gradient(135deg, rgba(255, 0, 0, 0.2), rgba(200, 0, 0, 0.2));
		border-color: rgba(255, 0, 0, 0.9);
		box-shadow:
			0 0 10px rgba(255, 0, 0, 0.3),
			0 0 20px rgba(200, 0, 0, 0.2);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.audio-section-header {
			font-size: var(--text-xs);
		}

		.audio-header-icon {
			width: 14px;
			height: 14px;
		}

		.audio-button {
			padding: var(--space-xs) var(--space-sm);
			font-size: var(--text-xs);
		}

		.audio-duration {
			font-size: var(--text-base);
		}
	}

	@media (max-width: 480px) {
		.audio-duration {
			font-size: var(--text-sm);
		}
	}

	/* Accessibility: Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.audio-button {
			transition: none;
		}
	}
</style>
