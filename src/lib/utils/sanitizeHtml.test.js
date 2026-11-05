import { describe, it, expect } from 'vitest';
import { marked } from 'marked';
import { sanitizeHtml } from './sanitizeHtml.js';

describe('sanitizeHtml', () => {
	it('strips script tags', () => {
		const out = sanitizeHtml('<p>hi</p><script>alert(1)</script>');
		expect(out).not.toContain('<script');
		expect(out).not.toContain('alert');
		expect(out).toContain('<p>hi</p>');
	});

	it('strips event handler attributes', () => {
		const out = sanitizeHtml('<img src="x" onerror="alert(1)"><b onclick="alert(2)">b</b>');
		expect(out).not.toMatch(/onerror|onclick/i);
		expect(out).toContain('<b>b</b>');
	});

	it('strips javascript: URLs', () => {
		const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
		expect(out).not.toMatch(/javascript:/i);
	});

	it('keeps normal markdown output', () => {
		const out = sanitizeHtml(
			marked('# Title\n\n*em* **strong**\n\n- one\n- two\n\n[link](https://example.com)')
		);
		expect(out).toContain('<h1');
		expect(out).toContain('<em>em</em>');
		expect(out).toContain('<strong>strong</strong>');
		expect(out).toContain('<li>one</li>');
		expect(out).toContain('href="https://example.com"');
	});

	it('keeps <br>', () => {
		expect(sanitizeHtml('a<br>b')).toBe('a<br>b');
	});

	it('handles empty input', () => {
		expect(sanitizeHtml(null)).toBe('');
		expect(sanitizeHtml(undefined)).toBe('');
	});
});
