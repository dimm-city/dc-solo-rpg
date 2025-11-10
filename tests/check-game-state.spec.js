import { test } from '@playwright/test';

test('Check game state access', async ({ page }) => {
// Expose a function to get game state
await page.addInitScript(() => {
window.getGameState = () => {
// Try to access the Svelte store
return {
available: typeof window !== 'undefined'
};
};
});

await page.goto('http://localhost:5173/');
await page.selectOption('select#gameSelect', { label: 'Future Lost' });
await page.click('button:has-text("Load Game")');
await page.waitForURL('**/game/future-lost');
await page.waitForTimeout(1000);

await page.click('button:has-text("continue")');
await page.waitForTimeout(500);
await page.click('button:has-text("start")');
await page.waitForTimeout(2000);

// Click to roll
await page.click('.dc-dice-roller-container');
await page.waitForTimeout(1000);

// Try to get the game state from the page
const gameState = await page.evaluate(() => {
// Check if there's a way to access the game state
// This might not work due to module scope
return window.getGameState?.() || null;
});

console.log('Game state available:', gameState);

// Alternative: wait for the animation and grab the visual number
await page.waitForTimeout(2000);

const diceText = await page.locator('.dc-dice-roller-container').textContent();
console.log('Dice text after animation:', diceText);
});
