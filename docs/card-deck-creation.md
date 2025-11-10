# Game Card Configuration Documentation

The game cards are defined in a CSV file. This file contains several properties that can be used to customize the cards used throughout the game.

## Configuration Properties

Below are the properties that can be defined in the CSV file:

- `card`: The card rank. This can be a number from 2 to 10, or a letter representing a face card (J for Jack, Q for Queen, K for King, A for Ace).
- `suite`: The card suit. This can be one of the four traditional playing card suits: hearts, diamonds, clubs, or spades.
- `action`: The action that occurs when this card is drawn. This is used to determine the game's response to the card being drawn.
- `description`: The description of the event that occurred in the game. This text will be used as the card text during game play.

## How to Fill Out the CSV

Each row in the CSV file represents a single card in the game. The first column is the card rank, the second column is the card suit, and the third column is the action associated with the card. The final column is the description of the event. This will be used as the card text in the game.

For example, the following row:

```
A,hearts,"primary-success","You find an important item that will help you..."
```

This represents an Ace of Hearts card, and when this card is drawn, a primary success action occurs in the game. This means the player is now eligible to roll for success at the end of each round.

## Example

Here is an example of a game card configuration:

```
card,suite,action,description
A,hearts,"primary-success","[Replace with a major success]"
A,diamonds,"success-bonus","[Replace with a major success]"
A,clubs,"success-bonus","[Replace with a major success]"
A,spades,"success-bonus","[Replace with a major success]"
K,hearts,"failure-token","[Replace with a major failure]"
K,diamonds,"failure-token","[Replace with a major failure]"
K,clubs,"failure-token","[Replace with a major failure]"
K,spades,"failure-token","[Replace with a major failure]"
Q,hearts,"failure-check","[Replace with minor failure]"
Q,diamonds,"failure-check","[Replace with minor failure]"
Q,clubs,"failure-check","[Replace with minor failure]"
Q,spades,"failure-check","[Replace with minor failure]"
J,hearts,"failure-check","[Replace with minor failure]"
J,diamonds,"failure-check","[Replace with minor failure]"
J,clubs,"failure-check","[Replace with minor failure]"
J,spades,"failure-check","[Replace with minor failure]"
2,hearts,"",""
3,hearts,"failure-check","[Replace with minor failure]"
4,hearts,"",""
5,hearts,"failure-check","[Replace with minor failure]"
6,hearts,"",""
7,hearts,"failure-check","[Replace with minor failure]"
8,hearts,"",""
9,hearts,"failure-check","[Replace with minor failure]"
10,hearts,"",""
2,diamonds,"",""
3,diamonds,"failure-check","[Replace with minor failure]"
4,diamonds,"",""
5,diamonds,"failure-check","[Replace with minor failure]"
6,diamonds,"",""
7,diamonds,"failure-check","[Replace with minor failure]"
8,diamonds,"",""
9,diamonds,"failure-check","[Replace with minor failure]"
10,diamonds,"",""
2,clubs,"",""
3,clubs,"failure-check","[Replace with minor failure]"
4,clubs,"",""
5,clubs,"failure-check","[Replace with minor failure]"
6,clubs,"",""
7,clubs,"failure-check","[Replace with minor failure]"
8,clubs,"",""
9,clubs,"failure-check","[Replace with minor failure]"
10,clubs,"",""
2,spades,"",""
3,spades,"failure-check","[Replace with minor failure]"
4,spades,"",""
5,spades,"failure-check","[Replace with minor failure]"
6,spades,"",""
7,spades,"failure-check","[Replace with minor failure]"
8,spades,"",""
9,spades,"failure-check","[Replace with minor failure]"
10,spades,"",""
```

In this example, the Ace of Hearts card will trigger a primary success action, the King of Hearts card will trigger a failure token action, and so on.
