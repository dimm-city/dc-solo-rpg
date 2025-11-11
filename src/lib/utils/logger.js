/**
 * Development-only logging utility
 * Logs are automatically stripped in production builds
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
	/**
	 * Debug-level logging (only in development)
	 * @param {...any} args - Arguments to log
	 */
	debug: (...args) => {
		if (isDev) console.debug('[DEBUG]', ...args);
	},

	/**
	 * Info-level logging (only in development)
	 * @param {...any} args - Arguments to log
	 */
	info: (...args) => {
		if (isDev) console.info('[INFO]', ...args);
	},

	/**
	 * Warning-level logging (always logged)
	 * @param {...any} args - Arguments to log
	 */
	warn: (...args) => {
		console.warn('[WARN]', ...args);
	},

	/**
	 * Error-level logging (always logged)
	 * @param {...any} args - Arguments to log
	 */
	error: (...args) => {
		console.error('[ERROR]', ...args);
	}
};
