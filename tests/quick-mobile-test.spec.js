import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:5173' });

test('Quick mobile screenshot test', async ({ page }) => {
// Navigate to home
await page.goto('/');
await page.waitForSelector('.dc-start-screen-container', { timeout: 5000 });
await page.screenshot({ path: 'test-results/mobile-home.png', fullPage: true });
console.log('✓ Home screenshot saved');

// Select and start game
await page.selectOption('select#gameSelect', { index: 0 });
await page.click('button:has-text("Load Game")');
await page.waitForTimeout(3000);
await page.screenshot({ path: 'test-results/mobile-game-loading.png', fullPage: true });
console.log('✓ Game loading screenshot saved');

// Check if intro screen loaded
const introVisible = await page.getByTestId('screen-intro').isVisible({ timeout: 5000 }).catch(() => false);
if (introVisible) {
await page.screenshot({ path: 'test-results/mobile-intro.png', fullPage: true });
console.log('✓ Intro screenshot saved');

// Skip intro
await page.getByTestId('intro-next-button').click();
await page.waitForTimeout(1000);
await page.getByTestId('intro-next-button').click();
await page.waitForTimeout(2000);
}

// Check for roll screen
const rollVisible = await page.getByTestId('screen-rollForTasks').isVisible({ timeout: 5000 }).catch(() => false);
if (rollVisible) {
await page.screenshot({ path: 'test-results/mobile-roll-tasks.png', fullPage: true });
console.log('✓ Roll tasks screenshot saved');
}

console.log('✓ All screenshots saved to test-results/');
});
