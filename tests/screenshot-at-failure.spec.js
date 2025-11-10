import { test } from '@playwright/test';

test('Screenshot at failure point', async ({ page }) => {
await page.goto('http://localhost:5173/');
await page.selectOption('select#gameSelect', { label: 'Future Lost' });
await page.click('button:has-text("Load Game")');
await page.waitForURL('**/game/future-lost');
await page.click('button:has-text("continue")');
await page.waitForTimeout(500);
await page.click('button:has-text("start")');
await page.waitForSelector('.dc-dice-roller-container', { timeout: 5000 });

// Roll for tasks
await page.waitForSelector('.dc-dice-roller-container', { state: 'visible' });
await page.click('.dc-dice-roller-container');
await page.waitForTimeout(2500);
await page.click('.dc-dice-roller-container');

// Wait for card interface
await page.waitForSelector('.neural-cta:has-text("INTERCEPT")', { timeout: 5000 });

// Draw all cards
for (let i = 0; i < 10; i++) {
const interceptVisible = await page.locator('.neural-cta:has-text("INTERCEPT")').isVisible().catch(() => false);

if (!interceptVisible) {
break;
}

await page.waitForSelector('.neural-cta:has-text("INTERCEPT")', { state: 'visible' });
await page.click('.neural-cta');
await page.waitForSelector('.neural-cta:has-text("CONTINUE")', { timeout: 5000 });
await page.click('.neural-cta:has-text("CONTINUE")');
await page.waitForTimeout(500);

const failureVisible = await page.locator('.dc-failure-check-container').isVisible().catch(() => false);

if (failureVisible) {
await page.waitForSelector('.dc-failure-check-container .dc-dice-roller-container', { state: 'visible' });
await page.click('.dc-dice-roller-container');
await page.waitForTimeout(3500);
} else {
await page.waitForTimeout(500);
}
}

// Take screenshot of what's visible
await page.screenshot({ path: 'screenshots/at-failure-point.png', fullPage: true });

// Log what's visible
const journalVisible = await page.locator('.dc-journal-container').isVisible().catch(() => false);
const diceVisible = await page.locator('.dc-dice-roller-container').isVisible().catch(() => false);
const interceptVisible = await page.locator('.neural-cta:has-text("INTERCEPT")').isVisible().catch(() => false);

console.log('At failure point:');
console.log('  Journal:', journalVisible);
console.log('  Dice roller:', diceVisible);
console.log('  Intercept:', interceptVisible);

// Get page content to see what state we're in
const bodyText = await page.locator('body').textContent();
console.log('  Body contains "Journal":', bodyText.includes('Journal'));
console.log('  Body contains "Record":', bodyText.includes('Record'));
});
