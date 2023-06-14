# Game Configuration Documentation

The game configuration is defined in a YAML file. This file contains several properties that can be used to customize the game.

## Configuration Properties

- `title`: The title of the game.
- `subtitle`: The subtitle of the game.
- `options`: The options for the game.
  - `difficulty`: The difficulty level of the game. A higher number represents a higher difficulty level.
  - `rollDuration`: The duration of the dice roll animation in milliseconds.
  - `dice`: The configuration for the dice.
    - `key`: The key for the dice set.
    - `name`: The name of the dice set.
    - `category`: The category of the dice set.
    - `foreground`: The color of the dice's numbers.
    - `background`: The colors of the dice's background. This can be a single color or an array of colors for a gradient effect.
    - `outline`: The color of the dice's outline.
    - `texture`: The texture of the dice.
    - `description`: The description of the dice set.
- `labels`: The labels for the game.
  - `failureCheckLoss`: The message displayed when the player fails a check.
  - `successCheckWin`: The message displayed when the player successfully completes a check.

## Example

Here is an example of a game configuration:

```yaml
title: Future Lost
subtitle: A Dimm City Campaign
options:
  difficulty: 0
  dice:
    key: null
    name: 'Pink Dreams'
    category: 'Custom Sets'
    foreground: 'white'
    background: ['#ff007c', '#df73ff', '#f400a1', '#df00ff', '#ff33cc']
    outline: '#570000'
    texture: 'glass'
    description: 'Pink Dreams, for Ethan'
labels:
  failureCheckLoss: 'The time machine has been damaged beyond repair'
  successCheckWin: 'You have managed to repair the time machine and are able to return home!'
```

In this example, the game is titled "Future Lost" and it is a part of the "Dimm City Campaign". The game has a difficulty level of 0, and the dice roll animation lasts for 3000 milliseconds. The dice set is called "Pink Dreams", and it has a white foreground, a gradient background, a red outline, and a glass texture. The game displays a specific message when the player fails or successfully completes a check.

## Game Labels Configuration

The game labels are also defined in the configuration YAML file. There are several properties that can be used to customize the text labels used throughout the game. 


## Example

Here is an example of a game labels configuration:

```yaml
introNextButtonText: "Next"
introBackButtonText: "Back"
introStartButtonText: "Start Game"
introExitButtonText: "Exit Game"
toolbarExitButtonText: "Exit"
journalEntryHeader: "Journal Entry"
journalEntrySubHeader: "Summary of events"
journalEntryNextButtonText: "Continue"
journalEntrySaveButtonText: "Record"
journalEntryRestartButtonText: "Restart"
journalEntryExitButtonText: "New Game"
rollForTasksHeader: "Roll for Tasks"
rollForTasksResultHeader: "Click to continue..."
drawCardButtonText: "Draw Card"
successCheckHeader: "Roll Success Check"
successCheckResultHeader: "Click to continue..."
failureCheckHeader: "Failure Check"
failureCheckLoss: "You have failed"
successCheckWin: "You have succeeded"
gameOverHeader: "Game Over"
gameOverButtonText: "Record Final Log"
statusDisplayRoundText: "Round: "
healthMeterHeader: "Health Meter"
healthMeterSvg: "[coming soon...]"
failureCounterHeader: "Failure Counters"
failureCounterSvg: "[coming soon...]"
```

In this example, the 'Next' button on the intro screen will display "Next", the 'Back' button will display "Back", and so on.
