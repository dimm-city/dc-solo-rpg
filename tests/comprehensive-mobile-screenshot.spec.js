import { test, expect } from '@playwright/test';

test('Comprehensive mobile screenshot test for user verification', async ({ page }) => {
console.log('\n📱 Taking comprehensive mobile screenshots...\n');

// 1. Home page
await page.goto('/');
await page.waitForSelector('.dc-start-screen-container', { timeout: 5000 });
await page.screenshot({ path: 'screenshots/mobile-01-home.png', fullPage: true });
console.log('✓ Screenshot 1: Home page');

// 2. Game selected (click the game card)
await page.click('[data-testid="game-card-future-lost"]');
await page.waitForTimeout(500);
await page.screenshot({ path: 'screenshots/mobile-02-game-selected.png', fullPage: true });
console.log('✓ Screenshot 2: Game selected');

// 3. Rules screen
await page.click('[data-testid="load-game-button"]');
await page.waitForTimeout(3000);
await expect(page.getByTestId('screen-intro')).toBeVisible({ timeout: 10000 });
await page.screenshot({ path: 'screenshots/mobile-03-rules.png', fullPage: true });
console.log('✓ Screenshot 3: Rules screen');

// 4. Intro screen (after clicking CONTINUE on rules)
await page.getByTestId('intro-next-button').click();
await page.waitForTimeout(1000);
await page.screenshot({ path: 'screenshots/mobile-04-intro.png', fullPage: true });
console.log('✓ Screenshot 4: Intro screen');

// 5. Roll for tasks screen (after clicking START on intro)
await page.getByTestId('intro-next-button').click();
await page.waitForTimeout(2000);
const rollTasksVisible = await page.locator('[data-testid="screen-rollForTasks"], .dc-dice-roller-container').isVisible({ timeout: 5000 }).catch(() => false);
if (!rollTasksVisible) {
	console.log('⚠️  Roll for tasks screen not visible, checking startRound...');
	await expect(page.getByTestId('screen-startRound')).toBeVisible({ timeout: 5000 });
}
await page.screenshot({ path: 'screenshots/mobile-05-roll-for-tasks.png', fullPage: true });
console.log('✓ Screenshot 5: Roll for tasks screen');

// Check button dimensions
const diceArea = page.locator('.dc-dice-roller-container').first();
const diceBox = await diceArea.boundingBox().catch(() => null);
const viewport = page.viewportSize();

console.log(`\nViewport: ${viewport.width}x${viewport.height}`);
if (diceBox) {
console.log(`Dice area: x=${diceBox.x}, y=${diceBox.y}, width=${diceBox.width}, height=${diceBox.height}`);
const rightEdge = diceBox.x + diceBox.width;
const bottomEdge = diceBox.y + diceBox.height;
console.log(`Right edge: ${rightEdge} (viewport width: ${viewport.width})`);
console.log(`Bottom edge: ${bottomEdge} (viewport height: ${viewport.height})`);

if (rightEdge > viewport.width) {
console.log('⚠️  WARNING: Content overflows viewport horizontally!');
} else {
console.log('✓ No horizontal overflow');
}

if (bottomEdge > viewport.height) {
console.log('⚠️  WARNING: Content overflows viewport vertically!');
} else {
console.log('✓ No vertical overflow');
}
}

console.log('\n✓ All screenshots saved to screenshots/ directory\n');
});
