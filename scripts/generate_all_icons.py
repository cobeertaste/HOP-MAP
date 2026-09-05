import math
import os
import subprocess

def create_image(width, height, is_og=False):
    # 2x supersampling for ultra crisp edges and anti-aliasing
    scale = 2
    sw = width * scale
    sh = height * scale
    
    # Dark navy background (#0f1422 -> RGB: 15, 20, 34)
    bg_r, bg_g, bg_b = 15, 20, 34
    
    # Initialize pixel buffer (flattened array of (r,g,b))
    # We will use bytearray for fast manipulation
    buf = bytearray([bg_r, bg_g, bg_b] * (sw * sh))

    def set_pixel(x, y, r, g, b, a=1.0):
        if 0 <= x < sw and 0 <= y < sh:
            idx = (y * sw + x) * 3
            if a >= 1.0:
                buf[idx] = r
                buf[idx+1] = g
                buf[idx+2] = b
            else:
                buf[idx] = int(buf[idx] * (1.0 - a) + r * a)
                buf[idx+1] = int(buf[idx+1] * (1.0 - a) + g * a)
                buf[idx+2] = int(buf[idx+2] * (1.0 - a) + b * a)

    def fill_rect(x0, y0, w, h, r, g, b, a=1.0, rx=0):
        x0, y0, w, h = int(x0), int(y0), int(w), int(h)
        for y in range(max(0, y0), min(sh, y0 + h)):
            for x in range(max(0, x0), min(sw, x0 + w)):
                if rx > 0:
                    # check rounded corner
                    dx = 0
                    if x < x0 + rx: dx = (x0 + rx) - x
                    elif x > x0 + w - 1 - rx: dx = x - (x0 + w - 1 - rx)
                    dy = 0
                    if y < y0 + rx: dy = (y0 + rx) - y
                    elif y > y0 + h - 1 - rx: dy = y - (y0 + h - 1 - rx)
                    if dx > 0 and dy > 0:
                        if dx*dx + dy*dy > rx*rx:
                            continue
                set_pixel(x, y, r, g, b, a)

    def fill_circle(cx, cy, radius, r, g, b, a=1.0):
        cx, cy, radius = float(cx), float(cy), float(radius)
        r2 = radius * radius
        min_x = max(0, int(cx - radius - 1))
        max_x = min(sw, int(cx + radius + 2))
        min_y = max(0, int(cy - radius - 1))
        max_y = min(sh, int(cy + radius + 2))
        for y in range(min_y, max_y):
            for x in range(min_x, max_x):
                d2 = (x - cx)**2 + (y - cy)**2
                if d2 <= r2:
                    set_pixel(x, y, r, g, b, a)

    def fill_ellipse(cx, cy, rx, ry, r, g, b, a=1.0):
        cx, cy, rx, ry = float(cx), float(cy), float(rx), float(ry)
        min_x = max(0, int(cx - rx - 1))
        max_x = min(sw, int(cx + rx + 2))
        min_y = max(0, int(cy - ry - 1))
        max_y = min(sh, int(cy + ry + 2))
        for y in range(min_y, max_y):
            for x in range(min_x, max_x):
                if ((x - cx)/rx)**2 + ((y - cy)/ry)**2 <= 1.0:
                    set_pixel(x, y, r, g, b, a)

    def fill_polygon(points, r, g, b, a=1.0):
        # Ray casting algorithm
        n = len(points)
        if n < 3: return
        min_x = max(0, int(min(p[0] for p in points)))
        max_x = min(sw, int(max(p[0] for p in points) + 1))
        min_y = max(0, int(min(p[1] for p in points)))
        max_y = min(sh, int(max(p[1] for p in points) + 1))

        for y in range(min_y, max_y):
            # find intersections with scanline
            intersections = []
            for i in range(n):
                p1 = points[i]
                p2 = points[(i + 1) % n]
                if (p1[1] <= y < p2[1]) or (p2[1] <= y < p1[1]):
                    if p2[1] != p1[1]:
                        x = p1[0] + (y - p1[1]) * (p2[0] - p1[0]) / (p2[1] - p1[1])
                        intersections.append(x)
            intersections.sort()
            for i in range(0, len(intersections), 2):
                if i + 1 < len(intersections):
                    x_start = max(min_x, int(intersections[i]))
                    x_end = min(max_x, int(intersections[i+1] + 1))
                    for x in range(x_start, x_end):
                        set_pixel(x, y, r, g, b, a)

    def draw_line(x1, y1, x2, y2, thickness, r, g, b, a=1.0):
        # draw thick line as polygon
        dx = x2 - x1
        dy = y2 - y1
        length = math.hypot(dx, dy)
        if length == 0: return
        nx = -dy / length * (thickness / 2)
        ny = dx / length * (thickness / 2)
        poly = [
            (x1 + nx, y1 + ny),
            (x2 + nx, y2 + ny),
            (x2 - nx, y2 - ny),
            (x1 - nx, y1 - ny)
        ]
        fill_polygon(poly, r, g, b, a)
        fill_circle(x1, y1, thickness/2, r, g, b, a)
        fill_circle(x2, y2, thickness/2, r, g, b, a)

    # Color palette
    c_yellow = (255, 208, 0)     # #ffd000
    c_orange = (255, 122, 0)     # #ff7a00 (3D extrusion / shadow)
    c_dark_orange = (217, 87, 0) # #d95700
    c_highlight = (255, 240, 102)# #fff066

    # Base design is 512x512 coordinate space
    # Scale coordinates to fit sw, sh
    if is_og:
        # 1200x630 -> center 512x512 with padding
        target_s = min(sw * 0.9 / 512.0, sh * 0.9 / 512.0)
        off_x = (sw - 512 * target_s) / 2
        off_y = (sh - 512 * target_s) / 2
    else:
        target_s = sw / 512.0
        off_x = 0
        off_y = 0

    def S(x, y):
        return (off_x + x * target_s, off_y + y * target_s)

    def s_val(v):
        return v * target_s

    # DRAW LOGO
    # ---------------- TOP ROW: HOP ----------------
    
    # --- Letter H ---
    # Shadow / 3D block
    fill_rect(*S(25, 60), s_val(70), s_val(165), *c_orange, rx=s_val(8))
    fill_rect(*S(115, 60), s_val(70), s_val(165), *c_orange, rx=s_val(8))
    fill_rect(*S(45, 115), s_val(120), s_val(60), *c_orange)
    
    # Left pillar shadow offset
    fill_polygon([S(15, 60), S(45, 60), S(45, 225), S(15, 225)], *c_orange)
    
    # Main Yellow H
    h_poly = [
        S(38, 75), S(92, 75), S(92, 125), S(122, 125), S(122, 75), S(176, 75),
        S(176, 225), S(122, 225), S(122, 170), S(92, 170), S(92, 225), S(38, 225)
    ]
    fill_polygon(h_poly, *c_yellow)
    # H borders
    for i in range(len(h_poly)):
        p1 = h_poly[i]
        p2 = h_poly[(i+1)%len(h_poly)]
        draw_line(p1[0], p1[1], p2[0], p2[1], s_val(6), *c_orange)
    # H Highlights
    fill_rect(*S(45, 83), s_val(8), s_val(130), *c_highlight, a=0.7)
    fill_rect(*S(161, 83), s_val(8), s_val(130), *c_highlight, a=0.7)
    fill_rect(*S(53, 208), s_val(32), s_val(7), *c_highlight, a=0.7)
    fill_rect(*S(129, 208), s_val(32), s_val(7), *c_highlight, a=0.7)

    # --- Letter O (Vinyl / Hop disc) ---
    # Orange shadow
    fill_circle(*S(265, 130), s_val(78), *c_orange)
    fill_circle(*S(265, 155), s_val(76), *c_orange)
    # Main Yellow Disc
    fill_circle(*S(278, 148), s_val(74), *c_yellow)
    # Outer border
    draw_line(*S(278-74, 148), *S(278+74, 148), s_val(1), *c_orange) # dummy to keep math
    # draw orange circle stroke
    for deg in range(0, 360, 2):
        rad = math.radians(deg)
        cx0, cy0 = S(278, 148)
        px = cx0 + math.cos(rad) * s_val(74)
        py = cy0 + math.sin(rad) * s_val(74)
        set_pixel(int(px), int(py), *c_orange)
    # Center dot
    fill_circle(*S(278, 148), s_val(10), *c_orange)
    # Groove highlights
    for deg in range(0, 85):
        rad = math.radians(deg)
        cx0, cy0 = S(278, 148)
        px = cx0 + math.cos(rad) * s_val(50)
        py = cy0 + math.sin(rad) * s_val(50)
        fill_circle(px, py, s_val(3), *c_highlight, a=0.8)
    for deg in range(180, 260):
        rad = math.radians(deg)
        cx0, cy0 = S(278, 148)
        px = cx0 + math.cos(rad) * s_val(52)
        py = cy0 + math.sin(rad) * s_val(52)
        fill_circle(px, py, s_val(3), *c_highlight, a=0.8)

    # --- Letter P (Top) ---
    # Orange shadow
    fill_polygon([S(355, 60), S(465, 60), S(475, 120), S(465, 175), S(435, 175), S(435, 235), S(355, 235)], *c_orange)
    fill_circle(*S(420, 115), s_val(58), *c_orange)
    # Main Yellow P
    p_poly = [
        S(378, 75), S(435, 75), S(460, 118), S(435, 160), S(420, 160), S(420, 225), S(378, 225)
    ]
    fill_polygon(p_poly, *c_yellow)
    fill_circle(*S(420, 118), s_val(42), *c_yellow)
    fill_circle(*S(438, 118), s_val(10), *c_orange)
    for i in range(len(p_poly)):
        p1 = p_poly[i]
        p2 = p_poly[(i+1)%len(p_poly)]
        draw_line(p1[0], p1[1], p2[0], p2[1], s_val(6), *c_orange)
    draw_line(*S(384, 83), *S(384, 217), s_val(7), *c_highlight, a=0.6)


    # ---------------- BOTTOM ROW: MAP ----------------

    # --- Letter M (Jagged / Peak) ---
    # Shadow
    m_shadow = [
        S(15, 245), S(75, 320), S(165, 245), S(185, 260), S(185, 435), S(15, 435)
    ]
    fill_polygon(m_shadow, *c_orange)
    # Main Yellow M
    m_poly = [
        S(38, 285), S(95, 365), S(170, 268), S(170, 425), S(125, 425),
        S(125, 348), S(95, 388), S(65, 348), S(65, 425), S(38, 425)
    ]
    fill_polygon(m_poly, *c_yellow)
    for i in range(len(m_poly)):
        p1 = m_poly[i]
        p2 = m_poly[(i+1)%len(m_poly)]
        draw_line(p1[0], p1[1], p2[0], p2[1], s_val(6), *c_orange)
    draw_line(*S(45, 295), *S(45, 418), s_val(7), *c_highlight, a=0.6)
    draw_line(*S(155, 280), *S(155, 418), s_val(7), *c_highlight, a=0.6)

    # --- Letter A (Triangle Slice) ---
    # Shadow
    fill_polygon([S(268, 248), S(185, 410), S(355, 410)], *c_orange)
    fill_polygon([S(280, 265), S(195, 430), S(365, 430)], *c_orange)
    # Main Triangle
    a_poly = [S(285, 285), S(220, 425), S(350, 425)]
    fill_polygon(a_poly, *c_yellow)
    for i in range(len(a_poly)):
        p1 = a_poly[i]
        p2 = a_poly[(i+1)%len(a_poly)]
        draw_line(p1[0], p1[1], p2[0], p2[1], s_val(6), *c_orange)
    fill_circle(*S(285, 370), s_val(10), *c_orange)
    draw_line(*S(265, 415), *S(330, 415), s_val(6), *c_highlight, a=0.7)
    draw_line(*S(330, 415), *S(315, 385), s_val(6), *c_highlight, a=0.7)

    # --- Letter P (Bottom) ---
    # Shadow
    fill_polygon([S(355, 260), S(465, 260), S(475, 320), S(465, 375), S(435, 375), S(435, 435), S(355, 435)], *c_orange)
    fill_circle(*S(420, 315), s_val(58), *c_orange)
    # Main Yellow P
    p_bot_poly = [
        S(378, 275), S(435, 275), S(460, 318), S(435, 360), S(420, 360), S(420, 425), S(378, 425)
    ]
    fill_polygon(p_bot_poly, *c_yellow)
    fill_circle(*S(420, 318), s_val(42), *c_yellow)
    fill_circle(*S(438, 318), s_val(10), *c_orange)
    for i in range(len(p_bot_poly)):
        p1 = p_bot_poly[i]
        p2 = p_bot_poly[(i+1)%len(p_bot_poly)]
        draw_line(p1[0], p1[1], p2[0], p2[1], s_val(6), *c_orange)
    draw_line(*S(384, 283), *S(384, 417), s_val(7), *c_highlight, a=0.6)

    # Downsample from supersampled buffer (scale x scale box filter)
    out_buf = bytearray(width * height * 3)
    for y in range(height):
        for x in range(width):
            r_sum = 0
            g_sum = 0
            b_sum = 0
            for sy in range(scale):
                for sx in range(scale):
                    s_idx = ((y * scale + sy) * sw + (x * scale + sx)) * 3
                    r_sum += buf[s_idx]
                    g_sum += buf[s_idx+1]
                    b_sum += buf[s_idx+2]
            count = scale * scale
            out_idx = (y * width + x) * 3
            out_buf[out_idx] = r_sum // count
            out_buf[out_idx+1] = g_sum // count
            out_buf[out_idx+2] = b_sum // count

    # Return raw PPM bytes
    header = f"P6\n{width} {height}\n255\n".encode('ascii')
    return header + out_buf

# Generate all sizes
targets = [
    ("favicon-16x16.png", 16, 16, False),
    ("favicon-32x32.png", 32, 32, False),
    ("apple-touch-icon.png", 180, 180, False),
    ("android-chrome-192x192.png", 192, 192, False),
    ("icon-192.png", 192, 192, False),
    ("android-chrome-512x512.png", 512, 512, False),
    ("icon-512.png", 512, 512, False),
    ("favicon.png", 512, 512, False),
    ("favicon.ico", 32, 32, False),
    ("og-image.png", 1200, 630, True),
]

os.makedirs("/public", exist_ok=True)

for filename, w, h, is_og in targets:
    ppm_data = create_image(w, h, is_og)
    ppm_temp = f"/tmp/{filename}.ppm"
    with open(ppm_temp, "wb") as f:
        f.write(ppm_data)
    
    # Destination paths: /public and /
    dest_pub = os.path.join("/public", filename)
    dest_root = os.path.join("/", filename)
    
    # Convert PPM to PNG/ICO via ImageMagick
    subprocess.run(["convert", ppm_temp, dest_pub], check=True)
    subprocess.run(["convert", ppm_temp, dest_root], check=True)
    print(f"Generated {filename} ({w}x{h}) in /public/ and /")

print("All icon files successfully created and placed in root and /public/!")
