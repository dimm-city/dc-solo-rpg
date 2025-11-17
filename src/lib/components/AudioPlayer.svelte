<script>
	/**
	 * AudioPlayer - Polished audio playback component for story mode
	 * Plays back journal entry audio recordings with cyberpunk styling
	 */

	let {
		audioData = null, // Base64 audio data URL
		duration = 0, // Duration in seconds
		compact = false // Compact mode for inline display
	} = $props();

	let audioElement = $state(null);
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let audioURL = $state(null);

	// Convert base64 to blob URL when audioData changes
	$effect(() => {
		if (audioData) {
			// If it's already a data URL, use it directly
			if (audioData.startsWith('data:')) {
				audioURL = audioData;
			}
		} else {
			audioURL = null;
			if (audioElement) {
				audioElement.pause();
				audioElement.currentTime = 0;
			}
			isPlaying = false;
			currentTime = 0;
		}
	});

	function formatTime(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function togglePlayback() {
		if (!audioElement || !audioURL) return;

		if (isPlaying) {
			audioElement.pause();
		} else {
			audioElement.play();
		}
	}

	function handlePlay() {
		isPlaying = true;
	}

	function handlePause() {
		isPlaying = false;
	}

	function handleTimeUpdate() {
		if (audioElement) {
			currentTime = audioElement.currentTime;
		}
	}

	function handleEnded() {
		isPlaying = false;
		currentTime = 0;
		if (audioElement) {
			audioElement.currentTime = 0;
		}
	}

	function handleSeek(event) {
		if (!audioElement) return;
		const rect = event.currentTarget.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const percentage = x / rect.width;
		audioElement.currentTime = percentage * audioElement.duration;
	}

	// Get progress percentage
	let progress = $derived(
		audioElement && audioElement.duration > 0 ? (currentTime / audioElement.duration) * 100 : 0
	);
</script>

{#if audioURL}
	<div class="audio-player" class:compact>
		<!-- Hidden audio element -->
		<audio
			bind:this={audioElement}
			src={audioURL}
			onplay={handlePlay}
			onpause={handlePause}
			ontimeupdate={handleTimeUpdate}
			onended={handleEnded}
		></audio>

		<div class="player-controls">
			<!-- Play/Pause Button -->
			<button
				class="play-button"
				class:playing={isPlaying}
				onclick={togglePlayback}
				aria-label={isPlaying ? 'Pause' : 'Play'}
			>
				{#if isPlaying}
					<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
						<rect x="4" y="3" width="4" height="14" rx="1" />
						<rect x="12" y="3" width="4" height="14" rx="1" />
					</svg>
				{:else}
					<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
						<path d="M5 3l12 7-12 7z" />
					</svg>
				{/if}
			</button>

			<!-- Progress Bar -->
			<div class="progress-container">
				<button class="progress-bar" onclick={handleSeek} aria-label="Seek">
					<div class="progress-track">
						<div class="progress-fill" style="width: {progress}%"></div>
						<div class="progress-handle" style="left: {progress}%"></div>
					</div>
				</button>

				<div class="time-display">
					<span class="current-time">{formatTime(currentTime)}</span>
					<span class="separator">/</span>
					<span class="total-time">
						{formatTime(audioElement?.duration || duration)}
					</span>
				</div>
			</div>
		</div>

		{#if isPlaying}
			<div class="audio-visualizer">
				<div class="wave-bar"></div>
				<div class="wave-bar"></div>
				<div class="wave-bar"></div>
				<div class="wave-bar"></div>
				<div class="wave-bar"></div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.audio-player {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(75, 0, 130, 0.2));
		border: 2px solid rgba(138, 43, 226, 0.4);
		border-radius: 8px;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		transition: all var(--transition-base);
	}

	.audio-player:hover {
		border-color: rgba(186, 85, 211, 0.6);
		box-shadow: 0 0 20px rgba(138, 43, 226, 0.3);
	}

	.audio-player.compact {
		padding: var(--space-md);
		gap: var(--space-sm);
	}

	.player-controls {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		width: 100%;
	}

	.play-button {
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, rgba(0, 255, 127, 0.2), rgba(0, 139, 69, 0.3));
		border: 2px solid rgba(0, 255, 127, 0.5);
		border-radius: 50%;
		color: rgba(0, 255, 127, 1);
		cursor: pointer;
		transition: all var(--transition-base);
		position: relative;
		overflow: hidden;
	}

	.play-button:hover {
		background: linear-gradient(135deg, rgba(0, 255, 127, 0.3), rgba(0, 139, 69, 0.4));
		border-color: rgba(0, 255, 127, 0.8);
		box-shadow: 0 0 20px rgba(0, 255, 127, 0.4);
		transform: scale(1.05);
	}

	.play-button.playing {
		background: linear-gradient(135deg, rgba(220, 20, 60, 0.2), rgba(139, 0, 0, 0.3));
		border-color: rgba(220, 20, 60, 0.5);
		color: rgba(255, 69, 96, 1);
	}

	.play-button.playing:hover {
		background: linear-gradient(135deg, rgba(220, 20, 60, 0.3), rgba(139, 0, 0, 0.4));
		border-color: rgba(220, 20, 60, 0.8);
		box-shadow: 0 0 20px rgba(220, 20, 60, 0.4);
	}

	.compact .play-button {
		width: 36px;
		height: 36px;
	}

	.progress-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.progress-bar {
		width: 100%;
		height: 32px;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: var(--space-sm) 0;
		display: flex;
		align-items: center;
	}

	.progress-track {
		position: relative;
		width: 100%;
		height: 6px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
		overflow: visible;
	}

	.progress-fill {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: linear-gradient(90deg, var(--color-cyber-magenta), var(--color-neon-cyan));
		border-radius: 3px;
		transition: width 0.1s linear;
		box-shadow: 0 0 10px rgba(217, 70, 239, 0.6);
	}

	.progress-handle {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 14px;
		height: 14px;
		background: var(--color-neon-cyan);
		border: 2px solid rgba(0, 0, 0, 0.3);
		border-radius: 50%;
		box-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
		transition: left 0.1s linear;
		opacity: 0;
	}

	.progress-bar:hover .progress-handle {
		opacity: 1;
	}

	.time-display {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-family: 'Courier New', monospace;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
		letter-spacing: 0.05em;
	}

	.current-time {
		color: var(--color-neon-cyan);
		text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
	}

	.separator {
		color: rgba(255, 255, 255, 0.4);
	}

	.audio-visualizer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		height: 32px;
		opacity: 0.6;
	}

	.wave-bar {
		width: 4px;
		height: 100%;
		background: linear-gradient(
			180deg,
			var(--color-neon-cyan),
			var(--color-cyber-magenta)
		);
		border-radius: 2px;
		animation: wave-animation 1s ease-in-out infinite;
	}

	.wave-bar:nth-child(1) {
		animation-delay: 0s;
	}
	.wave-bar:nth-child(2) {
		animation-delay: 0.1s;
	}
	.wave-bar:nth-child(3) {
		animation-delay: 0.2s;
	}
	.wave-bar:nth-child(4) {
		animation-delay: 0.3s;
	}
	.wave-bar:nth-child(5) {
		animation-delay: 0.4s;
	}

	@keyframes wave-animation {
		0%,
		100% {
			transform: scaleY(0.3);
		}
		50% {
			transform: scaleY(1);
		}
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.audio-player {
			padding: var(--space-md);
		}

		.play-button {
			width: 40px;
			height: 40px;
		}

		.time-display {
			font-size: 0.75rem;
		}
	}
</style>
