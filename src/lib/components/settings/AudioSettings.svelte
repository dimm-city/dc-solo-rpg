<script>
	import {
		getAudioSettings,
		getGameplaySettings,
		updateAudioSettings,
		updateGameplaySettings
	} from '../../stores/audioStore.svelte.js';
	import TTSSection from './TTSSection.svelte';

	function handleAudioSettingChange(key, value) {
		updateAudioSettings({ [key]: value });
	}

	function handleGameplaySettingChange(key, value) {
		updateGameplaySettings({ [key]: value });
	}

	const seconds = (ms) => `${(ms / 1000).toFixed(1)}s`;
</script>

<TTSSection />

<section class="cm-section" aria-labelledby="read-aloud-heading">
	<h3 class="cm-section-title" id="read-aloud-heading">Read aloud</h3>
	<p class="cm-section-desc">Choose what the narrator speaks, and how fast.</p>
	<div class="cm-rows">
		<div class="cm-row cm-row-toggle">
			<div>
				<label class="cm-label" for="auto-read-cards">Read cards</label>
				<p class="cm-help" id="auto-read-cards-help">Read each card aloud when it is revealed.</p>
			</div>
			<input
				id="auto-read-cards"
				class="cm-switch"
				type="checkbox"
				role="switch"
				aria-describedby="auto-read-cards-help"
				checked={getAudioSettings().autoReadCards}
				onchange={(e) => handleAudioSettingChange('autoReadCards', e.target.checked)}
			/>
		</div>

		<div class="cm-row cm-row-toggle">
			<div>
				<label class="cm-label" for="auto-read-prompts">Read prompts</label>
				<p class="cm-help" id="auto-read-prompts-help">Read screen prompts and instructions.</p>
			</div>
			<input
				id="auto-read-prompts"
				class="cm-switch"
				type="checkbox"
				role="switch"
				aria-describedby="auto-read-prompts-help"
				checked={getAudioSettings().autoReadPrompts}
				onchange={(e) => handleAudioSettingChange('autoReadPrompts', e.target.checked)}
			/>
		</div>

		<div class="cm-row cm-row-toggle">
			<div>
				<label class="cm-label" for="auto-announce-rolls">Announce dice rolls</label>
				<p class="cm-help" id="auto-announce-rolls-help">Say each roll result out loud.</p>
			</div>
			<input
				id="auto-announce-rolls"
				class="cm-switch"
				type="checkbox"
				role="switch"
				aria-describedby="auto-announce-rolls-help"
				checked={getAudioSettings().autoAnnounceRolls}
				onchange={(e) => handleAudioSettingChange('autoAnnounceRolls', e.target.checked)}
			/>
		</div>

		<div class="cm-row">
			<label class="cm-label" for="reading-speed">Reading speed</label>
			<select
				id="reading-speed"
				class="cm-control"
				value={getAudioSettings().readingSpeed}
				onchange={(e) => handleAudioSettingChange('readingSpeed', e.target.value)}
			>
				<option value="slow">Slow</option>
				<option value="normal">Normal</option>
				<option value="fast">Fast</option>
			</select>
		</div>
	</div>
</section>

<section class="cm-section" aria-labelledby="auto-play-heading">
	<h3 class="cm-section-title" id="auto-play-heading">Auto-play</h3>
	<p class="cm-section-desc">Let the game roll and advance for you, hands free.</p>
	<div class="cm-rows">
		<div class="cm-row cm-row-toggle">
			<div>
				<label class="cm-label" for="auto-roll-dice">Auto-roll dice</label>
				<p class="cm-help" id="auto-roll-dice-help">Roll automatically when a roll is due.</p>
			</div>
			<input
				id="auto-roll-dice"
				class="cm-switch"
				type="checkbox"
				role="switch"
				aria-describedby="auto-roll-dice-help"
				checked={getGameplaySettings().autoRollDice}
				onchange={(e) => handleGameplaySettingChange('autoRollDice', e.target.checked)}
			/>
		</div>

		<div class="cm-row cm-row-toggle">
			<div>
				<label class="cm-label" for="auto-continue">Continue after reading</label>
				<p class="cm-help" id="auto-continue-help">Move on when the narration finishes.</p>
			</div>
			<input
				id="auto-continue"
				class="cm-switch"
				type="checkbox"
				role="switch"
				aria-describedby="auto-continue-help"
				checked={getGameplaySettings().autoContinueAfterReading}
				onchange={(e) => handleGameplaySettingChange('autoContinueAfterReading', e.target.checked)}
			/>
		</div>

		<div class="cm-row">
			<div>
				<label class="cm-label" for="auto-advance-delay">Advance delay</label>
				<p class="cm-help" id="auto-advance-delay-help">Pause before each automatic step.</p>
			</div>
			<div>
				<output class="cm-value" for="auto-advance-delay">
					{seconds(getGameplaySettings().autoAdvanceDelay)}
				</output>
				<input
					type="range"
					id="auto-advance-delay"
					class="cm-range"
					aria-describedby="auto-advance-delay-help"
					min="500"
					max="10000"
					step="500"
					value={getGameplaySettings().autoAdvanceDelay}
					oninput={(e) => handleGameplaySettingChange('autoAdvanceDelay', parseInt(e.target.value))}
				/>
				<div class="cm-range-ends"><span>0.5s</span><span>10s</span></div>
			</div>
		</div>

		<div class="cm-row">
			<div>
				<label class="cm-label" for="journal-handling">Journaling</label>
				<p class="cm-help" id="journal-handling-help">What happens at each journal prompt.</p>
			</div>
			<select
				id="journal-handling"
				class="cm-control"
				aria-describedby="journal-handling-help"
				value={getGameplaySettings().autoHandleJournaling}
				onchange={(e) => handleGameplaySettingChange('autoHandleJournaling', e.target.value)}
			>
				<option value="manual">Manual: you continue</option>
				<option value="skip">Skip: continue at once</option>
				<option value="timed">Timed: pause with countdown</option>
			</select>
		</div>

		{#if getGameplaySettings().autoHandleJournaling === 'timed'}
			<div class="cm-row">
				<div>
					<label class="cm-label" for="journal-pause-time">Journal pause</label>
					<p class="cm-help" id="journal-pause-time-help">How long the countdown runs.</p>
				</div>
				<div>
					<output class="cm-value" for="journal-pause-time">
						{seconds(getGameplaySettings().journalPauseTime)}
					</output>
					<input
						type="range"
						id="journal-pause-time"
						class="cm-range"
						aria-describedby="journal-pause-time-help"
						min="3000"
						max="30000"
						step="1000"
						value={getGameplaySettings().journalPauseTime}
						oninput={(e) =>
							handleGameplaySettingChange('journalPauseTime', parseInt(e.target.value))}
					/>
					<div class="cm-range-ends"><span>3s</span><span>30s</span></div>
				</div>
			</div>
		{/if}
	</div>
</section>
