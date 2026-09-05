/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hop-Map Dynamic SPA Router & Slug Engine
 * Supports clean URLs:
 *  - /                                -> General map & explore with all spots
 *  - /{cidade}                        -> Filter and center map on specific city/zone (e.g. /porto, /lisboa)
 *  - /{cidade}/{slug-do-spot}         -> Focus on spot, center map, and open spot detail drawer
 */

import { Bar } from '../types';

/**
 * Normalizes any text into a URL-safe lowercase slug without accents or special characters
 * e.g. "Catraio - Craft Beer Shop (Porto)" -> "catraio-craft-beer-shop"
 */
export function createSlug(name: string): string {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics / accents
    .replace(/\s*\([^)]*\)/g, '') // remove parenthesized city/region suffix e.g. (Porto), (Lisboa)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, ''); // strip leading and trailing hyphens
}

/**
 * Generates clean slug for a city / region zone
 * e.g. "Porto" -> "porto", "Açores" -> "acores", "V.N. Gaia" -> "vn-gaia"
 */
export function getCitySlug(zone: string): string {
  if (!zone || zone.toLowerCase() === 'all' || zone.toLowerCase() === 'todos') {
    return '';
  }
  return zone
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Returns canonical slug for a given spot
 */
export function getSpotSlug(bar: Bar): string {
  if (!bar) return '';
  // If bar already has an id that is simple, or generate from clean name
  const nameSlug = createSlug(bar.name);
  if (nameSlug) return nameSlug;
  return createSlug(bar.id);
}

/**
 * Known city coordinates for fast and reliable camera centering
 */
export const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  porto: { latitude: 41.1500, longitude: -8.6200 },
  lisboa: { latitude: 38.7223, longitude: -9.1393 },
  acores: { latitude: 37.7412, longitude: -25.6756 },
  azores: { latitude: 37.7412, longitude: -25.6756 },
  madeira: { latitude: 32.6500, longitude: -16.9086 },
  norte: { latitude: 41.5503, longitude: -8.4200 },
  centro: { latitude: 40.2033, longitude: -8.4103 },
  sul: { latitude: 37.0194, longitude: -7.9304 },
  coimbra: { latitude: 40.2033, longitude: -8.4103 },
  aveiro: { latitude: 40.6405, longitude: -8.6538 },
  braga: { latitude: 41.5454, longitude: -8.4265 },
  faro: { latitude: 37.0194, longitude: -7.9304 },
  evora: { latitude: 38.5714, longitude: -7.9070 },
  setubal: { latitude: 38.5244, longitude: -8.8882 },
  cascais: { latitude: 38.6970, longitude: -9.4223 },
  sintra: { latitude: 38.8029, longitude: -9.3817 },
  guimaraes: { latitude: 41.4425, longitude: -8.2918 },
  matosinhos: { latitude: 41.1800, longitude: -8.6900 },
  ericeira: { latitude: 38.9634, longitude: -9.4168 },
  viana: { latitude: 41.6932, longitude: -8.8329 },
  braganca: { latitude: 41.8058, longitude: -6.7572 }
};

/**
 * Finds matching zone name from a city slug
 */
export function getZoneFromCitySlug(citySlug: string, availableZones: string[]): string | null {
  if (!citySlug) return null;
  const cleanCity = citySlug.toLowerCase().trim();

  // 1. Direct match with available active zones
  for (const zone of availableZones) {
    if (getCitySlug(zone) === cleanCity) {
      return zone;
    }
  }

  // 2. Common regional aliases
  if (cleanCity === 'acores' || cleanCity === 'azores' || cleanCity === 'açores') {
    const match = availableZones.find(z => z.toLowerCase().includes('açor') || z.toLowerCase().includes('acor'));
    if (match) return match;
    return 'Açores';
  }
  if (cleanCity === 'lisbon') {
    return 'Lisboa';
  }
  if (cleanCity === 'oporto') {
    return 'Porto';
  }

  // 3. Fallback partial matching
  const partialMatch = availableZones.find(z => 
    z.toLowerCase().includes(cleanCity) || cleanCity.includes(getCitySlug(z))
  );
  if (partialMatch) return partialMatch;

  return null;
}

/**
 * Finds matching Bar from a spot slug or id within a city/region or globally
 */
export function findBarBySlug(spotSlug: string, bars: Bar[], targetZone?: string | null): Bar | null {
  if (!spotSlug) return null;
  const cleanSlug = createSlug(spotSlug);

  // 1. First search in target zone if provided
  const candidateBars = targetZone && targetZone !== 'All' 
    ? bars.filter(b => b.zone?.toLowerCase() === targetZone.toLowerCase() || getCitySlug(b.zone) === getCitySlug(targetZone))
    : bars;

  // Exact ID match
  let match = candidateBars.find(b => b.id.toLowerCase() === spotSlug.toLowerCase());
  if (match) return match;

  // Exact generated name slug match
  match = candidateBars.find(b => getSpotSlug(b) === cleanSlug);
  if (match) return match;

  // Partial slug match (e.g. 'catraio' matches 'catraio-craft-beer-shop')
  match = candidateBars.find(b => {
    const bSlug = getSpotSlug(b);
    const bId = b.id.toLowerCase();
    return bSlug.includes(cleanSlug) || cleanSlug.includes(bSlug) || bId.includes(cleanSlug) || cleanSlug.includes(bId);
  });
  if (match) return match;

  // Global search fallback if not found in targetZone
  if (targetZone && targetZone !== 'All') {
    return findBarBySlug(spotSlug, bars);
  }

  return null;
}

/**
 * Parses the current window.location.pathname and query into structured route information
 */
export function parseRoute(pathname: string, bars: Bar[], availableZones: string[] = []): {
  lang: 'PT' | 'EN';
  citySlug: string | null;
  zone: string | null;
  spotSlug: string | null;
  bar: Bar | null;
} {
  // Normalize path segments (ignoring query strings and hash)
  let cleanPath = (pathname || (typeof window !== 'undefined' ? window.location.pathname : '/'))
    .split('?')[0]
    .split('#')[0]
    .trim();

  // Check query string for ?lang=en or ?lang=pt if in browser
  let detectedLang: 'PT' | 'EN' = 'PT';
  if (typeof window !== 'undefined' && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const qLang = params.get('lang')?.toUpperCase();
    if (qLang === 'EN' || qLang === 'PT') {
      detectedLang = qLang;
    }
  }

  let segments = cleanPath.split('/').filter(Boolean);

  // Check leading language segment: /en/... or /pt/...
  if (segments.length > 0) {
    const firstSegLower = segments[0].toLowerCase();
    if (firstSegLower === 'en') {
      detectedLang = 'EN';
      segments = segments.slice(1);
    } else if (firstSegLower === 'pt') {
      detectedLang = 'PT';
      segments = segments.slice(1);
    }
  }

  if (segments.length === 0) {
    return { lang: detectedLang, citySlug: null, zone: null, spotSlug: null, bar: null };
  }

  // Handle known non-city top-level routes if any
  const firstSeg = segments[0].toLowerCase();
  
  if (segments.length === 1) {
    // Check if single segment is a city / zone
    const matchedZone = getZoneFromCitySlug(firstSeg, availableZones);
    if (matchedZone) {
      return { lang: detectedLang, citySlug: firstSeg, zone: matchedZone, spotSlug: null, bar: null };
    }

    // Check if single segment is directly a spot slug
    const directBar = findBarBySlug(firstSeg, bars);
    if (directBar) {
      const citySlug = getCitySlug(directBar.zone);
      return { lang: detectedLang, citySlug, zone: directBar.zone, spotSlug: firstSeg, bar: directBar };
    }

    // Return as city candidate
    return { lang: detectedLang, citySlug: firstSeg, zone: null, spotSlug: null, bar: null };
  }

  // 2+ segments: /{city}/{spot-slug}
  const citySeg = segments[0].toLowerCase();
  const spotSeg = segments[1];
  const matchedZone = getZoneFromCitySlug(citySeg, availableZones);
  const foundBar = findBarBySlug(spotSeg, bars, matchedZone);

  return {
    lang: detectedLang,
    citySlug: citySeg,
    zone: matchedZone || (foundBar ? foundBar.zone : null),
    spotSlug: spotSeg,
    bar: foundBar
  };
}

/**
 * Generates full canonical shareable URL for a spot in PT or EN
 * e.g. "https://hop-map.ai.studio/porto/o-bandido" or "https://hop-map.ai.studio/en/porto/o-bandido"
 */
export function getSpotShareUrl(bar: Bar, customDomain?: string, lang: 'PT' | 'EN' = 'PT'): string {
  const domain = customDomain || (typeof window !== 'undefined' ? window.location.origin : 'https://hop-map.ai.studio');
  const city = getCitySlug(bar.zone) || 'portugal';
  const spotSlug = getSpotSlug(bar);
  const prefix = lang === 'EN' ? '/en' : '';
  return `${domain}${prefix}/${city}/${spotSlug}`;
}

/**
 * Generates URL for a city/region filter in PT or EN
 * e.g. "https://hop-map.ai.studio/porto" or "https://hop-map.ai.studio/en/porto"
 */
export function getCityShareUrl(zone: string, customDomain?: string, lang: 'PT' | 'EN' = 'PT'): string {
  const domain = customDomain || (typeof window !== 'undefined' ? window.location.origin : 'https://hop-map.ai.studio');
  const city = getCitySlug(zone);
  const prefix = lang === 'EN' ? '/en' : '';
  if (!city) return `${domain}${prefix || '/'}`;
  return `${domain}${prefix}/${city}`;
}

/**
 * Safely updates browser URL via pushState without triggering full page reload
 */
export function updateBrowserUrl(citySlug?: string | null, spotSlug?: string | null, replace: boolean = false, lang: 'PT' | 'EN' = 'PT') {
  if (typeof window === 'undefined' || !window.history) return;

  const prefix = lang === 'EN' ? '/en' : '';
  let newPath = prefix || '/';
  if (citySlug && spotSlug) {
    newPath = `${prefix}/${citySlug}/${spotSlug}`;
  } else if (citySlug) {
    newPath = `${prefix}/${citySlug}`;
  }

  const currentPath = window.location.pathname;
  if (currentPath === newPath) return;

  try {
    if (replace) {
      window.history.replaceState({ citySlug, spotSlug, lang }, '', newPath);
    } else {
      window.history.pushState({ citySlug, spotSlug, lang }, '', newPath);
    }
  } catch (e) {
    console.warn('Router pushState error:', e);
  }
}

/**
 * Updates dynamic Open Graph meta tags and document title for SEO and rich link previews
 */
export function updateDynamicMetaTags(bar: Bar | null, zone: string | null, lang: 'PT' | 'EN' = 'PT') {
  if (typeof document === 'undefined') return;

  if (bar) {
    const cleanName = bar.name.replace(/\s*\([^)]*\)\s*$/, '').trim();
    const title = lang === 'EN'
      ? `${cleanName} - ${bar.zone} | Hop Map - Craft Beer Guide`
      : `${cleanName} - ${bar.zone} | Hop Map`;
    
    let desc = lang === 'EN'
      ? (bar.descriptionEN || bar.description || `Discover the craft beer spot ${cleanName} in ${bar.zone} on Hop Map.`)
      : (bar.descriptionPT || bar.description || `Descobre o spot de cerveja artesanal ${cleanName} em ${bar.zone} no Hop Map.`);
    if (!desc.endsWith('.')) desc += '.';

    const shareUrl = getSpotShareUrl(bar, undefined, lang);

    document.title = title;
    document.documentElement.lang = lang === 'EN' ? 'en' : 'pt';
    setMetaTag('description', desc);
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:description', desc, 'property');
    setMetaTag('og:url', shareUrl, 'property');
    setMetaTag('og:locale', lang === 'EN' ? 'en_US' : 'pt_PT', 'property');
    if (bar.coverPhoto) {
      setMetaTag('og:image', bar.coverPhoto, 'property');
      setMetaTag('twitter:image', bar.coverPhoto, 'name');
    }
    setMetaTag('twitter:title', title, 'name');
    setMetaTag('twitter:description', desc, 'name');
  } else if (zone && zone !== 'All') {
    const title = lang === 'EN'
      ? `Craft Beer Spots & Taprooms in ${zone} | Hop Map`
      : `Spots de Cerveja Artesanal em ${zone} | Hop Map`;
    const desc = lang === 'EN'
      ? `Discover the best craft beer bars, brewpubs and taprooms in ${zone} on Hop Map.`
      : `Descobre os melhores taprooms, cervejarias artesanais e bares de cerveja em ${zone} no Hop Map.`;

    document.title = title;
    document.documentElement.lang = lang === 'EN' ? 'en' : 'pt';
    setMetaTag('description', desc);
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:description', desc, 'property');
    setMetaTag('og:locale', lang === 'EN' ? 'en_US' : 'pt_PT', 'property');
  } else {
    const defaultTitle = lang === 'EN'
      ? 'HOP MAP - Craft Beer & Taprooms in Portugal'
      : 'Hop-Map - Cerveja Artesanal & Taprooms em Portugal';
    const defaultDesc = lang === 'EN'
      ? 'Discover the best craft beer taprooms, artisanal breweries, and bars across Portugal.'
      : 'Descobre os melhores taprooms, cervejarias artesanais e bares em Portugal.';

    document.title = defaultTitle;
    document.documentElement.lang = lang === 'EN' ? 'en' : 'pt';
    setMetaTag('description', defaultDesc);
    setMetaTag('og:title', defaultTitle, 'property');
    setMetaTag('og:description', defaultDesc, 'property');
    setMetaTag('og:locale', lang === 'EN' ? 'en_US' : 'pt_PT', 'property');
  }
}

function setMetaTag(attrValue: string, content: string, attrName: 'name' | 'property' = 'name') {
  try {
    let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  } catch (e) {
    // Safely ignore in restricted environments
  }
}
