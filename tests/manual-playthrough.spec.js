import { test } from '@playwright/test';

test('Manual game playthrough - test fix for intercept button error', async ({ page }) => {
	console.log('\n🎮 Starting Manual Playthrough Test\n');

	// Desktop viewport
	await page.setViewportSize({ width: 1280, height: 720 });

	// Go to home page
	await page.goto('http://localhost:3000');
	console.log('✓ Loaded home page');
	await page.screenshot({ path: '/tmp/test-screenshots/manual-01-home.png', fullPage: true });

	// Select game
	await page.selectOption('select#gameSelect', { index: 1 });
	console.log('✓ Selected game');

	// Select player (should already be selected by default)
	await page.selectOption('select#player', { index: 1 });
	console.log('✓ Selected player');

	// Click Load Game to go to options
	await page.click('button:has-text("Load Game")');
	await page.waitForTimeout(1000);
	console.log('✓ Loaded options screen');
	await page.screenshot({ path: '/tmp/test-screenshots/manual-02-options.png', fullPage: true });

	// Click Start Game from options screen
	await page.waitForSelector('button:has-text("Start Game")', { timeout: 5000 });
	await page.click('button:has-text("Start Game")');
	await page.waitForTimeout(1000);
	console.log('✓ Started game - showing intro');
	await page.screenshot({ path: '/tmp/test-screenshots/manual-03-intro-rules.png', fullPage: true });

	// Click continue to see game intro
	await page.waitForSelector('button:has-text("continue")', { timeout: 5000 });
	await page.click('button:has-text("continue")');
	await page.waitForTimeout(500);
	console.log('✓ Clicked continue on rules');
	await page.screenshot({ path: '/tmp/test-screenshots/manual-04-intro-story.png', fullPage: true });

	// Click start to begin game
	await page.waitForSelector('button:has-text("start")', { timeout: 5000 });
	await page.click('button:has-text("start")');
	await page.waitForTimeout(1500);
	console.log('✓ Started game - Round 1');
	await page.screenshot({ path: '/tmp/test-screenshots/manual-05-roll-for-tasks.png', fullPage: true });

	// Roll dice for tasks
	await page.waitForSelector('.dc-dice-roller-container', { timeout: 5000 });
	await page.click('.dc-dice-roller-container');
	console.log('✓ Rolling dice...');
	await page.waitForTimeout(2500);
	await page.screenshot({ path: '/tmp/test-screenshots/manual-06-dice-result.png', fullPage: true });

	// Click dice again to confirm
	await page.click('.dc-dice-roller-container');
	await page.waitForTimeout(1000);
	console.log('✓ Confirmed dice roll - transitioned to drawCard');
	await page.screenshot({ path: '/tmp/test-screenshots/manual-07-draw-card-screen.png', fullPage: true });

	// Now test the intercept button - this is where the error was occurring
	console.log('\n🎯 Testing INTERCEPT FRAGMENT button (the fix)...\n');
	
	// Set up error listeners
	const errors = [];
	page.on('console', msg => {
		if (msg.type() === 'error') {
			const text = msg.text();
			console.error('❌ Browser console error:', text);
			errors.push(text);
		}
	});

	page.on('pageerror', error => {
		console.error('❌ Page error:', error.message);
		errors.push(error.message);
	});

	// Wait for and click intercept button
	const interceptButton = await page.locator('button:has-text("INTERCEPT FRAGMENT")');
	await interceptButton.waitFor({ state: 'visible', timeout: 5000 });
	console.log('✓ INTERCEPT FRAGMENT button is visible');
	await page.screenshot({ path: '/tmp/test-screenshots/manual-08-before-intercept.png', fullPage: true });

	await interceptButton.click();
	console.log('✓ Clicked INTERCEPT FRAGMENT button');
	await page.waitForTimeout(2000);
	await page.screenshot({ path: '/tmp/test-screenshots/manual-09-intercepting.png', fullPage: true });

	// Wait for card to materialize
	await page.waitForTimeout(1500);
	await page.screenshot({ path: '/tmp/test-screenshots/manual-10-card-revealed.png', fullPage: true });
	console.log('✓ Card revealed');

	// Check if CONTINUE button appears
	const continueButton = await page.locator('button:has-text("CONTINUE")');
	const isVisible = await continueButton.isVisible({ timeout: 3000 }).catch(() => false);
	
	if (isVisible) {
		console.log('✓ CONTINUE button appeared successfully');
		await page.screenshot({ path: '/tmp/test-screenshots/manual-11-continue-visible.png', fullPage: true });

		// Click continue
		await continueButton.click();
		await page.waitForTimeout(1000);
		console.log('✓ Clicked CONTINUE');
		await page.screenshot({ path: '/tmp/test-screenshots/manual-12-after-continue.png', fullPage: true });
	} else {
		console.error('❌ CONTINUE button did not appear');
	}

	// Report errors
	if (errors.length > 0) {
		console.error('\n❌ ERRORS DETECTED:');
		errors.forEach((error, i) => {
			console.error(`  ${i + 1}. ${error}`);
		});
		throw new Error(`Test failed with ${errors.length} error(s)`);
	} else {
		console.log('\n✅ NO ERRORS DETECTED - Fix successful!\n');
	}
});

test('Mobile responsiveness test', async ({ page }) => {
	console.log('\n📱 Starting Mobile Responsiveness Test\n');

	// Mobile viewport - iPhone SE
	await page.setViewportSize({ width: 375, height: 667 });

	await page.goto('http://localhost:3000');
	console.log('✓ Loaded home page (mobile)');
	await page.screenshot({ path: '/tmp/test-screenshots/mobile-01-home.png', fullPage: true });

	// Select game and start
	await page.selectOption('select#gameSelect', { index: 1 });
	await page.selectOption('select#player', { index: 1 });
	await page.click('button:has-text("Load Game")');
	await page.waitForTimeout(1000);
	await page.screenshot({ path: '/tmp/test-screenshots/mobile-02-options.png', fullPage: true });

	// Start game
	await page.waitForSelector('button:has-text("Start Game")', { timeout: 5000 });
	await page.click('button:has-text("Start Game")');
	await page.waitForTimeout(1000);
	await page.screenshot({ path: '/tmp/test-screenshots/mobile-03-intro.png', fullPage: true });

	// Skip through intro
	await page.click('button:has-text("continue")');
	await page.waitForTimeout(500);
	await page.click('button:has-text("start")');
	await page.waitForTimeout(1500);
	await page.screenshot({ path: '/tmp/test-screenshots/mobile-04-round1.png', fullPage: true });

	// Roll dice
	await page.click('.dc-dice-roller-container');
	await page.waitForTimeout(2500);
	await page.screenshot({ path: '/tmp/test-screenshots/mobile-05-dice-result.png', fullPage: true });

	await page.click('.dc-dice-roller-container');
	await page.waitForTimeout(1000);
	await page.screenshot({ path: '/tmp/test-screenshots/mobile-06-draw-card.png', fullPage: true });

	// Check button accessibility on mobile
	const interceptButton = await page.locator('button:has-text("INTERCEPT FRAGMENT")');
	await interceptButton.waitFor({ state: 'visible', timeout: 5000 });
	
	const boundingBox = await interceptButton.boundingBox();
	console.log('Button position:', boundingBox);
	
	// Check if button meets minimum touch target size (44x44px)
	if (boundingBox) {
		const meetsTouchTarget = boundingBox.width >= 44 && boundingBox.height >= 44;
		console.log(`Touch target size: ${boundingBox.width}x${boundingBox.height}px`);
		console.log(`Meets minimum (44x44): ${meetsTouchTarget ? '✓ YES' : '❌ NO'}`);
		
		// Check if button is within viewport
		const inViewport = boundingBox.y >= 0 && boundingBox.y + boundingBox.height <= 667;
		console.log(`Button in viewport: ${inViewport ? '✓ YES' : '❌ NO'}`);
	}

	await page.screenshot({ path: '/tmp/test-screenshots/mobile-07-button-check.png', fullPage: true });
	
	console.log('\n✅ Mobile responsiveness test complete\n');
});
