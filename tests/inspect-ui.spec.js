import { test } from '@playwright/test';

test('Inspect UI elements', async ({ page }) => {
await page.goto('http://localhost:5173/');
await page.selectOption('select#gameSelect', { label: 'Future Lost' });
await page.click('button:has-text("Load Game")');
await page.waitForURL('**/game/future-lost');
await page.waitForTimeout(1000);

await page.click('button:has-text("continue")');
await page.waitForTimeout(500);
await page.click('button:has-text("start")');
await page.waitForTimeout(2000);

console.log('\n=== DICE ROLLER SCREEN ===');

// Check for dice roller
const hasDice = await page.locator('.dc-dice-roller-container').isVisible();
console.log('Dice roller visible:', hasDice);

// Check for status display
const hasStatus = await page.locator('.dc-status-display, .status-display-area').isVisible();
console.log('Status display visible:', hasStatus);

if (hasStatus) {
const statusText = await page.locator('.dc-status-display, .status-display-area').textContent();
console.log('Status text:', statusText);
}

// Take screenshot
await page.screenshot({ path: 'screenshots/inspect-before-roll.png', fullPage: true });

// Click to roll
await page.click('.dc-dice-roller-container');
await page.waitForTimeout(3000);

await page.screenshot({ path: 'screenshots/inspect-after-roll.png', fullPage: true });

// Get all text content
const diceText = await page.locator('.dc-dice-roller-container').textContent();
console.log('\nDice roller text:', diceText);

const statusAfter = await page.locator('.dc-status-display, .status-display-area').textContent();
console.log('Status after roll:', statusAfter);
});
