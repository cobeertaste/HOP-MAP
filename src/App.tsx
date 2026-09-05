/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Beer, Star, MapPin, Award, Heart, Scroll, Calendar, User, Users,
  Search, Bell, Shield, Fingerprint, CreditCard, Sparkles, 
  Navigation, CheckCircle, ArrowRight, Instagram, Facebook, Youtube,
  X, Compass, Filter, Share2, Flame, RefreshCcw, Smile, Check, Zap, CheckSquare, Square,
  Camera, LogOut, Trophy, ChevronDown, ChevronUp, Plus, Lock, Globe, Languages, History, FileText, Edit3, MessageSquare,
  Clock, Trash2, ArrowDownAZ, List, LayoutGrid, Boxes, Key
} from 'lucide-react';

import { t, Language, getBarDescription, getBarWorkingHours, getEventDescription, getEventDate, getBarBeerNews } from './lib/i18n';
import { getBarOpenStatus } from './lib/openingHours';
import { SpotFeatureBadges } from './components/SpotFeatureBadges';
import { HopCrawlRoute } from './components/HopCrawlRoute';
import { HopCommunityChatModal } from './components/HopCommunityChatModal';
import { SpotVibeCheck, CompactSpotVibeBadge } from './components/SpotVibeCheck';
import { MentionNotificationToast, MentionNotificationPayload } from './components/MentionNotificationToast';
import { SpecialEventsBanner } from './components/SpecialEventsBanner';
import { getActiveSpecialEvent } from './utils/specialEvents';

import { BARS_DATA, EVENTS_DATA, getReviewsForBar } from './data';
import { getBarGoogleMapsUrl } from './maps_utils';
import { Bar, BeerEvent, UserProfile, BarZone, HopNotification, Review } from './types';
import AppleDeviceFrame from './components/AppleDeviceFrame';
import BiometricsConfirm from './components/BiometricsConfirm';
import ApplePaySheet from './components/ApplePaySheet';
import MapInteractive from './components/MapInteractive';
import { PixelIcon, PixelPacman, PixelLogo, HopMapLogo } from './components/PixelIcons';
import PixelCheckinAnimation from './components/PixelCheckinAnimation';
import RetroSpotShareModal from './components/RetroSpotShareModal';
import MonthlyReportModal from './components/MonthlyReportModal';
import AdminPinsDashboardModal from './components/AdminPinsDashboardModal';
import BeerStyleSelectModal from './components/BeerStyleSelectModal';
import RetroPinModal from './components/RetroPinModal';
import RetroStageClearCelebration from './components/RetroStageClearCelebration';
import DonationModal from './components/DonationModal';
import { UserSearchComponent } from './components/UserSearchComponent';
import { ReviewEditModal } from './components/ReviewEditModal';
import { BadgesModal } from './components/BadgesModal';
import { BadgeUnlockedToast } from './components/BadgeUnlockedToast';
import { ALL_BADGES, calculateUserBadges, getUserRankingStyling, BadgeUnlockStatus } from './lib/badges';
import { Badge } from './types';
import { recordDonation } from './lib/donations';
import { recordSpotBeerStyleConsumption, getSpotConsumedBeerStyles } from './lib/craftBeerStyles';
import { getSpotCheckinPin, playStageClearSound } from './lib/spotPinUtils';
import { 
  trackSpotCheckin, 
  trackSpotReward, 
  trackSpotView, 
  trackSpotShare, 
  trackSpotDirections, 
  isAdminUser,
  OFFICIAL_REPORT_EMAIL,
  checkAndAutoDispatchMonthlyReport
} from './lib/analytics';

import { 
  createSlug, 
  getCitySlug, 
  getSpotSlug, 
  parseRoute, 
  getSpotShareUrl, 
  getCityShareUrl, 
  updateBrowserUrl, 
  updateDynamicMetaTags, 
  getZoneFromCitySlug 
} from './lib/router';

import { auth, db, isFirebaseConfigured } from './lib/firebase';

export const APP_VERSION = 'v1.3.1';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, deleteDoc, collection, addDoc, getDocs, getDoc, query, orderBy, where, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Deterministic particle templates for visual check-in burst animation
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

const CITY_COORDINATES: Record<string, { latitude: number; longitude: number; zone: string }> = {
  'Porto': { latitude: 41.1524, longitude: -8.6186, zone: 'Porto' },
  'Lisboa': { latitude: 38.7144, longitude: -9.1512, zone: 'Lisboa' },
  'Braga': { latitude: 41.5499154, longitude: -8.4303589, zone: 'Norte' },
  'Coimbra': { latitude: 40.231595, longitude: -18.0345764, zone: 'Centro' },
  'Aveiro': { latitude: 40.6432682, longitude: -9.2602503, zone: 'Centro' },
  'Viana do Castelo': { latitude: 41.6945518, longitude: -9.4409041, zone: 'Norte' },
  'Caminha': { latitude: 38.7677295, longitude: -18.8529999, zone: 'Norte' },
  'Ericeira': { latitude: 38.7677295, longitude: -18.8529999, zone: 'Centro' },
  'Castelo de Vide': { latitude: 40.1151208, longitude: -13.7255423, zone: 'Centro' },
  'Vila Verde': { latitude: 41.6499821, longitude: -9.0485132, zone: 'Norte' },
  'Alvaiázere': { latitude: 39.8247, longitude: -8.3804, zone: 'Centro' },
  'Furadouro': { latitude: 40.8715, longitude: -8.6738, zone: 'Centro' },
  'Caldas da Rainha': { latitude: 39.4075503, longitude: -9.1383124, zone: 'Centro' },
  'Linhó': { latitude: 38.7658, longitude: -9.3812, zone: 'Lisboa' },
  'Borba de Montanha': { latitude: 41.3858, longitude: -7.9812, zone: 'Norte' },
  'Arco de Baúlhe': { latitude: 41.4858, longitude: -7.9812, zone: 'Norte' },
  'Évora': { latitude: 38.7677295, longitude: -18.8529999, zone: 'Sul' },
  'Constância': { latitude: 39.4758, longitude: -8.3312, zone: 'Centro' },
  'V.N.Gaia': { latitude: 41.1119466, longitude: -8.6051778, zone: 'Porto' },
  'Maia': { latitude: 41.2333, longitude: -8.6167, zone: 'Porto' },
  'Guimarães': { latitude: 35.5239262, longitude: -29.4270742, zone: 'Norte' },
  'Santa Maria da Feira': { latitude: 40.9257534, longitude: -9.151358, zone: 'Norte' },
  'Famalicão': { latitude: 41.4074, longitude: -8.5192, zone: 'Norte' },
  'Silves': { latitude: 37.1895, longitude: -8.4410, zone: 'Sul' },
  'Póvoa do Lanhoso': { latitude: 41.5772, longitude: -8.2721, zone: 'Norte' },
  'Amadora': { latitude: 38.7596, longitude: -9.2244, zone: 'Lisboa' },
  'Açores': { latitude: 37.7392, longitude: -25.6698, zone: 'Açores' },
  'Madeira': { latitude: 32.6508, longitude: -16.9114, zone: 'Madeira' },
  'Óbidos': { latitude: 40.1151208, longitude: -13.7255423, zone: 'Centro' },
  'Colares': { latitude: 38.9939066, longitude: -9.8505184, zone: 'Lisboa' },
  'Sintra': { latitude: 38.830703, longitude: -9.5634142, zone: 'Lisboa' },
  'Cascais': { latitude: 38.6984785, longitude: -19.1767006, zone: 'Lisboa' },
  'Bragança': { latitude: 38.6984785, longitude: -19.1767006, zone: 'Norte' },
  'Matosinhos': { latitude: 41.1809308, longitude: -9.302481, zone: 'Norte' },
  'Setúbal': { latitude: 38.7677295, longitude: -18.8529999, zone: 'Sul' },
  'Lagos': { latitude: 38.7677295, longitude: -18.8529999, zone: 'Sul' },
  'Portimão': { latitude: 37.1325847, longitude: -8.5388601, zone: 'Sul' },
  'Faro': { latitude: 38.7677295, longitude: -18.8529999, zone: 'Sul' },
  'Tavira': { latitude: 38.7677295, longitude: -18.8529999, zone: 'Sul' },
  'Fuzeta': { latitude: 38.7677295, longitude: -18.8529999, zone: 'Sul' },
  'Vila Viçosa': { latitude: 38.8849116, longitude: -9.9356054, zone: 'Sul' },
  'Lagoa': { latitude: 37.1208858, longitude: -9.0972714, zone: 'Sul' },
  'Figueira de Castelo Rodrigo': { latitude: 37.0982979, longitude: -18.4250966, zone: 'Norte' },
  'Arganil': { latitude: 37.0982979, longitude: -18.4250966, zone: 'Centro' },
  'Vila Nova de Poiares': { latitude: 37.0982979, longitude: -18.4250966, zone: 'Centro' },
  'Monsanto': { latitude: 40.231595, longitude: -18.0345764, zone: 'Centro' },
  'Oliveira de Azeméis': { latitude: 40.1151208, longitude: -13.7255423, zone: 'Centro' },
  'Fermelã': { latitude: 40.6432682, longitude: -9.2602503, zone: 'Centro' },
  'Penafiel': { latitude: 41.2063364, longitude: -8.8922874, zone: 'Norte' },
  'Senhora da Hora': { latitude: 41.1866184, longitude: -8.6655937, zone: 'Porto' },
  'Amarante': { latitude: 41.2682937, longitude: -8.0771978, zone: 'Norte' },
  'Lourinhã': { latitude: 39.2426474, longitude: -9.3164026, zone: 'Centro' },
  'Jesufrei': { latitude: 41.4595667, longitude: -8.5124325, zone: 'Norte' }
};

function isPermissionError(err: any): boolean {
  if (!err) return false;
  const msg = err.message || String(err);
  const code = err.code || '';
  return code === 'permission-denied' || msg.includes('permission-denied') || msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('permissions');
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const PARTICLE_TEMPLATES = Array.from({ length: 18 }).map((_, idx) => {
  const angle = (idx / 18) * 360 + (Math.random() * 15 - 7.5);
  const distance = 25 + Math.random() * 35;
  const rad = (angle * Math.PI) / 180;
  return {
    id: idx,
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance,
    scale: 0.4 + Math.random() * 0.7,
    color: idx % 3 === 0 ? '#FFCA00' : idx % 3 === 1 ? '#FFCA00' : '#ffffff', // Amber-500, Amber-400, Froth white
    rotate: Math.random() * 360,
    delay: Math.random() * 0.1,
    size: 4 + (idx % 4) * 2 // Proportional sizes
  };
});

// Synthesized audio feedback using Web Audio API for rewarding gamification
const playStampSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const primaryOsc = audioCtx.createOscillator();
    const secondaryOsc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    primaryOsc.type = 'sine';
    primaryOsc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    primaryOsc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5

    secondaryOsc.type = 'triangle';
    secondaryOsc.frequency.setValueAtTime(1174.66, audioCtx.currentTime); // D6
    secondaryOsc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.12); // A6

    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    primaryOsc.connect(gainNode);
    secondaryOsc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    primaryOsc.start();
    secondaryOsc.start();
    primaryOsc.stop(audioCtx.currentTime + 0.4);
    secondaryOsc.stop(audioCtx.currentTime + 0.4);
  } catch (err) {
    console.warn('Audio synthesis support error:', err);
  }
};

const playRewardChime = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const synthChords = [523.25, 659.25, 783.99, 1046.50]; // C-Major chord arpeggio
    synthChords.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.08);
      gainNode.gain.setValueAtTime(0.10, audioCtx.currentTime + idx * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.08 + 0.35);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + idx * 0.08);
      osc.stop(audioCtx.currentTime + idx * 0.08 + 0.4);
    });
  } catch (err) {
    console.warn('Audio synthesis support error:', err);
  }
};

const playPacmanSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    // Waka-Waka is two distinct alternating high-to-low and low-to-high chirps.
    // Note 1 (Wa): sweep 350Hz up to 900Hz
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(350, now);
    osc1.frequency.linearRampToValueAtTime(900, now + 0.08);
    
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.10);
    
    // Note 2 (Ka): sweep 800Hz down to 400Hz, slightly delayed
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(800, now + 0.08);
    osc2.frequency.linearRampToValueAtTime(400, now + 0.16);
    
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.18);
  } catch (err) {
    console.warn('Audio synthesis support error:', err);
  }
};

export interface LevelInfo {
  title: string;
  badge: string;
  concept: string;
  isSecret: boolean;
  nextMeta: { count: number; title: string } | null;
  avatarUrl: string;
}

export function getLevelDetails(hops: number, lang: Language = 'PT'): LevelInfo {
  if (hops >= 101) {
    return {
      title: 'Lord of the Barrels',
      badge: '🛢️',
      concept: lang === 'EN' 
        ? 'For legendary users who never stop rating.'
        : 'Para os utilizadores lendários que nunca param de avaliar.',
      isSecret: true,
      nextMeta: null,
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80'
    };
  } else if (hops >= 91) {
    return {
      title: 'HOP Master',
      badge: '👑',
      concept: lang === 'EN'
        ? 'The top of the ecosystem. A living legend of bocks, barrels, and aging.'
        : 'O topo do ecossistema. Uma lenda viva dos bocks, barris e maturação.',
      isSecret: false,
      nextMeta: { count: 101, title: 'Lord of the Barrels' },
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80'
    };
  } else if (hops >= 71) {
    return {
      title: 'Certified Cicerone',
      badge: '🎖️',
      concept: lang === 'EN'
        ? 'Near-professional level. Detects complex notes and off-flavors in beer.'
        : 'Nível quase profissional. Deteta notas complexas e defeitos na cerveja (off-flavors).',
      isSecret: false,
      nextMeta: { count: 91, title: 'HOP Master' },
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80'
    };
  } else if (hops >= 46) {
    return {
      title: 'Hop Head',
      badge: '🤯',
      concept: lang === 'EN'
        ? 'Fanatic for hops and bitterness (high IBU). The palate is hooked.'
        : 'Fanático por lúpulo e amargor (IBU elevado). O paladar já está viciado.',
      isSecret: false,
      nextMeta: { count: 71, title: 'Certified Cicerone' },
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'
    };
  } else if (hops >= 26) {
    return {
      title: 'Homebrewer',
      badge: '🧪',
      concept: lang === 'EN'
        ? 'Understands styles (IPAs, Stouts, Sours) and evaluates with clearer criteria.'
        : 'Já entende de estilos (IPAs, Stouts, Sours) e avalia com critérios mais claros.',
      isSecret: false,
      nextMeta: { count: 46, title: 'Hop Head' },
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80'
    };
  } else if (hops >= 11) {
    return {
      title: 'HOP Rookie',
      badge: '🌿',
      concept: lang === 'EN'
        ? 'Has passed the initial barrier and started noticing the presence and aroma of hops.'
        : 'Já passou a barreira inicial e começou a notar a presença e aroma do lúpulo.',
      isSecret: false,
      nextMeta: { count: 26, title: 'Homebrewer' },
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
    };
  } else {
    return {
      title: 'HOP Novice',
      badge: '🌱',
      concept: lang === 'EN'
        ? 'The beginning of everything. Discovering that beer goes far beyond industrial lager.'
        : 'O início de tudo. Está a descobrir que a cerveja vai além da lager industrial.',
      isSecret: false,
      nextMeta: { count: 11, title: 'HOP Rookie' },
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    };
  }
}

export function getUserTierIndex(points: number): number {
  if (points >= 101) return 0;
  if (points >= 91) return 1;
  if (points >= 71) return 2;
  if (points >= 46) return 3;
  if (points >= 26) return 4;
  if (points >= 11) return 5;
  return 6;
}

// Extradecimal Haversine distance calculator
export function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calcula a distância exata em metros entre duas coordenadas utilizando a fórmula matemática de Haversine
export function getHaversineDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface SpotTierDetails {
  title: string;
  concept: string;
  badge: string;
  atmosphere: string;
}

export function getSpotTier(taps: number): SpotTierDetails {
  if (taps < 100) {
    return {
      title: 'Secret Speakeasy',
      concept: 'Aquele segredo que só os locais conhecem. Pouca gente sabe que serve artesanal, mas tem potencial.',
      badge: '🗝️ Uma chave antiga.',
      atmosphere: 'O bar escondido da esquina.'
    };
  } else if (taps < 500) {
    return {
      title: 'Cozy Taproom',
      concept: 'O spot já aqueceu os motores. Começa a atrair a comunidade do bairro ao fim de semana.',
      badge: '🍻 Dois copos a brindarem.',
      atmosphere: 'Vibe descontraída de bairro.'
    };
  } else if (taps < 1500) {
    return {
      title: 'Craft Hub',
      concept: 'Ponto de encontro obrigatório na cidade. Se alguém quer uma boa IPA local, vem aqui.',
      badge: '📍 Um pionés/marcador de mapa brilhante.',
      atmosphere: 'Esplanada cheia a uma sexta-feira.'
    };
  } else if (taps < 5000) {
    return {
      title: 'Beer Temple',
      concept: 'Um local de peregrinação. Os "Hop Heads" vêm de outras cidades só para ver a lista de torneiras (tap list).',
      badge: '🏛️ Um templo grego com colunas em forma de garrafa.',
      atmosphere: 'Filas à porta para lançamentos especiais.'
    };
  } else if (taps < 15000) {
    return {
      title: 'Imperial Station',
      concept: 'Um verdadeiro império da cerveja. Tem dezenas de torneiras rotativas e eventos de tap takeover constantemente.',
      badge: '👑 Um barril com uma coroa imperial.',
      atmosphere: 'Caos organizado, barulho de copos e barris a rolar.'
    };
  } else {
    return {
      title: 'The Craft Mecca',
      concept: 'O santuário supremo. Conhecido internacionalmente, é o destino de sonho de qualquer amante de cerveja artesanal.',
      badge: '🌌 Um portal galáctico de lúpulo.',
      atmosphere: 'Lendário, paragem obrigatória no turismo cervejeiro.'
    };
  }
}

export function getDeterministicBaseTaps(barId: string): number {
  return 0;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'explore' | 'routes' | 'map' | 'events' | 'loyalty' | 'profile'>('explore');
  const [userLocation, setUserLocation] = useState({ latitude: 41.1500, longitude: -8.6200 }); // Defaults to Porto center
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Active seasonal / commemorative date event
  const activeSpecialEvent = getActiveSpecialEvent();
  const isChristmas = activeSpecialEvent?.type === 'christmas';
  
  // Check-In Pixel Confetti Animation States
  const [animatingCheckinBarId, setAnimatingCheckinBarId] = useState<string | null>(null);
  const [animatingCheckinEventId, setAnimatingCheckinEventId] = useState<string | null>(null);

  // Scroll to Top state & ref
  const mainScrollRef = React.useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleMainScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 180) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  useEffect(() => {
    setShowScrollTop(false);
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // App Core State
  const [bars, setBars] = useState<Bar[]>(() =>
    BARS_DATA.map(bar => ({
      ...bar,
      rating: 0,
      reviewsCount: 0,
      reviews: [],
      taps: getDeterministicBaseTaps(bar.id)
    }))
  );
  const [events, setEvents] = useState<BeerEvent[]>(EVENTS_DATA);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);

  // Filtering and Searching
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('All');

  const handleSelectBar = (bar: Bar | null, updateUrl: boolean = true) => {
    setShowAllSpotReviews(false);
    setSelectedBar(bar);
    if (bar) {
      trackSpotView(bar, user);
      if (updateUrl) {
        updateBrowserUrl(getCitySlug(bar.zone), getSpotSlug(bar), false, lang);
      }
      updateDynamicMetaTags(bar, bar.zone, lang);
    } else {
      if (updateUrl) {
        updateBrowserUrl(selectedZone !== 'All' ? getCitySlug(selectedZone) : null, null, false, lang);
      }
      updateDynamicMetaTags(null, selectedZone !== 'All' ? selectedZone : null, lang);
    }
  };

  const handleSelectZone = (zone: string, updateUrl: boolean = true) => {
    setSelectedZone(zone);
    if (selectedBar && selectedBar.zone !== zone && zone !== 'All') {
      setSelectedBar(null);
    }
    if (updateUrl) {
      updateBrowserUrl(zone !== 'All' ? getCitySlug(zone) : null, null, false, lang);
    }
    updateDynamicMetaTags(null, zone !== 'All' ? zone : null, lang);
  };
  
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);
  const [zoneSearchQuery, setZoneSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('All');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [proximitySort, setProximitySort] = useState(false);
  const [topRatedSort, setTopRatedSort] = useState(false);
  const [openNowFilter, setOpenNowFilter] = useState(false);
  const [alphabeticalSort, setAlphabeticalSort] = useState(false);
  const [spotViewMode, setSpotViewMode] = useState<'list' | 'mosaic' | 'icons'>(() => {
    try {
      const saved = localStorage.getItem('hopmap_spot_view_mode');
      if (saved === 'list' || saved === 'mosaic' || saved === 'icons') {
        return saved;
      }
    } catch (e) {}
    return 'mosaic';
  });

  const handleSetSpotViewMode = (mode: 'list' | 'mosaic' | 'icons') => {
    setSpotViewMode(mode);
    try {
      localStorage.setItem('hopmap_spot_view_mode', mode);
    } catch (e) {}
  };

  const [festivalViewMode, setFestivalViewMode] = useState<'list' | 'mosaic' | 'icons'>(() => {
    try {
      const saved = localStorage.getItem('hopmap_festival_view_mode');
      if (saved === 'list' || saved === 'mosaic' || saved === 'icons') {
        return saved;
      }
    } catch (e) {}
    return 'list';
  });

  const handleSetFestivalViewMode = (mode: 'list' | 'mosaic' | 'icons') => {
    setFestivalViewMode(mode);
    try {
      localStorage.setItem('hopmap_festival_view_mode', mode);
    } catch (e) {}
  };

  const [selectedFestival, setSelectedFestival] = useState<BeerEvent | null>(null);
  
  const [loyaltySearchQuery, setLoyaltySearchQuery] = useState('');
  const [showAllLoyaltySpots, setShowAllLoyaltySpots] = useState(false);
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllSpotReviews, setShowAllSpotReviews] = useState(false);
  const [showAllCheckins, setShowAllCheckins] = useState(false);
  
  // User & Gamification
  const [user, setUser] = useState<UserProfile>(() => {
    const initialPoints = 12;
    const initialLevelInfo = getLevelDetails(initialPoints);
    
    let savedStamps = { 'catraio': 2, 'cerveteca': 1 };
    let savedLastCheckinDates = {};
    let savedTenStampsDates = {};
    let savedCheckinHistory: Array<{ id: string; barId: string; barName: string; location: string; date: string; timestamp?: string }> = [];
    
    try {
      const cachedStamps = localStorage.getItem('hop_user_1_stamps');
      if (cachedStamps) savedStamps = JSON.parse(cachedStamps);
    } catch (e) {}
    try {
      const cachedLastCheckinDates = localStorage.getItem('hop_user_1_lastCheckinDates');
      if (cachedLastCheckinDates) savedLastCheckinDates = JSON.parse(cachedLastCheckinDates);
    } catch (e) {}
    try {
      const cachedTenStampsDates = localStorage.getItem('hop_user_1_tenStampsDates');
      if (cachedTenStampsDates) savedTenStampsDates = JSON.parse(cachedTenStampsDates);
    } catch (e) {}
    let savedShareCheckins = true;
    try {
      const cachedCheckinHistory = localStorage.getItem('hop_user_1_checkinHistory');
      if (cachedCheckinHistory) savedCheckinHistory = JSON.parse(cachedCheckinHistory);
    } catch (e) {}
    try {
      const cachedShare = localStorage.getItem('hop_share_checkins_enabled');
      if (cachedShare !== null) savedShareCheckins = cachedShare === 'true';
    } catch (e) {}

    let savedNotificationsEnabled = true;
    try {
      const cachedNotif = localStorage.getItem('hop_user_notifications_enabled');
      if (cachedNotif !== null) savedNotificationsEnabled = cachedNotif === 'true';
    } catch (e) {}

    return {
      id: 'user_1',
      email: 'e-mail', // Metada User Email
      username: 'utilizador',
      avatarUrl: initialLevelInfo.avatarUrl,
      points: initialPoints,
      level: initialLevelInfo.title,
      stamps: savedStamps,
      favorites: ['catraio'],
      friends: [],
      purchasedEventTickets: [],
      biometricsEnabled: true,
      isLoggedIn: false,
      checkedInBars: [],
      lastCheckinDates: savedLastCheckinDates,
      tenStampsDates: savedTenStampsDates,
      checkinHistory: savedCheckinHistory,
      checkedInFestivals: [],
      shareCheckinsEnabled: savedShareCheckins,
      notificationsEnabled: savedNotificationsEnabled,
      user_language: (localStorage.getItem('hop_app_language') as Language) || 'PT'
    };
  });

  // App Administrator authorization check (strictly reserved for cobeertaste@gmail.com)
  const isAdmin = isAdminUser(user.email) || isAdminUser(auth.currentUser?.email);

  // i18n Internationalization Language State (PT default, respects URL routing)
  const [lang, setLang] = useState<Language>(() => {
    try {
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname.toLowerCase();
        const search = window.location.search.toLowerCase();
        if (pathname.startsWith('/en') || search.includes('lang=en')) {
          return 'EN';
        }
        if (pathname.startsWith('/pt') || search.includes('lang=pt')) {
          return 'PT';
        }
      }
      const saved = localStorage.getItem('hop_app_language');
      if (saved === 'PT' || saved === 'EN') return saved as Language;
    } catch (e) {}
    return 'PT';
  });

  const handleLanguageChange = async (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('hop_app_language', newLang);
    } catch (e) {}

    setUser(prev => ({ ...prev, user_language: newLang }));

    // Update URL prefix and dynamic meta tags with new language
    updateBrowserUrl(
      selectedZone !== 'All' ? getCitySlug(selectedZone) : null,
      selectedBar ? getSpotSlug(selectedBar) : null,
      true,
      newLang
    );
    updateDynamicMetaTags(
      selectedBar,
      selectedBar ? selectedBar.zone : (selectedZone !== 'All' ? selectedZone : null),
      newLang
    );

    if (user.isLoggedIn && !user.id.startsWith('local-user-')) {
      try {
        await setDoc(doc(db, 'users', user.id), {
          user_language: newLang
        }, { merge: true });
      } catch (e) {
        console.warn('Could not save user_language to Firestore:', e);
      }
    }

    triggerSelfPush(
      newLang === 'PT' ? 'Idioma Atualizado 🇵🇹' : 'Language Updated 🇬🇧',
      t('userLanguageUpdated', newLang),
      'system'
    );
  };

  // Custom Routines / Otimização de Rota
  const [customRoute, setCustomRoute] = useState<string[]>(['catraio', 'letraria-braga']); // Default barIds
  const [isRouteOptimized, setIsRouteOptimized] = useState(false);

  // Profile Customization & Session State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreSubTab, setScoreSubTab] = useState<'global' | 'friends' | 'tiers' | 'spots'>('global');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isOver18, setIsOver18] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const isLocalAuthFallback = false;

  // Password reset states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  // GPS refresh states
  const [isGpsRefreshing, setIsGpsRefreshing] = useState(false);

  // Social Media Pop-up Modal (Every 5 minutes = 300,000 ms)
  const [showSocialModal, setShowSocialModal] = useState(false);

  // Spot Social Sharing Card Modal, Monthly Report Modal & Buy Us a Beer Modal
  const [shareBarModal, setShareBarModal] = useState<Bar | null>(null);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [isAdminPinsModalOpen, setIsAdminPinsModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null);
  const prevUnlockedBadgeIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialBadgesLoadRef = React.useRef<boolean>(true);

  // Account deletion states
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountErrorMsg, setDeleteAccountErrorMsg] = useState('');

  // Hop-Chat 🍻 Community Live Chat & Mention Notifications
  const [isHopChatOpen, setIsHopChatOpen] = useState(false);
  const [activeMentionToast, setActiveMentionToast] = useState<MentionNotificationPayload | null>(null);

  // Real-time listener for user mention notifications
  useEffect(() => {
    if (!user.isLoggedIn || !user.username) return;

    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('recipientUsername', '==', user.username.toLowerCase())
        );

        const unsubscribe = onSnapshot(
          q, 
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const data = change.doc.data();
                if (data && !data.isRead && data.senderId !== user.id) {
                  const toastData: MentionNotificationPayload = {
                    id: change.doc.id,
                    senderName: data.senderName || 'Amigo Craft',
                    text: data.message || '',
                    messagePT: data.title || `@${data.senderName} mencionou-te no chat da comunidade! 🍻`,
                    messageEN: data.titleEn || `@${data.senderName} mentioned you in the community chat! 🍻`
                  };
                  setActiveMentionToast(toastData);

                  // If native push notifications are granted, trigger browser notification
                  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                    try {
                      new Notification(lang === 'PT' ? 'Hop-Chat 🍻 Menção' : 'Hop-Chat 🍻 Mention', {
                        body: lang === 'PT' ? toastData.messagePT : toastData.messageEN,
                        icon: '/icon-192.png'
                      });
                    } catch (e) {
                      console.warn('Native notification error:', e);
                    }
                  }
                }
              }
            });
          },
          (err) => {
            console.warn('Notification snapshot listener note:', err?.message || err);
          }
        );

        return () => unsubscribe();
      } catch (e) {
        console.warn('Notification listener error:', e);
      }
    }
  }, [user.isLoggedIn, user.username, user.id, lang]);

  // Check for donation callback in URL query params (from Stripe Checkout)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('donation_success') === 'true') {
        const donorParam = urlParams.get('donor') || 'Apoiante Hop-Map';
        const amountParam = parseFloat(urlParams.get('amount') || '5');
        
        recordDonation({
          donorName: donorParam,
          amount: isNaN(amountParam) ? 5 : amountParam,
          paymentMethod: 'stripe_card',
          status: 'completed',
          notes: 'Completed via Stripe Checkout Return'
        });

        triggerSelfPush(
          lang === 'PT' ? 'Obrigado pelo teu apoio! 🍻' : 'Thank you for your support! 🍻',
          lang === 'PT' ? `A tua rodada de ${isNaN(amountParam) ? 5 : amountParam} € foi recebida. Muito obrigado!` : `Your round of ${isNaN(amountParam) ? 5 : amountParam} € was received. Thank you!`,
          'reward'
        );

        // Clean up URL parameters without refreshing
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (e) {
      console.warn('URL donation query handler note:', e);
    }
  }, [lang]);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowSocialModal(true);
    }, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatic monthly report verification & dispatch to cobeertaste@gmail.com on the 1st of each month
  useEffect(() => {
    if (bars && bars.length > 0) {
      checkAndAutoDispatchMonthlyReport(bars);
    }
    // Also run a check periodically (every 1 hour)
    const reportCheckInterval = setInterval(() => {
      if (bars && bars.length > 0) {
        checkAndAutoDispatchMonthlyReport(bars);
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(reportCheckInterval);
  }, [bars]);

  // Check-In Success Pop-up Modal
  const [checkinPopupModal, setCheckinPopupModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    website: string;
  } | null>(null);

  // 8-Bit Retro PIN Modal State for Staff/Bartender PIN Validation
  const [pinModalSpot, setPinModalSpot] = useState<Bar | null>(null);

  // STAGE CLEAR 8-bit Festive Celebration Screen State
  const [stageClearSpotName, setStageClearSpotName] = useState<string | null>(null);

  // Check-In iOS System Toast Notification State
  const [iosToast, setIosToast] = useState<{
    id: string;
    title: string;
    barName: string;
    pointsEarned: number;
    subtitle?: string;
  } | null>(null);

  // Beer Style Prompt Modal State after successful check-in
  const [beerStyleModal, setBeerStyleModal] = useState<{
    isOpen: boolean;
    spotId: string;
    spotName: string;
    checkinId?: string;
  } | null>(null);

  const handleSelectBeerStyle = async (selectedStyle: string) => {
    if (!beerStyleModal) return;
    const { spotId, spotName, checkinId } = beerStyleModal;

    // 1. Record style consumption in analytics / Firestore / LocalStorage metrics
    await recordSpotBeerStyleConsumption(
      spotId,
      spotName,
      selectedStyle,
      { id: user.id || 'user_1', username: user.username || 'utilizador' },
      checkinId
    );

    // 2. Update user check-in history state with the chosen beer style
    setUser(prev => {
      const updatedHistory = (prev.checkinHistory || []).map(item => {
        if (checkinId && item.id === checkinId) {
          return { ...item, beerStyle: selectedStyle };
        }
        if (!checkinId && item.barId === spotId && !item.beerStyle) {
          return { ...item, beerStyle: selectedStyle };
        }
        return item;
      });

      const updatedUser = {
        ...prev,
        checkinHistory: updatedHistory
      };

      // Sync user profile history with Firestore if authenticated
      if (prev.isLoggedIn && prev.id && !prev.id.startsWith('local-user-')) {
        try {
          setDoc(doc(db, 'users', prev.id), {
            checkinHistory: updatedHistory
          }, { merge: true });
        } catch (e) {
          console.warn('Sync checkin style to Firestore note:', e);
        }
      }

      return updatedUser;
    });

    // 3. User feedback
    triggerSelfPush(
      lang === 'PT' ? 'Estilo Registado! 🍺' : 'Style Recorded! 🍺',
      lang === 'PT' ? `Registaste ${selectedStyle} no ${spotName}.` : `You logged ${selectedStyle} at ${spotName}.`,
      'loyalty'
    );

    // 4. Close modal
    setBeerStyleModal(null);
  };

  useEffect(() => {
    if (iosToast) {
      const timer = setTimeout(() => {
        setIosToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [iosToast]);

  // Share Ranking handler
  const handleShareRanking = async () => {
    playPacmanSound();
    const details = getLevelDetails(user.points, lang);
    const shareText = lang === 'PT'
      ? `🍻 HOP-MAP by COBEER TASTE 🍻\n\n` +
        `👤 Jogador: ${user.username.toUpperCase()}\n` +
        `⚡ Pontuação: ${user.points} HOPS\n` +
        `🏆 Ranking: ${details.title.toUpperCase()} (${details.badge})\n\n` +
        `Encontra os melhores spots de cerveja artesanal no HOP-MAP by COBEER TASTE!\n` +
        `https://www.cobeertaste.com`
      : `🍻 HOP-MAP by COBEER TASTE 🍻\n\n` +
        `👤 Player: ${user.username.toUpperCase()}\n` +
        `⚡ Points: ${user.points} HOPS\n` +
        `🏆 Rank: ${details.title.toUpperCase()} (${details.badge})\n\n` +
        `Discover the best craft beer spots across Portugal on HOP-MAP by COBEER TASTE!\n` +
        `https://www.cobeertaste.com`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: lang === 'PT' ? 'HOP-MAP by COBEER TASTE - O meu Ranking' : 'HOP-MAP by COBEER TASTE - My Rank',
          text: shareText,
          url: 'https://www.cobeertaste.com'
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      triggerSelfPush(
        lang === 'PT' ? 'Ranking Copiado! 📋' : 'Rank Copied! 📋',
        lang === 'PT' ? 'O teu progresso HOP-MAP foi copiado para a área de transferência.' : 'Your HOP-MAP progress was copied to clipboard.',
        'system'
      );
    } catch (e) {
      triggerSelfPush('Ranking HOPS', `${user.username}: ${user.points} HOPS (${details.title}) - www.cobeertaste.com`, 'system');
    }
  };

  // Notifications
  const [notifications, setNotifications] = useState<HopNotification[]>(() => {
    try {
      const saved = localStorage.getItem('hop_user_notifications_history');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return [
      {
        id: 'n1',
        title: 'Artbeerfest Caminha Próximo!',
        titleEn: 'Artbeerfest Caminha Coming Soon!',
        body: 'Os bilhetes virtuais premium já estão disponíveis para compra rápida com Apple Pay.',
        bodyEn: 'Premium virtual tickets are now available for quick purchase with Apple Pay.',
        timestamp: 'Hoje, 10:15',
        timestampEn: 'Today, 10:15',
        createdAt: Date.now() - 3600000,
        isRead: false,
        type: 'event'
      },
      {
        id: 'n2',
        title: 'Selo CoBeer Taste Ganho!',
        titleEn: 'CoBeer Taste Stamp Earned!',
        body: 'Ganhaste o badge de Impulsionador da Cerveja ao adicionares o teu primeiro bar favorito.',
        bodyEn: 'You earned the Beer Booster badge by adding your first favorite spot.',
        timestamp: 'Ontem, 16:30',
        timestampEn: 'Yesterday, 16:30',
        createdAt: Date.now() - 86400000,
        isRead: true,
        type: 'reward'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('hop_user_notifications_history', JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);
  const [activePush, setActivePush] = useState<HopNotification | null>(null);

  // Modal Flow triggers
  const [biometricsType, setBiometricsType] = useState<'login' | 'checkin' | 'payout' | null>(null);
  const [biometricsCallback, setBiometricsCallback] = useState<(() => void) | null>(null);
  const [biometricsReason, setBiometricsReason] = useState('');
  
  // Friends and Global Leaderboard State & Logic
  const LOCAL_MOCK_USERS = [
    { id: 'mock_1', username: 'MestreCervejeiro', points: 345 },
    { id: 'mock_2', username: 'RitaSourLover', points: 280 },
    { id: 'mock_3', username: 'HopKing_88', points: 215 },
    { id: 'mock_4', username: 'AnaStout', points: 195 },
    { id: 'mock_5', username: 'PedroNEIPA', points: 150 },
    { id: 'mock_6', username: 'CervejaEAmigos', points: 95 },
    { id: 'mock_7', username: 'DianaLager', points: 75 },
    { id: 'mock_8', username: 'TomasPilsner', points: 60 },
    { id: 'mock_9', username: 'SofiaGose', points: 40 },
    { id: 'mock_10', username: 'BebedorIniciante', points: 20 },
  ];

  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [friendSearchResults, setFriendSearchResults] = useState<{ id: string; username: string; points: number }[]>([]);
  const [isFriendSearching, setIsFriendSearching] = useState(false);
  const [friendSearchMessage, setFriendSearchMessage] = useState('');

  const [friendsDetails, setFriendsDetails] = useState<{ id: string; username: string; points: number }[]>([]);
  const [isFriendsDetailsLoading, setIsFriendsDetailsLoading] = useState(false);

  const [pendingRequests, setPendingRequests] = useState<{ id: string; senderId: string; senderName: string; senderPoints: number }[]>([]);
  const [sentPendingRequests, setSentPendingRequests] = useState<string[]>([]);

  const [globalScores, setGlobalScores] = useState<{ id: string; username: string; points: number; isFriend?: boolean }[]>([]);
  const [isScoresLoading, setIsScoresLoading] = useState(false);

  // Fetch Friends Details whenever user.friends updates
  useEffect(() => {
    let active = true;
    const fetchFriendsDetails = async () => {
      const friendIds = user.friends || [];
      if (friendIds.length === 0) {
        setFriendsDetails([]);
        return;
      }
      if (isLocalAuthFallback) {
        const details = friendIds.map(fid => {
          const mockF = LOCAL_MOCK_USERS.find(u => u.id === fid);
          return {
            id: fid,
            username: mockF ? mockF.username : `Amigo (${fid.substring(0, 5)})`,
            points: mockF ? mockF.points : 10
          };
        });
        if (active) {
          setFriendsDetails(details);
        }
        return;
      }
      setIsFriendsDetailsLoading(true);
      try {
        const details: { id: string; username: string; points: number }[] = [];
        const chunks: string[][] = [];
        for (let i = 0; i < friendIds.length; i += 30) {
          chunks.push(friendIds.slice(i, i + 30));
        }

        for (const chunk of chunks) {
          try {
            const q = query(collection(db, 'users'), where('uid', 'in', chunk));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((docSnap) => {
              const data = docSnap.data();
              details.push({
                id: docSnap.id,
                username: data.username || 'utilizador',
                points: typeof data.points === 'number' ? data.points : 0
              });
            });
          } catch (e) {
            console.warn("Could not query sub-chunk of friends:", e);
          }
        }

        // Add mock users if any of friendIds match mock uids
        const foundIds = new Set(details.map(d => d.id));
        friendIds.forEach(fid => {
          if (!foundIds.has(fid)) {
            const mockF = LOCAL_MOCK_USERS.find(u => u.id === fid);
            details.push({
              id: fid,
              username: mockF ? mockF.username : `Amigo (${fid.substring(0, 5)})`,
              points: mockF ? mockF.points : 15
            });
          }
        });

        if (active) {
          setFriendsDetails(details);
        }
      } catch (err) {
        console.error("Error fetching friends details, falling back to mock mapping:", err);
        const details = friendIds.map(fid => {
          const mockF = LOCAL_MOCK_USERS.find(u => u.id === fid);
          return {
            id: fid,
            username: mockF ? mockF.username : `Amigo (${fid.substring(0, 5)})`,
            points: mockF ? mockF.points : 10
          };
        });
        if (active) {
          setFriendsDetails(details);
        }
      } finally {
        if (active) {
          setIsFriendsDetailsLoading(false);
        }
      }
    };

    fetchFriendsDetails();
    return () => {
      active = false;
    };
  }, [user.friends]);

  // Database is now completely real-world operated, seeding is done server-side or during sign-up only.

  // Fetch pending friend requests for the current user (where current user is receiver)
  useEffect(() => {
    if (!user.isLoggedIn || user.id.startsWith('local-user-')) {
      setPendingRequests([]);
      return;
    }

    let active = true;
    const fetchRequests = async () => {
      try {
        const q = query(
          collection(db, 'friend_requests'),
          where('receiverId', '==', user.id),
          where('status', '==', 'pending')
        );
        const querySnapshot = await getDocs(q);
        const reqs: any[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          reqs.push({
            id: docSnap.id,
            senderId: data.senderId,
            senderName: data.senderName || 'utilizador',
            senderPoints: data.senderPoints || 0
          });
        });
        if (active) {
          setPendingRequests(reqs);
        }
      } catch (err) {
        console.warn("Error fetching pending requests:", err);
      }
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user.isLoggedIn, user.id]);

  // Fetch sent pending requests to know who we are waiting for
  useEffect(() => {
    if (!user.isLoggedIn || user.id.startsWith('local-user-')) {
      setSentPendingRequests([]);
      return;
    }

    let active = true;
    const fetchSent = async () => {
      try {
        const q = query(
          collection(db, 'friend_requests'),
          where('senderId', '==', user.id),
          where('status', '==', 'pending')
        );
        const querySnapshot = await getDocs(q);
        const sent: string[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.receiverId) {
            sent.push(data.receiverId);
          }
        });
        if (active) {
          setSentPendingRequests(sent);
        }
      } catch (err) {
        console.warn("Error fetching sent requests:", err);
      }
    };

    fetchSent();
    const interval = setInterval(fetchSent, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user.isLoggedIn, user.id]);

  // Poll for accepted requests sent by current user, to automatically add those users to our friends list (mutual)
  useEffect(() => {
    if (!user.isLoggedIn || user.id.startsWith('local-user-')) return;

    let active = true;
    const checkAcceptedRequests = async () => {
      try {
        const q = query(
          collection(db, 'friend_requests'),
          where('senderId', '==', user.id),
          where('status', '==', 'accepted')
        );
        const querySnapshot = await getDocs(q);
        const newFriendsToAppend: string[] = [];
        const reqsToComplete: string[] = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const rId = data.receiverId;
          if (rId && !(user.friends || []).includes(rId)) {
            newFriendsToAppend.push(rId);
          }
          reqsToComplete.push(docSnap.id);
        });

        if (newFriendsToAppend.length > 0 && active) {
          const updatedFriends = [...(user.friends || []), ...newFriendsToAppend];
          setUser(prev => ({
            ...prev,
            friends: updatedFriends
          }));
          await setDoc(doc(db, 'users', user.id), {
            friends: updatedFriends
          }, { merge: true });

          // Mark these requests as 'completed' so we don't query them again
          for (const reqId of reqsToComplete) {
            await setDoc(doc(db, 'friend_requests', reqId), {
              status: 'completed'
            }, { merge: true });
          }
          
          triggerSelfPush(
            'Novo Amigo! 🎉',
            'Um utilizador aceitou o teu pedido de amizade!',
            'system'
          );
        }
      } catch (err) {
        console.warn("Error checking accepted requests:", err);
      }
    };

    checkAcceptedRequests();
    const interval = setInterval(checkAcceptedRequests, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user.isLoggedIn, user.id, user.friends]);

  // Listen / Poll for friend check-in notifications
  useEffect(() => {
    if (!user.isLoggedIn || user.id.startsWith('local-user-')) return;

    let active = true;

    const fetchFriendCheckins = async () => {
      try {
        const q = query(
          collection(db, 'checkin_notifications'),
          where('targetFriendIds', 'array-contains', user.id),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const querySnapshot = await getDocs(q);

        const cacheKey = `hop_seen_checkin_notifs_${user.id}`;
        let seenIds: string[] = [];
        try {
          const raw = localStorage.getItem(cacheKey);
          if (raw) seenIds = JSON.parse(raw);
        } catch (e) {}

        const seenSet = new Set(seenIds);
        const newNotifs: HopNotification[] = [];

        querySnapshot.forEach((docSnap) => {
          const notifId = docSnap.id;
          if (!seenSet.has(notifId)) {
            const data = docSnap.data();
            if (data.senderId !== user.id) {
              seenSet.add(notifId);

              const notifTitle = t('friendCheckinNotifTitle', lang) || 'Check-in de Amigo 🍻';
              const notifBody = lang === 'PT'
                ? `${data.senderName} fez check-in no ${data.locationType === 'festival' ? 'festival' : 'spot'} "${data.locationName}"!`
                : `${data.senderName} checked in at ${data.locationType === 'festival' ? 'festival' : 'spot'} "${data.locationName}"!`;

              const freshPush: HopNotification = {
                id: `friend_checkin_${notifId}`,
                title: notifTitle,
                titleEn: notifTitle,
                body: notifBody,
                bodyEn: notifBody,
                timestamp: lang === 'PT' ? 'Agora mesmo' : 'Just now',
                timestampEn: 'Just now',
                isRead: false,
                type: 'system'
              };
              newNotifs.push(freshPush);
            }
          }
        });

        if (newNotifs.length > 0 && active) {
          localStorage.setItem(cacheKey, JSON.stringify(Array.from(seenSet)));
          setNotifications(prev => [...newNotifs, ...prev]);
          setActivePush(newNotifs[0]);
        }
      } catch (err) {
        console.warn("Could not fetch friend check-in notifications:", err);
      }
    };

    fetchFriendCheckins();
    const interval = setInterval(fetchFriendCheckins, 12000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user.isLoggedIn, user.id, lang]);

  // Fetch all users for global scores - strictly only registered users with points > 0
  const fetchScoresAndUsers = async () => {
    setIsScoresLoading(true);
    if (isLocalAuthFallback) {
      const fallbackList = [
        { id: 'seed_1', username: 'MestreCervejeiro', points: 345 },
        { id: 'seed_2', username: 'RitaSourLover', points: 280 },
        { id: 'seed_3', username: 'HopKing_88', points: 215 },
        { id: 'seed_4', username: 'AnaStout', points: 195 },
        { id: 'seed_5', username: 'PedroNEIPA', points: 150 },
      ];
      
      let userUpdatedInFallback = false;
      const updatedFallbackList = fallbackList.map(item => {
        if (user.isLoggedIn && (item.id === user.id || item.username.toLowerCase() === user.username.toLowerCase())) {
          userUpdatedInFallback = true;
          return { ...item, id: user.id, username: user.username, points: user.points };
        }
        return item;
      });

      if (user.isLoggedIn && user.points > 0 && !userUpdatedInFallback) {
        updatedFallbackList.push({ id: user.id, username: user.username, points: user.points });
      }
      updatedFallbackList.sort((a, b) => b.points - a.points);
      setGlobalScores(updatedFallbackList);
      setIsScoresLoading(false);
      return;
    }
    try {
      const q = query(
        collection(db, 'users'), 
        where('points', '>', 0), 
        orderBy('points', 'desc'), 
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      const dbUsers: { id: string; username: string; points: number }[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        dbUsers.push({
          id: docSnap.id,
          username: data.username || 'utilizador',
          points: typeof data.points === 'number' ? data.points : 0
        });
      });

      // Map dbUsers to ensure the current user's points match user.points if logged in
      const list = dbUsers.map(u => {
        if (user.isLoggedIn && u.id === user.id) {
          return { ...u, points: user.points };
        }
        return u;
      });
      // Include current user in ranking fallback if they are logged in and have points > 0
      if (user.isLoggedIn && user.points > 0 && !list.some(u => u.id === user.id)) {
        list.push({
          id: user.id,
          username: user.username,
          points: user.points
        });
      }

      const sorted = list.sort((a, b) => b.points - a.points);
      setGlobalScores(sorted);
    } catch (err) {
      console.warn("Could not fetch global scores, using registered user fallback list:", err);
      const fallbackList = [
        { id: 'seed_1', username: 'MestreCervejeiro', points: 345 },
        { id: 'seed_2', username: 'RitaSourLover', points: 280 },
        { id: 'seed_3', username: 'HopKing_88', points: 215 },
        { id: 'seed_4', username: 'AnaStout', points: 195 },
        { id: 'seed_5', username: 'PedroNEIPA', points: 150 },
      ];
      
      let userUpdatedInFallback = false;
      const updatedFallbackList = fallbackList.map(item => {
        if (user.isLoggedIn && (item.id === user.id || item.username.toLowerCase() === user.username.toLowerCase())) {
          userUpdatedInFallback = true;
          return { ...item, id: user.id, username: user.username, points: user.points };
        }
        return item;
      });

      if (user.isLoggedIn && user.points > 0 && !userUpdatedInFallback) {
        updatedFallbackList.push({ id: user.id, username: user.username, points: user.points });
      }
      updatedFallbackList.sort((a, b) => b.points - a.points);
      setGlobalScores(updatedFallbackList);
    } finally {
      setIsScoresLoading(false);
    }
  };

  useEffect(() => {
    fetchScoresAndUsers();
  }, [user.points, user.username, user.friends]);

  // User Global Rank Calculation
  const userGlobalRank = React.useMemo(() => {
    if (!user.points || user.points <= 0) return '-';
    const index = globalScores.findIndex(s => s.id === user.id || s.username.toLowerCase() === user.username.toLowerCase());
    return index !== -1 ? index + 1 : (globalScores.length > 0 ? globalScores.length + 1 : 1);
  }, [globalScores, user.id, user.username, user.points]);

  const isGlobalRank1 = typeof userGlobalRank === 'number' && userGlobalRank === 1 && (user.points || 0) > 0;
  const userRankingStyle = getUserRankingStyling(user.points || 0, isGlobalRank1, lang);

  // Distinct spots conquered (spots with at least 1 checkin)
  const conqueredSpotsCount = React.useMemo(() => {
    const history = user.checkinHistory || [];
    const stamps = user.stamps || {};
    const checked = user.checkedInBars || [];
    const uniqueBars = new Set([
      ...checked,
      ...history.map(h => h.barId),
      ...Object.keys(stamps).filter(k => (stamps[k] || 0) > 0)
    ]);
    return uniqueBars.size;
  }, [user.checkinHistory, user.stamps, user.checkedInBars]);

  // Badges Calculation for the current user
  const userBadgeStatuses = React.useMemo(() => {
    return calculateUserBadges({
      user,
      bars,
      userRank: typeof userGlobalRank === 'number' ? userGlobalRank : undefined,
      reviewsCount: user.reviewsCount || 0,
      donationsCount: user.donationsCount || 0,
      lang
    });
  }, [user, bars, userGlobalRank, lang]);

  const unlockedBadges = React.useMemo(() => {
    return userBadgeStatuses.filter(b => b.unlocked).map(b => b.badge);
  }, [userBadgeStatuses]);

  // Listener to trigger celebration popup when a new badge is unlocked
  useEffect(() => {
    if (!user.isLoggedIn && !user.points) return;
    const currentUnlockedIds = new Set(unlockedBadges.map(b => b.id));

    if (isInitialBadgesLoadRef.current) {
      prevUnlockedBadgeIdsRef.current = currentUnlockedIds;
      isInitialBadgesLoadRef.current = false;
      return;
    }

    // Identify newly unlocked badges
    for (const badge of unlockedBadges) {
      if (!prevUnlockedBadgeIdsRef.current.has(badge.id)) {
        setNewlyUnlockedBadge(badge);
        triggerSelfPush(
          lang === 'PT' ? '🏆 Novo Badge Desbloqueado!' : '🏆 New Badge Unlocked!',
          lang === 'PT' ? `Parabéns, ganhaste o badge: ${badge.namePt}!` : `Congrats, you earned the badge: ${badge.nameEn}!`,
          'reward'
        );
        break;
      }
    }

    prevUnlockedBadgeIdsRef.current = currentUnlockedIds;
  }, [unlockedBadges, lang]);

  // Dynamic Real-time User Search for Registered Users
  useEffect(() => {
    const queryStr = friendSearchQuery.trim();
    if (!queryStr) {
      setFriendSearchResults([]);
      setFriendSearchMessage('');
      setIsFriendSearching(false);
      return;
    }

    let active = true;
    setIsFriendSearching(true);
    setFriendSearchMessage('');

    const timer = setTimeout(async () => {
      try {
        if (!isFirebaseConfigured || !db) {
          if (active) {
            setFriendSearchResults([]);
            setFriendSearchMessage(lang === 'PT' ? 'Nenhum utilizador registado encontrado com esse nome.' : 'No registered users found with that username.');
            setIsFriendSearching(false);
          }
          return;
        }

        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const results: { id: string; username: string; points: number }[] = [];
        
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const uname = data.username;
          if (typeof uname === 'string' && uname.trim().length > 0) {
            // Check if document is a registered user (not mock or temporary local placeholder)
            if (!docSnap.id.startsWith('mock_') && !docSnap.id.startsWith('local-user-')) {
              if (uname.toLowerCase().includes(queryStr.toLowerCase())) {
                results.push({
                  id: docSnap.id,
                  username: uname.trim(),
                  points: typeof data.points === 'number' ? data.points : 0
                });
              }
            }
          }
        });

        // Sort results alphabetically by username
        results.sort((a, b) => a.username.localeCompare(b.username, undefined, { sensitivity: 'base' }));

        if (active) {
          setFriendSearchResults(results);
          if (results.length === 0) {
            setFriendSearchMessage(lang === 'PT' ? 'Nenhum utilizador registado encontrado com esse nome.' : 'No registered users found with that username.');
          }
        }
      } catch (err) {
        console.warn("Search registered users query failed:", err);
        if (active) {
          setFriendSearchResults([]);
          setFriendSearchMessage(lang === 'PT' ? 'Nenhum utilizador registado encontrado com esse nome.' : 'No registered users found with that username.');
        }
      } finally {
        if (active) {
          setIsFriendSearching(false);
        }
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [friendSearchQuery, lang]);

  const handleFriendSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryStr = friendSearchQuery.trim();
    if (!queryStr) {
      setFriendSearchResults([]);
      setFriendSearchMessage('');
      return;
    }
    setIsFriendSearching(true);
    setFriendSearchMessage('');
    try {
      if (!isFirebaseConfigured || !db) {
        setFriendSearchResults([]);
        setFriendSearchMessage(lang === 'PT' ? 'Nenhum utilizador registado encontrado com esse nome.' : 'No registered users found with that username.');
        setIsFriendSearching(false);
        return;
      }
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const results: { id: string; username: string; points: number }[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const uname = data.username;
        if (typeof uname === 'string' && uname.trim().length > 0) {
          if (!docSnap.id.startsWith('mock_') && !docSnap.id.startsWith('local-user-')) {
            if (uname.toLowerCase().includes(queryStr.toLowerCase())) {
              results.push({
                id: docSnap.id,
                username: uname.trim(),
                points: typeof data.points === 'number' ? data.points : 0
              });
            }
          }
        }
      });
      results.sort((a, b) => a.username.localeCompare(b.username, undefined, { sensitivity: 'base' }));
      setFriendSearchResults(results);
      if (results.length === 0) {
        setFriendSearchMessage(lang === 'PT' ? 'Nenhum utilizador registado encontrado com esse nome.' : 'No registered users found with that username.');
      }
    } catch (err) {
      console.warn("Search registered users error:", err);
      setFriendSearchResults([]);
      setFriendSearchMessage(lang === 'PT' ? 'Nenhum utilizador registado encontrado com esse nome.' : 'No registered users found with that username.');
    } finally {
      setIsFriendSearching(false);
    }
  };

  const handleAddFriend = async (friendId: string, friendUsername: string) => {
    if (friendId === user.id) {
      triggerSelfPush(
        'Operação Inválida ❌',
        'Não te podes adicionar a ti próprio como amigo.',
        'system'
      );
      return;
    }

    const currentFriends = user.friends || [];
    if (currentFriends.includes(friendId)) return;

    if (user.isLoggedIn && !user.id.startsWith('local-user-')) {
      try {
        // First check if a request already exists between A and B
        const qExisting = query(
          collection(db, 'friend_requests'),
          where('senderId', '==', user.id),
          where('receiverId', '==', friendId),
          where('status', 'in', ['pending', 'accepted'])
        );
        const snap = await getDocs(qExisting);
        if (!snap.empty) {
          triggerSelfPush(
            'Pedido Pendente ⏳',
            `Já tens um pedido de amizade pendente ou ativo com ${friendUsername}.`,
            'system'
          );
          return;
        }

        // Add friend request document in Firestore
        await addDoc(collection(db, 'friend_requests'), {
          senderId: user.id,
          senderName: user.username,
          senderPoints: user.points,
          receiverId: friendId,
          receiverName: friendUsername,
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        // Add to local sent requests list
        setSentPendingRequests(prev => [...prev, friendId]);

        triggerSelfPush(
          'Pedido de Amizade Enviado! ✉️',
          `Pediste para adicionar ${friendUsername}. Aguarda a confirmação dele(a).`,
          'system'
        );
      } catch (err) {
        console.error("Error creating friend request:", err);
        // Fallback to local immediate add if there is a permission error or Firestore is offline
        const updatedFriends = [...currentFriends, friendId];
        setUser(prev => ({
          ...prev,
          friends: updatedFriends
        }));
        await setDoc(doc(db, 'users', user.id), {
          friends: updatedFriends
        }, { merge: true });
        triggerSelfPush(
          'Amigo Adicionado (Offline)! 🍻',
          `Adicionaste ${friendUsername} diretamente.`,
          'system'
        );
      }
    } else {
      const updatedFriends = [...currentFriends, friendId];
      setUser(prev => ({
        ...prev,
        friends: updatedFriends
      }));
      triggerSelfPush(
        'Amigo Adicionado (Local)! 🍻',
        `Adicionaste ${friendUsername} à tua lista local de amigos!`,
        'system'
      );
    }
  };

  const handleAcceptRequest = async (requestId: string, senderId: string, senderName: string) => {
    try {
      // 1. Add senderId to B's friends list
      const currentFriends = user.friends || [];
      if (!currentFriends.includes(senderId)) {
        const updatedFriends = [...currentFriends, senderId];
        setUser(prev => ({
          ...prev,
          friends: updatedFriends
        }));
        await setDoc(doc(db, 'users', user.id), {
          friends: updatedFriends
        }, { merge: true });
      }

      // 2. Update the request status to 'accepted'
      await setDoc(doc(db, 'friend_requests', requestId), {
        status: 'accepted'
      }, { merge: true });

      // 3. Remove from pending list locally
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));

      triggerSelfPush(
        'Pedido Aceite! 🍻',
        `Agora és amigo de ${senderName}!`,
        'system'
      );
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await setDoc(doc(db, 'friend_requests', requestId), {
        status: 'declined'
      }, { merge: true });
      
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      
      triggerSelfPush(
        'Pedido Recusado',
        'Recusaste o pedido de amizade.',
        'system'
      );
    } catch (err) {
      console.error("Error declining request:", err);
    }
  };

  const handleRemoveFriend = async (friendId: string, friendUsername: string) => {
    const currentFriends = user.friends || [];
    const updatedFriends = currentFriends.filter(id => id !== friendId);

    setUser(prev => ({
      ...prev,
      friends: updatedFriends
    }));

    if (user.isLoggedIn && !user.id.startsWith('local-user-')) {
      try {
        await setDoc(doc(db, 'users', user.id), {
          friends: updatedFriends
        }, { merge: true });

        // Clean up any friend requests in the background
        const qRequests = query(
          collection(db, 'friend_requests'),
          where('senderId', 'in', [user.id, friendId]),
          where('receiverId', 'in', [user.id, friendId])
        );
        const querySnapshot = await getDocs(qRequests);
        querySnapshot.forEach(async (docSnap) => {
          // Deleting is cleanest
          await setDoc(doc(db, 'friend_requests', docSnap.id), {
            status: 'deleted'
          }, { merge: true });
        });
        
        triggerSelfPush(
          'Amigo Removido',
          `Removeste ${friendUsername} da tua lista de amigos.`,
          'system'
        );
      } catch (err) {
        if (isPermissionError(err)) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
        }
        console.error("Error updating friends in Firestore:", err);
      }
    } else {
      triggerSelfPush(
        'Amigo Removido',
        `Removeste ${friendUsername} da lista local.`,
        'system'
      );
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteAccountErrorMsg('');
    try {
      const currentUid = auth.currentUser?.uid || user.id;
      const currentUsername = user.username;

      // 1. If Firebase is active and user is logged in, delete from Firestore
      if (isFirebaseConfigured && currentUid && !currentUid.startsWith('local-user-')) {
        // Delete user's document from 'users' collection
        try {
          await deleteDoc(doc(db, 'users', currentUid));
        } catch (uErr) {
          console.warn('Could not delete user document:', uErr);
        }

        // Delete friend requests where user is sender or receiver
        try {
          const qSender = query(collection(db, 'friend_requests'), where('senderId', '==', currentUid));
          const snapSender = await getDocs(qSender);
          const deleteSenderPromises = snapSender.docs.map(d => deleteDoc(doc(db, 'friend_requests', d.id)));
          await Promise.all(deleteSenderPromises);

          const qReceiver = query(collection(db, 'friend_requests'), where('receiverId', '==', currentUid));
          const snapReceiver = await getDocs(qReceiver);
          const deleteReceiverPromises = snapReceiver.docs.map(d => deleteDoc(doc(db, 'friend_requests', d.id)));
          await Promise.all(deleteReceiverPromises);
        } catch (fErr) {
          console.warn('Could not delete friend requests:', fErr);
        }

        // Delete notifications targeted to user
        try {
          if (currentUsername) {
            const qNotifs = query(collection(db, 'notifications'), where('recipientUsername', '==', currentUsername.toLowerCase()));
            const snapNotifs = await getDocs(qNotifs);
            const deleteNotifPromises = snapNotifs.docs.map(d => deleteDoc(doc(db, 'notifications', d.id)));
            await Promise.all(deleteNotifPromises);
          }
        } catch (nErr) {
          console.warn('Could not delete notifications:', nErr);
        }

        // Delete checkin notifications sent by user
        try {
          const qCheckinNotifs = query(collection(db, 'checkin_notifications'), where('userId', '==', currentUid));
          const snapCheckinNotifs = await getDocs(qCheckinNotifs);
          const deleteCheckinNotifsPromises = snapCheckinNotifs.docs.map(d => deleteDoc(doc(db, 'checkin_notifications', d.id)));
          await Promise.all(deleteCheckinNotifsPromises);
        } catch (cnErr) {
          console.warn('Could not delete checkin notifications:', cnErr);
        }

        // Delete ratings authored by user
        try {
          const qRatings = query(collection(db, 'ratings'), where('userName', '==', currentUsername));
          const snapRatings = await getDocs(qRatings);
          const deleteRatingsPromises = snapRatings.docs.map(d => deleteDoc(doc(db, 'ratings', d.id)));
          await Promise.all(deleteRatingsPromises);
        } catch (rErr) {
          console.warn('Could not delete ratings:', rErr);
        }

        // Delete Firebase Auth User account
        if (auth.currentUser) {
          try {
            await deleteUser(auth.currentUser);
          } catch (authErr: any) {
            console.warn('Auth deleteUser error (might need reauth or already signed out):', authErr);
            // Fallback to signOut if token is stale
            try {
              await signOut(auth);
            } catch (soErr) {}
          }
        }
      }

      // 2. Clear all local user cache and localStorage keys
      const prefix = `hop_${currentUid}_`;
      try {
        localStorage.removeItem(prefix + 'points');
        localStorage.removeItem(prefix + 'favorites');
        localStorage.removeItem(prefix + 'friends');
        localStorage.removeItem(prefix + 'checkedInFestivals');
        localStorage.removeItem(prefix + 'stamps');
        localStorage.removeItem(prefix + 'lastCheckinDates');
        localStorage.removeItem(prefix + 'tenStampsDates');
        localStorage.removeItem(prefix + 'checkinHistory');
        localStorage.removeItem(prefix + 'shareCheckinsEnabled');
        localStorage.removeItem(prefix + 'user_language');
        localStorage.removeItem('hop_user_1_stamps');
        localStorage.removeItem('hop_user_1_lastCheckinDates');
        localStorage.removeItem('hop_user_1_tenStampsDates');
        localStorage.removeItem('hop_user_1_checkinHistory');
        localStorage.removeItem('hop_share_checkins_enabled');
        localStorage.removeItem('hop_ratings_history');
      } catch (lsErr) {
        console.warn('LocalStorage clear error:', lsErr);
      }

      // 3. Reset User Profile to fresh initial guest state
      const initialLevel = getLevelDetails(0, lang);
      setUser({
        id: 'user_guest',
        email: '',
        username: '',
        avatarUrl: initialLevel.avatarUrl,
        points: 0,
        level: initialLevel.title,
        stamps: {},
        favorites: [],
        friends: [],
        purchasedEventTickets: [],
        biometricsEnabled: true,
        isLoggedIn: false,
        checkedInBars: [],
        lastCheckinDates: {},
        tenStampsDates: {},
        checkinHistory: [],
        checkedInFestivals: [],
        shareCheckinsEnabled: true,
        notificationsEnabled: true,
        user_language: lang
      });

      setShowDeleteAccountModal(false);
      setIsDeletingAccount(false);

      triggerSelfPush(
        t('deleteAccountSuccessTitle', lang),
        t('deleteAccountSuccessMsg', lang),
        'system'
      );
    } catch (err: any) {
      console.error('Fatal error deleting account:', err);
      setIsDeletingAccount(false);
      setDeleteAccountErrorMsg(err?.message || t('deleteAccountError', lang));
    }
  };
  
  const [applePayItem, setApplePayItem] = useState<{ name: string; price: number } | null>(null);
  const [activeBarToReview, setActiveBarToReview] = useState<Bar | null>(null);

  // Reviews entry
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewBeerStyle, setReviewBeerStyle] = useState('');
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [editBeerStyle, setEditBeerStyle] = useState('');
  const [ratingsHistory, setRatingsHistory] = useState<any[]>([]);

  // Load reviews from Firestore
  useEffect(() => {
    let active = true;

    // Define beautiful default fallback ratings in case Firestore has permission errors, is empty, or isn't configured yet.
    const DEFAULT_RATINGS = [
      {
        id: 'def_1',
        barId: 'catraio',
        userId: 'user_default_1',
        userName: 'João Cervejeiro',
        stars: 5,
        texto_rating: 'O melhor bar de cerveja artesanal do Porto! Excelente seleção de torneiras e garrafas.',
        tipo_cerveja: 'IPA',
        createdAt: new Date('2026-06-15T18:30:00Z').getTime()
      },
      {
        id: 'def_2',
        barId: 'catraio',
        userId: 'user_default_2',
        userName: 'Ana Silva',
        stars: 4,
        texto_rating: 'Muito bom ambiente e equipa super simpática. A esplanada é óptima nos dias de calor.',
        tipo_cerveja: 'Stout',
        createdAt: new Date('2026-06-18T20:15:00Z').getTime()
      },
      {
        id: 'def_3',
        barId: 'musa-virtudes',
        userId: 'user_default_3',
        userName: 'Pedro Costa',
        stars: 5,
        texto_rating: 'A melhor vista sobre o Douro acompanhada de uma boa Musa. Recomendo imenso!',
        tipo_cerveja: 'NEIPA',
        createdAt: new Date('2026-06-20T19:00:00Z').getTime()
      },
      {
        id: 'def_4',
        barId: 'armazem-da-cerveja',
        userId: 'user_default_4',
        userName: 'Rita Santos',
        stars: 5,
        texto_rating: 'Seleção incrível, sempre novidades nacionais e importadas de topo. O staff sabe muito de cerveja!',
        tipo_cerveja: 'Sour',
        createdAt: new Date('2026-06-25T17:45:00Z').getTime()
      },
      {
        id: 'def_5',
        barId: 'gulden-draak-porto',
        userId: 'user_default_5',
        userName: 'Miguel Pereira',
        stars: 4,
        texto_rating: 'Para quem adora cervejas belgas, este é o paraíso. Excelente espaço no Porto.',
        tipo_cerveja: 'Belgian Strong Ale',
        createdAt: new Date('2026-06-28T21:30:00Z').getTime()
      },
      {
        id: 'def_6',
        barId: 'baobab-porto',
        userId: 'user_default_6',
        userName: 'Sofia Lima',
        stars: 5,
        texto_rating: 'Um segredo bem guardado no Porto. Seleção artesanal fantástica e ambiente descontraído.',
        tipo_cerveja: 'Saison',
        createdAt: new Date('2026-07-01T16:00:00Z').getTime()
      },
      {
        id: 'def_7',
        barId: 'fabrica-da-picaria',
        userId: 'user_default_7',
        userName: 'Rui Fernandes',
        stars: 4,
        texto_rating: 'Excelente cerveja fabricada no próprio local. Vale muito a pena provar a picaria.',
        tipo_cerveja: 'Pilsner',
        createdAt: new Date('2026-07-02T19:15:00Z').getTime()
      }
    ];

    const processAndSetRatings = (loadedRatings: any[]) => {
      // Filter local ratings history to ONLY the current user's ratings (for "O meu histórico de avaliações")
      const userRatings = user.isLoggedIn && user.id 
        ? loadedRatings.filter(rat => rat.userId === user.id)
        : [];
      
      setRatingsHistory(userRatings);
      
      // Update points to match user's own reviews count
      if (user.isLoggedIn) {
        setUser(prev => ({ ...prev, points: userRatings.length }));
      }
      
      // Save them as 'reviews' fields inside the bars state!
      setBars(prevBars => {
        // Reset/Clean bars
        const resetBars = BARS_DATA.map(b => {
          const prevBar = prevBars.find(pb => pb.id === b.id);
          return {
            ...b,
            rating: 0,
            reviewsCount: 0,
            reviews: [],
            taps: prevBar && prevBar.taps !== undefined ? prevBar.taps : getDeterministicBaseTaps(b.id)
          };
        });

        // Process loaded ratings
        loadedRatings.forEach(rat => {
          const barObj = resetBars.find(b => b.id === rat.barId);
          if (barObj) {
            const barReview: Review = {
              id: rat.id,
              userId: rat.userId,
              userName: rat.userName || 'utilizador',
              rating: rat.stars,
              comment: rat.texto_rating,
              beerStyleReviewed: rat.tipo_cerveja,
              date: rat.createdAt ? new Date(rat.createdAt).toLocaleDateString('pt-PT') : 'Agora'
            };
            if (!barObj.reviews) barObj.reviews = [];
            barObj.reviews.push(barReview);
            barObj.reviewsCount += 1;
          }
        });

        // Recalculate average ratings
        return resetBars.map(barObj => {
          if (barObj.reviewsCount > 0 && barObj.reviews) {
            const sum = barObj.reviews.reduce((acc, r) => acc + r.rating, 0);
            barObj.rating = parseFloat((sum / barObj.reviewsCount).toFixed(1));
          } else {
            barObj.rating = 0;
          }
          return barObj;
        });
      });
    };

    if (isLocalAuthFallback) {
      processAndSetRatings(DEFAULT_RATINGS);
      return () => {
        active = false;
      };
    }

    const ratingsRef = collection(db, 'ratings');
    const q = query(ratingsRef, orderBy('createdAt', 'desc'));
    
    getDocs(q).then((querySnapshot) => {
      if (!active) return;
      const loadedRatings: any[] = [];
      querySnapshot.forEach((doc) => {
        loadedRatings.push({ id: doc.id, ...doc.data() });
      });

      // If database has no reviews yet, load default fallback reviews
      if (loadedRatings.length === 0) {
        processAndSetRatings(DEFAULT_RATINGS);
      } else {
        processAndSetRatings(loadedRatings);
      }
    }).catch(err => {
      if (isPermissionError(err)) {
        handleFirestoreError(err, OperationType.LIST, 'ratings');
      }
      console.warn("Error loading reviews from Firestore, falling back to local defaults:", err);
      if (active) {
        processAndSetRatings(DEFAULT_RATINGS);
      }
    });

    return () => {
      active = false;
    };
  }, [user.isLoggedIn, user.id]);

  // Particles & Gamification trigger states
  const [animatingStampBarId, setAnimatingStampBarId] = useState<string | null>(null);
  const [newlyAddedStampIndex, setNewlyAddedStampIndex] = useState<number | null>(null);

  // Listen to Firebase Authentication State changes
  useEffect(() => {
    if (isLocalAuthFallback) return;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Pre-populate with localStorage cache or default values
        const cacheKeyPrefix = `hop_user_${firebaseUser.uid}_`;
        let savedPoints = 0;
        let savedFavorites: string[] = ['catraio'];
        let savedFriends: string[] = [];
        let savedFestivals: string[] = [];

        const cachedPoints = localStorage.getItem(cacheKeyPrefix + 'points');
        const cachedFavs = localStorage.getItem(cacheKeyPrefix + 'favorites');
        const cachedFrs = localStorage.getItem(cacheKeyPrefix + 'friends');
        const cachedFests = localStorage.getItem(cacheKeyPrefix + 'checkedInFestivals');

        let savedStamps = { 'catraio': 2, 'cerveteca': 1 };
        let savedLastCheckinDates = {};
        let savedTenStampsDates = {};
        let savedCheckinHistory = [];

        const cachedStamps = localStorage.getItem(cacheKeyPrefix + 'stamps');
        const cachedCheckins = localStorage.getItem(cacheKeyPrefix + 'lastCheckinDates');
        const cachedTenStamps = localStorage.getItem(cacheKeyPrefix + 'tenStampsDates');
        const cachedHistory = localStorage.getItem(cacheKeyPrefix + 'checkinHistory');
        const cachedLang = localStorage.getItem(cacheKeyPrefix + 'user_language');

        let userLangVal: Language = lang;
        if (cachedLang === 'PT' || cachedLang === 'EN') {
          userLangVal = cachedLang as Language;
          setLang(userLangVal);
        }

        if (cachedPoints !== null) savedPoints = parseInt(cachedPoints, 10) || 0;
        if (cachedFavs !== null) {
          try { savedFavorites = JSON.parse(cachedFavs); } catch (e) {}
        }
        if (cachedFrs !== null) {
          try { savedFriends = JSON.parse(cachedFrs); } catch (e) {}
        }
        if (cachedFests !== null) {
          try { savedFestivals = JSON.parse(cachedFests); } catch (e) {}
        }
        if (cachedStamps !== null) {
          try { savedStamps = JSON.parse(cachedStamps); } catch (e) {}
        }
        if (cachedCheckins !== null) {
          try { savedLastCheckinDates = JSON.parse(cachedCheckins); } catch (e) {}
        }
        if (cachedTenStamps !== null) {
          try { savedTenStampsDates = JSON.parse(cachedTenStamps); } catch (e) {}
        }
        if (cachedHistory !== null) {
          try { savedCheckinHistory = JSON.parse(cachedHistory); } catch (e) {}
        }

        let savedShareCheckins = true;
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            savedPoints = typeof data.points === 'number' ? data.points : 0;
            if (typeof data.shareCheckinsEnabled === 'boolean') {
              savedShareCheckins = data.shareCheckinsEnabled;
            }
            if (Array.isArray(data.favorites)) {
              savedFavorites = data.favorites;
            }
            if (Array.isArray(data.friends)) {
              savedFriends = data.friends;
            }
            if (Array.isArray(data.checkedInFestivals)) {
              savedFestivals = data.checkedInFestivals;
            }
            if (Array.isArray(data.checkinHistory)) {
              savedCheckinHistory = data.checkinHistory;
              localStorage.setItem(cacheKeyPrefix + 'checkinHistory', JSON.stringify(savedCheckinHistory));
            }
            if (data.user_language === 'PT' || data.user_language === 'EN') {
              userLangVal = data.user_language as Language;
              setLang(userLangVal);
              localStorage.setItem('hop_app_language', userLangVal);
              localStorage.setItem(cacheKeyPrefix + 'user_language', userLangVal);
            }
            // Update cache with fresh data from server
            localStorage.setItem(cacheKeyPrefix + 'points', String(savedPoints));
            localStorage.setItem(cacheKeyPrefix + 'favorites', JSON.stringify(savedFavorites));
            localStorage.setItem(cacheKeyPrefix + 'friends', JSON.stringify(savedFriends));
            localStorage.setItem(cacheKeyPrefix + 'checkedInFestivals', JSON.stringify(savedFestivals));
            localStorage.setItem(cacheKeyPrefix + 'shareCheckinsEnabled', String(savedShareCheckins));
          } else {
            // Document doesn't exist, create it with initial points of 0
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'utilizador',
              points: savedPoints,
              favorites: savedFavorites,
              friends: savedFriends,
              checkedInFestivals: savedFestivals,
              shareCheckinsEnabled: savedShareCheckins,
              user_language: userLangVal,
              createdAt: new Date().toISOString()
            }, { merge: true });
          }
        } catch (err) {
          if (isPermissionError(err)) {
            handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
          }
          console.warn("Could not fetch user profile from Firestore (using offline cache):", err);
        }

        setUser(prev => ({
          ...prev,
          id: firebaseUser.uid,
          email: firebaseUser.email || 'e-mail',
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'utilizador',
          points: savedPoints,
          favorites: savedFavorites,
          friends: savedFriends,
          checkedInFestivals: savedFestivals,
          stamps: savedStamps,
          lastCheckinDates: savedLastCheckinDates,
          tenStampsDates: savedTenStampsDates,
          checkinHistory: savedCheckinHistory,
          shareCheckinsEnabled: savedShareCheckins,
          user_language: userLangVal,
          isLoggedIn: true
        }));
      } else {
        setUser(prev => ({
          ...prev,
          isLoggedIn: false
        }));
      }
    });
    return () => unsubscribe();
  }, [isLocalAuthFallback]);

  // Real-time GPS location tracking when logged in
  useEffect(() => {
    if (!user.isLoggedIn) {
      setGpsAccuracy(null);
      setGpsError(null);
      return;
    }

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('O teu telemóvel/navegador não suporta geolocalização.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const preciseLat = position.coords.latitude;
        const preciseLng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        setUserLocation({
          latitude: preciseLat,
          longitude: preciseLng
        });
        setGpsAccuracy(accuracy);
        setGpsError(null);
      },
      (error) => {
        let errorMsg = `Não foi possível obter a tua localização em tempo real: ${error.message}`;
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Para fazeres check-in, por favor ativa o GPS nas definições do teu navegador/telemóvel.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'A informação do GPS em tempo real está indisponível de momento.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'O tempo limite do GPS expirou ao tentar obter a localização em tempo real.';
        }
        setGpsError(errorMsg);
        triggerSelfPush(
          'Erro de GPS ❌',
          errorMsg,
          'system'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Clean up to stop GPS watch immediately on logout or unmount
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [user.isLoggedIn]);

  // Manual GPS Refresh ensuring real-time non-cached reading
  const handleManualGpsRefresh = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      setIsGpsRefreshing(true);
      triggerSelfPush(
        'A obter GPS... 🛰️',
        'A ler coordenadas do GPS nativo com precisão máxima...',
        'system'
      );
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const preciseLat = position.coords.latitude;
          const preciseLng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          setUserLocation({
            latitude: preciseLat,
            longitude: preciseLng
          });
          setGpsAccuracy(accuracy);
          setGpsError(null);
          setIsGpsRefreshing(false);

          triggerSelfPush(
            'GPS Sincronizado! 📡',
            'Coordenadas atualizadas com sucesso em tempo real.',
            'system'
          );
        },
        (error) => {
          let errorMsg = `Não foi possível obter a tua localização: ${error.message}`;
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = 'Para fazeres check-in, por favor ativa o GPS nas definições do teu navegador/telemóvel.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = 'A informação do GPS está indisponível de momento.';
          } else if (error.code === error.TIMEOUT) {
            errorMsg = 'O tempo limite do GPS expirou. Tenta novamente num local com melhor sinal.';
          }
          setGpsError(errorMsg);
          setIsGpsRefreshing(false);
          triggerSelfPush(
            'Erro de GPS ❌',
            errorMsg,
            'system'
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      triggerSelfPush(
        'GPS Indisponível ❌',
        'O teu telemóvel/navegador não suporta geolocalização.',
        'system'
      );
    }
  };



  // Sync user changes back to localStorage cache to guarantee extreme offline robustness
  useEffect(() => {
    if (user.isLoggedIn && user.id) {
      const cacheKeyPrefix = `hop_user_${user.id}_`;
      localStorage.setItem(cacheKeyPrefix + 'points', String(user.points || 0));
      localStorage.setItem(cacheKeyPrefix + 'favorites', JSON.stringify(user.favorites || []));
      localStorage.setItem(cacheKeyPrefix + 'friends', JSON.stringify(user.friends || []));
      localStorage.setItem(cacheKeyPrefix + 'stamps', JSON.stringify(user.stamps || {}));
      localStorage.setItem(cacheKeyPrefix + 'lastCheckinDates', JSON.stringify(user.lastCheckinDates || {}));
      localStorage.setItem(cacheKeyPrefix + 'tenStampsDates', JSON.stringify(user.tenStampsDates || {}));
      localStorage.setItem(cacheKeyPrefix + 'checkinHistory', JSON.stringify(user.checkinHistory || []));
    } else {
      localStorage.setItem('hop_user_1_stamps', JSON.stringify(user.stamps || {}));
      localStorage.setItem('hop_user_1_lastCheckinDates', JSON.stringify(user.lastCheckinDates || {}));
      localStorage.setItem('hop_user_1_tenStampsDates', JSON.stringify(user.tenStampsDates || {}));
      localStorage.setItem('hop_user_1_checkinHistory', JSON.stringify(user.checkinHistory || []));
    }
  }, [user.id, user.points, user.favorites, user.friends, user.stamps, user.lastCheckinDates, user.tenStampsDates, user.checkinHistory, user.isLoggedIn]);

  // Auto layout triggers & alerts
  useEffect(() => {
    // Sync points with Level Title
    const lvl = getLevelDetails(user.points).title;
    if (lvl !== user.level) {
      setUser(prev => ({ ...prev, level: lvl }));
    }
  }, [user.points]);

  // Load spots' TAPS from Firestore (real-time) and localStorage
  useEffect(() => {
    let active = true;
    
    // First, load from localStorage to be instantly fast and robust
    setBars(prevBars => prevBars.map(b => {
      const cached = localStorage.getItem(`spot_taps_${b.id}`);
      if (cached !== null) {
        const parsed = parseInt(cached, 10);
        return { ...b, taps: isNaN(parsed) ? 0 : parsed };
      }
      return { ...b, taps: 0 };
    }));

    let unsubscribe: (() => void) | undefined;

    // Then, listen to real-time changes in Firestore
    if (!isLocalAuthFallback) {
      try {
        unsubscribe = onSnapshot(collection(db, 'spots_taps'), (querySnapshot) => {
          if (!active) return;
          const firestoreTaps: Record<string, number> = {};
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (typeof data.taps === 'number') {
              firestoreTaps[doc.id] = data.taps;
            }
          });

          setBars(prevBars => prevBars.map(b => {
            if (firestoreTaps[b.id] !== undefined) {
              // Also update localStorage cache
              localStorage.setItem(`spot_taps_${b.id}`, String(firestoreTaps[b.id]));
              return { ...b, taps: firestoreTaps[b.id] };
            }
            return { ...b, taps: b.taps !== undefined ? b.taps : 0 };
          }));
        }, (err) => {
          console.warn("Could not load spots taps from Firestore, using local cached taps:", err);
        });
      } catch (err) {
        console.warn("Error setting up onSnapshot for spots_taps:", err);
      }
    }

    return () => {
      active = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isLocalAuthFallback]);

  // Mark all notifications as read when the user views the profile/notifications tab after a brief delay
  useEffect(() => {
    if (activeTab === 'profile') {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Synchronize simulated user coordinates when zone filters change
  useEffect(() => {
    if (selectedZone === 'All') {
      // Default / All: Porto center is a great anchor
      setUserLocation({ latitude: 41.1524, longitude: -8.6186 });
    } else {
      const barInZone = bars.find(b => b.zone === selectedZone);
      if (barInZone && barInZone.latitude && barInZone.longitude) {
        setUserLocation({ latitude: barInZone.latitude, longitude: barInZone.longitude });
      }
    }
  }, [selectedZone, bars]);

  // Helper zones and counts computed dynamically from the current bars list
  const { zoneCounts, activeZones } = React.useMemo(() => {
    const counts: Record<string, number> = {};
    bars.forEach(b => {
      if (b.zone) {
        counts[b.zone] = (counts[b.zone] || 0) + 1;
      }
    });
    // Define a solid regional presentation order
    const defaultOrder = ['Porto', 'Norte', 'Centro', 'Lisboa', 'Açores', 'Madeira', 'Sul'];
    // Filter and keep only those that actually exist in current spots
    const uniqueFromBars = Array.from(new Set(bars.map(b => b.zone as string))).filter(Boolean) as string[];
    const ordered = defaultOrder.filter(z => uniqueFromBars.includes(z));
    // Any remaining custom zones not in defaultOrder can be appended
    uniqueFromBars.forEach(z => {
      if (!ordered.includes(z)) {
        ordered.push(z);
      }
    });
    return { zoneCounts: counts, activeZones: ordered };
  }, [bars]);

  // Synchronize URL on initial load and handle browser back/forward (popstate)
  useEffect(() => {
    const handleUrlRoute = () => {
      const pathname = window.location.pathname;
      const parsed = parseRoute(pathname, bars, activeZones);
      const activeLang = parsed.lang || lang;
      
      if (parsed.lang && parsed.lang !== lang) {
        setLang(parsed.lang);
      }

      if (parsed.bar) {
        setSelectedBar(parsed.bar);
        if (parsed.bar.zone) {
          setSelectedZone(parsed.bar.zone);
        }
        if (parsed.bar.latitude && parsed.bar.longitude) {
          setUserLocation({ latitude: parsed.bar.latitude, longitude: parsed.bar.longitude });
        }
        updateDynamicMetaTags(parsed.bar, parsed.bar.zone, activeLang);
      } else if (parsed.zone || parsed.citySlug) {
        setSelectedBar(null);
        if (parsed.zone) {
          setSelectedZone(parsed.zone);
        }
        const coords = (parsed.citySlug && CITY_COORDINATES[parsed.citySlug]) || 
                       (parsed.zone && bars.find(b => b.zone === parsed.zone)) || 
                       null;
        if (coords && 'latitude' in coords && 'longitude' in coords && coords.latitude && coords.longitude) {
          setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
        }
        updateDynamicMetaTags(null, parsed.zone || parsed.citySlug, activeLang);
      } else {
        // Root / or non-matching path
        setSelectedBar(null);
        updateDynamicMetaTags(null, null, activeLang);
      }
    };

    handleUrlRoute();

    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, [bars, activeZones, lang]);

  // Helper styles extracted
  const stylesList = Array.from(new Set(BARS_DATA.flatMap(b => b.styles)));

  // Chronological list of checkins for the Profile tab
  const checkinList = React.useMemo(() => {
    if (user.checkinHistory && user.checkinHistory.length > 0) {
      return user.checkinHistory;
    }
    const synthesized: Array<{ id: string; barId: string; barName: string; location: string; date: string }> = [];
    const entries = Object.entries(user.lastCheckinDates || {});
    if (entries.length > 0) {
      (Object.entries(user.lastCheckinDates || {}) as Array<[string, string]>).forEach(([bId, dateStr]) => {
        const spot = bars.find(b => b.id === bId);
        if (spot) {
          synthesized.push({
            id: `hist_${bId}_${dateStr}`,
            barId: spot.id,
            barName: spot.name,
            location: spot.zone,
            date: dateStr
          });
        }
      });
    } else if (user.checkedInBars && user.checkedInBars.length > 0) {
      user.checkedInBars.forEach(bId => {
        const spot = bars.find(b => b.id === bId);
        if (spot) {
          synthesized.push({
            id: `hist_${bId}`,
            barId: spot.id,
            barName: spot.name,
            location: spot.zone,
            date: '2026-08-01'
          });
        }
      });
    } else {
      if (user.stamps['catraio']) {
        const cat = bars.find(b => b.id === 'catraio');
        if (cat) {
          synthesized.push({
            id: 'hist_init_catraio_1',
            barId: cat.id,
            barName: cat.name,
            location: cat.zone,
            date: '2026-08-01'
          });
          synthesized.push({
            id: 'hist_init_catraio_2',
            barId: cat.id,
            barName: cat.name,
            location: cat.zone,
            date: '2026-07-28'
          });
        }
      }
      if (user.stamps['cerveteca']) {
        const cer = bars.find(b => b.id === 'cerveteca');
        if (cer) {
          synthesized.push({
            id: 'hist_init_cerveteca_1',
            barId: cer.id,
            barName: cer.name,
            location: cer.zone,
            date: '2026-07-25'
          });
        }
      }
    }
    return synthesized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [user.checkinHistory, user.lastCheckinDates, user.checkedInBars, user.stamps, bars]);

  // Simulated push trigger
  const triggerSelfPush = (title: string, body: string, type: HopNotification['type'], titleEn?: string, bodyEn?: string) => {
    const freshPush: HopNotification = {
      id: `push_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      titleEn: titleEn || title,
      body,
      bodyEn: bodyEn || body,
      timestamp: lang === 'PT' ? 'Agora mesmo' : 'Just now',
      timestampEn: 'Just now',
      createdAt: Date.now(),
      isRead: false,
      type
    };
    setNotifications(prev => [freshPush, ...prev]);
    setActivePush(freshPush);
    // Expand Dynamic Island push layout, then restore after 4.5 seconds
    setTimeout(() => {
      setActivePush(null);
    }, 4500);
  };

  // Toggle favorite bar
  const toggleFavorite = async (barId: string) => {
    const isFav = user.favorites.includes(barId);
    let newFavs: string[];
    if (isFav) {
      newFavs = user.favorites.filter(id => id !== barId);
    } else {
      newFavs = [...user.favorites, barId];
      triggerSelfPush(
        'Favorito Registado!',
        'Adicionaste uma nova morada nobre de cerveja aos teus favoritos!',
        'reward'
      );
    }
    setUser(prev => ({ ...prev, favorites: newFavs }));

    if (!isLocalAuthFallback && auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', user.id), { favorites: newFavs }, { merge: true });
      } catch (err) {
        if (isPermissionError(err)) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
        }
        console.error("Error saving favorites to Firestore:", err);
      }
    }
  };

  const isSpotStampsBlocked = (barId: string) => {
    const stamps = user.stamps[barId] || 0;
    if (stamps < 10) return false;
    
    const todayLocal = new Date();
    const year = todayLocal.getFullYear();
    const month = String(todayLocal.getMonth() + 1).padStart(2, '0');
    const day = String(todayLocal.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    const tenStampDate = user.tenStampsDates ? user.tenStampsDates[barId] : undefined;
    return tenStampDate !== todayStr;
  };

  // Dispatch check-in notification to user's friends if option is enabled
  const sendFriendCheckinNotification = async (locationName: string, locationType: 'spot' | 'festival') => {
    if (user.shareCheckinsEnabled === false) {
      console.log('Check-in sharing is disabled by user settings.');
      return;
    }

    const currentFriends = user.friends || [];
    if (currentFriends.length === 0) return;

    if (user.isLoggedIn && !user.id.startsWith('local-user-')) {
      try {
        await addDoc(collection(db, 'checkin_notifications'), {
          senderId: user.id,
          senderName: user.username,
          locationName,
          locationType,
          targetFriendIds: currentFriends,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Error posting check-in notification to Firestore:", err);
      }
    }
  };

  // Check in at bar with GPS 100m Verification and 8-Bit Staff PIN Validation
  const initiateCheckin = (bar: Bar) => {
    const todayLocal = new Date();
    const year = todayLocal.getFullYear();
    const month = String(todayLocal.getMonth() + 1).padStart(2, '0');
    const day = String(todayLocal.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    if (isSpotStampsBlocked(bar.id)) {
      triggerSelfPush(
        lang === 'PT' ? 'Check-in Bloqueado! 🔒' : 'Check-in Locked! 🔒',
        lang === 'PT'
          ? `Já atingiste o limite de 10 check-ins para o spot ${bar.name}. Conquistaste este spot com sucesso!`
          : `You reached the 10 check-ins limit for ${bar.name}. You have fully conquered this spot!`,
        'system'
      );
      return;
    }

    const lastCheckinDate = user.lastCheckinDates ? user.lastCheckinDates[bar.id] : undefined;
    if (lastCheckinDate === todayStr) {
      triggerSelfPush(
        lang === 'PT' ? 'Check-in já efetuado hoje! ⛔' : 'Already Checked In Today! ⛔',
        t('alreadyCheckedInToday', lang),
        'system'
      );
      return;
    }

    if (typeof window !== 'undefined' && navigator.geolocation) {
      triggerSelfPush(
        lang === 'PT' ? 'A obter GPS... 🛰️' : 'Getting GPS... 🛰️',
        t('verifyingGps', lang),
        'system'
      );

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const preciseLat = position.coords.latitude;
          const preciseLng = position.coords.longitude;

          // Atualizar o estado global da localização com as coordenadas reais lidas pelo GPS
          setUserLocation({
            latitude: preciseLat,
            longitude: preciseLng
          });

          const exactDistance = getHaversineDistanceInMeters(preciseLat, preciseLng, bar.latitude, bar.longitude);
          const isWithinRange = exactDistance <= 100; // 100m GPS radius restriction per anti-fraud specification

          if (!isWithinRange) {
            triggerSelfPush(
              lang === 'PT' ? 'Fora do Raio de Check-in (100m)! 📍' : 'Outside Check-in Range (100m)! 📍',
              lang === 'PT'
                ? `Estás a ${Math.round(exactDistance)} metros deste spot. Para validares o check-in e consumo com o PIN do barman deves encontrar-te a menos de 100 metros.`
                : `You are ${Math.round(exactDistance)} meters away. You must be within 100 meters of the spot to validate with bartender PIN.`,
              'system'
            );
            return;
          }

          // Trigger visual button feedback
          setAnimatingCheckinBarId(bar.id);
          setTimeout(() => setAnimatingCheckinBarId(null), 1500);

          // Open the 8-Bit Retro PIN Keypad Modal!
          setPinModalSpot(bar);
        },
        (error) => {
          let errorMsg = `Não foi possível obter a tua localização do GPS: ${error.message}`;
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = lang === 'PT' 
              ? 'Para fazeres check-in com validação por PIN, ativa o GPS nas definições do teu dispositivo/navegador.'
              : 'To check in with PIN validation, please enable GPS in your device/browser settings.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = lang === 'PT'
              ? 'A informação do GPS está indisponível de momento. Tenta novamente num local com céu aberto.'
              : 'GPS information is currently unavailable. Try again in an open area.';
          } else if (error.code === error.TIMEOUT) {
            errorMsg = lang === 'PT'
              ? 'O tempo limite do GPS expirou. Tenta novamente.'
              : 'GPS request timed out. Please try again.';
          }
          triggerSelfPush(
            'Erro de GPS ❌',
            errorMsg,
            'system'
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // Fallback open PIN modal if navigator geolocation is not available
      setPinModalSpot(bar);
    }
  };

  // Callback after bartender/staff enters valid 4-digit PIN in RetroPinModal
  const handlePinCheckinSuccess = async (bar: Bar, enteredPin: string) => {
    const todayLocal = new Date();
    const year = todayLocal.getFullYear();
    const month = String(todayLocal.getMonth() + 1).padStart(2, '0');
    const day = String(todayLocal.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Check if this is the first time the user checks in at this spot
    const hasCheckedInBefore = (user.checkedInBars && user.checkedInBars.includes(bar.id)) ||
      (user.stamps && (user.stamps[bar.id] || 0) > 0) ||
      (user.checkinHistory && user.checkinHistory.some(ch => ch.barId === bar.id));
    const isFirstCheckinAtSpot = !hasCheckedInBefore;
    const firstCheckinText = lang === 'PT' ? 'NOVO LOCAL DESCOBERTO. HOP ON!' : 'NEW SPOT DISCOVERED. HOP ON!';

    // Award stamps and points
    const currentStamps = user.stamps[bar.id] || 0;
    const nextStamps = currentStamps + 1;
    const isTenthStamp = nextStamps >= 10;
    
    let alertMsg = lang === 'PT'
      ? `Check-in com PIN validado! Ganhaste +1 ponto HOP e +1 selo no spot ${bar.name}.`
      : `PIN check-in validated! You earned +1 HOP point and +1 stamp at ${bar.name}.`;

    if (isTenthStamp) {
      alertMsg = lang === 'PT'
        ? `Check-in com PIN efetuado! Conquistaste os 10 check-ins no spot ${bar.name}! Spot concluído com distinção! 🏆`
        : `PIN check-in validated! You completed all 10 check-ins at ${bar.name}! Spot conquered with distinction! 🏆`;
    }

    // 1. Record in Firestore 'checkins' collection for audit and 24h lockout
    if (user.isLoggedIn && !user.id.startsWith('local-user-')) {
      try {
        await addDoc(collection(db, 'checkins'), {
          userId: user.id,
          spotId: bar.id,
          spotName: bar.name,
          dateString: todayStr,
          timestamp: serverTimestamp()
        });
      } catch (cerr) {
        console.warn('Could not record checkin in Firestore checkins collection:', cerr);
      }
    }

    // 2. Save the updated points to the user document in Firestore if using cloud auth
    if (!isLocalAuthFallback && auth.currentUser) {
      try {
        const newPoints = (user.points || 0) + 1;
        await setDoc(doc(db, 'users', user.id), { points: newPoints }, { merge: true });
      } catch (uerr) {
        if (isPermissionError(uerr)) {
          handleFirestoreError(uerr, OperationType.WRITE, `users/${user.id}`);
        }
        console.error('Error updating user points in Firestore:', uerr);
      }
    }

    // 3. Save/Increment spot's TAPS & totalCheckins in Firestore and update state
    const currentBarTaps = bar.taps || getDeterministicBaseTaps(bar.id);
    const newBarTaps = currentBarTaps + 1;

    // Track spot check-in in Firebase Analytics & Firestore
    trackSpotCheckin(bar, { id: user.id, username: user.username }, isTenthStamp, 1);

    if (!isLocalAuthFallback && auth.currentUser) {
      try {
        await setDoc(doc(db, 'spots_taps', bar.id), { 
          taps: newBarTaps,
          totalCheckins: newBarTaps 
        }, { merge: true });
      } catch (terr) {
        console.error('Error updating spot taps in Firestore:', terr);
      }
    }
    localStorage.setItem(`spot_taps_${bar.id}`, String(newBarTaps));
    setBars(prevBars => prevBars.map(b => b.id === bar.id ? { ...b, taps: newBarTaps, totalCheckins: newBarTaps } : b));

    // 4. Update local user profile state
    setUser(prev => {
      const nextStampsRecord = { ...prev.stamps };
      const nextTenStampsDates = { ...(prev.tenStampsDates || {}) };

      if (isTenthStamp) {
        nextStampsRecord[bar.id] = 10;
        nextTenStampsDates[bar.id] = todayStr;
      } else {
        nextStampsRecord[bar.id] = nextStamps;
      }

      const nextCheckedIn = prev.checkedInBars.includes(bar.id)
        ? prev.checkedInBars
        : [...prev.checkedInBars, bar.id];

      const nextLastCheckinDates = {
        ...(prev.lastCheckinDates || {}),
        [bar.id]: todayStr
      };

      const newCheckinLogId = `checkin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newCheckinLog = {
        id: newCheckinLogId,
        barId: bar.id,
        barName: bar.name,
        location: bar.zone,
        date: todayStr,
        timestamp: new Date().toISOString()
      };

      const nextCheckinHistory = [newCheckinLog, ...(prev.checkinHistory || [])];

      return {
        ...prev,
        points: (prev.points || 0) + 1,
        stamps: nextStampsRecord,
        tenStampsDates: nextTenStampsDates,
        checkedInBars: nextCheckedIn,
        lastCheckinDates: nextLastCheckinDates,
        checkinHistory: nextCheckinHistory
      };
    });

    // 5. Trigger Screen-Wide STAGE CLEAR 8-Bit Festive Celebration & Arcade Sound!
    setStageClearSpotName(bar.name);
    setAnimatingStampBarId(bar.id);
    setAnimatingCheckinBarId(bar.id);
    setNewlyAddedStampIndex(isTenthStamp ? 9 : currentStamps);

    // Auto clear animation states after three seconds
    setTimeout(() => {
      setAnimatingStampBarId(null);
      setAnimatingCheckinBarId(null);
      setNewlyAddedStampIndex(null);
    }, 3500);

    triggerSelfPush(
      isFirstCheckinAtSpot
        ? firstCheckinText
        : (lang === 'PT' ? 'Check-in Realizado! 🍻' : 'Check-in Complete! 🍻'),
      isFirstCheckinAtSpot
        ? firstCheckinText
        : alertMsg,
      'loyalty',
      isFirstCheckinAtSpot ? 'NEW SPOT DISCOVERED. HOP ON!' : 'Check-in Complete! 🍻',
      isFirstCheckinAtSpot ? 'NEW SPOT DISCOVERED. HOP ON!' : alertMsg
    );

    // 6. iOS System Toast Notification
    setIosToast({
      id: `toast_${Date.now()}`,
      title: isFirstCheckinAtSpot
        ? firstCheckinText
        : (lang === 'PT' ? 'Check-in com PIN Confirmado' : 'PIN Check-in Confirmed'),
      barName: bar.name,
      pointsEarned: 1,
      subtitle: isFirstCheckinAtSpot
        ? firstCheckinText
        : (isTenthStamp 
          ? (lang === 'PT' ? '10.º Selo Conquistado! 🎉' : '10th Stamp Achieved! 🎉') 
          : (lang === 'PT' ? '1 HOP Ganho (+1 Selo)' : '1 HOP Earned (+1 Stamp)'))
    });

    // 7. Notify friends if check-in sharing is enabled
    sendFriendCheckinNotification(bar.name, 'spot');

    // 8. Trigger Beer Style Selection Modal per user specification
    setBeerStyleModal({
      isOpen: true,
      spotId: bar.id,
      spotName: bar.name,
      checkinId: undefined
    });

    // 9. Pop-up modal per user prompt specifications
    if (isFirstCheckinAtSpot) {
      setCheckinPopupModal({
        isOpen: true,
        title: 'HOP-MAP',
        message: firstCheckinText,
        website: 'www.cobeertaste.com'
      });
    } else if (isTenthStamp) {
      setCheckinPopupModal({
        isOpen: true,
        title: 'HOP-MAP',
        message: lang === 'PT' 
          ? `Parabéns, conquistaste o ${bar.name}! Completaste os 10 check-ins com sucesso neste spot.`
          : `Congratulations, you conquered ${bar.name}! You successfully completed all 10 check-ins at this spot.`,
        website: 'www.cobeertaste.com'
      });
    } else {
      setCheckinPopupModal({
        isOpen: true,
        title: 'HOP-MAP',
        message: lang === 'PT'
          ? `Parabéns, ganhaste 1 HOP por check-in no spot ${bar.name}. Desfruta da tua cerveja em ${bar.name}.`
          : `Congratulations, you earned 1 HOP for checking in at ${bar.name}. Enjoy your craft beer!`,
        website: 'www.cobeertaste.com'
      });
    }
  };

  // Determine current simulated city name based on userLocation
  const getCurrentCityName = (): string => {
    let closestCity = 'Porto';
    let minDistance = Infinity;
    
    Object.entries(CITY_COORDINATES).forEach(([cityName, coords]) => {
      const dist = getDistanceInKm(
        userLocation.latitude,
        userLocation.longitude,
        coords.latitude,
        coords.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestCity = cityName;
      }
    });
    
    return closestCity;
  };

  // Perform Festival Check-In (with strict validations)
  const handleFestivalCheckin = async (eventId: string) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    // "Sem data" festivals are Indefinido
    const isIndefinido = ev.date === 'Sem data';
    const isEnded = ev.endDate ? new Date(ev.endDate + 'T23:59:59') < new Date() : false;

    if (isEnded) {
      triggerSelfPush(
        'Check-in Bloqueado ❌',
        'Este festival já terminou. Não é possível efetuar check-in.',
        'system'
      );
      return;
    }

    if (isIndefinido) {
      triggerSelfPush(
        'Check-in Bloqueado ❌',
        'Este festival está sem data definida (Indefinido). Não é possível efetuar check-in.',
        'system'
      );
      return;
    }

    if (user.checkedInFestivals?.includes(eventId)) {
      triggerSelfPush(
        'Check-in Duplicado ⚠️',
        'Já efetuaste check-in neste festival. Só é permitido uma vez por festival.',
        'system'
      );
      return;
    }

    const eventCoords = CITY_COORDINATES[ev.location];
    if (!eventCoords) {
      triggerSelfPush(
        'Check-in Bloqueado ❌',
        `Não foi possível determinar a localização do festival em ${ev.location}.`,
        'system'
      );
      return;
    }

    const distanceInMeters = getDistanceInKm(
      userLocation.latitude,
      userLocation.longitude,
      eventCoords.latitude,
      eventCoords.longitude
    ) * 1000;

    const isWithin200m = distanceInMeters <= 200;

    if (!isWithin200m) {
      const formatDistance = (m: number): string => {
        if (m < 1000) return `${Math.round(m)} metros`;
        return `${(m / 1000).toFixed(1)} km`;
      };
      
      triggerSelfPush(
        'Fora de Alcance! 📍',
        `Precisas de estar num raio de 200 metros do festival para fazer check-in. Estás a ${formatDistance(distanceInMeters)} de distância.`,
        'system'
      );
      return;
    }

    // Success! Trigger pixel confetti animation and award 2 HOPS
    setAnimatingCheckinEventId(eventId);
    setTimeout(() => setAnimatingCheckinEventId(null), 3500);

    const newCheckedInFestivals = [...(user.checkedInFestivals || []), eventId];
    const newPoints = (user.points || 0) + 2;
    const levelInfo = getLevelDetails(newPoints);

    setUser(prev => ({
      ...prev,
      points: newPoints,
      level: levelInfo.title,
      avatarUrl: levelInfo.avatarUrl,
      checkedInFestivals: newCheckedInFestivals
    }));

    // Trigger feedback sound
    try {
      playRewardChime();
    } catch (err) {}

    triggerSelfPush(
      'Check-in no Festival! 🍻',
      `Check-in efetuado com sucesso no ${ev.title}! Ganhaste +2 HOPS.`,
      'loyalty'
    );

    // iOS System Toast Notification
    setIosToast({
      id: `toast_${Date.now()}`,
      title: lang === 'PT' ? 'Check-in no Festival' : 'Festival Check-in',
      barName: ev.title,
      pointsEarned: 2,
      subtitle: lang === 'PT' ? '2 HOPS Ganhos' : '2 HOPS Earned'
    });

    // Notify friends if check-in sharing is enabled
    sendFriendCheckinNotification(ev.title, 'festival');

    // Pop-up modal per user prompt specifications
    setCheckinPopupModal({
      isOpen: true,
      title: 'HOP-MAP',
      message: `Parabéns, ganhaste 2 HOPS por check-in no festival ${ev.title}. Desfruta do festival e das cervejas!!`,
      website: 'www.cobeertaste.com'
    });

    // Sync to Firestore
    if (user.isLoggedIn && !user.id.startsWith('local-user-')) {
      try {
        await setDoc(doc(db, 'users', user.id), {
          points: newPoints,
          checkedInFestivals: newCheckedInFestivals
        }, { merge: true });
      } catch (err) {
        console.warn("Could not sync festival check-in to Firestore:", err);
      }
    }
  };

  // Adding Custom Review
  const submitReview = async () => {
    if (!reviewComment || !activeBarToReview) return;

    if (!user.isLoggedIn || !user.id) {
      triggerSelfPush(
        'Iniciar Sessão',
        'Inicia sessão para poderes submeter avaliações!',
        'system'
      );
      return;
    }

    const hasAlreadyReviewed = (activeBarToReview.reviews || []).some(rev => rev.userId === user.id);
    if (hasAlreadyReviewed) {
      triggerSelfPush(
        'Limite de Avaliação',
        'Já avaliaste este spot! Só podes avaliar cada spot uma única vez.',
        'system'
      );
      return;
    }

    const truncatedComment = reviewComment.slice(0, 100); // 100 characters max!
    const newRatingData = {
      stars: reviewRating,
      texto_rating: truncatedComment,
      tipo_cerveja: reviewBeerStyle || '',
      barId: activeBarToReview.id,
      barName: activeBarToReview.name,
      userName: user.username,
      userId: user.id, // Save the user's ID
      createdAt: new Date().toISOString()
    };

    let finalId = `local-rating-${Date.now()}`;
    let successfullySavedToCloud = false;

    try {
      if (isLocalAuthFallback || !auth.currentUser) {
        console.warn('Skipping Cloud save due to Local Auth Fallback mode');
      } else {
        // Save to Firestore global root collection 'ratings'
        const docRef = await addDoc(collection(db, 'ratings'), newRatingData);
        finalId = docRef.id;
        successfullySavedToCloud = true;

        // Save the updated points to the user document in Firestore
        try {
          const newPoints = user.points + 1;
          await setDoc(doc(db, 'users', user.id), { points: newPoints }, { merge: true });
        } catch (uerr) {
          if (isPermissionError(uerr)) {
            handleFirestoreError(uerr, OperationType.WRITE, `users/${user.id}`);
          }
          console.error('Error updating user points in Firestore:', uerr);
        }
      }
    } catch (err: any) {
      if (isPermissionError(err)) {
        handleFirestoreError(err, OperationType.CREATE, 'ratings');
      }
      console.error('Error saving review to Firestore, falling back to local:', err);
    }

    const newRatingWithId = {
      id: finalId,
      ...newRatingData
    };

    // Add to local ratings history
    setRatingsHistory(prev => [newRatingWithId, ...prev]);

    const newRev: Review = {
      id: finalId,
      userId: user.id,
      userName: user.username,
      rating: reviewRating,
      comment: truncatedComment,
      beerStyleReviewed: reviewBeerStyle || undefined,
      date: 'Agora mesmo'
    };

      // Update dynamic bars dataset with review
      setBars(prev => prev.map(b => {
        if (b.id === activeBarToReview.id) {
          const updatedReviews = [newRev, ...(b.reviews || [])];
          const newCount = b.reviewsCount + 1;
          const avgRating = parseFloat(((b.rating * b.reviewsCount + reviewRating) / newCount).toFixed(1));
          return {
            ...b,
            reviews: updatedReviews,
            reviewsCount: newCount,
            rating: avgRating
          };
        }
        return b;
      }));

      // Update state display too
      if (selectedBar?.id === activeBarToReview.id) {
        setSelectedBar(prev => {
          if (!prev) return null;
          const updatedReviews = [newRev, ...(prev.reviews || [])];
          const newCount = prev.reviewsCount + 1;
          const avgRating = parseFloat(((prev.rating * prev.reviewsCount + reviewRating) / newCount).toFixed(1));
          return {
            ...prev,
            reviews: updatedReviews,
            reviewsCount: newCount,
            rating: avgRating
          };
        });
      }

      // Award 1 HOP for contributing reviews
      setUser(prev => ({ ...prev, points: prev.points + 1 }));
      triggerSelfPush(
        successfullySavedToCloud ? 'Avaliação Publicada!' : 'Avaliação Guardada Localmente!',
        successfullySavedToCloud
          ? `A tua opinião ajudou a comunidade. Ganhaste 1 HOP!`
          : `Guardada no teu dispositivo (Modo Local). Ganhaste 1 HOP!`,
        'reward'
      );

    // Reset Review fields
    setReviewComment('');
    setReviewBeerStyle('');
    setActiveBarToReview(null);
  };

  // Editing/Updating Existing Review
  const updateReview = async () => {
    if (!editingReview || !editComment) return;

    const truncatedComment = editComment.slice(0, 100);
    const updatedData = {
      stars: editRating,
      texto_rating: truncatedComment,
      tipo_cerveja: editBeerStyle || '',
      barId: editingReview.barId,
      barName: editingReview.barName,
      userName: user.username,
      userId: user.id,
      createdAt: editingReview.createdAt || new Date().toISOString()
    };

    try {
      // Update in global ratings collection
      await setDoc(doc(db, 'ratings', editingReview.id), updatedData);

      const updatedRatingWithId = {
        id: editingReview.id,
        ...updatedData
      };

      // Update local ratings history
      setRatingsHistory(prev => prev.map(r => r.id === editingReview.id ? updatedRatingWithId : r));

      // Update bars reviews
      setBars(prev => prev.map(b => {
        if (b.id === editingReview.barId) {
          const updatedReviews = (b.reviews || []).map(r => {
            if (r.id === editingReview.id) {
              return {
                ...r,
                rating: editRating,
                comment: truncatedComment,
                beerStyleReviewed: editBeerStyle || undefined
              };
            }
            return r;
          });
          const sum = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
          const avgRating = parseFloat((sum / updatedReviews.length).toFixed(1));
          return {
            ...b,
            reviews: updatedReviews,
            rating: avgRating
          };
        }
        return b;
      }));

      // Update selected bar if open
      if (selectedBar && selectedBar.id === editingReview.barId) {
        setSelectedBar(prev => {
          if (!prev) return null;
          const updatedReviews = (prev.reviews || []).map(r => {
            if (r.id === editingReview.id) {
              return {
                ...r,
                rating: editRating,
                comment: truncatedComment,
                beerStyleReviewed: editBeerStyle || undefined
              };
            }
            return r;
          });
          const sum = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
          const avgRating = parseFloat((sum / updatedReviews.length).toFixed(1));
          return {
            ...prev,
            reviews: updatedReviews,
            rating: avgRating
          };
        });
      }

      triggerSelfPush('Avaliação Editada!', 'A tua opinião foi atualizada com sucesso.', 'reward');
    } catch (err: any) {
      if (isPermissionError(err)) {
        handleFirestoreError(err, OperationType.UPDATE, `ratings/${editingReview.id}`);
      }
      console.error('Error updating review in Firestore:', err);
      triggerSelfPush('Erro ao Atualizar', 'Não foi possível atualizar a tua avaliação.', 'system');
    }

    setEditingReview(null);
  };

  // Filter and process location/distance list
  const filteredBars = bars.filter(bar => {
    const matchesSearch = bar.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          bar.styles.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          bar.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = selectedZone === 'All' || bar.zone === selectedZone;
    const matchesStyle = selectedStyle === 'All' || bar.styles.includes(selectedStyle);
    const matchesFav = !showOnlyFavorites || user.favorites.includes(bar.id);

    return matchesSearch && matchesZone && matchesStyle && matchesFav;
  });

  // Calculate distance for all bars, handle filters (proximity, topRated, openNow, alphabetical)
  const displayBars = React.useMemo(() => {
    let barsWithDistance = filteredBars.map(bar => ({
      ...bar,
      distance: getDistanceInKm(userLocation.latitude, userLocation.longitude, bar.latitude, bar.longitude)
    }));

    if (openNowFilter) {
      barsWithDistance = barsWithDistance.filter(bar => getBarOpenStatus(bar, lang).isOpen);
    }

    if (proximitySort) {
      barsWithDistance = barsWithDistance.filter(bar => bar.distance <= 10.0);
    }

    if (alphabeticalSort) {
      return [...barsWithDistance].sort((a, b) => a.name.localeCompare(b.name, lang === 'PT' ? 'pt' : 'en', { sensitivity: 'base' }));
    }

    if (topRatedSort) {
      return [...barsWithDistance].sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }
        return a.distance - b.distance;
      });
    }

    return [...barsWithDistance].sort((a, b) => a.distance - b.distance);
  }, [filteredBars, proximitySort, topRatedSort, openNowFilter, alphabeticalSort, userLocation, lang]);

  if (!isFirebaseConfigured) {
    return (
      <AppleDeviceFrame darkMode={darkMode} setDarkMode={setDarkMode}>
        <div className="flex-1 w-full h-full flex flex-col justify-center items-center p-6 bg-[#121828] text-white font-sans text-center overflow-y-auto">
          <div className="max-w-md w-full space-y-6 p-6 rounded-[32px] bg-zinc-900/60 border border-zinc-800 backdrop-blur-md shadow-2xl my-4">
            {/* Elegant Icon Header */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Flame className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-lg font-black tracking-tight font-display text-white">
                Ligar ao teu projeto: HOPMAP 🍻
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Configurámos a aplicação para apontar para o teu projeto do Firebase <strong>hopmap-cobeertaste</strong>! Para concluir a ligação segura, só precisas de definir a API Key e o App ID nas configurações do AI Studio.
              </p>
            </div>

            <div className="bg-zinc-950/50 rounded-2xl p-4.5 border border-zinc-800/80 text-left space-y-3.5 text-xs">
              <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-amber-500 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Como ligar em 2 passos:
              </h3>
              
              <ul className="space-y-3.5 text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-lg bg-zinc-850 flex items-center justify-center text-[10px] font-bold text-amber-500 shrink-0 font-mono">1</span>
                  <div className="space-y-1">
                    <p className="leading-normal font-semibold text-white">Obtém as tuas credenciais em:</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Consola Firebase &gt; Configurações do Projeto (roda dentada) &gt; Os seus aplicativos &gt; Configuração Web SDK (seleciona a opção "Configuração"). Copia os valores de <code>apiKey</code> e <code>appId</code>.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-lg bg-zinc-850 flex items-center justify-center text-[10px] font-bold text-amber-500 shrink-0 font-mono">2</span>
                  <div className="space-y-1">
                    <p className="leading-normal font-semibold text-white">Adiciona como Segredos no AI Studio:</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Acede ao menu de <strong>Configurações/Secrets</strong> (roda dentada) no canto superior direito do AI Studio e adiciona estes dois valores como Segredos:
                    </p>
                    <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 font-mono text-[10px] text-amber-400 space-y-1 mt-1.5">
                      <div>VITE_FIREBASE_API_KEY = "tua-api-key"</div>
                      <div>VITE_FIREBASE_APP_ID = "teu-app-id"</div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="text-[10px] text-zinc-500 leading-normal">
              💡 <strong>Nota:</strong> Também podes editar diretamente o ficheiro <code>firebase-applet-config.json</code> no explorador de ficheiros à esquerda para colocar o teu <code>apiKey</code> e <code>appId</code> reais.
            </div>
          </div>
        </div>
      </AppleDeviceFrame>
    );
  }

  return (
    <AppleDeviceFrame darkMode={darkMode} setDarkMode={setDarkMode}>
      
      {/* NATIVE SYSTEM NOTIFICATIONS PUSH DECORATOR SLIDER (Dynamic Island slide down!) */}
      <AnimatePresence>
        {activePush && (
          <motion.div 
            initial={{ y: -100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -105, opacity: 0, scale: 0.9 }}
            onClick={() => setActivePush(null)}
            className="absolute top-12 left-3 right-3 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-3xl p-4 shadow-2xl z-[250] cursor-pointer flex items-start space-x-3 text-white"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <Beer className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 font-sans">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase">Hop-Map PUSH</span>
                <span className="text-[9px] text-zinc-500">X</span>
              </div>
              <h4 className="text-xs font-bold mt-0.5">
                {lang === 'EN' && activePush.titleEn ? activePush.titleEn : activePush.title}
              </h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                {lang === 'EN' && activePush.bodyEn ? activePush.bodyEn : activePush.body}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* APPLE iOS SYSTEM TOAST NOTIFICATION FOR CHECK-IN */}
      <AnimatePresence>
        {iosToast && (
          <motion.div
            initial={{ y: -80, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            onClick={() => setIosToast(null)}
            className="absolute top-12 left-3 right-3 z-[600] cursor-pointer flex justify-center pointer-events-auto"
            id="ios-checkin-toast"
          >
            <div className="w-full max-w-sm bg-[#1c1c1e]/92 backdrop-blur-2xl border border-white/20 text-white shadow-[0_16px_40px_rgba(0,0,0,0.7)] rounded-2xl p-3 flex items-center justify-between gap-3 font-sans">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                  <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase font-mono">
                      {iosToast.title}
                    </span>
                    {iosToast.subtitle && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-zinc-500" />
                        <span className="text-[10px] text-zinc-400 font-medium truncate">
                          {iosToast.subtitle}
                        </span>
                      </>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white tracking-tight truncate mt-0.5">
                    {iosToast.barName}
                  </h4>
                </div>
              </div>
              <div className="shrink-0 flex items-center">
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-[10px] font-mono px-2.5 py-1 rounded-full shadow-md shadow-amber-500/20 flex items-center gap-1 border border-amber-300/40">
                  <span>+{iosToast.pointsEarned}</span>
                  <span>{iosToast.pointsEarned === 1 ? 'HOP' : 'HOPS'}</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen layout wrapper holding our views */}
      <div className="flex-1 w-full h-full flex flex-col relative overflow-hidden bg-[#F6EFDC] text-[#1B2036]">
        
        {/* TOP COMPACT APP TITLE & PUSH SIMULATOR BUTTON */}
        {user.isLoggedIn && (
          <header className="px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between border-b-2 border-[#1B2036] bg-[#F6EFDC] text-[#1B2036] z-30 shrink-0 select-none w-full sticky top-0 landscape-compact-header pt-[max(0.5rem,env(safe-area-inset-top,0px))]">
            <button 
              type="button"
              onClick={() => {
                setActiveTab('explore');
                handleSelectBar(null);
                handleSelectZone('All');
              }}
              className="flex items-center gap-1.5 sm:gap-2.5 text-left focus:outline-none hover:opacity-85 active:scale-98 transition duration-150 cursor-pointer min-h-[40px] shrink-0"
              id="btn-header-branding-logo"
            >
              <PixelPacman 
                size={20} 
                santaHat={isChristmas} 
                overrideColor={activeSpecialEvent?.isGreenTheme ? '#12908C' : '#F2A93B'} 
                className="animate-pulse shrink-0" 
              />
              <div className="flex items-baseline gap-1 sm:gap-2 min-w-0">
                <h1 
                  className="text-xs sm:text-base md:text-lg font-bold tracking-wider font-press text-[#1B2036] whitespace-nowrap"
                  style={{ 
                    textShadow: '1px 1px 0px #F2A93B' 
                  }}
                >
                  HOP-MAP
                </h1>
                <a 
                  href="https://www.cobeertaste.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="text-[6.5px] sm:text-[8px] text-[#1B2036]/70 hover:text-[#12908C] transition duration-150 font-bold uppercase tracking-wider font-label whitespace-nowrap cursor-pointer hover:underline touch-target-expand"
                >
                  by Cobeer Taste
                </a>
              </div>
            </button>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Hop-Chat 🍻 Community Live Chat Button with Retro Pixel Speech Bubble */}
              <button 
                onClick={() => setIsHopChatOpen(true)}
                className="inline-flex items-center justify-center bg-[#EFE6CC] border-2 border-[#1B2036] hover:bg-[#F2A93B] active:scale-95 transition-all p-2 sm:p-2.5 min-w-[36px] sm:min-w-[40px] md:min-w-[44px] min-h-[36px] sm:min-h-[40px] md:min-h-[44px] rounded-xl cursor-pointer select-none shadow-[2px_2px_0px_#1B2036] touch-target-expand"
                id="btn-open-hop-chat-header"
                title={lang === 'PT' ? "Hop-Chat Comunidade 🍻" : "Community Hop-Chat 🍻"}
              >
                <PixelIcon 
                  name={isChristmas ? "bell" : "chat-bubble"} 
                  size={20} 
                  overrideColor="#1B2036" 
                />
              </button>

              {/* Buy us a Beer / Oferece uma rodada 🍻 with Retro Pixel Beer Mug */}
              <button 
                onClick={() => setIsDonationModalOpen(true)}
                className="inline-flex items-center justify-center bg-[#EFE6CC] border-2 border-[#1B2036] hover:bg-[#F2A93B] active:scale-95 transition-all p-2 sm:p-2.5 min-w-[36px] sm:min-w-[40px] md:min-w-[44px] min-h-[36px] sm:min-h-[40px] md:min-h-[44px] rounded-xl cursor-pointer select-none shadow-[2px_2px_0px_#1B2036] touch-target-expand"
                id="btn-buy-beer-header"
                title={lang === 'PT' ? "Oferece uma rodada 🍻" : "Buy us a beer 🍻"}
              >
                <PixelIcon 
                  name={isChristmas ? "santa-hat" : "beer-mug"} 
                  size={20} 
                  overrideColor="#1B2036" 
                />
              </button>

              {/* Monthly Report Trigger (Administrator Only) */}
              {isAdmin && (
                <button 
                  onClick={() => setIsMonthlyReportOpen(true)}
                  className="inline-flex items-center justify-center bg-[#EFE6CC] border-2 border-[#1B2036] hover:bg-[#F2A93B] active:scale-95 transition-all p-2 sm:p-2.5 min-w-[36px] sm:min-w-[40px] md:min-w-[44px] min-h-[36px] sm:min-h-[40px] md:min-h-[44px] rounded-xl cursor-pointer select-none shadow-[2px_2px_0px_#1B2036] touch-target-expand"
                  id="btn-hops-monthly-report-header"
                  title="Painel Administrador - Relatório Mensal (cobeertaste@gmail.com)"
                >
                  <FileText className="w-4 h-4 text-[#1B2036] shrink-0" />
                </button>
              )}

              {/* Retro Podium / Leaderboard Button */}
              <button 
                onClick={() => setShowScoreModal(true)}
                className="inline-flex items-center justify-center bg-[#EFE6CC] border-2 border-[#1B2036] hover:bg-[#F2A93B] active:scale-95 transition-all p-2 sm:p-2.5 min-w-[36px] sm:min-w-[40px] md:min-w-[44px] min-h-[36px] sm:min-h-[40px] md:min-h-[44px] rounded-xl cursor-pointer select-none shadow-[2px_2px_0px_#1B2036] touch-target-expand"
                id="btn-hops-score-board"
                title={lang === 'PT' ? "Ver Tabela de Classificações" : "View Leaderboard"}
              >
                <PixelIcon 
                  name={isChristmas ? "gift" : "podium"} 
                  size={20} 
                  overrideColor="#1B2036" 
                />
              </button>
            </div>
          </header>
        )}

        {/* Real-time GPS Location Status Bar */}
        {user.isLoggedIn && activeTab === 'profile' && (
          <div className="bg-[#EFE6CC] border-b-2 border-[#1B2036] px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 z-10 text-[9.5px] select-none font-mono text-[#1B2036]">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${gpsError ? 'bg-rose-500' : 'bg-emerald-500'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${gpsError ? 'bg-rose-600' : 'bg-emerald-600'}`}></span>
              </span>
              {gpsError ? (
                <span className="text-rose-700 font-bold">
                  {lang === 'PT' ? 'Erro de GPS:' : 'GPS Error:'} {gpsError}
                </span>
              ) : (
                <span className="text-[#1B2036] font-medium">
                  {lang === 'PT' ? 'A tua localização atual:' : 'Your current location:'} <strong className="text-[#1B2036] font-bold">{userLocation.latitude.toFixed(6)}</strong>, <strong className="text-[#1B2036] font-bold">{userLocation.longitude.toFixed(6)}</strong>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 self-end sm:self-auto">
              {!gpsError && (
                gpsAccuracy !== null ? (
                  <span className="text-[#1B2036] font-medium">({lang === 'PT' ? 'Precisão:' : 'Accuracy:'} +/- <strong className="text-[#12908C] font-bold">{gpsAccuracy.toFixed(1)}</strong> {lang === 'PT' ? 'metros' : 'meters'})</span>
                ) : (
                  <span className="animate-pulse text-[#12908C] font-bold">({lang === 'PT' ? 'Precisão:' : 'Accuracy:'} +/- -- {lang === 'PT' ? 'metros' : 'meters'})</span>
                )
              )}
              <button
                onClick={handleManualGpsRefresh}
                className="flex items-center space-x-1.5 bg-[#F2A93B] text-[#1B2036] border-2 border-[#1B2036] px-2.5 py-1 rounded-lg font-sans text-[9px] font-black uppercase hover:bg-[#E09425] transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#1B2036] active:scale-95"
                id="btn-refresh-gps"
                title={lang === 'PT' ? "Atualizar Coordenadas GPS" : "Refresh GPS Coordinates"}
              >
                <RefreshCcw className={`w-3 h-3 ${isGpsRefreshing ? 'animate-spin' : ''}`} />
                <span>{lang === 'PT' ? 'Atualizar' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        )}

        {!user.isLoggedIn ? (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 w-full min-h-0 overflow-y-auto flex flex-col justify-center items-center p-4 sm:p-6 text-center select-none relative"
          >
            {/* Logo */}
            <div className="mb-3 shrink-0 flex flex-col items-center justify-center w-full max-w-xs mx-auto">
              <PixelLogo className="w-full max-w-xs" />
            </div>

            <p 
              className="text-[9px] sm:text-[10px] mt-1 w-full max-w-xs mx-auto text-center font-bold tracking-wider font-press text-[#1B2036] leading-relaxed select-none"
              id="login-cobeer-taste-tagline"
            >
              {lang === 'PT' ? 'criado por COBEER TASTE' : 'created by COBEER TASTE'}
            </p>

            {/* Login Card */}
            <div className="w-full max-w-xs mx-auto rounded-3xl border-3 border-[#1B2036] p-5 mt-6 space-y-4 shadow-[6px_6px_0px_#1B2036] bg-[#F6EFDC] text-[#1B2036]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#12908C] font-label">
                {isRegisterMode ? t('registerTab', lang) : t('loginTab', lang)}
              </h2>
              
              <div className="space-y-3 text-left">
                {/* Optional Username Input when registering */}
                {isRegisterMode && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[#1B2036]/70 pl-1 font-label">{t('nameLabel', lang)}</label>
                    <input
                      type="text"
                      placeholder={t('namePlaceholder', lang)}
                      value={loginName}
                      onChange={e => setLoginName(e.target.value)}
                      className="w-full px-4 py-2 text-xs rounded-xl border-2 border-[#1B2036] transition-all outline-none bg-[#EFE6CC] text-[#1B2036] placeholder-[#1B2036]/50 focus:border-[#12908C] font-body"
                    />
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#1B2036]/70 pl-1 font-label">{t('emailLabel', lang)}</label>
                  <input
                    type="email"
                    placeholder={t('emailPlaceholder', lang)}
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-2 text-xs rounded-xl border-2 border-[#1B2036] transition-all outline-none bg-[#EFE6CC] text-[#1B2036] placeholder-[#1B2036]/50 focus:border-[#12908C] font-body"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center pr-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[#1B2036]/70 pl-1 font-label">{t('passwordLabel', lang)}</label>
                    <span className="text-[8px] text-[#1B2036]/60 font-medium font-body">{lang === 'PT' ? '(mín. 6 caracteres)' : '(min. 6 chars)'}</span>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => {
                      setLoginPassword(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    className="w-full px-4 py-2 text-xs rounded-xl border-2 border-[#1B2036] transition-all outline-none bg-[#EFE6CC] text-[#1B2036] placeholder-[#1B2036]/50 focus:border-[#12908C] font-body"
                  />
                </div>

                {/* Over 18 Age Verification Checkbox when registering */}
                {isRegisterMode && (
                  <div className="pt-1">
                    <label className={`flex items-center space-x-2.5 p-2.5 rounded-xl border-2 border-[#1B2036] cursor-pointer select-none transition-all ${
                      isOver18 
                        ? 'bg-[#12908C]/15 text-[#1B2036]' 
                        : 'bg-[#EFE6CC] text-[#1B2036] hover:bg-[#F2A93B]/30'
                    }`}>
                      <input
                        type="checkbox"
                        checked={isOver18}
                        onChange={e => {
                          setIsOver18(e.target.checked);
                          if (authError) setAuthError('');
                        }}
                        className="w-4 h-4 rounded text-[#12908C] accent-[#12908C] focus:ring-[#12908C] cursor-pointer shrink-0"
                        id="checkbox-over-18"
                      />
                      <span className="text-[10px] font-bold tracking-wide font-body">
                        {lang === 'PT' ? 'Tens mais de 18 anos?' : 'Are you over 18 years old?'}
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Error Alert Box */}
              {authError && (
                <div className="p-3 rounded-xl text-[10px] font-medium bg-[#E85B41]/15 border-2 border-[#1B2036] text-[#E85B41] text-left leading-normal animate-fade-in space-y-2 font-body font-bold">
                  <div>{authError}</div>
                  {!isRegisterMode && (authError.includes('Criar conta') || authError.includes('Create account') || authError.includes('não criada') || authError.includes('not yet registered')) && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(true);
                        setAuthError('');
                      }}
                      className="mt-1 px-3 py-1.5 bg-[#12908C] hover:bg-[#0B6C69] text-white rounded-xl text-[10px] font-bold cursor-pointer inline-block shadow-sm transition"
                    >
                      {lang === 'PT' ? '→ Criar conta agora com este e-mail' : '→ Create account now with this email'}
                    </button>
                  )}
                  {authError.includes('consola Firebase') && (
                    <div className="mt-2 pt-2 border-t border-[#1B2036]/20 text-[9px] text-[#1B2036]/80 space-y-1.5 font-normal">
                      <p className="font-bold text-[#E85B41]">Passos para corrigir na Consola Firebase:</p>
                      <ol className="list-decimal list-inside space-y-1.5 text-[#1B2036]/80 leading-normal">
                        <li>Acede à <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline text-[#12908C] hover:text-[#0B6C69] font-bold">Consola Firebase</a></li>
                        <li>Seleciona o teu projeto (<strong>hopmap-cobeertaste</strong>)</li>
                        <li>No menu esquerdo, vai a <strong>Authentication</strong></li>
                        <li>Clica no separador <strong>Sign-in method</strong> (Método de início de sessão)</li>
                        <li>Clica em <strong>Add new provider</strong> (Adicionar novo fornecedor) e clica em <strong>Email/Password</strong></li>
                        <li>Ativa a primeira opção (E-mail/palavra-passe) e clica em <strong>Guardar</strong></li>
                      </ol>
                      <p className="text-[8px] text-[#1B2036]/70 mt-2 font-semibold">Após guardares, recarrega esta página e poderás criar a tua conta e iniciar sessão normalmente!</p>
                    </div>
                  )}
                </div>
              )}

              <button
                disabled={isAuthLoading}
                onClick={async () => {
                  setAuthError('');
                  try {
                    if (!isFirebaseConfigured) {
                      setAuthError(t('firebaseNotConfigured', lang));
                      return;
                    }
                    const cleanEmail = loginEmail.trim();
                    if (isRegisterMode) {
                      if (!isOver18) {
                        setAuthError(
                          lang === 'PT' 
                            ? 'Tens de confirmar que tens mais de 18 anos para criar conta.' 
                            : 'You must confirm that you are over 18 years old to create an account.'
                        );
                        return;
                      }
                      if (!cleanEmail || !loginPassword) {
                        setAuthError(t('fillRequiredFields', lang));
                        return;
                      }
                      if (loginPassword.length < 6) {
                        setAuthError(t('passMinLength', lang));
                        return;
                      }
                      
                      const displayNameVal = loginName.trim();
                      if (!displayNameVal) {
                        setAuthError(lang === 'PT' ? 'Por favor introduz o teu nome de utilizador.' : 'Please enter your username.');
                        return;
                      }

                      // Check alphanumeric characters only (letters and numbers, no special characters or spaces)
                      const isAlphanumericOnly = /^[a-zA-Z0-9]+$/.test(displayNameVal);
                      if (!isAlphanumericOnly) {
                        setAuthError(
                          lang === 'PT' 
                            ? 'O nome de utilizador apenas pode conter letras e números (sem caracteres especiais ou espaços).' 
                            : 'Username can only contain letters and numbers (no special characters or spaces).'
                        );
                        return;
                      }

                      // Unique username check in mock list
                      const mockUserNames = [
                        'MestreCervejeiro', 'RitaSourLover', 'HopKing_88', 'AnaStout',
                        'PedroNEIPA', 'CervejaEAmigos', 'DianaLager', 'TomasPilsner',
                        'SofiaGose', 'BebedorIniciante'
                      ];
                      const isNameTakenMock = mockUserNames.some(m => m.toLowerCase() === displayNameVal.toLowerCase());
                      if (isNameTakenMock) {
                        setAuthError(lang === 'PT' ? 'Já existe um utilizador com esse nome' : 'A user with that name already exists');
                        return;
                      }

                      // Unique username check in Firestore
                      if (isFirebaseConfigured) {
                        try {
                          const usersRef = collection(db, 'users');
                          const qName = query(usersRef, where('username', '==', displayNameVal));
                          const snapName = await getDocs(qName);
                          if (!snapName.empty) {
                            setAuthError(lang === 'PT' ? 'Já existe um utilizador com esse nome' : 'A user with that name already exists');
                            return;
                          }
                        } catch (uErr) {
                          console.warn('Error checking username uniqueness in Firestore:', uErr);
                        }
                      }

                      setIsAuthLoading(true);
                      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, loginPassword);
                      if (userCredential.user) {
                        await updateProfile(userCredential.user, { displayName: displayNameVal });
                        
                        // Add newly registered user to firestore collection 'users' with user_language preference
                        try {
                          await setDoc(doc(db, 'users', userCredential.user.uid), {
                            uid: userCredential.user.uid,
                            email: cleanEmail,
                            username: displayNameVal,
                            user_language: lang,
                            createdAt: new Date().toISOString()
                          });
                        } catch (uerr) {
                          if (isPermissionError(uerr)) {
                            handleFirestoreError(uerr, OperationType.WRITE, `users/${userCredential.user.uid}`);
                          }
                          console.warn('Notice creating user profile in Firestore:', uerr);
                        }
                      }
                      triggerSelfPush(
                        t('accountCreatedTitle', lang),
                        lang === 'PT' ? `Olá ${displayNameVal}, bem-vindo ao teu roteiro Hop-Map!` : `Hello ${displayNameVal}, welcome to your Hop-Map guide!`,
                        'system'
                      );
                    } else {
                      if (!cleanEmail || !loginPassword) {
                        setAuthError(t('enterEmailPass', lang));
                        return;
                      }
                      if (loginPassword.length < 6) {
                        setAuthError(t('passMinLength', lang));
                        return;
                      }
                      setIsAuthLoading(true);
                      await signInWithEmailAndPassword(auth, cleanEmail, loginPassword);
                      triggerSelfPush(
                        t('welcomeBackTitle', lang),
                        t('welcomeBackMsg', lang),
                        'system'
                      );
                    }
                  } catch (err: any) {
                    console.warn('Auth notice:', err?.code || err?.message);
                    let PortugueseError = err.message || (lang === 'PT' ? 'Ocorreu um erro na autenticação.' : 'An authentication error occurred.');
                    if (err.code === 'auth/invalid-email') {
                      PortugueseError = lang === 'PT' ? 'E-mail inválido.' : 'Invalid email address.';
                    } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                      PortugueseError = lang === 'PT' 
                        ? 'E-mail ou palavra-passe incorretos, ou conta ainda não criada. Se ainda não criaste conta, clica em "Criar conta" abaixo!' 
                        : 'Incorrect email or password, or account not yet registered. If you haven\'t created an account yet, click "Create account" below!';
                    } else if (err.code === 'auth/email-already-in-use') {
                      PortugueseError = lang === 'PT' ? 'Este e-mail já está em uso.' : 'Email is already in use.';
                    } else if (err.code === 'auth/weak-password' || (err.message && err.message.toLowerCase().includes('password'))) {
                      PortugueseError = t('passMinLength', lang);
                    } else if (err.code === 'auth/operation-not-allowed') {
                      PortugueseError = lang === 'PT' ? 'O método E-mail/Palavra-passe não está ativo na consola Firebase.' : 'Email/Password sign-in method is not enabled in Firebase Console.';
                    } else {
                      PortugueseError = PortugueseError.replace(/^Firebase:\s*/, '');
                    }
                    setAuthError(PortugueseError);
                  } finally {
                    setIsAuthLoading(false);
                  }
                }}
                className="w-full py-2.5 bg-[#12908C] hover:bg-[#0B6C69] text-white font-bold text-xs rounded-xl shadow-[3px_3px_0px_#1B2036] border-2 border-[#1B2036] active:scale-98 transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-label uppercase"
              >
                {isAuthLoading ? (lang === 'PT' ? 'A carregar...' : 'Loading...') : (isRegisterMode ? t('registerTab', lang) : t('loginButton', lang))}
              </button>

              {/* Register Toggle Link */}
              <div className="text-center flex flex-col items-center gap-2">
                <button 
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setAuthError('');
                  }}
                  className="text-[10px] text-[#12908C] hover:text-[#0B6C69] font-bold underline cursor-pointer font-label"
                >
                  {isRegisterMode 
                    ? (lang === 'PT' ? 'Já tens conta? Entrar' : 'Already have an account? Login') 
                    : (lang === 'PT' ? 'Não tens conta? Criar conta' : 'No account? Create account')}
                </button>

                {!isRegisterMode && (
                  <button 
                    onClick={() => {
                      setResetEmail(loginEmail.trim());
                      setResetError('');
                      setResetSuccess('');
                      setShowResetModal(true);
                    }}
                    className="text-[10px] text-[#1B2036]/70 hover:text-[#1B2036] font-bold underline cursor-pointer mt-0.5 font-label"
                  >
                    {t('forgotPassword', lang)}
                  </button>
                )}
              </div>

            </div>

            {/* Language Selector PT / EN (Between Login Card and Terms) */}
            <div className="flex items-center justify-center gap-1.5 p-1 bg-[#EFE6CC] border-2 border-[#1B2036] rounded-full mt-5 mb-1 shrink-0 select-none shadow-[2px_2px_0px_#1B2036]">
              <button
                type="button"
                onClick={() => handleLanguageChange('PT')}
                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer font-label ${
                  lang === 'PT' ? 'bg-[#12908C] text-white shadow-sm border border-[#1B2036]' : 'text-[#1B2036]/70 hover:text-[#1B2036]'
                }`}
                id="btn-login-lang-pt"
                title="Português"
              >
                PT 🇵🇹
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('EN')}
                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer font-label ${
                  lang === 'EN' ? 'bg-[#12908C] text-white shadow-sm border border-[#1B2036]' : 'text-[#1B2036]/70 hover:text-[#1B2036]'
                }`}
                id="btn-login-lang-en"
                title="English"
              >
                EN 🇬🇧
              </button>
            </div>

            <p 
              className="text-[9.5px] text-[#1B2036]/70 mt-2 w-full max-w-xs text-justify leading-relaxed px-1 font-body"
              id="login-terms-disclaimer"
            >
              {t('loginTermsAgreement', lang)}
            </p>

            <p 
              className="text-[10px] text-[#1B2036]/80 font-bold uppercase tracking-wider mt-1.5 w-full max-w-xs text-center font-label"
              id="login-drink-responsibly"
            >
              🍻 {t('drinkResponsibly', lang)}
            </p>
          </motion.div>
        ) : (
          <main ref={mainScrollRef} onScroll={handleMainScroll} className={`flex-1 ${activeTab === 'map' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto pb-4'} z-10 select-none relative min-h-0`}>
          <AnimatePresence mode="wait">
            
            {/* VIEW A: EXPLORE LIST */}
            {activeTab === 'explore' && (
              <motion.div 
                key="explore-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 sm:p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full"
              >
                {/* Special Seasonal / Commemorative Events Banner (Placed between top header & Search bar) */}
                <SpecialEventsBanner 
                  event={activeSpecialEvent} 
                  lang={lang} 
                  darkMode={darkMode} 
                />

                {/* Search Inputs */}
                <div className="space-y-2.5">
                  {/* Main Spot Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder={lang === 'PT' ? "Pesquisar spots..." : "Search spots..."}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl border-2 border-black bg-[#F6EFDC] text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-0 transition-all shadow-xs"
                      id="input-explore-search"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-black touch-target-expand"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Region / Location Dropdown Filter - Immediately follows Search spots */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsZoneDropdownOpen(!isZoneDropdownOpen)}
                      className={`w-full p-2.5 rounded-xl border-2 border-black text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        selectedZone !== 'All'
                          ? 'bg-amber-500/15 text-black'
                          : 'bg-[#F6EFDC] text-neutral-800 hover:bg-[#EFE6CC] shadow-xs'
                      }`}
                      id="zone-dropdown-trigger"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <MapPin className={`w-3.5 h-3.5 shrink-0 ${selectedZone !== 'All' ? 'text-amber-500' : 'text-neutral-700'}`} />
                        <span className="truncate">
                          {selectedZone === 'All' ? (lang === 'PT' ? 'Procurar por localidade' : 'Search by location') : selectedZone}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold border border-black/30 ${
                          selectedZone !== 'All'
                            ? 'bg-amber-500/20 text-black'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {selectedZone === 'All' ? bars.length : (zoneCounts[selectedZone] || 0)} spots
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isZoneDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isZoneDropdownOpen && (
                      <>
                        {/* Click outside backdrop overlay */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => {
                            setIsZoneDropdownOpen(false);
                            setZoneSearchQuery('');
                          }} 
                        />
                        
                        {/* Dropdown Floating Box */}
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 mt-1.5 rounded-2xl border-2 border-black shadow-2xl z-50 overflow-hidden flex flex-col bg-[#F6EFDC] text-neutral-900"
                          id="zone-dropdown-list-container"
                        >
                          {/* Search input inside dropdown */}
                          <div className="p-2 border-b-2 border-black bg-[#EFE6CC]">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                              <input
                                type="text"
                                placeholder={lang === 'PT' ? "Pesquisar localidade..." : "Search location..."}
                                value={zoneSearchQuery}
                                onChange={(e) => setZoneSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border-2 border-black bg-[#F6EFDC] text-neutral-900 placeholder-neutral-500 focus:outline-none transition-all"
                                id="zone-dropdown-search"
                              />
                              {zoneSearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setZoneSearchQuery('')}
                                  className="absolute right-2 top-2 text-neutral-500 hover:text-black"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Scrollable List of Zones (No scrollbar) */}
                          <div className="max-h-56 overflow-y-auto no-scrollbar divide-y divide-black/10 py-1">
                            {/* 'All' option */}
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectZone('All');
                                setIsZoneDropdownOpen(false);
                                setZoneSearchQuery('');
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                selectedZone === 'All'
                                  ? 'bg-amber-500/15 text-black font-extrabold'
                                  : 'hover:bg-[#EFE6CC] text-neutral-700'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <MapPin className={`w-3.5 h-3.5 ${selectedZone === 'All' ? 'text-amber-500' : 'text-neutral-500'}`} />
                                <span>{lang === 'PT' ? 'Procurar por localidade' : 'Search by location'}</span>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                                selectedZone === 'All'
                                  ? 'bg-amber-500/20 text-black'
                                  : 'bg-black/10 text-neutral-600'
                              }`}>
                                {bars.length}
                              </span>
                            </button>

                            {/* Filtered Zones */}
                            {activeZones
                              .filter(zone => zone.toLowerCase().includes(zoneSearchQuery.toLowerCase()))
                              .map(zone => (
                                <button
                                  key={zone}
                                  type="button"
                                  onClick={() => {
                                    handleSelectZone(zone);
                                    setIsZoneDropdownOpen(false);
                                    setZoneSearchQuery('');
                                  }}
                                  className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                    selectedZone === zone
                                      ? 'bg-amber-500/15 text-black font-extrabold'
                                      : 'hover:bg-[#EFE6CC] text-neutral-700'
                                  }`}
                                  id={`zone-option-${zone.toLowerCase().replace(' ', '-')}`}
                                >
                                  <span>{zone}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                                    selectedZone === zone
                                      ? 'bg-amber-500/25 text-black'
                                      : 'bg-neutral-100 text-neutral-600'
                                  }`}>
                                    {zoneCounts[zone] || 0}
                                  </span>
                                </button>
                              ))}
                              
                            {/* No results state */}
                            {activeZones.filter(zone => zone.toLowerCase().includes(zoneSearchQuery.toLowerCase())).length === 0 && (
                              <div className="p-4 text-center text-xs text-neutral-500">
                                {lang === 'PT' ? 'Nenhuma localidade encontrada' : 'No location found'}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </div>

                  {/* Two separate divider rectangles: (1) Filter Icons + Spot Counter Text, (2) View Mode Icons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2.5" id="spots-control-bar">
                    
                    {/* Rectangle Divisor 1: Filter Icons + Spot Counter Text (Grouped & Left-Aligned) */}
                    <div 
                      className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-start gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-2xl border-2 border-black bg-[#F6EFDC] shadow-xs transition-all" 
                      id="spots-filters-and-counter-group"
                    >
                      {/* Filter Icons (Left-aligned) */}
                      <div className="flex items-center justify-start space-x-1 sm:space-x-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto py-0.5" id="spots-filter-icons-bar">
                        {/* Todos (Icon Only) */}
                        <button 
                          onClick={() => { handleSelectZone('All'); setSelectedStyle('All'); setShowOnlyFavorites(false); setProximitySort(false); setTopRatedSort(false); setOpenNowFilter(false); setAlphabeticalSort(false); }}
                          className={`p-2 min-w-[34px] sm:min-w-[38px] min-h-[34px] sm:min-h-[38px] rounded-xl shrink-0 transition-all flex items-center justify-center touch-target-expand cursor-pointer border-2 border-black ${
                            selectedZone === 'All' && selectedStyle === 'All' && !showOnlyFavorites && !proximitySort && !topRatedSort && !openNowFilter && !alphabeticalSort
                              ? 'bg-amber-500 text-black font-extrabold shadow-sm' 
                              : 'bg-[#F6EFDC] text-neutral-800 hover:bg-[#EFE6CC] shadow-2xs'
                          }`}
                          id="filter-all"
                          title={lang === 'PT' ? 'Todos os Spots' : 'All Spots'}
                          aria-label={lang === 'PT' ? 'Todos os Spots' : 'All Spots'}
                        >
                          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        {/* Favoritos (Icon Only) */}
                        <button 
                          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                          className={`p-2 min-w-[34px] sm:min-w-[38px] min-h-[34px] sm:min-h-[38px] rounded-xl shrink-0 transition-all flex items-center justify-center touch-target-expand cursor-pointer border-2 border-black ${
                            showOnlyFavorites 
                              ? 'bg-amber-500 text-black font-extrabold shadow-sm' 
                              : 'bg-[#F6EFDC] text-neutral-800 hover:bg-[#EFE6CC] shadow-2xs'
                          }`}
                          id="filter-favs"
                          title={lang === 'PT' ? 'Favoritos' : 'Favorites'}
                          aria-label={lang === 'PT' ? 'Favoritos' : 'Favorites'}
                        >
                          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${showOnlyFavorites ? 'fill-current text-red-600' : ''}`} />
                        </button>

                        {/* Proximidade (Icon Only) */}
                        <button 
                          onClick={() => {
                            setProximitySort(!proximitySort);
                            if (!proximitySort) {
                              setTopRatedSort(false);
                              setAlphabeticalSort(false);
                            }
                          }}
                          className={`p-2 min-w-[34px] sm:min-w-[38px] min-h-[34px] sm:min-h-[38px] rounded-xl shrink-0 transition-all flex items-center justify-center touch-target-expand cursor-pointer border-2 border-black ${
                            proximitySort 
                              ? 'bg-amber-500 text-black font-extrabold shadow-sm' 
                              : 'bg-[#F6EFDC] text-neutral-800 hover:bg-[#EFE6CC] shadow-2xs'
                          }`}
                          id="filter-proximity"
                          title={lang === 'PT' ? 'Ordenar por Proximidade' : 'Sort by Proximity'}
                          aria-label={lang === 'PT' ? 'Proximidade' : 'Proximity'}
                        >
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        {/* Top rating (Icon Only) */}
                        <button 
                          onClick={() => {
                            setTopRatedSort(!topRatedSort);
                            if (!topRatedSort) {
                              setProximitySort(false);
                              setAlphabeticalSort(false);
                            }
                          }}
                          className={`p-2 min-w-[34px] sm:min-w-[38px] min-h-[34px] sm:min-h-[38px] rounded-xl shrink-0 transition-all flex items-center justify-center touch-target-expand cursor-pointer border-2 border-black ${
                            topRatedSort 
                              ? 'bg-amber-500 text-black font-extrabold shadow-sm' 
                              : 'bg-[#F6EFDC] text-neutral-800 hover:bg-[#EFE6CC] shadow-2xs'
                          }`}
                          id="filter-top-rated"
                          title={lang === 'PT' ? 'Melhor Classificação (Top Rating)' : 'Top Rated'}
                          aria-label={lang === 'PT' ? 'Top Rating' : 'Top Rated'}
                        >
                          <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${topRatedSort ? 'fill-current text-amber-500' : ''}`} />
                        </button>

                        {/* Aberto agora (Icon Only) */}
                        <button 
                          onClick={() => setOpenNowFilter(!openNowFilter)}
                          className={`p-2 min-w-[34px] sm:min-w-[38px] min-h-[34px] sm:min-h-[38px] rounded-xl shrink-0 transition-all flex items-center justify-center touch-target-expand cursor-pointer border-2 border-black ${
                            openNowFilter 
                              ? 'bg-amber-500 text-black font-extrabold shadow-sm' 
                              : 'bg-[#F6EFDC] text-neutral-800 hover:bg-[#EFE6CC] shadow-2xs'
                          }`}
                          id="filter-open-now"
                          title={lang === 'PT' ? 'Aberto Agora' : 'Open Now'}
                          aria-label={lang === 'PT' ? 'Aberto Agora' : 'Open Now'}
                        >
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        {/* Ordem alfabética (Icon Only) */}
                        <button 
                          onClick={() => {
                            setAlphabeticalSort(!alphabeticalSort);
                            if (!alphabeticalSort) {
                              setTopRatedSort(false);
                              setProximitySort(false);
                            }
                          }}
                          className={`p-2 min-w-[34px] sm:min-w-[38px] min-h-[34px] sm:min-h-[38px] rounded-xl shrink-0 transition-all flex items-center justify-center touch-target-expand cursor-pointer border-2 border-black ${
                            alphabeticalSort 
                              ? 'bg-amber-500 text-black font-extrabold shadow-sm' 
                              : 'bg-[#F6EFDC] text-neutral-800 hover:bg-[#EFE6CC] shadow-2xs'
                          }`}
                          id="filter-alphabetical"
                          title={lang === 'PT' ? 'Ordem Alfabética (A-Z)' : 'Alphabetical Order (A-Z)'}
                          aria-label={lang === 'PT' ? 'Ordem Alfabética (A-Z)' : 'Alphabetical Order (A-Z)'}
                        >
                          <ArrowDownAZ className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>

                      {/* Spot counter text (Left-aligned inside Divisor 1) */}
                      <div className="flex items-center justify-start gap-1.5 px-0.5 py-0.5 text-left min-w-0" id="text-showing-spots-count">
                        <span className="text-[11px] sm:text-xs font-sans text-neutral-600 font-bold whitespace-nowrap text-left select-none">
                          {lang === 'PT' ? `A mostrar ${displayBars.length} de ${bars.length} spots` : `Showing ${displayBars.length} of ${bars.length} spots`}
                        </span>
                        {(selectedStyle !== 'All' || selectedZone !== 'All' || showOnlyFavorites || proximitySort || topRatedSort || openNowFilter || alphabeticalSort) && (
                          <button 
                            onClick={() => { setSelectedZone('All'); setSelectedStyle('All'); setShowOnlyFavorites(false); setProximitySort(false); setTopRatedSort(false); setOpenNowFilter(false); setAlphabeticalSort(false); }}
                            className="text-amber-600 font-extrabold text-[10px] sm:text-xs shrink-0 hover:underline cursor-pointer"
                            id="btn-reset-filters"
                            title={lang === 'PT' ? 'Limpar filtros' : 'Reset filters'}
                          >
                            ({lang === 'PT' ? 'Reset' : 'Reset'})
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Rectangle Divisor 2: View Mode Switcher (Grouped in its own separate divider box) */}
                    <div 
                      className="flex items-center justify-start sm:justify-end space-x-1 sm:space-x-1.5 p-2 sm:p-2.5 rounded-2xl border-2 border-black bg-[#F6EFDC] shadow-xs shrink-0 transition-all" 
                      id="spot-view-mode-bar"
                    >
                      {/* Lista */}
                      <button
                        type="button"
                        onClick={() => handleSetSpotViewMode('list')}
                        className={`p-2 min-w-[34px] sm:min-w-[38px] min-h-[34px] sm:min-h-[38px] rounded-xl transition-all flex items-center justify-center cursor-pointer touch-target-expand border-2 border-black ${
                          spotViewMode === 'list'
                            ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                            : 'bg-[#F6EFDC] text-neutral-800 hover:bg-[#EFE6CC] shadow-2xs'
                        }`}
                        id="btn-view-mode-list"
                        title={lang === 'PT' ? 'Lista (Cartões normais com detalhes do local)' : 'List (Normal cards with spot details)'}
                        aria-label={lang === 'PT' ? 'Lista (Cartões normais com detalhes do local)' : 'List (Normal cards with spot details)'}
                      >
                        <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>

                      {/* Mosaico */}
                      <button
                        type="button"
                        onClick={() => handleSetSpotViewMode('mosaic')}
                        className={`p-2 min-w-[34px] sm:min-w-[38px] min-h-[34px] sm:min-h-[38px] rounded-xl transition-all flex items-center justify-center cursor-pointer touch-target-expand border-2 border-black ${
                          spotViewMode === 'mosaic'
                            ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                            : 'bg-[#F6EFDC] text-neutral-800 hover:bg-[#EFE6CC] shadow-2xs'
                        }`}
                        id="btn-view-mode-mosaic"
                        title={lang === 'PT' ? 'Mosaico (2 colunas com foto de capa, classificação e nome)' : 'Mosaic (2 columns with cover photo, rating and name)'}
                        aria-label={lang === 'PT' ? 'Mosaico (2 colunas com foto de capa, classificação e nome)' : 'Mosaic (2 columns with cover photo, rating and name)'}
                      >
                        <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>

                      {/* Ícones */}
                      <button
                        type="button"
                        onClick={() => handleSetSpotViewMode('icons')}
                        className={`p-2 min-w-[34px] sm:min-w-[38px] min-h-[34px] sm:min-h-[38px] rounded-xl transition-all flex items-center justify-center cursor-pointer touch-target-expand border-2 border-black ${
                          spotViewMode === 'icons'
                            ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                            : 'bg-[#F6EFDC] text-neutral-800 hover:bg-[#EFE6CC] shadow-2xs'
                        }`}
                        id="btn-view-mode-icons"
                        title={lang === 'PT' ? 'Ícones (Grelha compacta estilo dashboard apenas com capas sem detalhes)' : 'Icons (Compact dashboard grid with cover icons only without details)'}
                        aria-label={lang === 'PT' ? 'Ícones (Grelha compacta estilo dashboard apenas com capas sem detalhes)' : 'Icons (Compact dashboard grid with cover icons only without details)'}
                      >
                        <Boxes className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* BARS LIST / MOSAIC / ICONS VIEW CONTAINER */}
                {spotViewMode === 'list' ? (
                  /* 1. LIST VIEW (Normal cards with full spot details) */
                  <div className="flex flex-col gap-3.5" id="spots-view-list">
                    {displayBars.map(bar => {
                      const isFaved = user.favorites.includes(bar.id);
                      const openStatus = getBarOpenStatus(bar, lang);
                      const beerNews = getBarBeerNews(bar, lang);
                      return (
                        <div 
                          key={bar.id}
                          className="rounded-2xl overflow-hidden border-2 border-[#1B2036] bg-[#F6EFDC] text-[#1B2036] shadow-[3px_3px_0px_#1B2036] transition-all duration-300 flex flex-col sm:flex-row items-stretch sm:items-center p-3.5 gap-3.5 hover:bg-[#EFE6CC]"
                        >
                          {/* Thumbnail Header */}
                          <div 
                            className="relative w-full sm:w-36 h-36 sm:h-28 rounded-xl overflow-hidden cursor-pointer shrink-0 border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036]" 
                            onClick={() => handleSelectBar(bar)}
                          >
                            <img 
                              src={bar.coverPhoto} 
                              alt={bar.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:hidden" />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#1B2036] text-[7.5px] font-bold text-[#F2A93B] uppercase border border-[#1B2036]">
                              {bar.zone.replace('Portugal ', '')}
                            </div>
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-[#1B2036] text-[9px] font-bold flex items-center space-x-1 text-[#F2A93B] border border-[#1B2036]">
                              <Star className="w-2.5 h-2.5 fill-current text-[#F2A93B]" />
                              <span>{bar.rating.toFixed(1)}</span>
                            </div>
                          </div>

                          {/* Info & Details */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <h3 
                                onClick={() => handleSelectBar(bar)}
                                className="font-bold text-sm sm:text-base tracking-tight font-display truncate hover:text-[#12908C] text-[#1B2036] transition-colors cursor-pointer"
                              >
                                {bar.name}
                              </h3>
                              <span className="text-[#1B2036]/70 font-mono text-[10.5px] shrink-0 font-semibold">
                                📍 {bar.distance.toFixed(1)} km
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[8.5px] font-bold border-2 border-[#1B2036] shadow-[1px_1px_0px_#1B2036] ${openStatus.colorClass}`}>
                                {openStatus.statusText}
                              </span>
                              <CompactSpotVibeBadge spotId={bar.id} lang={lang} />
                            </div>

                            {beerNews && (
                              <div className="p-2 rounded-xl border-2 border-[#1B2036] bg-[#EFE6CC] text-[#1B2036] shadow-[2px_2px_0px_#1B2036] transition-all">
                                <span className="font-extrabold text-[#E85B41] text-[8.5px] font-display uppercase tracking-wider block mb-0.5">
                                  {lang === 'PT' ? 'Novidade cervejeira:' : 'Beer release:'}
                                </span>
                                <p className="text-[9.5px] italic leading-snug line-clamp-2 text-[#1B2036]">
                                  {beerNews}
                                </p>
                              </div>
                            )}

                            <div className="pt-0.5">
                              <SpotFeatureBadges bar={bar} lang={lang} compact={true} />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 sm:border-l border-[#1B2036]/20 sm:pl-3.5">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(bar.id); }}
                              className={`w-8.5 h-8.5 rounded-xl border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] flex items-center justify-center transition cursor-pointer active:scale-95 ${
                                isFaved ? 'bg-[#E85B41] text-white' : 'bg-[#EFE6CC] hover:bg-[#F2A93B] text-[#1B2036]'
                              }`}
                              id={`btn-fav-list-${bar.id}`}
                              title={lang === 'PT' ? (isFaved ? "Remover dos Favoritos" : "Adicionar aos Favoritos") : (isFaved ? "Remove Favorite" : "Add to Favorites")}
                              aria-label={lang === 'PT' ? (isFaved ? "Remover dos Favoritos" : "Adicionar aos Favoritos") : (isFaved ? "Remove Favorite" : "Add to Favorites")}
                            >
                              <Heart className={`w-4 h-4 ${isFaved ? 'fill-white text-white' : 'text-[#1B2036]'}`} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setShareBarModal(bar); }}
                              className="w-8.5 h-8.5 rounded-xl border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] bg-[#EFE6CC] hover:bg-[#F2A93B] text-[#1B2036] flex items-center justify-center transition cursor-pointer active:scale-95"
                              id={`btn-share-list-${bar.id}`}
                              title={lang === 'PT' ? "Partilhar Spot" : "Share Spot"}
                              aria-label={lang === 'PT' ? "Partilhar Spot" : "Share Spot"}
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                trackSpotDirections(bar, user, 'google_maps');
                                window.open(getBarGoogleMapsUrl(bar.id, bar.address), '_blank'); 
                              }}
                              className="w-8.5 h-8.5 rounded-xl border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] bg-[#EFE6CC] hover:bg-[#12908C] hover:text-white text-[#1B2036] flex items-center justify-center transition cursor-pointer active:scale-95"
                              id={`btn-viewmap-list-${bar.id}`}
                              title={lang === 'PT' ? "Como Chegar (Google Maps)" : "Directions (Google Maps)"}
                              aria-label={lang === 'PT' ? "Como Chegar (Google Maps)" : "Directions (Google Maps)"}
                            >
                              <Navigation className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : spotViewMode === 'icons' ? (
                  /* 2. ICONS VIEW (Compact dashboard grid with cover icons only and NO details) */
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-3.5" id="spots-view-icons">
                    {displayBars.map(bar => {
                      const isFaved = user.favorites.includes(bar.id);
                      return (
                        <div 
                          key={bar.id}
                          onClick={() => handleSelectBar(bar)}
                          className="rounded-2xl p-2 border-2 border-[#1B2036] bg-[#F6EFDC] text-[#1B2036] shadow-[3px_3px_0px_#1B2036] hover:bg-[#EFE6CC] transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer group hover:scale-[1.03] active:scale-97 relative"
                          id={`spot-icon-${bar.id}`}
                          title={bar.name}
                          aria-label={bar.name}
                        >
                          {/* Favorite Indicator Badge */}
                          {isFaved && (
                            <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-[#E85B41] text-white flex items-center justify-center border border-[#1B2036]">
                              <Heart className="w-2.5 h-2.5 fill-current" />
                            </div>
                          )}

                          {/* Cover / Avatar Icon */}
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-md border-2 border-[#1B2036] transition-colors shrink-0">
                            <img 
                              src={bar.coverPhoto} 
                              alt={bar.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300" 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* 3. MOSAIC VIEW (2 columns with cover photo, rating, and spot name) */
                  <div className="grid grid-cols-2 gap-3 sm:gap-4" id="spots-view-mosaic">
                    {displayBars.map(bar => {
                      return (
                        <div 
                          key={bar.id}
                          onClick={() => handleSelectBar(bar)}
                          className="rounded-2xl overflow-hidden border-2 border-[#1B2036] bg-[#F6EFDC] text-[#1B2036] shadow-[3px_3px_0px_#1B2036] hover:bg-[#EFE6CC] transition-all duration-300 flex flex-col cursor-pointer group hover:scale-[1.01] active:scale-[0.99]"
                          id={`spot-mosaic-${bar.id}`}
                        >
                          {/* Photo header */}
                          <div className="relative h-28 sm:h-36 w-full overflow-hidden border-b-2 border-[#1B2036]">
                            <img 
                              src={bar.coverPhoto} 
                              alt={bar.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                            {/* Quick Rating badge */}
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-[#1B2036] text-[9px] sm:text-[10px] font-bold flex items-center space-x-1 text-[#F2A93B] border border-[#1B2036] z-10 pointer-events-none">
                              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current text-[#F2A93B]" />
                              <span>{bar.rating.toFixed(1)}</span>
                            </div>
                          </div>

                          {/* Spot Name */}
                          <div className="p-2.5 sm:p-3 space-y-1 bg-[#F6EFDC]">
                            <h3 className="font-bold text-xs sm:text-sm tracking-tight font-display line-clamp-1 transition-colors text-[#1B2036] group-hover:text-[#12908C]">
                              {bar.name}
                            </h3>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {displayBars.length === 0 && (
                  <div className="text-center py-10 space-y-2 col-span-full">
                    <p className="text-zinc-500 text-xs">
                      {lang === 'PT' ? 'Nenhum spot de cerveja artesanal encontrado com estes filtros.' : 'No craft beer spots found with these filters.'}
                    </p>
                    <button 
                      onClick={() => { setSelectedZone('All'); setSelectedStyle('All'); setShowOnlyFavorites(false); }}
                      className="text-amber-500 font-bold text-xs cursor-pointer hover:underline"
                    >
                      {lang === 'PT' ? 'Resetar Filtros' : 'Reset Filters'}
                    </button>
                  </div>
                )}

                {/* SUGGEST A SPOT BUTTON BANNER */}
                <div className={`mt-6 p-4 rounded-2xl border text-center flex flex-col sm:flex-row items-center justify-between gap-3 transition-all ${
                  darkMode ? 'bg-amber-500/10 border-amber-500/20 text-white' : 'bg-amber-50 border-amber-200 text-neutral-900 shadow-xs'
                }`}>
                  <div className="text-left space-y-0.5">
                    <p className="text-xs font-bold font-display">
                      {lang === 'PT' ? 'Conheces um spot que não está no HOP-MAP? Sugere aqui.' : 'Know a spot that is not on HOP-MAP? Suggest it here.'}
                    </p>
                  </div>
                  <a
                    href="mailto:cobeertaste@gmail.com?subject=Sugest%C3%A3o%20de%20Spot%20para%20o%20HOP-MAP"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition shadow-sm font-display whitespace-nowrap shrink-0 cursor-pointer"
                    id="btn-suggest-spot"
                  >
                    Sugere aqui 🍻
                  </a>
                </div>


              </motion.div>
            )}

            {/* VIEW B: ROTAS / HOP CRAWL WALKING ROUTES & MAP */}
            {activeTab === 'routes' && (
              <HopCrawlRoute
                bars={bars}
                userLocation={userLocation}
                lang={lang}
                darkMode={darkMode}
                onSelectBar={(bar) => handleSelectBar(bar)}
                selectedBar={selectedBar}
                proximitySort={proximitySort}
                onNavigateToMap={() => {
                  document.getElementById('hop-route-map-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* VIEW C: ESPECIAL EVENTS & FESTIVALS */}
            {activeTab === 'events' && (
              <motion.div 
                key="events-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 space-y-4 font-sans"
              >
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight uppercase flex items-center space-x-1.5 text-black">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>{lang === 'PT' ? 'Festivais & Eventos Especiais' : 'Festivals & Special Events'}</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {lang === 'PT' ? 'Explora os festivais e eventos de cerveja artesanal em Portugal' : 'Explore craft beer festivals and events in Portugal'}
                  </p>
                </div>

                {/* GPS Real-time Geolocation Status Bar */}
                <div className={`p-4 rounded-3xl border ${
                  darkMode ? 'bg-neutral-900/60 border-white/5 text-white' : 'bg-zinc-50 border-neutral-200 text-zinc-900 shadow-sm'
                } flex items-center justify-between gap-4`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-mono block">
                        {lang === 'PT' ? 'A tua geolocalização' : 'Your geolocation'}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold font-display">{getCurrentCityName()}</span>
                        <span className="text-[8px] text-zinc-500 font-mono">({userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)})</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined' && navigator.geolocation) {
                        triggerSelfPush(
                          lang === 'PT' ? 'A obter GPS... 🛰️' : 'Getting GPS... 🛰️',
                          lang === 'PT' ? 'A sincronizar coordenadas em tempo real do GPS nativo com precisão máxima...' : 'Syncing real-time native GPS coordinates with high accuracy...',
                          'system'
                        );
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setUserLocation({
                              latitude: position.coords.latitude,
                              longitude: position.coords.longitude
                            });
                            triggerSelfPush(
                              lang === 'PT' ? 'GPS Sincronizado! 📡' : 'GPS Synced! 📡',
                              `Coordenadas atualizadas para ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}!`,
                              'system'
                            );
                          },
                          (error) => {
                            let errorMsg = `Não foi possível obter a tua localização: ${error.message}`;
                            if (error.code === error.PERMISSION_DENIED) {
                              errorMsg = lang === 'PT' ? 'Para fazeres check-in, por favor ativa o GPS nas definições do teu navegador/telemóvel.' : 'To check-in, please enable GPS in your device/browser settings.';
                            } else if (error.code === error.POSITION_UNAVAILABLE) {
                              errorMsg = lang === 'PT' ? 'A informação do GPS está indisponível de momento.' : 'GPS info is currently unavailable.';
                            } else if (error.code === error.TIMEOUT) {
                              errorMsg = lang === 'PT' ? 'O tempo limite do GPS expirou. Tenta novamente num local com melhor sinal.' : 'GPS request timed out. Try again in an open area.';
                            }
                            triggerSelfPush(
                              'Erro de GPS ❌',
                              errorMsg,
                              'system'
                            );
                          },
                          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                        );
                      } else {
                        triggerSelfPush(
                          'GPS Indisponível ❌',
                          lang === 'PT' ? 'O navegador não suporta geolocalização.' : 'Browser does not support geolocation.',
                          'system'
                        );
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1 text-[9px] font-bold font-mono transition-all uppercase ${
                      darkMode 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                        : 'bg-amber-500/5 border-amber-500/20 text-amber-600 hover:bg-amber-500/10'
                    }`}
                  >
                    <Navigation className="w-2.5 h-2.5" />
                    <span>{lang === 'PT' ? 'Sincronizar GPS' : 'Sync GPS'}</span>
                  </button>
                </div>

                {/* CoBeer Taste Information Banner (Full Width) */}
                <div className="w-full">
                  <a 
                    href="https://www.cobeertaste.com/eventos" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[11px] sm:text-xs py-3 px-4 rounded-2xl transition-all duration-150 shadow-md shadow-amber-500/15 active:scale-[0.99] font-display text-center"
                    id="btn-cobeer-taste-link"
                  >
                    <span>{lang === 'PT' ? 'Mais informações no site Cobeer Taste' : 'More information on Cobeer Taste website'}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>

                {/* Festivals View Mode Bar + Counter */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-2xl border-2 border-black bg-[#F6EFDC] text-zinc-900 shadow-xs transition-all" id="festivals-control-bar">
                  <span className="text-[11px] sm:text-xs font-sans text-neutral-600 font-bold whitespace-nowrap pl-1 select-none">
                    {lang === 'PT' ? `A mostrar ${events.length} festivais` : `Showing ${events.length} festivals`}
                  </span>

                  <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0" id="festival-view-mode-bar">
                    {/* Lista */}
                    <button
                      type="button"
                      onClick={() => handleSetFestivalViewMode('list')}
                      className={`p-2 min-w-[34px] sm:min-w-[38px] min-h-[34px] sm:min-h-[38px] rounded-xl transition-all flex items-center justify-center cursor-pointer touch-target-expand border-2 border-black ${
                        festivalViewMode === 'list'
                          ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                          : 'bg-[#F6EFDC] text-neutral-800 hover:bg-[#EFE6CC] shadow-2xs'
                      }`}
                      id="btn-festival-view-mode-list"
                      title={lang === 'PT' ? 'Lista (Cartões com detalhes do festival)' : 'List (Cards with festival details)'}
                      aria-label={lang === 'PT' ? 'Lista (Cartões com detalhes do festival)' : 'List (Cards with festival details)'}
                    >
                      <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    {/* Mosaico */}
                    <button
                      type="button"
                      onClick={() => handleSetFestivalViewMode('mosaic')}
                      className={`p-2 min-w-[34px] sm:min-w-[38px] min-h-[34px] sm:min-h-[38px] rounded-xl transition-all flex items-center justify-center cursor-pointer touch-target-expand border-2 border-black ${
                        festivalViewMode === 'mosaic'
                          ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                          : 'bg-[#F6EFDC] text-neutral-800 hover:bg-[#EFE6CC] shadow-2xs'
                      }`}
                      id="btn-festival-view-mode-mosaic"
                      title={lang === 'PT' ? 'Mosaico (2 colunas com capa e nome)' : 'Mosaic (2 columns with cover and name)'}
                      aria-label={lang === 'PT' ? 'Mosaico (2 colunas com capa e nome)' : 'Mosaic (2 columns with cover and name)'}
                    >
                      <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    {/* Ícones */}
                    <button
                      type="button"
                      onClick={() => handleSetFestivalViewMode('icons')}
                      className={`p-2 min-w-[34px] sm:min-w-[38px] min-h-[34px] sm:min-h-[38px] rounded-xl transition-all flex items-center justify-center cursor-pointer touch-target-expand border-2 border-black ${
                        festivalViewMode === 'icons'
                          ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                          : 'bg-[#F6EFDC] text-neutral-800 hover:bg-[#EFE6CC] shadow-2xs'
                      }`}
                      id="btn-festival-view-mode-icons"
                      title={lang === 'PT' ? 'Ícones (Grelha compacta estilo dashboard)' : 'Icons (Compact dashboard grid)'}
                      aria-label={lang === 'PT' ? 'Ícones (Grelha compacta estilo dashboard)' : 'Icons (Compact dashboard grid)'}
                    >
                      <Boxes className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* FESTIVALS CONTENT VIEW */}
                {(() => {
                  const sortedEvents = [...events].sort((a, b) => {
                    const now = new Date().getTime();
                    const isEndedA = a.endDate ? new Date(a.endDate + 'T23:59:59').getTime() < now : false;
                    const isEndedB = b.endDate ? new Date(b.endDate + 'T23:59:59').getTime() < now : false;

                    if (isEndedA !== isEndedB) {
                      return isEndedA ? 1 : -1;
                    }

                    if (!isEndedA && !isEndedB) {
                      const timeA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
                      const timeB = b.endDate ? new Date(b.endDate).getTime() : Infinity;
                      const diffA = Math.abs(timeA - now);
                      const diffB = Math.abs(timeB - now);

                      if (diffA !== diffB) {
                        return diffA - diffB;
                      }
                    }

                    const dateA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
                    const dateB = b.endDate ? new Date(b.endDate).getTime() : Infinity;
                    return dateA - dateB;
                  });

                  if (festivalViewMode === 'icons') {
                    /* 1. ICONS VIEW FOR FESTIVALS */
                    return (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3.5" id="festivals-view-icons">
                        {sortedEvents.map(ev => {
                          const isEnded = ev.endDate ? new Date(ev.endDate + 'T23:59:59') < new Date() : false;
                          const isCheckedIn = user.checkedInFestivals?.includes(ev.id);
                          return (
                            <div 
                              key={ev.id}
                              onClick={() => setSelectedFestival(ev)}
                              className="rounded-2xl p-2 border-2 border-black bg-[#F6EFDC] text-zinc-900 shadow-[3px_3px_0px_#000000] transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer group hover:scale-[1.03] active:scale-97 relative"
                              id={`festival-icon-${ev.id}`}
                              title={ev.title}
                              aria-label={ev.title}
                            >
                              {isCheckedIn && (
                                <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-emerald-500/80 backdrop-blur-sm text-white flex items-center justify-center border border-emerald-400/50 text-[10px] font-bold">
                                  ✓
                                </div>
                              )}
                              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-md border-2 border-black group-hover:border-amber-500 transition-colors shrink-0">
                                {ev.coverPhoto ? (
                                  <img 
                                    src={ev.coverPhoto} 
                                    alt={ev.title} 
                                    referrerPolicy="no-referrer"
                                    className={`w-full h-full object-cover group-hover:scale-108 transition-transform duration-300 ${isEnded ? 'grayscale opacity-75 contrast-75 brightness-75' : ''}`} 
                                  />
                                ) : (
                                  <div className="w-full h-full bg-neutral-200 flex items-center justify-center" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  if (festivalViewMode === 'mosaic') {
                    /* 2. MOSAIC VIEW FOR FESTIVALS (2 columns) */
                    return (
                      <div className="grid grid-cols-2 gap-3 sm:gap-4" id="festivals-view-mosaic">
                        {sortedEvents.map(ev => {
                          const isEnded = ev.endDate ? new Date(ev.endDate + 'T23:59:59') < new Date() : false;
                          const isCheckedIn = user.checkedInFestivals?.includes(ev.id);
                          return (
                            <div 
                              key={ev.id}
                              onClick={() => setSelectedFestival(ev)}
                              className="rounded-2xl overflow-hidden border-2 border-black bg-[#F6EFDC] text-zinc-900 shadow-[3px_3px_0px_#000000] transition-all duration-300 flex flex-col cursor-pointer group hover:scale-[1.01] active:scale-[0.99]"
                              id={`festival-mosaic-${ev.id}`}
                            >
                              <div className="relative h-28 sm:h-36 w-full overflow-hidden">
                                {ev.coverPhoto ? (
                                  <img 
                                    src={ev.coverPhoto} 
                                    alt={ev.title} 
                                    referrerPolicy="no-referrer"
                                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isEnded ? 'grayscale opacity-75 contrast-75 brightness-75' : ''}`} 
                                  />
                                ) : (
                                  <div className="w-full h-full bg-neutral-200 flex items-center justify-center" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                
                                <div className="absolute top-2 left-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[7px] sm:text-[8px] font-bold text-amber-500 tracking-wider">
                                  {ev.category.toUpperCase()}
                                </div>

                                {isCheckedIn ? (
                                  <div className="absolute top-2 right-2 rounded-full bg-emerald-600/90 text-white backdrop-blur-md border border-emerald-400/30 px-2 py-0.5 text-[7px] sm:text-[8px] font-bold tracking-wider">
                                    ✓ {lang === 'PT' ? 'Check-in' : 'Checked In'}
                                  </div>
                                ) : isEnded ? (
                                  <div className="absolute top-2 right-2 rounded-full bg-black/70 text-zinc-400 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[7px] sm:text-[8px] font-bold tracking-wider">
                                    {lang === 'PT' ? 'Terminado' : 'Ended'}
                                  </div>
                                ) : ev.date === 'Sem data' ? (
                                  <div className="absolute top-2 right-2 rounded-full bg-purple-900/80 text-purple-300 backdrop-blur-md border border-purple-400/30 px-2 py-0.5 text-[7px] sm:text-[8px] font-bold tracking-wider">
                                    {lang === 'PT' ? 'Indefinido' : 'TBD'}
                                  </div>
                                ) : (
                                  <div className="absolute top-2 right-2 rounded-full bg-emerald-900/80 text-emerald-300 backdrop-blur-md border border-emerald-400/30 px-2 py-0.5 text-[7px] sm:text-[8px] font-bold tracking-wider">
                                    {lang === 'PT' ? 'Ativo' : 'Active'}
                                  </div>
                                )}
                              </div>

                              <div className="p-2.5 sm:p-3 space-y-1">
                                <h3 className="font-bold text-xs sm:text-sm tracking-tight font-display line-clamp-1 transition-colors text-zinc-900 group-hover:text-amber-600">
                                  {ev.title}
                                </h3>
                                <p className="text-[9.5px] sm:text-[10.5px] text-zinc-500 font-mono line-clamp-1">
                                  📍 {ev.location || 'N/A'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  /* 3. LIST VIEW FOR FESTIVALS (Default full card) */
                  return (
                    <div className="space-y-4" id="festivals-view-list">
                      {sortedEvents.map(ev => {
                        const isEnded = ev.endDate ? new Date(ev.endDate + 'T23:59:59') < new Date() : false;
                        return (
                          <div 
                            key={ev.id}
                            className="rounded-2xl sm:rounded-3xl border-2 border-black bg-[#F6EFDC] text-zinc-900 shadow-[3px_3px_0px_#000000] overflow-hidden transition-all duration-300"
                          >
                            <div className="relative h-36 w-full cursor-pointer" onClick={() => setSelectedFestival(ev)}>
                              {ev.coverPhoto ? (
                                <img 
                                  src={ev.coverPhoto} 
                                  alt={ev.title} 
                                  referrerPolicy="no-referrer"
                                  className={`w-full h-full object-cover transition-all duration-300 ${isEnded ? 'grayscale opacity-75 contrast-75 brightness-75' : ''}`} 
                                />
                              ) : (
                                <div className="w-full h-full transition-all duration-300 bg-neutral-200 flex items-center justify-center" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                              <div className="absolute top-2.5 left-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-0.5 text-[8px] font-bold text-amber-500 tracking-wider">
                                {ev.category.toUpperCase()}
                              </div>
                              <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 backdrop-blur-md border px-2.5 py-0.5 text-[8px] font-bold tracking-wider">
                                {isEnded ? (
                                  <span className="text-zinc-400">{lang === 'PT' ? 'Terminado' : 'Ended'}</span>
                                ) : ev.date === 'Sem data' ? (
                                  <span className="text-purple-400">{lang === 'PT' ? 'Indefinido' : 'TBD'}</span>
                                ) : (
                                  <span className="text-emerald-400">{lang === 'PT' ? 'Ativo' : 'Active'}</span>
                                )}
                              </div>
                            </div>

                            <div className="p-4 space-y-2.5">
                              <h4 
                                onClick={() => setSelectedFestival(ev)}
                                className="font-bold text-sm font-display mt-0.5 hover:text-amber-600 transition-colors cursor-pointer text-zinc-900"
                              >
                                {ev.title}
                              </h4>
                              <div className="flex items-center space-x-3 text-[9px] text-zinc-500 font-mono">
                                <span>📅 {getEventDate(ev, lang)}</span>
                                <span>📍 {ev.location || 'N/A'}</span>
                              </div>
                              <p className="text-[10px] text-zinc-600 leading-relaxed">{getEventDescription(ev, lang)}</p>
                              
                              {/* Check-In Interaction Block */}
                              <div className="pt-2.5 border-t border-zinc-200 flex items-center justify-between gap-4">
                                <div className="flex items-center space-x-1.5">
                                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                                  <span className="text-[10px] font-bold text-amber-700 font-mono">+2 HOPS</span>
                                </div>
                                
                                {(() => {
                                  const isCheckedIn = user.checkedInFestivals?.includes(ev.id);
                                  const isIndefinido = ev.date === 'Sem data';
                                  
                                  if (isCheckedIn) {
                                    return (
                                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-[10px] bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-mono">
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span>✓ {lang === 'PT' ? 'Check-in Efetuado' : 'Checked In'}</span>
                                      </span>
                                    );
                                  }
                                  
                                  if (isEnded) {
                                    return (
                                      <button
                                        disabled
                                        className="opacity-50 cursor-not-allowed bg-zinc-200 text-zinc-600 font-bold text-[9px] px-3 py-1.5 rounded-xl border border-zinc-400"
                                      >
                                        {lang === 'PT' ? 'Festival Terminado' : 'Festival Ended'}
                                      </button>
                                    );
                                  }
                                  
                                  if (isIndefinido) {
                                    return (
                                      <button
                                        disabled
                                        className="opacity-50 cursor-not-allowed bg-zinc-200 text-zinc-600 font-bold text-[9px] px-3 py-1.5 rounded-xl border border-zinc-400"
                                      >
                                        {lang === 'PT' ? 'Check-in Indisponível (Sem data)' : 'Check-in Unavailable (TBD)'}
                                      </button>
                                    );
                                  }
                                  
                                  const eventCoords = CITY_COORDINATES[ev.location];
                                  let isWithin200m = false;
                                  let distanceInMeters = Infinity;
                                  if (eventCoords) {
                                    distanceInMeters = getDistanceInKm(
                                      userLocation.latitude,
                                      userLocation.longitude,
                                      eventCoords.latitude,
                                      eventCoords.longitude
                                    ) * 1000;
                                    isWithin200m = distanceInMeters <= 200;
                                  }

                                  const formatDistance = (meters: number): string => {
                                    if (meters === Infinity) return 'N/A';
                                    if (meters < 1000) return `${Math.round(meters)}m`;
                                    return `${(meters / 1000).toFixed(1)}km`;
                                  };

                                  return (
                                    <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1.5 sm:space-y-0 sm:space-x-3">
                                      <span className="text-[9px] text-zinc-500 font-mono text-right leading-tight block">
                                        {isWithin200m ? (
                                          <span className="text-amber-600 font-bold">
                                            {lang === 'PT' ? 'No raio de 200m' : 'Within 200m range'}
                                          </span>
                                        ) : (
                                          <span>
                                            {lang === 'PT' ? (
                                              <>Estás a <strong className="text-zinc-700">{formatDistance(distanceInMeters)}</strong> de {ev.location}</>
                                            ) : (
                                              <>You are <strong className="text-zinc-700">{formatDistance(distanceInMeters)}</strong> away from {ev.location}</>
                                            )}
                                          </span>
                                        )}
                                      </span>
                                      <PixelCheckinAnimation
                                        isActive={animatingCheckinEventId === ev.id}
                                        onClick={() => handleFestivalCheckin(ev.id)}
                                        containerClassName="shrink-0 w-auto"
                                        className={`font-extrabold text-[9px] px-3.5 py-1.5 rounded-xl transition-all font-display shadow-md cursor-pointer whitespace-nowrap ${
                                          isWithin200m 
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black border-2 border-black' 
                                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-2 border-black'
                                        }`}
                                      >
                                        {lang === 'PT' ? 'Efetuar Check-in' : 'Check-in'}
                                      </PixelCheckinAnimation>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* VIEW D: GAMIFIED LOYALTY CARD */}
            {activeTab === 'loyalty' && (
              <motion.div 
                key="loyalty-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 space-y-4 font-sans"
              >
                {/* Points overview header */}
                <div className="bg-[#EFE6CC] p-5 rounded-3xl border-3 border-[#1B2036] flex items-center justify-between text-[#1B2036] shadow-[4px_4px_0px_#1B2036] relative overflow-hidden">
                  {(() => {
                    const details = getLevelDetails(user.points, lang);
                    let percent = 100;
                    if (details.nextMeta) {
                      const currentLevelThreshold = user.points >= 91 ? 91 : user.points >= 71 ? 71 : user.points >= 46 ? 46 : user.points >= 26 ? 26 : user.points >= 11 ? 11 : 0;
                      const range = details.nextMeta.count - currentLevelThreshold;
                      const progress = user.points - currentLevelThreshold;
                      percent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
                    }
                    return (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 flex-wrap border-b-2 border-[#1B2036]/20 pb-2">
                            <div>
                              <h4 className="text-[9px] font-bold text-[#E85B41] tracking-widest uppercase font-display">
                                {lang === 'PT' ? 'PONTUAÇÃO' : 'POINTS'}
                              </h4>
                              <span className="text-xl font-extrabold block font-display tracking-tight text-[#1B2036]">{user.points} HOPS</span>
                            </div>
                            <span className="text-[#1B2036]/30 text-lg font-light self-center">|</span>
                            <div>
                              <h4 className="text-[9px] font-bold text-[#E85B41] tracking-widest uppercase font-display">
                                {lang === 'PT' ? 'RANKING' : 'RANK'}
                              </h4>
                              <span className={`text-xs flex items-center gap-1 font-mono font-bold mt-0.5 ${details.isSecret ? 'animate-legendary font-black text-[#E85B41]' : 'text-[#12908C]'}`}>
                                <span className="text-sm select-none">{details.badge}</span>
                                {details.title}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5 pt-0.5">
                            <Award className="w-3.5 h-3.5 text-[#F2A93B] shrink-0" />
                            <span className="text-[9.5px] text-[#1B2036]/80 font-medium">
                              {details.nextMeta 
                                ? (lang === 'PT' 
                                    ? `Próximo ranking: ${details.nextMeta.count} HOPS (${details.nextMeta.title})` 
                                    : `Next rank: ${details.nextMeta.count} HOPS (${details.nextMeta.title})`)
                                : (lang === 'PT' ? `Nível Máximo Atingido! 🍻` : `Max Level Reached! 🍻`)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-center shrink-0 pl-2">
                          <div className="w-13 h-13 rounded-full border-3 border-[#1B2036] flex items-center justify-center font-bold text-xs text-[#12908C] bg-[#F6EFDC] shadow-[2px_2px_0px_#1B2036] font-display">
                            {percent}%
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>


                {/* Stamp card selection list */}
                <div className="space-y-3.5">
                  <div className="pl-1">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#1B2036] font-display">
                      {lang === 'PT' ? 'Cartão de Check-ins (10 por Spot)' : 'Check-in Card (10 per Spot)'}
                    </h4>
                    <p className="text-[10px] text-[#1B2036]/70 mt-0.5 font-body">
                      {lang === 'PT' 
                        ? 'Visite spots, faça check-ins verificados e complete o teu roteiro cervejeiro!' 
                        : 'Visit spots, validate check-ins, and complete your craft beer journey!'}
                    </p>
                    <p className="text-[9px] text-[#1B2036]/60 italic mt-1 leading-normal font-body">
                      {lang === 'PT' 
                        ? 'Nota: Check-in apenas válido quando estás no local' 
                        : 'Note: Check-in only valid when you are at the spot'}
                    </p>
                  </div>
                  
                  {/* Search input for loyalty spots */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#1B2036]/50" />
                    <input 
                      type="text" 
                      placeholder={lang === 'PT' ? "Pesquisar spot pelo nome..." : "Search spot by name..."}
                      value={loyaltySearchQuery}
                      onChange={e => setLoyaltySearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-2xl border-2 border-[#1B2036] bg-[#F6EFDC] text-[#1B2036] placeholder-[#1B2036]/50 focus:bg-white shadow-[2px_2px_0px_#1B2036] transition-all font-body"
                      id="input-loyalty-search"
                    />
                    {loyaltySearchQuery && (
                      <button 
                        type="button"
                        onClick={() => setLoyaltySearchQuery('')}
                        className="absolute right-3.5 top-3 text-[#1B2036]/60 hover:text-[#1B2036] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {(() => {
                      const filtered = bars.filter(b => 
                        b.name.toLowerCase().includes(loyaltySearchQuery.toLowerCase())
                      );
                      const sortedBars = [...filtered].sort((a, b) => {
                        const stampsA = user.stamps[b.id] || 0;
                        const stampsB = user.stamps[b.id] || 0;
                        if (stampsB !== stampsA) {
                          return stampsB - stampsA; // Most stamps first
                        }
                        const distA = getHaversineDistanceInMeters(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
                        const distB = getHaversineDistanceInMeters(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
                        return distA - distB; // Closest first
                      });
                      
                      const displayList = showAllLoyaltySpots ? sortedBars : sortedBars.slice(0, 5);
                      
                      return (
                        <>
                          {displayList.map(bar => {
                            const userStamps = user.stamps[bar.id] || 0;
                            const distM = getHaversineDistanceInMeters(userLocation.latitude, userLocation.longitude, bar.latitude, bar.longitude);
                            const isNear = distM <= 50;
                            const isBlocked = isSpotStampsBlocked(bar.id);
                            return (
                              <div 
                                key={bar.id}
                                className="border-2 border-[#1B2036] rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 bg-[#F6EFDC] text-[#1B2036] shadow-[3px_3px_0px_#1B2036] hover:bg-[#EFE6CC]"
                              >
                                <div className="flex justify-between items-center p-2 rounded-xl -m-1 mb-2.5 gap-2.5 bg-[#EFE6CC] border-b-2 border-[#1B2036]">
                                  <div className="pl-1 min-w-0 flex-1">
                                    <h5 className="text-[11px] font-extrabold leading-tight font-display truncate text-[#1B2036]">{bar.name}</h5>
                                    <span className={`text-[8.5px] font-mono font-bold uppercase tracking-wider block mt-1 ${isBlocked ? 'text-[#E85B41]' : isNear ? 'text-[#12908C] animate-pulse' : 'text-[#1B2036]/60'}`}>
                                      {isBlocked 
                                        ? (lang === 'PT' ? 'Concluído (10 Check-ins Atingidos) 🔒' : 'Completed (10 Check-ins Reached) 🔒') 
                                        : isNear 
                                          ? (lang === 'PT' ? `Estás no local (${Math.round(distM)}m)` : `You are at the spot (${Math.round(distM)}m)`) 
                                          : (lang === 'PT' ? `Distância: ${Math.round(distM)}m` : `Distance: ${Math.round(distM)}m`)}
                                    </span>
                                  </div>
                                  {isBlocked ? (
                                    <button
                                      disabled
                                      className="bg-[#1B2036]/20 text-[#1B2036]/50 font-extrabold text-[9px] px-3 py-1.5 rounded-xl border-2 border-[#1B2036]/30 font-display shrink-0 cursor-not-allowed opacity-50 whitespace-nowrap"
                                      id={`btn-checkin-${bar.id}`}
                                    >
                                      {lang === 'PT' ? 'Bloqueado ❌' : 'Locked ❌'}
                                    </button>
                                  ) : (
                                    <PixelCheckinAnimation
                                      isActive={animatingCheckinBarId === bar.id}
                                      onClick={() => initiateCheckin(bar)}
                                      containerClassName="shrink-0 w-auto"
                                      className="bg-[#12908C] hover:bg-[#0E7370] text-white border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] font-extrabold text-[9px] px-3.5 py-1.5 rounded-xl transition font-label shrink-0 cursor-pointer whitespace-nowrap active:scale-95"
                                      id={`btn-checkin-${bar.id}`}
                                    >
                                      Check-in
                                    </PixelCheckinAnimation>
                                  )}
                                </div>

                                {/* Stamp Holes display (iOS native stamp visual) */}
                                <div className="flex flex-col gap-2.5 pt-3 border-t-2 border-[#1B2036]/15 mt-2">
                                  <div className="flex flex-wrap gap-1.5">
                                    {[...Array(10)].map((_, i) => {
                                      const isFilled = i < userStamps || (animatingStampBarId === bar.id && newlyAddedStampIndex === i);
                                      const isAnimatingThis = animatingStampBarId === bar.id && newlyAddedStampIndex === i;
                                      return (
                                        <div 
                                          key={i} 
                                          className={`relative w-6.5 h-6.5 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                            isBlocked
                                              ? 'bg-[#E85B41]/20 border-[#E85B41] text-[#E85B41] scale-95 opacity-50'
                                              : isFilled 
                                                ? 'bg-[#F2A93B] border-[#1B2036] text-[#1B2036] scale-105 shadow-[1px_1px_0px_#1B2036]' 
                                                : 'bg-[#EFE6CC] border-[#1B2036] text-[#1B2036]/60 shadow-[1px_1px_0px_#1B2036]'
                                          } ${isAnimatingThis ? 'shadow-[0_0_15px_rgba(242,169,59,0.9)] border-[#1B2036] z-10' : ''}`}
                                        >
                                          {isAnimatingThis ? (
                                            <motion.div
                                              initial={{ scale: 0.1, rotate: -45 }}
                                              animate={{ scale: [1.4, 1], rotate: 0 }}
                                              transition={{ type: 'spring', damping: 10, stiffness: 120 }}
                                              className="w-full h-full flex items-center justify-center text-[#1B2036]"
                                            >
                                              <Beer className="w-3 h-3 fill-current animate-pulse" />
                                            </motion.div>
                                          ) : isBlocked ? (
                                            <Lock className="w-2.5 h-2.5 text-[#E85B41] stroke-[2.5]" />
                                          ) : isFilled ? (
                                            <Beer className="w-3 h-3 fill-current text-[#1B2036]" />
                                          ) : (
                                            <span className="text-[8px] font-bold font-mono text-[#1B2036]">{i + 1}</span>
                                          )}

                                          {/* RENDER PARTICLE BURST OVERLAY IF ANIMATING */}
                                          {isAnimatingThis && (
                                            <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
                                              {PARTICLE_TEMPLATES.map((p) => (
                                                <motion.div
                                                  key={p.id}
                                                  initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                                                  animate={{ 
                                                    x: p.x, 
                                                    y: p.y, 
                                                    scale: [0, p.scale, p.scale * 0.5, 0], 
                                                    opacity: [1, 1, 0.8, 0],
                                                    rotate: p.rotate + 360
                                                  }}
                                                  transition={{ 
                                                    duration: 0.9, 
                                                    ease: "easeOut", 
                                                    delay: p.delay 
                                                  }}
                                                  style={{
                                                    backgroundColor: p.color,
                                                    position: 'absolute',
                                                    left: '50%',
                                                    top: '50%',
                                                    width: p.size + 'px',
                                                    height: p.size + 'px',
                                                    borderRadius: p.id % 2 === 0 ? '50%' : '20%',
                                                    transform: 'translate(-50%, -50%)'
                                                  }}
                                                />
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="flex justify-between items-center text-[9px] font-bold font-mono text-[#1B2036]/70">
                                    <span>
                                      {isBlocked ? (
                                        <span className="text-[#E85B41]">
                                          {lang === 'PT' ? '10/10 Check-ins Concluídos! Spot Conquistado. 🔒' : '10/10 Check-ins Completed! Spot Conquered. 🔒'}
                                        </span>
                                      ) : 10 - userStamps > 0 ? (
                                        lang === 'PT' 
                                          ? `${10 - userStamps} check-ins em falta (${userStamps}/10)` 
                                          : `${10 - userStamps} check-ins remaining (${userStamps}/10)`
                                      ) : (
                                        <span className="text-[#12908C] font-bold">
                                          {lang === 'PT' ? '10/10 Check-ins Concluídos! 🏆' : '10/10 Check-ins Completed! 🏆'}
                                        </span>
                                      )}
                                    </span>
                                    <span className="tracking-widest pr-0.5 font-bold text-[#1B2036]">
                                      {animatingStampBarId === bar.id 
                                        ? (lang === 'PT' ? "A GRAVAR..." : "SAVING...") 
                                        : isBlocked 
                                          ? (lang === 'PT' ? "BLOQUEADO" : "LOCKED") 
                                          : (lang === 'PT' ? `${userStamps}/10 CHECK-INS` : `${userStamps}/10 CHECK-INS`)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {sortedBars.length === 0 && (
                            <div className="text-center py-6 text-xs text-neutral-500">
                              {lang === 'PT' 
                                ? `Nenhum spot encontrado para "${loyaltySearchQuery}"` 
                                : `No spots found for "${loyaltySearchQuery}"`}
                            </div>
                          )}

                          {sortedBars.length > 5 && (
                            <div className="pt-2 text-center">
                              <button
                                type="button"
                                onClick={() => setShowAllLoyaltySpots(!showAllLoyaltySpots)}
                                className="text-[10px] font-bold px-4 py-2 rounded-xl border-2 border-[#1B2036] bg-[#EFE6CC] hover:bg-[#F2A93B] text-[#1B2036] shadow-[2px_2px_0px_#1B2036] transition-all cursor-pointer font-label uppercase active:scale-95"
                                id="btn-loyalty-toggle-all"
                              >
                                {showAllLoyaltySpots 
                                  ? (lang === 'PT' ? 'Ver menos' : 'Show less') 
                                  : (lang === 'PT' ? 'Ver todos' : 'Show all')}
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW E: USER PROFILE & NOTIFICATION SIMULATOR */}
            {activeTab === 'profile' && (
              <motion.div 
                key="profile-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 space-y-4 font-sans"
              >
                {isLocalAuthFallback && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-[24px] text-left space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2 text-amber-500">
                      <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
                      <h4 className="text-[11px] font-black uppercase tracking-wider font-display">Modo de Demonstração Ativo</h4>
                    </div>
                    <p className="text-[10px] text-zinc-300 leading-relaxed font-sans">
                      O método de autenticação por <strong>E-mail/Palavra-passe</strong> não está ativo na tua consola Firebase (erro <code>auth/operation-not-allowed</code>).
                    </p>
                    <p className="text-[10px] text-amber-500 font-medium leading-relaxed font-sans">
                      💡 <strong>Como ativar:</strong> Acede à Consola Firebase do teu projeto <code>spiritual-seeker-7gbcx</code> &rarr; <strong>Authentication</strong> &rarr; <strong>Sign-in method</strong> e ativa o fornecedor <strong>E-mail/Password</strong>.
                    </p>
                  </div>
                )}

                {/* User Info Header Card */}
                <div 
                  className="p-4.5 rounded-3xl flex items-center space-x-3 border-2 border-zinc-700 transition-all bg-[#F6EFDC] text-zinc-900 shadow-sm"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-zinc-700 flex items-center justify-center text-3xl shrink-0 select-none">
                    {getLevelDetails(user.points, lang).badge}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center space-x-2">
                      <h4 className={`text-sm font-extrabold truncate font-display ${userRankingStyle.className}`}>
                        {user.username}
                        {isGlobalRank1 && (
                          <span className="ml-1.5 text-xs inline-block animate-bounce select-none">👑</span>
                        )}
                      </h4>
                    </div>
                    <p className="text-[10px] truncate mt-0.5 text-zinc-500">{user.email}</p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span 
                        className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border border-zinc-700"
                        style={{
                          backgroundColor: `${userRankingStyle.color}15`,
                          color: userRankingStyle.color
                        }}
                      >
                        {userRankingStyle.tierTitle}
                      </span>
                      {isGlobalRank1 && (
                        <span className="text-[9px] font-mono font-black text-amber-300 bg-amber-500/20 border border-zinc-700 px-2 py-0.5 rounded-md animate-pulse">
                          #1 GLOBAL
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Log-off Button right next to profile details */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await signOut(auth);
                      } catch (err: any) {
                        console.warn('Notice signing out:', err);
                      }
                      setUser(prev => ({
                        ...prev,
                        isLoggedIn: false,
                        id: 'user_guest'
                      }));
                      triggerSelfPush(
                        lang === 'PT' ? 'Sessão Terminada 🍻' : 'Signed Out 🍻',
                        lang === 'PT' ? 'Fizeste log-off com sucesso do teu roteiro Hop-Map.' : 'You have successfully signed out of Hop-Map.',
                        'system'
                      );
                    }}
                    className="p-2.5 rounded-xl border border-zinc-700 transition cursor-pointer flex items-center justify-center shrink-0 bg-[#EFE6CC] hover:bg-red-50 hover:border-red-400 text-zinc-600 hover:text-red-600"
                    title={lang === 'PT' ? "Terminar Sessão (Log-off)" : "Sign Out"}
                    id="btn-log-off"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* 5 KEY STATS LIST FOR USER PROFILE */}
                <div className="p-4 rounded-3xl border-2 border-zinc-700 transition-all bg-[#F6EFDC] text-neutral-900 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-700 pb-2.5">
                    <button
                      onClick={() => setIsBadgesModalOpen(true)}
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest font-display text-amber-700 hover:text-amber-600 transition cursor-pointer group"
                      id="btn-open-badges-catalog"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                      <span className="underline decoration-amber-500/40 underline-offset-4 group-hover:decoration-amber-600">
                        {lang === 'PT' ? 'Conquistas e badges' : 'Achievements and badges'}
                      </span>
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-700 text-left font-sans">
                    {/* 1. Título (Ranking) */}
                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold block text-black font-display">
                          {lang === 'PT' ? 'Título (Ranking)' : 'Rank Title'}
                        </span>
                        <span className="text-[10px] text-zinc-600 block font-sans">
                          {lang === 'PT' 
                            ? 'Título atual de acordo com a tabela de níveis' 
                            : 'Current rank title based on level tiers'}
                        </span>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-zinc-700">
                        <span className="text-sm select-none">{getLevelDetails(user.points, lang).badge}</span>
                        <span className="text-xs font-extrabold font-display text-amber-700 truncate max-w-[140px]">
                          {getLevelDetails(user.points, lang).title}
                        </span>
                      </div>
                    </div>

                    {/* 2. N.º HOPS */}
                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold block text-black font-display">
                          {lang === 'PT' ? 'N.º HOPS' : 'HOPS Points'}
                        </span>
                        <span className="text-[10px] text-zinc-600 block font-sans">
                          {lang === 'PT' 
                            ? 'Total de pontos acumulados' 
                            : 'Total points accumulated'}
                        </span>
                      </div>
                      <div className="shrink-0 font-mono text-sm font-extrabold text-black bg-[#EFE6CC] border border-zinc-700 px-3 py-1.5 rounded-xl">
                        {user.points || 0} <span className="text-[10px] text-amber-600 font-bold">HOPS</span>
                      </div>
                    </div>

                    {/* 3. N.º Badges Desbloqueados */}
                    <div 
                      onClick={() => setIsBadgesModalOpen(true)}
                      className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#EFE6CC] -mx-2 px-2 rounded-xl transition"
                    >
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold block text-black font-display group-hover:text-amber-600 transition">
                          {lang === 'PT' ? 'N.º Badges Desbloqueados' : 'Unlocked Badges'}
                        </span>
                        <span className="text-[10px] text-zinc-600 block font-sans">
                          {lang === 'PT' 
                            ? 'Contagem de badges conquistados face ao total' 
                            : 'Badges earned out of total available'}
                        </span>
                      </div>
                      <div className="shrink-0 font-mono text-sm font-extrabold text-amber-800 bg-amber-500/15 border border-zinc-700 px-3 py-1.5 rounded-xl group-hover:border-zinc-900 transition">
                        {unlockedBadges.length} <span className="text-[10px] text-zinc-600 font-medium">/ {ALL_BADGES.length}</span>
                      </div>
                    </div>

                    {/* 4. Locais Conquistados */}
                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold block text-black font-display">
                          {lang === 'PT' ? 'Locais Conquistados' : 'Conquered Spots'}
                        </span>
                        <span className="text-[10px] text-zinc-600 block font-sans">
                          {lang === 'PT' 
                            ? 'Número de spots únicos com check-ins efetuados' 
                            : 'Number of unique spots visited with check-ins'}
                        </span>
                      </div>
                      <div className="shrink-0 font-mono text-sm font-extrabold text-black bg-[#EFE6CC] border border-zinc-700 px-3 py-1.5 rounded-xl">
                        {conqueredSpotsCount} <span className="text-[10px] text-zinc-600 font-medium">{lang === 'PT' ? 'Spots' : 'Spots'}</span>
                      </div>
                    </div>

                    {/* 5. Ranking Global */}
                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold block text-black font-display">
                          {lang === 'PT' ? 'Ranking Global' : 'Global Rank'}
                        </span>
                        <span className="text-[10px] text-zinc-600 block font-sans">
                          {lang === 'PT' 
                            ? 'Posição na classificação geral com destaque especial' 
                            : 'Position on the global leaderboard with special highlight'}
                        </span>
                      </div>
                      <div className="shrink-0 font-mono text-sm font-extrabold px-3 py-1.5 rounded-xl border border-zinc-700 bg-[#EFE6CC] text-black">
                        {isGlobalRank1 && <span className="mr-1 select-none">👑</span>}
                        {typeof userGlobalRank === 'number' ? `#${userGlobalRank}` : userGlobalRank} <span className="text-[10px] text-amber-600 font-bold">{lang === 'PT' ? 'Global' : 'Global'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EARNED BADGES SECTION (STRICT RULE: Only appears if user has at least 1 badge) */}
                {unlockedBadges.length > 0 && (
                  <div className="p-4 rounded-3xl border-2 border-zinc-700 transition-all bg-[#F6EFDC] text-neutral-900 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-700 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-700">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest font-display text-amber-700">
                            {lang === 'PT' ? 'Badges Desbloqueados' : 'Unlocked Badges'} ({unlockedBadges.length})
                          </h4>
                          <p className="text-[9px] text-zinc-500 font-sans">
                            {lang === 'PT' ? 'Clica num badge para ver detalhes' : 'Click on a badge to view details'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsBadgesModalOpen(true)}
                        className="text-[9.5px] font-bold text-amber-700 hover:text-amber-600 font-display cursor-pointer"
                      >
                        {lang === 'PT' ? 'Ver Todos →' : 'View All →'}
                      </button>
                    </div>

                    {/* Horizontal scrollable / grid of earned badge icons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {unlockedBadges.map((badge) => {
                        const name = lang === 'PT' ? badge.namePt : badge.nameEn;
                        return (
                          <button
                            key={badge.id}
                            onClick={() => setIsBadgesModalOpen(true)}
                            title={name}
                            className="w-11 h-11 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border-2 border-zinc-700 flex items-center justify-center text-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
                          >
                            {badge.icon}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}


                {/* FRIENDS SEARCH & FRIENDS LIST SECTION */}
                <div className="p-4 rounded-3xl border-2 border-zinc-700 transition-all bg-[#F6EFDC] text-neutral-900 shadow-sm space-y-4">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-700">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest font-display text-black">{lang === 'PT' ? 'Os meus amigos' : 'My Friends'}</h4>
                        <p className="text-[9px] text-zinc-600 font-sans">{lang === 'PT' ? 'Encontra e adiciona outros amantes de cerveja' : 'Find and add other beer lovers'}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-700 border border-zinc-700 px-2 py-0.5 rounded-full">
                      {(user.friends || []).length} {lang === 'PT' ? 'AMIGOS' : 'FRIENDS'}
                    </span>
                  </div>

                  {/* Pending Friend Requests Panel */}
                  {pendingRequests.length > 0 && (
                    <div className="bg-amber-500/10 border border-zinc-700 rounded-2xl p-3 space-y-2 animate-pulse">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-700 uppercase tracking-widest font-display">
                        <Users className="w-3.5 h-3.5" />
                        <span>{lang === 'PT' ? 'Pedidos de Amizade Recebidos' : 'Friend Requests Received'} ({pendingRequests.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {pendingRequests.map(req => (
                          <div key={req.id} className="flex items-center justify-between p-2 rounded-xl border border-zinc-700 bg-amber-50/50">
                            <div className="text-left">
                              <span className="text-[9px] font-black text-zinc-800">{req.senderName}</span>
                              <span className="text-[8px] font-mono text-zinc-500 block">({req.senderPoints} HOPS)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleAcceptRequest(req.id, req.senderId, req.senderName)}
                                className="px-2.5 py-1 text-[8px] font-black font-display bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition active:scale-95 cursor-pointer border border-zinc-700"
                              >
                                {lang === 'PT' ? 'Aceitar' : 'Accept'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeclineRequest(req.id)}
                                className="px-2 py-1 text-[8px] font-bold font-sans rounded-lg transition active:scale-95 cursor-pointer bg-zinc-200 hover:bg-zinc-300 text-zinc-700 border border-zinc-700"
                              >
                                {lang === 'PT' ? 'Recusar' : 'Decline'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 1. Search Friends (Username search) */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{lang === 'PT' ? 'Pesquisar Utilizadores' : 'Search Users'}</h5>
                    <form onSubmit={handleFriendSearch} className="flex gap-1.5">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                        <input
                          type="text"
                          value={friendSearchQuery}
                          onChange={(e) => setFriendSearchQuery(e.target.value)}
                          placeholder={lang === 'PT' ? "Pesquisa por nome de utilizador..." : "Search by username..."}
                          className="w-full pl-8 pr-3 py-2 text-[10px] rounded-xl outline-none border border-zinc-700 bg-[#EFE6CC] text-zinc-900 focus:border-black transition-all"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isFriendSearching}
                        className="px-3.5 py-2 text-[10px] font-extrabold font-display bg-amber-500 hover:bg-amber-400 text-black rounded-xl border border-zinc-700 transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center min-w-[70px]"
                      >
                        {isFriendSearching ? (
                          <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          lang === 'PT' ? 'Pesquisar' : 'Search'
                        )}
                      </button>
                    </form>

                    {/* Friend Search Results */}
                    {friendSearchResults.length > 0 && (
                      <div className="mt-2.5 rounded-2xl p-2 border border-zinc-700 space-y-1.5 max-h-[160px] overflow-y-auto bg-[#EFE6CC]">
                        {friendSearchResults.map(res => {
                          const isAlreadyFriend = (user.friends || []).includes(res.id);
                          const isSentPending = sentPendingRequests.includes(res.id);
                          return (
                            <div key={res.id} className="flex items-center justify-between p-1.5 rounded-lg transition hover:bg-[#F6EFDC]">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm select-none">{getLevelDetails(res.points).badge}</span>
                                <div className="text-left">
                                  <div className="text-[10px] font-bold text-zinc-800">{res.username}</div>
                                  <div className="text-[8px] text-zinc-500 font-mono font-medium">{res.points} HOPS</div>
                                </div>
                              </div>
                              {isAlreadyFriend ? (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFriend(res.id, res.username)}
                                  className="px-2 py-1 text-[8px] font-extrabold text-red-600 bg-red-500/10 border border-zinc-700 rounded-lg hover:bg-red-500/20 transition cursor-pointer flex items-center gap-1"
                                >
                                  <X className="w-2.5 h-2.5" />
                                  <span>{lang === 'PT' ? 'Remover' : 'Remove'}</span>
                                </button>
                              ) : isSentPending ? (
                                <span className="px-2 py-1 text-[8px] font-extrabold text-zinc-500 bg-zinc-500/10 border border-zinc-700 rounded-lg select-none flex items-center gap-1">
                                  <span>{lang === 'PT' ? 'Pendente ⏳' : 'Pending ⏳'}</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAddFriend(res.id, res.username)}
                                  className="px-2 py-1 text-[8px] font-extrabold text-amber-700 bg-amber-500/10 border border-zinc-700 rounded-lg hover:bg-amber-500/20 transition cursor-pointer flex items-center gap-1"
                                >
                                  <User className="w-2.5 h-2.5" />
                                  <span>{lang === 'PT' ? 'Adicionar' : 'Add'}</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {friendSearchMessage && (
                      <p className="text-[9px] text-zinc-500 pl-1">{friendSearchMessage}</p>
                    )}
                  </div>

                  {/* 2. My Friends List */}
                  <div className="space-y-2 pt-1">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{lang === 'PT' ? 'Lista de Amigos' : 'Friends List'}</h5>
                    {isFriendsDetailsLoading ? (
                      <div className="text-center py-4">
                        <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
                        <p className="text-[9px] text-zinc-500 mt-1">{lang === 'PT' ? 'A carregar amigos...' : 'Loading friends...'}</p>
                      </div>
                    ) : friendsDetails.length === 0 ? (
                      <div className="border border-dashed border-zinc-700 p-4 rounded-2xl text-center bg-[#EFE6CC]">
                        <p className="text-zinc-700 text-[10px] leading-relaxed">{lang === 'PT' ? 'Não tens amigos adicionados.' : 'You have no friends added.'}</p>
                        <p className="text-zinc-600 text-[8px] mt-0.5">{lang === 'PT' ? 'Pesquisa por nome acima para criar a tua comunidade cervejeira!' : 'Search by username above to build your beer community!'}</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                          {(() => {
                            const sortedFriends = [...friendsDetails].reverse();
                            const displayedFriends = showAllFriends ? sortedFriends : sortedFriends.slice(0, 5);
                            return displayedFriends.map(friend => {
                              const details = getLevelDetails(friend.points);
                              return (
                                <div 
                                  key={friend.id} 
                                  className="flex items-center justify-between p-2 rounded-xl border border-zinc-700 bg-[#EFE6CC]"
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg select-none">{details.badge}</span>
                                    <div className="text-left">
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-black text-black">{friend.username}</span>
                                        <span className="text-[8px] font-mono text-amber-600 font-bold">({friend.points} HOPS)</span>
                                      </div>
                                      <div className="text-[8px] text-zinc-600 font-sans italic">"{details.title}"</div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFriend(friend.id, friend.username)}
                                    className="flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-black text-red-600 hover:text-white hover:bg-red-500/20 rounded-lg border border-zinc-700 transition active:scale-95 cursor-pointer"
                                    title="Remover Amigo"
                                  >
                                    <X className="w-2.5 h-2.5 font-bold" />
                                    <span>REMOVER</span>
                                  </button>
                                </div>
                              );
                            });
                          })()}
                        </div>
                        {friendsDetails.length > 5 && (
                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={() => setShowAllFriends(!showAllFriends)}
                              className="text-[9px] font-bold px-3 py-1.5 rounded-lg border border-zinc-700 bg-[#EFE6CC] hover:bg-[#F2A93B] text-amber-800 shadow-xs transition-all cursor-pointer"
                              id="btn-toggle-all-friends"
                            >
                              {showAllFriends ? (lang === 'PT' ? 'Ver menos' : 'Show less') : (lang === 'PT' ? 'Ver todos' : 'Show all')}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Histórico de Check-ins (Máximo 5 itens) */}
                <div>
                  <div className="flex items-center justify-between pl-1 mb-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-700 font-display flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-amber-600" />
                      {t('checkinHistoryTitle', lang)}
                    </h4>
                    {checkinList.length > 0 && (
                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 border border-zinc-700">
                        {checkinList.length} {t('totalCheckinsLabel', lang)}
                      </span>
                    )}
                  </div>

                  <p className="text-[9px] pl-1 mb-2.5 text-zinc-500">
                    {t('checkinHistorySubtitle', lang)}
                  </p>

                  <div className="space-y-2">
                    {checkinList.length === 0 ? (
                      <div className="bg-[#EFE6CC] border border-dashed border-zinc-700 p-4 rounded-xl text-center">
                        <Compass className="w-6 h-6 text-amber-500/50 mx-auto mb-1.5" />
                        <p className="text-neutral-700 font-bold text-[10px]">{t('noCheckinsYet', lang)}</p>
                        <p className="text-neutral-600 text-[9px] mt-0.5">{t('noCheckinsSub', lang)}</p>
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const displayedCheckins = showAllCheckins ? checkinList : checkinList.slice(0, 5);
                          return displayedCheckins.map(item => {
                            const barObj = bars.find(b => b.id === item.barId);
                            return (
                              <div 
                                key={item.id} 
                                className="p-3.5 rounded-2xl border border-zinc-700 transition-all duration-200 bg-[#F6EFDC] text-neutral-900 shadow-xs"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-[11px] font-extrabold text-amber-700 font-display tracking-tight">
                                        {item.barName}
                                      </span>
                                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#EFE6CC] text-zinc-700 border border-zinc-700">
                                        📍 {item.location}
                                      </span>
                                      {item.beerStyle && (
                                        <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-800 border border-zinc-700 flex items-center gap-0.5">
                                          🍺 {item.beerStyle}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center text-[9px] text-zinc-600 font-mono gap-1">
                                      <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                                      <span>{t('checkinDateLabel', lang)}:</span>
                                      <span className="font-bold text-zinc-800">{item.date}</span>
                                    </div>
                                  </div>

                                  {barObj && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleSelectBar(barObj);
                                        setActiveTab('explore');
                                      }}
                                      className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider text-black bg-amber-500 hover:bg-amber-400 rounded-lg border border-zinc-700 transition-all active:scale-95 cursor-pointer font-mono"
                                      title={t('viewSpotOnMap', lang)}
                                    >
                                      <MapPin className="w-2.5 h-2.5" />
                                      <span>{t('viewSpotOnMap', lang)}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}

                        {checkinList.length > 5 && (
                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={() => setShowAllCheckins(!showAllCheckins)}
                              className="text-[9px] font-bold px-3 py-1.5 rounded-lg border border-zinc-700 bg-[#EFE6CC] hover:bg-[#F2A93B] text-amber-800 shadow-xs transition-all cursor-pointer"
                              id="btn-toggle-all-checkins"
                            >
                              {showAllCheckins ? (lang === 'PT' ? 'Ver menos' : 'Show less') : (lang === 'PT' ? 'Ver mais' : 'Show more')}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Past Reviews History Section (Máximo 5 itens) */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-700 pl-1 mb-2.5 font-display flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    {lang === 'PT' ? 'O MEU HISTÓRICO DE AVALIAÇÕES' : 'MY REVIEW HISTORY'}
                  </h4>
                  <div className="space-y-2">
                    {ratingsHistory.length === 0 ? (
                      <div className="bg-[#EFE6CC] border border-dashed border-zinc-700 p-4 rounded-xl text-center">
                        <p className="text-neutral-600 text-[10px] leading-relaxed">
                          {lang === 'PT' 
                            ? 'Ainda não submeteste nenhuma avaliação. Avalia os teus spots favoritos!' 
                            : "You haven't submitted any reviews yet. Rate your favorite spots!"}
                        </p>
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const displayedReviews = showAllReviews ? ratingsHistory : ratingsHistory.slice(0, 5);
                          return displayedReviews.map(item => {
                            const createdTime = typeof item.createdAt === 'number' 
                              ? item.createdAt 
                              : (item.createdAt ? new Date(item.createdAt).getTime() : 0);
                            const isWithin24Hours = (Date.now() - createdTime) <= 24 * 60 * 60 * 1000;

                            return (
                              <div 
                                key={item.id} 
                                className="p-3.5 rounded-2xl border border-zinc-700 transition-all duration-200 bg-[#F6EFDC] text-neutral-900 shadow-xs"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-amber-700 font-mono">
                                      {item.barName}
                                    </span>
                                    <div className="flex items-center text-amber-500 space-x-0.5 mt-0.5">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`w-3 h-3 ${i < item.stars ? 'fill-current text-amber-500' : 'text-neutral-400'}`} 
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] text-zinc-500 font-mono">
                                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString(lang === 'PT' ? 'pt-PT' : 'en-US') : ''}
                                    </span>
                                    {isWithin24Hours && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingReview(item);
                                          setEditRating(item.stars || 5);
                                          setEditComment(item.texto_rating || '');
                                          setEditBeerStyle(item.tipo_cerveja || '');
                                        }}
                                        className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-zinc-700 text-[8px] font-bold font-mono flex items-center gap-1 transition active:scale-95 cursor-pointer"
                                        title={lang === 'PT' ? 'Editar avaliação (válido nas primeiras 24h)' : 'Edit review (valid within first 24h)'}
                                      >
                                        <Edit3 className="w-2.5 h-2.5" />
                                        <span>{lang === 'PT' ? 'Editar' : 'Edit'}</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                                
                                <p className="text-[10px] italic leading-relaxed mt-1.5 text-zinc-700">
                                  "{item.texto_rating}"
                                </p>
                                
                                {item.tipo_cerveja && (
                                  <div className="text-[8px] text-neutral-600 font-bold uppercase tracking-wider font-mono mt-1">
                                    {lang === 'PT' ? 'Estilo:' : 'Style:'} {item.tipo_cerveja}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                        {ratingsHistory.length > 5 && (
                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={() => setShowAllReviews(!showAllReviews)}
                              className="text-[9px] font-bold px-3 py-1.5 rounded-lg border border-zinc-700 bg-[#EFE6CC] hover:bg-[#F2A93B] text-amber-800 shadow-xs transition-all cursor-pointer"
                              id="btn-toggle-all-reviews"
                            >
                              {showAllReviews 
                                ? (lang === 'PT' ? 'Ver menos' : 'Show less') 
                                : (lang === 'PT' ? 'Ver mais' : 'Show more')}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Histórico de Notificações (Seguido aos anteriores, máximo 5 itens) */}
                {(() => {
                  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                  const recentNotifications = notifications.filter(notif => {
                    const time = notif.createdAt || Date.now();
                    return time >= thirtyDaysAgo;
                  });

                  return (
                    <div>
                      <div className="flex items-center justify-between pl-1 mb-2">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 font-display flex items-center gap-1.5">
                            <Bell className="w-3.5 h-3.5 text-amber-600" />
                            {lang === 'PT' ? 'HISTÓRICO DE NOTIFICAÇÕES' : 'NOTIFICATION HISTORY'}
                          </h4>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#EFE6CC] border border-zinc-700 text-zinc-700 font-mono">
                            {lang === 'PT' ? 'Últimas 5' : 'Latest 5'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {recentNotifications.some(n => !n.isRead) && (
                            <button 
                              onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
                              className="text-[9px] font-press-start text-amber-700 uppercase hover:underline cursor-pointer select-none"
                              id="btn-mark-all-read"
                            >
                              {lang === 'PT' ? '[Lidas]' : '[Read]'}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {recentNotifications.length === 0 ? (
                          <div className="p-3.5 rounded-2xl bg-[#EFE6CC] border border-zinc-700 text-center text-[9px] text-zinc-600 font-mono">
                            {lang === 'PT' ? 'Sem notificações' : 'No notifications'}
                          </div>
                        ) : (
                          recentNotifications.slice(0, 5).map(notif => (
                            <div 
                              key={notif.id} 
                              onClick={() => {
                                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                              }}
                              className={`p-3.5 rounded-2xl border border-zinc-700 transition-all duration-200 cursor-pointer flex items-start space-x-2.5 ${
                                notif.isRead 
                                  ? 'bg-[#EFE6CC] text-neutral-600' 
                                  : 'bg-[#F6EFDC] text-neutral-900 hover:bg-[#FAF6EB]'
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${notif.isRead ? 'bg-transparent' : 'bg-amber-500 animate-pulse'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold font-display">
                                  {lang === 'EN' && notif.titleEn ? notif.titleEn : notif.title}
                                </p>
                                <p className="text-[9px] text-zinc-600 leading-relaxed mt-0.5">
                                  {lang === 'EN' && notif.bodyEn ? notif.bodyEn : notif.body}
                                </p>
                                <span className="text-[8px] text-zinc-500 block mt-1 font-mono">
                                  {lang === 'EN' && notif.timestampEn ? notif.timestampEn : notif.timestamp}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Monthly Reports & Business Intelligence Card (Administrator Only) */}
                {isAdmin && (
                  <div className="p-4 rounded-2xl space-y-3 border-2 border-zinc-700 transition-all bg-amber-50/80 text-neutral-900 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                          <h5 className="text-[11px] font-extrabold uppercase tracking-wider font-display text-amber-800">
                            {lang === 'PT' ? 'Painel Admin: Relatório Mensal' : 'Admin Panel: Monthly Report'}
                          </h5>
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 border border-zinc-700 text-[7px] font-mono font-bold">
                            ADMIN
                          </span>
                        </div>
                        <p className="text-[9.5px] leading-relaxed text-zinc-600">
                          {lang === 'PT' 
                            ? 'Métricas exclusivas de check-ins, prémios atribuídos, utilizadores mais ativos, visualizações, partilhas e rotas GPS para cobeertaste@gmail.com.'
                            : 'Exclusive check-in metrics, rewards granted, top users, views, social shares and GPS routes to cobeertaste@gmail.com.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-700">
                      <span className="text-[8.5px] font-mono text-zinc-600">
                        Administrador: <strong className="text-amber-800">cobeertaste@gmail.com</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsMonthlyReportOpen(true)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[9.5px] rounded-xl flex items-center gap-1.5 transition font-display uppercase tracking-wider shadow-sm active:scale-95 cursor-pointer border border-zinc-700"
                        id="btn-open-monthly-report-profile"
                      >
                        <FileText className="w-3 h-3 text-black" />
                        <span>{lang === 'PT' ? 'Ver & Enviar' : 'View & Send'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Master Spot PINs Management Card (Administrator Only) */}
                {isAdmin && (
                  <div className="p-4 rounded-2xl space-y-3 border-2 border-zinc-700 transition-all bg-amber-50/80 text-neutral-900 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Key className="w-4 h-4 text-amber-600 shrink-0" />
                          <h5 className="text-[11px] font-extrabold uppercase tracking-wider font-display text-amber-800">
                            {t('adminPinsDashboardTitle', lang)}
                          </h5>
                          <span className="px-1.5 py-0.5 rounded bg-black text-amber-400 border border-zinc-700 text-[7px] font-mono font-black">
                            MASTER
                          </span>
                        </div>
                        <p className="text-[9.5px] leading-relaxed text-zinc-600">
                          {lang === 'PT' 
                            ? 'Geração automática, gestão individual e exportação por e-mail dos PINs de consumo de 4 dígitos para cada spot registado.'
                            : 'Automatic generation, individual management and email export of 4-digit consumption PINs for each registered spot.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-700">
                      <span className="text-[8.5px] font-mono text-zinc-600">
                        {t('totalSpotsWithPins', lang)}: <strong className="text-zinc-900 font-mono">{bars.length}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAdminPinsModalOpen(true)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[9.5px] rounded-xl flex items-center gap-1.5 transition font-display uppercase tracking-wider shadow-sm active:scale-95 cursor-pointer border border-zinc-700"
                        id="btn-open-admin-pins-profile"
                      >
                        <Key className="w-3 h-3 text-black" />
                        <span>{t('adminPinsBtn', lang)}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Language Preference Settings Card */}
                <div className="p-4 rounded-2xl space-y-3 border-2 border-zinc-700 transition-all bg-[#F6EFDC] text-neutral-900 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[11px] font-bold flex items-center font-display text-black">
                        <Languages className="w-4 h-4 text-amber-600 mr-2" />
                        {lang === 'PT' ? 'Idioma' : 'Language'}
                      </h5>
                      <p className="text-[9px] mt-0.5 text-zinc-600">
                        {lang === 'PT' ? 'Português (PT) / English (EN)' : 'Portuguese (PT) / English (EN)'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5 bg-[#EFE6CC] border border-zinc-700 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => handleLanguageChange('PT')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          lang === 'PT' ? 'bg-amber-500 text-black font-black shadow-md' : 'text-zinc-600 hover:text-black'
                        }`}
                        id="btn-profile-lang-pt"
                      >
                        PT 🇵🇹
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLanguageChange('EN')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          lang === 'EN' ? 'bg-amber-500 text-black font-black shadow-md' : 'text-zinc-600 hover:text-black'
                        }`}
                        id="btn-profile-lang-en"
                      >
                        EN 🇬🇧
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notifications Toggle Settings Card */}
                <div className="p-4 rounded-2xl space-y-3 border-2 border-zinc-700 transition-all bg-[#F6EFDC] text-neutral-900 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[11px] font-bold flex items-center font-display text-black">
                        <Bell className="w-4 h-4 text-amber-600 mr-2" />
                        {lang === 'PT' ? 'Notificações' : 'Notifications'}
                      </h5>
                      <p className="text-[9px] mt-0.5 text-zinc-600">
                        {lang === 'PT' ? 'Recebe alertas de novidades, menções e eventos' : 'Receive alerts for news, mentions and events'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={user.notificationsEnabled !== false} 
                        onChange={() => {
                          const nextVal = !(user.notificationsEnabled !== false);
                          setUser(prev => {
                            const updated = { ...prev, notificationsEnabled: nextVal };
                            try {
                              localStorage.setItem('hop_user_notifications_enabled', String(nextVal));
                            } catch (e) {}
                            return updated;
                          });
                          triggerSelfPush(
                            lang === 'PT' ? 'Notificações' : 'Notifications',
                            lang === 'PT' 
                              ? (nextVal ? 'Notificações ativadas.' : 'Notificações desativadas.') 
                              : (nextVal ? 'Notifications enabled.' : 'Notifications disabled.'),
                            'system'
                          );
                        }}
                        className="sr-only peer" 
                        id="checkbox-notifications-toggle"
                      />
                      <div className={`w-9 h-5 rounded-full relative transition-all duration-200 border border-zinc-700 ${
                        (user.notificationsEnabled !== false) ? 'bg-amber-500' : 'bg-neutral-300'
                      } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                        (user.notificationsEnabled !== false) ? 'after:translate-x-4' : ''
                      }`} />
                    </label>
                  </div>
                </div>

                {/* Biometrics Settings */}
                <div className="p-4 rounded-2xl space-y-3 border-2 border-zinc-700 transition-all bg-[#F6EFDC] text-neutral-900 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[11px] font-bold flex items-center font-display text-black">
                        <Fingerprint className="w-4 h-4 text-amber-600 mr-2" />
                        {lang === 'PT' ? 'Autenticação biométrica Native Face ID' : 'Native Face ID Biometric Authentication'}
                      </h5>
                      <p className="text-[9px] mt-0.5 text-zinc-600">
                        {lang === 'PT' ? 'Garante a segurança e impede compras de terceiros' : 'Ensures security and prevents unauthorized actions'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={user.biometricsEnabled} 
                        onChange={() => {
                          setUser(prev => ({ ...prev, biometricsEnabled: !prev.biometricsEnabled }));
                          triggerSelfPush(
                            lang === 'PT' ? 'Parâmetros Alterados' : 'Settings Changed',
                            lang === 'PT' ? 'Preferências de biometria atualizadas.' : 'Biometric preferences updated.',
                            'system'
                          );
                        }}
                        className="sr-only peer" 
                        id="checkbox-biometrics-toggle"
                      />
                      <div className={`w-9 h-5 rounded-full relative transition-all duration-200 border border-zinc-700 ${
                        user.biometricsEnabled ? 'bg-amber-500' : 'bg-neutral-300'
                      } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                        user.biometricsEnabled ? 'after:translate-x-4' : ''
                      }`} />
                    </label>
                  </div>
                </div>

                {/* Share Check-in with Friends Settings */}
                <div className="p-4 rounded-2xl space-y-3 border-2 border-zinc-700 transition-all bg-[#F6EFDC] text-neutral-900 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="pr-3">
                      <h5 className="text-[11px] font-bold flex items-center font-display text-black">
                        <Users className="w-4 h-4 text-amber-600 mr-2 shrink-0" />
                        {lang === 'PT' ? 'Partilha de check-in com Amigos' : 'Share Check-in with Friends'}
                      </h5>
                      <p className="text-[9px] mt-0.5 leading-normal text-zinc-600">
                        {t('shareCheckinSettingDesc', lang)}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input 
                        type="checkbox" 
                        checked={user.shareCheckinsEnabled !== false} 
                        onChange={() => {
                          const newValue = user.shareCheckinsEnabled === false;
                          setUser(prev => ({ ...prev, shareCheckinsEnabled: newValue }));
                          localStorage.setItem('hop_share_checkins_enabled', String(newValue));
                          if (user.isLoggedIn && !user.id.startsWith('local-user-')) {
                            setDoc(doc(db, 'users', user.id), { shareCheckinsEnabled: newValue }, { merge: true }).catch(err => console.warn(err));
                          }
                          triggerSelfPush(
                            lang === 'PT' ? 'Preferências Atualizadas' : 'Settings Updated',
                            newValue 
                              ? (lang === 'PT' ? 'Partilha de check-in com amigos ativada.' : 'Check-in sharing with friends enabled.')
                              : (lang === 'PT' ? 'Partilha de check-in com amigos desativada.' : 'Check-in sharing with friends disabled.'),
                            'system'
                          );
                        }}
                        className="sr-only peer" 
                        id="checkbox-share-checkins-toggle"
                      />
                      <div className={`w-9 h-5 rounded-full relative transition-all duration-200 border border-zinc-700 ${
                        user.shareCheckinsEnabled !== false ? 'bg-amber-500' : 'bg-neutral-300'
                      } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                        user.shareCheckinsEnabled !== false ? 'after:translate-x-4' : ''
                      }`} />
                    </label>
                  </div>
                </div>

                {/* DANGER ZONE: Remove / Delete Account Option */}
                <div className="p-4 rounded-2xl border-2 border-zinc-700 transition-all bg-red-50/60">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-left min-w-0">
                      <h5 className="text-[11px] font-bold text-red-600 flex items-center font-display">
                        <Trash2 className="w-4 h-4 mr-1.5 shrink-0" />
                        {t('deleteAccountButton', lang)}
                      </h5>
                      <p className="text-[9px] mt-0.5 leading-normal text-zinc-600">
                        {lang === 'PT' 
                          ? 'Elimina permanentemente a tua conta e todos os dados na base de dados.' 
                          : 'Permanently delete your account and all data stored in database.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDeleteAccountModal(true)}
                      className="px-3 py-2 rounded-xl text-[10px] font-bold font-display bg-red-500 hover:bg-red-600 active:scale-95 text-white transition-all shadow-xs cursor-pointer shrink-0 border border-zinc-700"
                      id="btn-trigger-delete-account"
                    >
                      {t('deleteAccountButton', lang)}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* FLOATING SCROLL TO TOP BUTTON (EXPLORE & EVENTS TABS) */}
          <AnimatePresence>
            {showScrollTop && (activeTab === 'explore' || activeTab === 'events' || activeTab === 'routes') && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: 15 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="fixed bottom-20 right-4 sm:right-6 z-50 bg-[#FFCA00] hover:bg-amber-400 text-black font-extrabold text-xs px-3.5 py-2.5 rounded-2xl shadow-xl shadow-amber-500/30 border-2 border-black flex items-center space-x-1.5 cursor-pointer font-display transition-all"
                id="btn-scroll-to-top"
                title={lang === 'PT' ? 'Voltar ao topo' : 'Back to top'}
              >
                <ChevronUp className="w-4 h-4 stroke-[3]" />
                <span className="text-[10px] tracking-wide uppercase font-black font-press-start">
                  {lang === 'PT' ? 'Topo' : 'Top'}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </main>
        )}

        {/* --- EXPANDED BAR DETAIL DRAWERS (BOTTOM FLOATER WITH SMOOTH SLIDE) --- */}
        <AnimatePresence>
          {selectedBar && (
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 210 }}
              className="absolute inset-x-0 top-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] z-[150] flex flex-col font-sans overflow-hidden bg-[#FAF6EB] text-[#1B2036]"
            >
              {/* Slide-over Header */}
              <div className="px-4.5 py-3.5 flex items-center justify-center border-b-2 border-[#1B2036] bg-[#FAF6EB] text-[#1B2036] shrink-0">
                <span className="text-xs font-black tracking-wider uppercase font-press text-[#1B2036]">
                  {lang === 'PT' ? 'Detalhes do Local' : 'Spot Details'}
                </span>
              </div>

              {/* Scrollable Content Container */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Cover Photo */}
                <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-2 border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036]">
                  <img 
                    src={selectedBar.coverPhoto} 
                    alt={selectedBar.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                  {/* Close button next to City badge over the image at top-left */}
                  <div className="absolute top-3 left-3 flex items-center space-x-2 z-10">
                    <button 
                      onClick={() => { handleSelectBar(null); setActiveTab('explore'); }}
                      className="w-8 h-8 rounded-full border-2 border-[#1B2036] bg-[#F6EFDC] hover:bg-[#EFE6CC] active:scale-95 transition-all cursor-pointer flex items-center justify-center text-[#1B2036] shadow-[2px_2px_0px_#1B2036]"
                      id="btn-bar-detail-close"
                      aria-label="Close"
                      title={lang === 'PT' ? 'Fechar' : 'Close'}
                    >
                      <X className="w-4 h-4 text-black stroke-[2.5]" />
                    </button>
                    <div className="px-3 py-1.5 rounded-xl bg-[#1B2036] text-[8.5px] font-bold text-[#F2A93B] tracking-widest uppercase border border-[#1B2036] font-mono flex items-center shadow-md">
                      {selectedBar.zone}
                    </div>
                  </div>
                </div>

                {/* Consecutive Action Buttons immediately below spot image: Efetuar Check-In + Avaliar Spot + Partilhar SPOT + Como chegar (Google Maps / GPS) */}
                <div className="space-y-2">
                  {/* 1. Efetuar Check-In */}
                  {(() => {
                    const isBlocked = isSpotStampsBlocked(selectedBar.id);
                    const btnId = selectedBar.id.includes('catraio') ? 'btn-checkin-drawer-catraio' : `btn-checkin-drawer-${selectedBar.id}`;
                    return isBlocked ? (
                      <button 
                        disabled
                        className="w-full py-3 px-3 bg-[#EFE6CC] border-2 border-[#1B2036] text-[#1B2036]/60 font-extrabold rounded-xl flex flex-wrap items-center justify-center gap-1.5 shadow-none font-display cursor-not-allowed opacity-75 text-center"
                        id={btnId}
                      >
                        <Lock className="w-4 h-4 text-[#1B2036]/60 shrink-0" />
                        <span className="text-xs uppercase tracking-wider font-black">
                          {lang === 'PT' ? 'Efetuar Check-In' : 'Check-In'}
                        </span>
                        <span className="text-[9.5px] font-normal lowercase tracking-normal font-sans opacity-85">
                          ({lang === 'PT' ? '10 Selos Atingidos - Bloqueado' : '10 Stamps Reached - Locked'})
                        </span>
                      </button>
                    ) : (
                      <PixelCheckinAnimation
                        isActive={animatingCheckinBarId === selectedBar.id}
                        onClick={() => initiateCheckin(selectedBar)}
                        className="w-full py-3 px-3 bg-[#F2A93B] hover:bg-[#E09425] text-black font-extrabold rounded-xl border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] active:translate-x-[1px] active:translate-y-[1px] transition-all flex flex-wrap items-center justify-center gap-1.5 cursor-pointer font-display text-center"
                        id={btnId}
                      >
                        <Fingerprint className="w-4 h-4 text-black stroke-[2.5] shrink-0" />
                        <span className="text-xs uppercase tracking-wider font-black">
                          {lang === 'PT' ? 'Efetuar Check-In' : 'Check-In'}
                        </span>
                        <span className="text-[9.5px] font-normal lowercase tracking-normal font-sans opacity-85">
                          ({lang === 'PT' ? 'Nota: Check-in apenas válido quando estás no local' : 'Note: Check-in only valid when at the spot'})
                        </span>
                      </PixelCheckinAnimation>
                    );
                  })()}

                  {/* 2. Avaliar Spot */}
                  {(() => {
                    const hasReviewed = user.isLoggedIn && (selectedBar.reviews || []).some(rev => rev.userId === user.id);
                    return (
                      <button 
                        type="button"
                        onClick={() => {
                          if (hasReviewed) return;
                          setActiveBarToReview(selectedBar);
                        }}
                        disabled={hasReviewed}
                        className={`w-full py-3 px-4 rounded-xl flex items-center justify-center space-x-2 font-black text-xs tracking-wider uppercase font-display border-2 transition-all duration-150 ${
                          hasReviewed 
                            ? 'bg-[#EFE6CC] text-[#1B2036]/60 border-[#1B2036]/40 cursor-not-allowed opacity-80' 
                            : 'bg-[#12908C] hover:bg-[#0B6C69] text-white border-[#1B2036] shadow-[2px_2px_0px_#1B2036] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer'
                        }`}
                        id="btn-add-review"
                      >
                        <Star className={`w-4 h-4 ${hasReviewed ? 'text-[#1B2036]/50' : 'fill-white text-white stroke-[2.5]'}`} />
                        <span>
                          {hasReviewed 
                            ? (lang === 'PT' ? 'SPOT JÁ AVALIADO' : 'SPOT ALREADY REVIEWED') 
                            : (lang === 'PT' ? 'AVALIAR SPOT' : 'REVIEW SPOT')}
                        </span>
                      </button>
                    );
                  })()}

                  {/* 3. Partilhar SPOT */}
                  <button
                    type="button"
                    onClick={() => setShareBarModal(selectedBar)}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#EFE6CC] hover:bg-[#F2A93B] text-[#1B2036] font-extrabold text-xs border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] active:translate-x-[1px] active:translate-y-[1px] transition-all font-display uppercase tracking-wider cursor-pointer"
                    id={`btn-share-spot-drawer-${selectedBar.id}`}
                  >
                    <Share2 className="w-4 h-4 stroke-[2.5]" />
                    <span>{lang === 'PT' ? 'Partilhar Spot' : 'Share Spot'}</span>
                  </button>

                  {/* 4. Como chegar (Google Maps / GPS) */}
                  <button
                    type="button"
                    onClick={() => {
                      trackSpotDirections(selectedBar, user, 'google_maps');
                      window.open(getBarGoogleMapsUrl(selectedBar.id, selectedBar.address), '_blank');
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#EFE6CC] hover:bg-[#12908C] hover:text-white text-[#1B2036] font-extrabold text-xs border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] active:translate-x-[1px] active:translate-y-[1px] transition-all font-display uppercase tracking-wider cursor-pointer group"
                    id={`btn-directions-drawer-${selectedBar.id}`}
                  >
                    <Navigation className="w-4 h-4 text-current stroke-[2.5]" />
                    <span>{lang === 'PT' ? 'Como Chegar (Google Maps / GPS)' : 'Directions (Google Maps / GPS)'}</span>
                  </button>
                </div>

                {/* Title & Actions */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold font-display tracking-tight text-[#1B2036]">{selectedBar.name}</h3>
                    <p className="text-[10px] text-[#1B2036]/70 mt-1 font-mono font-bold">{selectedBar.address}</p>
                  </div>
                  <div className="flex items-center space-x-1 font-extrabold text-[#1B2036] text-sm shrink-0 bg-[#F6EFDC] p-1.5 rounded-xl border-2 border-[#1B2036] shadow-[1.5px_1.5px_0px_#1B2036] font-display">
                    <Star className="w-4 h-4 fill-[#F2A93B] text-[#F2A93B]" />
                    <span>{selectedBar.rating}</span>
                  </div>
                </div>

                {/* Main Info */}
                <p className="text-[10.5px] leading-relaxed mt-3.5 pt-3.5 border-t border-[#1B2036]/15 text-[#1B2036]/90 font-sans">
                  {getBarDescription(selectedBar, lang)}
                </p>

                {/* Spot Feature Badges in Drawer */}
                <div className="mt-3.5">
                  <span className="text-[#1B2036] block font-bold uppercase tracking-widest text-[8.5px] mb-1.5 font-display">
                    {lang === 'PT' ? 'Comodidades do Spot' : 'Spot Amenities'}
                  </span>
                  <SpotFeatureBadges bar={selectedBar} lang={lang} compact={false} />
                </div>

                {/* Working Hours box */}
                {(() => {
                  const drawerStatus = getBarOpenStatus(selectedBar, lang);
                  return (
                    <div className="mt-4 bg-white p-3.5 rounded-2xl border-2 border-[#1B2036] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] shadow-[2px_2px_0px_#1B2036]">
                      <div>
                        <span className="text-[#1B2036]/70 block font-bold uppercase tracking-widest text-[8px] font-display">{t('workingHours', lang)}</span>
                        <span className="font-bold text-[#1B2036] mt-0.5 block whitespace-pre-line font-mono text-[9.5px]">{getBarWorkingHours(selectedBar, lang)}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold border-2 border-[#1B2036] shrink-0 font-mono shadow-[1px_1px_0px_#1B2036] ${drawerStatus.colorClass}`}>
                        {drawerStatus.statusText}
                      </span>
                    </div>
                  );
                })()}

                {/* Spot Vibe / Mood Check (1-Hour Expiration Live System) */}
                <div className="mt-4">
                  {(() => {
                    const actualDistM = getHaversineDistanceInMeters(userLocation.latitude, userLocation.longitude, selectedBar.latitude, selectedBar.longitude);
                    const isEligible50m = actualDistM <= 50;

                    return (
                      <SpotVibeCheck
                        spotId={selectedBar.id}
                        spotName={selectedBar.name}
                        spotLatitude={selectedBar.latitude}
                        spotLongitude={selectedBar.longitude}
                        userLocation={userLocation}
                        user={user}
                        lang={lang}
                        darkMode={darkMode}
                        distanceMeters={actualDistM}
                        isWithin50m={isEligible50m}
                        onUserLocationChange={(newLoc) => setUserLocation(newLoc)}
                      />
                    );
                  })()}
                </div>

                {/* Main characteristics Styles */}
                <div className="mt-3.5">
                  <span className="text-[#1B2036] block font-bold uppercase tracking-widest text-[8.5px] mb-1.5 font-display">
                    {lang === 'PT' ? 'Especialidades e Estilos' : 'Specialties & Styles'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedBar.styles.map(sty => (
                      <span 
                        key={sty} 
                        className="text-[9px] font-bold px-2.5 py-1 rounded-xl bg-[#F6EFDC] border-2 border-[#1B2036] text-[#1B2036] font-mono shadow-[1.5px_1.5px_0px_#1B2036]"
                      >
                        {sty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Consumed Beer Styles recorded by community check-ins */}
                {(() => {
                  const consumedMap = getSpotConsumedBeerStyles(selectedBar.id);
                  const entries = Object.entries(consumedMap).sort((a, b) => b[1] - a[1]);
                  if (entries.length === 0) return null;

                  return (
                    <div className="mt-3.5 p-3.5 rounded-2xl bg-[#F6EFDC] border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[#1B2036] font-bold uppercase tracking-widest text-[8.5px] font-display flex items-center gap-1">
                          🍺 {lang === 'PT' ? 'Estilos Mais Consumidos pelos Utilizadores' : 'Top Consumed Styles by Users'}
                        </span>
                        <span className="text-[8.5px] font-mono text-[#1B2036]/80 font-bold">
                          {entries.reduce((acc, [, c]) => acc + c, 0)} {lang === 'PT' ? 'registos' : 'logs'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {entries.map(([st, cnt]) => (
                          <span
                            key={st}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-white text-[#1B2036] border-2 border-[#1B2036] shadow-[1px_1px_0px_#1B2036] font-mono flex items-center gap-1"
                          >
                            <span>{st}</span>
                            <strong className="text-[#E85B41] font-black">({cnt})</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Social Media Link actions */}
              <div className="mt-3 flex items-center space-x-3 text-[11px] font-bold font-display">
                {selectedBar.facebookUrl && (
                  <a 
                    href={selectedBar.facebookUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 border-2 border-[#1B2036] rounded-xl bg-white hover:bg-[#EFE6CC] text-[#1B2036] shadow-[2px_2px_0px_#1B2036] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                    id={`btn-fb-${selectedBar.id}`}
                  >
                    <Facebook className="w-3.5 h-3.5 fill-current" />
                    <span>Facebook</span>
                  </a>
                )}
                {selectedBar.instagramUrl && (
                  <a 
                    href={selectedBar.instagramUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 border-2 border-[#1B2036] rounded-xl bg-white hover:bg-[#EFE6CC] text-[#1B2036] shadow-[2px_2px_0px_#1B2036] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                    id={`btn-ig-${selectedBar.id}`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>
                )}
              </div>

              {/* TAPS Classification Table (Moved deeper, right before Reviews) */}
              {(() => {
                const currentTaps = selectedBar.taps || 0;
                const tier = getSpotTier(currentTaps);
                return (
                  <div className="mt-5 p-3.5 rounded-2xl border-2 border-[#1B2036] bg-white shadow-[3px_3px_0px_#1B2036] text-[#1B2036]">
                    <div className="flex items-center justify-between mb-3 border-b-2 border-[#1B2036]/15 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">🍺</span>
                        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#1B2036] font-display">
                          {lang === 'PT' ? 'Nível do Spot' : 'Spot Level'}
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#F6EFDC] text-[#1B2036] border-2 border-[#1B2036] shadow-[1px_1px_0px_#1B2036]">
                        {currentTaps.toLocaleString()} TAPS
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="text-[10px] border-b-2 border-[#1B2036]/10 pb-3">
                        <span className="text-[#1B2036]/70 block text-[8px] font-bold uppercase tracking-wider font-display mb-1">
                          {lang === 'PT' ? 'Ranking' : 'Rank'}
                        </span>
                        <span className="font-bold flex items-center gap-1 text-[#1B2036]">
                          {tier.badge.split(' ')[0]} {tier.title}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-[10px]">
                        <div>
                          <span className="text-[#1B2036]/70 block text-[8px] font-bold uppercase tracking-wider font-display mb-0.5">
                            {lang === 'PT' ? 'Vibe Alcançada' : 'Achieved Vibe'}
                          </span>
                          <p className="leading-relaxed text-[#1B2036]/85">{tier.concept}</p>
                        </div>
                        <div>
                          <span className="text-[#1B2036]/70 block text-[8px] font-bold uppercase tracking-wider font-display mb-0.5">
                            {lang === 'PT' ? 'Atmosfera Estimada' : 'Estimated Atmosphere'}
                          </span>
                          <p className="leading-relaxed text-[#1B2036]/85">{tier.atmosphere}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mini table list */}
                    <div className="mt-3.5 pt-3 border-t-2 border-[#1B2036]/15">
                      <span className="text-[#1B2036]/70 block text-[8px] font-bold uppercase tracking-wider mb-2 font-display">
                        {lang === 'PT' ? 'Tabela de Classificação Geral' : 'General Classification Table'}
                      </span>
                      <div className="space-y-1 text-[8.5px] font-mono">
                        {[
                          { range: '0 – 99', title: 'Secret Speakeasy', badge: '🗝️' },
                          { range: '100 – 499', title: 'Cozy Taproom', badge: '🍻' },
                          { range: '500 – 1.499', title: 'Craft Hub', badge: '📍' },
                          { range: '1.500 – 4.999', title: 'Beer Temple', badge: '🏛️' },
                          { range: '5.000 – 14.999', title: 'Imperial Station', badge: '👑' },
                          { range: '15.000+', title: 'The Craft Mecca', badge: '🌌' }
                        ].map((lvl, idx) => {
                          const isCurrent = (
                            (idx === 0 && currentTaps < 100) ||
                            (idx === 1 && currentTaps >= 100 && currentTaps < 500) ||
                            (idx === 2 && currentTaps >= 500 && currentTaps < 1500) ||
                            (idx === 3 && currentTaps >= 1500 && currentTaps < 5000) ||
                            (idx === 4 && currentTaps >= 5000 && currentTaps < 15000) ||
                            (idx === 5 && currentTaps >= 15000)
                          );
                          return (
                            <div 
                              key={lvl.title} 
                              className={`flex items-center justify-between p-1.5 rounded-lg transition-all ${
                                isCurrent 
                                  ? 'bg-[#F2A93B]/25 text-[#1B2036] border-2 border-[#1B2036] font-bold shadow-[1px_1px_0px_#1B2036]' 
                                  : 'text-[#1B2036]/60 border border-[#1B2036]/20 bg-[#FAF6EB]'
                              }`}
                            >
                              <span className="flex items-center gap-1">
                                <span>{lvl.badge}</span>
                                <span>{lvl.title}</span>
                              </span>
                              <span>{lvl.range}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Reviews subsection */}
              <div className="mt-6 pt-5 border-t-2 border-[#1B2036]/15">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#1B2036] font-display">
                    {lang === 'PT' ? 'Avaliações e Opiniões' : 'Reviews & Ratings'}
                  </h4>
                  {(() => {
                    const hasReviewed = user.isLoggedIn && (selectedBar.reviews || []).some(rev => rev.userId === user.id);
                    return (
                      <button 
                        onClick={() => {
                          if (hasReviewed) return;
                          setActiveBarToReview(selectedBar);
                        }}
                        disabled={hasReviewed}
                        className={`font-bold text-[10px] uppercase tracking-wider font-display transition px-2.5 py-1 rounded-lg border-2 ${
                          hasReviewed 
                            ? 'text-[#1B2036]/50 bg-[#EFE6CC] border-[#1B2036]/30 cursor-not-allowed' 
                            : 'bg-[#12908C] hover:bg-[#0B6C69] text-white font-extrabold border-[#1B2036] shadow-[1.5px_1.5px_0px_#1B2036] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]'
                        }`}
                        id="btn-add-review-section"
                      >
                        {hasReviewed 
                          ? (lang === 'PT' ? 'JÁ AVALIADO' : 'ALREADY REVIEWED') 
                          : (lang === 'PT' ? 'AVALIAR SPOT' : 'REVIEW SPOT')}
                      </button>
                    );
                  })()}
                </div>

                <div className="space-y-3">
                  {(() => {
                    const allReviews = selectedBar.reviews || [];
                    const displayedReviews = showAllSpotReviews ? allReviews : allReviews.slice(0, 5);

                    return (
                      <>
                        {displayedReviews.map(rev => {
                          const isAuthor = user.isLoggedIn && rev.userId === user.id;
                          return (
                            <div 
                              key={rev.id} 
                              className="p-3.5 bg-white rounded-2xl border-2 border-[#1B2036] text-[10px] space-y-1.5 shadow-[2px_2px_0px_#1B2036] text-[#1B2036]"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-[#1B2036] font-display flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-md bg-[#F6EFDC] flex items-center justify-center text-[10px] select-none border border-[#1B2036]" title="HOPS Level Badge">
                                    {getLevelDetails(isAuthor ? user.points : (rev.rating * 15)).badge}
                                  </span>
                                  <span>{rev.userName}</span>
                                  {isAuthor && (
                                    <span className="text-[7.5px] bg-[#F2A93B] text-black px-1 py-0.2 rounded border border-[#1B2036] font-mono font-bold">
                                      {lang === 'PT' ? 'TU' : 'YOU'}
                                    </span>
                                  )}
                                </span>
                                <div className="flex items-center gap-2">
                                  {isAuthor && (
                                    <button
                                      onClick={() => {
                                        setEditingReview({
                                          id: rev.id,
                                          barId: selectedBar.id,
                                          barName: selectedBar.name,
                                          stars: rev.rating,
                                          texto_rating: rev.comment,
                                          tipo_cerveja: rev.beerStyleReviewed || ''
                                        });
                                        setEditRating(rev.rating);
                                        setEditComment(rev.comment);
                                        setEditBeerStyle(rev.beerStyleReviewed || '');
                                      }}
                                      className="text-[8px] font-bold text-[#E85B41] hover:underline font-mono uppercase cursor-pointer"
                                    >
                                      {lang === 'PT' ? 'Editar' : 'Edit'}
                                    </button>
                                  )}
                                  <div className="flex items-center text-[#1B2036] space-x-0.5">
                                    <Star className="w-3.5 h-3.5 fill-[#F2A93B] text-[#F2A93B]" />
                                    <span className="font-bold font-mono text-[10px]">{rev.rating}</span>
                                  </div>
                                </div>
                              </div>
                              <p className="italic text-[#1B2036]/90 leading-relaxed font-sans">"{rev.comment}"</p>
                              {rev.beerStyleReviewed && (
                                <div className="pt-1 flex items-center justify-between text-[8px] text-[#1B2036]/70 font-bold uppercase tracking-wider font-mono">
                                  <span>{lang === 'PT' ? 'Bebeu:' : 'Drank:'} {rev.beerStyleReviewed}</span>
                                  <span>{rev.date}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {allReviews.length > 5 && (
                          <div className="text-center pt-2">
                            <button
                              type="button"
                              onClick={() => setShowAllSpotReviews(!showAllSpotReviews)}
                              className="text-[10px] font-extrabold px-4 py-2 rounded-xl border-2 border-black bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer font-display uppercase tracking-wider inline-flex items-center gap-1.5"
                              id="btn-toggle-spot-reviews"
                            >
                              {showAllSpotReviews 
                                ? (lang === 'PT' ? 'Ver Menos' : 'Show Less') 
                                : (lang === 'PT' ? 'Ver +' : 'See +')}
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              </div> {/* End Scrollable Content Container */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- REVIEW ADD FORM DIALOG OVERLAY --- */}
        <AnimatePresence>
          {activeBarToReview && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-[210]">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#FAF6EB] border-2 border-black rounded-3xl p-5 max-w-[340px] w-full text-[#1B2036] font-sans text-xs space-y-3.5 shadow-[4px_4px_0px_#000000]"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-black font-display text-sm tracking-tight">
                    {lang === 'PT' ? `Avaliar ${activeBarToReview.name}` : `Review ${activeBarToReview.name}`}
                  </h3>
                  <button 
                    onClick={() => setActiveBarToReview(null)} 
                    className="w-7 h-7 rounded-full border-2 border-black bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black flex items-center justify-center transition cursor-pointer shadow-md" 
                    id="btn-review-close"
                    title={lang === 'PT' ? 'Fechar' : 'Close'}
                  >
                    <X className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-black block font-bold text-[9.5px] uppercase tracking-wider font-display">
                    {lang === 'PT' ? 'Pontuação Geral (1 a 5 Estrelas)' : 'Overall Rating (1 to 5 Stars)'}
                  </span>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(st => (
                      <button 
                        key={st} 
                        type="button"
                        onClick={() => setReviewRating(st)}
                        className={`p-1.5 rounded-xl border-2 border-black transition active:scale-90 cursor-pointer ${
                          reviewRating >= st 
                            ? 'bg-amber-500 text-black shadow-[1px_1px_0px_#000000]' 
                            : 'bg-[#EFE6CC] text-zinc-400 hover:text-black'
                        }`}
                        id={`review-star-${st}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-black block font-bold text-[9.5px] uppercase tracking-wider font-display">
                    {lang === 'PT' ? 'Cerveja que bebeste (Estilo/Marca)' : 'Beer you drank (Style/Brand)'}
                  </span>
                  <input 
                    type="text" 
                    placeholder={lang === 'PT' ? "Ex: West Coast IPA Letra" : "E.g. West Coast IPA Letra"}
                    value={reviewBeerStyle}
                    onChange={e => setReviewBeerStyle(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-black text-xs outline-none focus:border-amber-500 placeholder:text-zinc-400 shadow-[1px_1px_0px_#000000]"
                    id="input-review-beerstyle"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-black block font-bold text-[9.5px] uppercase tracking-wider font-display">
                      {lang === 'PT' ? 'A tua opinião' : 'Your review'}
                    </span>
                    <span className="text-[8.5px] text-zinc-600 font-mono font-bold">{reviewComment.length}/100</span>
                  </div>
                  <textarea 
                    placeholder={lang === 'PT' ? "Características da cerveja, atendimento ou ambiente..." : "Beer flavors, service, or atmosphere..."}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value.slice(0, 100))}
                    maxLength={100}
                    className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-black text-xs h-20 outline-none focus:border-amber-500 resize-none placeholder:text-zinc-400 shadow-[1px_1px_0px_#000000]"
                    id="textarea-review-comment"
                  />
                </div>

                <button 
                  onClick={submitReview}
                  disabled={!reviewComment}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition disabled:opacity-40 cursor-pointer font-display uppercase tracking-wider"
                  id="btn-review-submit"
                >
                  {lang === 'PT' ? 'Submeter Avaliação' : 'Submit Review'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- REVIEW EDIT FORM DIALOG OVERLAY --- */}
        <AnimatePresence>
          {editingReview && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-[210]">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#FAF6EB] border-2 border-black rounded-3xl p-5 max-w-[340px] w-full text-[#1B2036] font-sans text-xs space-y-3.5 shadow-[4px_4px_0px_#000000]"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-black font-display text-sm tracking-tight">
                    {lang === 'PT' ? 'Editar Avaliação' : 'Edit Review'}
                  </h3>
                  <button 
                    onClick={() => setEditingReview(null)} 
                    className="w-7 h-7 rounded-full border-2 border-black bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black flex items-center justify-center transition cursor-pointer shadow-md" 
                    id="btn-edit-review-close"
                    title={lang === 'PT' ? 'Fechar' : 'Close'}
                  >
                    <X className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-black block font-bold text-[9.5px] uppercase tracking-wider font-display">
                    {lang === 'PT' ? 'Pontuação Geral (1 a 5 Estrelas)' : 'Overall Rating (1 to 5 Stars)'}
                  </span>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(st => (
                      <button 
                        key={st} 
                        type="button"
                        onClick={() => setEditRating(st)}
                        className={`p-1.5 rounded-xl border-2 border-black transition active:scale-90 cursor-pointer ${
                          editRating >= st 
                            ? 'bg-amber-500 text-black shadow-[1px_1px_0px_#000000]' 
                            : 'bg-[#EFE6CC] text-zinc-400 hover:text-black'
                        }`}
                        id={`edit-review-star-${st}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-black block font-bold text-[9.5px] uppercase tracking-wider font-display">
                    {lang === 'PT' ? 'Cerveja que bebeste (Estilo/Marca)' : 'Beer you drank (Style/Brand)'}
                  </span>
                  <input 
                    type="text" 
                    placeholder={lang === 'PT' ? "Ex: West Coast IPA Letra" : "E.g. West Coast IPA Letra"}
                    value={editBeerStyle}
                    onChange={e => setEditBeerStyle(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-black text-xs outline-none focus:border-amber-500 placeholder:text-zinc-400 shadow-[1px_1px_0px_#000000]"
                    id="input-edit-review-beerstyle"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-black block font-bold text-[9.5px] uppercase tracking-wider font-display">
                      {lang === 'PT' ? 'A tua opinião' : 'Your review'}
                    </span>
                    <span className="text-[8.5px] text-zinc-600 font-mono font-bold">{editComment.length}/100</span>
                  </div>
                  <textarea 
                    placeholder={lang === 'PT' ? "Características da cerveja, atendimento ou ambiente..." : "Beer flavors, service, or atmosphere..."}
                    value={editComment}
                    onChange={e => setEditComment(e.target.value.slice(0, 100))}
                    maxLength={100}
                    className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-black text-xs h-20 outline-none focus:border-amber-500 resize-none placeholder:text-zinc-400 shadow-[1px_1px_0px_#000000]"
                    id="textarea-edit-review-comment"
                  />
                </div>

                <button 
                  onClick={updateReview}
                  disabled={!editComment}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-extrabold rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition cursor-pointer font-display uppercase tracking-wider"
                  id="btn-edit-review-submit"
                >
                  {lang === 'PT' ? 'GRAVAR ALTERAÇÕES' : 'SAVE CHANGES'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- SYSTEM NOTIFICATIONS / TRANSACTIONAL / APPLE PAY INTEGRATION TRIGGERS --- */}
        <AnimatePresence>
          {applePayItem && (
            <ApplePaySheet 
              itemName={applePayItem.name} 
              price={applePayItem.price} 
              lang={lang}
              onConfirm={() => {
                // Find matching event
                const evSelected = events.find(e => e.title === applePayItem.name);
                if (evSelected) {
                  setUser(prev => ({
                    ...prev,
                    purchasedEventTickets: [...prev.purchasedEventTickets, evSelected.id]
                  }));

                  triggerSelfPush(
                    'Reserva Concluída! 🎫',
                    `Compraste com sucesso o bilhete para ${evSelected.title}. O teu código QR especial foi guardado.`,
                    'reward'
                  );
                }
                setApplePayItem(null);
              }} 
              onClose={() => setApplePayItem(null)} 
            />
          )}
        </AnimatePresence>

        {/* --- BIOMETRICS ID SCANNING CONFIRM BOX --- */}
        <AnimatePresence>
          {biometricsType && (
            <BiometricsConfirm 
              lang={lang}
              onSuccess={() => {
                if (biometricsCallback) biometricsCallback();
              }} 
              onCancel={() => {
                setBiometricsType(null);
                setBiometricsCallback(null);
              }} 
              reason={biometricsReason} 
            />
          )}
        </AnimatePresence>



        {/* --- BOTTOM INTERACTIVE TAB NAVIGATION --- */}
        {user.isLoggedIn && (
          <nav 
            className="border-t-2 border-[#1B2036] bg-[#F6EFDC] shrink-0 sticky bottom-0 flex items-center justify-around px-1 sm:px-3 z-[160] select-none w-full max-w-full overflow-hidden landscape-compact-nav"
            style={{
              height: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)'
            }}
          >

            {/* TAB 1: EXPLORE */}
            <button 
              onClick={() => { playPacmanSound(); setActiveTab('explore'); handleSelectBar(null); }}
              className="flex flex-col items-center justify-center space-y-0.5 z-10 transition-all duration-150 relative cursor-pointer h-full py-1 px-1 flex-1 min-w-0"
              id="tab-btn-explore"
            >
              <div className={`p-0.5 rounded-md transition-all ${activeTab === 'explore' ? 'scale-110' : 'opacity-75'}`}>
                <PixelIcon name="compass" size={18} overrideColor={activeTab === 'explore' ? "#12908C" : "#1B2036"} />
              </div>
              <span className={`text-[7px] sm:text-[8px] font-press uppercase tracking-wider truncate max-w-full ${activeTab === 'explore' ? 'text-[#12908C] font-bold' : 'text-[#1B2036] font-bold opacity-80'}`}>
                {t('tabMap', lang)}
              </span>
            </button>

            {/* TAB 1.5: ROTAS / HOP ROUTE & MAP */}
            <button 
              onClick={() => { playPacmanSound(); setActiveTab('routes'); handleSelectBar(null); }}
              className="flex flex-col items-center justify-center space-y-0.5 z-10 transition-all duration-150 relative cursor-pointer h-full py-1 px-1 flex-1 min-w-0"
              id="tab-btn-routes"
            >
              <div className={`p-0.5 rounded-md transition-all ${activeTab === 'routes' ? 'scale-110' : 'opacity-75'}`}>
                <PixelIcon name="route" size={18} overrideColor={activeTab === 'routes' ? "#12908C" : "#1B2036"} />
              </div>
              <span className={`text-[7px] sm:text-[8px] font-press uppercase tracking-wider truncate max-w-full ${activeTab === 'routes' ? 'text-[#12908C] font-bold' : 'text-[#1B2036] font-bold opacity-80'}`}>
                {lang === 'PT' ? 'Rotas' : 'Hop Route'}
              </span>
            </button>

            {/* TAB 3: FESTIVALS & TICKETS */}
            <button 
              onClick={() => { playPacmanSound(); setActiveTab('events'); handleSelectBar(null); }}
              className="flex flex-col items-center justify-center space-y-0.5 z-10 transition-all duration-150 relative cursor-pointer h-full py-1 px-1 flex-1 min-w-0"
              id="tab-btn-events"
            >
              <div className={`p-0.5 rounded-md transition-all ${activeTab === 'events' ? 'scale-110' : 'opacity-75'}`}>
                <PixelIcon name="calendar" size={18} overrideColor={activeTab === 'events' ? "#12908C" : "#1B2036"} />
              </div>
              <span className={`text-[7px] sm:text-[8px] font-press uppercase tracking-wider truncate max-w-full ${activeTab === 'events' ? 'text-[#12908C] font-bold' : 'text-[#1B2036] font-bold opacity-80'}`}>
                {t('tabFestivals', lang)}
              </span>
            </button>

            {/* TAB 4: GAMIFICATION LOYALTY */}
            <button 
              onClick={() => { playPacmanSound(); setActiveTab('loyalty'); handleSelectBar(null); }}
              className="flex flex-col items-center justify-center space-y-0.5 z-10 transition-all duration-150 relative cursor-pointer h-full py-1 px-1 flex-1 min-w-0"
              id="tab-btn-loyalty"
            >
              <div className={`p-0.5 rounded-md transition-all ${activeTab === 'loyalty' ? 'scale-110' : 'opacity-75'}`}>
                <PixelIcon name="ticket" size={18} overrideColor={activeTab === 'loyalty' ? "#12908C" : "#1B2036"} />
              </div>
              <span className={`text-[7px] sm:text-[8px] font-press uppercase tracking-wider truncate max-w-full ${activeTab === 'loyalty' ? 'text-[#12908C] font-bold' : 'text-[#1B2036] font-bold opacity-80'}`}>
                {lang === 'PT' ? 'Check-in' : 'Check-in'}
              </span>
            </button>

            {/* TAB 5: PROFILE SETTINGS */}
            <button 
              onClick={() => { playPacmanSound(); setActiveTab('profile'); handleSelectBar(null); }}
              className="flex flex-col items-center justify-center space-y-0.5 z-10 transition-all duration-150 relative cursor-pointer h-full py-1 px-1 flex-1 min-w-0"
              id="tab-btn-profile"
            >
              <div className={`p-0.5 rounded-md transition-all relative ${activeTab === 'profile' ? 'scale-110' : 'opacity-75'}`}>
                <PixelIcon name="user" size={18} overrideColor={activeTab === 'profile' ? "#12908C" : "#1B2036"} />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#E85B41] rounded-xs shadow-[0_0_6px_#E85B41] border border-[#1B2036] z-20" />
                )}
              </div>
              <span className={`text-[7px] sm:text-[8px] font-press uppercase tracking-wider truncate max-w-full ${activeTab === 'profile' ? 'text-[#12908C] font-bold' : 'text-[#1B2036] font-bold opacity-80'}`}>
                {t('tabProfile', lang)}
              </span>
            </button>
          </nav>
        )}
      </div>

        {/* --- RETRO PAC-MAN SCOREBOARD MODAL --- */}
        <AnimatePresence>
          {showScoreModal && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-[300] bg-[#FAF6EB] p-4 flex flex-col justify-between font-press-start text-[#1B2036] select-none"
            >
              {/* Retro double border container */}
              <div className="flex-1 border-4 border-[#1B2036] rounded-2xl p-4 flex flex-col justify-between overflow-y-auto relative bg-[#FAF6EB] shadow-[4px_4px_0px_#1B2036]">
                
                {/* Round Close Button with X */}
                <button
                  type="button"
                  onClick={() => {
                    setShowScoreModal(false);
                    // Play a soft synthetic retro double beep
                    try {
                      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.type = 'square';
                      osc.frequency.setValueAtTime(600, ctx.currentTime);
                      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.1);
                      gain.gain.setValueAtTime(0.05, ctx.currentTime);
                      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
                      osc.connect(gain);
                      gain.connect(ctx.destination);
                      osc.start();
                      osc.stop(ctx.currentTime + 0.25);
                    } catch(e) {}
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#F6EFDC] hover:bg-[#EFE6CC] text-[#1B2036] border-2 border-[#1B2036] flex items-center justify-center transition-all active:scale-95 cursor-pointer z-20 shadow-[2px_2px_0px_#1B2036]"
                  title={lang === 'PT' ? 'Fechar' : 'Close'}
                  id="btn-close-score-modal"
                >
                  <X className="w-4 h-4 text-black stroke-[2.5]" />
                </button>

                {/* Header */}
                <div className="text-center space-y-1.5 mt-1 shrink-0 pr-6 pl-6">
                  <div className="text-[9.5px] text-[#E85B41] font-black tracking-widest font-press-start">
                    {lang === 'PT' ? 'TABELA DE PONTUAÇÃO' : '* TABLE OF HIGH SCORES *'}
                  </div>
                  <h2 
                    className="text-xs text-[#1B2036] font-black tracking-wider leading-relaxed font-press-start"
                  >
                    HOP-MAP by COBEER TASTE
                  </h2>
                </div>

                {/* Scores header */}
                <div className="grid grid-cols-3 gap-1.5 my-3 bg-white p-2.5 border-2 border-[#1B2036] rounded-xl shrink-0 text-center items-center shadow-[2px_2px_0px_#1B2036]">
                  <div>
                    <div className="text-[8.5px] text-[#1B2036]/70 font-mono font-bold">YOUR HOPS</div>
                    <div className="text-xs text-[#12908C] mt-0.5 font-bold font-mono truncate">
                      {user.points} PTS
                    </div>
                  </div>
                  <div className="border-x-2 border-[#1B2036]/20 px-1">
                    <div className="text-[8.5px] text-[#1B2036]/70 font-mono font-bold">USER</div>
                    <div className="text-xs text-[#1B2036] mt-0.5 font-bold font-mono truncate">
                      {user.username.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[8.5px] text-[#1B2036]/70 font-mono font-bold">RANKING</div>
                    <div className="text-xs text-[#E85B41] mt-0.5 font-bold font-mono truncate">
                      {user.level.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Modal Subtabs Selection: GLOBAL | AMIGOS | SPOTS | NÍVEIS */}
                <div className="flex gap-1.5 mt-1 shrink-0 border-b-2 border-[#1B2036]/20 pb-2.5">
                  <button
                    onClick={() => setScoreSubTab('global')}
                    className={`flex-1 py-2 text-[8.5px] rounded-xl border-2 transition cursor-pointer text-center font-press uppercase tracking-tighter ${
                      scoreSubTab === 'global'
                        ? 'bg-[#F2A93B] text-black border-[#1B2036] shadow-[2px_2px_0px_#1B2036] font-bold'
                        : 'bg-[#F6EFDC] text-[#1B2036]/70 border-[#1B2036]/30 hover:bg-[#EFE6CC] hover:text-[#1B2036]'
                    }`}
                  >
                    {t('tabGlobal', lang)}
                  </button>
                  <button
                    onClick={() => setScoreSubTab('friends')}
                    className={`flex-1 py-2 text-[8.5px] rounded-xl border-2 transition cursor-pointer text-center font-press uppercase tracking-tighter ${
                      scoreSubTab === 'friends'
                        ? 'bg-[#12908C] text-white border-[#1B2036] shadow-[2px_2px_0px_#1B2036] font-bold'
                        : 'bg-[#F6EFDC] text-[#1B2036]/70 border-[#1B2036]/30 hover:bg-[#EFE6CC] hover:text-[#1B2036]'
                    }`}
                  >
                    {t('tabFriends', lang)}
                  </button>
                  <button
                    onClick={() => setScoreSubTab('spots')}
                    className={`flex-1 py-2 text-[8.5px] rounded-xl border-2 transition cursor-pointer text-center font-press uppercase tracking-tighter ${
                      scoreSubTab === 'spots'
                        ? 'bg-[#4EBD3A] text-black border-[#1B2036] shadow-[2px_2px_0px_#1B2036] font-bold'
                        : 'bg-[#F6EFDC] text-[#1B2036]/70 border-[#1B2036]/30 hover:bg-[#EFE6CC] hover:text-[#1B2036]'
                    }`}
                  >
                    SPOTS
                  </button>
                  <button
                    onClick={() => setScoreSubTab('tiers')}
                    className={`flex-1 py-2 text-[8.5px] rounded-xl border-2 transition cursor-pointer text-center font-press uppercase tracking-tighter ${
                      scoreSubTab === 'tiers'
                        ? 'bg-[#E85B41] text-white border-[#1B2036] shadow-[2px_2px_0px_#1B2036] font-bold'
                        : 'bg-[#F6EFDC] text-[#1B2036]/70 border-[#1B2036]/30 hover:bg-[#EFE6CC] hover:text-[#1B2036]'
                    }`}
                  >
                    {t('tabTiers', lang)}
                  </button>
                </div>

                {/* Score Tiers / Leaderboard Container */}
                <div className="flex-1 overflow-y-auto space-y-2 my-2 pr-1">
                  
                  {scoreSubTab === 'global' && (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-12 text-[8.5px] text-[#1B2036] pb-1.5 border-b-2 border-[#1B2036] font-bold uppercase tracking-wider font-mono">
                        <div className="col-span-2 text-center">RANK</div>
                        <div className="col-span-1"></div>
                        <div className="col-span-6">PLAYER</div>
                        <div className="col-span-3 text-right">HOPS</div>
                      </div>

                      {isScoresLoading ? (
                        <div className="text-center py-8 text-xs text-[#1B2036]/60 font-mono">LOADING DATA...</div>
                      ) : (
                        globalScores.slice(0, 10).map((player, index) => {
                          const isCurrentUser = player.username.toLowerCase() === user.username.toLowerCase();
                          const isFriendOfUser = (user.friends || []).includes(player.id);
                          const isRank1 = index === 0;

                          return (
                            <div 
                              key={player.id || player.username}
                              className={`grid grid-cols-12 text-xs items-center py-2 px-1.5 rounded-xl border-2 transition ${
                                isRank1
                                  ? 'bg-[#F2A93B]/25 text-[#1B2036] font-black border-[#1B2036] shadow-[2px_2px_0px_#1B2036]'
                                  : isCurrentUser 
                                    ? 'bg-[#12908C]/20 text-[#1B2036] font-bold border-[#12908C] shadow-[1.5px_1.5px_0px_#1B2036]' 
                                    : 'bg-white border-[#1B2036]/20 text-[#1B2036] shadow-[1px_1px_0px_#1B2036]'
                              }`}
                            >
                              {/* Rank position */}
                              <div className="col-span-2 text-center font-bold font-mono text-xs flex items-center justify-center gap-0.5">
                                {isRank1 && <span className="text-[10px] select-none">👑</span>}
                                <span>{index + 1}º</span>
                              </div>

                              {/* Small Pac-Man pointer if it's the current user */}
                              <div className="col-span-1 flex items-center justify-center">
                                {isCurrentUser && (
                                  <div className="scale-75 animate-bounce">
                                    <PixelPacman size={10} />
                                  </div>
                                )}
                              </div>

                              {/* Username */}
                              <div className="col-span-6 truncate font-semibold uppercase tracking-wider text-xs flex items-center gap-1 text-left text-[#1B2036]">
                                <span className={isRank1 ? 'font-black' : ''}>{player.username}</span>
                                {isFriendOfUser && <span className="text-[8.5px] font-mono text-[#12908C] font-bold lowercase">[amigo]</span>}
                                {isCurrentUser && <span className="text-[8.5px] font-mono text-[#E85B41] font-bold lowercase">[tu]</span>}
                              </div>

                              {/* Points */}
                              <div className="col-span-3 text-right font-mono text-xs text-[#1B2036] pr-1 font-bold">
                                {isCurrentUser ? user.points : player.points} PTS
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {scoreSubTab === 'friends' && (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-12 text-[8.5px] text-[#1B2036] pb-1.5 border-b-2 border-[#1B2036] font-bold uppercase tracking-wider font-mono">
                        <div className="col-span-2 text-center">RANK</div>
                        <div className="col-span-1"></div>
                        <div className="col-span-6">FRIEND</div>
                        <div className="col-span-3 text-right">HOPS</div>
                      </div>

                      {(() => {
                        // Filter global list to just friends and current user
                        const friendsAndUser = globalScores.filter(player => {
                          const isCurrentUser = player.username.toLowerCase() === user.username.toLowerCase();
                          const isFriend = (user.friends || []).includes(player.id);
                          return isCurrentUser || isFriend;
                        });

                        if (friendsAndUser.length <= 1) {
                          return (
                            <div className="text-center py-8 px-2 space-y-2 bg-white rounded-xl border-2 border-[#1B2036] p-4 shadow-[2px_2px_0px_#1B2036] my-2">
                              <p className="text-[10px] text-[#1B2036] font-mono font-bold leading-relaxed">
                                {lang === 'PT' ? 'SEM AMIGOS NA TABELA.' : 'NO FRIENDS ON BOARD.'}
                              </p>
                              <p className="text-[9px] text-[#1B2036]/70 leading-normal font-sans">
                                {lang === 'PT' ? 'Adiciona amigos no teu perfil para comparar pontos HOPS!' : 'Add friends in your profile to compare HOPS points!'}
                              </p>
                            </div>
                          );
                        }

                        return friendsAndUser.map((player, index) => {
                          const isCurrentUser = player.username.toLowerCase() === user.username.toLowerCase();

                          return (
                            <div 
                              key={player.id || player.username}
                              className={`grid grid-cols-12 text-xs items-center py-2 px-1.5 rounded-xl border-2 transition ${
                                isCurrentUser 
                                  ? 'bg-[#12908C]/20 text-[#1B2036] font-bold border-[#12908C] shadow-[1.5px_1.5px_0px_#1B2036]' 
                                  : 'bg-white border-[#1B2036]/20 text-[#1B2036] shadow-[1px_1px_0px_#1B2036]'
                              }`}
                            >
                              <div className="col-span-2 text-center font-bold font-mono text-xs">
                                {index + 1}º
                              </div>

                              <div className="col-span-1 flex items-center justify-center">
                                {isCurrentUser && (
                                  <div className="scale-75 animate-bounce">
                                    <PixelPacman size={10} />
                                  </div>
                                )}
                              </div>

                              <div className="col-span-6 truncate font-semibold uppercase tracking-wider text-xs flex items-center gap-1 text-left text-[#1B2036]">
                                <span>{player.username}</span>
                                {isCurrentUser && <span className="text-[8.5px] font-mono text-[#E85B41] font-bold lowercase">[tu]</span>}
                              </div>

                              <div className="col-span-3 text-right font-mono text-xs text-[#1B2036] pr-1 font-bold">
                                {isCurrentUser ? user.points : player.points} PTS
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}

                  {scoreSubTab === 'tiers' && (
                    <div className="space-y-3">
                      {/* Top Section: Níveis dos Utilizadores */}
                      <div className="space-y-1.5">
                        <div className="text-[9.5px] text-[#E85B41] font-black uppercase tracking-wider pb-1 flex items-center gap-1.5 font-press">
                          <span>👤</span>
                          <span>{lang === 'PT' ? 'NÍVEIS DOS UTILIZADORES' : 'USER LEVELS'}</span>
                        </div>
                        <div className="grid grid-cols-12 text-[8.5px] text-[#1B2036] pb-1.5 border-b-2 border-[#1B2036] font-bold uppercase tracking-wider font-mono">
                          <div className="col-span-1 text-center"></div>
                          <div className="col-span-2 text-center">BADGE</div>
                          <div className="col-span-5">{lang === 'PT' ? 'TÍTULO' : 'RANK TITLE'}</div>
                          <div className="col-span-4 text-right">{lang === 'PT' ? 'OBJETIVO' : 'HOPS'}</div>
                        </div>

                        {[
                          { threshold: 101, range: '101+', title: 'Lord Barrels', badge: '🛢️' },
                          { threshold: 91, range: '91-100', title: 'HOP Master', badge: '👑' },
                          { threshold: 71, range: '71-90', title: 'Cicerone', badge: '🎖️' },
                          { threshold: 46, range: '46-70', title: 'Hop Head', badge: '🤯' },
                          { threshold: 26, range: '26-45', title: 'Homebrewer', badge: '🧪' },
                          { threshold: 11, range: '11-25', title: 'HOP Rookie', badge: '🌿' },
                          { threshold: 0, range: '0-10', title: 'HOP Novice', badge: '🌱' }
                        ].map((tier, idx) => {
                          const isUserActiveTier = getUserTierIndex(user.points) === idx;
                          return (
                            <div 
                              key={idx} 
                              className={`grid grid-cols-12 text-xs items-center py-1.5 px-1.5 rounded-lg border transition ${
                                isUserActiveTier 
                                  ? 'bg-[#F2A93B]/30 text-[#1B2036] font-extrabold border-2 border-[#1B2036] shadow-[1.5px_1.5px_0px_#1B2036]' 
                                  : 'bg-white text-[#1B2036] border-[#1B2036]/20'
                              }`}
                            >
                              <div className="col-span-1 flex items-center justify-center">
                                {isUserActiveTier && (
                                  <div className="scale-75 animate-bounce">
                                    <PixelPacman size={12} />
                                  </div>
                                )}
                              </div>

                              <div className="col-span-2 text-center text-xs select-none">
                                {tier.badge}
                              </div>

                              <div className="col-span-5 truncate font-bold uppercase tracking-wider text-xs text-left">
                                {tier.title}
                              </div>

                              <div className="col-span-4 text-right font-mono text-xs text-[#1B2036] pr-1 font-bold">
                                {tier.range} PTS
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Linha horizontal tracejada divisória */}
                      <div className="border-t-2 border-dashed border-[#1B2036]/30 my-3" />

                      {/* Bottom Section: Nível dos Spots */}
                      <div className="space-y-1.5">
                        <div className="text-[9.5px] text-[#12908C] font-black uppercase tracking-wider pb-1 flex items-center gap-1.5 font-press">
                          <span>🍻</span>
                          <span>{lang === 'PT' ? 'NÍVEL DOS SPOTS' : 'SPOTS LEVELS'}</span>
                        </div>
                        <div className="grid grid-cols-12 text-[8.5px] text-[#1B2036] pb-1.5 border-b-2 border-[#1B2036] font-bold uppercase tracking-wider font-mono">
                          <div className="col-span-1 text-center"></div>
                          <div className="col-span-2 text-center">BADGE</div>
                          <div className="col-span-5">{lang === 'PT' ? 'TÍTULO' : 'TITLE'}</div>
                          <div className="col-span-4 text-right">{lang === 'PT' ? 'OBJETIVO' : 'TAPS'}</div>
                        </div>

                        {[
                          { threshold: 15000, range: '15000+', title: 'The Craft Mecca', badge: '🌌' },
                          { threshold: 5000, range: '5000-14999', title: 'Imperial Station', badge: '👑' },
                          { threshold: 1500, range: '1500-4999', title: 'Beer Temple', badge: '🏛️' },
                          { threshold: 500, range: '500-1499', title: 'Craft Hub', badge: '📍' },
                          { threshold: 100, range: '100-499', title: 'Cozy Taproom', badge: '🍻' },
                          { threshold: 0, range: '0-99', title: 'Secret Speakeasy', badge: '🗝️' }
                        ].map((tier, idx) => {
                          return (
                            <div 
                              key={idx} 
                              className="grid grid-cols-12 text-xs items-center py-1.5 px-1.5 rounded-lg border border-[#1B2036]/20 bg-white text-[#1B2036]"
                            >
                              <div className="col-span-1"></div>

                              <div className="col-span-2 text-center text-xs select-none">
                                {tier.badge}
                              </div>

                              <div className="col-span-5 truncate font-bold uppercase tracking-wider text-xs text-left">
                                {tier.title}
                              </div>

                              <div className="col-span-4 text-right font-mono text-xs text-[#1B2036] pr-1 font-bold">
                                {tier.range} TAPS
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {scoreSubTab === 'spots' && (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-12 text-[8.5px] text-[#1B2036] pb-1.5 border-b-2 border-[#1B2036] font-bold uppercase tracking-wider font-mono">
                        <div className="col-span-2 text-center font-mono">RANK</div>
                        <div className="col-span-1"></div>
                        <div className="col-span-6">BAR SPOT</div>
                        <div className="col-span-3 text-right">TAPS</div>
                      </div>

                      {(() => {
                        const topSpots = [...bars]
                          .sort((a, b) => (b.taps || 0) - (a.taps || 0))
                          .slice(0, 10);

                        return topSpots.map((spot, index) => {
                          const spotTaps = spot.taps || 0;
                          const isRank1 = index === 0;

                          return (
                            <div 
                              key={spot.id}
                              onClick={() => {
                                handleSelectBar(spot);
                                setShowScoreModal(false);
                                setActiveTab('explore');
                              }}
                              className={`grid grid-cols-12 text-xs items-center py-2 px-1.5 rounded-xl border-2 transition cursor-pointer ${
                                isRank1 
                                  ? 'bg-[#F2A93B]/25 text-[#1B2036] font-black border-[#1B2036] shadow-[2px_2px_0px_#1B2036]' 
                                  : 'bg-white border-[#1B2036]/20 text-[#1B2036] shadow-[1px_1px_0px_#1B2036] hover:bg-[#F6EFDC]'
                              }`}
                            >
                              {/* Rank position */}
                              <div className="col-span-2 text-center font-bold font-mono text-xs">
                                {index + 1}º
                              </div>

                              {/* Small icon indicator */}
                              <div className="col-span-1 flex items-center justify-center text-xs">
                                {index === 0 ? '🏆' : '🍻'}
                              </div>

                              {/* Spot Name */}
                              <div className="col-span-6 truncate font-semibold uppercase tracking-wider text-xs text-left text-[#1B2036]">
                                {spot.name}
                              </div>

                              {/* Taps count */}
                              <div className="col-span-3 text-right font-mono text-xs text-[#1B2036] pr-1 font-bold">
                                {spotTaps} TAPS
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}

                </div>

                {/* Bottom Actions: Share Ranking */}
                <div className="mt-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleShareRanking}
                    className="w-full py-3 bg-[#F2A93B] hover:bg-[#E09425] text-black border-2 border-[#1B2036] rounded-xl font-black tracking-wider transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer text-xs flex items-center justify-center gap-1.5 font-press select-none shadow-[2px_2px_0px_#1B2036]"
                    id="btn-share-ranking-modal"
                    title="Partilhar o teu ranking no HOP-MAP by COBEER TASTE"
                  >
                    <Share2 className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                    <span>{t('shareRanking', lang)}</span>
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- PASSWORD RESET MODAL --- */}
        <AnimatePresence>
          {showResetModal && (
            <div className="absolute inset-0 z-[400] flex items-center justify-center p-4">
              {/* Backdrop blur overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  if (!isResetLoading) setShowResetModal(false);
                }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              />

              {/* Modal Box */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative w-full max-w-[320px] rounded-[32px] p-5 border shadow-2xl z-10 space-y-4 ${
                  darkMode ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-950'
                }`}
              >
                <div className="flex justify-between items-center pb-1.5 border-b border-white/10">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-500 font-press-start">
                    {t('resetPasswordTitle', lang)}
                  </h3>
                  <button 
                    disabled={isResetLoading}
                    onClick={() => setShowResetModal(false)}
                    className="w-7 h-7 rounded-full border-2 border-black bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black flex items-center justify-center transition cursor-pointer shadow-md"
                    title={lang === 'PT' ? 'Fechar' : 'Close'}
                  >
                    <X className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  </button>
                </div>

                {resetSuccess ? (
                  <div className="space-y-4 py-2">
                    <div className="p-3.5 rounded-2xl text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-left leading-relaxed">
                      {resetSuccess}
                    </div>
                    <button
                      onClick={() => {
                        setShowResetModal(false);
                        setResetSuccess('');
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 active:scale-98 transition duration-150 cursor-pointer"
                    >
                      {t('doneBtn', lang)}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[10px] text-zinc-400 leading-relaxed pl-1">
                      {t('resetPasswordDesc', lang)}
                    </p>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 pl-1">{t('emailLabel', lang)}</label>
                      <input
                        type="email"
                        placeholder={t('emailPlaceholder', lang)}
                        value={resetEmail}
                        onChange={e => {
                          setResetEmail(e.target.value);
                          if (resetError) setResetError('');
                        }}
                        disabled={isResetLoading}
                        className={`w-full px-4 py-2 text-xs rounded-xl border transition-all outline-none ${
                          darkMode ? 'bg-zinc-950 border-white/10 text-white focus:border-amber-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-amber-500'
                        }`}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const trimmedEmail = resetEmail.trim();
                            if (!trimmedEmail) {
                              setResetError(lang === 'PT' ? 'Por favor, introduz o teu e-mail.' : 'Please enter your email.');
                              return;
                            }
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(trimmedEmail)) {
                              setResetError(lang === 'PT' ? 'Formato de e-mail inválido.' : 'Invalid email format.');
                              return;
                            }
                            setIsResetLoading(true);
                            sendPasswordResetEmail(auth, trimmedEmail)
                              .then(() => {
                                setResetSuccess(t('recoveryEmailSent', lang));
                                triggerSelfPush(
                                  t('recoveryPushTitle', lang),
                                  t('recoveryPushBody', lang),
                                  'system'
                                );
                              })
                              .catch((err: any) => {
                                let errorMsg = lang === 'PT' ? 'Erro ao enviar e-mail de recuperação.' : 'Error sending password reset email.';
                                if (err.code === 'auth/user-not-found') {
                                  errorMsg = lang === 'PT' ? 'Este e-mail não está associado a nenhuma conta.' : 'No account associated with this email.';
                                } else if (err.code === 'auth/invalid-email') {
                                  errorMsg = lang === 'PT' ? 'Formato de e-mail inválido.' : 'Invalid email format.';
                                } else {
                                  errorMsg = err.message || errorMsg;
                                }
                                setResetError(errorMsg);
                              })
                              .finally(() => {
                                setIsResetLoading(false);
                              });
                          }
                        }}
                      />
                    </div>

                    {resetError && (
                      <div className="p-3 rounded-xl text-[10px] font-medium bg-red-500/10 border border-red-500/25 text-red-400 text-left leading-normal animate-fade-in">
                        {resetError}
                      </div>
                    )}

                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        disabled={isResetLoading}
                        onClick={() => setShowResetModal(false)}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-xl border transition active:scale-98 cursor-pointer ${
                          darkMode 
                            ? 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5' 
                            : 'border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                        }`}
                      >
                        {t('cancel', lang)}
                      </button>

                      <button
                        type="button"
                        disabled={isResetLoading}
                        onClick={() => {
                          const trimmedEmail = resetEmail.trim();
                          if (!trimmedEmail) {
                            setResetError(lang === 'PT' ? 'Por favor, introduz o teu e-mail.' : 'Please enter your email.');
                            return;
                          }
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          if (!emailRegex.test(trimmedEmail)) {
                            setResetError(lang === 'PT' ? 'Formato de e-mail inválido.' : 'Invalid email format.');
                            return;
                          }
                          setIsResetLoading(true);
                          sendPasswordResetEmail(auth, trimmedEmail)
                            .then(() => {
                              setResetSuccess(t('recoveryEmailSent', lang));
                              triggerSelfPush(
                                t('recoveryPushTitle', lang),
                                t('recoveryPushBody', lang),
                                'system'
                              );
                            })
                            .catch((err: any) => {
                              let errorMsg = lang === 'PT' ? 'Erro ao enviar e-mail de recuperação.' : 'Error sending password reset email.';
                              if (err.code === 'auth/user-not-found') {
                                errorMsg = lang === 'PT' ? 'Este e-mail não está associado a nenhuma conta.' : 'No account associated with this email.';
                              } else if (err.code === 'auth/invalid-email') {
                                errorMsg = lang === 'PT' ? 'Formato de e-mail inválido.' : 'Invalid email format.';
                              } else {
                                errorMsg = err.message || errorMsg;
                              }
                              setResetError(errorMsg);
                            })
                            .finally(() => {
                              setIsResetLoading(false);
                            });
                        }}
                        className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-[10px] rounded-xl shadow-lg shadow-amber-500/10 active:scale-98 transition duration-150 cursor-pointer disabled:opacity-50"
                      >
                        {isResetLoading ? t('sendingBtn', lang) : t('recoverBtn', lang)}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- CHECK-IN POPUP MODAL --- */}
        <AnimatePresence>
          {checkinPopupModal && checkinPopupModal.isOpen && (
            <div className="absolute inset-0 z-[450] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCheckinPopupModal(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`relative w-full max-w-[320px] rounded-[32px] p-5 border-2 border-[#FFCA00]/50 shadow-2xl z-10 text-center space-y-4 ${
                  darkMode ? 'bg-zinc-950 text-white' : 'bg-zinc-900 text-white'
                }`}
              >
                {/* Pixelated HOP-MAP Header Badge */}
                <div className="flex justify-center items-center pt-1">
                  <div className="flex items-center gap-2 bg-black/70 px-4 py-1.5 rounded-xl border-2 border-[#FFCA00] shadow-md">
                    <Beer className="w-4 h-4 text-[#FFCA00] fill-[#FFCA00] animate-pulse" />
                    <span 
                      className="text-xs font-bold tracking-wider font-press-start text-[#FFCA00]"
                      style={{ textShadow: '1.5px 1.5px 0px #000000, 2px 2px 0px #b45309' }}
                    >
                      HOP-MAP
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <p className="text-xs font-bold text-zinc-100 leading-relaxed font-sans">
                    {checkinPopupModal.message}
                  </p>
                </div>

                {/* Website Link */}
                <div className="pt-0.5">
                  <a 
                    href="https://www.cobeertaste.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 font-mono text-xs font-extrabold underline tracking-wider transition-colors hover:scale-105 inline-block"
                  >
                    {checkinPopupModal.website}
                  </a>
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={() => setCheckinPopupModal(null)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-97 transition duration-150 cursor-pointer font-display uppercase tracking-wider"
                >
                  {lang === 'PT' ? 'Continuar 🍻' : 'Continue 🍻'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- SOCIAL MEDIA POPUP MODAL (Every 5 minutes) --- */}
        <AnimatePresence>
          {showSocialModal && (
            <div className="absolute inset-0 z-[440] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSocialModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-[320px] rounded-[32px] p-5 border-2 border-[#1B2036] bg-[#FAF6EB] text-[#1B2036] shadow-[4px_4px_0px_#1B2036] z-10 text-center space-y-3.5"
              >
                {/* Close X */}
                <button 
                  onClick={() => setShowSocialModal(false)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full border-2 border-[#1B2036] bg-[#F6EFDC] hover:bg-[#EFE6CC] text-[#1B2036] flex items-center justify-center transition cursor-pointer shadow-[2px_2px_0px_#1B2036]"
                  title={lang === 'PT' ? 'Fechar' : 'Close'}
                >
                  <X className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                </button>

                {/* Header Banner */}
                <div className="w-full flex flex-col items-center justify-center space-y-2 pt-1">
                  <div className="w-full text-center py-1">
                    <h2 
                      className="w-full text-2xl sm:text-[26px] font-black tracking-widest font-press text-[#1B2036] uppercase select-none leading-none block"
                    >
                      HOP-MAP
                    </h2>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#1B2036] font-display">
                    {t('followCobeerTaste', lang)} 🍻
                  </h3>
                  <p className="text-[10px] text-[#1B2036]/80 leading-relaxed font-sans px-1">
                    {t('joinCommunity', lang)}
                  </p>
                </div>

                {/* Social Buttons List */}
                <div className="w-full space-y-2.5 pt-1">
                  {/* INSTAGRAM */}
                  <a
                    href="https://www.instagram.com/cobeertaste"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl bg-white hover:bg-[#F6EFDC] border-2 border-[#1B2036] text-[#1B2036] shadow-[2px_2px_0px_#1B2036] active:translate-x-[1px] active:translate-y-[1px] transition-all group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-xl bg-gradient-to-tr from-[#F2A93B] via-[#E85B41] to-purple-600 text-white border border-[#1B2036] shadow-xs">
                        <Instagram className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] font-extrabold tracking-wide font-display text-[#1B2036] group-hover:text-[#E85B41] transition-colors">INSTAGRAM</div>
                        <div className="text-[8.5px] text-[#1B2036]/70 font-mono font-bold">@cobeertaste</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#1B2036] group-hover:translate-x-0.5 transition-all stroke-[2.5]" />
                  </a>

                  {/* FACEBOOK */}
                  <a
                    href="https://www.facebook.com/cobeertaste"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl bg-white hover:bg-[#F6EFDC] border-2 border-[#1B2036] text-[#1B2036] shadow-[2px_2px_0px_#1B2036] active:translate-x-[1px] active:translate-y-[1px] transition-all group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-xl bg-[#1877F2] text-white border border-[#1B2036] shadow-xs">
                        <Facebook className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] font-extrabold tracking-wide font-display text-[#1B2036] group-hover:text-[#1877F2] transition-colors">FACEBOOK</div>
                        <div className="text-[8.5px] text-[#1B2036]/70 font-mono font-bold">@cobeertaste</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#1B2036] group-hover:translate-x-0.5 transition-all stroke-[2.5]" />
                  </a>

                  {/* YOUTUBE */}
                  <a
                    href="https://www.youtube.com/channel/UCfcPIaTVsHjlGMJpQUFOrMQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl bg-white hover:bg-[#F6EFDC] border-2 border-[#1B2036] text-[#1B2036] shadow-[2px_2px_0px_#1B2036] active:translate-x-[1px] active:translate-y-[1px] transition-all group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-xl bg-[#FF0000] text-white border border-[#1B2036] shadow-xs">
                        <Youtube className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] font-extrabold tracking-wide font-display text-[#1B2036] group-hover:text-[#FF0000] transition-colors">YOUTUBE</div>
                        <div className="text-[8.5px] text-[#1B2036]/70 font-mono font-bold">Cobeer Taste Channel</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#1B2036] group-hover:translate-x-0.5 transition-all stroke-[2.5]" />
                  </a>
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => setShowSocialModal(false)}
                  className="w-full py-2.5 bg-[#F2A93B] hover:bg-[#E09425] text-black font-extrabold text-[10px] rounded-xl border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] active:translate-x-[1px] active:translate-y-[1px] transition duration-150 cursor-pointer mt-0.5 font-display uppercase tracking-wider"
                >
                  {t('continueHopMap', lang)}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- FESTIVAL DETAIL & CHECK-IN MODAL --- */}
        <AnimatePresence>
          {selectedFestival && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedFestival(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-lg rounded-3xl border-2 overflow-hidden shadow-2xl ${
                  darkMode ? 'bg-neutral-900 border-white/10 text-white' : 'bg-[#F6EFDC] border-black text-zinc-900'
                }`}
                id="modal-festival-details"
              >
                {/* Header Image */}
                <div className="relative h-44 w-full">
                  {selectedFestival.coverPhoto ? (
                    <img 
                      src={selectedFestival.coverPhoto} 
                      alt={selectedFestival.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className={`w-full h-full ${darkMode ? 'bg-zinc-800' : 'bg-neutral-200'} flex items-center justify-center`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setSelectedFestival(null)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black flex items-center justify-center border-2 border-black transition-colors z-20 cursor-pointer shadow-md"
                    title={lang === 'PT' ? 'Fechar' : 'Close'}
                  >
                    <X className="w-4 h-4 text-black stroke-[2.5]" />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/90 text-black font-extrabold text-[9px] uppercase tracking-wider font-display">
                      {selectedFestival.category}
                    </span>
                    <span className="text-[10px] text-zinc-300 font-mono">
                      📍 {selectedFestival.location || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 max-h-[65vh] overflow-y-auto">
                  <h3 className="font-bold text-base font-display">
                    {selectedFestival.title}
                  </h3>

                  <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-mono">
                    <span>📅 {getEventDate(selectedFestival, lang)}</span>
                  </div>

                  <p className={`text-xs leading-relaxed ${darkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {getEventDescription(selectedFestival, lang)}
                  </p>

                  {/* Check-In Block inside Modal */}
                  <div className={`p-3 rounded-2xl border-2 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-[#EFE6CC] border-black'} flex items-center justify-between gap-3 pt-3`}>
                    <div className="flex items-center space-x-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-amber-400 font-mono">+2 HOPS</span>
                    </div>

                    {(() => {
                      const isCheckedIn = user.checkedInFestivals?.includes(selectedFestival.id);
                      const isEnded = selectedFestival.endDate ? new Date(selectedFestival.endDate + 'T23:59:59') < new Date() : false;
                      const isIndefinido = selectedFestival.date === 'Sem data';

                      if (isCheckedIn) {
                        return (
                          <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold text-xs bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-mono">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>✓ {lang === 'PT' ? 'Check-in Efetuado' : 'Checked In'}</span>
                          </span>
                        );
                      }

                      if (isEnded) {
                        return (
                          <button disabled className="opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-500 font-bold text-xs px-3 py-1.5 rounded-xl border border-zinc-700/50">
                            {lang === 'PT' ? 'Festival Terminado' : 'Festival Ended'}
                          </button>
                        );
                      }

                      if (isIndefinido) {
                        return (
                          <button disabled className="opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-500 font-bold text-xs px-3 py-1.5 rounded-xl border border-zinc-700/50">
                            {lang === 'PT' ? 'Check-in Indisponível' : 'Check-in Unavailable'}
                          </button>
                        );
                      }

                      const eventCoords = CITY_COORDINATES[selectedFestival.location];
                      let isWithin200m = false;
                      let distanceInMeters = Infinity;
                      if (eventCoords) {
                        distanceInMeters = getDistanceInKm(
                          userLocation.latitude,
                          userLocation.longitude,
                          eventCoords.latitude,
                          eventCoords.longitude
                        ) * 1000;
                        isWithin200m = distanceInMeters <= 200;
                      }

                      const formatDistance = (meters: number): string => {
                        if (meters === Infinity) return 'N/A';
                        if (meters < 1000) return `${Math.round(meters)}m`;
                        return `${(meters / 1000).toFixed(1)}km`;
                      };

                      return (
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] text-zinc-400 font-mono">
                            {isWithin200m ? (
                              <span className="text-amber-500 font-bold">200m</span>
                            ) : (
                              <span>{formatDistance(distanceInMeters)}</span>
                            )}
                          </span>
                          <PixelCheckinAnimation
                            isActive={animatingCheckinEventId === selectedFestival.id}
                            onClick={() => handleFestivalCheckin(selectedFestival.id)}
                            containerClassName="shrink-0 w-auto"
                            className={`font-extrabold text-xs px-4 py-2 rounded-xl transition-all font-display shadow-md cursor-pointer whitespace-nowrap ${
                              isWithin200m 
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black border border-amber-400' 
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {lang === 'PT' ? 'Efetuar Check-in' : 'Check-in'}
                          </PixelCheckinAnimation>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- RETRO SPOT SHARING CARD MODAL --- */}
        <RetroSpotShareModal
          isOpen={!!shareBarModal}
          onClose={() => setShareBarModal(null)}
          bar={shareBarModal}
          user={user}
          lang={lang}
          darkMode={darkMode}
        />

        {/* --- MONTHLY METRICS & BUSINESS REPORT MODAL (cobeertaste@gmail.com strictly) --- */}
        {isMonthlyReportOpen && isAdmin && (
          <MonthlyReportModal
            isOpen={isMonthlyReportOpen && isAdmin}
            onClose={() => setIsMonthlyReportOpen(false)}
            allSpots={bars}
            isAdmin={isAdmin}
            userEmail={user.email || auth.currentUser?.email || ''}
            lang={lang}
            darkMode={darkMode}
          />
        )}

        {/* --- MASTER ADMIN CHECK-IN PINS DASHBOARD MODAL (cobeertaste@gmail.com strictly) --- */}
        {isAdminPinsModalOpen && isAdmin && (
          <AdminPinsDashboardModal
            isOpen={isAdminPinsModalOpen && isAdmin}
            onClose={() => setIsAdminPinsModalOpen(false)}
            allSpots={bars}
            isAdmin={isAdmin}
            userEmail={user.email || auth.currentUser?.email || ''}
            lang={lang}
            darkMode={darkMode}
            onPinUpdated={(spotId, newPin) => {
              setBars(prev => prev.map(b => b.id === spotId ? { ...b, checkinPin: newPin } : b));
            }}
          />
        )}

        {/* --- 8-BIT RETRO SPOT PIN ENTRY MODAL (Bartender PIN Validation) --- */}
        {pinModalSpot && (
          <RetroPinModal
            isOpen={!!pinModalSpot}
            onClose={() => setPinModalSpot(null)}
            spot={pinModalSpot}
            user={user}
            lang={lang}
            onSuccess={async (spot, enteredPin) => {
              setPinModalSpot(null);
              await handlePinCheckinSuccess(spot, enteredPin);
            }}
          />
        )}

        {/* --- 8-BIT RETRO STAGE CLEAR FESTIVE CELEBRATION OVERLAY --- */}
        <RetroStageClearCelebration
          isOpen={!!stageClearSpotName}
          spotName={stageClearSpotName || ''}
          lang={lang}
          onClose={() => setStageClearSpotName(null)}
        />

        {/* --- BEER STYLE POST-CHECK-IN MODAL (Qual o estilo de cerveja que bebeste?) --- */}
        <BeerStyleSelectModal
          isOpen={!!beerStyleModal?.isOpen}
          spotName={beerStyleModal?.spotName || ''}
          spotId={beerStyleModal?.spotId || ''}
          lang={lang}
          darkMode={darkMode}
          onSelectStyle={handleSelectBeerStyle}
          onClose={() => setBeerStyleModal(null)}
        />

        {/* --- BUY US A BEER / OFERECE UMA RODADA MODAL --- */}
        <DonationModal
          isOpen={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
          user={user}
          lang={lang}
          darkMode={darkMode}
        />

        {/* --- EDIT REVIEW MODAL (WITH 24H CONSTRAINT) --- */}
        <ReviewEditModal
          isOpen={!!editingReview}
          onClose={() => setEditingReview(null)}
          review={editingReview}
          rating={editRating}
          comment={editComment}
          beerStyle={editBeerStyle}
          onRatingChange={setEditRating}
          onCommentChange={setEditComment}
          onBeerStyleChange={setEditBeerStyle}
          onSubmit={updateReview}
          lang={lang}
          darkMode={darkMode}
        />

        {/* --- HOP-CHAT 🍻 COMMUNITY LIVE CHAT MODAL --- */}
        <HopCommunityChatModal
          isOpen={isHopChatOpen}
          onClose={() => setIsHopChatOpen(false)}
          user={user}
          lang={lang}
          darkMode={darkMode}
        />

        {/* --- IN-APP MENTION NOTIFICATION TOAST --- */}
        <MentionNotificationToast
          notification={activeMentionToast}
          onDismiss={() => setActiveMentionToast(null)}
          onClick={() => {
            setActiveMentionToast(null);
            setIsHopChatOpen(true);
          }}
          lang={lang}
        />

        {/* --- RETRO BADGES CATALOG MODAL --- */}
        <BadgesModal
          isOpen={isBadgesModalOpen}
          onClose={() => setIsBadgesModalOpen(false)}
          badgeStatuses={userBadgeStatuses}
          lang={lang}
          darkMode={darkMode}
        />

        {/* --- REAL-TIME RETRO NEW BADGE UNLOCKED TOAST --- */}
        <BadgeUnlockedToast
          badge={newlyUnlockedBadge}
          onClose={() => setNewlyUnlockedBadge(null)}
          lang={lang}
        />

        {/* --- DELETE ACCOUNT CONFIRMATION MODAL --- */}
        <AnimatePresence>
          {showDeleteAccountModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => {
                if (!isDeletingAccount) setShowDeleteAccountModal(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl space-y-4 ${
                  darkMode ? 'bg-neutral-900 border-red-500/30 text-white' : 'bg-white border-red-300 text-neutral-900'
                }`}
                id="modal-delete-account"
              >
                {/* Modal Header */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 border border-red-500/30">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black font-display text-red-500 uppercase tracking-wider">
                      {t('deleteAccountTitle', lang)}
                    </h3>
                    <p className={`text-[10px] ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {user.email || user.username}
                    </p>
                  </div>
                </div>

                {/* Warning message */}
                <div className={`p-3.5 rounded-2xl border text-[11px] leading-relaxed ${
                  darkMode ? 'bg-red-950/20 border-red-500/30 text-zinc-300' : 'bg-red-50 border-red-200 text-zinc-800'
                }`}>
                  <p>{t('deleteAccountWarning', lang)}</p>
                </div>

                {deleteAccountErrorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-[10px] font-bold text-red-300">
                    {deleteAccountErrorMsg}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isDeletingAccount}
                    onClick={() => setShowDeleteAccountModal(false)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-sans transition cursor-pointer border ${
                      darkMode 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300' 
                        : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-700'
                    }`}
                    id="btn-cancel-delete-account"
                  >
                    {t('deleteAccountCancelBtn', lang)}
                  </button>

                  <button
                    type="button"
                    disabled={isDeletingAccount}
                    onClick={handleDeleteAccount}
                    className="flex-1 py-2.5 rounded-xl text-xs font-black font-display bg-red-600 hover:bg-red-700 text-white transition active:scale-95 cursor-pointer shadow-lg shadow-red-500/30 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    id="btn-confirm-delete-account"
                  >
                    {isDeletingAccount ? (
                      <>
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>{t('deleteAccountProcessing', lang)}</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('deleteAccountConfirmBtn', lang)}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

    </AppleDeviceFrame>
  );
}
