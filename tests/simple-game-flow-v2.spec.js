import { test, expect } from '@playwright/test';

test('Simple game flow v2', async ({ page }) => {
console.log('\n🎮 GAME FLOW TEST V2\n');

await page.goto('http://localhost:5173/');
await page.selectOption('select#gameSelect', { label: 'Future Lost' });
await page.click('button:has-text("Load Game")');
await page.waitForURL('**/game/future-lost');
await page.click('button:has-text("continue")');
await page.waitForTimeout(500);
await page.click('button:has-text("start")');
await page.waitForTimeout(1500);
console.log('✓ Game started\n');

// ROUND 1
console.log('ROUND 1');

// Roll for tasks
await page.click('.dc-dice-roller-container');
await page.waitForTimeout(2500);
await page.click('.dc-dice-roller-container');
await page.waitForTimeout(1000);
console.log('  ✓ Rolled for tasks');

// Draw all cards
let cardsDrawn = 0;
const maxAttempts = 10;

for (let i = 0; i < maxAttempts; i++) {
// Check if we can intercept a card
const interceptVisible = await page.locator('.neural-cta:has-text("INTERCEPT")').isVisible().catch(() => false);

if (!interceptVisible) {
console.log(`  ✓ Drew ${cardsDrawn} cards total`);
break;
}

// Intercept card
await page.click('.neural-cta');
await page.waitForTimeout(1200);
cardsDrawn++;

// Wait for CONTINUE button and click it
await page.waitForSelector('.neural-cta:has-text("CONTINUE")', { timeout: 3000 });
await page.click('.neural-cta:has-text("CONTINUE")');
await page.waitForTimeout(800);

console.log(`  → Drew card ${cardsDrawn}`);

// Check if failure check screen appears
const failureVisible = await page.locator('.dc-failure-check-container').isVisible().catch(() => false);

if (failureVisible) {
console.log(`    → Failure check triggered`);

// Click once to roll the failure check
// After rolling, the state automatically transitions
await page.click('.dc-dice-roller-container');
await page.waitForTimeout(3000); // Wait for animation + auto-transition

console.log(`    ✓ Failure check completed`);
}

// Small delay between cards
await page.waitForTimeout(300);
}

expect(cardsDrawn).toBeGreaterThanOrEqual(1);
expect(cardsDrawn).toBeLessThanOrEqual(6);
console.log(`  ✅ Valid card count: ${cardsDrawn}`);

// Journal
await page.waitForSelector('.dc-journal-container', { timeout: 10000 });
console.log('  ✓ Journal screen');

await page.fill('textarea', 'Test entry');
await page.click('button:has-text("Record")');
await page.waitForTimeout(1500);
console.log('  ✓ Journal saved');

// Check round 2 started
const round2Dice = await page.locator('.dc-dice-roller-container').isVisible().catch(() => false);
expect(round2Dice).toBe(true);
console.log('  ✓ Round 2 started\n');

console.log('✅ TEST PASSED!\n');
});
