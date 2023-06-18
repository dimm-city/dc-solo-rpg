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
      if(!labels) return;
      
      /** @property {string} introNextButtonText - Text for the 'Next' button on the intro screen. */
      this.introNextButtonText = labels.introNextButtonText;
  
      /** @property {string} introBackButtonText - Text for the 'Back' button on the intro screen. */
      this.introBackButtonText = labels.introBackButtonText;
  
      /** @property {string} introStartButtonText - Text for the 'Start' button on the intro screen. */
      this.introStartButtonText = labels.introStartButtonText;
  
      /** @property {string} introExitButtonText - Text for the 'Exit' button on the intro screen. */
      this.introExitButtonText = labels.introExitButtonText;
  
      /** @property {string} toolbarExitButtonText - Text for the 'Exit' button on the toolbar. */
      this.toolbarExitButtonText = labels.toolbarExitButtonText;
  
      /** @property {string} journalEntryHeader - Header text for the journal entry section. */
      this.journalEntryHeader = labels.journalEntryHeader;
  
      /** @property {string} journalEntrySubHeader - Sub-header text for the journal entry section. */
      this.journalEntrySubHeader = labels.journalEntrySubHeader;
  
      /** @property {string} journalEntryNextButtonText - Text for the 'Continue' button in the journal entry section. */
      this.journalEntryNextButtonText = labels.journalEntryNextButtonText;
  
      /** @property {string} journalEntrySaveButtonText - Text for the 'Record' button in the journal entry section. */
      this.journalEntrySaveButtonText = labels.journalEntrySaveButtonText;
  
      /** @property {string} journalEntryRestartButtonText - Text for the 'Restart' button in the journal entry section. */
      this.journalEntryRestartButtonText = labels.journalEntryRestartButtonText;
  
      /** @property {string} journalEntryExitButtonText - Text for the 'New Game' button in the journal entry section. */
      this.journalEntryExitButtonText = labels.journalEntryExitButtonText;
  
      /** @property {string} rollForTasksHeader - Header text for the roll for tasks section. */
      this.rollForTasksHeader = labels.rollForTasksHeader;
  
      /** @property {string} rollForTasksResultHeader - Header text for the result of the roll for tasks section. */
      this.rollForTasksResultHeader = labels.rollForTasksResultHeader;
  
      /** @property {string} drawCardButtonText - Text for the 'Draw Card' button. */
      this.drawCardButtonText = labels.drawCardButtonText;
  
      /** @property {string} successCheckHeader - Header text for the success check section. */
      this.successCheckHeader = labels.successCheckHeader;
  
      /** @property {string} successCheckResultHeader - Header text for the result of the success check section. */
      this.successCheckResultHeader = labels.successCheckResultHeader;
  
      /** @property {string} failureCheckHeader - Header text for the failure check section. */
      this.failureCheckHeader = labels.failureCheckHeader;
  
      /** @property {string} failureCheckLoss - Text for the failure message. */
      this.failureCheckLoss = labels.failureCheckLoss;
  
      /** @property {string} successCheckWin - Text for the win message. */
      this.successCheckWin = labels.successCheckWin;
  
      /** @property {string} gameOverHeader - Header text for the game over section. */
      this.gameOverHeader = labels.gameOverHeader;
  
      /** @property {string} gameOverButtonText - Text for the 'Record your final log' button on the game over screen. */
      this.gameOverButtonText = labels.gameOverButtonText;
  
      /** @property {string} statusDisplayRoundText - Text for the 'Round' display in the status section. */
      this.statusDisplayRoundText = labels.statusDisplayRoundText;
  
      /** @property {string} healthMeterHeader - Header text for the health meter. */
      this.healthMeterHeader = labels.healthMeterHeader;
  
      /** @property {string} healthMeterSvg - SVG for the health meter. */
      this.healthMeterSvg = labels.healthMeterSvg;
  
      /** @property {string} failureCounterHeader - Header text for the failure counter. */
      this.failureCounterHeader = labels.failureCounterHeader;
  
      /** @property {string} failureCounterSvg - SVG for the failure counter. */
      this.failureCounterSvg = labels.failureCounterSvg;
    }
  }
  