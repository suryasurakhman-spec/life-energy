"""
App icon and splash artwork: a price tag whose eyelet is a clock ("every price is time").

Writes the SVG masters to assets/images/. Render them to PNG at 1024 px with any SVG renderer, e.g.
  google-chrome --headless=new --hide-scrollbars --default-background-color=00000000 \
    --window-size=1024,1024 --screenshot=assets/images/icon.png assets/images/icon.svg
Colours are the app palette (src/theme/colors.ts): amber500 on sand900.
"""
import math
import pathlib

AMBER = '#E8A13A'  # palette.amber500
INK = '#1A1714'    # palette.sand900

def mark(size, bg=INK, color=AMBER, hole=INK, circle=False):
    """`size` is the share of the 1024 canvas the mark spans; bg=None leaves it transparent.
    circle=True fits the mark inside a centred circle of that diameter instead of a square,
    for Android, which masks launcher and splash icons to a circle."""
    H, W, P, rad = 400, 620, 230, 40       # tag height, length, point length, corner rounding
    raw = [(0, 0), (P, -H / 2), (W, -H / 2), (W, H / 2), (P, H / 2)]
    eye, r = (P + 40, 0), 118
    a = math.radians(45)
    rot = lambda x, y: (x * math.cos(a) - y * math.sin(a), x * math.sin(a) + y * math.cos(a))
    pts = [rot(*p) for p in raw]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    mx, my = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2
    if circle:
        k = 512 * size / (max(math.hypot(x - mx, y - my) for x, y in pts) + rad)
    else:
        k = 1024 * size / (max(max(xs) - min(xs), max(ys) - min(ys)) + 2 * rad)
    ox, oy = 512 - k * mx, 512 - k * my
    T = lambda p: (ox + k * p[0], oy + k * p[1])
    d = 'M' + ' L'.join('%.1f %.1f' % T(p) for p in pts) + ' Z'
    ex, ey = T(rot(*eye))
    R = r * k
    minute = (ex, ey - 0.62 * R)                                   # 12 o'clock
    hour = (ex + 0.42 * R * math.sin(math.radians(60)), ey - 0.42 * R * math.cos(math.radians(60)))  # 2 o'clock
    out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">']
    if bg:
        out.append(f'<rect width="1024" height="1024" fill="{bg}"/>')
    out.append(f'<path d="{d}" fill="{color}" stroke="{color}" stroke-width="{2 * rad * k:.1f}" stroke-linejoin="round"/>')
    out.append(f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{R:.1f}" fill="{hole}"/>')
    out.append(f'<g stroke="{color}" stroke-width="{24 * k:.1f}" stroke-linecap="round">'
               f'<line x1="{ex:.1f}" y1="{ey:.1f}" x2="{minute[0]:.1f}" y2="{minute[1]:.1f}"/>'
               f'<line x1="{ex:.1f}" y1="{ey:.1f}" x2="{hour[0]:.1f}" y2="{hour[1]:.1f}"/></g>')
    out.append('</svg>\n')
    return ''.join(out)

if __name__ == '__main__':
    out = pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'images'
    out.mkdir(parents=True, exist_ok=True)
    (out / 'icon.svg').write_text(mark(0.66))                    # iOS and store icon: full bleed, no transparency
    # Android shows the middle 66% of the adaptive foreground, often as a circle.
    (out / 'adaptive-icon.svg').write_text(mark(0.60, bg=None, circle=True))
    # Android 12+ splash masks the icon to a circle two-thirds of its width; imageWidth in app.json sets its size.
    (out / 'splash-icon.svg').write_text(mark(0.64, bg=None, circle=True))
