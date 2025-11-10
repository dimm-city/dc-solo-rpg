import { test, expect } from '@playwright/test';

/**
 * This test verifies that games can be loaded without 404 errors.
 * It catches the bug where process.cwd() doesn't point to the correct directory
 * in production/preview mode, causing game files to not be found.
 */
test('Game loading - verify no 404 errors', async ({ page }) => {
	console.log('\n=== Testing Game Loading for 404 Errors ===\n');
	
	// Track any failed requests (404, 500, etc.)
	const failedRequests = [];
	page.on('response', response => {
		if (response.status() >= 400) {
			failedRequests.push({
				url: response.url(),
				status: response.status(),
				statusText: response.statusText()
			});
		}
	});
	
	// Track console errors
	const consoleErrors = [];
	page.on('console', msg => {
		if (msg.type() === 'error') {
			consoleErrors.push(msg.text());
		}
	});
	
	// Step 1: Go to home page
	console.log('1. Loading home page...');
	await page.goto('/');
	await page.waitForSelector('[data-testid="game-selector"]', { timeout: 5000 });
	console.log('   ✓ Home page loaded');
	
	// Step 2: Select a game
	console.log('2. Selecting "Future Lost" game...');
	await page.selectOption('select#gameSelect', { label: 'Future Lost' });
	console.log('   ✓ Game selected');
	
	// Step 3: Click "Load Game" button
	console.log('3. Clicking "Load Game" button...');
	await page.click('button[data-testid="load-game-button"]');
	
	// Step 4: Wait for game to load (should not get 404)
	console.log('4. Waiting for game to load...');
	
	// Wait for either the game container or an error page
	try {
		await page.waitForSelector('.dc-game-container', { timeout: 10000 });
		console.log('   ✓ Game loaded successfully');
	} catch (error) {
		// Check if we got a 404 page
		const pageText = await page.textContent('body');
		if (pageText.includes('404') || pageText.includes('not found')) {
			console.error('   ✗ Got 404 error page!');
			await page.screenshot({ path: 'screenshots/game-404-error.png', fullPage: true });
			throw new Error('Game loading resulted in 404 error');
		}
		throw error;
	}
	
	// Step 5: Verify no failed requests
	console.log('5. Checking for failed requests...');
	if (failedRequests.length > 0) {
		console.error('   ✗ Found failed requests:');
		failedRequests.forEach(req => {
			console.error(`     - ${req.status} ${req.statusText}: ${req.url}`);
		});
		
		// Filter out expected failures (like missing favicons)
		const criticalFailures = failedRequests.filter(req => 
			!req.url.includes('favicon') && 
			!req.url.includes('.ico') &&
			req.url.includes('/game/')
		);
		
		if (criticalFailures.length > 0) {
			await page.screenshot({ path: 'screenshots/game-loading-failures.png', fullPage: true });
			throw new Error(`Found ${criticalFailures.length} critical failed requests`);
		}
	}
	console.log('   ✓ No critical failed requests');
	
	// Step 6: Verify no console errors related to loading
	console.log('6. Checking for console errors...');
	const loadingErrors = consoleErrors.filter(err => 
		err.includes('404') || 
		err.includes('not found') ||
		err.includes('ENOENT')
		// Removed 'Failed to load' as it catches external resource loading errors
	);
	
	if (loadingErrors.length > 0) {
		console.error('   ✗ Found loading-related console errors:');
		loadingErrors.forEach(err => console.error(`     - ${err}`));
		throw new Error(`Found ${loadingErrors.length} loading-related console errors`);
	}
	console.log('   ✓ No loading-related console errors');
	
	// Step 7: Verify game UI elements are present
	console.log('7. Verifying game UI elements...');
	await expect(page.locator('.dc-game-container')).toBeVisible();
	console.log('   ✓ Game container visible');
	
	console.log('\n✅ Game loading test passed - no 404 errors!\n');
});

/**
 * This test specifically checks that the /game/[slug] route returns 200 OK
 */
test('Direct game URL - should return 200 OK', async ({ page }) => {
	console.log('\n=== Testing Direct Game URL ===\n');
	
	// Navigate directly to a game URL
	console.log('Navigating to /game/future-lost...');
	const response = await page.goto('/game/future-lost');
	
	// Verify response status
	expect(response.status()).toBe(200);
	console.log(`✓ Response status: ${response.status()} OK`);
	
	// Verify page loaded
	await expect(page.locator('.dc-game-container')).toBeVisible({ timeout: 10000 });
	console.log('✓ Game container visible');
	
	console.log('\n✅ Direct game URL test passed!\n');
});

/**
 * This test checks all available games can be loaded
 */
test('All games - verify all can be loaded without 404', async ({ page }) => {
	console.log('\n=== Testing All Games ===\n');
	
	// Go to home page
	await page.goto('/');
	await page.waitForSelector('select#gameSelect', { timeout: 5000 });
	
	// Get all game options - extract slugs from the text since value is an object
	const gameOptions = await page.$$eval('select#gameSelect option', options =>
		options
			.filter(opt => opt.value && opt.value !== 'null' && opt.textContent !== 'Please select a game')
			.map(opt => ({ 
				text: opt.textContent,
				// Convert title back to slug (e.g., "Future Lost" -> "future-lost")
				slug: opt.textContent.toLowerCase().replace(/\s+/g, '-')
			}))
	);
	
	console.log(`Found ${gameOptions.length} games to test`);
	
	// Test each game
	for (const game of gameOptions) {
		console.log(`\nTesting game: "${game.text}" (${game.slug})`);
		
		// Navigate directly to the game
		const response = await page.goto(`/game/${game.slug}`);
		
		// Verify it doesn't 404
		expect(response.status()).toBe(200);
		console.log(`  ✓ Status: ${response.status()} OK`);
		
		// Verify game container appears
		try {
			await page.waitForSelector('.dc-game-container', { timeout: 5000 });
			console.log(`  ✓ Game loaded successfully`);
		} catch (error) {
			console.error(`  ✗ Failed to load game`);
			await page.screenshot({ 
				path: `screenshots/game-404-${game.slug}.png`, 
				fullPage: true 
			});
			throw new Error(`Game "${game.text}" failed to load`);
		}
	}
	
	console.log(`\n✅ All ${gameOptions.length} games loaded successfully!\n`);
});
