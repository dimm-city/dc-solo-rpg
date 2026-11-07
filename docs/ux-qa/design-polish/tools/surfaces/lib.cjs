// Shared helpers for the design-review surface captures (dev server: state forcing works through
// Vite module URLs). Rerun with ROUND=<n> node capture.cjs.
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

const SP = '/tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad';
const DR = path.join(SP, 'design-review');
const ROUND = process.env.ROUND || '1';
const BASE = process.env.BASE_URL || 'http://localhost:5192';
const OUT = path.join(DR, `round-${ROUND}`);
const SHOTS = path.join(OUT, 'shots', 'surfaces');
const RAW = path.join(OUT, 'raw', 'surfaces');
const TOOLS = path.join(DR, 'tools', 'surfaces');

const strip = (d) => {
	const { defaultBrowserType, ...rest } = d;
	return rest;
};

/** Core viewports: every state. Extended: home, drawn card, journal entry, game over. */
const VIEWPORTS = {
	'android-small': { viewport: { width: 360, height: 640 }, screen: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, touch: true },
	// The brief's sizes: the full iPhone 13 screen (Playwright's descriptor subtracts Safari's bars: 390x664, 750x342)
	'iphone-13': { ...strip(devices['iPhone 13']), viewport: { width: 390, height: 844 }, screen: { width: 390, height: 844 }, deviceScaleFactor: 2, touch: true },
	'iphone-13-landscape': { ...strip(devices['iPhone 13 landscape']), viewport: { width: 844, height: 390 }, screen: { width: 844, height: 390 }, deviceScaleFactor: 2, touch: true },
	'ipad-portrait': { viewport: { width: 768, height: 1024 }, screen: { width: 768, height: 1024 }, deviceScaleFactor: 1, hasTouch: true, touch: true },
	laptop: { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 },
	desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
};
const EXTENDED = {
	'iphone-se': { viewport: { width: 375, height: 667 }, screen: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, touch: true },
	'pixel-7': { viewport: { width: 412, height: 915 }, screen: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, touch: true },
	'ipad-landscape': { viewport: { width: 1024, height: 768 }, screen: { width: 1024, height: 768 }, deviceScaleFactor: 1, hasTouch: true, touch: true },
	fhd: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 }
};
const CORE_ORDER = Object.keys(VIEWPORTS);
const ALL_VIEWPORTS = { ...VIEWPORTS, ...EXTENDED };

async function launchBrowser() {
	return chromium.launch({
		executablePath: '/opt/pw-browsers/chromium',
		args: [
			'--no-sandbox',
			'--headless=new',
			'--use-angle=swiftshader',
			// The voice note: a fake microphone, permission granted without a prompt
			'--use-fake-device-for-media-stream',
			'--use-fake-ui-for-media-stream'
		]
	});
}

/**
 * A context for one viewport.
 * opts.storageState: a Playwright storage state (localStorage + IndexedDB) to start from
 * opts.seen: mark the splash and the first-run choice as seen (default true)
 */
async function newContext(browser, vpKey, { storageState = null, seen = true, reducedMotion = 'no-preference' } = {}) {
	const { touch, ...vp } = ALL_VIEWPORTS[vpKey];
	const ctx = await browser.newContext({
		...vp,
		reducedMotion,
		permissions: ['microphone'],
		...(storageState ? { storageState } : {})
	});
	// Nothing should load from outside; abort if anything tries (logged as an error)
	await ctx.route(/fonts\.googleapis|fonts\.gstatic|unpkg\.com/, (r) => r.abort());
	if (seen) {
		await ctx.addInitScript(() => {
			try {
				if (!sessionStorage.getItem('dr-fresh')) {
					localStorage.setItem('dc-solo-rpg:instructions-seen', 'true');
					localStorage.setItem('dc-solo-rpg:splash-seen', 'true');
				}
			} catch {}
		});
	}
	return ctx;
}

async function newPage(ctx, errors) {
	const page = await ctx.newPage();
	page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.split('\n')[0]));
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(m.text().split('\n')[0].slice(0, 200));
	});
	return page;
}

/** Run code with the live modules: gs (gameStore), rnd (random), acts (gameActions), idb, dice */
const store = (page, src, arg) =>
	page.evaluate(
		async ({ src, arg }) => {
			const gs = await import('/src/lib/stores/gameStore.svelte.js');
			const rnd = await import('/src/lib/services/random.js');
			const acts = await import('/src/lib/stores/gameActions.svelte.js');
			const idb = await import('/src/lib/stores/indexedDBStorage.js');
			const dice = await import('/src/lib/stores/diceStore.svelte.js');
			// eslint-disable-next-line no-new-func
			return new Function('gs', 'rnd', 'acts', 'idb', 'dice', 'arg', `return (async () => { ${src} })()`)(gs, rnd, acts, idb, dice, arg);
		},
		{ src, arg }
	);

/**
 * Wait until the page is still: fonts loaded, no finite animation or transition running, no dice
 * rolling. Infinite (ambient) loops are ignored. Then two frames and a short pause.
 */
async function settle(page, { timeout = 6000, extra = 150 } = {}) {
	const t0 = Date.now();
	while (Date.now() - t0 < timeout) {
		const busy = await page
			.evaluate(() => {
				if (document.fonts && document.fonts.status !== 'loaded') return 'fonts';
				const running = document.getAnimations().filter((a) => {
					if (a.playState !== 'running') return false;
					const t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
					return !t || t.iterations !== Infinity;
				});
				if (running.length) return 'anim:' + running.length;
				if (document.querySelector('.dice-container.rolling')) return 'dice';
				return '';
			})
			.catch(() => 'eval');
		if (!busy) break;
		await page.waitForTimeout(100);
	}
	await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))).catch(() => {});
	await page.waitForTimeout(extra);
}

/**
 * Collect every visible text element and control with its type, colours and geometry, plus the
 * page-level fit checks. Runs in the page. Background and contrast are completed later from the
 * screenshot pixels (post.py).
 */
function collectInPage({ touch, pageMode = false }) {
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const doc = document.documentElement;
	const r1 = (n) => Math.round(n * 10) / 10;
	const box = (r) => ({ x: r1(r.left), y: r1(r.top), w: r1(r.width), h: r1(r.height) });

	// Normalise any CSS colour to [r, g, b, a] through a canvas
	const cv = document.createElement('canvas');
	cv.width = cv.height = 1;
	const cx = cv.getContext('2d', { willReadFrequently: true });
	const colourCache = new Map();
	function rgba(str) {
		if (!str || str === 'transparent' || str === 'rgba(0, 0, 0, 0)') return [0, 0, 0, 0];
		if (colourCache.has(str)) return colourCache.get(str);
		let out;
		const m = str.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/);
		if (m) out = [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
		else {
			cx.clearRect(0, 0, 1, 1);
			cx.fillStyle = '#000';
			cx.fillStyle = str;
			cx.fillRect(0, 0, 1, 1);
			const d = cx.getImageData(0, 0, 1, 1).data;
			out = [d[0], d[1], d[2], r1(d[3] / 255)];
		}
		colourCache.set(str, out);
		return out;
	}
	const over = (top, bottom) => {
		const a = top[3] + bottom[3] * (1 - top[3]);
		if (a === 0) return [0, 0, 0, 0];
		return [0, 1, 2].map((i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a).concat(a);
	};

	const CONTROL =
		'button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab], [role=switch], [role=menuitem], [role=radio], [role=checkbox], [role=link], [role=slider], [tabindex]:not([tabindex="-1"])';

	function ownText(el) {
		let t = '';
		for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
		return t.replace(/\s+/g, ' ').trim();
	}
	function textRect(el) {
		const range = document.createRange();
		let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
		for (const n of el.childNodes) {
			if (n.nodeType !== 3 || !n.nodeValue.trim()) continue;
			range.selectNodeContents(n);
			for (const rc of range.getClientRects()) {
				if (rc.width < 0.5 || rc.height < 0.5) continue;
				l = Math.min(l, rc.left); t = Math.min(t, rc.top); r = Math.max(r, rc.right); b = Math.max(b, rc.bottom);
			}
		}
		return l === Infinity ? null : { left: l, top: t, right: r, bottom: b, width: r - l, height: b - t };
	}
	function effOpacity(el) {
		let o = 1;
		for (let e = el; e && e.nodeType === 1; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
		return o;
	}
	// The part of a rect left after every clipping ancestor and the viewport
	function visibleRect(el, rect) {
		let l = rect.left, t = rect.top, r = rect.right, b = rect.bottom;
		let scrollAncestor = null;
		for (let e = el.parentElement; e && e !== document.body && e !== doc; e = e.parentElement) {
			const cs = getComputedStyle(e);
			const clipX = cs.overflowX !== 'visible';
			const clipY = cs.overflowY !== 'visible';
			if (!clipX && !clipY) continue;
			const er = e.getBoundingClientRect();
			if (clipX) { l = Math.max(l, er.left); r = Math.min(r, er.right); }
			if (clipY) { t = Math.max(t, er.top); b = Math.min(b, er.bottom); }
			if (!scrollAncestor && /auto|scroll/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 1) scrollAncestor = e;
			if (cs.position === 'fixed') break;
		}
		if (pageMode) {
			// The whole document (a full-page shot): clip to the page, not the viewport
			l = Math.max(l, -window.scrollX); t = Math.max(t, -window.scrollY);
			r = Math.min(r, doc.scrollWidth - window.scrollX); b = Math.min(b, doc.scrollHeight - window.scrollY);
		} else {
			l = Math.max(l, 0); t = Math.max(t, 0); r = Math.min(r, vw); b = Math.min(b, vh);
		}
		return { rect: r > l && b > t ? { left: l, top: t, right: r, bottom: b, width: r - l, height: b - t } : null, scrollAncestor };
	}
	function isSrOnly(el, cs, rect) {
		if (rect.width <= 1.5 || rect.height <= 1.5) return true;
		if (/inset\(50%\)/.test(cs.clipPath) || cs.clip === 'rect(0px, 0px, 0px, 0px)') return true;
		return false;
	}
	function label(el) {
		const parts = [];
		for (let e = el, i = 0; e && e !== document.body && i < 3; e = e.parentElement, i++) {
			let s = e.tagName.toLowerCase();
			if (e.id) s += '#' + e.id;
			const cls = [...e.classList].filter((c) => !/^s-|^svelte-/.test(c)).slice(0, 2);
			if (cls.length) s += '.' + cls.join('.');
			parts.unshift(s);
		}
		return parts.join(' > ');
	}
	function testid(el) {
		const t = el.closest('[data-testid]');
		return t ? t.getAttribute('data-testid') : null;
	}
	function role(el, cs, text, isControl) {
		const tag = el.tagName.toLowerCase();
		const tid = el.getAttribute('data-testid') || '';
		const cls = el.className && el.className.baseVal === undefined ? String(el.className) : '';
		if (tid === 'result-line' || el.closest('[data-testid="result-line"]')) return 'result line';
		if (tid === 'rule-caption' || el.closest('[data-testid="rule-caption"]')) return 'caption';
		if (isControl) {
			if (tag === 'a') return el.matches('.aug-button, [class*="button"]') ? 'button' : 'link';
			if (tag === 'input' || tag === 'textarea' || tag === 'select') return 'field';
			if (el.getAttribute('role') === 'tab' || /tab/.test(cls)) return 'tab';
			if (el.getAttribute('role') === 'menuitem') return 'menu item';
			if (tag === 'summary') return 'disclosure';
			return 'button';
		}
		if (el.closest('button, [role=button], a.aug-button')) return 'button text';
		if (el.closest('a[href]')) return 'link text';
		if (/^h1$/.test(tag)) return 'title';
		if (/^h[2-6]$/.test(tag)) return 'heading';
		if (tag === 'label' || tag === 'legend' || tag === 'dt' || /label|eyebrow|kicker/.test(cls)) return 'label';
		if (/^[\d\s/+\-–−×%.:·]+$/.test(text) || /value|count|number|stat/.test(cls)) return 'value';
		if (tag === 'figcaption' || tag === 'small' || /caption|hint|help|meta|note|sub/.test(cls)) return 'caption';
		if (tag === 'li') return 'list item';
		if (tag === 'blockquote' || el.closest('blockquote')) return 'quote';
		if (tag === 'th' || tag === 'td') return 'table cell';
		if (tag === 'p' || el.closest('p')) return 'body text';
		return 'text';
	}

	const elements = [];
	const pending = [];
	const clipped = [];
	const outside = [];
	const smallTargets = [];
	let srOnly = 0, inert = 0, transparent = 0, offscreen = 0;
	const offscreenTexts = [];
	let idx = 0;
	for (const el of document.querySelectorAll('body *')) {
		const tag = el.tagName.toLowerCase();
		if (['script', 'style', 'noscript', 'template', 'svg', 'path', 'g', 'canvas', 'br', 'option', 'img', 'video', 'audio'].includes(tag)) continue;
		if (el.closest('svg')) continue;
		const isControl = el.matches(CONTROL);
		const text = ownText(el);
		if (!isControl && !text) continue;
		const cs = getComputedStyle(el);
		if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') continue;
		const rects = el.getClientRects();
		if (!rects.length) continue;
		const rect = el.getBoundingClientRect();
		if (isSrOnly(el, cs, rect)) { srOnly++; continue; }
		const op = effOpacity(el);
		if (op < 0.05) { transparent++; continue; }
		if (el.closest('[inert]')) { inert++; continue; }
		const tr = (text && textRect(el)) || null;
		const measure = tr || rect;
		const vis = visibleRect(el, measure);
		const toggle = el.matches('input[type=checkbox], input[type=radio], input[type=range]');
		const fullText = isControl ? (toggle ? '' : (el.innerText || el.value || '')).replace(/\s+/g, ' ').trim() : text;
		const labelText = el.labels && el.labels[0] ? el.labels[0].innerText.replace(/\s+/g, ' ').trim() : '';
		const name = isControl ? (el.getAttribute('aria-label') || fullText || labelText || el.getAttribute('title') || el.getAttribute('placeholder') || '') : '';
		if (!vis.rect) {
			offscreen++;
			if (offscreenTexts.length < 60) offscreenTexts.push({ text: (fullText || name).slice(0, 80), box: box(measure), inScroller: !!vis.scrollAncestor });
			continue;
		}
		// Text colour: CSS colour with the element's effective opacity
		const col = rgba(cs.color);
		const fill = cs.webkitTextFillColor && cs.webkitTextFillColor !== cs.color ? rgba(cs.webkitTextFillColor) : null;
		// Background from the DOM chain (fallback for post.py, which samples the pixels)
		let bg = [0, 0, 0, 0];
		let bgImage = false;
		for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
			const ecs = getComputedStyle(e);
			if (ecs.backgroundImage && ecs.backgroundImage !== 'none') bgImage = true;
			const c = rgba(ecs.backgroundColor);
			if (c[3] > 0) bg = bg[3] === 0 ? c : over(bg, c);
			if (bg[3] >= 0.999) break;
		}
		const id = 'e' + idx++;
		el.setAttribute('data-mx', id);
		const rec = {
			id,
			kind: isControl ? 'control' : 'text',
			role: role(el, cs, text, isControl),
			tag,
			text: (fullText || '').slice(0, 160),
			...(name && name !== fullText ? { name: name.slice(0, 120) } : {}),
			sel: label(el),
			testid: testid(el),
			box: box(rect),
			...(tr ? { textBox: box(tr) } : {}),
			visibleBox: box(vis.rect),
			partlyHidden: r1(vis.rect.width * vis.rect.height) < r1(measure.width * measure.height) - 1,
			...(pageMode ? { inViewport: measure.bottom > 0 && measure.top < vh && measure.right > 0 && measure.left < vw } : {}),
			font: {
				family: cs.fontFamily,
				size: parseFloat(cs.fontSize),
				weight: cs.fontWeight,
				lineHeight: cs.lineHeight === 'normal' ? 'normal' : parseFloat(cs.lineHeight),
				letterSpacing: cs.letterSpacing,
				transform: cs.textTransform,
				style: cs.fontStyle === 'normal' ? undefined : cs.fontStyle,
				variantNumeric: cs.fontVariantNumeric === 'normal' ? undefined : cs.fontVariantNumeric,
				align: cs.textAlign
			},
			color: col,
			...(fill ? { fill } : {}),
			opacity: r1(op),
			bgDom: bg.map((v, i) => (i < 3 ? Math.round(v) : r1(v))),
			...(bgImage ? { bgDomHasImage: true } : {}),
			...(cs.textShadow !== 'none' ? { textShadow: cs.textShadow.slice(0, 80) } : {})
		};
		elements.push(rec);
		// Sample points for the occlusion pass: centre, and a quarter in from each side
		const vr = vis.rect;
		const cy = vr.top + vr.height / 2;
		pending.push({ rec, el, points: [[vr.left + vr.width / 2, cy], [vr.left + vr.width * 0.25, cy], [vr.left + vr.width * 0.75, cy]] });

		// Clipped text: overflow hidden or an ellipsis, with more content than room
		const clipsX = cs.overflowX !== 'visible' || cs.textOverflow === 'ellipsis';
		const clipsY = cs.overflowY !== 'visible' || (cs.webkitLineClamp && cs.webkitLineClamp !== 'none');
		if ((clipsX && el.scrollWidth > el.clientWidth + 1) || (clipsY && el.scrollHeight > el.clientHeight + 1 && !/auto|scroll/.test(cs.overflowY))) {
			clipped.push({ id, text: rec.text.slice(0, 80), sel: rec.sel, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, why: cs.textOverflow === 'ellipsis' ? 'ellipsis' : 'overflow ' + cs.overflowX + '/' + cs.overflowY });
		} else if (rec.partlyHidden && !vis.scrollAncestor && (measure.right <= vw + 0.5 && measure.left >= -0.5)) {
			clipped.push({ id, text: rec.text.slice(0, 80), sel: rec.sel, why: 'cut by a clipping ancestor', box: box(measure), visibleBox: box(vis.rect) });
		}
		// Outside the viewport (horizontally always a fault; vertically when nothing can scroll it in)
		const docScrolls = doc.scrollHeight > vh + 1 && getComputedStyle(document.body).overflowY !== 'hidden' && getComputedStyle(doc).overflowY !== 'hidden';
		const edges = [];
		if (measure.left < -0.5) edges.push('left');
		if (measure.right > vw + 0.5) edges.push('right');
		if (!pageMode && measure.top < -0.5) edges.push('top');
		if (!pageMode && measure.bottom > vh + 0.5) edges.push('bottom');
		if (edges.length) {
			const fixed = (() => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) if (getComputedStyle(e).position === 'fixed') return true; return false; })();
			const reachable = !edges.some((e) => e === 'left' || e === 'right') && (!!vis.scrollAncestor || (docScrolls && !fixed));
			outside.push({ id, text: rec.text.slice(0, 80), sel: rec.sel, edges, reachable, box: box(measure) });
		}
		// Tap targets on touch viewports
		if (touch && isControl && cs.pointerEvents !== 'none') {
			if (rect.width < 44 || rect.height < 44) {
				smallTargets.push({ id, text: (name || fullText).slice(0, 60), sel: rec.sel, w: r1(rect.width), h: r1(rect.height), under24: rect.width < 24 || rect.height < 24, inline: cs.display === 'inline' });
			}
		}
	}
	// Occlusion: what paints on top at each sample point. Hit-testing normally skips elements with
	// pointer-events: none, so it is forced on for the probe; then decorative layers (pointer-events
	// none and no text of their own) are passed over, and the first real element must be the
	// element itself, inside it, or one of its ancestors.
	if (!pageMode) {
		const st = document.createElement('style');
		st.textContent = '*, *::before, *::after { pointer-events: auto !important; }';
		document.head.appendChild(st);
		const stacks = pending.map((p) => p.points.map(([x, y]) => (x >= 0 && y >= 0 && x < vw && y < vh ? document.elementsFromPoint(x, y) : [])));
		st.remove();
		const peNone = new Map();
		const decorative = (e) => {
			if (!peNone.has(e)) peNone.set(e, getComputedStyle(e).pointerEvents === 'none' && !ownText(e));
			return peNone.get(e);
		};
		pending.forEach((p, i) => {
			let hidden = 0;
			let by = null;
			for (const stack of stacks[i]) {
				const top = stack.find((e) => !decorative(e) && e !== doc && e !== document.body);
				if (!top) continue;
				if (top === p.el || p.el.contains(top) || top.contains(p.el)) continue;
				hidden++;
				by = by || top;
			}
			if (hidden === p.points.length) p.rec.covered = true;
			else if (hidden) p.rec.partlyCovered = true;
			if (by) p.rec.coveredBy = label(by);
		});
	}
	return {
		pageMode,
		url: location.pathname + location.search,
		title: document.title,
		viewport: { w: vw, h: vh },
		dpr: window.devicePixelRatio,
		scroll: { x: window.scrollX, y: window.scrollY },
		doc: { scrollWidth: doc.scrollWidth, scrollHeight: doc.scrollHeight, clientWidth: doc.clientWidth },
		pageOverflowX: doc.scrollWidth > vw,
		pageScrollsY: doc.scrollHeight > vh + 1,
		counts: { elements: elements.length, srOnly, inert, transparent, offscreen },
		offscreenTexts,
		elements,
		clipped,
		outside,
		smallTargets,
		activeElement: document.activeElement ? label(document.activeElement) : null
	};
}

/** Which font actually rendered each element's text (CDP), keyed by data-mx id */
async function renderedFonts(page, cdp) {
	const out = {};
	try {
		const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: false });
		const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '[data-mx]' });
		for (const nodeId of nodeIds) {
			const attrs = await cdp.send('DOM.getAttributes', { nodeId }).catch(() => null);
			if (!attrs) continue;
			const i = attrs.attributes.indexOf('data-mx');
			const id = attrs.attributes[i + 1];
			const res = await cdp.send('CSS.getPlatformFontsForNode', { nodeId }).catch(() => null);
			if (res && res.fonts && res.fonts.length) {
				out[id] = res.fonts.map((f) => f.familyName + (f.isCustomFont ? '' : ' (system)')).join(', ');
			}
		}
	} catch (e) {
		out.__error = e.message.split('\n')[0];
	}
	return out;
}

/** Screenshot + metrics for one state at one viewport */
async function capture(page, cdp, state, vpKey, { fullPage = false, note = '' } = {}) {
	const dir = path.join(SHOTS, state);
	fs.mkdirSync(dir, { recursive: true });
	fs.mkdirSync(path.join(RAW, state), { recursive: true });
	const file = path.join(dir, `${vpKey}.png`);
	const touch = !!ALL_VIEWPORTS[vpKey].touch;
	// Measure first (it tags nodes for the font lookup), then shoot
	let metrics = await page.evaluate(collectInPage, { touch });
	await page.screenshot({ path: file, animations: 'allow', caret: 'initial' });
	if (fullPage && metrics.pageScrollsY) {
		// The page scrolls: measure the whole document against a full-page shot instead
		await page.evaluate(() => document.querySelectorAll('[data-mx]').forEach((e) => e.removeAttribute('data-mx')));
		await page.screenshot({ path: path.join(dir, `${vpKey}-full.png`), fullPage: true });
		metrics = await page.evaluate(collectInPage, { touch, pageMode: true });
		metrics.fullPageShot = `${vpKey}-full.png`;
	}
	const fonts = await renderedFonts(page, cdp);
	for (const e of metrics.elements) if (fonts[e.id]) e.font.rendered = fonts[e.id];
	if (fonts.__error) metrics.fontError = fonts.__error;
	await page.evaluate(() => document.querySelectorAll('[data-mx]').forEach((e) => e.removeAttribute('data-mx'))).catch(() => {});
	metrics.state = state;
	metrics.vp = vpKey;
	metrics.shot = path.relative(OUT, file);
	if (note) metrics.note = note;
	metrics.capturedAt = new Date().toISOString();
	fs.writeFileSync(path.join(RAW, state, `${vpKey}.json`), JSON.stringify(metrics));
	return metrics;
}

module.exports = {
	SP, DR, ROUND, BASE, OUT, SHOTS, RAW, TOOLS,
	VIEWPORTS, EXTENDED, ALL_VIEWPORTS, CORE_ORDER,
	launchBrowser, newContext, newPage, store, settle, capture, collectInPage
};
