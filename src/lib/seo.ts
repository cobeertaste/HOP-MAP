/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hop-Map SEO & Server-Side Metadata Engine (PT & EN Support)
 * Supports static pre-rendering (SSG) and runtime SSR-lite injection of rich Open Graph & SEO tags.
 */

import { Bar } from '../types';
import { getCitySlug, getSpotSlug } from './router';
import { SPOT_DESCRIPTIONS_EN_BY_ID } from './i18n';

export const DEFAULT_BASE_URL = 'https://hop-map.ai.studio';

export interface PageMeta {
  lang: 'PT' | 'EN';
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogLocale: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  alternatePt?: string;
  alternateEn?: string;
  alternateDefault?: string;
}

export function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function getCleanSpotName(name: string): string {
  if (!name) return '';
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

/**
 * Generates SEO metadata for a specific spot in PT or EN
 */
export function getSpotMeta(bar: Bar, lang: 'PT' | 'EN' = 'PT', baseUrl: string = DEFAULT_BASE_URL): PageMeta {
  const city = getCitySlug(bar.zone) || 'portugal';
  const spotSlug = getSpotSlug(bar);
  const cleanName = getCleanSpotName(bar.name);

  const ptCanonical = `${baseUrl}/${city}/${spotSlug}`;
  const enCanonical = `${baseUrl}/en/${city}/${spotSlug}`;
  const canonicalUrl = lang === 'EN' ? enCanonical : ptCanonical;

  let title = '';
  let description = '';

  if (lang === 'EN') {
    title = `${cleanName} - ${bar.zone} | Hop Map - Craft Beer Guide`;
    const enDesc = (SPOT_DESCRIPTIONS_EN_BY_ID[bar.id] || bar.descriptionEN || bar.description || '').trim();
    description = enDesc || `Discover the craft beer spot ${cleanName} in ${bar.zone} on Hop Map.`;
    if (!description.endsWith('.')) description += '.';
  } else {
    title = `${cleanName} - ${bar.zone} | Hop Map`;
    const ptDesc = (bar.descriptionPT || bar.description || '').trim();
    description = ptDesc || `Descobre o spot de cerveja artesanal ${cleanName} em ${bar.zone} no Hop Map.`;
    if (!description.endsWith('.')) description += '.';
  }

  const coverImage = bar.coverPhoto && bar.coverPhoto.trim().length > 0
    ? bar.coverPhoto.trim()
    : `${baseUrl}/og-image.png`;

  return {
    lang,
    title,
    description,
    canonical: canonicalUrl,
    ogTitle: title,
    ogDescription: description,
    ogImage: coverImage,
    ogUrl: canonicalUrl,
    ogLocale: lang === 'EN' ? 'en_US' : 'pt_PT',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: coverImage,
    alternatePt: ptCanonical,
    alternateEn: enCanonical,
    alternateDefault: ptCanonical
  };
}

/**
 * Generates SEO metadata for a specific city/zone in PT or EN
 */
export function getCityMeta(zone: string, lang: 'PT' | 'EN' = 'PT', baseUrl: string = DEFAULT_BASE_URL): PageMeta {
  const city = getCitySlug(zone) || 'portugal';
  const ptCanonical = `${baseUrl}/${city}`;
  const enCanonical = `${baseUrl}/en/${city}`;
  const canonicalUrl = lang === 'EN' ? enCanonical : ptCanonical;
  const defaultImage = `${baseUrl}/og-image.png`;

  let title = '';
  let description = '';

  if (lang === 'EN') {
    title = `Craft Beer Spots & Taprooms in ${zone} | Hop Map`;
    description = `Discover the best craft beer bars, brewpubs and taprooms in ${zone} on Hop Map.`;
  } else {
    title = `Spots de Cerveja Artesanal em ${zone} | Hop Map`;
    description = `Descobre os melhores taprooms, cervejarias artesanais e bares de cerveja em ${zone} no Hop Map.`;
  }

  return {
    lang,
    title,
    description,
    canonical: canonicalUrl,
    ogTitle: title,
    ogDescription: description,
    ogImage: defaultImage,
    ogUrl: canonicalUrl,
    ogLocale: lang === 'EN' ? 'en_US' : 'pt_PT',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: defaultImage,
    alternatePt: ptCanonical,
    alternateEn: enCanonical,
    alternateDefault: ptCanonical
  };
}

/**
 * Generates SEO metadata for the homepage in PT or EN
 */
export function getHomeMeta(lang: 'PT' | 'EN' = 'PT', baseUrl: string = DEFAULT_BASE_URL): PageMeta {
  const ptCanonical = `${baseUrl}/`;
  const enCanonical = `${baseUrl}/en`;
  const canonicalUrl = lang === 'EN' ? enCanonical : ptCanonical;
  const defaultImage = `${baseUrl}/og-image.png`;

  let title = '';
  let description = '';

  if (lang === 'EN') {
    title = 'HOP MAP - Craft Beer & Taprooms in Portugal';
    description = 'Discover the best craft beer taprooms, artisanal breweries, and bars across Portugal.';
  } else {
    title = 'Hop-Map - Cerveja Artesanal & Taprooms em Portugal';
    description = 'Descobre os melhores taprooms, cervejarias artesanais e bares em Portugal.';
  }

  return {
    lang,
    title,
    description,
    canonical: canonicalUrl,
    ogTitle: title,
    ogDescription: description,
    ogImage: defaultImage,
    ogUrl: canonicalUrl,
    ogLocale: lang === 'EN' ? 'en_US' : 'pt_PT',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: defaultImage,
    alternatePt: ptCanonical,
    alternateEn: enCanonical,
    alternateDefault: ptCanonical
  };
}

/**
 * Injects meta tags into an HTML document template string
 */
export function injectMetaTags(html: string, meta: PageMeta): string {
  let output = html;

  // 0. Update html lang attribute
  const langAttr = meta.lang === 'EN' ? 'en' : 'pt';
  if (/<html[^>]*lang=["'][^"']*["']/i.test(output)) {
    output = output.replace(/<html([^>]*)lang=["'][^"']*["']/i, `<html$1lang="${langAttr}"`);
  } else if (/<html/i.test(output)) {
    output = output.replace(/<html/i, `<html lang="${langAttr}"`);
  }

  // 1. Replace <title>...</title>
  if (output.includes('<title>')) {
    output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  }

  // 2. Replace or inject <meta name="description" ...>
  if (/<meta\s+name=["']description["'][^>]*>/i.test(output)) {
    output = output.replace(
      /<meta\s+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${escapeHtml(meta.description)}" />`
    );
  }

  // 3. Replace or inject <link rel="canonical" ...>
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(output)) {
    output = output.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`
    );
  }

  // 4. Open Graph tags
  const ogTitle = meta.ogTitle || meta.title;
  const ogDesc = meta.ogDescription || meta.description;
  const ogUrl = meta.ogUrl || meta.canonical;
  const ogImg = meta.ogImage;
  const ogLocale = meta.ogLocale || (meta.lang === 'EN' ? 'en_US' : 'pt_PT');

  if (/<meta\s+property=["']og:title["'][^>]*>/i.test(output)) {
    output = output.replace(
      /<meta\s+property=["']og:title["'][^>]*>/i,
      `<meta property="og:title" content="${escapeHtml(ogTitle)}" />`
    );
  }

  if (/<meta\s+property=["']og:description["'][^>]*>/i.test(output)) {
    output = output.replace(
      /<meta\s+property=["']og:description["'][^>]*>/i,
      `<meta property="og:description" content="${escapeHtml(ogDesc)}" />`
    );
  }

  if (/<meta\s+property=["']og:url["'][^>]*>/i.test(output)) {
    output = output.replace(
      /<meta\s+property=["']og:url["'][^>]*>/i,
      `<meta property="og:url" content="${escapeHtml(ogUrl)}" />`
    );
  }

  if (/<meta\s+property=["']og:image["'][^>]*>/i.test(output)) {
    output = output.replace(
      /<meta\s+property=["']og:image["'][^>]*>/i,
      `<meta property="og:image" content="${escapeHtml(ogImg)}" />`
    );
  }

  // og:locale
  if (/<meta\s+property=["']og:locale["'][^>]*>/i.test(output)) {
    output = output.replace(
      /<meta\s+property=["']og:locale["'][^>]*>/i,
      `<meta property="og:locale" content="${escapeHtml(ogLocale)}" />`
    );
  } else if (/<meta\s+property=["']og:image["'][^>]*>/i.test(output)) {
    output = output.replace(
      /<meta\s+property=["']og:image["'][^>]*>/i,
      `<meta property="og:locale" content="${escapeHtml(ogLocale)}" />\n    <meta property="og:image" content="${escapeHtml(ogImg)}" />`
    );
  }

  // 5. Twitter card tags
  const twTitle = meta.twitterTitle || ogTitle;
  const twDesc = meta.twitterDescription || ogDesc;
  const twImg = meta.twitterImage || ogImg;

  if (/<meta\s+name=["']twitter:title["'][^>]*>/i.test(output)) {
    output = output.replace(
      /<meta\s+name=["']twitter:title["'][^>]*>/i,
      `<meta name="twitter:title" content="${escapeHtml(twTitle)}" />`
    );
  }

  if (/<meta\s+name=["']twitter:description["'][^>]*>/i.test(output)) {
    output = output.replace(
      /<meta\s+name=["']twitter:description["'][^>]*>/i,
      `<meta name="twitter:description" content="${escapeHtml(twDesc)}" />`
    );
  }

  if (/<meta\s+name=["']twitter:image["'][^>]*>/i.test(output)) {
    output = output.replace(
      /<meta\s+name=["']twitter:image["'][^>]*>/i,
      `<meta name="twitter:image" content="${escapeHtml(twImg)}" />`
    );
  }

  // 6. Alternate Hreflang Tags
  if (meta.alternatePt && meta.alternateEn) {
    const hreflangBlock = [
      `    <link rel="alternate" hreflang="pt" href="${escapeHtml(meta.alternatePt)}" />`,
      `    <link rel="alternate" hreflang="en" href="${escapeHtml(meta.alternateEn)}" />`,
      `    <link rel="alternate" hreflang="x-default" href="${escapeHtml(meta.alternateDefault || meta.alternatePt)}" />`
    ].join('\n');

    if (/<link\s+rel=["']alternate["'][^>]*>/i.test(output)) {
      // Remove existing alternates and replace
      output = output.replace(/(?:\s*<link\s+rel=["']alternate["'][^>]*\/>)+/gi, '\n' + hreflangBlock);
    } else if (/<link\s+rel=["']canonical["'][^>]*>/i.test(output)) {
      output = output.replace(
        /<link\s+rel=["']canonical["'][^>]*>/i,
        `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />\n${hreflangBlock}`
      );
    }
  }

  return output;
}
