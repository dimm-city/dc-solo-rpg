import { expect, test } from '@playwright/test';

/**
 * Test suite to verify intro text is displayed after the instructions screen
 */

test.describe('Intro Text Display', () => {
	test('should display intro text after clicking continue on instructions screen', async ({
		page
	}) => {
		// Navigate to the game page
		await page.goto('/game');

		// Wait for the page to load
		await page.waitForLoadState('networkidle');

		// Click "Start Game" button on the options screen
		const startGameButton = page.getByRole('button', { name: /START GAME/i });
		await expect(startGameButton).toBeVisible({ timeout: 10000 });
		await startGameButton.click();

		// Wait for intro screen to appear
		await expect(page.getByTestId('screen-intro')).toBeVisible({ timeout: 5000 });

		// First view should be the "How To Play" rules screen
		await expect(page.getByRole('heading', { name: 'How To Play' })).toBeVisible();

		// Should see the continue button (not start button yet)
		const continueButton = page.getByTestId('intro-next-button');
		await expect(continueButton).toBeVisible();
		await expect(continueButton).toHaveText(/continue/i);

		// Click continue to advance to intro text view
		await continueButton.click();

		// Wait a moment for the view to transition
		await page.waitForTimeout(500);

		// The "How To Play" heading should no longer be visible
		await expect(page.getByRole('heading', { name: 'How To Play' })).not.toBeVisible();

		// Verify intro text is now displayed
		// The intro text should contain content from the game's introduction field
		// For the future-lost game, we expect to see "Future Lost" heading
		await expect(page.getByRole('heading', { name: /Future Lost/i })).toBeVisible();

		// The button should now say "start" instead of "continue"
		await expect(continueButton).toHaveText(/start/i);

		// The back button should say "back" instead of "exit"
		const backButton = page.getByTestId('intro-back-button');
		await expect(backButton).toHaveText(/back/i);

		// Verify we can go back to the rules screen
		await backButton.click();
		await page.waitForTimeout(500);
		await expect(page.getByRole('heading', { name: 'How To Play' })).toBeVisible();

		// And forward again to intro text
		await continueButton.click();
		await page.waitForTimeout(500);
		await expect(page.getByRole('heading', { name: /Future Lost/i })).toBeVisible();

		// Click start to begin the game
		await continueButton.click();

		// Should transition to the roll for tasks screen
		await expect(page.getByTestId('screen-rollForTasks')).toBeVisible({
			timeout: 5000
		});
	});

	test('should display intro text when starting from /game route', async ({ page }) => {
		// This tests the specific bug where intro text doesn't show when accessing /game directly
		await page.goto('/game');
		await page.waitForLoadState('networkidle');

		// Start the game from options screen
		const startGameButton = page.getByRole('button', { name: /START GAME/i });
		if (await startGameButton.isVisible({ timeout: 5000 }).catch(() => false)) {
			await startGameButton.click();

			// Should see intro screen with rules first
			await expect(page.getByTestId('screen-intro')).toBeVisible({ timeout: 5000 });
			await expect(page.getByRole('heading', { name: 'How To Play' })).toBeVisible();

			// Click continue to see intro text
			const continueButton = page.getByTestId('intro-next-button');
			await continueButton.click();
			await page.waitForTimeout(500);

			// Should see the intro text
			await expect(page.getByRole('heading', { name: /Future Lost/i })).toBeVisible();
		}
	});

	test('should preserve intro text navigation between rules and intro views', async ({
		page
	}) => {
		await page.goto('/game');
		await page.waitForLoadState('networkidle');

		// Start game
		const startGameButton = page.getByRole('button', { name: /START GAME/i });
		await expect(startGameButton).toBeVisible({ timeout: 10000 });
		await startGameButton.click();

		// Wait for intro screen
		await expect(page.getByTestId('screen-intro')).toBeVisible({ timeout: 5000 });

		const nextButton = page.getByTestId('intro-next-button');
		const backButton = page.getByTestId('intro-back-button');

		// Test multiple back and forth transitions
		for (let i = 0; i < 3; i++) {
			// Should be on rules
			await expect(page.getByRole('heading', { name: 'How To Play' })).toBeVisible();
			await expect(nextButton).toHaveText(/continue/i);
			await expect(backButton).toHaveText(/exit/i);

			// Go to intro
			await nextButton.click();
			await page.waitForTimeout(300);

			// Should be on intro text
			await expect(page.getByRole('heading', { name: /Future Lost/i })).toBeVisible();
			await expect(nextButton).toHaveText(/start/i);
			await expect(backButton).toHaveText(/back/i);

			// Go back to rules (if not last iteration)
			if (i < 2) {
				await backButton.click();
				await page.waitForTimeout(300);
			}
		}

		// Finally start the game
		await nextButton.click();
		await expect(page.getByTestId('screen-rollForTasks')).toBeVisible({
			timeout: 5000
		});
	});
});
