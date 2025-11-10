import { test, expect } from '@playwright/test';

test('Mobile UI and responsive layout test', async ({ page }) => {
console.log('\n📱 MOBILE UI TEST\n');

// Navigate to home
await page.goto('/');
await page.waitForSelector('.dc-start-screen-container', { timeout: 5000 });
await page.screenshot({ path: 'test-results/mobile-01-home.png', fullPage: true });
console.log('✓ Home page loaded');

// Select game by label (not by index to avoid placeholder)
await page.selectOption('select#gameSelect', { label: 'Future Lost' });
await page.waitForTimeout(500);
await page.screenshot({ path: 'test-results/mobile-02-game-selected.png', fullPage: true });
console.log('✓ Game selected');

// Click load game button
await page.click('button[data-testid="load-game-button"]');
await page.waitForTimeout(3000);
await page.screenshot({ path: 'test-results/mobile-03-game-loading.png', fullPage: true });
console.log('✓ Game loading');

// Check if intro screen loaded
const introVisible = await page.getByTestId('screen-intro').isVisible({ timeout: 10000 }).catch(() => false);
if (introVisible) {
await page.screenshot({ path: 'test-results/mobile-04-intro.png', fullPage: true });
console.log('✓ Intro screen loaded');

// Check for button overflow
const nextButton = page.getByTestId('intro-next-button');
const buttonBox = await nextButton.boundingBox();
const viewport = page.viewportSize();

if (buttonBox) {
console.log(`Button position: x=${buttonBox.x}, y=${buttonBox.y}, width=${buttonBox.width}, height=${buttonBox.height}`);
console.log(`Viewport: width=${viewport.width}, height=${viewport.height}`);

if (buttonBox.x + buttonBox.width > viewport.width) {
console.log('⚠️  WARNING: Button overflows viewport horizontally!');
}
if (buttonBox.y + buttonBox.height > viewport.height) {
console.log('⚠️  WARNING: Button overflows viewport vertically!');
}
}

// Skip intro
await nextButton.click();
await page.waitForTimeout(1000);
await page.screenshot({ path: 'test-results/mobile-05-intro-page2.png', fullPage: true });
await nextButton.click();
await page.waitForTimeout(2000);
}

// Check for roll screen
const rollVisible = await page.getByTestId('screen-rollForTasks').isVisible({ timeout: 5000 }).catch(() => false);
if (rollVisible) {
await page.screenshot({ path: 'test-results/mobile-06-roll-tasks.png', fullPage: true });
console.log('✓ Roll tasks screen loaded');

// Check dice roller layout
const diceArea = page.locator('.dc-dice-roller-container').first();
const diceBox = await diceArea.boundingBox().catch(() => null);
const viewport = page.viewportSize();

if (diceBox) {
console.log(`Dice area: x=${diceBox.x}, y=${diceBox.y}, width=${diceBox.width}, height=${diceBox.height}`);

if (diceBox.x + diceBox.width > viewport.width) {
console.log('⚠️  WARNING: Dice area overflows viewport horizontally!');
}
}
}

console.log('\n✓ Mobile UI test complete\n');
});
