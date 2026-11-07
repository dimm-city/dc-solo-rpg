# Dream Console Home Page: Test Plan

The home page (`src/routes/+page.svelte`) is where a player starts, continues or manages a game.
It is client-rendered (`ssr = false`). This plan lists what the home must do; the Playwright
specs named under each section automate it. Selectors and copy are the ones in the code today.

## Setup

- Dev server: `npm run dev` (Playwright starts it; see `playwright.config.js`).
- A returning player: `openHomePage()` in `tests/helpers.ts` sets
  `dc-solo-rpg:instructions-seen` to `'true'`, which also skips the splash.
- localStorage keys: `dc-solo-rpg:splash-seen`, `dc-solo-rpg:instructions-seen`,
  `dc-solo-rpg:rule-tips`. Saves live in IndexedDB.
- Projects: Desktop Chrome (1280x720), Mobile Chrome (375x667, touch), Tablet (768x1024, touch).

## 1. Splash and the first-run panel

Spec: `splash-and-instructions.spec.ts`.

1. **Splash once per install.** A fresh install plays the splash, then the first-run panel.
   Once it has played (or the first-time choice was made), it never plays again.
2. **The first-run panel** ("Dream Console", with "Dimm City" above it) offers three choices:
   - **Play** ("The game teaches you as you go."): rule tips on, straight to the games.
   - **Read the rules first**: opens the Game Guide; closing it ("Done") goes on to the
     games with rule tips on.
   - **I know how to play: don't show tips.**: rule tips off, straight to the games.
3. Any choice sets `instructions-seen`, so the panel is gone for good, across sessions.
4. Rule tips can be switched back on (or off) in Settings › Gameplay › Rule tips.

## 2. The games

Specs: `game-selection.spec.ts`, `game-confirmation-modal.spec.ts`.

1. `[data-testid="home-page"]` shows the pitch ("A solo journaling game. Draw, roll, write.")
   and one card per game (`[data-testid="game-selector"]`), built-in and uploaded alike, sorted
   by title. Each card has the title, subtitle and a session estimate; uploaded games carry a
   "Custom" badge and a "Remove custom game" button.
2. **No save:** the card's one action is **Play**, which opens `/game/<slug>` on a new game.
3. **A save in progress:** the card offers
   - **Continue**, with the round and how long ago (its accessible name reads them too), which
     resumes the save;
   - **New game**, which asks first ("Start new game" / "Keep my save") and replaces the save;
   - **Delete save**, which asks first ("Delete save" / "Keep it") and leaves the card on Play,
     with a "Save deleted" toast.
4. A save that can't be opened shows the toast "That save couldn't be opened".
5. **Upload Game** (header menu) accepts a `.game.md` file and adds its card, or shows an error
   toast.

## 3. Header, menus and dialogs

Specs: `header-navigation.spec.ts`, `about-modal.spec.ts`, `settings-modal.spec.ts`.

1. At 900px and up the header shows **Stories**, **Settings** and **Help** inline, and **More**
   for the rest; below 900px **Toggle menu** holds every action (Upload Game, Story Library,
   Settings, Dice Theme, About, Help, and Sign Out when signed in).
2. **Settings** opens on Gameplay (Difficulty: Game default / Normal / Easy; Play mode:
   Manual / Read aloud / Hands-free; Rule tips), with everything else under Advanced.
3. **Help** opens the Game Guide, **About** the credits and **Dice Theme** the theme picker.
4. Dialogs close with their close button and with Escape.
5. **Stories** opens the Story Library (`story-library.spec.ts`); `/?story=1` (where a finished
   game's "Read your story" goes) opens it directly.

## 4. Layout and access

Specs: `responsive-design.spec.ts`, `accessibility.spec.ts`.

1. No horizontal scroll, and every action on screen, at phone, tablet and desktop widths.
2. Keyboard: every action is reachable with Tab, with a visible focus ring; Enter and Space
   activate it.
3. Reduced motion: the view swaps (panel to games, games to Story Library) do not fade.
4. No console errors on load. A script that navigates on should first wait for the page to
   start (`openHomePage()` does): leaving `/` while its client start-up is still fetching
   `/__data.json` aborts that fetch, and SvelteKit logs it as `TypeError: Failed to fetch`.
