/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from './i18n';
import { db, isFirebaseConfigured } from './firebase';
import { doc, setDoc, getDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export const CRAFT_BEER_STYLES = [
  'American Pale Ale (APA)',
  'Indian Pale Ale (IPA)',
  'New England / Hazy IPA',
  'Session IPA',
  'Pilsner',
  'Weissbier',
  'Tripel',
  'Dubbel',
  'Amber Ale / Red Ale',
  'Stout (Dry Stout / Oatmeal Stout)',
  'Porter',
  'Imperial Stout',
  'Sour',
  'Grape Ale',
  'Saison',
  'Brown Ale',
  'Lager',
  'Outra'
] as const;

export type CraftBeerStyle = typeof CRAFT_BEER_STYLES[number] | string;

/**
 * Returns localized label for beer styles (especially 'Outra' / 'Other')
 */
export function getLocalizedBeerStyle(style: string, lang: Language = 'PT'): string {
  if (!style) return '';
  if (style === 'Outra' || style === 'Other') {
    return lang === 'PT' ? 'Outra' : 'Other';
  }
  return style;
}

const LOCAL_STORAGE_SPOT_STYLES_PREFIX = 'hop_spot_consumed_styles_';
const LOCAL_STORAGE_MONTHLY_SPOT_STYLES_PREFIX = 'hop_monthly_spot_styles_'; // key: month_spotId

/**
 * Reads aggregated consumed beer styles for a specific spot (all-time / cached)
 */
export function getSpotConsumedBeerStyles(spotId: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_SPOT_STYLES_PREFIX}${spotId}`);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Reads aggregated consumed beer styles for a specific spot and specific month
 */
export function getSpotMonthlyConsumedBeerStyles(spotId: string, monthKey: string): Record<string, number> {
  try {
    const monthlyKey = `${LOCAL_STORAGE_MONTHLY_SPOT_STYLES_PREFIX}${monthKey}_${spotId}`;
    const raw = localStorage.getItem(monthlyKey);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading monthly spot styles:', e);
  }
  // Fallback to overall spot styles if specific month not split
  return getSpotConsumedBeerStyles(spotId);
}

/**
 * Reads aggregated consumed beer styles across all spots
 */
export function getAllConsumedBeerStyles(): Record<string, number> {
  const totals: Record<string, number> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LOCAL_STORAGE_SPOT_STYLES_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const spotStyles: Record<string, number> = JSON.parse(raw);
          Object.entries(spotStyles).forEach(([style, count]) => {
            totals[style] = (totals[style] || 0) + (Number(count) || 0);
          });
        }
      }
    }
  } catch (e) {
    console.warn('Error reading aggregated styles:', e);
  }
  return totals;
}

/**
 * Asynchronously fetches spot consumed styles for a specific month (from Firestore if available, otherwise local cache)
 */
export async function fetchSpotConsumedBeerStylesForMonth(
  spotId: string,
  monthKey: string
): Promise<Record<string, number>> {
  const localData = getSpotMonthlyConsumedBeerStyles(spotId, monthKey);
  const result: Record<string, number> = { ...localData };

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'spot_beer_consumptions'),
        where('spotId', '==', spotId),
        where('month', '==', monthKey)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const firestoreMap: Record<string, number> = {};
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const style = data.beerStyle;
          if (style) {
            firestoreMap[style] = (firestoreMap[style] || 0) + 1;
          }
        });

        // Merge with priority on Firestore counts
        Object.entries(firestoreMap).forEach(([st, cnt]) => {
          result[st] = Math.max(result[st] || 0, cnt);
        });
      }
    } catch (err) {
      console.warn(`[Hop-Map] Error fetching Firestore beer styles for spot ${spotId}:`, err);
    }
  }

  return result;
}

/**
 * Fast single-query batch loader for consumed beer styles across all spots for a specific month.
 * Reduces 100+ individual round-trips into 1 single optimized read.
 */
export async function fetchAllConsumedBeerStylesForMonth(
  monthKey: string
): Promise<Record<string, Record<string, number>>> {
  const aggregated: Record<string, Record<string, number>> = {};

  // 1. Preload from local storage fast
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${LOCAL_STORAGE_MONTHLY_SPOT_STYLES_PREFIX}${monthKey}_`)) {
        const spotId = key.replace(`${LOCAL_STORAGE_MONTHLY_SPOT_STYLES_PREFIX}${monthKey}_`, '');
        const raw = localStorage.getItem(key);
        if (raw && spotId) {
          aggregated[spotId] = JSON.parse(raw);
        }
      }
    }
  } catch (e) {
    console.warn('Notice reading local monthly styles:', e);
  }

  // 2. Fetch all month's consumptions in ONE single query from Firestore
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'spot_beer_consumptions'),
        where('month', '==', monthKey)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const spotId = data.spotId;
          const style = data.beerStyle;
          if (spotId && style) {
            if (!aggregated[spotId]) {
              aggregated[spotId] = {};
            }
            aggregated[spotId][style] = (aggregated[spotId][style] || 0) + 1;
          }
        });
      }
    } catch (err) {
      console.warn('[Hop-Map] Notice batch fetching Firestore beer styles:', err);
    }
  }

  return aggregated;
}

/**
 * Records a consumed beer style at a spot in local storage buffer and Firestore
 */
export async function recordSpotBeerStyleConsumption(
  spotId: string,
  spotName: string,
  beerStyle: string,
  user: { id: string; username: string },
  checkinId?: string
): Promise<Record<string, number>> {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 1. Update all-time spot styles
  const currentStyles = getSpotConsumedBeerStyles(spotId);
  currentStyles[beerStyle] = (currentStyles[beerStyle] || 0) + 1;

  // 2. Update month-specific spot styles
  const monthlyKey = `${LOCAL_STORAGE_MONTHLY_SPOT_STYLES_PREFIX}${monthKey}_${spotId}`;
  let monthlyStyles: Record<string, number> = {};
  try {
    const rawMonthly = localStorage.getItem(monthlyKey);
    monthlyStyles = rawMonthly ? JSON.parse(rawMonthly) : {};
  } catch (e) {
    monthlyStyles = {};
  }
  monthlyStyles[beerStyle] = (monthlyStyles[beerStyle] || 0) + 1;

  // Save locally
  try {
    localStorage.setItem(
      `${LOCAL_STORAGE_SPOT_STYLES_PREFIX}${spotId}`,
      JSON.stringify(currentStyles)
    );
    localStorage.setItem(
      monthlyKey,
      JSON.stringify(monthlyStyles)
    );
  } catch (e) {
    console.warn('Could not save spot beer styles locally:', e);
  }

  // 3. Persist to Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      // Save single consumption event
      await addDoc(collection(db, 'spot_beer_consumptions'), {
        spotId,
        spotName,
        beerStyle,
        userId: user.id || 'anonymous',
        username: user.username || 'Visitante Hop-Map',
        checkinId: checkinId || null,
        month: monthKey,
        timestamp: now.toISOString()
      });

      // Update spot summary aggregate document in Firestore
      await setDoc(
        doc(db, 'spot_beer_styles', spotId),
        {
          spotId,
          spotName,
          styles: currentStyles,
          lastUpdated: now.toISOString()
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[Hop-Map Beer Styles] Firestore write note:', err);
    }
  }

  return currentStyles;
}
