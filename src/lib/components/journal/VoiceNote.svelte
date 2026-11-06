<script>
	/**
	 * VoiceNote - the journal's optional voice note, on the sheet's footer row.
	 *
	 * One control that changes in place: "Voice note" (mic) -> "● 0:07 · Stop" while recording
	 * -> "▶ 0:07" plus "Delete" once recorded. Nothing is added to the sheet's scroll area.
	 * On phones the idle control is a 44px mic icon button.
	 *
	 * @component
	 */
	import { onMount } from 'svelte';
	import { logger } from '../../utils/logger.js';

	let {
		/** The recording as a data URL, saved with the entry */
		audioData = $bindable(null),
		disabled = false,
		/** Called when recording starts (the journal cancels its auto-continue timer) */
		onstart = () => {}
	} = $props();

	let mediaRecorder = null;
	let stream = null;
	let chunks = [];
	let tickTimer = null;
	let audioElement = null;

	let isRecording = $state(false);
	let seconds = $state(0);
	let audioURL = $state(null);
	let isPlaying = $state(false);
	let error = $state('');

	/** "0:07" */
	function formatDuration(total) {
		const s = Math.max(0, Math.floor(total));
		return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
	}

	async function start() {
		onstart();
		error = '';
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			let mimeType = MediaRecorder.isTypeSupported?.('audio/webm') ? 'audio/webm' : 'audio/mp4';
			if (!MediaRecorder.isTypeSupported?.(mimeType)) mimeType = '';
			mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
			chunks = [];
			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) chunks.push(event.data);
			};
			mediaRecorder.onstop = () => {
				const blob = new Blob(chunks, { type: mediaRecorder?.mimeType || 'audio/webm' });
				audioURL = URL.createObjectURL(blob);
				const reader = new FileReader();
				reader.onloadend = () => (audioData = reader.result);
				reader.readAsDataURL(blob);
				releaseStream();
			};
			mediaRecorder.start();
			isRecording = true;
			seconds = 0;
			tickTimer = setInterval(() => seconds++, 1000);
		} catch (err) {
			logger.error('[VoiceNote] Could not start recording:', err);
			releaseStream();
			error = 'The microphone is blocked. Allow it in your browser to record.';
		}
	}

	/** Stop recording (also used when the entry is saved mid-recording) */
	export function stop() {
		if (!isRecording) return;
		isRecording = false;
		clearInterval(tickTimer);
		tickTimer = null;
		mediaRecorder?.stop();
	}

	function releaseStream() {
		stream?.getTracks().forEach((track) => track.stop());
		stream = null;
	}

	function togglePlay() {
		if (!audioURL) return;
		if (isPlaying) {
			audioElement?.pause();
			if (audioElement) audioElement.currentTime = 0;
			isPlaying = false;
			return;
		}
		audioElement ??= new Audio(audioURL);
		audioElement.onended = () => (isPlaying = false);
		audioElement.play();
		isPlaying = true;
	}

	function remove() {
		audioElement?.pause();
		audioElement = null;
		if (audioURL) URL.revokeObjectURL(audioURL);
		audioURL = null;
		audioData = null;
		isPlaying = false;
		seconds = 0;
	}

	onMount(() => () => {
		clearInterval(tickTimer);
		audioElement?.pause();
		if (audioURL) URL.revokeObjectURL(audioURL);
		if (isRecording) {
			mediaRecorder.onstop = null;
			mediaRecorder?.stop();
		}
		releaseStream();
	});
</script>

<div class="voice-note" data-testid="voice-note">
	{#if isRecording}
		<button
			type="button"
			class="vn-btn recording"
			onclick={stop}
			aria-label="Stop recording, {formatDuration(seconds)}"
			data-testid="voice-stop"
		>
			<span class="dot" aria-hidden="true"></span>
			<span class="time">{formatDuration(seconds)}</span>
			<span class="sep" aria-hidden="true">·</span>
			<span>Stop</span>
		</button>
	{:else if audioURL}
		<button
			type="button"
			class="vn-btn"
			onclick={togglePlay}
			aria-label="{isPlaying ? 'Stop playing' : 'Play'} voice note, {formatDuration(seconds)}"
			data-testid="voice-play"
		>
			<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
				{#if isPlaying}
					<rect x="6" y="6" width="12" height="12" />
				{:else}
					<path d="M8 5v14l11-7z" />
				{/if}
			</svg>
			<span class="time">{formatDuration(seconds)}</span>
		</button>
		{#if !disabled}
			<button
				type="button"
				class="vn-btn quiet"
				onclick={remove}
				aria-label="Delete voice note"
				data-testid="voice-delete"
			>
				<svg class="phone-only" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
					<path
						d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<span class="wide-only">Delete</span>
			</button>
		{/if}
	{:else}
		<button
			type="button"
			class="vn-btn"
			onclick={start}
			{disabled}
			aria-label="Record a voice note"
			data-testid="journal-voice-toggle"
		>
			<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
				<rect
					x="9"
					y="2"
					width="6"
					height="12"
					rx="3"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				/>
				<path
					d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
			<span class="wide-only">Voice note</span>
		</button>
	{/if}

	{#if error}
		<p class="vn-error" role="alert">{error}</p>
	{/if}
</div>

<style>
	.voice-note {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--space-xs, 0.25rem);
	}

	.vn-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm, 0.5rem);
		min-width: 44px;
		min-height: 44px;
		padding: 0 var(--space-md, 1rem);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.88);
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.35);
		border-radius: 4px;
		cursor: pointer;
		transition:
			color 120ms ease-out,
			border-color 120ms ease-out;
	}

	.vn-btn svg {
		flex: none;
		fill: currentColor;
	}

	.vn-btn:hover:not(:disabled),
	.vn-btn:focus-visible {
		color: var(--color-neon-cyan, #0ff);
		border-color: var(--color-neon-cyan, #0ff);
	}

	.vn-btn:focus-visible {
		outline: 2px solid var(--color-neon-cyan, #0ff);
		outline-offset: 2px;
	}

	.vn-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.vn-btn.quiet {
		border-color: transparent;
		color: rgba(255, 255, 255, 0.7);
	}

	.vn-btn.recording,
	.vn-btn.recording:hover {
		color: #ff8fa3;
		border-color: var(--color-danger, #ff4d6d);
	}

	.time {
		font-variant-numeric: tabular-nums;
	}

	.sep {
		opacity: 0.6;
	}

	/* Recording dot: two pulses, then steady */
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--color-danger, #ff4d6d);
		animation: rec-pulse 1s ease-in-out 2;
	}

	@keyframes rec-pulse {
		50% {
			opacity: 0.35;
		}
	}

	.vn-error {
		position: absolute;
		left: 0;
		bottom: calc(100% + var(--space-xs, 0.25rem));
		width: max-content;
		max-width: min(80vw, 28rem);
		margin: 0;
		padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.8125rem;
		color: #ff8fa3;
		background: rgba(40, 6, 14, 0.95);
		border: 1px solid var(--color-danger, #ff4d6d);
	}

	.phone-only {
		display: none;
	}

	/* Phones: the idle control is a 44px icon; Delete becomes a trash icon */
	@media (max-width: 600px) {
		.wide-only {
			display: none;
		}

		.phone-only {
			display: block;
		}

		.vn-btn {
			padding: 0 var(--space-sm, 0.5rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dot {
			animation: none;
		}

		.vn-btn {
			transition: none;
		}
	}
</style>
