# Dimm City Solo RPG

Welcome to the Dimm City Solo RPG project! This project provides a highly interactive and immersive web component that allows users to play Dimm City Solo RPG games in their browser. The Dimm City RPG is a variation of the Wretched and Alone game system. More information about the original game see the [License Attribution](#license-attribution) below.

## Overview

The Dimm City Solo RPG is a narrative-driven, solo role-playing game that takes players on a thrilling adventure that changes each time they play. The game uses a **D20 system** with tactical depth, featuring Stability checks, Lucid/Surreal states (advantage/disadvantage), and a progressive Salvation mechanic for victory. The game is designed to be played alone, with the game system guiding the player through the story, presenting challenges, and shaping the narrative based on the cards that are drawn and the roll of the dice.

Our Svelte based web component encapsulates the entire game, providing a rich, interactive UI that guides the player through the game, handles game logic, and maintains game state. This component can be easily integrated into any website, providing a seamless gaming experience for users.

The web component is also highly configurable, allowing for customization of game rules, narrative content, and visual appearance. This makes it a versatile tool for creating unique RPG experiences for each site, game, and player.

### D20 Mechanics

- **Stability**: 20 points (your life). Failed checks cost Stability equal to the card rank.
- **Tokens**: Start with 10. Remove all to win through Salvation checks.
- **Aces Revealed**: Collect Aces to improve Salvation success rate (20% → 35% → 50% → 100%).
- **Lucid State**: Natural 20 grants advantage on next roll.
- **Surreal State**: Natural 1 imposes disadvantage on next roll.
- **Graduated Token Changes**: Critical successes (-2), successes (-1), failures (+1), critical failures (+2).

For complete mechanics documentation, see [D20 Mechanics Guide](./docs/d20-mechanics-guide.md).

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

## Requirements

- **Node.js**: Version 20 or higher is required
- **npm**: Version 10 or higher (comes with Node.js 20+)

> **Note**: If you're using [nvm](https://github.com/nvm-sh/nvm), simply run `nvm use` in the project directory to switch to the correct Node version.

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

## Authentication Setup

This application requires Google OAuth authentication for users to access games. Follow these steps to set up authentication:

### 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google People API)
4. Go to "Credentials" and click "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen if you haven't already
6. Choose "Web application" as the application type
7. Add authorized redirect URIs:
   - For development: `http://localhost:5173/auth/callback/google`
   - For production: `https://your-production-domain.com/auth/callback/google`
8. Click "Create" and copy the Client ID and Client Secret

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   AUTH_SECRET=generate_random_secret_here
   ```

3. Generate a secure random secret for `AUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

### 3. Restart the Development Server

After setting up your `.env` file, restart the development server:

```bash
npm run dev
```

Now when you visit the app, you'll be prompted to sign in with Google before accessing any games.

### Production Deployment

When deploying to production:

1. Set the environment variables in your hosting platform's configuration
2. Update the authorized redirect URIs in Google Cloud Console to include your production domain
3. Ensure `AUTH_SECRET` is different from your development secret
4. Set `trustHost: true` is configured in `src/auth.js` (already done)

## Contributing

We will happily except feedback and pull requests are always welcome as well!

## License Attribution

This work is based on The Wretched (found at http://loottheroom.itch.io/wretched), product of Chris Bissette and Loot The Room, and licensed for our use under the Creative Commons Attribution 3.0 Unported license (http://creativecommons.org/licenses/by/3.0/).

### Please note

If you use the Dimm City RPG in your project, you will need to include attributions as well. It is important to us that we support other developers, artists, and creators. Please see our [LICENSE](LICENSE) file for more information about providing proper attribution. Thank you for supporting the OSS and gaming communities!
