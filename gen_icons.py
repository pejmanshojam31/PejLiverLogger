"""Generate LiverLogger app icons with Pillow — no network needed.
Design: dark rounded-square background, an amber whiskey-glass silhouette
with a liquid fill and a tiny liver-red accent drop, plus an "LL" monogram
at large sizes. Kept simple so it still reads at 40x40 (iOS home screen).
"""
from PIL import Image, ImageDraw, ImageFont
import math

BG_TOP = (30, 27, 38)      # dark plum
BG_BOTTOM = (18, 17, 24)   # near-black
GLASS = (217, 154, 61)     # amber accent
GLASS_EDGE = (245, 200, 120)
LIVER = (196, 90, 90)      # liver-red accent drop


def rounded_square_bg(size):
    # iOS applies its own squircle mask to apple-touch-icon, and transparent
    # PNGs render with a black fill on the home screen — so this is a flat,
    # full-bleed, fully-opaque square (no pre-rounded corners, no alpha).
    img = Image.new("RGB", (size, size), BG_BOTTOM)
    grad = Image.new("RGB", (1, size), color=0)
    for y in range(size):
        t = y / (size - 1)
        r = int(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * t)
        g = int(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * t)
        b = int(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * t)
        grad.putpixel((0, y), (r, g, b))
    grad = grad.resize((size, size))
    img.paste(grad, (0, 0))
    return img


def draw_glass(draw, size):
    cx = size / 2
    # tumbler trapezoid: wider at top, narrower at base
    top_w = size * 0.40
    bot_w = size * 0.30
    top_y = size * 0.33
    bot_y = size * 0.72
    pts = [
        (cx - top_w / 2, top_y),
        (cx + top_w / 2, top_y),
        (cx + bot_w / 2, bot_y),
        (cx - bot_w / 2, bot_y),
    ]
    draw.polygon(pts, outline=GLASS_EDGE, width=max(2, int(size * 0.012)))
    # liquid fill (lower 55% of glass)
    liquid_y = top_y + (bot_y - top_y) * 0.42
    liquid_top_w = top_w - (top_w - bot_w) * 0.42
    lpts = [
        (cx - liquid_top_w / 2, liquid_y),
        (cx + liquid_top_w / 2, liquid_y),
        (cx + bot_w / 2, bot_y),
        (cx - bot_w / 2, bot_y),
    ]
    draw.polygon(lpts, fill=GLASS)
    # ice cube accent
    ice = size * 0.09
    draw.rounded_rectangle(
        [cx - ice * 0.6, liquid_y - ice * 0.3, cx - ice * 0.6 + ice, liquid_y - ice * 0.3 + ice],
        radius=ice * 0.18,
        fill=(255, 255, 255),
        outline=GLASS_EDGE,
    )


def draw_drop(draw, size):
    cx = size * 0.72
    cy = size * 0.24
    r = size * 0.075
    # simple droplet: circle + triangle tip
    draw.ellipse([cx - r, cy - r * 0.2, cx + r, cy + r * 1.8], fill=LIVER)
    draw.polygon(
        [(cx, cy - r * 1.5), (cx - r * 0.85, cy), (cx + r * 0.85, cy)],
        fill=LIVER,
    )


def make_icon(size, path, monogram=False):
    img = rounded_square_bg(size)
    draw = ImageDraw.Draw(img)
    draw_glass(draw, size)
    draw_drop(draw, size)
    img.save(path)


for size, name in [(180, "icon-180.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
    make_icon(size, f"icons/{name}")

print("icons written")
