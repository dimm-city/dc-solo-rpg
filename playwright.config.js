/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		command: 'npm run preview',
		port: 4173,
		reuseExistingServer: true
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		launchOptions: {
			executablePath: '/usr/bin/google-chrome',
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage'
			],
			headless: true
		},
		javaScriptEnabled: true,
		viewport: { width: 1280, height: 720 }
	}
};

export default config;
