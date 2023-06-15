# Creating Your First Game

In this tutorial, we will guide you through the process of creating a new game for the Dimm City Solo RPG system. This tutorial is intended for tabletop role-playing game (TTRPG) players, game creators, and authors. It is meant to be as non-technical as possible, but it will help to have a basic understanding of editing text files (specifically in YAML format) and managing information in a spreadsheet (which is saved in CSV format).

The styling section of the game does require using CSS to create the theme for your game. However, before you run off to watch a tutorial, read through the section. You will be surprised at how easy it is!

We will cover the following topics:

1. Game Configuration: How to define the unique context for your game.
2. Card Deck Creation: How to create the card deck used in your game.
3. Styling the Game: How to customize the visual style of your game.

At the end of this tutorial, you will have created three files that make up your game. Each file will relate to one of these topics. So we will create them as we walk through each section.

Let's get started!

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

Don't worry, you will not need to understand all of the details of YAML formatting to create your game. We have provided some resources to get you started. The next section will walk you through how to create the configuration file by starting with one of our templates.

### Creating the configuration file

Every DC Solo RPG game consists of a group of files contained in a folder. So the first step to creating a game is to create a new folder on your computer to hold your game files. This folder can be anywhere, and can be named anything as long as it contains only letters, numbers, and hyphens (-).

Once you have your game folder created, follow these steps to create the configuration file.

1. Go to the example YAML file located at [this link](templates/config.yml).
2. Right-click on the page and select "Save As" or "Save Page As" to download the YAML file to your computer.
3. Choose the folder on your computer that your created for your game and click "Save".

Once you have downloaded the YAML file, you can open it using a text editor of your choice (e.g., Notepad, Sublime Text, Visual Studio Code) and make any necessary edits to the configuration.

To see what other configuration options are available see the [full template](/templates/full-config.yml) which includes all currently supported configuration options.

After making the desired changes, save the file. You can then use the updated YAML file in your game or application.


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

Now that you have you are familiar with how a card deck is built, you can proceed to create the card deck for your game. The DC Solo RPG system provides an example deck CSV file that you can use as a template to help you get started.

Here is an example deck CSV file: [deck.csv](https://raw.githubusercontent.com/dimm-city/dc-solo-rpg/main/docs/templates/deck.csv)

To create your own card decks, follow these steps:

1. Open the example deck CSV file in a text editor or spreadsheet program.
2. Replace the existing card entries with your own cards, following the format specified in the file.
3. Save the modified CSV file into the same folder as your configuration file.

Now your game folder should contain two files:
- `config.yml`
- `deck.csv`

## Styling the Game

To customize the visual style of your game in the DC Solo RPG system, you can modify the game's stylesheet. We have provided an example theme CSS file that you can use as a starting point.

Here is an example theme CSS file: [theme.css](https://raw.githubusercontent.com/dimm-city/dc-solo-rpg/main/docs/templates/theme.css)

To style your game, follow these steps:

1. Open the example theme CSS file in a text editor.
2. Modify the CSS rules to achieve the desired visual style for your game.
3. Save the modified CSS file into the same folder as your configuration file.

You can customize various aspects of the game's appearance, such as colors, fonts, and layout, by modifying the CSS rules in the theme file. You can refer to the style guide for more information.

(Source: [Style Guide](https://raw.githubusercontent.com/dimm-city/dc-solo-rpg/main/docs/style-guide.md))


## Packaging the Game

To package your game to be loaded into the DC Solo RPG system, you can simply zip the files in your game folder into a zip file.

## Wrapping Up

That's it! You have now learned how to build a new game for the DC Solo RPG system. Remember to use the provided resources and examples as references, and feel free to experiment and customize to create unique and exciting games.

Happy game creation!

