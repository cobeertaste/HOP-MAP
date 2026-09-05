import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Clean SVG without double-hyphen in comments
const svgLogo = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#141724" rx="0" />

  <g id="hop-map-art">
    <!-- TOP ROW: HOP -->

    <!-- LETTER H 3D SHADOW -->
    <path d="M 64 96 L 132 96 L 132 140 L 156 140 L 156 96 L 194 96 L 194 218 L 156 218 L 156 174 L 132 174 L 132 218 L 64 218 Z" 
          fill="#FF5E00" />
    <!-- LETTER H FRONT FACE -->
    <path d="M 88 120 L 134 120 L 134 152 L 158 152 L 158 120 L 194 120 L 194 232 L 158 232 L 158 186 L 134 186 L 134 232 L 88 232 Z" 
          fill="#FFB800" stroke="#FF7700" stroke-width="4" stroke-linejoin="miter" />
    <line x1="96" y1="128" x2="96" y2="224" stroke="#FFE680" stroke-width="3" stroke-linecap="round" opacity="0.8" />
    <line x1="184" y1="128" x2="184" y2="224" stroke="#FFE680" stroke-width="3" stroke-linecap="round" opacity="0.8" />
    <line x1="130" y1="168" x2="162" y2="168" stroke="#FFE680" stroke-width="2.5" stroke-linecap="round" opacity="0.8" />
    <path d="M 166 128 L 186 128 L 186 224 L 166 224" fill="none" stroke="#FF7700" stroke-width="2" opacity="0.6" />

    <!-- LETTER O 3D SHADOW -->
    <ellipse cx="250" cy="168" rx="68" ry="68" fill="#FF5E00" />
    
    <!-- LETTER O FRONT FACE -->
    <circle cx="270" cy="174" r="62" fill="#FFB800" stroke="#FF7700" stroke-width="4" />
    <circle cx="270" cy="174" r="48" fill="none" stroke="#FF5E00" stroke-width="3.5" />
    <circle cx="270" cy="174" r="46" fill="none" stroke="#FFE680" stroke-width="2" opacity="0.7" />
    <circle cx="270" cy="174" r="8.5" fill="#FF5E00" />
    <circle cx="270" cy="174" r="5" fill="#FFE680" />
    <path d="M 230 145 A 50 50 0 0 1 310 145" fill="none" stroke="#FFE680" stroke-width="3.5" stroke-linecap="round" />

    <!-- LETTER P TOP 3D SHADOW -->
    <path d="M 338 96 L 418 96 C 444 96 458 114 458 140 C 458 166 444 182 418 182 L 382 182 L 382 218 L 338 218 Z" 
          fill="#FF5E00" />
    <!-- LETTER P TOP FRONT FACE -->
    <path d="M 356 120 L 416 120 C 438 120 452 134 452 154 C 452 174 438 188 416 188 L 392 188 L 392 232 L 356 232 Z" 
          fill="#FFB800" stroke="#FF7700" stroke-width="4" stroke-linejoin="miter" />
    <ellipse cx="410" cy="154" rx="18" ry="18" fill="#141724" stroke="#FF7700" stroke-width="3.5" />
    <circle cx="410" cy="154" r="7" fill="#FF5E00" />
    <circle cx="410" cy="154" r="4" fill="#FFE680" />
    <line x1="364" y1="128" x2="364" y2="224" stroke="#FFE680" stroke-width="3" stroke-linecap="round" opacity="0.8" />
    <path d="M 376 128 L 414 128 C 428 128 438 136 438 148" fill="none" stroke="#FFE680" stroke-width="2.5" stroke-linecap="round" opacity="0.8" />


    <!-- BOTTOM ROW: MAP -->

    <!-- LETTER M 3D SHADOW -->
    <polygon points="64,270 120,300 98,394 64,394" fill="#FF5E00" />
    <polygon points="120,300 150,270 186,310 186,394 154,394 126,350" fill="#FF5E00" />
    <!-- LETTER M FRONT FACE -->
    <polygon points="88,300 126,380 134,380 162,310 198,310 198,412 166,412 166,358 136,400 120,400 92,354 92,412 64,412 64,300" 
             fill="#FFB800" stroke="#FF7700" stroke-width="4" stroke-linejoin="miter" />
    <line x1="72" y1="310" x2="72" y2="404" stroke="#FFE680" stroke-width="3" stroke-linecap="round" opacity="0.8" />
    <line x1="88" y1="310" x2="124" y2="390" stroke="#FFE680" stroke-width="2.5" stroke-linecap="round" opacity="0.8" />
    <line x1="162" y1="316" x2="190" y2="316" stroke="#FFE680" stroke-width="2.5" stroke-linecap="round" opacity="0.8" />
    <line x1="188" y1="320" x2="188" y2="404" stroke="#FFE680" stroke-width="3" stroke-linecap="round" opacity="0.8" />

    <!-- LETTER A 3D SHADOW -->
    <polygon points="254,270 338,400 188,400" fill="#FF5E00" />
    <!-- LETTER A FRONT FACE -->
    <polygon points="274,278 348,412 218,412" fill="#FFB800" stroke="#FF7700" stroke-width="4" stroke-linejoin="miter" />
    <polygon points="274,324 316,396 242,396" fill="none" stroke="#FF5E00" stroke-width="3" stroke-linejoin="miter" />
    <circle cx="276" cy="366" r="8" fill="#FF5E00" />
    <circle cx="276" cy="366" r="4.5" fill="#FFE680" />
    <line x1="272" y1="290" x2="230" y2="404" stroke="#FFE680" stroke-width="3.5" stroke-linecap="round" opacity="0.8" />
    <line x1="230" y1="406" x2="336" y2="406" stroke="#FFE680" stroke-width="2" stroke-linecap="round" opacity="0.7" />

    <!-- LETTER P BOTTOM 3D SHADOW -->
    <path d="M 338 276 L 418 276 C 444 276 458 294 458 320 C 458 346 444 362 418 362 L 382 362 L 382 398 L 338 398 Z" 
          fill="#FF5E00" />
    <!-- LETTER P BOTTOM FRONT FACE -->
    <path d="M 356 300 L 416 300 C 438 300 452 314 452 334 C 452 354 438 368 416 368 L 392 368 L 392 412 L 356 412 Z" 
          fill="#FFB800" stroke="#FF7700" stroke-width="4" stroke-linejoin="miter" />
    <ellipse cx="410" cy="334" rx="18" ry="18" fill="#141724" stroke="#FF7700" stroke-width="3.5" />
    <circle cx="410" cy="334" r="7" fill="#FF5E00" />
    <circle cx="410" cy="334" r="4" fill="#FFE680" />
    <line x1="364" y1="308" x2="364" y2="404" stroke="#FFE680" stroke-width="3" stroke-linecap="round" opacity="0.8" />
    <path d="M 376 308 L 414 308 C 428 308 438 316 438 328" fill="none" stroke="#FFE680" stroke-width="2.5" stroke-linecap="round" opacity="0.8" />

  </g>
</svg>
`;

async function generateAllIcons() {
  console.log('Generating Hop-Map branding icons from SVG vector...');

  const targets = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'icon-192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'icon-512.png', size: 512 },
    { name: 'favicon.png', size: 512 }
  ];

  const svgBuffer = Buffer.from(svgLogo);

  // Ensure public directory exists
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }

  for (const t of targets) {
    const pngBuffer = await sharp(svgBuffer)
      .resize(t.size, t.size, { fit: 'contain' })
      .png({ compressionLevel: 9 })
      .toBuffer();

    // Write to root
    fs.writeFileSync(t.name, pngBuffer);
    // Write to public/
    fs.writeFileSync(path.join('public', t.name), pngBuffer);

    console.log(`✓ Generated ${t.name} (${t.size}x${t.size}) in root and public/`);
  }

  // Also create favicon.ico
  const icoBuffer = await sharp(svgBuffer)
    .resize(32, 32, { fit: 'contain' })
    .png()
    .toBuffer();
  fs.writeFileSync('favicon.ico', icoBuffer);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  console.log('✓ Generated favicon.ico in root and public/');

  console.log('All icons generated successfully!');
}

generateAllIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
