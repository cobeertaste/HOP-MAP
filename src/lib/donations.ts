/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { DonationRecord } from '../types';
import { getCurrentMonthKey } from './dateUtils';

/**
 * Public Stripe Publishable Key & Revolut links
 */
const DEFAULT_STRIPE_PUB_KEY = 'pk_live_51KQ7gMJHFMFxDOD5TofPQPmVX6kWjnHhTbUkznJ1MYbeCrdTypzWdHIfcIaDrDd1LPZS2DP6LPC1K2fG0HHFD9iH001Q5VZLb1';

function resolveStripePublishableKey(): string {
  const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (typeof envKey === 'string' && envKey.trim().startsWith('pk_')) {
    return envKey.trim();
  }
  return DEFAULT_STRIPE_PUB_KEY;
}

export const STRIPE_PUBLISHABLE_KEY = resolveStripePublishableKey();

export const REVOLUT_PAY_LINK = 
  import.meta.env.VITE_REVOLUT_PAY_LINK || 
  'https://revolut.me/josric6b2v';

export const MBWAY_RECEIVER_PHONE = '+351 916259719';

const LOCAL_STORAGE_DONATIONS_KEY = 'hop_donations_records_v1';

/**
 * Get all cached local donations
 */
export function getLocalDonations(): DonationRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DONATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save donation to local storage
 */
export function saveDonationLocally(donation: DonationRecord) {
  try {
    const list = getLocalDonations();
    // Prevent duplicate IDs
    const filtered = list.filter(d => d.id !== donation.id);
    filtered.unshift(donation);
    if (filtered.length > 500) {
      filtered.length = 500;
    }
    localStorage.setItem(LOCAL_STORAGE_DONATIONS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Could not cache donation locally:', e);
  }
}

/**
 * Record a new donation (Local + Firestore if configured + API sync)
 */
export async function recordDonation(data: {
  donorName: string;
  donorEmail?: string;
  userId?: string;
  amount: number;
  paymentMethod: 'mbway' | 'apple_google_pay' | 'revolut' | 'stripe_card';
  status?: 'completed' | 'pending';
  referenceOrPhone?: string;
  notes?: string;
}): Promise<DonationRecord> {
  const now = new Date();
  const month = getCurrentMonthKey(now);
  const donationId = `don_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const donation: DonationRecord = {
    id: donationId,
    donorName: data.donorName?.trim() || 'Apoiante Hop-Map',
    donorEmail: data.donorEmail || '',
    userId: data.userId || 'anonymous',
    amount: Math.round(Number(data.amount) * 100) / 100,
    currency: 'EUR',
    paymentMethod: data.paymentMethod,
    timestamp: now.toISOString(),
    month,
    status: data.status || 'completed',
    referenceOrPhone: data.referenceOrPhone,
    notes: data.notes
  };

  // 1. Save locally for instant reactivity in Monthly Reports
  saveDonationLocally(donation);

  // 2. Persist to Firestore if available
  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'donations'), {
        ...donation,
        serverTimestamp: now.toISOString()
      });
    } catch (err) {
      console.warn('[Hop-Map Donations] Firestore note:', err);
    }
  }

  // 3. Inform server API if reachable
  try {
    fetch('/api/record-donation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donation)
    }).catch(() => {
      // Non-blocking
    });
  } catch {
    // Non-blocking
  }

  return donation;
}

/**
 * Fetch all donations for a specific month
 */
export async function getDonationsForMonth(monthKey: string): Promise<DonationRecord[]> {
  const localList = getLocalDonations().filter(d => d.month === monthKey);

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'donations'),
        where('month', '==', monthKey),
        limit(500)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as DonationRecord;
        if (!localList.some(d => d.id === docSnap.id || (d.timestamp === data.timestamp && d.donorName === data.donorName && d.amount === data.amount))) {
          localList.push({ ...data, id: docSnap.id });
        }
      });
    } catch (err) {
      console.warn('[Hop-Map Donations] Query notice:', err);
    }
  }

  return localList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
