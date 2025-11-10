import { test } from '@playwright/test';

test('Debug state transitions', async ({ page }) => {
// Track all console messages
page.on('console', msg => console.log('BROWSER:', msg.text()));

await page.goto('http://localhost:5173/');
await page.selectOption('select#gameSelect', { label: 'Future Lost' });
await page.click('button:has-text("Load Game")');
await page.waitForURL('**/game/future-lost');
await page.click('button:has-text("continue")');
await page.waitForTimeout(500);
await page.click('button:has-text("start")');
await page.waitForTimeout(1500);
console.log('Game started');

console.log('Clicking dice roller to roll for tasks...');
await page.click('.dc-dice-roller-container');
console.log('Waiting for animation...');
await page.waitForTimeout(2500);

console.log('Clicking to confirm roll...');
await page.click('.dc-dice-roller-container');
console.log('Waiting for transition...');
await page.waitForTimeout(2000);

// Check what is visible
const interceptVisible = await page.locator('.neural-cta:has-text("INTERCEPT")').isVisible().catch(() => false);
const diceVisible = await page.locator('.dc-dice-roller-container').isVisible().catch(() => false);
const journalVisible = await page.locator('.dc-journal-container').isVisible().catch(() => false);

console.log('');
console.log('What is visible:');
console.log('  INTERCEPT button:', interceptVisible);
console.log('  Dice roller:', diceVisible);
console.log('  Journal:', journalVisible);

if (!interceptVisible) {
console.log('');
console.log('ERROR: INTERCEPT button NOT visible - state transition failed');
await page.screenshot({ path: 'screenshots/debug-no-intercept.png', fullPage: true });
} else {
console.log('');
console.log('SUCCESS: INTERCEPT button is visible');
}
});
