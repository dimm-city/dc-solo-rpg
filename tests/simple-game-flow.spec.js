import { test, expect } from '@playwright/test';

/**
 * Simplified game flow test that focuses on validating core logic
 */
test('Simple game flow with logic validation', async ({ page }) => {
console.log('\n🎮 SIMPLE GAME FLOW TEST\n');

await page.goto('http://localhost:5173/');
await page.selectOption('select#gameSelect', { label: 'Future Lost' });
await page.click('button:has-text("Load Game")');
await page.waitForURL('**/game/future-lost');
console.log('✓ Game loaded');

await page.click('button:has-text("continue")');
await page.waitForTimeout(500);
await page.click('button:has-text("start")');
await page.waitForTimeout(1500);
console.log('✓ Game started\n');

// Play one round
console.log('ROUND 1');

// Roll for tasks
console.log('  Rolling dice...');
await page.click('.dc-dice-roller-container');
await page.waitForTimeout(2500);

// Confirm roll
await page.click('.dc-dice-roller-container');
await page.waitForTimeout(1000);
console.log('  ✓ Rolled for tasks');

// Draw cards until deck is not visible
let cardsDrawn = 0;
const maxCards = 10;

console.log('  Drawing cards...');
while (cardsDrawn < maxCards) {
const cardDeckVisible = await page.locator('.neural-cta:has-text("INTERCEPT")').isVisible().catch(() => false);

if (!cardDeckVisible) {
console.log(`  ✓ Drew ${cardsDrawn} cards`);
break;
}

// Draw card
await page.click('.neural-cta');
await page.waitForTimeout(800);
cardsDrawn++;

// Confirm card
const continueVisible = await page.locator('.neural-cta:has-text("CONTINUE")').isVisible().catch(() => false);
if (continueVisible) {
await page.click('.neural-cta:has-text("CONTINUE")');
await page.waitForTimeout(800);
}

// Check for failure check
const failureCheckVisible = await page.locator('.dc-failure-check-container').isVisible().catch(() => false);

if (failureCheckVisible) {
console.log(`    → Card ${cardsDrawn} triggered failure check`);

// Roll failure check
await page.click('.dc-dice-roller-container');
await page.waitForTimeout(2500);

// Confirm result
await page.click('.dc-dice-roller-container');
await page.waitForTimeout(800);
}
}

// Validate we drew between 1 and 6 cards (dice range)
expect(cardsDrawn).toBeGreaterThanOrEqual(1);
expect(cardsDrawn).toBeLessThanOrEqual(6);
console.log(`  ✅ Card count valid: ${cardsDrawn} (expected 1-6)`);

// Journal entry
const journalVisible = await page.locator('.dc-journal-container').isVisible().catch(() => false);
expect(journalVisible).toBe(true);
console.log('  ✓ Journal screen shown');

await page.fill('textarea', 'Round 1 test');
await page.click('button:has-text("Save")');
await page.waitForTimeout(1500);
console.log('  ✓ Journal saved');

// Check we're back to roll for tasks (round 2)
const diceVisible = await page.locator('.dc-dice-roller-container').isVisible().catch(() => false);
expect(diceVisible).toBe(true);
console.log('  ✓ Advanced to Round 2\n');

console.log('✅ TEST PASSED - Core game flow works!\n');
});
