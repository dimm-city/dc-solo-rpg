/**
 * This class encapsulates the game labels derived from a YAML configuration file.
 * It provides all the configurable label properties required by the game.
 */
export class GameLabels {
	/**
	 * Create a GameLabels.
	 * @param {Object} labels - The labels from the YAML configuration.
	 */
	constructor(labels) {
		//if (!labels) labels = {};

		/** @property {string} introNextButtonText - Text for the 'Next' button on the intro screen. */
		this.introNextButtonText = labels?.introNextButtonText ?? 'Next';

		/** @property {string} introBackButtonText - Text for the 'Back' button on the intro screen. */
		this.introBackButtonText = labels?.introBackButtonText ?? 'Back';

		/** @property {string} introStartButtonText - Text for the 'Start' button on the intro screen. */
		this.introStartButtonText = labels?.introStartButtonText ?? 'Start';

		/** @property {string} introExitButtonText - Text for the 'Exit' button on the intro screen. */
		this.introExitButtonText = labels?.introExitButtonText ?? 'Exit';

		/** @property {string} toolbarExitButtonText - Text for the 'Exit' button on the toolbar. */
		this.toolbarExitButtonText = labels?.toolbarExitButtonText ?? '&#10005;'; //'Exit';

		/** @property {string} journalEntryHeader - Header text for the journal entry section. */
		this.journalEntryHeader = labels?.journalEntryHeader ?? 'Record your journal entry';

		/** @property {string} journalEntrySubHeader - Sub-header text for the journal entry section. */
		this.journalEntrySubHeader = labels?.journalEntrySubHeader ?? 'Summary of events';

		/** @property {string} journalEntryNextButtonText - Text for the 'Continue' button in the journal entry section. */
		this.journalEntryNextButtonText = labels?.journalEntryNextButtonText ?? 'Continue';

		/** @property {string} journalEntrySaveButtonText - Text for the 'Record' button in the journal entry section. */
		this.journalEntrySaveButtonText = labels?.journalEntrySaveButtonText ?? 'Record';

		/** @property {string} journalEntryRestartButtonText - Text for the 'Restart' button in the journal entry section. */
		this.journalEntryRestartButtonText = labels?.journalEntryRestartButtonText ?? 'Restart';

		/** @property {string} journalEntryExitButtonText - Text for the 'New Game' button in the journal entry section. */
		this.journalEntryExitButtonText = labels?.journalEntryExitButtonText ?? 'New Game';

		/** @property {string} rollForTasksHeader - Header text for the roll for tasks section. */
		this.rollForTasksHeader = labels?.rollForTasksHeader ?? 'Generate Number';

		/** @property {string} rollForTasksResultHeader - Header text for the result of the roll for tasks section. */
		this.rollForTasksResultHeader = labels?.rollForTasksResultHeader ?? 'Click to continue';

		/** @property {string} drawCardButtonText - Text for the 'Draw Card' button. */
		this.drawCardButtonText = labels?.drawCardButtonText ?? 'Draw Card';

		/** @property {string} successCheckHeader - Header text for the success check section. */
		this.successCheckHeader = labels?.successCheckHeader ?? 'Roll success check';

		/** @property {string} successCheckResultHeader - Header text for the result of the success check section. */
		this.successCheckResultHeader = labels?.successCheckResultHeader ?? 'Click to continue';

		/** @property {string} failureCheckHeader - Header text for the failure check section. */
		this.failureCheckHeader = labels?.failureCheckHeader ?? 'Roll failure check';

		/** @property {string} failureCheckLoss - Text for the failure message when your health meter drops to 0 */
		this.failureCheckLoss = labels?.failureCheckLoss ?? 'You have failed to complete your quest.';

		/** @property {string} failureCounterLoss - Text for the failure message when all kings are drawn. */
		this.failureCounterLoss =
			labels?.failureCounterLoss ?? 'You have failed suffer a catastrophic failure.';

		/** @property {string} successCheckWin - Text for the win message. */
		this.successCheckWin =
			labels?.successCheckWin ?? 'Congratulations! You have succeeded in your quest!';

		/** @property {string} gameOverHeader - Header text for the game over section. */
		this.gameOverHeader = labels?.gameOverHeader ?? 'Game Over';

		/** @property {string} gameOverButtonText - Text for the 'Record your final log' button on the game over screen. */
		this.gameOverButtonText = labels?.gameOverButtonText ?? 'Record your final log';

		/** @property {string} statusDisplayRoundText - Text for the 'Round' display in the status section. */
		this.statusDisplayRoundText = labels?.statusDisplayRoundText ?? 'Round: ';

		/** @property {string} healthMeterHeader - Header text for the health meter. */
		this.healthMeterHeader = labels?.healthMeterHeader ?? 'Health Meter';

		/** @property {string} healthMeterSvg - SVG for the health meter. */
		this.healthMeterSvg = labels?.healthMeterSvg ?? null;

		/** @property {string} failureCounterHeader - Header text for the failure counter. */
		this.failureCounterHeader = labels?.failureCounterHeader ?? 'Failure Counter';

		/** @property {string} failureCounterSvg - SVG for the failure counter. */
		this.failureCounterSvg = labels?.failureCounterSvg ?? null;
	}
}
