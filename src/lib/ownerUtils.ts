/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Bar, OwnerClaimRecord, OwnerSpotMonthlyMetrics, Review } from '../types';
import { 
  getPreviousMonthKey, 
  getMonthLabel, 
  getDispatchDateLabel, 
  isMonthCompleted 
} from './dateUtils';
import { getLocalEvents } from './analytics';

const LOCAL_CLAIMS_KEY = 'hop_owner_claims_registry';

/**
 * Returns locally stored claims (for offline fallback & testing)
 */
function getLocalClaims(): Record<string, { status: 'pending' | 'approved' | 'rejected'; spotId: string; spotName: string; userEmail: string; username: string; requestedAt: string }> {
  try {
    const raw = localStorage.getItem(LOCAL_CLAIMS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalClaims(data: Record<string, any>) {
  try {
    localStorage.setItem(LOCAL_CLAIMS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save local claims:', e);
  }
}

/**
 * Filtro de Unicidade:
 * Retrieves a Set of spot IDs that already have an approved owner or a pending claim.
 * Any spot in this set MUST be omitted from the registration dropdown.
 */
export async function getClaimedSpotIds(): Promise<Set<string>> {
  const claimed = new Set<string>();

  // 1. Check local storage fallback
  const localClaims = getLocalClaims();
  Object.values(localClaims).forEach(c => {
    if ((c.status === 'approved' || c.status === 'pending') && c.spotId) {
      claimed.add(c.spotId);
    }
  });

  // 2. Query Firestore if connected
  if (isFirebaseConfigured) {
    try {
      const usersRef = collection(db, 'users');

      // Query 1: users with approved claim or ownedSpotId
      try {
        const qApproved = query(usersRef, where('ownerClaimApproved', '==', true));
        const snapApproved = await getDocs(qApproved);
        snapApproved.forEach(docSnap => {
          const d = docSnap.data();
          if (d.ownedSpotId) claimed.add(d.ownedSpotId);
          if (d.ownerClaimSpotId) claimed.add(d.ownerClaimSpotId);
        });
      } catch (errApproved) {
        console.warn('Notice querying approved claims:', errApproved);
      }

      // Query 2: users with pending claim
      try {
        const qPending = query(usersRef, where('ownerClaimPending', '==', true));
        const snapPending = await getDocs(qPending);
        snapPending.forEach(docSnap => {
          const d = docSnap.data();
          if (d.ownerClaimSpotId) claimed.add(d.ownerClaimSpotId);
        });
      } catch (errPending) {
        console.warn('Notice querying pending claims:', errPending);
      }
    } catch (err) {
      console.warn('Notice checking claimed spot IDs from Firestore:', err);
    }
  }

  return claimed;
}

/**
 * Submits a new owner claim for a spot during registration
 */
export async function submitOwnerClaim(
  userId: string,
  userEmail: string,
  username: string,
  spotId: string,
  spotName: string
): Promise<void> {
  // Update local claims cache
  const local = getLocalClaims();
  local[userId] = {
    status: 'pending',
    spotId,
    spotName,
    userEmail,
    username,
    requestedAt: new Date().toISOString()
  };
  saveLocalClaims(local);

  // Update Firestore user document
  if (isFirebaseConfigured) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        role: 'user',
        isOwner: false,
        ownedSpotId: null,
        ownerClaimPending: true,
        ownerClaimApproved: false,
        ownerClaimSpotId: spotId,
        ownerClaimSpotName: spotName,
        ownerClaimRequestedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Notice saving owner claim in Firestore:', e);
    }
  }
}

/**
 * Fetches all pending owner claims (Administrator cobeertaste@gmail.com only)
 */
export async function getPendingOwnerClaims(): Promise<OwnerClaimRecord[]> {
  const claimsMap = new Map<string, OwnerClaimRecord>();

  // 1. Gather local pending claims
  const local = getLocalClaims();
  Object.entries(local).forEach(([uid, val]) => {
    if (val.status === 'pending' && val.spotId) {
      claimsMap.set(uid, {
        userId: uid,
        userEmail: val.userEmail,
        username: val.username,
        spotId: val.spotId,
        spotName: val.spotName,
        requestedAt: val.requestedAt,
        status: 'pending'
      });
    }
  });

  // 2. Gather from Firestore
  if (isFirebaseConfigured) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('ownerClaimPending', '==', true));
      const snap = await getDocs(q);
      snap.forEach(docSnap => {
        const d = docSnap.data();
        if (d.ownerClaimSpotId) {
          claimsMap.set(docSnap.id, {
            userId: docSnap.id,
            userEmail: d.email || '',
            username: d.username || d.email || 'Utilizador',
            spotId: d.ownerClaimSpotId,
            spotName: d.ownerClaimSpotName || d.ownerClaimSpotId,
            requestedAt: d.ownerClaimRequestedAt || new Date().toISOString(),
            status: 'pending'
          });
        }
      });
    } catch (err) {
      console.warn('Notice getting pending claims from Firestore:', err);
    }
  }

  return Array.from(claimsMap.values()).sort((a, b) => 
    new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
}

/**
 * Admin Action: Approve Owner Claim
 * Concede a função de proprietário ('owner'), associa definitivamente o ID do local e marca ownerClaimApproved = true.
 */
export async function approveOwnerClaim(
  userId: string,
  spotId: string,
  spotName: string
): Promise<void> {
  const approvedAt = new Date().toISOString();

  // 1. Update local claims
  const local = getLocalClaims();
  if (local[userId]) {
    local[userId].status = 'approved';
    local[userId].spotId = spotId;
    local[userId].spotName = spotName;
  } else {
    local[userId] = {
      status: 'approved',
      spotId,
      spotName,
      userEmail: '',
      username: '',
      requestedAt: approvedAt
    };
  }
  saveLocalClaims(local);

  // 2. Update Firestore
  if (isFirebaseConfigured) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        role: 'owner',
        isOwner: true,
        ownedSpotId: spotId,
        ownerClaimApproved: true,
        ownerClaimPending: false,
        ownerClaimApprovedAt: approvedAt
      }, { merge: true });
    } catch (err) {
      console.error('Error approving owner claim in Firestore:', err);
      throw err;
    }
  }

  // Update localStorage user cache if current logged-in user is this user
  const cacheKeyPrefix = `hop_user_${userId}_`;
  localStorage.setItem(cacheKeyPrefix + 'role', 'owner');
  localStorage.setItem(cacheKeyPrefix + 'isOwner', 'true');
  localStorage.setItem(cacheKeyPrefix + 'ownedSpotId', spotId);
  localStorage.setItem(cacheKeyPrefix + 'ownerClaimApproved', 'true');
  localStorage.setItem(cacheKeyPrefix + 'ownerClaimPending', 'false');
}

/**
 * Admin Action: Reject Owner Claim
 * Remove o pedido pendente do utilizador, libertando o local para futuras seleções.
 */
export async function rejectOwnerClaim(userId: string): Promise<void> {
  // 1. Update local claims
  const local = getLocalClaims();
  if (local[userId]) {
    delete local[userId];
    saveLocalClaims(local);
  }

  // 2. Update Firestore
  if (isFirebaseConfigured) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        role: 'user',
        isOwner: false,
        ownedSpotId: null,
        ownerClaimPending: false,
        ownerClaimApproved: false,
        ownerClaimSpotId: null,
        ownerClaimSpotName: null,
        ownerClaimRejectedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error('Error rejecting owner claim in Firestore:', err);
      throw err;
    }
  }

  // Update localStorage user cache
  const cacheKeyPrefix = `hop_user_${userId}_`;
  localStorage.setItem(cacheKeyPrefix + 'ownerClaimPending', 'false');
  localStorage.setItem(cacheKeyPrefix + 'ownerClaimApproved', 'false');
  localStorage.removeItem(cacheKeyPrefix + 'ownerClaimSpotId');
}

/**
 * Utility Function: Resumo Estatístico Mensal
 * Compila as métricas de 1 a 30/31 do mês civil anterior (ou do mês especificado)
 * estritamente filtradas pelo spotId atribuído ao proprietário.
 */
export async function compileOwnerSpotMonthlyMetrics(
  spotId: string,
  spotName: string,
  monthKey?: string
): Promise<OwnerSpotMonthlyMetrics> {
  // If not specified, default to previous calendar month (1 to 30/31)
  const targetMonth = monthKey || getPreviousMonthKey();
  const label = getMonthLabel(targetMonth);
  const isCompleted = isMonthCompleted(targetMonth);
  const scheduledDispatch = getDispatchDateLabel(targetMonth);

  // Initialize accumulators
  let totalCheckins = 0;
  const uniqueVisitorSet = new Set<string>();
  const hourlyCount: Record<string, number> = {
    '12h - 15h (Almoço)': 0,
    '15h - 18h (Tarde)': 0,
    '18h - 21h (Afterwork)': 0,
    '21h - 00h (Noite)': 0,
    '00h - 04h (Madrugada)': 0,
    'Outros horários': 0
  };

  // 1. Fetch check-ins strictly for this spot
  if (isFirebaseConfigured) {
    try {
      const checkinsRef = collection(db, 'checkins');
      const q = query(checkinsRef, where('spotId', '==', spotId));
      const snap = await getDocs(q);
      snap.forEach(d => {
        const data = d.data();
        // Check date falls in the month: dateString format 'YYYY-MM-DD'
        const dateStr = data.dateString || (data.timestamp ? new Date(data.timestamp).toISOString().slice(0, 10) : '');
        if (dateStr.startsWith(targetMonth)) {
          totalCheckins++;
          if (data.userId) uniqueVisitorSet.add(data.userId);

          // Hourly distribution
          let hour = 19; // default evening
          if (data.timestamp) {
            hour = new Date(data.timestamp).getHours();
          }
          if (hour >= 12 && hour < 15) hourlyCount['12h - 15h (Almoço)']++;
          else if (hour >= 15 && hour < 18) hourlyCount['15h - 18h (Tarde)']++;
          else if (hour >= 18 && hour < 21) hourlyCount['18h - 21h (Afterwork)']++;
          else if (hour >= 21 && hour <= 23) hourlyCount['21h - 00h (Noite)']++;
          else if (hour >= 0 && hour < 4) hourlyCount['00h - 04h (Madrugada)']++;
          else hourlyCount['Outros horários']++;
        }
      });
    } catch (e) {
      console.warn('Notice compiling spot checkins:', e);
    }
  }

  // 2. Fetch ratings & reviews strictly for this spot
  const spotReviews: Array<{
    id: string;
    userName: string;
    rating: number;
    comment: string;
    beerStyleReviewed?: string;
    date: string;
  }> = [];
  let totalRatingSum = 0;

  if (isFirebaseConfigured) {
    try {
      const ratingsRef = collection(db, 'ratings');
      const q = query(ratingsRef, where('barId', '==', spotId));
      const snap = await getDocs(q);
      snap.forEach(d => {
        const data = d.data();
        const dateStr = data.createdAt ? new Date(data.createdAt).toISOString().slice(0, 10) : '';
        const stars = typeof data.stars === 'number' ? data.stars : 5;
        totalRatingSum += stars;
        spotReviews.push({
          id: d.id,
          userName: data.userName || 'Cervejeiro',
          rating: stars,
          comment: data.texto_rating || '',
          beerStyleReviewed: data.tipo_cerveja,
          date: dateStr
        });
      });
    } catch (e) {
      console.warn('Notice compiling spot ratings:', e);
    }
  }

  // 3. Analytics Events (shares, views, directions) strictly for this spot
  let totalShares = 0;
  let totalViews = 0;
  let totalDirections = 0;

  if (isFirebaseConfigured) {
    try {
      const eventsRef = collection(db, 'analytics_events');
      const q = query(
        eventsRef, 
        where('spotId', '==', spotId),
        where('month', '==', targetMonth)
      );
      const snap = await getDocs(q);
      snap.forEach(d => {
        const ev = d.data();
        if (ev.eventType === 'spot_social_share') totalShares++;
        else if (ev.eventType === 'spot_view') totalViews++;
        else if (ev.eventType === 'spot_directions_click') totalDirections++;
      });
    } catch (e) {
      console.warn('Notice reading spot analytics events:', e);
    }
  }

  // Also combine local events buffer
  const localEvents = getLocalEvents();
  localEvents.forEach(ev => {
    if (ev.spotId === spotId && ev.month === targetMonth) {
      if (ev.eventType === 'spot_social_share') totalShares++;
      else if (ev.eventType === 'spot_view') totalViews++;
      else if (ev.eventType === 'spot_directions_click') totalDirections++;
    }
  });

  // Calculate peak hour
  let maxHourCount = 0;
  let peakHourRange = '18h - 21h (Afterwork)';
  const hourlyBreakdown = Object.entries(hourlyCount).map(([hourRange, count]) => {
    if (count > maxHourCount) {
      maxHourCount = count;
      peakHourRange = hourRange;
    }
    const pct = totalCheckins > 0 ? Math.round((count / totalCheckins) * 100) : 0;
    return { hourRange, count, percentage: pct };
  });

  const ratingsCount = spotReviews.length;
  const avgRating = ratingsCount > 0 ? parseFloat((totalRatingSum / ratingsCount).toFixed(1)) : 4.8;
  const hopsAwarded = totalCheckins * 5; // 5 HOPS per verified check-in

  return {
    spotId,
    spotName,
    monthKey: targetMonth,
    monthLabel: label,
    isCompletedMonth: isCompleted,
    scheduledDispatchDate: scheduledDispatch,
    totalCheckins,
    uniqueVisitors: uniqueVisitorSet.size,
    hopsAwarded,
    totalShares,
    totalViews,
    totalDirections,
    ratingsCount,
    averageRating: avgRating,
    peakHourRange,
    hourlyBreakdown,
    reviews: spotReviews
  };
}
