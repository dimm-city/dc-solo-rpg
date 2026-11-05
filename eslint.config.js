import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2017
			},
			ecmaVersion: 2022,
			sourceType: 'module'
		},
		rules: {
			'no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
			]
		}
	},
	{
		ignores: [
			'.DS_Store',
			'**/node_modules/',
			'build/',
			'.svelte-kit/',
			'package/',
			'.claude/',
			'.env',
			'.env.*',
			'!.env.example',
			'pnpm-lock.yaml',
			'package-lock.json',
			'yarn.lock',
			'dist/'
		]
	}
];
