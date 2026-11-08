// The home screen renders in the browser only (saved games and settings live there); its
// built-in games come from +page.server.js, found at build time (see builtInGames.js)
export const prerender = false;
export const ssr = false;
export const csr = true;
