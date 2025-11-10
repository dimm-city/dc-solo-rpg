# Dimm City Solo RPG

Welcome to the Dimm City Solo RPG project! This project provides a highly interactive and immersive web component that allows users to play Dimm City Solo RPG games in their browser. The Dimm City RPG is a variation of the Wretched and Alone game system. More information about the original game see the [License Attribution](#license-attribution) below.

## Overview

The Dimm City Solo RPG is a narrative-driven, solo role-playing game that takes players on a thrilling adventure that changes each time they play. The game is designed to be played alone, with the game system guiding the player through the story, presenting challenges, and shaping the narrative based on the cards that are drawn and the roll of the dice.

Our Svelte based web component encapsulates the entire game, providing a rich, interactive UI that guides the player through the game, handles game logic, and maintains game state. This component can be easily integrated into any website, providing a seamless gaming experience for users.

The web component is also highly configurable, allowing for customization of game rules, narrative content, and visual appearance. This makes it a versatile tool for creating unique RPG experiences for each site, game, and player.

## Key Features

- **Solo RPG**: Designed for immersive, single-player RPG experiences.
- **Configurable**: Allows for extensive customization of game rules, narrative content, and visual appearance.
- **Selectable Dice Themes**: Designed for immersive, single-player RPG experiences.
- **Svelte-based**: Utilizes the power of Svelte for efficient, high-performance web components.

## Easy Game Creation

The game creation process for the DC Solo RPG system is designed to be easy for anyone. The three steps to create a game are:

1. Download the game templates
1. Modify the `config.yml` file that holds the game configuration, such as the title, subtitle, introduction, and more.
1. Modify the description of each card in the `deck.csv` file to provide the card text.
1. Modify the `theme.css` file to achieve the desired visual style, such as colors, fonts, and layout.

Read the full guide here: [How to build a game](./docs/how-to-build-a-game.md)

## Demo

Check out our [Demo Site](https://demo.dimm.city) to see some basic examples of game play.

## Developing

If you would like to run this project locally and make modifications to it, you can follow these steps to get started.

Once you've cloned this project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Everything inside `src/lib` is part of your library, everything inside `src/routes` can be used as a showcase or preview app.

To create a production version of your showcase app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Contributing

We will happily except feedback and pull requests are always welcome as well!

## License Attribution

This work is based on The Wretched (found at http://loottheroom.itch.io/wretched), product of Chris Bissette and Loot The Room, and licensed for our use under the Creative Commons Attribution 3.0 Unported license (http://creativecommons.org/licenses/by/3.0/).

### Please note

If you use the Dimm City RPG in your project, you will need to include attributions as well. It is important to us that we support other developers, artists, and creators. Please see our [LICENSE](LICENSE) file for more information about providing proper attribution. Thank you for supporting the OSS and gaming communities!
