/**
 * A card's story as the reader sees it: the author's markdown emphasis (_word_, *word*,
 * **word**, __word__) drawn as italic and bold, never as literal markers. Used by the card
 * face and story mode, so a story reads the same everywhere.
 *
 * Only emphasis is read: anything else stays text (HTML is escaped, then the result goes
 * through sanitizeHtml as every game-file string does). A marker inside a word (snake_case,
 * 2*3*4) is left alone, as markdown does.
 */
import { sanitizeHtml } from '../../utils/sanitizeHtml.js';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
const escapeHtml = (text) => text.replace(/[&<>]/g, (ch) => ESCAPES[ch]);

// The marker, then text that neither starts nor ends with a space, then the same marker; not
// touching a letter or digit on the outside. One line at a time (no newline inside).
const STRONG = /(^|[^\p{L}\p{N}*_])(\*\*|__)(?!\s)([^\n]+?)(?<!\s)\2(?![\p{L}\p{N}*_])/gu;
const EM = /(^|[^\p{L}\p{N}*_])([*_])(?![\s*_])([^\n*_]+?)(?<![\s*_])\2(?![\p{L}\p{N}*_])/gu;

/**
 * Rewrite each emphasis run with wrap(tag, inner): bold first, so ** is never read as two *
 * @param {string} text
 * @param {(tag: 'strong'|'em', inner: string) => string} wrap
 */
function replaceEmphasis(text, wrap) {
	return text
		.replace(STRONG, (_, before, _marker, inner) => `${before}${wrap('strong', inner)}`)
		.replace(EM, (_, before, _marker, inner) => `${before}${wrap('em', inner)}`);
}

/**
 * The story as safe HTML: emphasis as <em>/<strong>, line breaks as <br>.
 * @param {string|null|undefined} story
 * @returns {string}
 */
export function storyHtml(story) {
	if (!story) return '';
	const html = replaceEmphasis(
		escapeHtml(String(story)),
		(tag, inner) => `<${tag}>${inner}</${tag}>`
	);
	return sanitizeHtml(html.replace(/\n/g, '<br>'));
}

/**
 * The story as plain words, the markers dropped (for speech and other plain-text uses).
 * @param {string|null|undefined} story
 * @returns {string}
 */
export function storyPlain(story) {
	if (!story) return '';
	return replaceEmphasis(String(story), (_tag, inner) => inner);
}
