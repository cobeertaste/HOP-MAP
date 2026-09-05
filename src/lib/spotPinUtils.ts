/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bar } from '../types';
import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';

// Curated 4-digit PINs for notable spots
const PRESET_SPOT_PINS: Record<string, string> = {
  'catraio': '4821',
  'catraio-craft-beer-shop-bar-porto': '4821',
  'cerveteca': '5501',
  'cerveteca-lisboa-lisboa': '5501',
  'dois-corvos-taproom-marvila-lisboa': '7723',
  'musa-da-fabrica-lisboa': '2024',
  'letraria-braga': '1984',
  'a-fabrica-da-picaria-brew-pub-porto': '3141',
  'cerveja-nortada-porto': '9902',
  'duque-brewpub-lisboa': '4112',
  'azores-brewing-company-acores': '6820',
  'beerstore-pt-acores': '8124'
};

const LOCAL_STORAGE_PINS_KEY = 'hop_spots_pins_v1';

/**
 * Generates a random 4-digit numeric PIN between 1000 and 9999
 */
export function generateRandom4DigitPin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Deterministic hash-based 4-digit PIN for any spot if not explicitly set
 */
export function getSpotCheckinPin(spot: Bar | { id: string; checkinPin?: string }): string {
  // 1. Check local storage cache for overridden/custom generated PINs
  try {
    const cachedPinsRaw = localStorage.getItem(LOCAL_STORAGE_PINS_KEY);
    if (cachedPinsRaw) {
      const cachedMap = JSON.parse(cachedPinsRaw);
      if (cachedMap[spot.id] && /^\d{4}$/.test(cachedMap[spot.id])) {
        return cachedMap[spot.id];
      }
    }
  } catch (e) {}

  if (spot.checkinPin && /^\d{4}$/.test(spot.checkinPin)) {
    return spot.checkinPin;
  }
  if (PRESET_SPOT_PINS[spot.id]) {
    return PRESET_SPOT_PINS[spot.id];
  }
  
  // Calculate deterministic 4-digit pin from spot.id
  let hash = 0;
  for (let i = 0; i < spot.id.length; i++) {
    hash = (hash << 5) - hash + spot.id.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const pinNum = 1000 + (positiveHash % 9000);
  return String(pinNum);
}

/**
 * Loads all PINs from Firestore (for Administrator cobeertaste@gmail.com)
 */
export async function fetchAllSpotPinsFromFirestore(): Promise<Record<string, string>> {
  const pinsMap: Record<string, string> = {};

  // Seed local cache first
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_PINS_KEY);
    if (local) {
      Object.assign(pinsMap, JSON.parse(local));
    }
  } catch (e) {}

  if (!isFirebaseConfigured) return pinsMap;

  try {
    const querySnapshot = await getDocs(collection(db, 'spots_pins'));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.checkinPin && /^\d{4}$/.test(String(data.checkinPin))) {
        pinsMap[docSnap.id] = String(data.checkinPin);
      }
    });

    // Save to local cache
    try {
      localStorage.setItem(LOCAL_STORAGE_PINS_KEY, JSON.stringify(pinsMap));
    } catch (e) {}
  } catch (err) {
    console.warn('Could not fetch spots_pins collection from Firestore (Admin permission required):', err);
  }

  return pinsMap;
}

/**
 * Saves a single Spot PIN to Firestore and updates local cache
 */
export async function saveSpotPinToFirestore(
  spotId: string,
  spotName: string,
  zone: string,
  checkinPin: string
): Promise<boolean> {
  // Update local cache immediately
  try {
    const current = localStorage.getItem(LOCAL_STORAGE_PINS_KEY);
    const map = current ? JSON.parse(current) : {};
    map[spotId] = checkinPin;
    localStorage.setItem(LOCAL_STORAGE_PINS_KEY, JSON.stringify(map));
  } catch (e) {}

  if (!isFirebaseConfigured) return true;

  try {
    await setDoc(doc(db, 'spots_pins', spotId), {
      spotId,
      spotName,
      zone,
      checkinPin,
      updatedAt: new Date().toISOString(),
      serverUpdated: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error writing spot PIN to Firestore:', err);
    return false;
  }
}

/**
 * Initializes and seeds missing PINs for all spots in the database
 */
export async function syncAndSeedAllSpotPins(allSpots: Bar[]): Promise<Record<string, string>> {
  const existingPins = await fetchAllSpotPinsFromFirestore();
  const updatedPins: Record<string, string> = { ...existingPins };
  const toSaveList: Array<{ spotId: string; spotName: string; zone: string; pin: string }> = [];

  allSpots.forEach(spot => {
    if (!updatedPins[spot.id]) {
      const defaultPin = getSpotCheckinPin(spot);
      updatedPins[spot.id] = defaultPin;
      toSaveList.push({
        spotId: spot.id,
        spotName: spot.name,
        zone: spot.zone,
        pin: defaultPin
      });
    }
  });

  // Save missing in batches
  if (toSaveList.length > 0 && isFirebaseConfigured) {
    for (const item of toSaveList) {
      try {
        await setDoc(doc(db, 'spots_pins', item.spotId), {
          spotId: item.spotId,
          spotName: item.spotName,
          zone: item.zone,
          checkinPin: item.pin,
          updatedAt: new Date().toISOString(),
          serverUpdated: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn(`Could not seed pin for ${item.spotName}:`, err);
      }
    }
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_PINS_KEY, JSON.stringify(updatedPins));
  } catch (e) {}

  return updatedPins;
}

/**
 * Formats email content and mailto link for sending the complete list of PINs to cobeertaste@gmail.com
 */
export function formatSpotPinsEmail(
  spots: Bar[],
  pinsMap: Record<string, string>,
  lang: 'PT' | 'EN' = 'PT'
): { subject: string; body: string; mailtoUrl: string; plainTextReport: string } {
  const isPt = lang === 'PT';
  const now = new Date();
  const dateStr = now.toLocaleDateString(isPt ? 'pt-PT' : 'en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const subject = isPt 
    ? 'HOP-MAP: Lista Completa de PINs dos Spots' 
    : 'HOP-MAP: Complete Spot PINs List';

  // Group spots by Zone
  const groupedByZone: Record<string, Array<{ spot: Bar; pin: string }>> = {};
  spots.forEach(spot => {
    const zone = spot.zone || (isPt ? 'Outros' : 'Other');
    if (!groupedByZone[zone]) groupedByZone[zone] = [];
    const pin = pinsMap[spot.id] || getSpotCheckinPin(spot);
    groupedByZone[zone].push({ spot, pin });
  });

  // Build formatted text report
  let report = `=================================================\n`;
  report += isPt 
    ? `  🍻 HOP-MAP: LISTA MESTRE DE PINS DE CHECK-IN 🍻\n` 
    : `  🍻 HOP-MAP: MASTER SPOT CHECK-IN PINS LIST 🍻\n`;
  report += `=================================================\n\n`;
  report += isPt 
    ? `Data de Exportação: ${dateStr}\n` 
    : `Export Date: ${dateStr}\n`;
  report += isPt 
    ? `Destinatário Master: cobeertaste@gmail.com\n` 
    : `Master Recipient: cobeertaste@gmail.com\n`;
  report += isPt 
    ? `Total de Spots Listados: ${spots.length}\n\n` 
    : `Total Spots Listed: ${spots.length}\n\n`;
  report += `-------------------------------------------------\n`;
  report += isPt 
    ? `INSTRUÇÕES DE SEGURANÇA:\n- Fornecer este PIN de 4 dígitos exclusivamente ao staff/barman de cada spot.\n- O barman introduz o PIN no telemóvel do cliente após confirmação de consumo real.\n- Para alterar qualquer PIN, utiliza o Painel de Administração Master na app.\n`
    : `SECURITY INSTRUCTIONS:\n- Provide this 4-digit PIN exclusively to the staff/bartender at each spot.\n- Bartenders enter the PIN on the patron's device upon verified consumption.\n- To change any PIN, use the Master Admin Dashboard in the app.\n`;
  report += `-------------------------------------------------\n\n`;

  const sortedZones = Object.keys(groupedByZone).sort();
  for (const zone of sortedZones) {
    report += `📍 [${zone.toUpperCase()}]\n`;
    groupedByZone[zone].forEach(item => {
      report += `  • ${item.spot.name.padEnd(35, ' ')} -> PIN: [ ${item.pin} ]\n`;
    });
    report += `\n`;
  }

  report += `=================================================\n`;
  report += `HOP-MAP © ${now.getFullYear()} • www.cobeertaste.com\n`;
  report += `=================================================\n`;

  // Encode for mailto URL
  const mailtoUrl = `mailto:cobeertaste@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(report)}`;

  return {
    subject,
    body: report,
    mailtoUrl,
    plainTextReport: report
  };
}

/**
 * Synthesizes classic 8-bit retro arcade "STAGE CLEAR!" fanfare sound
 */
export function playStageClearSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const now = audioCtx.currentTime;

    // 8-bit Stage Clear Fanfare notes (C5, E5, G5, C6, E6, G6, C7 triumph hold)
    const melody = [
      { freq: 523.25, time: 0.00, dur: 0.10 }, // C5
      { freq: 659.25, time: 0.10, dur: 0.10 }, // E5
      { freq: 783.99, time: 0.20, dur: 0.10 }, // G5
      { freq: 1046.50, time: 0.30, dur: 0.12 }, // C6
      { freq: 1318.51, time: 0.42, dur: 0.12 }, // E6
      { freq: 1567.98, time: 0.54, dur: 0.14 }, // G6
      { freq: 2093.00, time: 0.68, dur: 0.45 }, // C7 (High triumph)
    ];

    melody.forEach((note) => {
      // Primary Square Wave (Classic NES / GameBoy pulse)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.12, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);

      // Sub Triangle Wave for depth
      const subOsc = audioCtx.createOscillator();
      const subGain = audioCtx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(note.freq / 2, now + note.time);

      subGain.gain.setValueAtTime(0.08, now + note.time);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

      subOsc.connect(subGain);
      subGain.connect(audioCtx.destination);
      subOsc.start(now + note.time);
      subOsc.stop(now + note.time + note.dur);
    });
  } catch (err) {
    console.warn('Web Audio STAGE CLEAR sound synthesis error:', err);
  }
}

/**
 * Synthesizes retro 8-bit keypad button blip
 */
export function playPinKeypadSound(digit?: string | number) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const now = audioCtx.currentTime;

    const baseFreq = typeof digit === 'number' ? 440 + digit * 40 : 600;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.05);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } catch (err) {}
}

/**
 * Synthesizes retro 8-bit error buzz on wrong PIN
 */
export function playPinErrorSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.setValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  } catch (err) {}
}
