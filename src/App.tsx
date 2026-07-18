/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Beer, Star, MapPin, Award, Heart, Scroll, Calendar, User, Users,
  Search, Bell, Shield, Fingerprint, CreditCard, Sparkles, 
  Navigation, CheckCircle, ArrowRight, Instagram, Facebook, 
  X, Compass, Filter, Share2, Flame, RefreshCcw, Smile, Check, Zap, CheckSquare, Square,
  Camera, LogOut, Trophy, ChevronDown, Plus
} from 'lucide-react';

import { BARS_DATA, EVENTS_DATA, getReviewsForBar } from './data';
import { getBarGoogleMapsUrl } from './maps_utils';
import { Bar, BeerEvent, UserProfile, BarZone, HopNotification, Review } from './types';
import AppleDeviceFrame from './components/AppleDeviceFrame';
import BiometricsConfirm from './components/BiometricsConfirm';
import ApplePaySheet from './components/ApplePaySheet';
import MapInteractive from './components/MapInteractive';
import { PixelIcon, PixelPacman, PixelLogo, HopMapLogo } from './components/PixelIcons';

import { auth, db, isFirebaseConfigured } from './lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, collection, addDoc, getDocs, getDoc, query, orderBy, where, limit, onSnapshot } from 'firebase/firestore';

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

export function getLevelDetails(hops: number): LevelInfo {
  if (hops >= 101) {
    return {
      title: 'Lord of the Barrels',
      badge: '🛢️',
      concept: 'Para os utilizadores lendários que nunca param de avaliar.',
      isSecret: true,
      nextMeta: null,
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80'
    };
  } else if (hops >= 91) {
    return {
      title: 'HOP Master',
      badge: '👑',
      concept: 'O topo do ecossistema. Uma lenda viva dos bocks, barris e maturação.',
      isSecret: false,
      nextMeta: { count: 101, title: 'Lord of the Barrels' },
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80'
    };
  } else if (hops >= 71) {
    return {
      title: 'Certified Cicerone',
      badge: '🎖️',
      concept: 'Nível quase profissional. Deteta notas complexas e defeitos na cerveja (off-flavors).',
      isSecret: false,
      nextMeta: { count: 91, title: 'HOP Master' },
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80'
    };
  } else if (hops >= 46) {
    return {
      title: 'Hop Head',
      badge: '🤯',
      concept: 'Fanático por lúpulo e amargor (IBU elevado). O paladar já está viciado.',
      isSecret: false,
      nextMeta: { count: 71, title: 'Certified Cicerone' },
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'
    };
  } else if (hops >= 26) {
    return {
      title: 'Homebrewer',
      badge: '🧪',
      concept: 'Já entende de estilos (IPAs, Stouts, Sours) e avalia com critérios mais claros.',
      isSecret: false,
      nextMeta: { count: 46, title: 'Hop Head' },
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80'
    };
  } else if (hops >= 11) {
    return {
      title: 'HOP Rookie',
      badge: '🌿',
      concept: 'Já passou a barreira inicial e começou a notar a presença e aroma do lúpulo.',
      isSecret: false,
      nextMeta: { count: 26, title: 'Homebrewer' },
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
    };
  } else {
    return {
      title: 'HOP Novice',
      badge: '🌱',
      concept: 'O início de tudo. Está a descobrir que a cerveja vai além da lager industrial.',
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
  const [isGpsWithin50m, setIsGpsWithin50m] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'explore' | 'map' | 'events' | 'loyalty' | 'profile'>('explore');
  const [userLocation, setUserLocation] = useState({ latitude: 41.1500, longitude: -8.6200 }); // Defaults to Porto center
  
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
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);
  const [zoneSearchQuery, setZoneSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('All');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [proximitySort, setProximitySort] = useState(false);
  
  const [loyaltySearchQuery, setLoyaltySearchQuery] = useState('');
  const [showAllLoyaltySpots, setShowAllLoyaltySpots] = useState(false);
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // User & Gamification
  const [user, setUser] = useState<UserProfile>(() => {
    const initialPoints = 12;
    const initialLevelInfo = getLevelDetails(initialPoints);
    return {
      id: 'user_1',
      email: 'e-mail', // Metada User Email
      username: 'utilizador',
      avatarUrl: initialLevelInfo.avatarUrl,
      points: initialPoints,
      level: initialLevelInfo.title,
      stamps: { 'catraio': 2, 'cerveteca': 1 },
      favorites: ['catraio'],
      friends: [],
      purchasedEventTickets: [],
      biometricsEnabled: true,
      isLoggedIn: false,
      checkedInBars: [],
      lastCheckinDates: {},
      checkedInFestivals: []
    };
  });

  // Custom Routines / Otimização de Rota
  const [customRoute, setCustomRoute] = useState<string[]>(['catraio', 'letraria-braga']); // Default barIds
  const [isRouteOptimized, setIsRouteOptimized] = useState(false);

  // Profile Customization & Session State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreSubTab, setScoreSubTab] = useState<'global' | 'friends' | 'tiers' | 'spots' | 'spots_tiers'>('global');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const isLocalAuthFallback = false;

  // Password reset states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<HopNotification[]>([
    {
      id: 'n1',
      title: 'Artbeerfest Caminha Próximo!',
      body: 'Os bilhetes virtuais premium já estão disponíveis para compra rápida com Apple Pay.',
      timestamp: 'Hoje, 10:15',
      isRead: false,
      type: 'event'
    },
    {
      id: 'n2',
      title: 'Selo CoBeer Taste Ganho!',
      body: 'Ganhaste o badge de Impulsionador da Cerveja ao adicionares o teu primeiro bar favorito.',
      timestamp: 'Ontem, 16:30',
      isRead: true,
      type: 'reward'
    }
  ]);
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

  const handleFriendSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryStr = friendSearchQuery.trim();
    if (!queryStr) return;
    
    setIsFriendSearching(true);
    setFriendSearchMessage('');
    if (isLocalAuthFallback) {
      const results = LOCAL_MOCK_USERS.filter(mu => 
        mu.username.toLowerCase().includes(queryStr.toLowerCase()) && mu.id !== user.id
      );
      setFriendSearchResults(results);
      if (results.length === 0) {
        setFriendSearchMessage('Nenhum utilizador encontrado com esse nome.');
      }
      setIsFriendSearching(false);
      return;
    }
    try {
      const q = query(
        collection(db, 'users'), 
        where('username', '>=', queryStr), 
        where('username', '<=', queryStr + '\uf8ff'),
        limit(15)
      );
      
      const querySnapshot = await getDocs(q);
      const results: { id: string; username: string; points: number }[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (docSnap.id !== user.id) {
          results.push({
            id: docSnap.id,
            username: data.username || 'utilizador',
            points: typeof data.points === 'number' ? data.points : 0
          });
        }
      });

      LOCAL_MOCK_USERS.forEach(mu => {
        if (mu.username.toLowerCase().includes(queryStr.toLowerCase()) && mu.id !== user.id) {
          if (!results.some(r => r.username.toLowerCase() === mu.username.toLowerCase())) {
            results.push(mu);
          }
        }
      });

      setFriendSearchResults(results);
      if (results.length === 0) {
        setFriendSearchMessage('Nenhum utilizador encontrado com esse nome.');
      }
    } catch (err) {
      console.warn("Search failed, using fallback mock list:", err);
      const results = LOCAL_MOCK_USERS.filter(mu => 
        mu.username.toLowerCase().includes(queryStr.toLowerCase()) && mu.id !== user.id
      );
      setFriendSearchResults(results);
      if (results.length === 0) {
        setFriendSearchMessage('Nenhum utilizador encontrado com esse nome.');
      }
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

        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            savedPoints = typeof data.points === 'number' ? data.points : 0;
            if (Array.isArray(data.favorites)) {
              savedFavorites = data.favorites;
            }
            if (Array.isArray(data.friends)) {
              savedFriends = data.friends;
            }
            if (Array.isArray(data.checkedInFestivals)) {
              savedFestivals = data.checkedInFestivals;
            }
            // Update cache with fresh data from server
            localStorage.setItem(cacheKeyPrefix + 'points', String(savedPoints));
            localStorage.setItem(cacheKeyPrefix + 'favorites', JSON.stringify(savedFavorites));
            localStorage.setItem(cacheKeyPrefix + 'friends', JSON.stringify(savedFriends));
            localStorage.setItem(cacheKeyPrefix + 'checkedInFestivals', JSON.stringify(savedFestivals));
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



  // Sync user changes back to localStorage cache to guarantee extreme offline robustness
  useEffect(() => {
    if (user.isLoggedIn && user.id) {
      const cacheKeyPrefix = `hop_user_${user.id}_`;
      localStorage.setItem(cacheKeyPrefix + 'points', String(user.points || 0));
      localStorage.setItem(cacheKeyPrefix + 'favorites', JSON.stringify(user.favorites || []));
      localStorage.setItem(cacheKeyPrefix + 'friends', JSON.stringify(user.friends || []));
    }
  }, [user.id, user.points, user.favorites, user.friends, user.isLoggedIn]);

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

  // Helper styles extracted
  const stylesList = Array.from(new Set(BARS_DATA.flatMap(b => b.styles)));

  // Simulated push trigger
  const triggerSelfPush = (title: string, body: string, type: HopNotification['type']) => {
    const freshPush: HopNotification = {
      id: `push_${Date.now()}`,
      title,
      body,
      timestamp: 'Agora mesmo',
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

  // Check in at bar (Guaranteed Gamificação)
  const initiateCheckin = (bar: Bar) => {
    const todayLocal = new Date();
    const year = todayLocal.getFullYear();
    const month = String(todayLocal.getMonth() + 1).padStart(2, '0');
    const day = String(todayLocal.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const lastCheckinDate = user.lastCheckinDates ? user.lastCheckinDates[bar.id] : undefined;
    if (lastCheckinDate === todayStr) {
      triggerSelfPush(
        'Check-in já efetuado hoje!',
        `Já fizeste Check-In + Selo em ${bar.name} hoje. Só podes acumular um selo por dia em cada spot!`,
        'system'
      );
      return;
    }

    const exactDistance = getHaversineDistanceInMeters(userLocation.latitude, userLocation.longitude, bar.latitude, bar.longitude);
    const isWithinRange = exactDistance <= 50;
    if (!isWithinRange) {
      triggerSelfPush(
        'Fora do Raio de Check-in!',
        `Estás demasiado longe deste local para fazer check-in. Deves encontrar-te a menos de 50 metros do spot (atualmente estás a ${Math.round(exactDistance)} metros).`,
        'system'
      );
      return;
    }
    setBiometricsReason(`Para validar o check-in seguro em ${bar.name}`);
    setBiometricsType('checkin');
    setBiometricsCallback(() => async () => {
      // Award stamps and points
      const currentStamps = user.stamps[bar.id] || 0;
      const nextStamps = currentStamps + 1;
      const willReset = nextStamps >= 10;
      
      let alertMsg = `Check-in efetuado! Ganhaste 1 check-in neste spot.`;

      if (willReset) {
        alertMsg = `Check-in efetuado! Ganhaste 1 check-in neste spot. Card preenchido! Ganhaste +1 ponto HOP e 1 Cerveja Grátis neste bar! 🎉`;
      }

      // Save the updated points to the user document in Firestore if using cloud auth
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

      // Save/Increment spot's TAPS in Firestore and update state
      const currentBarTaps = bar.taps || getDeterministicBaseTaps(bar.id);
      const newBarTaps = currentBarTaps + 1;

      if (!isLocalAuthFallback && auth.currentUser) {
        try {
          await setDoc(doc(db, 'spots_taps', bar.id), { taps: newBarTaps }, { merge: true });
        } catch (terr) {
          console.error('Error updating spot taps in Firestore:', terr);
        }
      }
      localStorage.setItem(`spot_taps_${bar.id}`, String(newBarTaps));
      setBars(prevBars => prevBars.map(b => b.id === bar.id ? { ...b, taps: newBarTaps } : b));

      setUser(prev => {
        const nextStampsRecord = { ...prev.stamps };
        if (willReset) {
          nextStampsRecord[bar.id] = 0;
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

        return {
          ...prev,
          points: (prev.points || 0) + 1,
          stamps: nextStampsRecord,
          checkedInBars: nextCheckedIn,
          lastCheckinDates: nextLastCheckinDates
        };
      });

      // Particle/Stamping Feedback trigger
      setAnimatingStampBarId(bar.id);
      setNewlyAddedStampIndex(willReset ? 4 : currentStamps);
      setActiveTab('loyalty');
      setSelectedBar(null); // Close detailed drawer to reveal Loyalty tab clearly

      // Play synthesized audio chimings
      if (willReset) {
        playRewardChime();
      } else {
        playStampSound();
      }

      // Auto clear animation states after three seconds
      setTimeout(() => {
        setAnimatingStampBarId(null);
        setNewlyAddedStampIndex(null);
      }, 3000);

      triggerSelfPush('Check-in Realizado!', alertMsg, 'loyalty');
      setBiometricsType(null);
    });
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

    // Success! Award 2 HOPS
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

  // Calculate distance for all bars, and when proximitySort is active, filter by <= 10.0 km radius. Always sort Ascendingly from nearest to furthest
  const displayBars = React.useMemo(() => {
    const barsWithDistance = filteredBars.map(bar => ({
      ...bar,
      distance: getDistanceInKm(userLocation.latitude, userLocation.longitude, bar.latitude, bar.longitude)
    }));

    if (proximitySort) {
      return barsWithDistance
        .filter(bar => bar.distance <= 10.0)
        .sort((a, b) => a.distance - b.distance);
    }
    return [...barsWithDistance].sort((a, b) => a.distance - b.distance);
  }, [filteredBars, proximitySort, userLocation]);

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
                <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase">Hop Map PUSH</span>
                <span className="text-[9px] text-zinc-500">X</span>
              </div>
              <h4 className="text-xs font-bold mt-0.5">{activePush.title}</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-normal">{activePush.body}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen layout wrapper holding our views */}
      <div className="flex-1 w-full h-full flex flex-col relative overflow-hidden bg-[#121828] text-white">
        
        {/* TOP COMPACT APP TITLE & PUSH SIMULATOR BUTTON */}
        {user.isLoggedIn && (
          <header className="px-4 py-3 flex items-center justify-between border-b-4 border-black bg-[#121828] text-white z-20 shrink-0 select-none">
            <button 
              type="button"
              onClick={() => {
                setActiveTab('explore');
                setSelectedBar(null);
              }}
              className="flex items-center gap-2.5 text-left focus:outline-none hover:opacity-85 active:scale-98 transition duration-150 cursor-pointer"
              id="btn-header-branding-logo"
            >
              <PixelPacman size={20} className="animate-pulse shrink-0" />
              <div className="flex flex-col">
                <h1 
                  className="text-xs sm:text-sm font-bold tracking-wider font-press-start text-[#FFCA00]"
                  style={{ textShadow: '1.5px 1.5px 0px #000000, 3px 3px 0px #b45309' }}
                >
                  HOP MAP
                </h1>
                <span className="text-[7px] text-zinc-400 font-bold uppercase tracking-wider font-mono">by Cobeer Taste</span>
              </div>
            </button>

            <div className="flex items-center gap-3">
              {/* Retro HOPS SCORE */}
              <button 
                onClick={() => setShowScoreModal(true)}
                className="flex items-center bg-black/50 border-2 border-[#FFCA00] hover:bg-[#FFCA00]/25 active:scale-95 transition-all px-2.5 py-1 rounded-md text-[8px] sm:text-[10px] font-bold tracking-widest font-press-start text-[#FFCA00] cursor-pointer select-none"
                id="btn-hops-score-board"
                title="Ver Tabela de Pontuações"
              >
                PONTUAÇÃO: {user.points}
              </button>
            </div>
          </header>
        )}

        {/* --- MAIN PAGE CHANGER AREA --- */}
        {!user.isLoggedIn ? (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 overflow-y-auto flex flex-col justify-center items-center p-6 text-center select-none"
          >
            {/* Logo */}
            <div className="mb-6 shrink-0">
              <PixelLogo size={180} />
            </div>

            <p className="text-[10px] mt-1 max-w-[280px] font-bold uppercase tracking-widest font-press-start text-white/80 leading-relaxed">
              CRAFT BEER LOVERS
            </p>

            {/* Login Card */}
            <div className={`w-full max-w-xs rounded-[32px] border p-5 mt-6 space-y-4 shadow-xl ${
              darkMode ? 'bg-black/30 backdrop-blur-md border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-950'
            }`}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                {isRegisterMode ? 'Criar Conta' : 'Iniciar Sessão'}
              </h2>
              
              <div className="space-y-3 text-left">
                {/* Optional Username Input when registering */}
                {isRegisterMode && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 pl-1">Utilizador</label>
                    <input
                      type="text"
                      placeholder="O teu nome..."
                      value={loginName}
                      onChange={e => setLoginName(e.target.value)}
                      className={`w-full px-4 py-2 text-xs rounded-xl border transition-all outline-none ${
                        darkMode ? 'bg-zinc-900 border-white/10 text-white focus:border-amber-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-amber-500'
                      }`}
                    />
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 pl-1">E-Mail</label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className={`w-full px-4 py-2 text-xs rounded-xl border transition-all outline-none ${
                      darkMode ? 'bg-zinc-900 border-white/10 text-white focus:border-amber-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-amber-500'
                    }`}
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center pr-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 pl-1">Palavra-passe</label>
                    <span className="text-[8px] text-zinc-500 font-medium">(mín. 6 caracteres)</span>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => {
                      setLoginPassword(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    className={`w-full px-4 py-2 text-xs rounded-xl border transition-all outline-none ${
                      darkMode ? 'bg-zinc-900 border-white/10 text-white focus:border-amber-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              {/* Error Alert Box */}
              {authError && (
                <div className="p-3 rounded-xl text-[10px] font-medium bg-red-500/10 border border-red-500/25 text-red-400 text-left leading-normal animate-fade-in space-y-2">
                  <div>{authError}</div>
                  {authError.includes('consola Firebase') && (
                    <div className="mt-2 pt-2 border-t border-red-500/25 text-[9px] text-zinc-300 space-y-1.5 font-normal">
                      <p className="font-bold text-amber-500">Passos para corrigir na Consola Firebase:</p>
                      <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 leading-normal">
                        <li>Acede à <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline text-amber-500 hover:text-amber-400 font-bold">Consola Firebase</a></li>
                        <li>Seleciona o teu projeto (<strong>hopmap-cobeertaste</strong>)</li>
                        <li>No menu esquerdo, vai a <strong>Authentication</strong></li>
                        <li>Clica no separador <strong>Sign-in method</strong> (Método de início de sessão)</li>
                        <li>Clica em <strong>Add new provider</strong> (Adicionar novo fornecedor) e clica em <strong>Email/Password</strong></li>
                        <li>Ativa a primeira opção (E-mail/palavra-passe) e clica em <strong>Guardar</strong></li>
                      </ol>
                      <p className="text-[8px] text-zinc-400 mt-2 font-semibold">Após guardares, recarrega esta página e poderás criar a tua conta e iniciar sessão normalmente!</p>
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
                      setAuthError('O Firebase não está configurado. Por favor, ativa o Firebase no ecrã do AI Studio.');
                      return;
                    }
                    if (isRegisterMode) {
                      if (!loginEmail || !loginPassword) {
                        setAuthError('Por favor, preenche todos os campos obrigatórios.');
                        return;
                      }
                      if (loginPassword.length < 6) {
                        setAuthError('A palavra-passe deve conter pelo menos 6 caracteres.');
                        return;
                      }
                      setIsAuthLoading(true);
                      const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
                      const displayNameVal = loginName.trim() || 'utilizador';
                      if (userCredential.user) {
                        await updateProfile(userCredential.user, { displayName: displayNameVal });
                        
                        // Add newly registered user to firestore collection 'users'
                        try {
                          await setDoc(doc(db, 'users', userCredential.user.uid), {
                            uid: userCredential.user.uid,
                            email: loginEmail.trim(),
                            username: displayNameVal,
                            createdAt: new Date().toISOString()
                          });
                        } catch (uerr) {
                          if (isPermissionError(uerr)) {
                            handleFirestoreError(uerr, OperationType.WRITE, `users/${userCredential.user.uid}`);
                          }
                          console.error('Error creating user profile in Firestore:', uerr);
                        }
                      }
                      triggerSelfPush(
                        'Conta Criada! 🍻',
                        `Olá ${displayNameVal}, bem-vindo ao teu roteiro Hop Map!`,
                        'system'
                      );
                    } else {
                      if (!loginEmail || !loginPassword) {
                        setAuthError('Por favor, introduz o e-mail e a palavra-passe.');
                        return;
                      }
                      if (loginPassword.length < 6) {
                        setAuthError('A palavra-passe deve conter pelo menos 6 caracteres.');
                        return;
                      }
                      setIsAuthLoading(true);
                      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
                      triggerSelfPush(
                        'Sessão Iniciada! 🍻',
                        `Bem-vindo de volta ao teu roteiro Hop Map!`,
                        'system'
                      );
                    }
                  } catch (err: any) {
                    console.error('Auth error:', err);
                    let PortugueseError = err.message || 'Ocorreu um erro na autenticação.';
                    if (err.code === 'auth/invalid-email') {
                      PortugueseError = 'E-mail inválido.';
                    } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                      PortugueseError = 'Credenciais incorretas.';
                    } else if (err.code === 'auth/email-already-in-use') {
                      PortugueseError = 'Este e-mail já está em uso.';
                    } else if (err.code === 'auth/weak-password' || (err.message && err.message.toLowerCase().includes('password'))) {
                      PortugueseError = 'A palavra-passe deve conter pelo menos 6 caracteres.';
                    } else if (err.code === 'auth/operation-not-allowed') {
                      PortugueseError = 'O método E-mail/Palavra-passe não está ativo na consola Firebase.';
                    } else {
                      PortugueseError = PortugueseError.replace(/^Firebase:\s*/, '');
                    }
                    setAuthError(PortugueseError);
                  } finally {
                    setIsAuthLoading(false);
                  }
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-98 transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAuthLoading ? 'A carregar...' : (isRegisterMode ? 'Registar' : 'Entrar')}
              </button>

              {/* Register Toggle Link */}
              <div className="text-center flex flex-col items-center gap-2">
                <button 
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setAuthError('');
                  }}
                  className="text-[10px] text-amber-500 hover:text-amber-400 font-bold underline cursor-pointer"
                >
                  {isRegisterMode ? 'Já tens conta? Entrar' : 'Não tens conta? Criar conta'}
                </button>

                {!isRegisterMode && (
                  <button 
                    onClick={() => {
                      setResetEmail(loginEmail);
                      setResetError('');
                      setResetSuccess('');
                      setShowResetModal(true);
                    }}
                    className="text-[10px] text-zinc-400 hover:text-zinc-300 font-bold underline cursor-pointer mt-0.5"
                  >
                    Esqueci-me da palavra-passe
                  </button>
                )}
              </div>


            </div>

            <p className="text-[9px] text-zinc-500 mt-5 max-w-[200px] leading-relaxed">
              Ao entrar concordas em partilhar a tua localização para ver os spots onde beber cerveja artesanal em Portugal.
            </p>
          </motion.div>
        ) : (
          <main className="flex-1 overflow-y-auto z-10 select-none pb-4">
          <AnimatePresence mode="wait">
            
            {/* VIEW A: EXPLORE LIST */}
            {activeTab === 'explore' && (
              <motion.div 
                key="explore-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 space-y-4"
              >
                {/* Search Inputs */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar spots..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border transition-all ${
                        darkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-amber-500/80 focus:bg-white/10' 
                          : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-450 focus:border-amber-500'
                      }`}
                      id="input-explore-search"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-3 text-neutral-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills row */}
                  <div className="flex space-x-1.5 overflow-x-auto pb-1 scrolls-none">
                    <button 
                      onClick={() => { setSelectedZone('All'); setSelectedStyle('All'); setShowOnlyFavorites(false); setProximitySort(false); }}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-xl shrink-0 transition-all ${
                        selectedZone === 'All' && selectedStyle === 'All' && !showOnlyFavorites && !proximitySort
                          ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/10' 
                          : (darkMode ? 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white' : 'bg-neutral-150 text-neutral-600')
                      }`}
                      id="filter-all"
                    >
                      Todos
                    </button>
                    <button 
                      onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-xl shrink-0 transition-all flex items-center space-x-1 ${
                        showOnlyFavorites 
                          ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/10' 
                          : (darkMode ? 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white' : 'bg-neutral-150 text-neutral-600')
                      }`}
                      id="filter-favs"
                    >
                      <Heart className={`w-3 h-3 ${showOnlyFavorites ? 'fill-current' : ''}`} />
                      <span>Favoritos</span>
                    </button>
                    <button 
                      onClick={() => setProximitySort(!proximitySort)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-xl shrink-0 transition-all flex items-center space-x-1 ${
                        proximitySort 
                          ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/10' 
                          : (darkMode ? 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white' : 'bg-neutral-150 text-neutral-600')
                      }`}
                      id="filter-proximity"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Proximidade</span>
                    </button>
                  </div>

                  {/* Region Dropdown Filter */}
                  <div className="relative pt-1">
                    <button
                      type="button"
                      onClick={() => setIsZoneDropdownOpen(!isZoneDropdownOpen)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        selectedZone !== 'All'
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
                          : (darkMode ? 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-xs')
                      }`}
                      id="zone-dropdown-trigger"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <MapPin className={`w-3.5 h-3.5 shrink-0 ${selectedZone !== 'All' ? 'text-amber-500' : 'text-neutral-500'}`} />
                        <span className="truncate">
                          {selectedZone === 'All' ? 'Localizar por zona' : selectedZone}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                          selectedZone !== 'All'
                            ? 'bg-amber-500/20 text-amber-500'
                            : (darkMode ? 'bg-white/10 text-neutral-400' : 'bg-neutral-100 text-neutral-500')
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
                          className={`absolute left-0 right-0 mt-1.5 rounded-2xl border shadow-2xl z-50 overflow-hidden flex flex-col ${
                            darkMode 
                              ? 'bg-zinc-950 border-white/10 text-white shadow-black/80' 
                              : 'bg-white border-neutral-200 text-neutral-900 shadow-neutral-400/30'
                          }`}
                          id="zone-dropdown-list-container"
                        >
                          {/* Search input inside dropdown */}
                          <div className={`p-2 border-b ${darkMode ? 'border-white/5 bg-white/2' : 'border-neutral-100 bg-neutral-50'}`}>
                            <div className="relative">
                              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                              <input
                                type="text"
                                placeholder="Pesquisar zona..."
                                value={zoneSearchQuery}
                                onChange={(e) => setZoneSearchQuery(e.target.value)}
                                className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border focus:outline-none transition-all ${
                                  darkMode
                                    ? 'bg-black border-white/10 text-white placeholder-neutral-600 focus:border-amber-500/60'
                                    : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-450 focus:border-amber-500'
                                }`}
                                id="zone-dropdown-search"
                              />
                              {zoneSearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setZoneSearchQuery('')}
                                  className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-200"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Scrollable List of Zones */}
                          <div className="max-h-56 overflow-y-auto divide-y dark:divide-white/5 divide-neutral-100 py-1">
                            {/* 'All' option */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedZone('All');
                                setIsZoneDropdownOpen(false);
                                setZoneSearchQuery('');
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                selectedZone === 'All'
                                  ? 'bg-amber-500/10 text-amber-500 font-extrabold'
                                  : (darkMode ? 'hover:bg-white/5 text-neutral-300' : 'hover:bg-neutral-50 text-neutral-700')
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <MapPin className={`w-3.5 h-3.5 ${selectedZone === 'All' ? 'text-amber-500' : 'text-neutral-500'}`} />
                                <span>Localizar por zona</span>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                                selectedZone === 'All'
                                  ? 'bg-amber-500/20 text-amber-500'
                                  : (darkMode ? 'bg-white/10 text-neutral-400' : 'bg-neutral-100 text-neutral-500')
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
                                    setSelectedZone(zone);
                                    setIsZoneDropdownOpen(false);
                                    setZoneSearchQuery('');
                                  }}
                                  className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                    selectedZone === zone
                                      ? 'bg-amber-500/15 text-amber-500 font-extrabold'
                                      : (darkMode ? 'hover:bg-white/5 text-neutral-300' : 'hover:bg-neutral-50 text-neutral-700')
                                  }`}
                                  id={`zone-option-${zone.toLowerCase().replace(' ', '-')}`}
                                >
                                  <span>{zone}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                                    selectedZone === zone
                                      ? 'bg-amber-500/25 text-amber-500'
                                      : (darkMode ? 'bg-white/10 text-neutral-400' : 'bg-neutral-100 text-neutral-500')
                                  }`}>
                                    {zoneCounts[zone] || 0}
                                  </span>
                                </button>
                              ))}
                              
                            {/* No results state */}
                            {activeZones.filter(zone => zone.toLowerCase().includes(zoneSearchQuery.toLowerCase())).length === 0 && (
                              <div className={`p-4 text-center text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                Nenhuma zona encontrada
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>

                {/* GPS GEOFENCING INDICATOR WIDGET */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500">
                        <MapPin className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold font-display uppercase tracking-wider">Geofence 50m Hop Map</h4>
                        <p className={`text-[8.5px] ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Selo e Check-In só a &lt;50m do spot</p>
                      </div>
                    </div>
                    
                    <div className="flex bg-neutral-150/80 dark:bg-black/30 p-0.5 rounded-lg border dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsGpsWithin50m(true);
                          triggerSelfPush('GPS Simulado', 'Estás dentro do spot (15 metros de distância).', 'system');
                        }}
                        className={`px-2 py-0.5 text-[8px] font-bold rounded-md transition-all cursor-pointer ${
                          isGpsWithin50m 
                            ? 'bg-emerald-500 text-white shadow-xs font-black' 
                            : 'text-neutral-500 hover:text-neutral-400'
                        }`}
                      >
                        Perto (&lt;50m)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsGpsWithin50m(false);
                          triggerSelfPush('GPS Simulado', 'Sáiste do spot de cerveja (840 metros de distância).', 'system');
                        }}
                        className={`px-2 py-0.5 text-[8px] font-bold rounded-md transition-all cursor-pointer ${
                          !isGpsWithin50m 
                            ? 'bg-rose-500 text-white shadow-xs font-black' 
                            : 'text-neutral-500 hover:text-neutral-400'
                        }`}
                      >
                        Longe (&gt;50m)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtitle / Counters heading */}
                <div className="flex items-center justify-between text-xs font-sans pb-1">
                  <span className="text-zinc-500">A mostrar {displayBars.length} de {bars.length} spots</span>
                  {(selectedStyle !== 'All' || selectedZone !== 'All' || showOnlyFavorites) && (
                    <button 
                      onClick={() => { setSelectedZone('All'); setSelectedStyle('All'); setShowOnlyFavorites(false); }}
                      className="text-amber-500 font-semibold"
                      id="btn-reset-filters"
                    >
                      Reset filtros
                    </button>
                  )}
                </div>

                {/* BARS GRID LAYOUT ITEMS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayBars.map(bar => {
                    const isFaved = user.favorites.includes(bar.id);
                    return (
                      <motion.div 
                        key={bar.id}
                        layout
                        className={`rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${
                          darkMode ? 'bg-white/5 border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-black/30' : 'bg-white border-neutral-250 shadow-xs'
                        }`}
                      >
                        {/* Photo header */}
                        <div className="relative h-32 w-full cursor-pointer" onClick={() => setSelectedBar(bar)}>
                          <img 
                            src={bar.coverPhoto} 
                            alt={bar.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                          
                          {/* Favorite button float */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(bar.id); }}
                            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:text-amber-500 active:scale-95 transition-all duration-150"
                            id={`btn-fav-${bar.id}`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFaved ? 'fill-amber-500 text-amber-500' : 'text-white'}`} />
                          </button>

                          {/* Zone badge */}
                          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] font-bold text-amber-500 tracking-wider uppercase">
                            {bar.zone.replace('Portugal ', '')}
                          </div>

                          {/* Quick Rating badge bottom-right */}
                          <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] font-bold flex items-center space-x-1 text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                            <span>{bar.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Content description list */}
                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between cursor-pointer" onClick={() => setSelectedBar(bar)}>
                              <h3 className="font-bold text-sm tracking-tight font-display line-clamp-1 hover:text-amber-500 transition-colors">{bar.name}</h3>
                            </div>
                            <p className={`text-[10px] mt-1 line-clamp-2 leading-relaxed ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                              {bar.description}
                            </p>
                            
                            {/* TAPS indicator */}
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                                🍺 {bar.taps?.toLocaleString() || 0} TAPS
                              </span>
                              <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-md ${darkMode ? 'bg-white/5 text-neutral-300 border border-white/5' : 'bg-neutral-100 text-neutral-700 border border-neutral-200'}`}>
                                {getSpotTier(bar.taps || 0).title}
                              </span>
                            </div>
                          </div>

                          {/* Craft Beer Styles tag listing */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {bar.styles.map(style => (
                              <button 
                                key={style}
                                onClick={() => setSelectedStyle(style)}
                                className={`text-[8px] font-semibold px-2 py-0.5 rounded-md transition-all ${
                                  selectedStyle === style 
                                    ? 'bg-amber-500/25 text-amber-500 border border-amber-500/30' 
                                    : (darkMode ? 'bg-white/5 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10' : 'bg-neutral-100 text-neutral-600')
                                }`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>

                          {/* Distance & Info quick action row */}
                          <div className={`flex items-center justify-between border-t pt-2.5 mt-1 text-[10px] font-semibold ${darkMode ? 'border-white/5' : 'border-neutral-200'}`}>
                            <span className="text-neutral-500">🕒 {bar.workingHours.split(',')[0]} • 📍 {bar.distance.toFixed(1)} km</span>
                            <button 
                              onClick={() => { window.open(getBarGoogleMapsUrl(bar.id, bar.address), '_blank'); }}
                              className="w-6 h-6 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 flex items-center justify-center transition cursor-pointer"
                              id={`btn-viewmap-${bar.id}`}
                              title="Abrir no Google Maps"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {displayBars.length === 0 && (
                    <div className="text-center py-10 space-y-2">
                      <p className="text-zinc-500 text-xs">Nenhum spot de cerveja artesanal encontrado com estes filtros.</p>
                      <button 
                        onClick={() => { setSelectedZone('All'); setSelectedStyle('All'); setShowOnlyFavorites(false); }}
                        className="text-amber-500 font-bold text-xs"
                      >
                        Resetar Filtros
                      </button>
                    </div>
                  )}
                </div>


              </motion.div>
            )}

            {/* VIEW B: INTERACTIVE MAP & ROUTE PLANNER */}
            {activeTab === 'map' && (
              <motion.div 
                key="map-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full h-full overflow-hidden"
              >
                {/* Visual Maps Container taking full width */}
                <div className="w-full h-full">
                  <MapInteractive 
                    bars={bars} 
                    selectedBar={selectedBar} 
                    onSelectBar={(bar) => setSelectedBar(bar)} 
                    darkMode={darkMode} 
                    activeRoute={[]} 
                    userLocation={userLocation}
                    proximityMode={proximitySort}
                  />
                </div>
              </motion.div>
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
                  <h3 className={`font-extrabold text-sm tracking-tight uppercase flex items-center space-x-1.5 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>Festivais & Eventos Especiais</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Explora os festivais e eventos mais importantes de cerveja em Portugal</p>
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
                      <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-mono block">A tua geolocalização</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold font-display">{getCurrentCityName()}</span>
                        <span className="text-[8px] text-zinc-500 font-mono">({userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)})</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined' && navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setUserLocation({
                              latitude: position.coords.latitude,
                              longitude: position.coords.longitude
                            });
                            triggerSelfPush(
                              'GPS Sincronizado! 📡',
                              `Coordenadas atualizadas para ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}!`,
                              'system'
                            );
                          },
                          (error) => {
                            triggerSelfPush(
                              'Erro de GPS ❌',
                              `Não foi possível obter a tua localização: ${error.message}`,
                              'system'
                            );
                          },
                          { enableHighAccuracy: true, timeout: 5000 }
                        );
                      } else {
                        triggerSelfPush(
                          'GPS Indisponível ❌',
                          'O navegador não suporta geolocalização.',
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
                    <span>Sincronizar GPS</span>
                  </button>
                </div>

                {/* CoBeer Taste Information Banner */}
                <div className={`p-4 rounded-3xl border ${
                  darkMode ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/25 text-white' : 'bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/15 text-zinc-900'
                } flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm`}>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">INFORMAÇÃO ADICIONAL</span>
                  </div>
                  <div>
                    <a 
                      href="https://www.cobeertaste.com/eventos" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[9px] px-3.5 py-2 rounded-xl transition duration-150 shadow-md active:scale-95 font-display"
                      id="btn-cobeer-taste-link"
                    >
                      <span>Ir para site Cobeer Taste</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
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

                    return sortedEvents.map(ev => {
                      const isEnded = ev.endDate ? new Date(ev.endDate + 'T23:59:59') < new Date() : false;
                      return (
                        <div 
                          key={ev.id}
                          className={`rounded-3xl border overflow-hidden transition-all duration-300 ${
                            darkMode ? 'bg-white/5 border-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-black/20' : 'bg-white border-neutral-250 shadow-sm'
                          }`}
                        >
                          <div className="relative h-36 w-full">
                            {ev.coverPhoto ? (
                              <img 
                                src={ev.coverPhoto} 
                                alt={ev.title} 
                                referrerPolicy="no-referrer"
                                className={`w-full h-full object-cover transition-all duration-300 ${isEnded ? 'grayscale opacity-75 contrast-75 brightness-75' : ''}`} 
                              />
                            ) : (
                              <div className={`w-full h-full transition-all duration-300 ${darkMode ? 'bg-zinc-800' : 'bg-neutral-200'} flex items-center justify-center`} />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            <div className="absolute top-2.5 left-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-0.5 text-[8px] font-bold text-amber-500 tracking-wider">
                              {ev.category.toUpperCase()}
                            </div>
                            <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 backdrop-blur-md border px-2.5 py-0.5 text-[8px] font-bold tracking-wider">
                              {isEnded ? (
                                <span className="text-zinc-400">Terminado</span>
                              ) : ev.date === 'Sem data' ? (
                                <span className="text-purple-400">Indefinido</span>
                              ) : (
                                <span className="text-emerald-400">Ativo</span>
                              )}
                            </div>
                          </div>

                          <div className="p-4 space-y-2.5">
                            <h4 className={`font-bold text-sm font-display mt-0.5 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{ev.title}</h4>
                            <div className="flex items-center space-x-3 text-[9px] text-neutral-400 font-mono">
                              <span>📅 {ev.date}</span>
                              <span>📍 {ev.location || 'N/A'}</span>
                            </div>
                            <p className="text-[10px] text-neutral-400 leading-relaxed">{ev.description}</p>
                            
                            {/* Check-In Interaction Block */}
                            <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-4">
                              <div className="flex items-center space-x-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-[10px] font-bold text-amber-400 font-mono">+2 HOPS</span>
                              </div>
                              
                              {(() => {
                                const isCheckedIn = user.checkedInFestivals?.includes(ev.id);
                                const isIndefinido = ev.date === 'Sem data';
                                
                                if (isCheckedIn) {
                                  return (
                                    <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-mono">
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span>✓ Check-in Efetuado</span>
                                    </span>
                                  );
                                }
                                
                                if (isEnded) {
                                  return (
                                    <button
                                      disabled
                                      className="opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-500 font-bold text-[9px] px-3 py-1.5 rounded-xl border border-zinc-700/50"
                                    >
                                      Festival Terminado
                                    </button>
                                  );
                                }
                                
                                if (isIndefinido) {
                                  return (
                                    <button
                                      disabled
                                      className="opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-500 font-bold text-[9px] px-3 py-1.5 rounded-xl border border-zinc-700/50"
                                    >
                                      Check-in Indisponível (Sem data)
                                    </button>
                                  );
                                }
                                
                                // Active and not checked in. Let's show check-in button!
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
                                        <span className="text-amber-500 font-bold">No raio de 200m</span>
                                      ) : (
                                        <span>Estás a <strong className="text-zinc-400">{formatDistance(distanceInMeters)}</strong> de {ev.location}</span>
                                      )}
                                    </span>
                                    <button
                                      onClick={() => handleFestivalCheckin(ev.id)}
                                      className={`font-extrabold text-[9px] px-3.5 py-1.5 rounded-xl transition-all font-display shadow-md active:scale-95 ${
                                        isWithin200m 
                                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black border border-amber-400' 
                                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700'
                                      }`}
                                    >
                                      Efetuar Check-in
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
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
                <div className="bg-gradient-to-br from-neutral-800 to-black p-5 rounded-3xl border border-white/10 flex items-center justify-between text-white shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-y-[-10%] translate-x-[15%] w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                  {(() => {
                    const details = getLevelDetails(user.points);
                    let percent = 100;
                    if (details.nextMeta) {
                      const currentLevelThreshold = user.points >= 91 ? 91 : user.points >= 71 ? 71 : user.points >= 46 ? 46 : user.points >= 26 ? 26 : user.points >= 11 ? 11 : 0;
                      const range = details.nextMeta.count - currentLevelThreshold;
                      const progress = user.points - currentLevelThreshold;
                      percent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
                    }
                    return (
                      <>
                        <div className="space-y-1">
                          <h4 className="text-[10px] font-bold text-amber-500 tracking-widest uppercase font-display">PONTUAÇÃO</h4>
                          <span className="text-2xl font-extrabold block font-display tracking-tight text-white">{user.points} HOPS</span>
                          <span className={`text-[10px] flex items-center gap-1.5 pb-1 border-b border-white/10 font-mono ${details.isSecret ? 'animate-legendary font-black' : 'text-zinc-400'}`}>
                            <span className="text-sm select-none">{details.badge}</span>
                            {user.level}
                          </span>
                          <div className="flex items-center space-x-1.5 pt-1.5">
                            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-[9.5px] text-zinc-300 font-medium">
                              {details.nextMeta 
                                ? `Próximo ranking: ${details.nextMeta.count} HOPS (${details.nextMeta.title})` 
                                : `Nível Máximo Atingido! 🍻`}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-center shrink-0 pl-2">
                          <div className="w-13 h-13 rounded-full border-4 border-amber-500/80 flex items-center justify-center font-bold text-xs text-amber-400 bg-black/45 shadow-lg shadow-amber-500/10 font-display">
                            {percent}%
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* GPS LOCATION HARDWARE SIMULATOR WIDGET */}
                <div className={`p-4 rounded-3xl border transition-all ${
                  darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                        <MapPin className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold font-display uppercase tracking-wider">Simulador de Distância GPS</h4>
                        <p className={`text-[9px] ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Estás dentro do raio de 50 metros?</p>
                      </div>
                    </div>
                    
                    <div className="flex bg-neutral-200/50 dark:bg-black/40 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setIsGpsWithin50m(true);
                          const referenceBar = selectedBar || bars[0];
                          if (referenceBar) {
                            setUserLocation({
                              latitude: referenceBar.latitude + 0.0001,
                              longitude: referenceBar.longitude + 0.0001
                            });
                          }
                          triggerSelfPush('GPS Ativado', 'Caminhaste até ao bar. Estás a 15 metros de distância!', 'system');
                        }}
                        className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                          isGpsWithin50m 
                            ? 'bg-emerald-500 text-white shadow-sm font-extrabold' 
                            : 'text-neutral-500 hover:text-neutral-400'
                        }`}
                      >
                        Perto (&lt;50m)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsGpsWithin50m(false);
                          const referenceBar = selectedBar || bars[0];
                          if (referenceBar) {
                            setUserLocation({
                              latitude: referenceBar.latitude + 0.0076,
                              longitude: referenceBar.longitude + 0.0001
                            });
                          }
                          triggerSelfPush('GPS Ativado', 'Deslocaste-te para longe. Estás a 840 metros de distância!', 'system');
                        }}
                        className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                          !isGpsWithin50m 
                            ? 'bg-rose-500 text-white shadow-sm font-extrabold' 
                            : 'text-neutral-500 hover:text-neutral-400'
                        }`}
                      >
                        Longe (&gt;50m)
                      </button>
                    </div>
                  </div>
                  
                  {/* Subtle distance meter feedback slider */}
                  <div className="mt-2.5 pt-2.5 border-t border-neutral-200/40 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold">
                    <span className="text-neutral-500">Fidelidade Geofence:</span>
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isGpsWithin50m ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {isGpsWithin50m ? '15 metros (Check-In PERMITIDO)' : '840 metros (Check-In BLOQUEADO)'}
                    </span>
                  </div>
                </div>

                {/* Stamp card selection list */}
                <div className="space-y-3.5">
                  <div className="pl-1">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 font-display">Cartão de Selos Cobeer</h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Visite spots parceiros, faça check-ins verificados e troque por cerveja grátis!</p>
                    <p className="text-[9px] text-zinc-400 italic mt-1 leading-normal">
                      Nota: Para garantir a precisão de 50 metros, utiliza um telemóvel com o GPS ativo.
                    </p>
                  </div>
                  
                  {/* Search input for loyalty spots */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar spot pelo nome..."
                      value={loyaltySearchQuery}
                      onChange={e => setLoyaltySearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-2xl border transition-all ${
                        darkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-amber-500/80 focus:bg-white/10' 
                          : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-450 focus:border-amber-500'
                      }`}
                      id="input-loyalty-search"
                    />
                    {loyaltySearchQuery && (
                      <button 
                        type="button"
                        onClick={() => setLoyaltySearchQuery('')}
                        className="absolute right-3.5 top-3 text-neutral-500 hover:text-white"
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
                        const distA = getHaversineDistanceInMeters(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
                        const distB = getHaversineDistanceInMeters(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
                        return distA - distB;
                      });
                      
                      const displayList = showAllLoyaltySpots ? sortedBars : sortedBars.slice(0, 5);
                      
                      return (
                        <>
                          {displayList.map(bar => {
                            const userStamps = user.stamps[bar.id] || 0;
                            const distM = getHaversineDistanceInMeters(userLocation.latitude, userLocation.longitude, bar.latitude, bar.longitude);
                            const isNear = distM <= 50;
                            return (
                              <div 
                                key={bar.id}
                                className={`border rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 ${
                                  darkMode ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-neutral-200 hover:border-neutral-350 shadow-xs'
                                }`}
                              >
                                <div className={`flex justify-between items-center p-1 rounded-xl -m-1 mb-2 ${darkMode ? 'bg-white/2' : 'bg-neutral-50'}`}>
                                  <div className="pl-1 min-w-0 flex-1 mr-2">
                                    <h5 className={`text-[11px] font-extrabold leading-tight font-display truncate ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{bar.name}</h5>
                                    <span className={`text-[8px] font-mono font-bold uppercase tracking-wider block mt-1 ${isNear ? 'text-emerald-500 animate-pulse' : 'text-neutral-500'}`}>
                                      {isNear ? `Estás no local (${Math.round(distM)}m)` : `Distância: ${Math.round(distM)}m`}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => initiateCheckin(bar)}
                                    className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[9px] px-3 py-1.5 rounded-xl transition shadow-md font-display shrink-0 cursor-pointer"
                                    id={`btn-checkin-${bar.id}`}
                                  >
                                    Check-In + Selo
                                  </button>
                                </div>

                                {/* Stamp Holes display (iOS native stamp visual) */}
                                <div className="flex flex-col gap-2.5 pt-3 border-t border-white/5 mt-2">
                                  <div className="flex flex-wrap gap-1.5">
                                    {[...Array(10)].map((_, i) => {
                                      const isFilled = i < userStamps || (animatingStampBarId === bar.id && newlyAddedStampIndex === i);
                                      const isAnimatingThis = animatingStampBarId === bar.id && newlyAddedStampIndex === i;
                                      return (
                                        <div 
                                          key={i} 
                                          className={`relative w-6.5 h-6.5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                            isFilled 
                                              ? 'bg-amber-500/25 border-amber-500/60 text-amber-400 scale-105 shadow-inner' 
                                              : 'bg-black/30 border-white/10 text-neutral-600'
                                          } ${isAnimatingThis ? 'shadow-[0_0_15px_rgba(245,158,11,0.6)] border-amber-400 z-10' : ''}`}
                                        >
                                          {isAnimatingThis ? (
                                            <motion.div
                                              initial={{ scale: 0.1, rotate: -45 }}
                                              animate={{ scale: [1.4, 1], rotate: 0 }}
                                              transition={{ type: 'spring', damping: 10, stiffness: 120 }}
                                              className="w-full h-full flex items-center justify-center text-amber-400"
                                            >
                                              <Beer className="w-3 h-3 fill-current animate-pulse" />
                                            </motion.div>
                                          ) : isFilled ? (
                                            <Beer className="w-3 h-3 fill-current animate-pulse" />
                                          ) : (
                                            <span className="text-[8px] font-bold font-mono">{i + 1}</span>
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
                                                    borderRadius: p.id % 2 === 0 ? '50%' : '20%', // Mix of beer froths and stars
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
                                  <div className="flex justify-between items-center text-[9px] font-bold font-mono text-neutral-400">
                                    <span>
                                      {10 - userStamps > 0 ? `${10 - userStamps} selos em falta para prémio` : 'Prémio pronto!'}
                                    </span>
                                    <span className="tracking-widest pr-0.5 animate-pulse">
                                      {animatingStampBarId === bar.id ? "A GRAVAR..." : `${userStamps}/10 SELOS`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {sortedBars.length === 0 && (
                            <div className="text-center py-6 text-xs text-neutral-500">
                              Nenhum spot encontrado para "{loyaltySearchQuery}"
                            </div>
                          )}

                          {sortedBars.length > 5 && (
                            <div className="pt-2 text-center">
                              <button
                                type="button"
                                onClick={() => setShowAllLoyaltySpots(!showAllLoyaltySpots)}
                                className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                                  darkMode
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-amber-500'
                                    : 'bg-white border-neutral-200 hover:bg-neutral-50 text-amber-500 shadow-xs'
                                }`}
                                id="btn-loyalty-toggle-all"
                              >
                                {showAllLoyaltySpots ? 'Ver menos' : 'Ver todos'}
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
                <div className="bg-white border border-zinc-200 p-4.5 rounded-3xl flex items-center space-x-3 text-zinc-900 transition-all shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-3xl shrink-0 select-none">
                    {getLevelDetails(user.points).badge}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-extrabold truncate font-display text-black">{user.username}</h4>
                      <span className="px-2 py-0.2 rounded-full text-[8px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/25 uppercase tracking-widest font-mono">PRO</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">{user.email}</p>
                    {(() => {
                      const details = getLevelDetails(user.points);
                      return (
                        <div className="flex flex-col gap-1 mt-1.5 text-[10px] font-bold text-amber-600">
                          <div className="flex items-center space-x-1">
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            <span className={`font-mono flex items-center gap-1.5 ${details.isSecret ? 'animate-legendary font-black' : 'text-amber-600'}`}>
                              <span className="text-sm select-none">{details.badge}</span>
                              {details.title} ({user.points} HOPS)
                            </span>
                          </div>
                          <p className="text-[9px] text-zinc-500 font-medium normal-case font-sans italic">
                            "{details.concept}"
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Log-off Button right next to profile details */}
                  <button
                    onClick={async () => {
                      try {
                        await signOut(auth);
                        triggerSelfPush('Sessão Terminada 🍻', 'Fizeste log-off com sucesso do teu roteiro Hop Map.', 'system');
                      } catch (err: any) {
                        console.error('Error signing out:', err);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-zinc-100 border border-zinc-200 hover:bg-red-50 hover:border-red-200 text-zinc-600 hover:text-red-600 transition cursor-pointer flex items-center justify-center shrink-0"
                    title="Terminar Sessão (Log-off)"
                    id="btn-log-off"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* FRIENDS SEARCH & FRIENDS LIST SECTION */}
                <div className={`p-4 rounded-3xl border transition-all ${
                  darkMode ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
                } space-y-4`}>
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest font-display text-black dark:text-white">Os meus Amigos</h4>
                        <p className="text-[9px] text-zinc-400 font-sans">Encontra e adiciona outros amantes de cerveja</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      {(user.friends || []).length} AMIGOS
                    </span>
                  </div>

                  {/* Pending Friend Requests Panel */}
                  {pendingRequests.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 space-y-2 animate-pulse">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest font-display">
                        <Users className="w-3.5 h-3.5" />
                        <span>Pedidos de Amizade Recebidos ({pendingRequests.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {pendingRequests.map(req => (
                          <div key={req.id} className="flex items-center justify-between bg-black/10 dark:bg-black/20 p-2 rounded-xl border border-amber-500/10">
                            <div className="text-left">
                              <span className="text-[9px] font-black text-zinc-800 dark:text-zinc-100">{req.senderName}</span>
                              <span className="text-[8px] font-mono text-zinc-500 block">({req.senderPoints} HOPS)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleAcceptRequest(req.id, req.senderId, req.senderName)}
                                className="px-2.5 py-1 text-[8px] font-black font-display bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition active:scale-95 cursor-pointer"
                              >
                                Aceitar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeclineRequest(req.id)}
                                className="px-2 py-1 text-[8px] font-bold font-sans bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg transition active:scale-95 cursor-pointer"
                              >
                                Recusar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 1. Search Friends (Username search) */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pesquisar Utilizadores</h5>
                    <form onSubmit={handleFriendSearch} className="flex gap-1.5">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                        <input
                          type="text"
                          value={friendSearchQuery}
                          onChange={(e) => setFriendSearchQuery(e.target.value)}
                          placeholder="Pesquisa por nome de utilizador..."
                          className={`w-full pl-8 pr-3 py-2 text-[10px] rounded-xl outline-none border transition-all ${
                            darkMode 
                              ? 'bg-zinc-950 border-zinc-800 text-white focus:border-amber-500/40' 
                              : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-amber-500'
                          }`}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isFriendSearching}
                        className="px-3.5 py-2 text-[10px] font-extrabold font-display bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center min-w-[70px]"
                      >
                        {isFriendSearching ? (
                          <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          'Pesquisar'
                        )}
                      </button>
                    </form>

                    {/* Friend Search Results */}
                    {friendSearchResults.length > 0 && (
                      <div className="mt-2.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl p-2 border border-zinc-200/50 dark:border-zinc-900 space-y-1.5 max-h-[160px] overflow-y-auto">
                        {friendSearchResults.map(res => {
                          const isAlreadyFriend = (user.friends || []).includes(res.id);
                          const isSentPending = sentPendingRequests.includes(res.id);
                          return (
                            <div key={res.id} className="flex items-center justify-between p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 rounded-lg transition">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm select-none">{getLevelDetails(res.points).badge}</span>
                                <div className="text-left">
                                  <div className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">{res.username}</div>
                                  <div className="text-[8px] text-zinc-400 font-mono font-medium">{res.points} HOPS</div>
                                </div>
                              </div>
                              {isAlreadyFriend ? (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFriend(res.id, res.username)}
                                  className="px-2 py-1 text-[8px] font-extrabold text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition cursor-pointer flex items-center gap-1"
                                >
                                  <X className="w-2.5 h-2.5" />
                                  <span>Remover</span>
                                </button>
                              ) : isSentPending ? (
                                <span className="px-2 py-1 text-[8px] font-extrabold text-zinc-500 bg-zinc-500/10 border border-zinc-500/20 rounded-lg select-none flex items-center gap-1">
                                  <span>Pendente ⏳</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAddFriend(res.id, res.username)}
                                  className="px-2 py-1 text-[8px] font-extrabold text-amber-600 bg-amber-500/10 border border-amber-500/25 rounded-lg hover:bg-amber-500/20 transition cursor-pointer flex items-center gap-1"
                                >
                                  <User className="w-2.5 h-2.5" />
                                  <span>Adicionar</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {friendSearchMessage && (
                      <p className="text-[9px] text-zinc-400 pl-1">{friendSearchMessage}</p>
                    )}
                  </div>

                  {/* 2. My Friends List */}
                  <div className="space-y-2 pt-1">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Lista de Amigos</h5>
                    {isFriendsDetailsLoading ? (
                      <div className="text-center py-4">
                        <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
                        <p className="text-[9px] text-zinc-400 mt-1">A carregar amigos...</p>
                      </div>
                    ) : friendsDetails.length === 0 ? (
                      <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-dashed border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl text-center">
                        <p className="text-zinc-400 text-[10px] leading-relaxed">Não tens amigos adicionados.</p>
                        <p className="text-zinc-500 text-[8px] mt-0.5">Pesquisa por nome acima para criar a tua comunidade cervejeira!</p>
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
                                  className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-900/60"
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg select-none">{details.badge}</span>
                                    <div className="text-left">
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-black text-zinc-800 dark:text-zinc-100">{friend.username}</span>
                                        <span className="text-[8px] font-mono text-amber-500">({friend.points} HOPS)</span>
                                      </div>
                                      <div className="text-[8px] text-zinc-400 font-sans italic">"{details.title}"</div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFriend(friend.id, friend.username)}
                                    className="flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-black text-red-500 hover:text-white hover:bg-red-500/20 rounded-lg border border-red-500/20 hover:border-red-500 transition active:scale-95 cursor-pointer"
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
                              className={`text-[9px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                darkMode
                                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-amber-500'
                                  : 'bg-white border-neutral-200 hover:bg-neutral-50 text-amber-500 shadow-xs'
                              }`}
                              id="btn-toggle-all-friends"
                            >
                              {showAllFriends ? 'Ver menos' : 'Ver todos'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                </div>

                {/* Past Reviews History Section */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 pl-1 mb-2.5 font-display flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    O meu histórico de avaliações
                  </h4>
                  <div className="space-y-2">
                    {ratingsHistory.length === 0 ? (
                      <div className="bg-white/2 border border-dashed border-white/10 p-4 rounded-xl text-center">
                        <p className="text-neutral-500 text-[10px] leading-relaxed">Ainda não submeteste nenhuma avaliação. Avalia os teus spots favoritos!</p>
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const displayedReviews = showAllReviews ? ratingsHistory : ratingsHistory.slice(0, 5);
                          return displayedReviews.map(item => (
                            <div 
                              key={item.id} 
                              className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                                darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-amber-500 font-mono">
                                    {item.barName}
                                  </span>
                                  <div className="flex items-center text-amber-500 space-x-0.5 mt-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`w-3 h-3 ${i < item.stars ? 'fill-current text-amber-500' : 'text-neutral-600'}`} 
                                      />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-[8px] text-zinc-500 font-mono">
                                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-PT') : ''}
                                </span>
                              </div>
                              
                              <p className={`text-[10px] italic leading-relaxed mt-1.5 ${darkMode ? 'text-zinc-300' : 'text-zinc-650'}`}>
                                "{item.texto_rating}"
                              </p>
                              
                              {item.tipo_cerveja && (
                                <div className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider font-mono mt-1">
                                  Estilo: {item.tipo_cerveja}
                                </div>
                              )}
                            </div>
                          ));
                        })()}
                        {ratingsHistory.length > 5 && (
                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={() => setShowAllReviews(!showAllReviews)}
                              className={`text-[9px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                darkMode
                                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-amber-500'
                                  : 'bg-white border-neutral-200 hover:bg-neutral-50 text-amber-500 shadow-xs'
                              }`}
                              id="btn-toggle-all-reviews"
                            >
                              {showAllReviews ? 'Ver menos' : 'Ver mais'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Biometrics Settings */}
                <div className={`p-4 rounded-2xl space-y-3 border transition-all ${
                  darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[11px] font-bold flex items-center font-display">
                        <Fingerprint className="w-4 h-4 text-amber-500 mr-2" />
                        Autenticação Biométrica Native FaceID
                      </h5>
                      <p className={`text-[9px] mt-0.5 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Garante a segurança e impede compras de terceiros
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={user.biometricsEnabled} 
                        onChange={() => {
                          setUser(prev => ({ ...prev, biometricsEnabled: !prev.biometricsEnabled }));
                          triggerSelfPush('Parâmetros Alterados', 'Preferências de biometria atualizadas.', 'system');
                        }}
                        className="sr-only peer" 
                        id="checkbox-biometrics-toggle"
                      />
                      <div className={`w-9 h-5 rounded-full relative transition-all duration-200 ${
                        user.biometricsEnabled ? 'bg-amber-500' : 'bg-neutral-300'
                      } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                        user.biometricsEnabled ? 'after:translate-x-4' : ''
                      }`} />
                    </label>
                  </div>
                </div>

                {/* Real-time system notifications log */}
                <div>
                  <div className="flex items-center justify-between pl-1 mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Histórico de Notificações</h4>
                    {notifications.some(n => !n.isRead) && (
                      <button 
                        onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
                        className="text-[9px] font-press-start text-[#FFCA00] uppercase hover:underline cursor-pointer select-none"
                        id="btn-mark-all-read"
                      >
                        [Lidas]
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {notifications.slice(0, 5).map(notif => (
                      <div 
                        key={notif.id}
                        onClick={() => {
                          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                        }}
                        className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start space-x-2.5 ${
                          notif.isRead 
                            ? 'bg-white/2 border-white/5 text-neutral-400' 
                            : 'bg-white/5 border-white/10 text-white hover:border-white/25 hover:bg-white/8'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${notif.isRead ? 'bg-transparent' : 'bg-amber-500 animate-pulse'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold font-display">{notif.title}</p>
                          <p className="text-[9px] text-zinc-400 leading-relaxed mt-0.5">{notif.body}</p>
                          <span className="text-[8px] text-zinc-650 block mt-1 font-mono">{notif.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
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
              className={`absolute inset-0 z-[150] flex flex-col font-sans overflow-hidden ${
                darkMode ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-zinc-900'
              }`}
            >
              {/* Slide-over Header */}
              <div className={`px-4.5 py-3.5 flex items-center justify-between border-b shrink-0 ${
                darkMode ? 'bg-neutral-900/60 border-white/10 text-white' : 'bg-white/80 border-zinc-200 text-zinc-900'
              }`}>
                <button 
                  onClick={() => { setSelectedBar(null); setActiveTab('explore'); }}
                  className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-400 transition cursor-pointer"
                  id="btn-bar-detail-back"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Voltar</span>
                </button>
                <span className="text-xs font-extrabold tracking-wider uppercase font-sans">Detalhes do Bar</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <Beer className="w-4.5 h-4.5" />
                </div>
              </div>

              {/* Scrollable Content Container */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Cover Photo */}
                <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-4 shadow-inner">
                  <img 
                    src={selectedBar.coverPhoto} 
                    alt={selectedBar.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                  <button 
                    onClick={() => { setSelectedBar(null); setActiveTab('explore'); }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition shadow-md"
                    id="btn-bar-detail-close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded bg-black/70 backdrop-blur-md text-[8.5px] font-bold text-amber-500 tracking-widest uppercase">
                    {selectedBar.zone}
                  </div>
                </div>

              {/* Title & Actions */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`text-base font-bold font-display tracking-tight ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{selectedBar.name}</h3>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">{selectedBar.address}</p>
                </div>
                <div className="flex items-center space-x-1 font-extrabold text-amber-500 text-sm shrink-0 bg-amber-500/10 p-1.5 rounded-xl border border-amber-500/20 font-display">
                  <Star className="w-4 h-4 fill-current text-amber-500" />
                  <span>{selectedBar.rating}</span>
                </div>
              </div>

              {/* TAPS Classification Table */}
              {(() => {
                const currentTaps = selectedBar.taps || 0;
                const tier = getSpotTier(currentTaps);
                return (
                  <div className={`mt-3.5 p-3.5 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-neutral-50 border-neutral-250 shadow-xs'}`}>
                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">🍺</span>
                        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 font-display">Nível do Spot</h4>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/25">
                        {currentTaps.toLocaleString()} TAPS
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="text-[10px] border-b border-white/5 pb-3">
                        <span className="text-zinc-500 block text-[8px] font-bold uppercase tracking-wider font-display mb-1">Ranking</span>
                        <span className={`font-semibold flex items-center gap-1 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                          {tier.badge.split(' ')[0]} {tier.title}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-[10px]">
                        <div>
                          <span className="text-zinc-500 block text-[8px] font-bold uppercase tracking-wider font-display mb-0.5">Vibe Alcançada</span>
                          <p className={`leading-relaxed ${darkMode ? 'text-neutral-300' : 'text-neutral-750'}`}>{tier.concept}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[8px] font-bold uppercase tracking-wider font-display mb-0.5">Atmosfera Estimada</span>
                          <p className={`leading-relaxed ${darkMode ? 'text-neutral-300' : 'text-neutral-750'}`}>{tier.atmosphere}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mini table list */}
                    <div className="mt-3.5 pt-3 border-t border-white/5">
                      <span className="text-zinc-500 block text-[8px] font-bold uppercase tracking-wider mb-2 font-display">Tabela de Classificação Geral</span>
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
                              className={`flex items-center justify-between p-1 rounded transition-all ${
                                isCurrent 
                                  ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20 font-bold' 
                                  : 'text-neutral-500 border border-transparent opacity-65'
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

              {/* Main Info */}
              <p className={`text-[10.5px] leading-relaxed mt-3.5 pt-3.5 border-t border-white/5 ${darkMode ? 'text-neutral-400' : 'text-neutral-700'}`}>
                {selectedBar.description}
              </p>

              {/* Working Hours box */}
              <div className="mt-4 bg-white/5 p-3.5 rounded-xl border border-white/5 flex items-center justify-between text-[10px]">
                <div>
                  <span className="text-zinc-400 block font-bold uppercase tracking-widest text-[8px] font-display">Horários de Funcionamento</span>
                  <span className={`font-semibold mt-0.5 block ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{selectedBar.workingHours}</span>
                </div>
                <span className="text-[9px] text-green-500 font-bold uppercase tracking-wider font-mono">Aberto agora</span>
              </div>

              {/* Main characteristics Styles */}
              <div className="mt-3.5">
                <span className="text-zinc-400 block font-bold uppercase tracking-widest text-[8px] mb-1.5 font-display">Especialidades e Estilos</span>
                <div className="flex flex-wrap gap-1">
                  {selectedBar.styles.map(sty => (
                    <span 
                      key={sty} 
                      className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-500 font-mono"
                    >
                      {sty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Media Link actions */}
              <div className="mt-4.5 flex items-center space-x-3 text-[11px] font-bold font-display">
                {selectedBar.facebookUrl && (
                  <a 
                    href={selectedBar.facebookUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 border rounded-xl transition-all ${
                      darkMode 
                        ? 'border-white/10 bg-white/5 text-neutral-200 hover:border-amber-500/50 hover:text-amber-400' 
                        : 'border-zinc-300 bg-zinc-100 text-zinc-900 hover:border-zinc-400 hover:bg-zinc-200 hover:text-black'
                    }`}
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
                    className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 border rounded-xl transition-all ${
                      darkMode 
                        ? 'border-white/10 bg-white/5 text-neutral-200 hover:border-amber-500/50 hover:text-amber-400' 
                        : 'border-zinc-300 bg-zinc-100 text-zinc-900 hover:border-zinc-400 hover:bg-zinc-200 hover:text-black'
                    }`}
                    id={`btn-ig-${selectedBar.id}`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>
                )}
              </div>

              {/* Active checkin bar button */}
              <div className="mt-4.5 pt-4 border-t border-white/5 flex flex-col space-y-2">
                {(() => {
                  const drawerDistanceMeters = getHaversineDistanceInMeters(userLocation.latitude, userLocation.longitude, selectedBar.latitude, selectedBar.longitude);
                  return (
                    <button 
                      onClick={() => initiateCheckin(selectedBar)}
                      className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all duration-150 flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/10 active:scale-95 font-display cursor-pointer"
                      id={`btn-checkin-drawer-${selectedBar.id}`}
                    >
                      <Fingerprint className="w-4 h-4 text-black stroke-[2.5]" />
                      <span>Validar Check-In Seguro (${Math.round(drawerDistanceMeters)}m)</span>
                    </button>
                  );
                })()}

                <p className="text-[10px] text-zinc-400 text-center italic mt-1 leading-normal">
                  Nota: Para garantir a precisão de 50 metros, utiliza um telemóvel com o GPS ativo.
                </p>
              </div>

              {/* Reviews subsection */}
              <div className="mt-6 pt-5 border-t border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 font-display">Avaliações e Opiniões</h4>
                  {(() => {
                    const hasReviewed = user.isLoggedIn && (selectedBar.reviews || []).some(rev => rev.userId === user.id);
                    return (
                      <button 
                        onClick={() => {
                          if (hasReviewed) return;
                          setActiveBarToReview(selectedBar);
                        }}
                        disabled={hasReviewed}
                        className={`font-bold text-[10px] uppercase tracking-wider font-display transition ${
                          hasReviewed 
                            ? 'text-zinc-500 cursor-not-allowed' 
                            : 'text-amber-500 hover:underline cursor-pointer'
                        }`}
                        id="btn-add-review"
                      >
                        {hasReviewed ? 'SPOT JÁ AVALIADO' : 'AVALIAR SPOT'}
                      </button>
                    );
                  })()}
                </div>

                <div className="space-y-3">
                  {(selectedBar.reviews || []).map(rev => {
                    const isAuthor = user.isLoggedIn && rev.userId === user.id;
                    return (
                      <div 
                        key={rev.id} 
                        className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-[10px] space-y-1.5 transition hover:bg-white/8"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-black font-display flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center text-[10px] select-none border border-amber-500/20" title="HOPS Level Badge">
                              {getLevelDetails(isAuthor ? user.points : (rev.rating * 15)).badge}
                            </span>
                            <span>{rev.userName}</span>
                            {isAuthor && <span className="text-[7.5px] bg-amber-500/10 text-amber-600 px-1 py-0.2 rounded border border-amber-500/20 font-mono">TU</span>}
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
                                className="text-[8px] font-bold text-amber-500 hover:underline font-mono uppercase cursor-pointer"
                              >
                                Editar
                              </button>
                            )}
                            <div className="flex items-center text-amber-500 space-x-0.5">
                              <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                              <span className="font-bold font-mono text-[10px]">{rev.rating}</span>
                            </div>
                          </div>
                        </div>
                        <p className={`italic text-neutral-300 leading-relaxed font-sans`}>"{rev.comment}"</p>
                        {rev.beerStyleReviewed && (
                          <div className="pt-1 flex items-center justify-between text-[8px] text-neutral-500 font-bold uppercase tracking-wider font-mono">
                            <span>Bebeu: {rev.beerStyleReviewed}</span>
                            <span>{rev.date}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 max-w-[320px] w-full text-white font-sans text-xs space-y-3 shadow-2xl"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-white">Avaliar {activeBarToReview.name}</h3>
                  <button onClick={() => setActiveBarToReview(null)} className="text-zinc-500 hover:text-white" id="btn-review-close">✕</button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-zinc-400 block font-bold text-[9px] uppercase tracking-wider">Pontuação Geral (1 a 5 Estrelas)</span>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(st => (
                      <button 
                        key={st} 
                        onClick={() => setReviewRating(st)}
                        className={`p-1.5 rounded-lg border transition ${
                          reviewRating >= st 
                            ? 'bg-amber-500 text-zinc-950 border-amber-500' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                        }`}
                        id={`review-star-${st}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-zinc-400 block font-bold text-[9px] uppercase tracking-wider">Cerveja Que Beveste (Estilo / Marca)</span>
                  <input 
                    type="text" 
                    placeholder="Ex: West Coast IPA Letra"
                    value={reviewBeerStyle}
                    onChange={e => setReviewBeerStyle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-amber-500"
                    id="input-review-beerstyle"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 block font-bold text-[9px] uppercase tracking-wider">A tua opinião</span>
                    <span className="text-[8px] text-zinc-500 font-mono">{reviewComment.length}/100</span>
                  </div>
                  <textarea 
                    placeholder="Características da cerveja, atendimento ou ambiente..."
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value.slice(0, 100))}
                    maxLength={100}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs h-20 outline-none focus:border-amber-500 resize-none"
                    id="textarea-review-comment"
                  />
                </div>

                <button 
                  onClick={submitReview}
                  disabled={!reviewComment}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold transition disabled:opacity-40"
                  id="btn-review-submit"
                >
                  Submeter Avaliação
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
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 max-w-[320px] w-full text-white font-sans text-xs space-y-3 shadow-2xl"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-white">Editar Avaliação</h3>
                  <button onClick={() => setEditingReview(null)} className="text-zinc-500 hover:text-white" id="btn-edit-review-close">✕</button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-zinc-400 block font-bold text-[9px] uppercase tracking-wider">Pontuação Geral (1 a 5 Estrelas)</span>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(st => (
                      <button 
                        key={st} 
                        onClick={() => setEditRating(st)}
                        className={`p-1.5 rounded-lg border transition ${
                          editRating >= st 
                            ? 'bg-amber-500 text-zinc-950 border-amber-500' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                        }`}
                        id={`edit-review-star-${st}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-zinc-400 block font-bold text-[9px] uppercase tracking-wider">Cerveja Que Beveste (Estilo / Marca)</span>
                  <input 
                    type="text" 
                    placeholder="Ex: West Coast IPA Letra"
                    value={editBeerStyle}
                    onChange={e => setEditBeerStyle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-amber-500"
                    id="input-edit-review-beerstyle"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 block font-bold text-[9px] uppercase tracking-wider">A tua opinião</span>
                    <span className="text-[8px] text-zinc-500 font-mono">{editComment.length}/100</span>
                  </div>
                  <textarea 
                    placeholder="Características da cerveja, atendimento ou ambiente..."
                    value={editComment}
                    onChange={e => setEditComment(e.target.value.slice(0, 100))}
                    maxLength={100}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs h-20 outline-none focus:border-amber-500 resize-none"
                    id="textarea-edit-review-comment"
                  />
                </div>

                <button 
                  onClick={updateReview}
                  disabled={!editComment}
                  className="w-full h-10 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/25 disabled:text-zinc-500 text-zinc-950 font-extrabold rounded-xl transition cursor-pointer font-display"
                  id="btn-edit-review-submit"
                >
                  GRAVAR ALTERAÇÕES
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



        {/* --- BOTTOM INTERACTIVE TAB NAVIGATION (Signature Apple Theme) --- */}
        {user.isLoggedIn && (
          <nav className="h-16 border-t-4 border-black bg-[#121828] shrink-0 flex items-center justify-around px-4 z-40 relative select-none">

            {/* TAB 1: EXPLORE */}
            <button 
              onClick={() => { playPacmanSound(); setActiveTab('explore'); setSelectedBar(null); }}
              className="flex flex-col items-center justify-center space-y-1 z-10 transition-all duration-150 relative cursor-pointer h-full py-1.5 px-2 min-w-[55px]"
              id="tab-btn-explore"
            >
              <div className={`p-1 rounded-md transition-all ${activeTab === 'explore' ? 'scale-110' : 'opacity-65'}`}>
                <PixelIcon name="compass" size={20} overrideColor={activeTab === 'explore' ? "#FFCA00" : "#FFFFFF"} />
              </div>
              <span className={`text-[8px] font-press-start uppercase tracking-wider ${activeTab === 'explore' ? 'text-[#FFCA00]' : 'text-zinc-400'}`}>Explorar</span>
            </button>

            {/* TAB 2: MAP / ROUTING */}
            <button 
              onClick={() => { playPacmanSound(); setActiveTab('map'); setSelectedBar(null); }}
              className="flex flex-col items-center justify-center space-y-1 z-10 transition-all duration-150 relative cursor-pointer h-full py-1.5 px-2 min-w-[55px]"
              id="tab-btn-map"
            >
              <div className={`p-1 rounded-md transition-all ${activeTab === 'map' ? 'scale-110' : 'opacity-65'}`}>
                <PixelIcon name="map-pin" size={20} overrideColor={activeTab === 'map' ? "#FFCA00" : "#FFFFFF"} />
              </div>
              <span className={`text-[8px] font-press-start uppercase tracking-wider ${activeTab === 'map' ? 'text-[#FFCA00]' : 'text-zinc-400'}`}>Mapa</span>
            </button>

            {/* TAB 3: FESTIVALS & TICKETS */}
            <button 
              onClick={() => { playPacmanSound(); setActiveTab('events'); setSelectedBar(null); }}
              className="flex flex-col items-center justify-center space-y-1 z-10 transition-all duration-150 relative cursor-pointer h-full py-1.5 px-2 min-w-[55px]"
              id="tab-btn-events"
            >
              <div className={`p-1 rounded-md transition-all ${activeTab === 'events' ? 'scale-110' : 'opacity-65'}`}>
                <PixelIcon name="calendar" size={20} overrideColor={activeTab === 'events' ? "#FFCA00" : "#FFFFFF"} />
              </div>
              <span className={`text-[8px] font-press-start uppercase tracking-wider ${activeTab === 'events' ? 'text-[#FFCA00]' : 'text-zinc-400'}`}>Festivais</span>
            </button>

            {/* TAB 4: GAMIFICATION LOYALTY */}
            <button 
              onClick={() => { playPacmanSound(); setActiveTab('loyalty'); setSelectedBar(null); }}
              className="flex flex-col items-center justify-center space-y-1 z-10 transition-all duration-150 relative cursor-pointer h-full py-1.5 px-2 min-w-[55px]"
              id="tab-btn-loyalty"
            >
              <div className={`p-1 rounded-md transition-all ${activeTab === 'loyalty' ? 'scale-110' : 'opacity-65'}`}>
                <PixelIcon name="star" size={20} overrideColor={activeTab === 'loyalty' ? "#FFCA00" : "#FFFFFF"} />
              </div>
              <span className={`text-[8px] font-press-start uppercase tracking-wider ${activeTab === 'loyalty' ? 'text-[#FFCA00]' : 'text-zinc-400'}`}>Pontos</span>
            </button>

            {/* TAB 5: PROFILE SETTINGS */}
            <button 
              onClick={() => { playPacmanSound(); setActiveTab('profile'); setSelectedBar(null); }}
              className="flex flex-col items-center justify-center space-y-1 z-10 transition-all duration-150 relative cursor-pointer h-full py-1.5 px-2 min-w-[55px]"
              id="tab-btn-profile"
            >
              <div className={`p-1 rounded-md transition-all ${activeTab === 'profile' ? 'scale-110' : 'opacity-65'}`}>
                <PixelIcon name="user" size={20} overrideColor={activeTab === 'profile' ? "#FFCA00" : "#FFFFFF"} />
              </div>
              <span className={`text-[8px] font-press-start uppercase tracking-wider ${activeTab === 'profile' ? 'text-[#FFCA00]' : 'text-zinc-400'}`}>Perfil</span>
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF0000] rounded-xs shadow-[0_0_4px_#FF0000]" />
              )}
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
              className="absolute inset-0 z-[300] bg-black p-4 flex flex-col justify-between font-press-start text-white select-none"
            >
              {/* Retro double maze border */}
              <div className="flex-1 border-4 border-double border-blue-600 rounded-2xl p-4 flex flex-col justify-between overflow-y-auto relative bg-black">
                
                {/* Header */}
                <div className="text-center space-y-3 mt-1 shrink-0">
                  <div className="text-[8px] text-[#FF0000] tracking-widest animate-pulse">
                    * TABLE OF HIGH SCORES *
                  </div>
                  <h2 className="text-xs text-[#FFCA00] tracking-wider leading-relaxed">
                    HOP MAP | CRAFT BEER LOVERS
                  </h2>
                </div>

                {/* Scores header */}
                <div className="grid grid-cols-3 gap-1.5 my-3 bg-zinc-950 p-2 border border-blue-500/30 rounded-lg shrink-0 text-center items-center">
                  <div>
                    <div className="text-[6px] sm:text-[6.5px] text-zinc-400">YOUR HOPS</div>
                    <div className="text-[8px] sm:text-[9px] text-[#00FFFF] mt-1 font-bold animate-pulse truncate">
                      {user.points} PTS
                    </div>
                  </div>
                  <div className="border-x border-zinc-850 px-1">
                    <div className="text-[6px] sm:text-[6.5px] text-zinc-400">USER</div>
                    <div className="text-[8px] sm:text-[9px] text-[#FFCA00] mt-1 font-bold truncate">
                      {user.username.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[6px] sm:text-[6.5px] text-zinc-400">RANKING</div>
                    <div className="text-[8px] sm:text-[9px] text-[#FFB8FF] mt-1 truncate">
                      {user.level.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Modal Subtabs Selection */}
                <div className="flex gap-1 mt-2 shrink-0 border-b-2 border-blue-900 pb-2">
                  <button
                    onClick={() => setScoreSubTab('global')}
                    className={`flex-1 py-1.5 text-[5.5px] xs:text-[6px] sm:text-[7px] rounded-lg border font-press-start transition cursor-pointer text-center uppercase tracking-tighter ${
                      scoreSubTab === 'global'
                        ? 'bg-amber-500 text-black border-amber-400 font-bold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    Global
                  </button>
                  <button
                    onClick={() => setScoreSubTab('friends')}
                    className={`flex-1 py-1.5 text-[5.5px] xs:text-[6px] sm:text-[7px] rounded-lg border font-press-start transition cursor-pointer text-center uppercase tracking-tighter ${
                      scoreSubTab === 'friends'
                        ? 'bg-[#00FFFF] text-black border-[#00FFFF] font-bold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    Amigos
                  </button>
                  <button
                    onClick={() => setScoreSubTab('tiers')}
                    className={`flex-1 py-1.5 text-[5.5px] xs:text-[6px] sm:text-[7px] rounded-lg border font-press-start transition cursor-pointer text-center uppercase tracking-tighter ${
                      scoreSubTab === 'tiers'
                        ? 'bg-[#FFB8FF] text-black border-[#FFB8FF] font-bold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    Níveis
                  </button>
                  <button
                    onClick={() => setScoreSubTab('spots')}
                    className={`flex-1 py-1.5 text-[5.5px] xs:text-[6px] sm:text-[7px] rounded-lg border font-press-start transition cursor-pointer text-center uppercase tracking-tighter ${
                      scoreSubTab === 'spots'
                        ? 'bg-[#4EBD3A] text-black border-[#4EBD3A] font-bold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    Spots
                  </button>
                  <button
                    onClick={() => setScoreSubTab('spots_tiers')}
                    className={`flex-1 py-1.5 text-[5.5px] xs:text-[6px] sm:text-[7px] rounded-lg border font-press-start transition cursor-pointer text-center uppercase tracking-tighter ${
                      scoreSubTab === 'spots_tiers'
                        ? 'bg-[#FF943D] text-black border-[#FF943D] font-bold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    Níveis Spots
                  </button>
                </div>

                {/* Score Tiers / Leaderboard Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 my-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-850">
                  
                  {scoreSubTab === 'global' && (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-12 text-[6px] text-blue-500 pb-1 border-b border-blue-900 font-bold uppercase tracking-wider">
                        <div className="col-span-2 text-center">RANK</div>
                        <div className="col-span-1"></div>
                        <div className="col-span-6">PLAYER</div>
                        <div className="col-span-3 text-right">HOPS</div>
                      </div>

                      {isScoresLoading ? (
                        <div className="text-center py-8 text-[8px] text-zinc-500 font-mono">LOADING DATA...</div>
                      ) : (
                        globalScores.slice(0, 10).map((player, index) => {
                          const isCurrentUser = player.username.toLowerCase() === user.username.toLowerCase();
                          const isFriendOfUser = (user.friends || []).includes(player.id);
                          const isTop3 = index < 3;
                          const rankColors = ['#FF0000', '#FFCA00', '#00FFFF'];
                          const displayColor = isCurrentUser ? '#FFFFFF' : (isTop3 ? rankColors[index] : '#A1A1AA');

                          return (
                            <div 
                              key={player.id || player.username}
                              className={`grid grid-cols-12 text-[7.5px] items-center py-1.5 px-1 rounded-sm transition ${
                                isCurrentUser 
                                  ? 'bg-blue-950/40 text-white font-bold border border-blue-500/50 relative' 
                                  : 'text-zinc-400'
                              }`}
                              style={{ color: displayColor }}
                            >
                              {/* Rank position */}
                              <div className="col-span-2 text-center font-bold font-mono">
                                {index + 1}º
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
                              <div className="col-span-6 truncate font-semibold uppercase tracking-wider text-[6.5px] sm:text-[7.5px] flex items-center gap-1 text-left">
                                <span>{player.username}</span>
                                {isFriendOfUser && <span className="text-[5px] font-mono text-[#00FFFF] lowercase">[amigo]</span>}
                                {isCurrentUser && <span className="text-[5px] font-mono text-amber-500 lowercase">[tu]</span>}
                              </div>

                              {/* Points */}
                              <div className="col-span-3 text-right font-mono text-[7.5px] text-[#FFCA00] pr-1">
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
                      <div className="grid grid-cols-12 text-[6px] text-blue-500 pb-1 border-b border-blue-900 font-bold uppercase tracking-wider">
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
                            <div className="text-center py-8 px-2 space-y-2">
                              <p className="text-[7px] text-zinc-500 font-mono leading-relaxed">NO FRIENDS ON BOARD.</p>
                              <p className="text-[6px] text-zinc-600 leading-normal">ADD FRIENDS IN THE PROFILE VIEW TO COMPARE HOPS POINTS!</p>
                            </div>
                          );
                        }

                        return friendsAndUser.map((player, index) => {
                          const isCurrentUser = player.username.toLowerCase() === user.username.toLowerCase();
                          const displayColor = isCurrentUser ? '#FFFFFF' : '#00FFFF';

                          return (
                            <div 
                              key={player.id || player.username}
                              className={`grid grid-cols-12 text-[7.5px] items-center py-1.5 px-1 rounded-sm transition ${
                                isCurrentUser 
                                  ? 'bg-blue-950/40 text-white font-bold border border-blue-500/50 relative' 
                                  : 'text-zinc-400'
                              }`}
                              style={{ color: displayColor }}
                            >
                              <div className="col-span-2 text-center font-bold font-mono">
                                {index + 1}º
                              </div>

                              <div className="col-span-1 flex items-center justify-center">
                                {isCurrentUser && (
                                  <div className="scale-75 animate-bounce">
                                    <PixelPacman size={10} />
                                  </div>
                                )}
                              </div>

                              <div className="col-span-6 truncate font-semibold uppercase tracking-wider text-[6.5px] sm:text-[7.5px] flex items-center gap-1 text-left">
                                <span>{player.username}</span>
                                {isCurrentUser && <span className="text-[5px] font-mono text-amber-500 lowercase">[tu]</span>}
                              </div>

                              <div className="col-span-3 text-right font-mono text-[7.5px] text-[#FFCA00] pr-1">
                                {isCurrentUser ? user.points : player.points} PTS
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}

                  {scoreSubTab === 'tiers' && (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-12 text-[6px] text-blue-500 pb-1 border-b border-blue-900 font-bold uppercase tracking-wider">
                        <div className="col-span-1 text-center"></div>
                        <div className="col-span-2 text-center">BADGE</div>
                        <div className="col-span-4">RANK TITLE</div>
                        <div className="col-span-5 text-right">HOPS TARGET</div>
                      </div>

                      {[
                        { threshold: 101, range: '101+', title: 'Lord Barrels', badge: '🛢️', color: '#FF0000' },
                        { threshold: 91, range: '91-100', title: 'HOP Master', badge: '👑', color: '#00FFFF' },
                        { threshold: 71, range: '71-90', title: 'Cicerone', badge: '🎖️', color: '#FFB8FF' },
                        { threshold: 46, range: '46-70', title: 'Hop Head', badge: '🤯', color: '#FFB852' },
                        { threshold: 26, range: '26-45', title: 'Homebrewer', badge: '🧪', color: '#22C55E' },
                        { threshold: 11, range: '11-25', title: 'HOP Rookie', badge: '🌿', color: '#FFCA00' },
                        { threshold: 0, range: '0-10', title: 'HOP Novice', badge: '🌱', color: '#A1A1AA' }
                      ].map((tier, idx) => {
                        const isUserActiveTier = getUserTierIndex(user.points) === idx;
                        return (
                          <div 
                            key={idx} 
                            className={`grid grid-cols-12 text-[7.5px] items-center py-1 rounded-sm transition ${
                              isUserActiveTier 
                                ? 'bg-blue-950/40 text-white font-bold border border-blue-500/50 relative' 
                                : 'text-zinc-400'
                            }`}
                            style={{ color: isUserActiveTier ? '#FFFFFF' : tier.color }}
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

                            <div className="col-span-4 truncate font-semibold uppercase tracking-wider text-[6.5px] sm:text-[7.5px] text-left">
                              {tier.title}
                            </div>

                            <div className="col-span-5 text-right font-mono text-[7.5px] text-[#FFCA00] pr-1">
                              {tier.range} PTS
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {scoreSubTab === 'spots' && (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-12 text-[6px] text-blue-500 pb-1 border-b border-blue-900 font-bold uppercase tracking-wider">
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
                          const isTopThree = index < 3;
                          const rankColors = ['#FF0000', '#FFCA00', '#00FFFF'];
                          const displayColor = isTopThree ? rankColors[index] : '#A1A1AA';

                          return (
                            <div 
                              key={spot.id}
                              onClick={() => {
                                setSelectedBar(spot);
                                setShowScoreModal(false);
                                setActiveTab('explore');
                              }}
                              className="grid grid-cols-12 text-[7.5px] items-center py-1.5 px-1 rounded-sm transition cursor-pointer hover:bg-white/5"
                              style={{ color: displayColor }}
                            >
                              {/* Rank position */}
                              <div className="col-span-2 text-center font-bold font-mono">
                                {index + 1}º
                              </div>

                              {/* Small icon indicator */}
                              <div className="col-span-1 flex items-center justify-center text-[10px]">
                                {index === 0 ? '🏆' : '🍻'}
                              </div>

                              {/* Spot Name */}
                              <div className="col-span-6 truncate font-semibold uppercase tracking-wider text-[6.5px] sm:text-[7.5px] text-left">
                                {spot.name}
                              </div>

                              {/* Taps count */}
                              <div className="col-span-3 text-right font-mono text-[7.5px] text-[#FFCA00] pr-1 font-bold">
                                {spotTaps} TAPS
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}

                  {scoreSubTab === 'spots_tiers' && (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-12 text-[6px] text-blue-500 pb-1 border-b border-blue-900 font-bold uppercase tracking-wider">
                        <div className="col-span-1 text-center"></div>
                        <div className="col-span-2 text-center">BADGE</div>
                        <div className="col-span-5">SPOT TIER</div>
                        <div className="col-span-4 text-right">TAPS TARGET</div>
                      </div>

                      {[
                        { threshold: 15000, range: '15000+', title: 'The Craft Mecca', badge: '🌌', color: '#FF0000' },
                        { threshold: 5000, range: '5000-14999', title: 'Imperial Station', badge: '👑', color: '#00FFFF' },
                        { threshold: 1500, range: '1500-4999', title: 'Beer Temple', badge: '🏛️', color: '#FFB8FF' },
                        { threshold: 500, range: '500-1499', title: 'Craft Hub', badge: '📍', color: '#FFB852' },
                        { threshold: 100, range: '100-499', title: 'Cozy Taproom', badge: '🍻', color: '#22C55E' },
                        { threshold: 0, range: '0-99', title: 'Secret Speakeasy', badge: '🗝️', color: '#A1A1AA' }
                      ].map((tier, idx) => {
                        return (
                          <div 
                            key={idx} 
                            className="grid grid-cols-12 text-[7.5px] items-center py-1 rounded-sm transition"
                            style={{ color: tier.color }}
                          >
                            <div className="col-span-1"></div>

                            <div className="col-span-2 text-center text-xs select-none">
                              {tier.badge}
                            </div>

                            <div className="col-span-5 truncate font-semibold uppercase tracking-wider text-[6.5px] sm:text-[7.5px] text-left">
                              {tier.title}
                            </div>

                            <div className="col-span-4 text-right font-mono text-[7px] text-[#FFCA00] pr-1">
                              {tier.range} TAPS
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

                {/* PAC-MAN visual decor */}
                <div className="flex items-center justify-between py-1.5 border-t border-blue-900 shrink-0 text-[6px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                  <div className="flex items-center gap-1">
                    <PixelPacman size={10} />
                    <span className="text-[#FFCA00]">HOP-MAP MODE</span>
                  </div>
                  <div>1UP = CHECKIN</div>
                </div>

                {/* Close action */}
                <button 
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
                  className="w-full mt-3 py-2.5 bg-[#FFCA00] hover:bg-white text-black border-4 border-black rounded-xl font-bold tracking-wider hover:text-black transition-all active:scale-97 cursor-pointer text-[8px] flex items-center justify-center gap-2 shrink-0 select-none"
                  id="btn-close-score-modal"
                >
                  <span>[ ABANDONAR TABELA ]</span>
                </button>

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
                    Recuperar Password
                  </h3>
                  <button 
                    disabled={isResetLoading}
                    onClick={() => setShowResetModal(false)}
                    className="text-zinc-500 hover:text-zinc-400 font-bold text-xs p-1 rounded-lg hover:bg-white/5 transition"
                  >
                    ✕
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
                      Concluído
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[10px] text-zinc-400 leading-relaxed pl-1">
                      Introduz o teu e-mail e enviaremos um link para redefinires a tua palavra-passe.
                    </p>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 pl-1">E-Mail</label>
                      <input
                        type="email"
                        placeholder="email@exemplo.com"
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
                              setResetError('Por favor, introduz o teu e-mail.');
                              return;
                            }
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(trimmedEmail)) {
                              setResetError('Formato de e-mail inválido.');
                              return;
                            }
                            setIsResetLoading(true);
                            sendPasswordResetEmail(auth, trimmedEmail)
                              .then(() => {
                                setResetSuccess('E-mail de recuperação enviado! Verifica a tua caixa de correio (e a pasta de spam).');
                                triggerSelfPush(
                                  'Recuperação de Password',
                                  'Instruções enviadas para o teu e-mail.',
                                  'system'
                                );
                              })
                              .catch((err: any) => {
                                let errorMsg = 'Erro ao enviar e-mail de recuperação.';
                                if (err.code === 'auth/user-not-found') {
                                  errorMsg = 'Este e-mail não está associado a nenhuma conta.';
                                } else if (err.code === 'auth/invalid-email') {
                                  errorMsg = 'Formato de e-mail inválido.';
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
                        Cancelar
                      </button>

                      <button
                        type="button"
                        disabled={isResetLoading}
                        onClick={() => {
                          const trimmedEmail = resetEmail.trim();
                          if (!trimmedEmail) {
                            setResetError('Por favor, introduz o teu e-mail.');
                            return;
                          }
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          if (!emailRegex.test(trimmedEmail)) {
                            setResetError('Formato de e-mail inválido.');
                            return;
                          }
                          setIsResetLoading(true);
                          sendPasswordResetEmail(auth, trimmedEmail)
                            .then(() => {
                              setResetSuccess('E-mail de recuperação enviado! Verifica a tua caixa de correio (e a pasta de spam).');
                              triggerSelfPush(
                                'Recuperação de Password',
                                'Instruções enviadas para o teu e-mail.',
                                'system'
                              );
                            })
                            .catch((err: any) => {
                              let errorMsg = 'Erro ao enviar e-mail de recuperação.';
                              if (err.code === 'auth/user-not-found') {
                                errorMsg = 'Este e-mail não está associado a nenhuma conta.';
                              } else if (err.code === 'auth/invalid-email') {
                                errorMsg = 'Formato de e-mail inválido.';
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
                        {isResetLoading ? 'A enviar...' : 'Recuperar'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

    </AppleDeviceFrame>
  );
}
