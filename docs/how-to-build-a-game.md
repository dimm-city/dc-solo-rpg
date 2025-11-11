# Creating Your First Game

In this tutorial, we will guide you through the process of creating a new game for the Dimm City Solo RPG system. This tutorial is intended for tabletop role-playing game (TTRPG) players, game creators, and authors. It is meant to be as non-technical as possible, but it will help to have a basic understanding of editing text files (specifically in YAML format) and managing information in a spreadsheet (which is saved in CSV format).

The styling section of the game does require using CSS to create the theme for your game. However, before you run off to watch a tutorial, read through the section. You will be surprised at how easy it is!

We will cover the following topics:

1. Game Configuration: How to define the unique context for your game.
2. Card Deck Creation: How to create the card deck used in your game.
3. Styling the Game: How to customize the visual style of your game.

At the end of this tutorial, you will have modified three files that make up your game. Each file will relate to one of these topics. We will update each of them as we walk through each section.

Let's get started!

## Download the Templates

The easiest way to get started is to download the templates and extract it to a folder on your computer. [Click here](templates.zip) to download the templates. Once that has completed, extract all of the files to a folder that is specific to your game. We recommend creating a folder that matches the title of your game in this format: `my-game-title`. This folder can be anywhere, and can be named anything as long as it contains only letters, numbers, and hyphens (-). This will help in the final step [Packaging the Game](#packaging-the-game).

Now that you have the templates downloaded, you can move on to adjusting the configuration for the game.

## Game Configuration

The game configuration in the DC Solo RPG system is defined in a YAML file. YAML can be thought of as a way to organize information using a simple and readable format. It uses indentation and spacing to define the structure of the data, making it easy to understand and write.

This file contains several properties that can be used to customize the game. Here are the most common configuration properties that can be defined:

- `title`: The title of the game.
- `subtitle`: The subtitle of the game.
- `introduction`: The content that is display when a user starts the game.
- `labels`: The labels for the game.
  - `failureCheckLoss`: The message displayed when the player fails a check.
  - `successCheckWin`: The message displayed when the player successfully completes a check.

This is what that would look like in a YAML file:

```yaml
title: Simple Example Game
subtitle: A game used for demo purposes
introduction: |
  # The Simple Example

  ## Who

  You are a person playing a game...

  ## What

  The game revolves around you playing games...

labels:
  failureCheckLoss: 'You have lost the game'
  successCheckWin: 'You have won the game!'
```

Don't worry, you will not need to understand all of the details of YAML formatting to create your game. We have provided some resources to get you started. The next section will walk you through how to update the configuration file for your game.

### Updating the configuration file

Every DC Solo RPG game consists of a group of files contained in a folder. So the first step to creating a game is to create a new folder on your computer to hold your game files if you haven't already.

Once you have your game folder created, and the templates extracted, you can open the `config.yml` file using a text editor of your choice (e.g., Notepad, Sublime Text, Visual Studio Code) and make any necessary edits to the configuration.

We recommend spending time and effort defining the introduction and adjust labels along with updating the title(s) of the game. To see what other configuration options are available see the [full template](/templates/full-config.yml) which includes all currently supported configuration options. More information can be found in the [Game Configuration](game-configuration.md) document.

After making the desired changes, save the file.

## Card Deck

The game cards in the DC Solo RPG system are defined in a CSV file. This file contains several properties that can be used to customize the cards used throughout the game.

Here are the properties that can be defined in the CSV file:

- `card`: The card rank. This can be a number from 2 to 10, or a letter representing a face card (J for Jack, Q for Queen, K for King, A for Ace).
- `suite`: The card suit. This can be one of the four traditional playing card suits: hearts, diamonds, clubs, or spades.
- `action`: The action that occurs when this card is drawn. This is used to determine the game's response to the card being drawn.
- `description`: The description of the event that occurred in the game. This text will be used as the card text during gameplay.

To fill out the CSV file, each row represents a single card in the game. The first column is the card rank, the second column is the card suit, and the third column is the action associated with the card. The final column is the description of the event, which will be used as the card text in the game.

For example, the following row represents an Ace of Hearts card:

```
A,hearts,"primary-success","You find an important item that will help you..."
```

This card triggers a primary success action in the game, allowing the player to roll for success at the end of each round.

### Card Actions

Card actions are currently controlled by the game engine and cannot be configured via the deck.csv. However, we have included the column for future use. This will allow creators to further customize the game by adjusting actual gameplay.

For now, leave this column set to the default value to ensure your game continues to work in the future. More information on these options will be include once that feature is ready.

### Creating the deck

Now that you have you are familiar with how a card deck is built, you can proceed to create the card deck for your game. The DC Solo RPG system provides a `deck.csv` file that you can use as a template to help you get started.

Here is an example deck CSV file: [deck.csv](templates/deck.csv)

To create your own card decks, follow these steps:

1. Open the `deck.csv` file in a text editor or spreadsheet program.
2. Replace the existing card description with an event that is relevant to your game.
3. Save the modified CSV file into the same folder as your configuration file.

## Styling the Game

To customize the visual style of your game in the DC Solo RPG system, you can modify the game's stylesheet. We have provided an example theme CSS file that you can use as a starting point.

Here is an example theme CSS file: [theme.css](templates/theme.css)

To style your game, follow these steps:

1. Open the `theme.css` file in a text editor.
2. Modify the CSS rules to achieve the desired visual style for your game.
3. Save the modified CSS file into the same folder as your configuration file.

You can customize various aspects of the game's appearance, such as colors, fonts, and layout, by modifying the CSS rules in the theme file. You can refer to the style guide for more information.

(Source: [Style Guide](style-guide.md))

## Packaging the Game

To package your game to be loaded into the DC Solo RPG system, you can simply zip the files in your game folder into a zip file.

## Wrapping Up

That's it! You have now learned how to build a new game for the DC Solo RPG system. Remember to use the provided resources and examples as references, and feel free to experiment and customize to create unique and exciting games.

Happy game creation!
