#!/usr/bin/env python3
"""Build the board review outputs from the raw captures (run after capture.cjs).

ROUND=1 python3 -I build.py

Writes, under round-N/:
  metrics-board.json        every text run and control per state and viewport, with contrast
  sheets/board/<state>.png  contact sheets (core viewports), <state>-extended.png, hud-tiers*.png
  sheets/board/drift-<vp>.png and drift-board.md
  manifest-board.md
"""
import json
import os
import re
import subprocess
import sys
from collections import OrderedDict, defaultdict
from datetime import datetime, timezone

import numpy as np
from PIL import Image, ImageDraw, ImageFont

SP = '/tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review'
ROUND = os.environ.get('ROUND', '1')
OUT = f'{SP}/round-{ROUND}'
RAW = f'{OUT}/raw/board'
SHOTS = f'{OUT}/shots/board'
SHEETS = f'{OUT}/sheets/board'
os.makedirs(SHEETS, exist_ok=True)

CORE = ['android-small', 'iphone-13', 'iphone-13-landscape', 'ipad-portrait', 'laptop', 'desktop']
EXT = ['iphone-se', 'pixel-7', 'ipad-landscape', 'fhd']
SIZES = {
    'android-small': (360, 640, 2), 'iphone-13': (390, 844, 2), 'iphone-13-landscape': (844, 390, 2),
    'ipad-portrait': (768, 1024, 1), 'laptop': (1280, 720, 1), 'desktop': (1440, 900, 1),
    'iphone-se': (375, 667, 2), 'pixel-7': (412, 915, 2), 'ipad-landscape': (1024, 768, 1), 'fhd': (1920, 1080, 1),
}
DRIFT_VPS = ['android-small', 'iphone-13', 'iphone-13-landscape', 'desktop']
DRIFT_ELEMENTS = [
    # key, label, which box
    ('title', 'screen title', 'text'),
    ('caption', 'rule caption', 'box'),
    ('result', 'result line', 'text'),
    ('stepButton', 'step button', 'box'),
    ('stepLabel', 'step label', 'text'),
]
GUIDE_COLORS = {'title': (255, 215, 0), 'caption': (0, 255, 128), 'result': (255, 80, 200), 'stepButton': (0, 200, 255)}


def font(size, bold=False):
    path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


# ---------------------------------------------------------------- colour and contrast
def parse_color(c):
    if not c:
        return None
    m = re.match(r'rgba?\(([^)]+)\)', c)
    if m:
        parts = [p for p in re.split(r'[ ,/]+', m.group(1)) if p]
        v = [float(p) for p in parts]
        return (v[0], v[1], v[2], v[3] if len(v) > 3 else 1.0)
    m = re.match(r'color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: / ([\d.]+))?\)', c)
    if m:
        return (float(m.group(1)) * 255, float(m.group(2)) * 255, float(m.group(3)) * 255, float(m.group(4)) if m.group(4) else 1.0)
    return None


def lum(rgb):
    def ch(v):
        v = v / 255.0
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = rgb[:3]
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def contrast(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def over(fg, alpha, bg):
    return tuple(fg[i] * alpha + bg[i] * (1 - alpha) for i in range(3))


def hexc(rgb):
    return '#%02x%02x%02x' % tuple(int(round(max(0, min(255, v)))) for v in rgb[:3])


def sample_bg(img, box, dsf):
    """Median colour behind a text box in the text-free shot, plus its darkest and lightest tenth"""
    if not box:
        return None
    h, w = img.shape[:2]
    x1 = int(max(0, np.floor(box['x'] * dsf)))
    y1 = int(max(0, np.floor(box['y'] * dsf)))
    x2 = int(min(w, np.ceil((box['x'] + box['w']) * dsf)))
    y2 = int(min(h, np.ceil((box['y'] + box['h']) * dsf)))
    if x2 - x1 < 1 or y2 - y1 < 1:
        return None
    px = img[y1:y2, x1:x2, :3].reshape(-1, 3).astype(np.float64)
    med = np.median(px, axis=0)
    lums = 0.2126 * px[:, 0] + 0.7152 * px[:, 1] + 0.0722 * px[:, 2]
    order = np.argsort(lums)
    lo = px[order[int(len(order) * 0.1)]]
    hi = px[order[min(len(order) - 1, int(len(order) * 0.9))]]
    return tuple(med), tuple(lo), tuple(hi)


def text_contrast(t, img, dsf):
    fill = t.get('textFill')
    col = parse_color(fill) if fill and 'rgba(0, 0, 0, 0)' not in fill else None
    col = col or parse_color(t.get('color'))
    s = sample_bg(img, t.get('visibleBox') or t.get('textBox'), dsf)
    if not col or not s:
        return {}
    med, lo, hi = s
    a = col[3] * (t.get('opacity') or 1)
    fg = over(col, a, med)
    c = contrast(fg, med)
    cmin = min(contrast(over(col, a, lo), lo), contrast(over(col, a, hi), hi))
    size = t['font']['size']
    try:
        weight = int(t['font']['weight'])
    except ValueError:
        weight = 400
    large = size >= 24 or (size >= 18.66 and weight >= 700)
    need = 3.0 if large else 4.5
    behind = (t.get('occluded') or 0) >= 0.67
    decorative = t.get('role') == 'HUD LED unlit segments'
    return {
        'fg': hexc(fg), 'bg': hexc(med), 'bgRange': [hexc(lo), hexc(hi)],
        'contrast': round(c, 2), 'contrastMin': round(cmin, 2), 'aaNeeds': need,
        'aa': 'n/a (decorative unlit segments)' if decorative else 'n/a (behind an overlay)' if behind else ('pass' if c >= need else 'FAIL'),
    }


# ---------------------------------------------------------------- load
def load_records():
    recs = defaultdict(dict)  # state -> vp -> rec
    for state in sorted(os.listdir(RAW)):
        d = f'{RAW}/{state}'
        if not os.path.isdir(d):
            continue
        for f in os.listdir(d):
            if f.endswith('.json'):
                with open(f'{d}/{f}') as fh:
                    rec = json.load(fh)
                recs[state][rec['vp']] = rec
    return recs


def state_order(recs):
    """States in script order: by group (the order the groups run in), then by position within the
    group in the capture sequence of the first viewport that has the state"""
    group_rank = {'home': 0, 'normal': 1, 'autoplay': 2, 'easy': 3, 'hard': 4, 'captions': 5, 'captionsEasy': 6, 'captionsHard': 7, 'reduced': 8, 'hud': 9, 'extended': 10}
    def group_of(s):
        for vp in CORE + EXT:
            if vp in recs[s]:
                return recs[s][vp].get('group') or ''
        return ''
    seq_pos = {}
    for vp in CORE + EXT:
        seq = sorted([(by[vp]['capturedAt'], s) for s, by in recs.items() if vp in by])
        per_group = defaultdict(int)
        for _, s in seq:
            g = recs[s][vp].get('group') or ''
            if (s not in seq_pos):
                seq_pos[s] = per_group[g]
            per_group[g] += 1
    return sorted(recs.keys(), key=lambda s: (group_rank.get(group_of(s), 9), seq_pos.get(s, 999), s))


# ---------------------------------------------------------------- metrics
def build_metrics(recs, order):
    states = OrderedDict()
    summary = OrderedDict()
    issues = []
    for state in order:
        by = recs[state]
        any_rec = next(iter(by.values()))
        entry = {'how': any_rec.get('how', ''), 'group': any_rec.get('group', ''), 'board': any_rec.get('board', False), 'hud': any_rec.get('hud', False), 'viewports': OrderedDict()}
        summary[state] = OrderedDict()
        for vp in CORE + EXT:
            if vp not in by:
                continue
            rec = by[vp]
            m = rec['metrics']
            dsf = rec['dsf']
            img_path = f'{RAW}/{state}/{vp}.notext.png'
            img = np.asarray(Image.open(img_path).convert('RGB')) if os.path.exists(img_path) else None
            texts = []
            fails = 0
            minc = None
            for t in m['texts']:
                c = text_contrast(t, img, dsf) if img is not None else {}
                out = {
                    'role': t['role'], 'text': t['text'], 'el': t['el'],
                    'box': t['box'], 'textBox': t['textBox'], 'lines': t['lines'],
                    'fontFamily': t['font']['family'], 'fontSize': t['font']['size'], 'fontWeight': t['font']['weight'],
                    'fontStyle': t['font']['style'], 'lineHeight': t['font']['lineHeight'], 'letterSpacing': t['font']['letterSpacing'],
                    'textTransform': t['font']['transform'], 'textAlign': t['font']['align'], 'numeric': t['font'].get('variantNumeric'),
                    'color': t['color'], 'opacity': t['opacity'], 'textShadow': t.get('textShadow'),
                    'background': c.get('bg'), 'backgroundRange': c.get('bgRange'), 'backgroundDom': hexc(t['domBg']['rgb']) + (' + image/gradient' if t['domBg'].get('image') else ''),
                    'renderedText': c.get('fg'), 'contrast': c.get('contrast'), 'contrastMin': c.get('contrastMin'),
                    'aaNeeds': c.get('aaNeeds'), 'aa': c.get('aa'), 'occluded': t.get('occluded'), 'occludedBy': t.get('occludedBy'),
                }
                if t['visibleBox'] != t['textBox']:
                    out['visibleBox'] = t['visibleBox']
                texts.append(out)
                if c.get('aa') == 'FAIL':
                    fails += 1
                    issues.append({'state': state, 'vp': vp, 'kind': 'contrast', 'role': t['role'], 'text': t['text'][:60], 'contrast': c['contrast'], 'needs': c['aaNeeds'], 'fg': c['fg'], 'bg': c['bg']})
                if c.get('contrast') is not None and not str(c.get('aa', '')).startswith('n/a'):
                    minc = c['contrast'] if minc is None else min(minc, c['contrast'])
            p = m['problems']
            # Text partly scrolled out of a scroll container is not clipping: move it aside
            scrollers = [sc['el'] for sc in p.get('scrollable', [])]
            # A container whose content overflows it is only a problem when text is cut, and text cut
            # by a container is already listed as "cut by ancestor": keep "own overflow" only for an
            # element that owns text itself (ellipsis, line clamp, a fixed-size label)
            owners = {t['el'] for t in m['texts']}
            kept, scrolled, container = [], [], []
            for it in p['clipped']:
                if it.get('kind') == 'cut by ancestor' and any(el.endswith(it.get('by', '\0')) for el in scrollers):
                    scrolled.append(it)
                elif it.get('kind') == 'own overflow' and it.get('textOverflow') != 'ellipsis' and it.get('el') not in owners:
                    container.append(it)
                else:
                    kept.append(it)
            p = {**p, 'clipped': kept, 'partlyScrolledOut': scrolled, 'containerOverflow': container}
            for k in ('clipped', 'outside', 'smallTargets'):
                for it in p[k]:
                    rec_i = {'state': state, 'vp': vp, 'kind': k}
                    for kk in ('kind', 'text', 'name', 'el', 'by', 'w', 'h', 'box', 'textBox', 'visibleBox'):
                        if kk in it:
                            rec_i['detail' if kk == 'kind' else kk] = it[kk]
                    issues.append(rec_i)
            if m['pageOverflowX']:
                issues.append({'state': state, 'vp': vp, 'kind': 'pageOverflowX', 'scrollWidth': m['scrollWidth'], 'vw': m['vw']})
            entry['viewports'][vp] = {
                'page': {k: m[k] for k in ('vw', 'vh', 'dpr', 'scrollWidth', 'scrollHeight', 'pageOverflowX', 'pageOverflowY', 'pointerFine', 'reducedMotion', 'activeElement', 'stepLabelsInDom')},
                'shot': f'{SHOTS}/{state}/{vp}.png',
                'snap': rec.get('snap'),
                'landmarks': m['landmarks'],
                'texts': texts,
                'controls': m['controls'],
                'problems': p,
            }
            summary[state][vp] = {
                'texts': len(texts), 'controls': len(m['controls']), 'contrastFails': fails, 'minContrast': minc,
                'clipped': len(p['clipped']), 'outside': len(p['outside']), 'smallTargets': len(p['smallTargets']),
                'scrollable': len(p['scrollable']), 'partlyScrolledOut': len(p['partlyScrolledOut']), 'containerOverflow': len(p['containerOverflow']), 'pageOverflowX': m['pageOverflowX'],
            }
        states[state] = entry
    return states, summary, issues


HOW_TO_READ = [
    'states.<state>.viewports.<vp> holds one capture. texts: every visible text run (an element that owns text nodes, or a ::before key-cap hint). controls: every visible button, link, field or focusable element.',
    'Boxes are CSS px from the viewport top-left: box is the element, textBox the union of its text line boxes (the ink area, use this for alignment), visibleBox the part not cut off by an overflow ancestor (only when it differs).',
    'role is assigned by selector (screen title, result line, rule caption, step button label, HUD value, card title...), falling back to the tag.',
    'Typography fields are the computed style: fontFamily is the declared stack (the first face that loaded is what renders; lixdu = display, DSEG7 Classic = LED, Inter = UI/body, Share Tech Mono = mono), fontSize px, lineHeight px or normal, letterSpacing px or normal.',
    'background is the median colour behind the text, sampled from a second screenshot taken with every text colour set to transparent (so gradients, art, augmented-ui inlays and scrims are all included); backgroundRange is the darkest and lightest tenth of those pixels; backgroundDom is the CSS background-color chain, for reference only.',
    'renderedText is the text colour with its alpha and every ancestor opacity applied over the median background. contrast is the WCAG 2.x ratio of renderedText to background; contrastMin is the worst case against the darkest or lightest tenth. aaNeeds is 4.5 (normal) or 3 (large: >= 24px, or >= 18.66px at 700+). aa is pass, FAIL, or n/a when the text sits behind an overlay or scrim (occluded = share of 3 hit-test points on the text covered by another element).',
    'Text shadows and glows are not counted in the ratio (they usually help legibility); the LED unlit "88" segments are text, so they are removed from the background sample behind the lit digits.',
    'problems.clipped: text cut by its own overflow/ellipsis (kind "own overflow": the element\'s content is taller or wider than its box) or by a non-scrolling overflow ancestor ("cut by ancestor"). problems.scrollable: a scroll container with more content than it shows (not a defect by itself); problems.partlyScrolledOut: text cut only by such a scroll container (scrolled, not clipped); problems.containerOverflow: a non-scrolling container whose content is larger than it (informational: any text it actually cuts is listed under clipped as "cut by ancestor"). problems.outside: text or controls reaching past the viewport edge (by = px past each edge). problems.smallTargets: controls under 44x44 CSS px, on touch viewports only (box size; extended hit areas such as an inset ::before are not measured).',
    'page.pageOverflowX is document scrollWidth > innerWidth (horizontal page scroll). page.pointerFine says whether the key-cap hints (Space) are shown at that viewport. landmarks are the board elements the drift report tracks.',
    'issues is the flat list of every contrast FAIL, clipped text, out-of-viewport element, small tap target and page overflow, for quick filtering; summary has the counts per state and viewport.',
]


# ---------------------------------------------------------------- sheets
def label_band(img, text, sub=None, size=22, sub_size=16):
    band = 34 if not sub else (size + sub_size + 16)
    out = Image.new('RGB', (img.width, img.height + band), (24, 24, 30))
    d = ImageDraw.Draw(out)
    d.text((8, 5), text, fill=(240, 240, 240), font=font(size, True))
    if sub:
        d.text((8, size + 10), sub, fill=(180, 180, 190), font=font(sub_size))
    out.paste(img, (0, band))
    return out


def grid(tiles, max_w=2560, gap=16, bg=(12, 12, 16)):
    rows, row, w = [], [], 0
    for t in tiles:
        if row and w + gap + t.width > max_w:
            rows.append(row)
            row, w = [], 0
        row.append(t)
        w += (gap if len(row) > 1 else 0) + t.width
    if row:
        rows.append(row)
    W = max(sum(t.width for t in r) + gap * (len(r) - 1) for r in rows) + gap * 2
    H = sum(max(t.height for t in r) for r in rows) + gap * (len(rows) + 1)
    out = Image.new('RGB', (W, H), bg)
    y = gap
    for r in rows:
        x = gap
        for t in r:
            out.paste(t, (x, y))
            x += t.width + gap
        y += max(t.height for t in r) + gap
    return out


def vp_label(vp):
    w, h, d = SIZES[vp]
    return f'{vp}  {w}x{h} @{d}x'


def contact_sheet(state, vps, recs, suffix='', height=620):
    tiles = []
    for vp in vps:
        f = f'{SHOTS}/{state}/{vp}.png'
        if not os.path.exists(f):
            continue
        im = Image.open(f).convert('RGB')
        if recs[state].get(vp, {}).get('hud'):
            pass  # HUD rows at native device pixels (phones @2x), stacked
        else:
            im = im.resize((int(im.width * height / im.height), height), Image.LANCZOS)
        w, h, d = SIZES[vp]
        tiles.append(label_band(im, vp, f'{w}x{h} CSS px, @{d}x', size=18, sub_size=15))
    if not tiles:
        return None
    hud = recs[state][next(iter(recs[state]))].get('hud')
    if hud:
        # HUD rows are wide and short: one under the other, at native device pixels
        sheet = grid(tiles, max_w=1)
    else:
        sheet = grid(tiles, max_w=2560)
    title = label_band(sheet, f'{state}{suffix}', (next(iter(recs[state].values())).get('how') or '')[:160], size=24)
    path = f'{SHEETS}/{state}{suffix}.png'
    title.save(path)
    return path


def hud_tiers_sheet(order, recs, vps, name):
    hud_states = [s for s in order if next(iter(recs[s].values())).get('hud')]
    cols = []
    for vp in vps:
        tiles = []
        for s in hud_states:
            f = f'{SHOTS}/{s}/{vp}.png'
            if not os.path.exists(f):
                continue
            im = Image.open(f).convert('RGB')  # native device pixels (phones @2x)
            band = Image.new('RGB', (im.width, im.height + 22), (24, 24, 30))
            ImageDraw.Draw(band).text((6, 3), s.replace('hud-', ''), fill=(230, 230, 230), font=font(14, True))
            band.paste(im, (0, 22))
            tiles.append(band)
        if not tiles:
            continue
        col = grid(tiles, max_w=1, gap=6)
        cols.append(label_band(col, vp_label(vp)))
    if not cols:
        return None
    sheet = grid(cols, max_w=100000)
    path = f'{SHEETS}/{name}.png'
    label_band(sheet, 'HUD tier matrix', 'one value moved at a time from the start (Stability 20, Kings 0, Roll --, Cards 52, Aces 0, Tokens 10); native device pixels (phones @2x)', size=24).save(path)
    return path


# ---------------------------------------------------------------- drift
def lm_box(lm, which):
    if not lm:
        return None
    return lm.get('text') if which == 'text' and lm.get('text') else lm.get('box')


def drift(order, recs):
    md = [f'# Board drift, round {ROUND}', '',
          'Where the screen title, rule caption, result line, step button and step label sit in every board state, per viewport.',
          'Boxes are CSS px from the viewport top-left as x,y wxh. Title, result line and step label use the text box (ink of the lines);',
          'the caption and step button use the element box. Each element is compared with the first board state that shows it (the',
          '"reference", first row with a value); a cell marked **!** has its top edge, horizontal centre or height more than 2px off the',
          'reference (Δtop, Δbottom and Δcx are given; a width change alone is not flagged, since a different word changes a centred',
          'line\'s width without moving it). The max delta row gives max - min across all states per element. Captions only appear in',
          'caption-* states (rule tips are off elsewhere). Card, journal, intro, header-menu and game-over states are not board states.', '']
    sheets = []
    for vp in CORE:
        board = [s for s in order if vp in recs[s] and recs[s][vp].get('board')]
        if not board:
            continue
        md += [f'## {vp} ({SIZES[vp][0]}x{SIZES[vp][1]})', '']
        md.append('| state | ' + ' | '.join(lbl for _, lbl, _ in DRIFT_ELEMENTS) + ' |')
        md.append('|---|' + '---|' * len(DRIFT_ELEMENTS))
        ref = {}
        vals = defaultdict(list)
        flags = []
        for s in board:
            lms = recs[s][vp]['metrics']['landmarks']
            cells = []
            for key, lbl, which in DRIFT_ELEMENTS:
                b = lm_box(lms.get(key), which)
                if not b:
                    cells.append('–')
                    continue
                vals[key].append((s, b))
                if key not in ref:
                    ref[key] = (s, b)
                r = ref[key][1]
                # x is compared by the centre: a different word changes a centred line's width and
                # left edge without moving it
                dx = (b['x'] + b['w'] / 2) - (r['x'] + r['w'] / 2)
                dy, dw, dh = b['y'] - r['y'], b['w'] - r['w'], b['h'] - r['h']
                dbot = (b['y'] + b['h']) - (r['y'] + r['h'])
                moved = max(abs(dx), abs(dy), abs(dh)) > 2
                cell = f"{b['x']:.0f},{b['y']:.0f} {b['w']:.0f}x{b['h']:.0f}"
                if moved:
                    cell = f'**!** {cell} (Δtop {dy:+.0f}, Δbottom {dbot:+.0f}, Δcx {dx:+.0f})'
                    flags.append((s, lbl, dx, dy, dbot, dh))
                cells.append(cell)
            md.append(f'| {s} | ' + ' | '.join(cells) + ' |')
        delta = []
        for key, lbl, _ in DRIFT_ELEMENTS:
            v = vals.get(key)
            if not v:
                delta.append('–')
                continue
            rng = lambda fn: max(fn(b) for _, b in v) - min(fn(b) for _, b in v)
            delta.append(f"Δtop {rng(lambda b: b['y']):.0f} · Δbottom {rng(lambda b: b['y'] + b['h']):.0f} · Δcx {rng(lambda b: b['x'] + b['w'] / 2):.0f} · Δw {rng(lambda b: b['w']):.0f} · Δh {rng(lambda b: b['h']):.0f}")
        md.append('| **max delta** | ' + ' | '.join(delta) + ' |')
        md.append('')
        md.append('Reference states: ' + ', '.join(f'{lbl} = {ref[k][0]}' for k, lbl, _ in DRIFT_ELEMENTS if k in ref))
        md.append('')
        if flags:
            md.append(f'Flagged shifts over 2px at {vp}: {len(flags)}')
            md.append('')
            for s, lbl, dx, dy, dbot, dh in flags:
                md.append(f'- {s}: {lbl} Δtop {dy:+.1f}, Δbottom {dbot:+.1f}, Δcentre-x {dx:+.1f}, Δheight {dh:+.1f}')
            md.append('')
        if vp in DRIFT_VPS:
            sheets.append(drift_sheet(vp, board, recs, ref))
    with open(f'{OUT}/drift-board.md', 'w') as fh:
        fh.write('\n'.join(md) + '\n')
    return sheets


def drift_sheet(vp, board, recs, ref):
    w, h, d = SIZES[vp]
    tile_h = 640 if h > w else int(560 * h / w)
    scale = tile_h / h  # CSS px -> tile px
    tiles = []
    for s in board:
        f = f'{SHOTS}/{s}/{vp}.png'
        if not os.path.exists(f):
            continue
        im = Image.open(f).convert('RGB').resize((int(w * scale), tile_h), Image.LANCZOS)
        dr = ImageDraw.Draw(im, 'RGBA')
        for key, col in GUIDE_COLORS.items():
            if key not in ref:
                continue
            y = ref[key][1]['y'] * scale
            dr.line([(0, y), (im.width, y)], fill=col + (220,), width=1)
        band = Image.new('RGB', (im.width, im.height + 20), (24, 24, 30))
        ImageDraw.Draw(band).text((4, 3), s[:40], fill=(230, 230, 230), font=font(12, True))
        band.paste(im, (0, 20))
        tiles.append(band)
    sheet = grid(tiles, max_w=2600, gap=10)
    legend = '   '.join(f'{k}: {ref[k][0]} top' for k in GUIDE_COLORS if k in ref)
    out = label_band(sheet, f'Drift: {vp_label(vp)}  ({len(tiles)} board states)', 'guides at the reference state\'s top edge: yellow = title, green = rule caption, pink = result line, cyan = step button.  ' + legend, size=24)
    path = f'{SHEETS}/drift-{vp}.png'
    out.save(path)
    return path


# ---------------------------------------------------------------- manifest
def describe(rec):
    s = rec.get('snap') or {}
    parts = []
    if s.get('caption'):
        parts.append('caption "' + re.sub(r'^RULE\s*', '', s['caption'])[:90] + '"')
    if s.get('card'):
        parts.append('card "' + s['card'][:60] + '"')
    if s.get('title'):
        parts.append('title ' + s['title'])
    if s.get('notice'):
        parts.append('notice "' + s['notice'][:70] + '"')
    if s.get('result'):
        parts.append('result "' + s['result'][:90] + '"')
    if s.get('step'):
        parts.append('button "' + s['step'][:70] + '"')
    if s.get('tower') is not None and s.get('state') not in ('loadGame', 'showIntro', 'gameOver', 'finalLog', 'exitGame'):
        mods = ' Lucid' if s.get('lucid') else ' Surreal' if s.get('surreal') else ''
        parts.append(f"HUD {s.get('tower')}/20 Stab, {s.get('kings')}K, {s.get('aces')}A, {s.get('tokens')} tok, {s.get('deck')} cards{mods}")
    elif s.get('state'):
        parts.append(f"screen {s.get('state')}")
    return '; '.join(p for p in parts if p)


def manifest(order, recs, summary, unreachable, sheet_paths, drift_paths, hud_paths, commit, issues=()):
    total_shots = sum(len(by) for by in recs.values())
    L = [f'# Board and HUD captures, round {ROUND}', '',
         f'Code under test: {commit}. Dev server, Chromium (swiftshader), captured {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")}.',
         f'{len(order)} states, {total_shots} shots. Scripts: {SP}/tools/board/ (everything: ROUND=N run-all.sh; or ROUND=N node capture.cjs --vp=... --groups=..., then ROUND=N python3 -I build.py).', '',
         '## How to read the metrics', '']
    L += [f'- {line}' for line in HOW_TO_READ]
    L += ['',
          '- File: ' + f'{OUT}/metrics-board.json' + ' (states > viewports > texts/controls/problems/landmarks; summary and issues at the top level).',
          '- Quick look: `jq \'.issues[] | select(.kind=="contrast")\'`, or `jq \'.states["stability-nat1"].viewports["iphone-13"].texts[] | {role,text,fontFamily,fontSize,contrast,aa}\'`.',
          f'- Drift: {OUT}/drift-board.md (positions per board state, flags over 2px) and the drift sheets ' + ', '.join(drift_paths) + '.',
          '', '## Metrics at a glance', '',
          'Counts over every state and viewport (the same element recurs in many states). Details in metrics-board.json > issues.', '',
          '| kind | count | most common (role or name · text · where) |', '|---|---|---|']
    groups = defaultdict(list)
    for it in issues:
        groups[it['kind']].append(it)
    for kind, items in groups.items():
        common = defaultdict(lambda: [0, set(), []])
        for it in items:
            if kind == 'contrast':
                k = f"{it['role']} \"{it['text'][:30]}\" (needs {it['needs']})"
            elif kind == 'smallTargets':
                k = f"\"{(it.get('name') or '')[:40]}\" {it.get('w')}x{it.get('h')}"
            else:
                k = f"{it.get('detail') or ''} {(it.get('text') or it.get('name') or '')[:40]!r} {(it.get('el') or '')[-50:]}"
            common[k][0] += 1
            common[k][1].add(it['vp'])
            if kind == 'contrast':
                common[k][2].append(it['contrast'])
        top = sorted(common.items(), key=lambda kv: -kv[1][0])[:4]
        desc = '<br>'.join(f"{n}× {k} ({', '.join(sorted(v))}{'; ratio ' + str(min(c)) + '-' + str(max(c)) if c else ''})" for k, (n, v, c) in top)
        L.append(f'| {kind} | {len(items)} | {desc} |')
    L += ['', '## Conditions', '',
          '- Game: /game/future-lost. Normal unless the state name says easy/e<k> (Easy) or hard/h<k> (Hard). Difficulty comes from the player setting (localStorage gameSettings).',
          '- Rule tips are OFF in every state except caption-* (tips on), so the main states show the board without a caption; stability-check is the tips-off twin of caption-odd (same card, same screen).',
          '- Dice are mocked (mockDieRoll / mockDieRollSequence) and skipped to their result; every shot is taken after the dice have sunk and all finite animations have finished.',
          '- During each capture the page reports itself hidden (document.hidden): result holds are paused (so a result stays put and its run-out line sits at its start) and the background motes freeze. result-hold and rm-result-hold let the hold run ~1s first.',
          '- iPhone sizes are the full screen (390x844, 844x390), not the Safari visible area (Playwright\'s iPhone 13 descriptor is 390x664 / 750x342).',
          '- Fonts are bundled (lixdu, DSEG7 Classic, Inter, Share Tech Mono), so they render as shipped.',
          '- Sheets: one height per sheet (620px), labelled by viewport, wrapped into rows under 2600px. HUD sheets stack the rows at native device pixels (phones @2x).', '',
          '## States', '',
          '| # | state | what it shows (iphone-13, else first viewport) | how it was reached | viewports | sheet | shots |',
          '|---|---|---|---|---|---|---|']
    for i, s in enumerate(order, 1):
        by = recs[s]
        rec = by.get('iphone-13') or next(iter(by.values()))
        vps = [vp for vp in CORE + EXT if vp in by]
        vtxt = 'all core' if all(v in by for v in CORE) else ', '.join(v for v in vps if v in CORE)
        ext = [v for v in vps if v in EXT]
        if ext:
            vtxt += ' + ' + ', '.join(ext)
        sheet = sheet_paths.get(s, '')
        if s + '-extended' in sheet_paths:
            sheet += '<br>' + sheet_paths[s + '-extended']
        L.append(f'| {i} | {s} | {describe(rec)} | {rec.get("how", "")} | {vtxt} | {sheet} | {SHOTS}/{s}/ |')
    L += ['', '## HUD tier sheets', '']
    L += [f'- {p}' for p in hud_paths]
    L += ['', '## Not captured', '']
    if unreachable:
        seen = set()
        for u in unreachable:
            k = (u['state'], u['why'])
            if k in seen:
                continue
            seen.add(k)
            vps = sorted({x['vp'] for x in unreachable if (x['state'], x['why']) == k})
            L.append(f"- {u['state']} ({', '.join(vps)}): {u['why']}")
    missing = []
    for s in order:
        by = recs[s]
        if any(v in by for v in CORE) and not s.startswith('rm-'):
            gaps = [v for v in CORE if v not in by]
            if gaps:
                missing.append(f'- {s}: no shot at {", ".join(gaps)}')
    if missing:
        L += ['', 'Core viewports missing a shot:', ''] + missing
    notes = f'{SP}/tools/board/notes-round-{ROUND}.md'
    if os.path.exists(notes):
        with open(notes) as fh:
            L += ['', fh.read().strip()]
    with open(f'{OUT}/manifest-board.md', 'w') as fh:
        fh.write('\n'.join(L) + '\n')


def manifest_only(recs, order, commit):
    """Re-make the manifest and the drift report from metrics-board.json and the sheets on disk"""
    with open(f'{OUT}/metrics-board.json') as fh:
        m = json.load(fh)
    unreachable = []
    for f in sorted(os.listdir(RAW)):
        if f.startswith('_unreachable'):
            with open(f'{RAW}/{f}') as fh:
                unreachable += json.load(fh)
    unreachable = [u for u in unreachable if not (u['state'] in recs and u['vp'] in recs[u['state']])]
    sheet_paths = {}
    for s in order:
        for suffix in ('', '-extended'):
            p = f'{SHEETS}/{s}{suffix}.png'
            if os.path.exists(p):
                sheet_paths[s + suffix] = p
    hud_paths = [f'{SHEETS}/hud-tiers.png'] + [f'{SHEETS}/hud-tiers-{vp}.png' for vp in CORE]
    hud_paths = [p for p in hud_paths if os.path.exists(p)]
    drift_paths = drift(order, recs)
    manifest(order, recs, m['summary'], unreachable, sheet_paths, drift_paths, hud_paths, commit, m['issues'])


def main():
    recs = load_records()
    order = state_order(recs)
    if '--manifest-only' in sys.argv:
        commit = subprocess.run(['git', '-C', '/home/user/dc-solo-rpg', 'log', '--oneline', '-1'], capture_output=True, text=True).stdout.strip()
        branch = subprocess.run(['git', '-C', '/home/user/dc-solo-rpg', 'rev-parse', '--abbrev-ref', 'HEAD'], capture_output=True, text=True).stdout.strip()
        manifest_only(recs, order, f'{branch} @ {commit}')
        print('manifest and drift rebuilt')
        return
    commit = subprocess.run(['git', '-C', '/home/user/dc-solo-rpg', 'log', '--oneline', '-1'], capture_output=True, text=True).stdout.strip()
    branch = subprocess.run(['git', '-C', '/home/user/dc-solo-rpg', 'rev-parse', '--abbrev-ref', 'HEAD'], capture_output=True, text=True).stdout.strip()
    commit = f'{branch} @ {commit}'
    states, summary, issues = build_metrics(recs, order)
    unreachable = []
    for f in sorted(os.listdir(RAW)):
        if f.startswith('_unreachable'):
            with open(f'{RAW}/{f}') as fh:
                unreachable += json.load(fh)
    # A later run may have captured what an earlier one missed; group-level failures stay listed
    unreachable = [u for u in unreachable if not (u['state'] in recs and u['vp'] in recs[u['state']])]
    counts = defaultdict(int)
    for it in issues:
        counts[it['kind']] += 1
    metrics = OrderedDict([
        ('round', ROUND), ('commit', commit), ('generated', datetime.now(timezone.utc).isoformat()),
        ('howToRead', HOW_TO_READ),
        ('viewports', {vp: {'width': SIZES[vp][0], 'height': SIZES[vp][1], 'dsf': SIZES[vp][2], 'core': vp in CORE} for vp in CORE + EXT}),
        ('issueCounts', dict(counts)),
        ('summary', summary), ('issues', issues), ('states', states),
    ])
    with open(f'{OUT}/metrics-board.json', 'w') as fh:
        json.dump(metrics, fh, separators=(',', ':'))
    sheet_paths = {}
    for s in order:
        by = recs[s]
        core = [v for v in CORE if v in by]
        if core:
            p = contact_sheet(s, CORE, recs)
            if p:
                sheet_paths[s] = p
        ext = [v for v in EXT if v in by]
        if ext:
            p = contact_sheet(s, EXT, recs, suffix='-extended')
            if p:
                sheet_paths[s + '-extended'] = p
    hud_paths = []
    for vp in CORE:
        p = hud_tiers_sheet(order, recs, [vp], f'hud-tiers-{vp}')
        if p:
            hud_paths.append(p)
    p = hud_tiers_sheet(order, recs, ['android-small', 'desktop'], 'hud-tiers')
    if p:
        hud_paths.insert(0, p)
    drift_paths = drift(order, recs)
    manifest(order, recs, summary, unreachable, sheet_paths, drift_paths, hud_paths, commit, issues)
    print(json.dumps({'states': len(order), 'shots': sum(len(b) for b in recs.values()), 'sheets': len(sheet_paths) + len(hud_paths) + len(drift_paths), 'issues': dict(counts), 'unreachable': len(unreachable)}))


if __name__ == '__main__':
    main()
