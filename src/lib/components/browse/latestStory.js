/**
 * The story a finished game's "Read your story" opens (/?story=latest): the newest completed
 * run in the Story Library, by the date the library sorts on (lastPlayed, else savedAt).
 */

/** @returns {boolean} whether a save is a finished run (won or lost), as the library lists */
export function isCompletedStory(save) {
	return save?.isWon === true || save?.isWon === false;
}

/**
 * @param {object[]} saves - every save, as loadAllSaves() returns them
 * @returns {object | null} the newest completed save, or null when there is none
 */
export function latestCompletedStory(saves = []) {
	let latest = null;
	let latestAt = -Infinity;
	for (const save of saves) {
		if (!isCompletedStory(save)) continue;
		const at = Date.parse(save.lastPlayed || save.savedAt || '') || 0;
		if (latest === null || at > latestAt) {
			latest = save;
			latestAt = at;
		}
	}
	return latest;
}
