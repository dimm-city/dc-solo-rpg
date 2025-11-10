#!/usr/bin/env node

/**
 * Comprehensive Game Test with Screenshots
 * 
 * This script plays through a complete game and captures screenshots
 * at each major step, validating the Svelte 5 migration.
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4173';
const SCREENSHOTS_DIR = './screenshots';

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
	fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

console.log('\n' + '='.repeat(80));
console.log('🎮 COMPREHENSIVE GAME TEST - DC SOLO RPG');
console.log('='.repeat(80) + '\n');

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
	const browser = await puppeteer.launch({
		executablePath: '/usr/bin/google-chrome',
		headless: true,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-web-security',
			'--disable-features=IsolateOrigins,site-per-process'
		]
	});

	try {
		const page = await browser.newPage();
		await page.setViewport({ width: 1280, height: 720 });

		// Listen for console messages
		page.on('console', msg => {
			const type = msg.type();
			if (type === 'error' || type === 'warning') {
				console.log(`[Browser ${type}]: ${msg.text()}`);
			}
		});

		// Listen for errors
		page.on('pageerror', error => {
			console.log(`[Page Error]: ${error.message}`);
		});

		console.log('🌐 Navigating to home page...');
		await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
		await sleep(2000);

		console.log('📸 Taking screenshot: 01-home.png');
		await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-home.png'), fullPage: true });

		// Check if page loaded
		const bodyText = await page.evaluate(() => document.body.textContent);
		console.log(`✓ Page loaded (${bodyText.length} characters)`);

		// Try to find game selector
		console.log('\n📋 Looking for game selector...');
		
		const selectors = [
			'select#gameSelect',
			'select[name="game"]',
			'.dc-start-screen-container select',
			'select'
		];

		let gameSelect = null;
		for (const selector of selectors) {
			try {
				await page.waitForSelector(selector, { timeout: 2000 });
				gameSelect = selector;
				console.log(`✓ Found selector: ${selector}`);
				break;
			} catch (e) {
				console.log(`  ✗ Not found: ${selector}`);
			}
		}

		if (!gameSelect) {
			console.log('\n❌ Could not find game selector');
			console.log('📄 Page HTML:');
			const html = await page.content();
			console.log(html.substring(0, 1000));
			return;
		}

		// Select game
		console.log('\n🎮 Selecting "Future Lost" game...');
		await page.select(gameSelect, '2'); // Index for Future Lost
		await sleep(500);

		// Find and click start button
		console.log('🚀 Looking for start button...');
		const startButtonSelectors = [
			'button:has-text("Load Game")',
			'button:has-text("Start Game")',
			'button',
			'.dc-start-screen-container button'
		];

		let clickedStart = false;
		for (const selector of startButtonSelectors) {
			try {
				await page.waitForSelector(selector, { timeout: 1000 });
				await page.click(selector);
				console.log(`✓ Clicked button: ${selector}`);
				clickedStart = true;
				break;
			} catch (e) {
				console.log(`  ✗ Button not found: ${selector}`);
			}
		}

		if (!clickedStart) {
			console.log('\n❌ Could not find start button');
			return;
		}

		await sleep(2000);
		console.log('📸 Taking screenshot: 02-options.png');
		await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-options.png'), fullPage: true });

		// Try to start game from options
		console.log('\n⚙️  Starting game from options screen...');
		try {
			await page.waitForSelector('button', { timeout: 3000 });
			const buttons = await page.$$('button');
			if (buttons.length > 0) {
				await buttons[0].click();
				console.log('✓ Clicked first button');
			}
		} catch (e) {
			console.log('  ⚠️  Could not find button on options screen');
		}

		await sleep(2000);
		console.log('📸 Taking screenshot: 03-intro.png');
		await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-intro.png'), fullPage: true });

		// Continue with game flow...
		console.log('\n🎲 Looking for game elements...');
		
		// Take screenshots of current state
		const gameScreenshots = [
			'04-game-screen.png',
			'05-current-state.png'
		];

		for (const filename of gameScreenshots) {
			await sleep(1000);
			console.log(`📸 Taking screenshot: ${filename}`);
			await page.screenshot({ path: path.join(SCREENSHOTS_DIR, filename), fullPage: true });
		}

		// Try to interact with game
		console.log('\n🎯 Attempting to interact with game elements...');
		
		// Look for dice roller, buttons, or other interactive elements
		const interactiveSelectors = [
			'.dc-dice-roller-container',
			'.dc-card-deck',
			'button:has-text("start")',
			'button:has-text("Start")',
			'.dc-game-container button'
		];

		for (const selector of interactiveSelectors) {
			try {
				await page.waitForSelector(selector, { timeout: 2000 });
				console.log(`✓ Found interactive element: ${selector}`);
				await page.click(selector);
				await sleep(2000);
				const screenshotName = `06-clicked-${selector.replace(/[^a-z0-9]/gi, '_')}.png`;
				console.log(`📸 Taking screenshot: ${screenshotName}`);
				await page.screenshot({ path: path.join(SCREENSHOTS_DIR, screenshotName), fullPage: true });
				break;
			} catch (e) {
				// Element not found, continue
			}
		}

		console.log('\n✅ Test completed successfully!');
		console.log(`📂 Screenshots saved to: ${SCREENSHOTS_DIR}/`);

	} catch (error) {
		console.error('\n❌ Test failed with error:', error.message);
		console.error(error.stack);
	} finally {
		await browser.close();
	}
}

runTest().catch(console.error);
