/**
 * Hop-Map Multilingual SSG (Static Site Generation / Pre-rendering) Engine
 * Generates pre-rendered HTML files with unique, accurate metadata for all 110 spots and 43 city pages in both PT and EN.
 */

import fs from 'fs';
import path from 'path';
import { BARS_DATA } from '../src/data';
import { getCitySlug, getSpotSlug } from '../src/lib/router';
import { getSpotMeta, getCityMeta, getHomeMeta, injectMetaTags } from '../src/lib/seo';

async function prerender() {
  console.log('🚀 Starting Multilingual Hop-Map SSG (PT & EN)...');

  const distDir = path.resolve(process.cwd(), 'dist');
  const templatePath = path.join(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.error('❌ Template dist/index.html not found! Run "vite build" first.');
    process.exit(1);
  }

  const rawTemplate = fs.readFileSync(templatePath, 'utf-8');

  // 1. Pre-render homepage in PT and EN
  const homeMetaPT = getHomeMeta('PT');
  const homeHtmlPT = injectMetaTags(rawTemplate, homeMetaPT);
  fs.writeFileSync(templatePath, homeHtmlPT, 'utf-8');

  // Explicit /pt and /en homepages
  const ptHomeDir = path.join(distDir, 'pt');
  fs.mkdirSync(ptHomeDir, { recursive: true });
  fs.writeFileSync(path.join(ptHomeDir, 'index.html'), homeHtmlPT, 'utf-8');

  const homeMetaEN = getHomeMeta('EN');
  const homeHtmlEN = injectMetaTags(rawTemplate, homeMetaEN);
  const enHomeDir = path.join(distDir, 'en');
  fs.mkdirSync(enHomeDir, { recursive: true });
  fs.writeFileSync(path.join(enHomeDir, 'index.html'), homeHtmlEN, 'utf-8');
  fs.writeFileSync(path.join(distDir, 'en.html'), homeHtmlEN, 'utf-8');
  console.log('✅ Pre-rendered homepages (PT & EN)');

  // 2. Pre-render all 110 spots in PT and EN
  let spotCountPT = 0;
  let spotCountEN = 0;

  for (const bar of BARS_DATA) {
    const city = getCitySlug(bar.zone) || 'portugal';
    const spotSlug = getSpotSlug(bar);
    if (!spotSlug) continue;

    // --- PT Version ---
    const spotMetaPT = getSpotMeta(bar, 'PT');
    const spotHtmlPT = injectMetaTags(rawTemplate, spotMetaPT);

    // dist/[city]/[spotSlug]/index.html
    const spotDirPT = path.join(distDir, city, spotSlug);
    fs.mkdirSync(spotDirPT, { recursive: true });
    fs.writeFileSync(path.join(spotDirPT, 'index.html'), spotHtmlPT, 'utf-8');

    // dist/pt/[city]/[spotSlug]/index.html
    const explicitPtDir = path.join(distDir, 'pt', city, spotSlug);
    fs.mkdirSync(explicitPtDir, { recursive: true });
    fs.writeFileSync(path.join(explicitPtDir, 'index.html'), spotHtmlPT, 'utf-8');

    // dist/[city]/[spotSlug].html
    const cityDirPT = path.join(distDir, city);
    fs.mkdirSync(cityDirPT, { recursive: true });
    fs.writeFileSync(path.join(cityDirPT, `${spotSlug}.html`), spotHtmlPT, 'utf-8');
    spotCountPT++;

    // --- EN Version ---
    const spotMetaEN = getSpotMeta(bar, 'EN');
    const spotHtmlEN = injectMetaTags(rawTemplate, spotMetaEN);

    // dist/en/[city]/[spotSlug]/index.html
    const spotDirEN = path.join(distDir, 'en', city, spotSlug);
    fs.mkdirSync(spotDirEN, { recursive: true });
    fs.writeFileSync(path.join(spotDirEN, 'index.html'), spotHtmlEN, 'utf-8');

    // dist/en/[city]/[spotSlug].html
    const cityDirEN = path.join(distDir, 'en', city);
    fs.mkdirSync(cityDirEN, { recursive: true });
    fs.writeFileSync(path.join(cityDirEN, `${spotSlug}.html`), spotHtmlEN, 'utf-8');
    spotCountEN++;
  }
  console.log(`✅ Pre-rendered ${spotCountPT} PT spot pages and ${spotCountEN} EN spot pages (Total: ${spotCountPT + spotCountEN}).`);

  // 3. Pre-render all unique city/zone pages in PT and EN
  const uniqueZones = Array.from(new Set(BARS_DATA.map(b => b.zone))).filter(Boolean);
  let cityCountPT = 0;
  let cityCountEN = 0;

  for (const zone of uniqueZones) {
    const city = getCitySlug(zone);
    if (!city) continue;

    // --- PT City Page ---
    const cityMetaPT = getCityMeta(zone, 'PT');
    const cityHtmlPT = injectMetaTags(rawTemplate, cityMetaPT);

    const cityDirPT = path.join(distDir, city);
    fs.mkdirSync(cityDirPT, { recursive: true });
    fs.writeFileSync(path.join(cityDirPT, 'index.html'), cityHtmlPT, 'utf-8');
    fs.writeFileSync(path.join(distDir, `${city}.html`), cityHtmlPT, 'utf-8');

    const explicitPtCityDir = path.join(distDir, 'pt', city);
    fs.mkdirSync(explicitPtCityDir, { recursive: true });
    fs.writeFileSync(path.join(explicitPtCityDir, 'index.html'), cityHtmlPT, 'utf-8');
    cityCountPT++;

    // --- EN City Page ---
    const cityMetaEN = getCityMeta(zone, 'EN');
    const cityHtmlEN = injectMetaTags(rawTemplate, cityMetaEN);

    const cityDirEN = path.join(distDir, 'en', city);
    fs.mkdirSync(cityDirEN, { recursive: true });
    fs.writeFileSync(path.join(cityDirEN, 'index.html'), cityHtmlEN, 'utf-8');
    cityCountEN++;
  }
  console.log(`✅ Pre-rendered ${cityCountPT} PT city pages and ${cityCountEN} EN city pages.`);

  console.log('🎉 Multilingual SSG Pre-rendering complete!');
}

prerender().catch(err => {
  console.error('Fatal error during pre-rendering:', err);
  process.exit(1);
});
