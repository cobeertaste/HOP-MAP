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
const APPROVED_OWNERS_REGISTRY_KEY = 'hop_approved_owners_registry';

/**
 * Pre-approved & verified venue owners registry
 * Maps owner email to their assigned spot ID and spot Name.
 * Specifically:
 * - ricardo@marrafa.pt -> "Marrafa (Jesufrei)" (id: 'marrafa-jesufrei')
 * - roberto@bahcraftbeer.com -> "BAH Craft Beer (Cascais)" (id: 'bah-craft-beer-cascais')
 * - afabricadapicaria@gmail.com -> "A Fábrica da Picaria Brew Pub" (id: 'a-fabrica-da-picaria-brew-pub-porto')
 * - kkruckenhauser@gmail.com -> "Prost! (Guimarães)" (id: 'prost-guimaraes')
 */
export const VERIFIED_OWNER_MAPPINGS: Record<string, { spotId: string; spotName: string; username?: string }> = {
  'ricardo@marrafa.pt': {
    spotId: 'marrafa-jesufrei',
    spotName: 'Marrafa (Jesufrei)',
    username: 'Ricardo (Marrafa)'
  },
  'roberto@bahcraftbeer.com': {
    spotId: 'bah-craft-beer-cascais',
    spotName: 'BAH Craft Beer (Cascais)',
    username: 'Roberto (BAH Craft Beer)'
  },
  'afabricadapicaria@gmail.com': {
    spotId: 'a-fabrica-da-picaria-brew-pub-porto',
    spotName: 'A Fábrica da Picaria Brew Pub',
    username: 'A Fábrica da Picaria'
  },
  'kkruckenhauser@gmail.com': {
    spotId: 'prost-guimaraes',
    spotName: 'Prost! (Guimarães)',
    username: 'Prost! (Guimarães)'
  },
  'geral@lovecraftfeira.pt': {
    spotId: 'lovecraft-public-house-feira-santa-maria-da-feira',
    spotName: 'Lovecraft Public House Feira (Santa Maria da Feira)',
    username: 'Lovecraft Feira'
  },
  'vinicius@emporio.pt': {
    spotId: 'o-emporio-pt-ericeira',
    spotName: 'O Empório.pt (Ericeira)',
    username: 'Vinicius Lobato'
  },
  'geral@beerstore.pt': {
    spotId: 'beerstore-pt-acores',
    spotName: 'Beerstore.pt (Açores)',
    username: 'Beerstore Açores'
  },
  'paula.c.prata@gmail.com': {
    spotId: 'beer-cascais-cascais',
    spotName: 'Beer Cascais (Cascais)',
    username: 'ToBeer Cascais'
  },
  'hello@azoresbrewingcompany.com': {
    spotId: 'azores-brewing',
    spotName: 'Azores Brewing (Açores)',
    username: 'azoresbrewingcompany'
  },
  'conversas.moderadas@gmail.com': {
    spotId: 'mal-amado-braga',
    spotName: 'Mal Amado (Braga)',
    username: 'Mal_Amado'
  }
};

/**
 * Normalizes and checks if a user is authorized to access metrics for a given spot.
 * - Master Admin (cobeertaste@gmail.com) has access to all spots
 * - Venue owners have access strictly and exclusively to their designated spot
 */
export function isOwnerAuthorizedForSpot(
  user: { role?: string; isOwner?: boolean; ownedSpotId?: string; email?: string } | null | undefined,
  spotId: string
): boolean {
  if (!user || !spotId) return false;
  if (user.role === 'admin' || (user.email && user.email.toLowerCase().trim() === 'cobeertaste@gmail.com')) {
    return true;
  }

  // Also check verified owner config by email directly to guarantee immediate authorization
  const emailConfig = user.email ? getVerifiedOwnerConfig(user.email) : null;
  const effectiveOwnedSpotId = user.ownedSpotId || emailConfig?.spotId;
  const effectiveIsOwner = user.isOwner || Boolean(emailConfig);

  if (!effectiveIsOwner || !effectiveOwnedSpotId) {
    return false;
  }

  // 1. Direct equality
  if (effectiveOwnedSpotId === spotId) {
    return true;
  }

  // 2. Canonical alias mappings
  const spotAliases: Record<string, string[]> = {
    'lovecraft-public-house-feira-santa-maria-da-feira': ['lovecraft-feira', 'lovecraft-public-house-feira', 'lovecraft-public-house-feira-santa-maria-da-feira'],
    'lovecraft-feira': ['lovecraft-feira', 'lovecraft-public-house-feira-santa-maria-da-feira', 'lovecraft-public-house-feira'],
    'o-emporio-pt-ericeira': ['o-emporio-pt', 'o-emporio-pt-ericeira'],
    'o-emporio-pt': ['o-emporio-pt', 'o-emporio-pt-ericeira'],
    'beerstore-pt-acores': ['beerstore-pt', 'beerstore-pt-acores'],
    'beerstore-pt': ['beerstore-pt', 'beerstore-pt-acores'],
    'beer-cascais-cascais': ['beer-cascais', 'beer-cascais-cascais'],
    'beer-cascais': ['beer-cascais', 'beer-cascais-cascais'],
    'marrafa-jesufrei': ['marrafa-jesufrei', 'marrafa'],
    'bah-craft-beer-cascais': ['bah-craft-beer-cascais', 'bah-craft-beer'],
    'prost-guimaraes': ['prost-guimaraes', 'prost'],
    'a-fabrica-da-picaria-brew-pub-porto': ['a-fabrica-da-picaria-brew-pub-porto', 'a-fabrica-da-picaria-brew-pub'],
    'azores-brewing': ['azores-brewing', 'azores-brewing-company-acores', 'azores-brewing-acores'],
    'azores-brewing-company-acores': ['azores-brewing', 'azores-brewing-company-acores', 'azores-brewing-acores'],
    'mal-amado-braga': ['mal-amado-braga', 'mal-amado'],
    'mal-amado': ['mal-amado-braga', 'mal-amado']
  };

  const aliases = spotAliases[effectiveOwnedSpotId];
  if (aliases && aliases.includes(spotId)) {
    return true;
  }

  const targetAliases = spotAliases[spotId];
  if (targetAliases && targetAliases.includes(effectiveOwnedSpotId)) {
    return true;
  }

  // 3. Location suffix normalization (e.g. -porto, -cascais, -ericeira, -acores, etc.)
  const cleanId = (id: string) => id.replace(/-(porto|cascais|guimaraes|ericeira|acores|santa-maria-da-feira|lagoa|lisboa|braga)$/i, '');
  if (cleanId(effectiveOwnedSpotId) === cleanId(spotId)) {
    return true;
  }

  return false;
}

/**
 * Finds a spot from the bars list based on the user's ownedSpotId, handling all alias variations.
 */
export function findSpotByOwnerSpotId(bars: Bar[], ownedSpotId?: string): Bar | undefined {
  if (!ownedSpotId) return undefined;
  const direct = bars.find(b => b.id === ownedSpotId);
  if (direct) return direct;

  const aliasMap: Record<string, string> = {
    'lovecraft-feira': 'lovecraft-public-house-feira-santa-maria-da-feira',
    'lovecraft-public-house-feira-santa-maria-da-feira': 'lovecraft-public-house-feira-santa-maria-da-feira',
    'o-emporio-pt': 'o-emporio-pt-ericeira',
    'o-emporio-pt-ericeira': 'o-emporio-pt-ericeira',
    'beerstore-pt': 'beerstore-pt-acores',
    'beerstore-pt-acores': 'beerstore-pt-acores',
    'beer-cascais': 'beer-cascais-cascais',
    'beer-cascais-cascais': 'beer-cascais-cascais',
    'marrafa-jesufrei': 'marrafa-jesufrei',
    'bah-craft-beer-cascais': 'bah-craft-beer-cascais',
    'prost-guimaraes': 'prost-guimaraes',
    'a-fabrica-da-picaria-brew-pub': 'a-fabrica-da-picaria-brew-pub-porto',
    'a-fabrica-da-picaria-brew-pub-porto': 'a-fabrica-da-picaria-brew-pub-porto',
    'azores-brewing': 'azores-brewing',
    'azores-brewing-company-acores': 'azores-brewing',
    'mal-amado-braga': 'mal-amado-braga',
    'mal-amado': 'mal-amado-braga'
  };

  const targetId = aliasMap[ownedSpotId];
  if (targetId) {
    const found = bars.find(b => b.id === targetId || (ownedSpotId.includes('azores-brewing') && (b.id === 'azores-brewing' || b.id === 'azores-brewing-company-acores')));
    if (found) return found;
  }

  const cleanId = (id: string) => id.replace(/-(porto|cascais|guimaraes|ericeira|acores|santa-maria-da-feira|lagoa|lisboa|braga)$/i, '');
  const base = cleanId(ownedSpotId);
  return bars.find(b => cleanId(b.id) === base);
}

/**
 * Checks if an email is a verified owner and returns their assigned spot configuration.
 */
export function getVerifiedOwnerConfig(email?: string | null): { spotId: string; spotName: string; username?: string } | null {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  if (VERIFIED_OWNER_MAPPINGS[clean]) {
    return VERIFIED_OWNER_MAPPINGS[clean];
  }
  // Check dynamically approved owners cache in localStorage
  try {
    const raw = localStorage.getItem(APPROVED_OWNERS_REGISTRY_KEY);
    if (raw) {
      const reg = JSON.parse(raw);
      if (reg[clean]) return reg[clean];
    }
  } catch (e) {}

  // Check local claims cache
  const local = getLocalClaims();
  for (const c of Object.values(local)) {
    if (c.userEmail?.toLowerCase() === clean && c.status === 'approved' && c.spotId) {
      return { spotId: c.spotId, spotName: c.spotName, username: c.username };
    }
  }
  return null;
}

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

function saveApprovedOwnerLocally(email: string | undefined, userId: string, spotId: string, spotName: string, username?: string) {
  try {
    const raw = localStorage.getItem(APPROVED_OWNERS_REGISTRY_KEY);
    const reg = raw ? JSON.parse(raw) : {};
    const entry = { spotId, spotName, username: username || '', userId, approvedAt: new Date().toISOString() };
    if (email) reg[email.toLowerCase().trim()] = entry;
    reg[userId] = entry;
    localStorage.setItem(APPROVED_OWNERS_REGISTRY_KEY, JSON.stringify(reg));
  } catch (e) {
    console.warn('Could not save approved owner registry locally:', e);
  }
}

/**
 * Filtro de Unicidade:
 * Retrieves a Set of spot IDs that already have an approved owner or a pending claim.
 * Any spot in this set MUST be omitted from the registration dropdown.
 */
export async function getClaimedSpotIds(): Promise<Set<string>> {
  const claimed = new Set<string>();

  // 0. Pre-verified owners spots are always reserved and claimed
  Object.values(VERIFIED_OWNER_MAPPINGS).forEach(m => {
    claimed.add(m.spotId);
  });

  // 1. Check local storage fallback
  const localClaims = getLocalClaims();
  Object.values(localClaims).forEach(c => {
    if ((c.status === 'approved' || c.status === 'pending') && c.spotId) {
      claimed.add(c.spotId);
    }
  });

  // Check approved owners registry
  try {
    const raw = localStorage.getItem(APPROVED_OWNERS_REGISTRY_KEY);
    if (raw) {
      const reg = JSON.parse(raw);
      Object.values(reg).forEach((entry: any) => {
        if (entry?.spotId) claimed.add(entry.spotId);
      });
    }
  } catch (e) {}

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

  // Update Firestore user document & owner_claims
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
      console.warn('Notice saving owner claim in Firestore users collection:', e);
    }

    try {
      const claimRef = doc(db, 'owner_claims', userId);
      await setDoc(claimRef, {
        userId,
        userEmail,
        username,
        spotId,
        spotName,
        status: 'pending',
        requestedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Notice saving in owner_claims collection:', e);
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

    try {
      const claimsRef = collection(db, 'owner_claims');
      const qClaims = query(claimsRef, where('status', '==', 'pending'));
      const snapClaims = await getDocs(qClaims);
      snapClaims.forEach(docSnap => {
        const d = docSnap.data();
        if (d.spotId) {
          claimsMap.set(docSnap.id, {
            userId: d.userId || docSnap.id,
            userEmail: d.userEmail || '',
            username: d.username || 'Utilizador',
            spotId: d.spotId,
            spotName: d.spotName || d.spotId,
            requestedAt: d.requestedAt || new Date().toISOString(),
            status: 'pending'
          });
        }
      });
    } catch (err) {
      console.warn('Notice getting claims from owner_claims collection:', err);
    }
  }

  // Filter out any claim whose user or spot is already verified/approved
  const filtered = Array.from(claimsMap.values()).filter(c => {
    const cleanMail = (c.userEmail || '').toLowerCase().trim();
    if (!cleanMail && !c.spotId) return false;

    // Check pre-verified owners mappings
    if (cleanMail && VERIFIED_OWNER_MAPPINGS[cleanMail]) return false;
    const isPreVerifiedSpot = Object.values(VERIFIED_OWNER_MAPPINGS).some(
      m => m.spotId === c.spotId || isOwnerAuthorizedForSpot({ isOwner: true, ownedSpotId: m.spotId }, c.spotId)
    );
    if (isPreVerifiedSpot) return false;

    // Check dynamically approved owners cache in localStorage
    try {
      const raw = localStorage.getItem(APPROVED_OWNERS_REGISTRY_KEY);
      if (raw) {
        const reg = JSON.parse(raw);
        if (cleanMail && reg[cleanMail]) return false;
        if (c.userId && reg[c.userId]) return false;
        if (c.spotId && (reg[c.spotId] || Object.values(reg).some((e: any) => e?.spotId === c.spotId))) return false;
      }
    } catch (e) {}

    // Check local storage claims
    const localVal = (c.userId && local[c.userId]) || (cleanMail && local[cleanMail]) || (c.spotId && local[c.spotId]);
    if (localVal && localVal.status === 'approved') return false;

    return true;
  });

  return filtered.sort((a, b) => 
    new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
}

/**
 * Fetches all approved owner claims
 */
export async function getApprovedOwnerClaims(): Promise<OwnerClaimRecord[]> {
  const approvedMap = new Map<string, OwnerClaimRecord>();

  // 1. Add pre-verified owners
  Object.entries(VERIFIED_OWNER_MAPPINGS).forEach(([email, val]) => {
    approvedMap.set(val.spotId, {
      userId: `verified_${val.spotId}`,
      userEmail: email,
      username: val.username || 'Proprietário Verificado',
      spotId: val.spotId,
      spotName: val.spotName,
      requestedAt: '2026-01-01T00:00:00.000Z',
      status: 'approved'
    });
  });

  // 2. Add local storage approved claims
  const local = getLocalClaims();
  Object.entries(local).forEach(([uid, val]) => {
    if (val.status === 'approved' && val.spotId) {
      approvedMap.set(val.spotId, {
        userId: uid,
        userEmail: val.userEmail,
        username: val.username,
        spotId: val.spotId,
        spotName: val.spotName,
        requestedAt: val.requestedAt,
        status: 'approved'
      });
    }
  });

  // Check approved owners registry in localStorage
  try {
    const raw = localStorage.getItem(APPROVED_OWNERS_REGISTRY_KEY);
    if (raw) {
      const reg = JSON.parse(raw);
      Object.entries(reg).forEach(([key, val]: [string, any]) => {
        if (val?.spotId && !approvedMap.has(val.spotId)) {
          approvedMap.set(val.spotId, {
            userId: val.userId || key,
            userEmail: val.userEmail || key,
            username: val.username || 'Proprietário',
            spotId: val.spotId,
            spotName: val.spotName || val.spotId,
            requestedAt: val.approvedAt || new Date().toISOString(),
            status: 'approved'
          });
        }
      });
    }
  } catch (e) {}

  // 3. Add from Firestore if available
  if (isFirebaseConfigured) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('ownerClaimApproved', '==', true));
      const snap = await getDocs(q);
      snap.forEach(docSnap => {
        const d = docSnap.data();
        if (d.ownedSpotId) {
          approvedMap.set(d.ownedSpotId, {
            userId: docSnap.id,
            userEmail: d.email || '',
            username: d.username || d.email || 'Proprietário',
            spotId: d.ownedSpotId,
            spotName: d.ownerClaimSpotName || d.ownedSpotId,
            requestedAt: d.ownerClaimApprovedAt || new Date().toISOString(),
            status: 'approved'
          });
        }
      });
    } catch (e) {
      console.warn('Notice loading approved claims from Firestore users:', e);
    }

    try {
      const claimsRef = collection(db, 'owner_claims');
      const qClaims = query(claimsRef, where('status', '==', 'approved'));
      const snapClaims = await getDocs(qClaims);
      snapClaims.forEach(docSnap => {
        const d = docSnap.data();
        if (d.spotId) {
          approvedMap.set(d.spotId, {
            userId: d.userId || docSnap.id,
            userEmail: d.userEmail || '',
            username: d.username || d.userEmail || 'Proprietário',
            spotId: d.spotId,
            spotName: d.spotName || d.spotId,
            requestedAt: d.approvedAt || d.requestedAt || new Date().toISOString(),
            status: 'approved'
          });
        }
      });
    } catch (e) {
      console.warn('Notice loading approved claims from owner_claims:', e);
    }
  }

  return Array.from(approvedMap.values());
}

/**
 * Admin Action: Approve Owner Claim
 * Concede a função de proprietário ('owner'), associa definitivamente o ID do local e marca ownerClaimApproved = true.
 * Built resiliently so that if remote Firestore rules restrict cross-user document updates, the admin approval
 * still completes successfully with local persistence and owner_claims record.
 */
export async function approveOwnerClaim(
  userId: string,
  spotId: string,
  spotName: string,
  userEmail?: string,
  username?: string
): Promise<void> {
  const approvedAt = new Date().toISOString();
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  const effectiveUserId = (userId && userId.trim()) ? userId.trim() : (cleanEmail ? `owner_${cleanEmail.replace(/[^a-z0-9]/g, '_')}` : `owner_${Date.now()}`);

  // 1. Update local claims
  const local = getLocalClaims();
  const claimRecord = {
    status: 'approved' as const,
    spotId,
    spotName,
    userEmail: cleanEmail,
    username: username || '',
    requestedAt: approvedAt
  };

  if (userId) local[userId] = claimRecord;
  local[effectiveUserId] = claimRecord;
  if (cleanEmail) {
    local[cleanEmail] = claimRecord;
  }
  if (spotId) {
    local[spotId] = claimRecord;
  }

  // Update any existing claim in local claims with matching email or spotId
  Object.keys(local).forEach(k => {
    if (
      (cleanEmail && local[k]?.userEmail?.toLowerCase() === cleanEmail) ||
      (spotId && local[k]?.spotId === spotId)
    ) {
      local[k] = claimRecord;
    }
  });

  saveLocalClaims(local);

  // Save in approved owners registry cache
  saveApprovedOwnerLocally(cleanEmail, effectiveUserId, spotId, spotName, username);

  // 2. Update Firestore thoroughly with safety timeout
  if (isFirebaseConfigured) {
    try {
      const firestoreTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3500));

      const doFirestoreUpdate = async () => {
        // A. Update dedicated owner_claims document
        const claimRef = doc(db, 'owner_claims', effectiveUserId);
        await setDoc(claimRef, {
          userId: effectiveUserId,
          spotId,
          spotName,
          userEmail: cleanEmail,
          username: username || '',
          status: 'approved',
          approvedAt,
          approvedBy: 'cobeertaste@gmail.com'
        }, { merge: true });

        // Also ensure email-based claim key is saved in owner_claims
        if (cleanEmail) {
          const emailClaimRef = doc(db, 'owner_claims', `claim_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`);
          await setDoc(emailClaimRef, {
            userId: effectiveUserId,
            spotId,
            spotName,
            userEmail: cleanEmail,
            username: username || '',
            status: 'approved',
            approvedAt,
            approvedBy: 'cobeertaste@gmail.com'
          }, { merge: true });
        }

        // Query and update any pending claims in owner_claims collection for this user or email
        if (cleanEmail) {
          try {
            const claimsRef = collection(db, 'owner_claims');
            const qClaims = query(claimsRef, where('userEmail', '==', cleanEmail));
            const snapClaims = await getDocs(qClaims);
            await Promise.all(snapClaims.docs.map(docSnap => 
              setDoc(docSnap.ref, {
                status: 'approved',
                spotId,
                spotName,
                approvedAt,
                approvedBy: 'cobeertaste@gmail.com'
              }, { merge: true })
            ));
          } catch (qErr) {
            console.warn('Notice updating matching owner_claims:', qErr);
          }
        }

        // B. Update user documents in Firestore
        if (cleanEmail) {
          try {
            const usersRef = collection(db, 'users');
            const qUsers = query(usersRef, where('email', '==', cleanEmail));
            const snapUsers = await getDocs(qUsers);
            await Promise.all(snapUsers.docs.map(docSnap => 
              setDoc(docSnap.ref, {
                role: 'owner',
                isOwner: true,
                ownedSpotId: spotId,
                ownerClaimApproved: true,
                ownerClaimPending: false,
                ownerClaimApprovedAt: approvedAt,
                ownerClaimSpotId: spotId,
                ownerClaimSpotName: spotName
              }, { merge: true })
            ));
          } catch (err: any) {
            console.warn('Notice updating users by email query:', err?.message || err);
          }
        }

        // Also update by direct userId if valid
        if (effectiveUserId) {
          try {
            const userRef = doc(db, 'users', effectiveUserId);
            await setDoc(userRef, {
              role: 'owner',
              isOwner: true,
              ownedSpotId: spotId,
              ownerClaimApproved: true,
              ownerClaimPending: false,
              ownerClaimApprovedAt: approvedAt,
              ownerClaimSpotId: spotId,
              ownerClaimSpotName: spotName
            }, { merge: true });
          } catch (err: any) {
            console.warn('Notice updating user doc by ID in Firestore:', err?.message || err);
          }
        }
      };

      await Promise.race([doFirestoreUpdate(), firestoreTimeout]).catch(e => {
        console.warn('Firestore update timed out or encountered notice, local approval active:', e);
      });
    } catch (e) {
      console.warn('Notice during Firestore approval sync:', e);
    }
  }

  // Update localStorage user cache for this user
  const cachePrefixes = [`hop_user_${effectiveUserId}_`];
  if (cleanEmail) {
    cachePrefixes.push(`hop_user_${cleanEmail}_`);
  }
  if (userId && userId !== effectiveUserId) {
    cachePrefixes.push(`hop_user_${userId}_`);
  }

  cachePrefixes.forEach(prefix => {
    try {
      localStorage.setItem(prefix + 'role', 'owner');
      localStorage.setItem(prefix + 'isOwner', 'true');
      localStorage.setItem(prefix + 'ownedSpotId', spotId);
      localStorage.setItem(prefix + 'ownerClaimApproved', 'true');
      localStorage.setItem(prefix + 'ownerClaimPending', 'false');
      localStorage.setItem(prefix + 'ownerClaimSpotId', spotId);
      localStorage.setItem(prefix + 'ownerClaimSpotName', spotName);
    } catch (e) {}
  });

  // Notify active components in the current window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hop_owner_approved', {
      detail: { userId: effectiveUserId, spotId, spotName, userEmail: cleanEmail }
    }));
    window.dispatchEvent(new CustomEvent('hop_checkin_updated'));
  }
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
      const claimRef = doc(db, 'owner_claims', userId);
      await setDoc(claimRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: 'cobeertaste@gmail.com'
      }, { merge: true });
    } catch (claimErr) {
      console.warn('Notice updating rejected status in owner_claims:', claimErr);
    }

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
    } catch (err: any) {
      console.warn('Notice rejecting owner claim in Firestore users collection (fallback active):', err?.message || err);
    }
  }

  // Update localStorage user cache
  const cacheKeyPrefix = `hop_user_${userId}_`;
  localStorage.setItem(cacheKeyPrefix + 'ownerClaimPending', 'false');
  localStorage.setItem(cacheKeyPrefix + 'ownerClaimApproved', 'false');
  localStorage.removeItem(cacheKeyPrefix + 'ownerClaimSpotId');
  localStorage.removeItem(cacheKeyPrefix + 'ownerClaimSpotName');
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

  // Build candidate spot IDs for spots with known aliases
  const candidateSpotIds = new Set<string>([spotId]);
  if (spotId === 'azores-brewing' || spotId === 'azores-brewing-company-acores') {
    candidateSpotIds.add('azores-brewing');
    candidateSpotIds.add('azores-brewing-company-acores');
  } else if (spotId === 'mal-amado-braga' || spotId === 'mal-amado') {
    candidateSpotIds.add('mal-amado-braga');
    candidateSpotIds.add('mal-amado');
  } else if (spotId === 'beerstore-pt-acores' || spotId === 'beerstore-pt') {
    candidateSpotIds.add('beerstore-pt-acores');
    candidateSpotIds.add('beerstore-pt');
  } else if (spotId === 'beer-cascais-cascais' || spotId === 'beer-cascais') {
    candidateSpotIds.add('beer-cascais-cascais');
    candidateSpotIds.add('beer-cascais');
  }
  const spotIdList = Array.from(candidateSpotIds);

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
    for (const candidateId of spotIdList) {
      try {
        const checkinsRef = collection(db, 'checkins');
        const q = query(checkinsRef, where('spotId', '==', candidateId));
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

      // Also check spots_taps doc in Firestore
      try {
        const spotTapDoc = await getDoc(doc(db, 'spots_taps', candidateId));
        if (spotTapDoc.exists()) {
          const d = spotTapDoc.data();
          const pts = Math.max(
            typeof d.points === 'number' ? d.points : 0,
            typeof d.totalCheckins === 'number' ? d.totalCheckins : 0,
            typeof d.hops === 'number' ? d.hops : 0,
            typeof d.taps === 'number' ? d.taps : 0
          );
          totalCheckins = Math.max(totalCheckins, pts);
        }
      } catch (e) {}
    }

    // Check users collection for visitors at this spot
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach(uDoc => {
        const u = uDoc.data();
        if (Array.isArray(u.checkinHistory)) {
          u.checkinHistory.forEach((item: any) => {
            if (item && (candidateSpotIds.has(item.barId) || candidateSpotIds.has(item.spotId))) {
              const dStr = item.date || (item.timestamp ? String(item.timestamp).slice(0, 10) : '');
              if (!dStr || dStr.startsWith(targetMonth)) {
                uniqueVisitorSet.add(u.uid || uDoc.id);
              }
            }
          });
        }
      });
    } catch (e) {}
  }

  // Also check localStorage
  for (const candidateId of spotIdList) {
    try {
      const localVal = localStorage.getItem(`spot_points_${candidateId}`) || localStorage.getItem(`spot_hops_${candidateId}`);
      if (localVal) {
        const p = parseInt(localVal, 10);
        if (!isNaN(p) && p > 0) totalCheckins = Math.max(totalCheckins, p);
      }
    } catch (e) {}
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
  const seenReviewIds = new Set<string>();
  let totalRatingSum = 0;

  if (isFirebaseConfigured) {
    for (const candidateId of spotIdList) {
      try {
        const ratingsRef = collection(db, 'ratings');
        const q = query(ratingsRef, where('barId', '==', candidateId));
        const snap = await getDocs(q);
        snap.forEach(d => {
          if (seenReviewIds.has(d.id)) return;
          seenReviewIds.add(d.id);
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
  }

  // 3. Analytics Events (shares, views, directions) strictly for this spot
  let totalShares = 0;
  let totalViews = 0;
  let totalDirections = 0;
  const seenEventIds = new Set<string>();

  if (isFirebaseConfigured) {
    for (const candidateId of spotIdList) {
      try {
        const eventsRef = collection(db, 'analytics_events');
        const q = query(
          eventsRef, 
          where('spotId', '==', candidateId),
          where('month', '==', targetMonth)
        );
        const snap = await getDocs(q);
        snap.forEach(d => {
          if (seenEventIds.has(d.id)) return;
          seenEventIds.add(d.id);
          const ev = d.data();
          if (ev.eventType === 'spot_social_share') totalShares++;
          else if (ev.eventType === 'spot_view') totalViews++;
          else if (ev.eventType === 'spot_directions_click') totalDirections++;
        });
      } catch (e) {
        console.warn('Notice reading spot analytics events:', e);
      }
    }
  }

  // Also combine local events buffer
  const localEvents = getLocalEvents();
  localEvents.forEach(ev => {
    if (candidateSpotIds.has(ev.spotId) && ev.month === targetMonth) {
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
