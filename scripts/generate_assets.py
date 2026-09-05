import zlib
import struct
import os
import subprocess

# Define the exact 32x32 pixel art grid representing the user-provided HOP MAP asset
# . = Background #F4F8E6
# R = Red #EB5757
# O = Orange #F2994A
# G = Green #27AE60
# B = Blue #2F80ED
# T = Teal #3CA9B8
# K = Black outline #000000
# W = White fill #FFFFFF
# S = 3D Drop Shadow #000000

GRID_32 = [
    "................................",
    "................................",
    "....RRRRROOOOOGGGGGBBBBBTTTTT...",
    "....RRRRROOOOOGGGGGBBBBBTTTTT...",
    "....RRRRROOOOOGGGGGBBBBBTTTTT...",
    "....RRRRROOOOOGGGGGBBBBBTTTTT...",
    "................................",
    "................................",
    "....KK..KK...KKKK...KKKKK.......",
    "....KWWKKWWK.KWWWWK.KWWWWK......",
    "....KWWKKWWKKWWKKWWKKWWKKWK.....",
    "....KWWWWWWKKWWKKWWKKWWWWK......",
    "....KWWWWWWKKWWKKWWKKWWKKKK.....",
    "....KWWKKWWKKWWKKWWKKWWK.SS.....",
    "....KWWKKWWK.KWWWWK.KWWK.SS.....",
    "....KK..KK...KKKK...KK..KKS.....",
    ".....SS..SS...SSSS...SS..SS.....",
    "................................",
    "....KK..KK...KKKK...KKKKK.......",
    "....KWWKKWWK.KWWWWK.KWWWWK......",
    "....KWKWKWKKKWWKKWWKKWWKKWK.....",
    "....KWKWKWKKKWWWWWWKKWWWWK......",
    "....KWKWKWKKKWWWWWWKKWWKKKK.....",
    "....KWWKKWWKKWWKKWWKKWWK.SS.....",
    "....KWWKKWWKKWWKKWWKKWWK.SS.....",
    "....KK..KK...KK..KK.KK..KKS.....",
    ".....SS..SS...SS..SS.SS..SS.....",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
]

# Let's verify each line is exactly 32 chars
for i, line in enumerate(GRID_32):
    assert len(line) == 32, f"Line {i} has length {len(line)} != 32: {line}"

PALETTE = {
    ".": "#F4F8E6",
    "R": "#EB5757",
    "O": "#F2994A",
    "G": "#27AE60",
    "B": "#2F80ED",
    "T": "#3CA9B8",
    "K": "#000000",
    "W": "#FFFFFF",
    "S": "#000000",
}

def generate_svg():
    rects = []
    # Background rect
    rects.append('<rect width="32" height="32" fill="#F4F8E6"/>')
    for y, row in enumerate(GRID_32):
        for x, char in enumerate(row):
            if char != ".":
                color = PALETTE[char]
                rects.append(f'<rect x="{x}" y="{y}" width="1" height="1" fill="{color}"/>')
    
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%" shape-rendering="crispEdges">
{''.join(rects)}
</svg>'''
    return svg_content

def hex_to_rgba(hex_color):
    hex_color = hex_color.lstrip('#')
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return (r, g, b, 255)

def make_png_buffer(target_size):
    scale = target_size // 32
    # If target_size is not exact multiple of 32, scale by nearest or supersample
    rgba_bytes = bytearray()
    for target_y in range(target_size):
        grid_y = min(31, int(target_y * 32 / target_size))
        row = GRID_32[grid_y]
        for target_x in range(target_size):
            grid_x = min(31, int(target_x * 32 / target_size))
            char = row[grid_x]
            color = PALETTE[char]
            rgba = hex_to_rgba(color)
            rgba_bytes.extend(rgba)
    
    raw = bytearray()
    for y in range(target_size):
        raw.append(0) # filter type none
        start = y * target_size * 4
        raw.extend(rgba_bytes[start:start + target_size * 4])
    
    compressed = zlib.compress(bytes(raw), 9)
    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        crc = zlib.crc32(tag + data) & 0xffffffff
        return c + struct.pack(">I", crc)
    
    ihdr = struct.pack(">IIBBBBB", target_size, target_size, 8, 6, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", compressed) + chunk(b"IEND", b"")

def save_all():
    svg = generate_svg()
    
    # Save SVG
    with open("favicon.svg", "w", encoding="utf-8") as f:
        f.write(svg)
    with open("public/favicon.svg", "w", encoding="utf-8") as f:
        f.write(svg)
        
    sizes = {
        "favicon-96x96.png": 96,
        "apple-touch-icon.png": 180,
        "web-app-manifest-192x192.png": 192,
        "web-app-manifest-512x512.png": 512,
    }
    
    for filename, size in sizes.items():
        data = make_png_buffer(size)
        with open(filename, "wb") as f:
            f.write(data)
        with open(os.path.join("public", filename), "wb") as f:
            f.write(data)
            
    print("All assets generated successfully!")

if __name__ == "__main__":
    save_all()
