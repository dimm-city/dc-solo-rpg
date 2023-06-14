import { Difficulty } from "./DifficultyLevels.js";

/**
 * This class encapsulates the game options derived from a YAML configuration file.
 * It provides all the configurable option properties required by the game.
 */
export class GameOptions {
    /**
     * Create a GameOptions.
     * @param {Object} options - The options from the YAML configuration.
     */
    constructor(options) {
      /** 
       * @property {number} difficulty - The game's difficulty level. 
       */
      this.difficulty = options.difficulty ?? Difficulty.IMPOSSIBLE;
  
  
      /** 
       * @property {Object} dice - The selected dice theme. 
       * @property {string} dice.key - The key identifier of the dice.
       * @property {string} dice.name - The name of the dice.
       * @property {string} dice.category - The category of the dice.
       * @property {string} dice.foreground - The color of the foreground of the dice.
       * @property {Array} dice.background - The colors of the background of the dice.
       * @property {string} dice.outline - The color of the dice's outline.
       * @property {string} dice.texture - The texture of the dice.
       * @property {string} dice.description - The description of the dice.
       */
      this.dice = options.dice;
    }
  }
  