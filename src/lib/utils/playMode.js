/**
 * Play modes: three presets over the existing audio and gameplay settings.
 *
 * - Manual: nothing is read aloud and nothing happens on its own.
 * - Read aloud: the narrator reads cards, prompts and rolls; the player rolls and continues.
 * - Hands-free: read aloud, and the game also rolls and moves on by itself, pausing on a
 *   countdown at each journal prompt.
 *
 * Any other mix of settings (made under Advanced, or with the in-game AUTO and VOICE toggles)
 * is "custom": no mode is selected.
 */

export const PLAY_MODES = [
	{ id: 'manual', label: 'Manual', help: 'You read, roll and move on at your own pace.' },
	{
		id: 'read-aloud',
		label: 'Read aloud',
		help: 'The narrator reads each card, prompt and roll. You roll and move on.'
	},
	{
		id: 'hands-free',
		label: 'Hands-free',
		help: 'The narrator reads, and the game rolls and moves on by itself. Journal prompts wait on a countdown.'
	}
];

/** Every read-aloud switch on, or off (the in-game VOICE toggle writes these) */
export const READ_ALOUD_ON = {
	autoReadCards: true,
	autoReadPrompts: true,
	autoAnnounceRolls: true
};
export const READ_ALOUD_OFF = {
	autoReadCards: false,
	autoReadPrompts: false,
	autoAnnounceRolls: false
};

/** Auto-play on, or off (the in-game AUTO toggle writes these) */
export const AUTO_PLAY_ON = {
	autoRollDice: true,
	autoContinueAfterReading: true,
	autoAdvanceDelay: 2000,
	autoHandleJournaling: 'timed',
	journalPauseTime: 10000
};
export const AUTO_PLAY_OFF = {
	autoRollDice: false,
	autoContinueAfterReading: false,
	autoHandleJournaling: 'manual'
};

/** @param {{ autoReadCards?: boolean, autoReadPrompts?: boolean, autoAnnounceRolls?: boolean }} audio */
export function isReadAloudOn(audio) {
	return Boolean(audio?.autoReadCards || audio?.autoReadPrompts || audio?.autoAnnounceRolls);
}

/** @param {{ autoRollDice?: boolean, autoContinueAfterReading?: boolean, autoHandleJournaling?: string }} gameplay */
export function isAutoPlayOn(gameplay) {
	return Boolean(
		gameplay?.autoRollDice ||
			gameplay?.autoContinueAfterReading ||
			gameplay?.autoHandleJournaling === 'timed'
	);
}

/**
 * The settings a play mode writes
 * @param {'manual' | 'read-aloud' | 'hands-free'} mode
 * @returns {{ audio: object, gameplay: object }}
 */
export function playModeSettings(mode) {
	switch (mode) {
		case 'hands-free':
			return { audio: { ...READ_ALOUD_ON }, gameplay: { ...AUTO_PLAY_ON } };
		case 'read-aloud':
			return { audio: { ...READ_ALOUD_ON }, gameplay: { ...AUTO_PLAY_OFF } };
		case 'manual':
			return { audio: { ...READ_ALOUD_OFF }, gameplay: { ...AUTO_PLAY_OFF } };
		default:
			throw new Error(`Unknown play mode: ${mode}`);
	}
}

/**
 * Which play mode the current settings amount to, or null for a custom mix
 * @param {object} audio getAudioSettings()
 * @param {object} gameplay getGameplaySettings()
 * @returns {'manual' | 'read-aloud' | 'hands-free' | null}
 */
export function detectPlayMode(audio, gameplay) {
	const allRead = Boolean(
		audio?.autoReadCards && audio?.autoReadPrompts && audio?.autoAnnounceRolls
	);
	const anyRead = isReadAloudOn(audio);
	const auto = isAutoPlayOn(gameplay);

	if (!anyRead && !auto) return 'manual';
	if (allRead && !auto) return 'read-aloud';
	if (
		allRead &&
		gameplay.autoRollDice &&
		gameplay.autoContinueAfterReading &&
		gameplay.autoHandleJournaling !== 'manual'
	) {
		return 'hands-free';
	}
	return null;
}
