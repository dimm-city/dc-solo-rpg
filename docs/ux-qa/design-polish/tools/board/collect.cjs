// In-page metrics collector (passed to page.evaluate; must be self-contained).
// Returns every visible text run and control with its box and computed type, plus page-level
// problems: horizontal overflow, clipped text, things outside the viewport, small tap targets,
// and the board landmarks used by the drift report.
function collect({ touch = false, hudOnly = false } = {}) {
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const de = document.documentElement;
	const R = (r) => (r ? { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) } : null);
	const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
	const union = (rects) => {
		let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
		for (const r of rects) {
			if (!r || r.width <= 0 || r.height <= 0) continue;
			x1 = Math.min(x1, r.left); y1 = Math.min(y1, r.top); x2 = Math.max(x2, r.right); y2 = Math.max(y2, r.bottom);
		}
		return x1 === Infinity ? null : new DOMRect(x1, y1, x2 - x1, y2 - y1);
	};
	const intersect = (a, b) => {
		const x1 = Math.max(a.left, b.left), y1 = Math.max(a.top, b.top), x2 = Math.min(a.right, b.right), y2 = Math.min(a.bottom, b.bottom);
		return x2 > x1 && y2 > y1 ? new DOMRect(x1, y1, x2 - x1, y2 - y1) : null;
	};
	const csCache = new Map();
	const cs = (el) => {
		let s = csCache.get(el);
		if (!s) { s = getComputedStyle(el); csCache.set(el, s); }
		return s;
	};
	const effOpacity = (el) => {
		let o = 1;
		for (let e = el; e && e.nodeType === 1; e = e.parentElement) o *= parseFloat(cs(e).opacity);
		return +o.toFixed(3);
	};
	const shown = (el) => {
		if (!el.getClientRects().length) return false;
		const s = cs(el);
		if (s.visibility === 'hidden' || s.display === 'none' || s.contentVisibility === 'hidden') return false;
		return true;
	};
	const isSrOnly = (el) => {
		for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
			const s = cs(e);
			const r = e.getBoundingClientRect();
			if (e.classList.contains('sr-only') || e.classList.contains('visually-hidden')) return true;
			if ((s.position === 'absolute' || s.position === 'fixed') && r.width <= 1.5 && r.height <= 1.5 && s.overflow !== 'visible') return true;
			if (s.clip && s.clip !== 'auto' && /rect\(0(px)?,? ?0(px)?/.test(s.clip)) return true;
		}
		return false;
	};
	const hashClass = (c) => /^s-[A-Za-z0-9_-]{6,}$/.test(c) || /^svelte-/.test(c);
	const desc = (el) => {
		if (!el || el.nodeType !== 1) return '';
		let s = el.tagName.toLowerCase();
		if (el.id) s += '#' + el.id;
		const cls = [...el.classList].filter((c) => !hashClass(c)).slice(0, 3);
		if (cls.length) s += '.' + cls.join('.');
		const t = el.getAttribute('data-testid');
		if (t) s += `[data-testid=${t}]`;
		return s;
	};
	const path = (el) => {
		const parts = [];
		for (let e = el, i = 0; e && e.nodeType === 1 && i < 4 && e !== document.body; e = e.parentElement, i++) parts.unshift(desc(e));
		return parts.join(' > ');
	};
	/** The part of el's rect not clipped away by an overflow ancestor (null if none is visible) */
	const clipChain = (el, rect) => {
		let vis = rect;
		let by = null;
		for (let e = el.parentElement; e && e !== de; e = e.parentElement) {
			const s = cs(e);
			if (s.overflowX !== 'visible' || s.overflowY !== 'visible' || (s.clipPath && s.clipPath !== 'none' && false)) {
				const r = e.getBoundingClientRect();
				const cut = intersect(vis, r);
				if (!cut) return { vis: null, by: desc(e) };
				if (cut.width + 0.5 < vis.width || cut.height + 0.5 < vis.height) by = by || desc(e);
				vis = cut;
			}
			if (s.position === 'fixed') break;
		}
		return { vis, by };
	};
	const parseColor = (c) => {
		const m = c.match(/rgba?\(([^)]+)\)/);
		if (m) {
			const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
			return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
		}
		const k = c.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/);
		if (k) return [k[1] * 255, k[2] * 255, k[3] * 255, k[4] !== undefined ? +k[4] : 1];
		return null;
	};
	/** background-color composited up the ancestor chain (gradients and images noted, not mixed) */
	const domBg = (el) => {
		const layers = [];
		let image = null;
		for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
			const s = cs(e);
			if (!image && s.backgroundImage && s.backgroundImage !== 'none') image = desc(e) + ' ' + s.backgroundImage.slice(0, 80);
			const c = parseColor(s.backgroundColor);
			if (c && c[3] > 0) {
				layers.push(c);
				if (c[3] >= 1) break;
			}
		}
		let rgb = [0, 0, 0];
		for (let i = layers.length - 1; i >= 0; i--) {
			const [r, g, b, a] = layers[i];
			rgb = [r * a + rgb[0] * (1 - a), g * a + rgb[1] * (1 - a), b * a + rgb[2] * (1 - a)];
		}
		return { rgb: rgb.map((v) => Math.round(v)), image };
	};
	const ROLES = [
		['[data-testid="context-title"]', 'screen title'],
		['[data-testid="result-line"]', 'result line'],
		['.context-description', 'screen description'],
		['[data-testid="context-card"]', 'card line (eyebrow)'],
		['[data-testid="context-notice"]', 'modifier notice'],
		['.rule-label', 'rule caption label'],
		['.rule-text', 'rule caption'],
		['#step-action .label-main', 'step button label'],
		['#step-action .label-hint', 'step button modifier hint'],
		['.key-hint', 'keyboard hint'],
		['.status-hud .hud-label', 'HUD label'],
		['.status-hud .hud-max', 'HUD value max'],
		['.status-hud .led-off', 'HUD LED unlit segments'],
		['.status-hud .hud-value', 'HUD value'],
		['.status-hud', 'HUD text'],
		['.player-round-bar .game-title', 'header title'],
		['.player-round-bar .btn-label', 'header button label'],
		['.player-round-bar .info-segment .label', 'header label'],
		['.player-round-bar .info-segment .value', 'header value'],
		['.game-menu .state', 'header menu item state'],
		['.game-menu', 'header menu item'],
		['[data-testid="card-progress"]', 'card deal progress'],
		['.type-label', 'card type label'],
		['.corner-index', 'card corner index'],
		['.byte-data', 'card title'],
		['.byte-story', 'card story'],
		['[data-testid="card-mechanic"]', 'card mechanic note'],
		['[data-testid="card-modifier"]', 'card modifier note'],
		['.tap-hint', 'card tap hint'],
		['[data-testid="card"]', 'card text'],
		['.skip-link', 'skip link'],
		['[data-testid="intro-goal"]', 'intro goal'],
		['.intro-column h1', 'intro title'],
		['.intro-column', 'intro body text'],
		['[role="dialog"] h1, [role="dialog"] h2, [role="dialog"] h3, [role="alertdialog"] h2', 'dialog heading'],
		['[role="dialog"], [role="alertdialog"]', 'dialog text'],
		['textarea, input', 'field text'],
		['label', 'label'],
		['button, [role="button"], a', 'button/link text'],
		['h1, h2, h3, h4, h5, h6', 'heading'],
		['p, li, blockquote', 'body text']
	];
	const roleOf = (el) => {
		for (const [sel, role] of ROLES) if (el.matches(sel)) return role;
		for (const [sel, role] of ROLES) if (el.closest(sel)) return role;
		return 'text';
	};
	const font = (s) => ({
		family: s.fontFamily.slice(0, 80),
		size: parseFloat(s.fontSize),
		weight: s.fontWeight,
		style: s.fontStyle,
		lineHeight: s.lineHeight,
		letterSpacing: s.letterSpacing,
		transform: s.textTransform,
		align: s.textAlign,
		variantNumeric: s.fontVariantNumeric
	});
	const hudBox = document.querySelector('[data-testid="hud"]')?.getBoundingClientRect() ?? null;
	const inHud = (r) => hudBox && r && r.left >= hudBox.left - 1 && r.right <= hudBox.right + 1 && r.top >= hudBox.top - 1 && r.bottom <= hudBox.bottom + 1;

	// Hit tests: the element under test takes pointer events for the moment (its ancestors may
	// set none), so whatever is hit at a point of its text is either it or something on top of it.
	// Empty full-screen layers with pointer-events: none (modal portals) are not hit.
	const occludedFrac = (el, r) => {
		if (!r) return null;
		const prev = el.style.getPropertyValue('pointer-events');
		const prio = el.style.getPropertyPriority('pointer-events');
		el.style.setProperty('pointer-events', 'auto', 'important');
		const ys = r.top + r.height / 2;
		const xs = [0.2, 0.5, 0.8].map((f) => r.left + r.width * f);
		let covered = 0, tested = 0;
		const by = [];
		for (const x of xs) {
			if (x < 0 || x >= vw || ys < 0 || ys >= vh) continue;
			tested++;
			const hit = document.elementFromPoint(x, ys);
			if (!hit || !(hit === el || el.contains(hit) || hit.contains(el))) {
				covered++;
				if (hit) by.push(desc(hit));
			}
		}
		if (prev) el.style.setProperty('pointer-events', prev, prio);
		else el.style.removeProperty('pointer-events');
		lastOccluder = by[0] || null;
		return tested ? +(covered / tested).toFixed(2) : null;
	};
	let lastOccluder = null;

	// ---- Text runs: elements that own non-blank text nodes (and ::before/::after text) ----
	const owners = new Map();
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	for (let n = walker.nextNode(); n; n = walker.nextNode()) {
		if (!n.nodeValue.trim()) continue;
		const p = n.parentElement;
		if (!p || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TITLE'].includes(p.tagName)) continue;
		if (p.closest('svg')) continue;
		if (!owners.has(p)) owners.set(p, []);
		owners.get(p).push(n);
	}
	// Pseudo-element text (the key-cap hint uses content: attr(data-hint))
	for (const el of document.querySelectorAll('[data-hint], .key-hint')) if (!owners.has(el)) owners.set(el, []);
	for (const el of document.querySelectorAll('textarea, input:not([type=hidden])')) if (!owners.has(el)) owners.set(el, []);

	const texts = [];
	const problems = { clipped: [], outside: [], smallTargets: [], scrollable: [], offscreen: [] };
	for (const [el, nodes] of owners) {
		if (!shown(el) || isSrOnly(el)) continue;
		const s = cs(el);
		let text = norm(nodes.map((n) => n.nodeValue).join(' '));
		let rect = null;
		if (nodes.length) {
			const rects = [];
			for (const n of nodes) {
				const range = document.createRange();
				range.selectNodeContents(n);
				rects.push(...range.getClientRects());
			}
			rect = union(rects);
		}
		if (!text) {
			if (el.matches('textarea, input')) text = norm(el.value || el.placeholder || '');
			const before = getComputedStyle(el, '::before').content;
			if (!text && before && before !== 'none' && before !== 'normal') text = norm(before.replace(/^"|"$/g, '')) || norm(el.getAttribute('data-hint'));
			rect = el.getBoundingClientRect();
		}
		if (!text || !rect || rect.width < 1 || rect.height < 1) continue;
		if (hudOnly && !inHud(rect)) continue;
		const op = effOpacity(el);
		if (op < 0.02) continue;
		const { vis, by } = clipChain(el, rect);
		if (!vis) continue; // scrolled or clipped out of view entirely
		if (vis.right <= 0 || vis.left >= vw || vis.bottom <= 0 || vis.top >= vh) {
			problems.offscreen.push({ text: text.slice(0, 80), el: path(el), box: R(vis) });
			continue; // parked off-screen on purpose (a skip link until focused) or scrolled away
		}
		const box = el.getBoundingClientRect();
		const entry = {
			role: roleOf(el),
			text: text.slice(0, 200),
			el: path(el),
			box: R(box),
			textBox: R(rect),
			visibleBox: R(vis),
			lines: Math.max(1, Math.round(rect.height / (parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.2))),
			font: font(s),
			color: s.color,
			textFill: s.webkitTextFillColor !== s.color ? s.webkitTextFillColor : undefined,
			textShadow: s.textShadow !== 'none' ? s.textShadow.slice(0, 60) : undefined,
			opacity: op,
			domBg: domBg(el),
			occluded: occludedFrac(el, vis)
		};
		if (entry.occluded) entry.occludedBy = lastOccluder;
		texts.push(entry);
		if (by) problems.clipped.push({ kind: 'cut by ancestor', text: entry.text.slice(0, 80), el: entry.el, by, textBox: entry.textBox, visibleBox: entry.visibleBox });
		const out = { left: +(-vis.left).toFixed(1), right: +(vis.right - vw).toFixed(1), top: +(-vis.top).toFixed(1), bottom: +(vis.bottom - vh).toFixed(1) };
		if (out.left > 0.5 || out.right > 0.5 || out.top > 0.5 || out.bottom > 0.5) problems.outside.push({ kind: 'text', text: entry.text.slice(0, 80), el: entry.el, box: R(vis), by: out });
	}

	// ---- Own-box overflow: text cut by its own overflow or ellipsis ----
	for (const el of document.querySelectorAll('body *')) {
		if (!shown(el) || isSrOnly(el)) continue;
		const s = cs(el);
		const clipX = s.overflowX !== 'visible' || s.textOverflow === 'ellipsis';
		const clipY = s.overflowY !== 'visible' || (s.webkitLineClamp && s.webkitLineClamp !== 'none');
		if (!clipX && !clipY) continue;
		const over = (clipX && el.scrollWidth > el.clientWidth + 1) || (clipY && el.scrollHeight > el.clientHeight + 1);
		if (!over) continue;
		const t = norm(el.innerText || '');
		if (!t) continue;
		const r = el.getBoundingClientRect();
		if (hudOnly && !inHud(r)) continue;
		const scrolls = /auto|scroll/.test(s.overflowX + s.overflowY);
		const rec = { el: path(el), text: t.slice(0, 80), box: R(r), scrollW: el.scrollWidth, clientW: el.clientWidth, scrollH: el.scrollHeight, clientH: el.clientHeight, overflow: `${s.overflowX}/${s.overflowY}`, textOverflow: s.textOverflow };
		if (scrolls) problems.scrollable.push(rec);
		else problems.clipped.push({ kind: 'own overflow', ...rec });
	}

	// ---- Controls ----
	const controls = [];
	const seen = new Set();
	for (const el of document.querySelectorAll('button, a[href], input:not([type=hidden]), textarea, select, summary, [role="button"], [role="menuitem"], [role="switch"], [tabindex]:not([tabindex="-1"])')) {
		if (seen.has(el) || !shown(el) || isSrOnly(el)) continue;
		seen.add(el);
		const r = el.getBoundingClientRect();
		if (r.width < 1 || r.height < 1) continue;
		if (hudOnly && !inHud(r)) continue;
		const op = effOpacity(el);
		if (op < 0.02) continue;
		const { vis } = clipChain(el, r);
		if (!vis) continue;
		if (vis.right <= 0 || vis.left >= vw || vis.bottom <= 0 || vis.top >= vh) {
			problems.offscreen.push({ text: norm(el.getAttribute('aria-label') || el.innerText || '').slice(0, 80), el: path(el), box: R(vis) });
			continue;
		}
		const s = cs(el);
		const c = {
			kind: el.tagName.toLowerCase() + (el.getAttribute('role') ? `[role=${el.getAttribute('role')}]` : ''),
			name: norm(el.getAttribute('aria-label') || el.innerText || el.value || el.title || '').slice(0, 120),
			el: path(el),
			box: R(r),
			disabled: !!el.disabled || el.getAttribute('aria-disabled') === 'true',
			focused: document.activeElement === el,
			opacity: op,
			cursor: s.cursor,
			occluded: occludedFrac(el, vis)
		};
		controls.push(c);
		if (touch && (r.width < 44 || r.height < 44)) problems.smallTargets.push({ name: c.name, el: c.el, w: +r.width.toFixed(1), h: +r.height.toFixed(1) });
		const out = { left: +(-r.left).toFixed(1), right: +(r.right - vw).toFixed(1), top: +(-r.top).toFixed(1), bottom: +(r.bottom - vh).toFixed(1) };
		if (out.left > 0.5 || out.right > 0.5 || out.top > 0.5 || out.bottom > 0.5) problems.outside.push({ kind: 'control', text: c.name, el: c.el, box: c.box, by: out });
	}

	// ---- Landmarks for the drift report ----
	const textBoxOf = (el) => {
		if (!el) return null;
		const range = document.createRange();
		range.selectNodeContents(el);
		return R(union([...range.getClientRects()]));
	};
	const mark = (sel, { text = true } = {}) => {
		const el = document.querySelector(sel);
		if (!el || !shown(el) || effOpacity(el) < 0.02) return null;
		return { box: R(el.getBoundingClientRect()), text: text ? textBoxOf(el) : undefined, content: norm(el.innerText).slice(0, 140) };
	};
	const landmarks = {
		header: mark('.player-round-bar', { text: false }),
		hud: mark('[data-testid="hud"]', { text: false }),
		eyebrow: mark('[data-testid="context-card"]'),
		title: mark('[data-testid="context-title"]'),
		caption: mark('[data-testid="rule-caption"]'),
		description: mark('.context-description'),
		result: mark('[data-testid="result-line"]'),
		notice: mark('[data-testid="context-notice"]'),
		stepButton: mark('#step-action .aug-button', { text: false }),
		stepLabel: mark('#step-action .label-main'),
		stepHint: mark('#step-action .label-hint'),
		keyHint: mark('#step-action .key-hint', { text: false }),
		card: mark('[data-testid="card"]', { text: false }),
		cardProgress: mark('[data-testid="card-progress"]')
	};
	const labelCount = document.querySelectorAll('#step-action .label').length;

	return {
		vw,
		vh,
		dpr: window.devicePixelRatio,
		scrollWidth: de.scrollWidth,
		scrollHeight: de.scrollHeight,
		pageOverflowX: de.scrollWidth > vw,
		pageOverflowY: de.scrollHeight > vh,
		pointerFine: matchMedia('(hover: hover) and (pointer: fine)').matches,
		reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
		activeElement: desc(document.activeElement),
		stepLabelsInDom: labelCount,
		landmarks,
		texts,
		controls,
		problems
	};
}

module.exports = { collect };
