<script>
	import NeuralDiceInterface from '$lib/components/NeuralDiceInterface.svelte';

	let diceInterface;
	let eventLog = [];
	let lastResult = null;

	function logEvent(message) {
		eventLog = [...eventLog, `${new Date().toLocaleTimeString()}: ${message}`];
		if (eventLog.length > 10) {
			eventLog = eventLog.slice(-10);
		}
	}

	function handleRollStart() {
		logEvent('Roll started');
	}

	function handleRollComplete(event) {
		lastResult = event.detail.result;
		logEvent(`Roll complete: ${event.detail.result}`);
	}

	function handleResultAcknowledged(event) {
		logEvent(`Result acknowledged: ${event.detail.result}`);
	}

	async function triggerRoll() {
		try {
			const result = await diceInterface.roll();
			logEvent(`Programmatic roll result: ${result}`);
		} catch (error) {
			logEvent(`Error: ${error.message}`);
		}
	}

	async function triggerForcedRoll(value) {
		try {
			const result = await diceInterface.roll(value);
			logEvent(`Forced roll to ${value}, got: ${result}`);
		} catch (error) {
			logEvent(`Error: ${error.message}`);
		}
	}
</script>

<svelte:head>
	<title>Neural Dice Interface Test</title>
</svelte:head>

<div class="test-page">
	<div class="test-header">
		<h1>Neural Dice Interface Test</h1>
		<p>Test the neural cyberpunk dice rolling interface</p>
	</div>

	<div class="test-container">
		<div class="dice-area">
			<NeuralDiceInterface
				bind:this={diceInterface}
				header="INITIATE PROBABILITY SCAN"
				on:rollstart={handleRollStart}
				on:rollcomplete={handleRollComplete}
				on:resultacknowledged={handleResultAcknowledged}
			/>
		</div>

		<div class="control-panel">
			<h2>Test Controls</h2>

			<div class="control-section">
				<h3>Programmatic Rolls</h3>
				<button on:click={triggerRoll} class="test-button">
					Trigger Roll
				</button>
			</div>

			<div class="control-section">
				<h3>Forced Results (Testing)</h3>
				<div class="button-group">
					{#each [1, 2, 3, 4, 5, 6] as value}
						<button on:click={() => triggerForcedRoll(value)} class="test-button small">
							Force {value}
						</button>
					{/each}
				</div>
			</div>

			<div class="control-section">
				<h3>Last Result</h3>
				<div class="result-display">
					{lastResult !== null ? lastResult : '—'}
				</div>
			</div>

			<div class="control-section">
				<h3>Event Log</h3>
				<div class="event-log">
					{#each eventLog as event}
						<div class="log-entry">{event}</div>
					{/each}
					{#if eventLog.length === 0}
						<div class="log-entry empty">No events yet</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.test-page {
		min-height: 100vh;
		background: #000;
		color: #fff;
		padding: 2rem;
	}

	.test-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.test-header h1 {
		font-family: var(--font-display, 'Orbitron', monospace);
		color: #00ffff;
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		text-shadow: 0 0 20px #00ffff;
	}

	.test-header p {
		color: rgba(255, 255, 255, 0.6);
		margin: 0;
	}

	.test-container {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.dice-area {
		background: #0a0a0a;
		border: 2px solid #00ffff;
		border-radius: 8px;
		min-height: 600px;
		overflow: hidden;
		box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
	}

	.control-panel {
		background: #0a0a0a;
		border: 2px solid #d946ef;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 0 30px rgba(217, 70, 239, 0.2);
	}

	.control-panel h2 {
		font-family: var(--font-display, 'Orbitron', monospace);
		color: #d946ef;
		font-size: 1.5rem;
		margin: 0 0 1.5rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.control-section {
		margin-bottom: 2rem;
	}

	.control-section h3 {
		font-family: var(--font-display, 'Orbitron', monospace);
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.875rem;
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.test-button {
		background: linear-gradient(135deg, #d946ef, #00ffff);
		border: none;
		border-radius: 4px;
		color: #fff;
		padding: 0.75rem 1.5rem;
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(217, 70, 239, 0.4);
		width: 100%;
	}

	.test-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 25px rgba(217, 70, 239, 0.6);
	}

	.test-button:active {
		transform: translateY(0);
	}

	.button-group {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.test-button.small {
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
	}

	.result-display {
		background: rgba(0, 255, 255, 0.1);
		border: 2px solid #00ffff;
		border-radius: 4px;
		padding: 1rem;
		text-align: center;
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: 3rem;
		font-weight: 700;
		color: #00ffff;
		text-shadow: 0 0 20px #00ffff;
	}

	.event-log {
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		padding: 0.75rem;
		max-height: 200px;
		overflow-y: auto;
		font-family: monospace;
		font-size: 0.75rem;
	}

	.log-entry {
		color: rgba(255, 255, 255, 0.7);
		padding: 0.25rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.log-entry:last-child {
		border-bottom: none;
	}

	.log-entry.empty {
		color: rgba(255, 255, 255, 0.4);
		font-style: italic;
	}

	@media (max-width: 1024px) {
		.test-container {
			grid-template-columns: 1fr;
		}

		.control-panel {
			order: -1;
		}
	}

	@media (max-width: 768px) {
		.test-page {
			padding: 1rem;
		}

		.test-header h1 {
			font-size: 2rem;
		}

		.dice-area {
			min-height: 500px;
		}
	}
</style>
