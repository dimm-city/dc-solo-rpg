/**
 * What to tell the player when recording a voice note cannot start, from the
 * getUserMedia() error (NV-07): each cause gets its own line.
 * @param {unknown} error
 * @returns {string}
 */
export function micErrorMessage(error) {
	const name = /** @type {{ name?: string } | null} */ (error)?.name;
	if (name === 'NotAllowedError' || name === 'SecurityError') {
		return 'The microphone is blocked. Allow it in your browser to record.';
	}
	if (name === 'NotFoundError' || name === 'OverconstrainedError') {
		return 'No microphone found. Connect one to record.';
	}
	return "Couldn't start recording. Try again, or write your entry instead.";
}
