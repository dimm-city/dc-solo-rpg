# Game Engine Documentation

This game engine is built using Svelte and JavaScript, and it provides a flexible and customizable framework for building card-based games. The game engine's state is managed using Svelte's store, and it uses a state machine to manage the game's flow.

## Game State

The game's state is stored in a Svelte store, `gameStore`, and it includes the following properties:

- `player`: The current player.
- `deck`: The deck of cards.
- `tokens`: The number of tokens on the Ace of Hearts.
- `kingsRevealed`: The number of Kings revealed.
- `aceOfHeartsRevealed`: A boolean indicating if the Ace of Hearts has been revealed.
- `gameOver`: A boolean indicating if the game is over.
- `win`: A boolean indicating if the player has won.
- `tower`: The number of blocks in the tower.
- `bonus`: The number of bonus points.
- `log`: A log of drawn cards.
- `journalEntries`: A list of journal entries.
- `round`: The current round.
- `state`: The current state of the game.
- `status`: A status message for the player.
- `cardsToDraw`: The number of cards to draw.
- `currentCard`: The current card that was drawn.
- `diceRoll`: The result of the dice roll.

## Game Configuration

The game configuration is loaded from a YAML file and a CSV file. The YAML file contains the game's configuration, and the CSV file contains the deck of cards. The game configuration is stored in `gameConfig`. Please review [Game Configuration](game-configuration.md) for more information.

## Game Actions

The game engine provides several actions that can be used to interact with the game:

- `loadSystemConfig(systemConfig)`: Loads the system configuration.
- `loadGame(config, player)`: Loads the game configuration and starts the game.
- `startGame(player, options)`: Starts the game with the specified player and options.
- `startRound()`: Starts a new round.
- `rollForTasks(result)`: Rolls for tasks.
- `confirmTaskRoll()`: Confirms the task roll.
- `drawCard()`: Draws a card.
- `confirmCard()`: Confirms the drawn card.
- `failureCheck(result)`: Checks for failure.
- `confirmFailureCheck()`: Confirms the failure check.
- `recordRound(journalEntry)`: Records the round.
- `successCheck(roll)`: Checks for success.
- `restartGame()`: Restarts the game.
- `exitGame()`: Exits the game.

## State Machine

The game's flow is managed using a state machine. The state machine's states are defined in `WAAStateMachine.js`, and they include the following states:

- `loadGame`: The initial state of the game.
- `options`: The options screen.
- `intro`: The introduction screen.
- `rollForTasks`: The state where the player rolls for tasks.
- `drawCard`: The state where the player draws a card.
- `failureCheck`: The state where the game checks for failure.
- `log`: The state where the game logs the round.
- `successCheck`: The state where the game checks for success.
- `gameOver`: The state where the game is over.

The state machine's transitions are defined in `transitions`, and they determine the next state based on the current state and the action taken by the player.