import { test, expect } from '@playwright/test';

test('Robust game flow test', async ({ page }) => {
console.log('🎮 ROBUST GAME FLOW TEST');

await page.goto('http://localhost:5173/');
await page.selectOption('select#gameSelect', { label: 'Future Lost' });
await page.click('button:has-text("Load Game")');
await page.waitForURL('**/game/future-lost');
await page.click('button:has-text("continue")');
await page.waitForTimeout(500);
await page.click('button:has-text("start")');
await page.waitForSelector('.dc-dice-roller-container', { timeout: 5000 });
console.log('✓ Game started');

// ROUND 1
console.log('ROUND 1');

// Roll for tasks - wait for dice roller to be ready
await page.waitForSelector('.dc-dice-roller-container', { state: 'visible' });
await page.click('.dc-dice-roller-container');
await page.waitForTimeout(2500);
await page.click('.dc-dice-roller-container');

// Wait for card interface to appear
await page.waitForSelector('.neural-cta:has-text("INTERCEPT")', { timeout: 5000 });
console.log('  ✓ Rolled for tasks, card interface ready');

// Draw all cards
let cardsDrawn = 0;
const maxAttempts = 10;

for (let i = 0; i < maxAttempts; i++) {
const interceptVisible = await page.locator('.neural-cta:has-text("INTERCEPT")').isVisible().catch(() => false);

if (!interceptVisible) {
break;
}

// Wait for and click INTERCEPT
await page.waitForSelector('.neural-cta:has-text("INTERCEPT")', { state: 'visible' });
await page.click('.neural-cta');
cardsDrawn++;

// Wait for CONTINUE to appear
await page.waitForSelector('.neural-cta:has-text("CONTINUE")', { timeout: 5000 });
await page.click('.neural-cta:has-text("CONTINUE")');
await page.waitForTimeout(500);

// Check if failure check appears
const failureVisible = await page.locator('.dc-failure-check-container').isVisible().catch(() => false);

if (failureVisible) {
// Wait for dice roller in failure check context
await page.waitForSelector('.dc-failure-check-container .dc-dice-roller-container', { state: 'visible' });
await page.click('.dc-dice-roller-container');
// Wait for animation + auto-transition
await page.waitForTimeout(3500);
} else {
// Small delay if no failure check
await page.waitForTimeout(500);
}
}

console.log(`  ✓ Drew ${cardsDrawn} cards`);
expect(cardsDrawn).toBeGreaterThanOrEqual(1);
expect(cardsDrawn).toBeLessThanOrEqual(6);

// Journal - wait for it to appear
await page.waitForSelector('.dc-journal-container', { timeout: 10000 });
console.log('  ✓ Journal screen');

await page.fill('textarea', 'Test entry');
await page.waitForSelector('button:has-text("Record")', { state: 'visible' });
await page.click('button:has-text("Record")');

// Wait for round 2 to start
await page.waitForSelector('.dc-dice-roller-container', { timeout: 10000 });
console.log('  ✓ Round 2 started');

console.log('✅ TEST PASSED');
});
