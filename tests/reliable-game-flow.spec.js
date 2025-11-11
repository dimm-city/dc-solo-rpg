import { test, expect } from '@playwright/test';

/**
 * Comprehensive, reliable game flow test using data-testid selectors
 * Tests both desktop and mobile viewports
 */

test.describe('Reliable Game Flow', () => {
	test('should complete home page to game intro flow', async ({ page }) => {
		// Navigate to home page
		await page.goto('/');

		// Wait for home page to load with data-testid
		await expect(page.getByTestId('home-page')).toBeVisible({ timeout: 10000 });
		await expect(page.getByTestId('page-title')).toHaveText('Dimm City: Solo RPG');

		// Wait for game selector
		await expect(page.getByTestId('game-selector')).toBeVisible();

		// Select a game (use the select element directly)
		const gameSelect = page.getByTestId('game-select');
		await expect(gameSelect).toBeVisible();

		// Wait for options to load
		await page.waitForTimeout(1000);

		// Select the first available game
		await gameSelect.selectOption({ index: 1 }); // Index 0 is "Please select"

		// Click load game button
		const loadButton = page.getByTestId('load-game-button');
		await expect(loadButton).toBeEnabled();
		await loadButton.click();

		// Wait for navigation to game page
		await page.waitForURL(/\/game\//, { timeout: 10000 });

		// Wait for game container to load
		await expect(page.getByTestId('game-container')).toBeVisible({ timeout: 15000 });

		// Should be on intro screen
		await expect(page.getByTestId('screen-intro')).toBeVisible({ timeout: 15000 });

		// Verify intro navigation buttons are present
		await expect(page.getByTestId('intro-back-button')).toBeVisible();
		await expect(page.getByTestId('intro-next-button')).toBeVisible();

		console.log('✓ Successfully loaded game and reached intro screen');
	});

	test('should navigate through intro to first round', async ({ page }) => {
		// Navigate directly to a game (faster than going through home page)
		await page.goto('/game/future-lost');

		// Wait for intro screen
		await expect(page.getByTestId('screen-intro')).toBeVisible({ timeout: 15000 });

		// Click next button to move from rules to introduction
		const nextButton = page.getByTestId('intro-next-button');
		await expect(nextButton).toBeVisible();
		await nextButton.click();

		// Wait a moment for transition
		await page.waitForTimeout(500);

		// Click next again to start the game
		await nextButton.click();

		// Wait for roll for tasks screen
		await expect(page.getByTestId('screen-rollForTasks')).toBeVisible({ timeout: 10000 });

		console.log('✓ Successfully navigated to rollForTasks screen');
	});

	test('should handle dice roll and card drawing', async ({ page }) => {
		// Navigate to game
		await page.goto('/game/future-lost');

		// Skip intro
		await expect(page.getByTestId('screen-intro')).toBeVisible({ timeout: 15000 });
		await page.getByTestId('intro-next-button').click();
		await page.waitForTimeout(500);
		await page.getByTestId('intro-next-button').click();

		// Wait for roll for tasks screen
		await expect(page.getByTestId('screen-rollForTasks')).toBeVisible({ timeout: 10000 });

		// Find and click the dice (it might be in a different container)
		// Wait for dice roller to be interactive
		await page.waitForTimeout(1000);

		// Try to find clickable dice element
		const diceArea = page.locator('.dc-screen-container').filter({ hasText: 'Roll' });
		await expect(diceArea).toBeVisible();

		// Click anywhere in the dice area to roll
		await diceArea.click();

		// Wait for transition to draw card screen
		await expect(page.getByTestId('screen-drawCard')).toBeVisible({ timeout: 10000 });

		// Verify card deck button is present
		await expect(page.getByTestId('card-deck-button')).toBeVisible({ timeout: 5000 });

		console.log('✓ Successfully rolled dice and reached draw card screen');
	});

	test('should draw and confirm a card', async ({ page }) => {
		// Navigate to game and get to draw card screen
		await page.goto('/game/future-lost');
		await expect(page.getByTestId('screen-intro')).toBeVisible({ timeout: 15000 });
		await page.getByTestId('intro-next-button').click();
		await page.waitForTimeout(500);
		await page.getByTestId('intro-next-button').click();
		await expect(page.getByTestId('screen-rollForTasks')).toBeVisible({ timeout: 10000 });
		await page.waitForTimeout(1000);
		await page
			.locator('.dc-screen-container')
			.filter({ hasText: 'Roll' })
			.click();
		await expect(page.getByTestId('screen-drawCard')).toBeVisible({ timeout: 10000 });

		// Click card deck button to draw
		const cardButton = page.getByTestId('card-deck-button');
		await expect(cardButton).toBeVisible();
		await expect(cardButton).toBeEnabled();
		await cardButton.click();

		// Wait for card to be drawn (button text should change)
		await expect(cardButton).toHaveText(/CONTINUE|INTERCEPTING/, { timeout: 5000 });

		// Wait for button to become "CONTINUE"
		await expect(cardButton).toHaveText('CONTINUE', { timeout: 5000 });

		// Click continue to confirm card
		await cardButton.click();

		// Should transition to either another card draw, failure check, or journal
		// Wait for screen to change
		await page.waitForTimeout(1000);

		// Verify we're on a different screen
		const possibleScreens = [
			page.getByTestId('screen-drawCard'),
			page.getByTestId('screen-failureCheck'),
			page.getByTestId('screen-journal')
		];

		let foundScreen = false;
		for (const screen of possibleScreens) {
			if (await screen.isVisible().catch(() => false)) {
				foundScreen = true;
				break;
			}
		}

		expect(foundScreen).toBe(true);
		console.log('✓ Successfully drew and confirmed a card');
	});
});

test.describe('Mobile Responsiveness', () => {
	test('should be playable on mobile viewport', async ({ page, isMobile }) => {
		// This test automatically runs with mobile viewport in "Mobile Chrome" project
		if (!isMobile) {
			test.skip();
		}

		// Navigate to home
		await page.goto('/');
		await expect(page.getByTestId('home-page')).toBeVisible({ timeout: 10000 });

		// Verify elements are visible and properly sized on mobile
		const gameSelector = page.getByTestId('game-selector');
		await expect(gameSelector).toBeVisible();

		// Check that elements fit within viewport
		const box = await gameSelector.boundingBox();
		const viewport = page.viewportSize();

		expect(box.width).toBeLessThanOrEqual(viewport.width);
		expect(box.x).toBeGreaterThanOrEqual(0);

		console.log(
			`✓ Mobile viewport (${viewport.width}x${viewport.height}): Elements fit properly`
		);

		// Select game and navigate
		await page.getByTestId('game-select').selectOption({ index: 1 });
		await page.getByTestId('load-game-button').click();
		await page.waitForURL(/\/game\//, { timeout: 10000 });

		// Verify game screen is visible on mobile
		await expect(page.getByTestId('game-container')).toBeVisible({ timeout: 15000 });
		await expect(page.getByTestId('screen-intro')).toBeVisible({ timeout: 15000 });

		// Check intro buttons have adequate touch targets (min 44x44px)
		const nextButton = page.getByTestId('intro-next-button');
		await expect(nextButton).toBeVisible();

		const buttonBox = await nextButton.boundingBox();
		expect(buttonBox.height).toBeGreaterThanOrEqual(40); // Allow small margin

		console.log('✓ Mobile: Buttons have adequate touch target size');
	});

	test('should handle card drawing on mobile', async ({ page, isMobile }) => {
		if (!isMobile) {
			test.skip();
		}

		// Navigate to game
		await page.goto('/game/future-lost');
		await expect(page.getByTestId('screen-intro')).toBeVisible({ timeout: 15000 });

		// Navigate through intro
		await page.getByTestId('intro-next-button').click();
		await page.waitForTimeout(500);
		await page.getByTestId('intro-next-button').click();
		await expect(page.getByTestId('screen-rollForTasks')).toBeVisible({ timeout: 10000 });

		// Roll dice
		await page.waitForTimeout(1000);
		await page
			.locator('.dc-screen-container')
			.filter({ hasText: 'Roll' })
			.click();
		await expect(page.getByTestId('screen-drawCard')).toBeVisible({ timeout: 10000 });

		// Verify card deck is properly sized on mobile
		const cardDeckContainer = page.locator('.dc-draw-card-container');
		await expect(cardDeckContainer).toBeVisible();

		const containerBox = await cardDeckContainer.boundingBox();
		const viewport = page.viewportSize();

		// Container should not overflow viewport
		expect(containerBox.width).toBeLessThanOrEqual(viewport.width);
		expect(containerBox.x).toBeGreaterThanOrEqual(0);

		// Button should be visible and touchable
		const cardButton = page.getByTestId('card-deck-button');
		await expect(cardButton).toBeVisible();

		const buttonBox = await cardButton.boundingBox();
		expect(buttonBox.height).toBeGreaterThanOrEqual(40);

		console.log('✓ Mobile: Card drawing interface is properly sized');
	});
});
