import DOMPurify from 'dompurify';

/**
 * Sanitize HTML that originates from game files (which may be uploaded by users).
 *
 * DOMPurify needs a DOM. Without one (server-side rendering) it does NOT sanitize,
 * so in that case we return an empty string rather than ever echoing the input.
 * The client renders the real content after hydration.
 *
 * @param {string | null | undefined} html
 * @returns {string} Sanitized HTML, or '' when no DOM is available
 */
export function sanitizeHtml(html) {
	if (!html) return '';
	if (typeof window === 'undefined' || !DOMPurify.isSupported) return '';
	return DOMPurify.sanitize(String(html));
}
