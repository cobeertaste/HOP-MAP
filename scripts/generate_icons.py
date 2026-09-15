import os
import subprocess

# SVG template for HOP MAP logo in 512x512 square
square_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#0f1422" />
  
  <g transform="translate(16, 16) scale(0.9375)">
    <!-- ==================== TOP ROW: HOP ==================== -->
    
    <!-- H letter -->
    <g id="letter-H">
      <!-- Orange background 3D extrusion / shadow -->
      <!-- Left pillar shadow -->
      <rect x="15" y="60" width="80" height="175" rx="4" fill="#ff7a00" />
      <rect x="25" y="50" width="70" height="185" rx="4" fill="#ff7a00" />
      <!-- Right pillar shadow -->
      <rect x="115" y="60" width="80" height="175" rx="4" fill="#ff7a00" />
      <rect x="105" y="70" width="90" height="165" rx="4" fill="#ff7a00" />
      <!-- Crossbar shadow -->
      <rect x="40" y="115" width="130" height="65" fill="#ff7a00" />

      <!-- Main Yellow H -->
      <path d="M 38 75 
               L 92 75 
               L 92 125 
               L 122 125 
               L 122 75 
               L 176 75 
               L 176 225 
               L 122 225 
               L 122 170 
               L 92 170 
               L 92 225 
               L 38 225 Z" 
            fill="#ffd000" stroke="#ff7a00" stroke-width="8" stroke-linejoin="miter" />
      
      <!-- Yellow inner highlights -->
      <path d="M 45 83 L 53 83 L 53 217 L 45 217 Z" fill="#fff066" opacity="0.6" />
      <path d="M 161 83 L 169 83 L 169 217 L 161 217 Z" fill="#fff066" opacity="0.6" />
      <path d="M 53 210 L 85 210 L 85 217 L 53 217 Z" fill="#fff066" opacity="0.6" />
      <path d="M 129 210 L 161 210 L 161 217 L 129 217 Z" fill="#fff066" opacity="0.6" />
    </g>

    <!-- O letter (Vinyl / Hop Disc) -->
    <g id="letter-O">
      <!-- Orange 3D extrusion offset -->
      <ellipse cx="265" cy="130" rx="80" ry="78" fill="#ff7a00" />
      <circle cx="265" cy="155" r="76" fill="#ff7a00" />
      
      <!-- Main Yellow Disc -->
      <circle cx="278" cy="148" r="74" fill="#ffd000" stroke="#ff7a00" stroke-width="8" />
      
      <!-- Center dot / hole -->
      <circle cx="278" cy="148" r="9" fill="#ff7a00" />
      
      <!-- Stylized curved groove / highlight -->
      <path d="M 330 148 A 52 52 0 0 1 298 196" fill="none" stroke="#fff066" stroke-width="7" stroke-linecap="round" />
      <path d="M 235 125 A 50 50 0 0 1 278 98" fill="none" stroke="#fff066" stroke-width="6" stroke-linecap="round" opacity="0.8" />
    </g>

    <!-- P letter (Top) -->
    <g id="letter-P-top">
      <!-- Orange shadow -->
      <path d="M 355 60 L 465 60 A 65 65 0 0 1 465 175 L 435 175 L 435 235 L 355 235 Z" fill="#ff7a00" />
      <path d="M 365 52 L 470 52 A 65 65 0 0 1 470 170 L 440 170 L 440 235 L 365 235 Z" fill="#ff7a00" />

      <!-- Main Yellow P -->
      <path d="M 378 75 
               L 440 75 
               A 42 42 0 0 1 440 160 
               L 420 160 
               L 420 225 
               L 378 225 Z" 
            fill="#ffd000" stroke="#ff7a00" stroke-width="8" stroke-linejoin="round" />
      
      <!-- P Counter (Hole / Dot) -->
      <circle cx="438" cy="118" r="9" fill="#ff7a00" />
      
      <!-- Stylized inner line -->
      <path d="M 390 85 L 420 85 A 25 25 0 0 1 420 135 L 390 135 Z" fill="none" stroke="#ff7a00" stroke-width="5" stroke-linejoin="round" />
      <path d="M 384 83 L 384 217" stroke="#fff066" stroke-width="6" stroke-linecap="round" opacity="0.6" />
    </g>


    <!-- ==================== BOTTOM ROW: MAP ==================== -->

    <!-- M letter -->
    <g id="letter-M">
      <!-- Orange 3D shadow with jagged crowns -->
      <path d="M 15 245 L 75 320 L 165 245 L 185 260 L 185 435 L 15 435 Z" fill="#ff7a00" />
      <polygon points="15,245 40,245 40,430 15,430" fill="#ff7a00" />
      <polygon points="155,245 185,245 185,430 155,430" fill="#ff7a00" />

      <!-- Main Yellow M with jagged peaks -->
      <path d="M 38 285 
               L 95 365 
               L 170 268 
               L 170 425 
               L 125 425 
               L 125 348 
               L 95 388 
               L 65 348 
               L 65 425 
               L 38 425 Z" 
            fill="#ffd000" stroke="#ff7a00" stroke-width="8" stroke-linejoin="miter" />
      
      <!-- Jagged Top-left fin -->
      <polygon points="15,245 38,285 38,415 15,350" fill="#ff7a00" />
      <polygon points="140,250 170,268 170,350 140,290" fill="#ff7a00" opacity="0.7" />

      <!-- Highlights -->
      <path d="M 45 300 L 45 418" stroke="#fff066" stroke-width="6" stroke-linecap="round" opacity="0.6" />
      <path d="M 155 285 L 155 418" stroke="#fff066" stroke-width="6" stroke-linecap="round" opacity="0.6" />
    </g>

    <!-- A letter (Triangle Slice) -->
    <g id="letter-A">
      <!-- Orange 3D shadow -->
      <polygon points="268,248 185,410 355,410" fill="#ff7a00" />
      <polygon points="280,265 195,430 365,430" fill="#ff7a00" />

      <!-- Main Yellow Triangle -->
      <polygon points="285,285 220,425 350,425" fill="#ffd000" stroke="#ff7a00" stroke-width="8" stroke-linejoin="round" />
      
      <!-- Center dot / pip -->
      <circle cx="285" cy="370" r="9" fill="#ff7a00" />
      
      <!-- Inner angular accent -->
      <polyline points="265,415 330,415 315,385" fill="none" stroke="#fff066" stroke-width="6" stroke-linecap="round" opacity="0.7" />
    </g>

    <!-- P letter (Bottom) -->
    <g id="letter-P-bottom">
      <!-- Orange shadow -->
      <path d="M 355 260 L 465 260 A 65 65 0 0 1 465 375 L 435 375 L 435 435 L 355 435 Z" fill="#ff7a00" />
      <path d="M 365 252 L 470 252 A 65 65 0 0 1 470 370 L 440 370 L 440 435 L 365 435 Z" fill="#ff7a00" />

      <!-- Main Yellow P -->
      <path d="M 378 275 
               L 440 275 
               A 42 42 0 0 1 440 360 
               L 420 360 
               L 420 425 
               L 378 425 Z" 
            fill="#ffd000" stroke="#ff7a00" stroke-width="8" stroke-linejoin="round" />
      
      <!-- P Counter (Dot / Hole) -->
      <circle cx="438" cy="318" r="9" fill="#ff7a00" />
      
      <!-- Stylized inner line -->
      <path d="M 390 285 L 420 285 A 25 25 0 0 1 420 335 L 390 335 Z" fill="none" stroke="#ff7a00" stroke-width="5" stroke-linejoin="round" />
      <path d="M 384 283 L 384 417" stroke="#fff066" stroke-width="6" stroke-linecap="round" opacity="0.6" />
    </g>
  </g>
</svg>
"""

# OG image template (1200x630)
og_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#0f1422" />
  
  <g transform="translate(344, 59)">
    <!-- Main Square 512x512 centered -->
    <g transform="translate(0, 0)">
      <!-- H letter -->
      <g id="og-letter-H">
        <rect x="15" y="60" width="80" height="175" rx="4" fill="#ff7a00" />
        <rect x="25" y="50" width="70" height="185" rx="4" fill="#ff7a00" />
        <rect x="115" y="60" width="80" height="175" rx="4" fill="#ff7a00" />
        <rect x="105" y="70" width="90" height="165" rx="4" fill="#ff7a00" />
        <rect x="40" y="115" width="130" height="65" fill="#ff7a00" />

        <path d="M 38 75 L 92 75 L 92 125 L 122 125 L 122 75 L 176 75 L 176 225 L 122 225 L 122 170 L 92 170 L 92 225 L 38 225 Z" 
              fill="#ffd000" stroke="#ff7a00" stroke-width="8" stroke-linejoin="miter" />
        
        <path d="M 45 83 L 53 83 L 53 217 L 45 217 Z" fill="#fff066" opacity="0.6" />
        <path d="M 161 83 L 169 83 L 169 217 L 161 217 Z" fill="#fff066" opacity="0.6" />
        <path d="M 53 210 L 85 210 L 85 217 L 53 217 Z" fill="#fff066" opacity="0.6" />
        <path d="M 129 210 L 161 210 L 161 217 L 129 217 Z" fill="#fff066" opacity="0.6" />
      </g>

      <!-- O letter -->
      <g id="og-letter-O">
        <ellipse cx="265" cy="130" rx="80" ry="78" fill="#ff7a00" />
        <circle cx="265" cy="155" r="76" fill="#ff7a00" />
        <circle cx="278" cy="148" r="74" fill="#ffd000" stroke="#ff7a00" stroke-width="8" />
        <circle cx="278" cy="148" r="9" fill="#ff7a00" />
        <path d="M 330 148 A 52 52 0 0 1 298 196" fill="none" stroke="#fff066" stroke-width="7" stroke-linecap="round" />
        <path d="M 235 125 A 50 50 0 0 1 278 98" fill="none" stroke="#fff066" stroke-width="6" stroke-linecap="round" opacity="0.8" />
      </g>

      <!-- P letter top -->
      <g id="og-letter-P-top">
        <path d="M 355 60 L 465 60 A 65 65 0 0 1 465 175 L 435 175 L 435 235 L 355 235 Z" fill="#ff7a00" />
        <path d="M 365 52 L 470 52 A 65 65 0 0 1 470 170 L 440 170 L 440 235 L 365 235 Z" fill="#ff7a00" />
        <path d="M 378 75 L 440 75 A 42 42 0 0 1 440 160 L 420 160 L 420 225 L 378 225 Z" 
              fill="#ffd000" stroke="#ff7a00" stroke-width="8" stroke-linejoin="round" />
        <circle cx="438" cy="118" r="9" fill="#ff7a00" />
        <path d="M 390 85 L 420 85 A 25 25 0 0 1 420 135 L 390 135 Z" fill="none" stroke="#ff7a00" stroke-width="5" stroke-linejoin="round" />
        <path d="M 384 83 L 384 217" stroke="#fff066" stroke-width="6" stroke-linecap="round" opacity="0.6" />
      </g>

      <!-- M letter -->
      <g id="og-letter-M">
        <path d="M 15 245 L 75 320 L 165 245 L 185 260 L 185 435 L 15 435 Z" fill="#ff7a00" />
        <polygon points="15,245 40,245 40,430 15,430" fill="#ff7a00" />
        <polygon points="155,245 185,245 185,430 155,430" fill="#ff7a00" />
        <path d="M 38 285 L 95 365 L 170 268 L 170 425 L 125 425 L 125 348 L 95 388 L 65 348 L 65 425 L 38 425 Z" 
              fill="#ffd000" stroke="#ff7a00" stroke-width="8" stroke-linejoin="miter" />
        <polygon points="15,245 38,285 38,415 15,350" fill="#ff7a00" />
        <polygon points="140,250 170,268 170,350 140,290" fill="#ff7a00" opacity="0.7" />
        <path d="M 45 300 L 45 418" stroke="#fff066" stroke-width="6" stroke-linecap="round" opacity="0.6" />
        <path d="M 155 285 L 155 418" stroke="#fff066" stroke-width="6" stroke-linecap="round" opacity="0.6" />
      </g>

      <!-- A letter -->
      <g id="og-letter-A">
        <polygon points="268,248 185,410 355,410" fill="#ff7a00" />
        <polygon points="280,265 195,430 365,430" fill="#ff7a00" />
        <polygon points="285,285 220,425 350,425" fill="#ffd000" stroke="#ff7a00" stroke-width="8" stroke-linejoin="round" />
        <circle cx="285" cy="370" r="9" fill="#ff7a00" />
        <polyline points="265,415 330,415 315,385" fill="none" stroke="#fff066" stroke-width="6" stroke-linecap="round" opacity="0.7" />
      </g>

      <!-- P letter bottom -->
      <g id="og-letter-P-bottom">
        <path d="M 355 260 L 465 260 A 65 65 0 0 1 465 375 L 435 375 L 435 435 L 355 435 Z" fill="#ff7a00" />
        <path d="M 365 252 L 470 252 A 65 65 0 0 1 470 370 L 440 370 L 440 435 L 365 435 Z" fill="#ff7a00" />
        <path d="M 378 275 L 440 275 A 42 42 0 0 1 440 360 L 420 360 L 420 425 L 378 425 Z" 
              fill="#ffd000" stroke="#ff7a00" stroke-width="8" stroke-linejoin="round" />
        <circle cx="438" cy="318" r="9" fill="#ff7a00" />
        <path d="M 390 285 L 420 285 A 25 25 0 0 1 420 335 L 390 335 Z" fill="none" stroke="#ff7a00" stroke-width="5" stroke-linejoin="round" />
        <path d="M 384 283 L 384 417" stroke="#fff066" stroke-width="6" stroke-linecap="round" opacity="0.6" />
      </g>
    </g>
  </g>
</svg>
"""

with open("/tmp/square.svg", "w") as f:
    f.write(square_svg)

with open("/tmp/og.svg", "w") as f:
    f.write(og_svg)

# Targets:
# Sizes for square:
# 16x16: favicon-16x16.png
# 32x32: favicon-32x32.png
# 180x180: apple-touch-icon.png
# 192x192: android-chrome-192x192.png, icon-192.png
# 512x512: android-chrome-512x512.png, icon-512.png, favicon.png
# favicon.ico (32x32 or multi-layer ico)
# og-image.png (1200x630)

files_to_generate = [
    ("/tmp/square.svg", "favicon-16x16.png", 16, 16),
    ("/tmp/square.svg", "favicon-32x32.png", 32, 32),
    ("/tmp/square.svg", "apple-touch-icon.png", 180, 180),
    ("/tmp/square.svg", "android-chrome-192x192.png", 192, 192),
    ("/tmp/square.svg", "icon-192.png", 192, 192),
    ("/tmp/square.svg", "android-chrome-512x512.png", 512, 512),
    ("/tmp/square.svg", "icon-512.png", 512, 512),
    ("/tmp/square.svg", "favicon.png", 512, 512),
    ("/tmp/square.svg", "favicon.ico", 32, 32),
    ("/tmp/og.svg", "og-image.png", 1200, 630),
]

os.makedirs("/public", exist_ok=True)

for src_svg, filename, w, h in files_to_generate:
    # Generate into /public and /
    dest_pub = os.path.join("/public", filename)
    dest_root = os.path.join("/", filename)
    
    cmd_pub = ["convert", "-background", "none", "-resize", f"{w}x{h}", src_svg, dest_pub]
    subprocess.run(cmd_pub, check=True)
    
    cmd_root = ["convert", "-background", "none", "-resize", f"{w}x{h}", src_svg, dest_root]
    subprocess.run(cmd_root, check=True)
    print(f"Generated {filename} ({w}x{h}) in /public/ and /")

print("All icons successfully generated!")
