import { test, expect } from '@playwright/test';

/**
 * Smoke Test for DC Solo RPG Application
 *
 * Purpose: Identify any broken functionality or errors in the game
 * - Tests initial page load and splash screen
 * - Tests instructions choice flow
 * - Tests game selection screen
 * - Tests navigation to a game
 * - Captures console errors
 * - Takes screenshots at each step
 */

test.describe('DC Solo RPG - Smoke Test', () => {
	let consoleErrors = [];
	let consoleWarnings = [];

	test.beforeEach(async ({ page }) => {
		// Capture console errors and warnings
		consoleErrors = [];
		consoleWarnings = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			} else if (msg.type() === 'warning') {
				consoleWarnings.push(msg.text());
			}
		});

		// Capture page errors
		page.on('pageerror', (error) => {
			consoleErrors.push(`Page Error: ${error.message}`);
		});
	});

	test('should load home page and capture initial state', async ({ page }) => {
		console.log('\n=== STEP 1: Navigate to home page ===');

		// Navigate to home page
		await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

		// Wait a moment for any initial animations
		await page.waitForTimeout(1000);

		// Take screenshot of initial state
		await page.screenshot({
			path: 'tests/screenshots/01-initial-load.png',
			fullPage: true
		});

		console.log('✓ Screenshot saved: 01-initial-load.png');
		console.log(`✓ Page title: ${await page.title()}`);
		console.log(`✓ Current URL: ${page.url()}`);
	});

	test('should handle splash screen and instructions choice', async ({ page }) => {
		console.log('\n=== STEP 2: Splash Screen & Instructions ===');

		await page.goto('http://localhost:5173/');

		// Check for splash screen
		const splashVisible = await page.locator('.splash-container, .dc-splash-container')
			.isVisible()
			.catch(() => false);

		if (splashVisible) {
			console.log('✓ Splash screen is visible');
			await page.screenshot({
				path: 'tests/screenshots/02-splash-screen.png',
				fullPage: true
			});

			// Wait for splash to complete (max 5 seconds)
			await page.waitForTimeout(5000);
		} else {
			console.log('⚠ Splash screen not visible (may have auto-skipped)');
		}

		// Check for instructions choice screen
		const instructionsVisible = await page.locator('.instructions-choice-container')
			.isVisible()
			.catch(() => false);

		if (instructionsVisible) {
			console.log('✓ Instructions choice screen is visible');
			await page.screenshot({
				path: 'tests/screenshots/03-instructions-choice.png',
				fullPage: true
			});

			// Look for the three choice buttons
			const learnButton = await page.locator('button:has-text("Learn How to Play")').isVisible();
			const skipOnceButton = await page.locator('button:has-text("Skip Once")').isVisible();
			const skipAlwaysButton = await page.locator('button:has-text("Skip Always")').isVisible();

			console.log(`  - "Learn How to Play" button: ${learnButton ? '✓' : '✗'}`);
			console.log(`  - "Skip Once" button: ${skipOnceButton ? '✓' : '✗'}`);
			console.log(`  - "Skip Always" button: ${skipAlwaysButton ? '✓' : '✗'}`);

			// Click "Skip Once" to proceed to game selection
			if (skipOnceButton) {
				await page.click('button:has-text("Skip Once")');
				await page.waitForTimeout(1000);
				console.log('✓ Clicked "Skip Once"');
			}
		} else {
			console.log('⚠ Instructions choice screen not visible (may have been skipped previously)');
		}
	});

	test('should display game selection screen with all interactive elements', async ({ page }) => {
		console.log('\n=== STEP 3: Game Selection Screen ===');

		await page.goto('http://localhost:5173/');

		// Wait for content to load
		await page.waitForTimeout(6000); // Wait for splash + instructions

		// Try to skip instructions if present
		const skipButton = await page.locator('button:has-text("Skip Once")').isVisible().catch(() => false);
		if (skipButton) {
			await page.click('button:has-text("Skip Once")');
			await page.waitForTimeout(500);
		}

		// Wait for game selector
		const gameSelector = await page.waitForSelector('[data-testid="game-selector"], .dc-start-screen-container', {
			timeout: 10000
		});

		console.log('✓ Game selection screen loaded');

		// Take screenshot
		await page.screenshot({
			path: 'tests/screenshots/04-game-selection.png',
			fullPage: true
		});

		// Check for header elements
		const headerLogo = await page.locator('.header-logo, .logo-dice').isVisible();
		const versionText = await page.locator('.version-text').textContent().catch(() => 'Not found');

		console.log(`✓ Header logo visible: ${headerLogo}`);
		console.log(`✓ Version text: ${versionText}`);

		// Check for header buttons (desktop)
		const uploadButton = await page.locator('.upload-button').isVisible().catch(() => false);
		const libraryButton = await page.locator('.library-button').isVisible().catch(() => false);
		const aboutButton = await page.locator('button[aria-label="About"]').isVisible().catch(() => false);
		const helpButton = await page.locator('button[aria-label="Help"]').isVisible().catch(() => false);

		console.log('\nHeader Buttons (Desktop):');
		console.log(`  - Upload Custom Game: ${uploadButton ? '✓' : '✗'}`);
		console.log(`  - Browse Story Library: ${libraryButton ? '✓' : '✗'}`);
		console.log(`  - About: ${aboutButton ? '✓' : '✗'}`);
		console.log(`  - Help: ${helpButton ? '✓' : '✗'}`);

		// Find all game cards
		const gameCards = await page.locator('.game-card').all();
		console.log(`\n✓ Found ${gameCards.length} game card(s)`);

		// Document each game card
		for (let i = 0; i < gameCards.length; i++) {
			const card = gameCards[i];
			const title = await card.locator('.game-card-title').textContent().catch(() => 'Unknown');
			const subtitle = await card.locator('.game-subtitle').textContent().catch(() => '');
			const hasCustomBadge = await card.locator('.custom-badge').isVisible().catch(() => false);

			console.log(`\nGame Card ${i + 1}:`);
			console.log(`  - Title: ${title.trim()}`);
			console.log(`  - Subtitle: ${subtitle.trim()}`);
			console.log(`  - Custom Game: ${hasCustomBadge ? 'Yes' : 'No'}`);

			// Check for action buttons
			const startBtn = await card.locator('.start-btn').isVisible().catch(() => false);
			const resumeBtn = await card.locator('.resume-btn').isVisible().catch(() => false);
			const deleteBtn = await card.locator('.delete-btn').isVisible().catch(() => false);

			console.log(`  - Start button: ${startBtn ? '✓' : '✗'}`);
			console.log(`  - Resume button: ${resumeBtn ? '✓' : '✗'}`);
			console.log(`  - Delete button: ${deleteBtn ? '✓' : '✗'}`);
		}
	});

	test('should test About modal', async ({ page }) => {
		console.log('\n=== STEP 4: About Modal ===');

		await page.goto('http://localhost:5173/');
		await page.waitForTimeout(6000);

		// Skip instructions if present
		const skipButton = await page.locator('button:has-text("Skip Once")').isVisible().catch(() => false);
		if (skipButton) {
			await page.click('button:has-text("Skip Once")');
			await page.waitForTimeout(500);
		}

		// Wait for page to be ready
		await page.waitForSelector('.dc-start-screen-container', { timeout: 5000 });

		// Click About button
		const aboutButton = page.locator('button[aria-label="About"]');
		if (await aboutButton.isVisible()) {
			await aboutButton.click();
			await page.waitForTimeout(500);

			console.log('✓ Clicked About button');

			// Take screenshot
			await page.screenshot({
				path: 'tests/screenshots/05-about-modal.png',
				fullPage: true
			});

			// Check modal content
			const modalTitle = await page.locator('.info-modal-title').textContent().catch(() => 'Not found');
			const modalBody = await page.locator('.info-modal-body').textContent().catch(() => 'Not found');

			console.log(`✓ Modal title: ${modalTitle.trim()}`);
			console.log(`✓ Modal has content: ${modalBody.length > 0 ? 'Yes' : 'No'}`);

			// Close modal
			const closeButton = page.locator('.info-modal-button:has-text("Close")');
			if (await closeButton.isVisible()) {
				await closeButton.click();
				await page.waitForTimeout(300);
				console.log('✓ Closed About modal');
			}
		} else {
			console.log('⚠ About button not visible');
		}
	});

	test('should test Help modal', async ({ page }) => {
		console.log('\n=== STEP 5: Help Modal ===');

		await page.goto('http://localhost:5173/');
		await page.waitForTimeout(6000);

		// Skip instructions if present
		const skipButton = await page.locator('button:has-text("Skip Once")').isVisible().catch(() => false);
		if (skipButton) {
			await page.click('button:has-text("Skip Once")');
			await page.waitForTimeout(500);
		}

		await page.waitForSelector('.dc-start-screen-container', { timeout: 5000 });

		// Click Help button
		const helpButton = page.locator('button[aria-label="Help"]');
		if (await helpButton.isVisible()) {
			await helpButton.click();
			await page.waitForTimeout(500);

			console.log('✓ Clicked Help button');

			// Take screenshot
			await page.screenshot({
				path: 'tests/screenshots/06-help-modal.png',
				fullPage: true
			});

			console.log('✓ Help modal opened');

			// Close by pressing Escape
			await page.keyboard.press('Escape');
			await page.waitForTimeout(300);
			console.log('✓ Closed Help modal with Escape key');
		} else {
			console.log('⚠ Help button not visible');
		}
	});

	test('should navigate to a game and test game flow', async ({ page }) => {
		console.log('\n=== STEP 6: Game Navigation ===');

		await page.goto('http://localhost:5173/');
		await page.waitForTimeout(6000);

		// Skip instructions if present
		const skipButton = await page.locator('button:has-text("Skip Once")').isVisible().catch(() => false);
		if (skipButton) {
			await page.click('button:has-text("Skip Once")');
			await page.waitForTimeout(500);
		}

		await page.waitForSelector('.dc-start-screen-container', { timeout: 5000 });

		// Find the first game card with a start button
		const firstStartButton = page.locator('.start-btn').first();

		if (await firstStartButton.isVisible()) {
			// Get game title before clicking
			const gameCard = page.locator('.game-card').first();
			const gameTitle = await gameCard.locator('.game-card-title').textContent();

			console.log(`✓ Starting game: ${gameTitle.trim()}`);

			// Click the start button
			await firstStartButton.click();
			await page.waitForTimeout(2000);

			// Take screenshot of game page
			await page.screenshot({
				path: 'tests/screenshots/07-game-loaded.png',
				fullPage: true
			});

			console.log(`✓ Navigated to game page`);
			console.log(`✓ Current URL: ${page.url()}`);

			// Check for game intro screen
			const introScreen = await page.locator('[data-testid="screen-showIntro"], .dc-intro-screen')
				.isVisible()
				.catch(() => false);

			if (introScreen) {
				console.log('✓ Game intro screen loaded');

				// Look for start button
				const gameStartButton = await page.locator('button:has-text("start")').isVisible().catch(() => false);
				console.log(`  - Start button visible: ${gameStartButton ? '✓' : '✗'}`);
			} else {
				console.log('⚠ Game intro screen not immediately visible');
			}

			// Check for any visible UI elements
			const statusDisplay = await page.locator('.dc-status-display, .status-display-area')
				.isVisible()
				.catch(() => false);
			console.log(`  - Status display visible: ${statusDisplay ? '✓' : '✗'}`);

		} else {
			console.log('⚠ No start button found on any game card');
		}
	});

	test('should test Browse Story Library', async ({ page }) => {
		console.log('\n=== STEP 7: Browse Story Library ===');

		await page.goto('http://localhost:5173/');
		await page.waitForTimeout(6000);

		// Skip instructions if present
		const skipButton = await page.locator('button:has-text("Skip Once")').isVisible().catch(() => false);
		if (skipButton) {
			await page.click('button:has-text("Skip Once")');
			await page.waitForTimeout(500);
		}

		await page.waitForSelector('.dc-start-screen-container', { timeout: 5000 });

		// Click Browse Story Library button
		const libraryButton = page.locator('.library-button');
		if (await libraryButton.isVisible()) {
			await libraryButton.click();
			await page.waitForTimeout(1000);

			console.log('✓ Clicked Browse Story Library');

			// Take screenshot
			await page.screenshot({
				path: 'tests/screenshots/08-story-library.png',
				fullPage: true
			});

			// Check if story browser loaded
			const storyModeVisible = await page.locator('.browse-games-container, [class*="browse"]')
				.isVisible()
				.catch(() => false);

			console.log(`✓ Story library view loaded: ${storyModeVisible ? 'Yes' : 'No'}`);
		} else {
			console.log('⚠ Browse Story Library button not visible');
		}
	});

	test('should report all console errors and warnings', async ({ page }) => {
		console.log('\n=== STEP 8: Console Errors & Warnings Summary ===');

		// Run through the main flow
		await page.goto('http://localhost:5173/');
		await page.waitForTimeout(6000);

		const skipButton = await page.locator('button:has-text("Skip Once")').isVisible().catch(() => false);
		if (skipButton) {
			await page.click('button:has-text("Skip Once")');
			await page.waitForTimeout(500);
		}

		await page.waitForSelector('.dc-start-screen-container', { timeout: 10000 });

		// Try to start a game
		const firstStartButton = page.locator('.start-btn').first();
		if (await firstStartButton.isVisible()) {
			await firstStartButton.click();
			await page.waitForTimeout(2000);
		}

		// Report findings
		console.log('\n========================================');
		console.log('CONSOLE ERRORS:');
		console.log('========================================');
		if (consoleErrors.length === 0) {
			console.log('✓ No console errors detected!');
		} else {
			console.log(`✗ Found ${consoleErrors.length} error(s):`);
			consoleErrors.forEach((error, index) => {
				console.log(`  ${index + 1}. ${error}`);
			});
		}

		console.log('\n========================================');
		console.log('CONSOLE WARNINGS:');
		console.log('========================================');
		if (consoleWarnings.length === 0) {
			console.log('✓ No console warnings detected!');
		} else {
			console.log(`⚠ Found ${consoleWarnings.length} warning(s):`);
			consoleWarnings.forEach((warning, index) => {
				console.log(`  ${index + 1}. ${warning}`);
			});
		}

		// Create a summary screenshot
		await page.screenshot({
			path: 'tests/screenshots/09-final-state.png',
			fullPage: true
		});

		console.log('\n========================================');
		console.log('SMOKE TEST COMPLETE');
		console.log('========================================');
		console.log(`Total screenshots: 9`);
		console.log(`Screenshots location: /home/user/dc-solo-rpg/tests/screenshots/`);
		console.log('========================================\n');

		// Fail the test if there are errors
		expect(consoleErrors.length).toBe(0);
	});
});
