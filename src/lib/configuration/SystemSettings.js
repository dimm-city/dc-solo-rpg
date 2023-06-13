/**
 * This class encapsulates the system settings for the game.
 * It includes properties like dice themes and available games.
 * @exports
 */
export class SystemSettings {
    /**
     * Create a SystemSettings.
     * @param {Array} diceThemes - The list of available dice themes.
     * @param {Array} availableGames - The list of available games.
     */
    constructor(diceThemes = [], availableGames = []) {
      /** @property {Array} diceThemes - The available dice themes in the system. */
      this.diceThemes = diceThemes;
  
      /** @property {Array} availableGames - The available games in the system. */
      this.availableGames = availableGames;
    }
  }
  