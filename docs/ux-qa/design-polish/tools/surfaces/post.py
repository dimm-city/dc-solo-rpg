#!/usr/bin/env python3
"""Design review, surfaces: complete the metrics from the screenshots and build the contact sheets.

    ROUND=1 python3 post.py            all states
    ROUND=1 python3 post.py card-      only states whose name contains "card-"

Reads   round-N/raw/surfaces/<state>/<vp>.json and round-N/shots/surfaces/<state>/<vp>.png
Writes  round-N/metrics-surfaces.json            every state x viewport, every element
        round-N/metrics-surfaces-summary.json    the flags only (low contrast, clipped, outside,
                                                 small tap targets, page overflow), per state x viewport
        round-N/metrics/surfaces/<state>.json    one state, every viewport (same shape as the big file)
        round-N/sheets/surfaces/<state>.png      core viewports side by side, two rows, one height
        round-N/sheets/surfaces/<state>--extended.png   extended viewports, where captured
"""
import json
import os
import sys
from datetime import datetime, timezone

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROUND = os.environ.get("ROUND", "1")
DR = "/tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review"
OUT = os.path.join(DR, f"round-{ROUND}")
RAW = os.path.join(OUT, "raw", "surfaces")
SHOTS = os.path.join(OUT, "shots", "surfaces")
SHEETS = os.path.join(OUT, "sheets", "surfaces")
PER_STATE = os.path.join(OUT, "metrics", "surfaces")
FILTER = sys.argv[1] if len(sys.argv) > 1 else None

CORE = [
    ("android-small", 360, 640),
    ("iphone-13", 390, 844),
    ("iphone-13-landscape", 844, 390),
    ("ipad-portrait", 768, 1024),
    ("laptop", 1280, 720),
    ("desktop", 1440, 900),
]
EXT = [("iphone-se", 375, 667), ("pixel-7", 412, 915), ("ipad-landscape", 1024, 768), ("fhd", 1920, 1080)]
TOUCH = {"android-small", "iphone-13", "iphone-13-landscape", "ipad-portrait", "iphone-se", "pixel-7", "ipad-landscape"}
ROWS = [["android-small", "iphone-13", "ipad-portrait", "iphone-13-landscape"], ["laptop", "desktop"]]
SIZES = {k: (w, h) for k, w, h in CORE + EXT}

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


# ---------------------------------------------------------------------------------------------
# Colour and contrast

def lin(c):
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def luminance(rgb):
    r, g, b = lin(np.asarray(rgb[:3], dtype=float))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return round(float((hi + 0.05) / (lo + 0.05)), 2)


def over(top, bottom):
    """Composite an RGBA colour over an opaque RGB colour"""
    a = top[3] if len(top) > 3 else 1
    return [round(top[i] * a + bottom[i] * (1 - a)) for i in range(3)]


def to_hex(c):
    return "#%02x%02x%02x" % tuple(int(round(v)) for v in c[:3])


def sample(img, box, scale, text_rgb):
    """Background and glyph colours inside a box of the screenshot.

    Background: the most common colour (5-bit bins) once pixels close to the text colour are set
    aside, averaged within its bin. Glyph: the 95th-percentile pixel by distance from that
    background (an estimate of the rendered text colour, glows and gradients included)."""
    x0 = max(0, int(box["x"] * scale))
    y0 = max(0, int(box["y"] * scale))
    x1 = min(img.shape[1], int((box["x"] + box["w"]) * scale + 0.999))
    y1 = min(img.shape[0], int((box["y"] + box["h"]) * scale + 0.999))
    if x1 - x0 < 2 or y1 - y0 < 2:
        return None
    px = img[y0:y1, x0:x1, :3].reshape(-1, 3).astype(int)
    dist_text = np.sqrt(((px - np.asarray(text_rgb)) ** 2).sum(1))
    cand = px[dist_text > 48]
    if len(cand) < max(4, 0.08 * len(px)):
        cand = px
    # 4-bit bins: a gradient or scanlines still fall into one bin
    q = cand >> 4
    keys = q[:, 0] * 256 + q[:, 1] * 16 + q[:, 2]
    vals, counts = np.unique(keys, return_counts=True)
    k = vals[counts.argmax()]
    bg = cand[keys == k].mean(0)
    share = float(counts.max()) / len(px)
    d_bg = np.sqrt(((px - bg) ** 2).sum(1))
    order = np.argsort(d_bg)
    glyph = px[order[int(0.95 * (len(order) - 1))]]
    return {"bg": [int(round(v)) for v in bg], "bgShare": round(share, 2), "glyph": [int(v) for v in glyph]}


def sample_ring(img, box, scale, text_rgb, inner=12, outer=20):
    """The most common colour in a band around a box (inner..outer CSS px outside it)"""
    H, W = img.shape[:2]
    x0 = max(0, int((box["x"] - outer) * scale)); y0 = max(0, int((box["y"] - outer) * scale))
    x1 = min(W, int((box["x"] + box["w"] + outer) * scale)); y1 = min(H, int((box["y"] + box["h"] + outer) * scale))
    if x1 - x0 < 4 or y1 - y0 < 4:
        return None
    sub = img[y0:y1, x0:x1, :3]
    mask = np.ones(sub.shape[:2], dtype=bool)
    ix0 = max(0, int((box["x"] - inner) * scale) - x0); iy0 = max(0, int((box["y"] - inner) * scale) - y0)
    ix1 = min(sub.shape[1], int((box["x"] + box["w"] + inner) * scale) - x0); iy1 = min(sub.shape[0], int((box["y"] + box["h"] + inner) * scale) - y0)
    if ix1 > ix0 and iy1 > iy0:
        mask[iy0:iy1, ix0:ix1] = False
    px = sub[mask].reshape(-1, 3).astype(int)
    if len(px) < 8:
        return None
    # Coarser bins than inside the box: scanlines and gradients split a backdrop over near colours
    q = px >> 4
    keys = q[:, 0] * 256 + q[:, 1] * 16 + q[:, 2]
    vals, counts = np.unique(keys, return_counts=True)
    k = vals[counts.argmax()]
    return {"bg": [int(round(v)) for v in px[keys == k].mean(0)], "bgShare": round(float(counts.max()) / len(px), 2)}


def is_large(font):
    size = font.get("size") or 0
    try:
        weight = int(font.get("weight") or 400)
    except ValueError:
        weight = 700 if font.get("weight") == "bold" else 400
    return size >= 24 or (size >= 18.66 and weight >= 700)


# ---------------------------------------------------------------------------------------------
# Metrics

def enrich(state, vp, raw):
    shot = os.path.join(SHOTS, state, raw["fullPageShot"] if raw.get("pageMode") and raw.get("fullPageShot") else f"{vp}.png")
    img = np.asarray(Image.open(shot).convert("RGB")) if os.path.exists(shot) else None
    scale = (img.shape[1] / raw["viewport"]["w"]) if img is not None else 1
    low = []
    for e in raw["elements"]:
        box = e.get("textBox") or e["box"]
        vb = e.get("visibleBox") or box
        # Sample the visible part of the text box
        sx = max(box["x"], vb["x"])
        sy = max(box["y"], vb["y"])
        ex = min(box["x"] + box["w"], vb["x"] + vb["w"])
        ey = min(box["y"] + box["h"], vb["y"] + vb["h"])
        region = {"x": sx, "y": sy, "w": max(0, ex - sx), "h": max(0, ey - sy)}
        col = e["color"]
        dom_bg = e["bgDom"]
        # A checkbox or switch reports its value ("on") as text: it has none
        if e["tag"] == "input" and e["text"] == "on":
            e["text"] = ""
        # Glyph pixels are set aside by the colour they render in (opacity applied over a dark ground)
        approx_text = over(list(col[:3]) + [(col[3] if len(col) > 3 else 1) * e.get("opacity", 1)], [16, 16, 20])
        s = sample(img, region, scale, approx_text) if img is not None else None
        # Glowing text (a text-shadow) outside any button: the box is mostly glow, so read the
        # backdrop from a ring clear of it (12px plus 0.6 of the font size out, 10px wide); the glow
        # is not counted as background. A button's label keeps the button's own fill.
        ring = None
        if s and e.get("textShadow") and e["kind"] == "text" and e["role"] != "button text":
            gap = 12 + 0.6 * e["font"]["size"]
            ring = sample_ring(img, region, scale, approx_text, inner=gap, outer=gap + 10)
        if s:
            use_ring = ring is not None and ring["bgShare"] >= 0.1
            bg = ring["bg"] if use_ring else s["bg"]
            e["bg"] = to_hex(bg)
            e["bgSource"] = "pixels, ring around the glowing text" if use_ring else "pixels"
            e["bgShare"] = ring["bgShare"] if use_ring else s["bgShare"]
            if use_ring:
                e["bgInBox"] = to_hex(s["bg"])
            e["glyph"] = to_hex(s["glyph"])
        else:
            bg = over(dom_bg, [0, 0, 0]) if dom_bg[3] > 0 else [0, 0, 0]
            e["bg"] = to_hex(bg)
            e["bgSource"] = "dom"
        e["bgDom"] = to_hex(over(dom_bg, [255, 255, 255])) if dom_bg[3] > 0 else "transparent"
        fill = e.get("fill")
        text_rgba = list(fill if fill and fill[3] > 0 else col)
        transparent_fill = bool(fill) and fill[3] == 0
        text_rgba = text_rgba[:3] + [(text_rgba[3] if len(text_rgba) > 3 else 1) * e.get("opacity", 1)]
        text_rgb = over(text_rgba, bg)
        e["color"] = to_hex(col) + ("" if col[3] >= 1 else f" a{col[3]}")
        e["colorEffective"] = to_hex(text_rgb)
        if fill:
            e["fill"] = to_hex(fill) + ("" if fill[3] >= 1 else f" a{fill[3]}")
        if transparent_fill and s:
            e["contrast"] = contrast(s["glyph"], bg)
            e["contrastFrom"] = "glyph pixels (text fill is transparent)"
        else:
            e["contrast"] = contrast(text_rgb, bg)
        if s:
            e["contrastGlyph"] = contrast(s["glyph"], bg)
        large = is_large(e["font"])
        e["large"] = large
        need = 3.0 if large else 4.5
        e["wcag"] = "AAA" if e["contrast"] >= (4.5 if large else 7) else "AA" if e["contrast"] >= need else "fail"
        f = e["font"]
        for k in ("style", "variantNumeric"):
            if f.get(k) is None:
                f.pop(k, None)
        if e["wcag"] == "fail" and e["text"] and not e.get("covered"):
            low.append({"id": e["id"], "role": e["role"], "text": e["text"][:70], "size": f["size"], "weight": f["weight"],
                        "color": e["colorEffective"], "bg": e["bg"], "contrast": e["contrast"], "needs": need})
    raw["lowContrast"] = low
    raw["touch"] = vp in TOUCH
    if not raw["touch"]:
        raw["smallTargets"] = []
    return raw


def summary_of(m):
    return {
        "shot": m.get("shot"),
        "url": m.get("url"),
        "note": m.get("note"),
        "pageOverflowX": m["pageOverflowX"],
        "docScrollWidth": m["doc"]["scrollWidth"],
        "elements": len(m["elements"]),
        "covered": len([e for e in m["elements"] if e.get("covered")]),
        "lowContrast": m["lowContrast"],
        "clipped": m["clipped"],
        "outside": [o for o in m["outside"] if not o.get("reachable")],
        "outsideReachable": len([o for o in m["outside"] if o.get("reachable")]),
        "smallTargets": m["smallTargets"],
        "fontsRendered": sorted({e["font"].get("rendered", "?") for e in m["elements"]}),
        "fontSizes": sorted({e["font"]["size"] for e in m["elements"]}),
    }


# ---------------------------------------------------------------------------------------------
# Contact sheets

def font(size, bold=False):
    try:
        return ImageFont.truetype(FONT_B if bold else FONT, size)
    except OSError:
        return ImageFont.load_default()


def sheet(state, rows, height, out, title_suffix=""):
    pad, gap, label_h, title_h = 20, 20, 30, 46
    row_imgs = []
    for row in rows:
        items = []
        for vp in row:
            w, h = SIZES[vp]
            path = os.path.join(SHOTS, state, f"{vp}.png")
            tw = int(round(height * w / h))
            if os.path.exists(path):
                im = Image.open(path).convert("RGB").resize((tw, height), Image.LANCZOS)
            else:
                im = Image.new("RGB", (tw, height), (40, 40, 48))
                d = ImageDraw.Draw(im)
                d.text((12, height // 2 - 10), "not captured", fill=(200, 200, 210), font=font(16))
            items.append((vp, w, h, im))
        row_imgs.append(items)
    width = max(sum(i[3].width for i in items) + gap * (len(items) - 1) for items in row_imgs) + 2 * pad
    total_h = title_h + len(row_imgs) * (label_h + height) + (len(row_imgs) - 1) * gap + pad
    canvas = Image.new("RGB", (width, total_h), (18, 18, 22))
    d = ImageDraw.Draw(canvas)
    d.text((pad, 12), f"{state}{title_suffix}  ·  round {ROUND}", fill=(240, 240, 245), font=font(22, True))
    y = title_h
    for items in row_imgs:
        x = pad
        for vp, w, h, im in items:
            d.text((x, y + 4), f"{vp}  {w}x{h}", fill=(170, 200, 255), font=font(17, True))
            canvas.paste(im, (x, y + label_h))
            d.rectangle([x - 1, y + label_h - 1, x + im.width, y + label_h + height], outline=(70, 70, 90))
            x += im.width + gap
        y += label_h + height + gap
    os.makedirs(os.path.dirname(out), exist_ok=True)
    canvas.save(out, optimize=True)
    return canvas.size


def main():
    states = sorted(s for s in os.listdir(RAW) if not FILTER or FILTER in s) if os.path.isdir(RAW) else []
    big_path = os.path.join(OUT, "metrics-surfaces.json")
    sum_path = os.path.join(OUT, "metrics-surfaces-summary.json")
    big, summ = {"states": {}}, {"states": {}}
    if FILTER:
        # Partial run: update the existing files in place
        for p, d in ((big_path, big), (sum_path, summ)):
            if os.path.exists(p):
                d.update(json.load(open(p)))
    os.makedirs(PER_STATE, exist_ok=True)
    sizes = {}
    for state in states:
        per = {}
        for f in sorted(os.listdir(os.path.join(RAW, state))):
            vp = f[:-5]
            raw = json.load(open(os.path.join(RAW, state, f)))
            per[vp] = enrich(state, vp, raw)
        big["states"][state] = per
        summ["states"][state] = {vp: summary_of(m) for vp, m in per.items()}
        json.dump(per, open(os.path.join(PER_STATE, f"{state}.json"), "w"), separators=(",", ":"))
        sizes[state] = sheet(state, ROWS, 600, os.path.join(SHEETS, f"{state}.png"))
        ext = [vp for vp, _, _ in EXT if os.path.exists(os.path.join(SHOTS, state, f"{vp}.png"))]
        if ext:
            sheet(state, [[vp for vp, _, _ in EXT]], 560, os.path.join(SHEETS, f"{state}--extended.png"), "  (extended viewports)")
    meta = {
        "round": ROUND,
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "coreViewports": {k: f"{w}x{h}" for k, w, h in CORE},
        "extendedViewports": {k: f"{w}x{h}" for k, w, h in EXT},
        "touchViewports": sorted(TOUCH),
        "readme": "See the top of manifest-surfaces.md: how to read these metrics.",
    }
    big["meta"] = meta
    summ["meta"] = meta
    json.dump(big, open(big_path, "w"), separators=(",", ":"))
    json.dump(summ, open(sum_path, "w"), indent=1)
    wide = {s: v for s, v in sizes.items() if v[0] > 2600}
    print(f"states {len(states)}, sheets {len(sizes)}, widest {max((v[0] for v in sizes.values()), default=0)}px, over 2600: {wide}")


if __name__ == "__main__":
    main()
