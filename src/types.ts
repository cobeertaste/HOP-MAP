/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum BarZone {
  ACORES = 'Açores',
  COIMBRA = 'Coimbra',
  AVEIRO = 'Aveiro',
  OBIDOS = 'Óbidos',
  ERICEIRA = 'Ericeira',
  COLARES = 'Colares',
  SINTRA = 'Sintra',
  CASCAIS = 'Cascais',
  LISBOA = 'Lisboa',
  MADEIRA = 'Madeira',
  CAMINHA = 'Caminha',
  VIANA_DO_CASTELO = 'Viana do Castelo',
  BRAGA = 'Braga',
  BRAGANCA = 'Bragança',
  VILA_VERDE = 'Vila Verde',
  MATOSINHOS = 'Matosinhos',
  PORTO = 'Porto',
  EVORA = 'Évora',
  CASTELO_DE_VIDE = 'Castelo de Vide',
  SETUBAL = 'Setúbal',
  LAGOS = 'Lagos',
  PORTIMAO = 'Portimão',
  FARO = 'Faro',
  TAVIRA = 'Tavira',
  FUZETA = 'Fuzeta',
  VILA_VICOSA = 'Vila Viçosa',
  LAGOA = 'Lagoa',
  FIGUEIRA_DE_CASTELO_RODRIGO = 'Figueira de Castelo Rodrigo',
  ARGANIL = 'Arganil',
  VILA_NOVA_DE_POIARES = 'Vila Nova de Poiares',
  MONSANTO = 'Monsanto',
  OLIVEIRA_DE_AZEMEIS = 'Oliveira de Azeméis',
  VN_GAIA = 'V.N. Gaia',
  FERMELA = 'Fermelã',
  PENAFIEL = 'Penafiel',
  SANTA_MARIA_DA_FEIRA = 'Santa Maria da Feira',
  PONTE_DE_LIMA = 'Ponte de Lima',
  GUIMARAES = 'Guimarães',
  SENHORA_DA_HORA = 'Senhora da Hora',
  AMARANTE = 'Amarante',
  LOURINHA = 'Lourinhã',
  JESUFREI = 'Jesufrei',
  CALDAS_DA_RAINHA = 'Caldas da Rainha'
}

export interface Review {
  id: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  beerStyleReviewed?: string;
  date: string;
}

export interface Bar {
  id: string;
  name: string;
  zone: BarZone;
  address: string;
  workingHours: string;
  workingHoursPT?: string;
  workingHoursEN?: string;
  styles: string[];
  description: string;
  descriptionPT?: string;
  descriptionEN?: string;
  rating: number;
  reviewsCount: number;
  reviews?: Review[];
  coverPhoto: string;
  facebookUrl?: string;
  instagramUrl?: string;
  hasApplePay?: boolean;
  latitude: number;
  longitude: number;
  taps?: number;
  totalCheckins?: number;
  checkinPin?: string;
  hasFood?: boolean;
  petFriendly?: boolean;
  hasTerrace?: boolean;
  hasParking?: boolean;
  hasBeerShop?: boolean;
  latestBeerRelease?: string;
  latestBeerReleasePT?: string;
  latestBeerReleaseEN?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string; // ISO string
  createdAt?: any;
  mentions?: string[]; // Array of mentioned usernames e.g. ['joao_craft']
}

export type SpotVibeKey = 'dead' | 'chill' | 'good' | 'great' | 'lit';

export interface SpotVibeOption {
  key: SpotVibeKey;
  id: number;
  emoji: string;
  titlePT: string;
  titleEN: string;
  descPT: string;
  descEN: string;
  colorClass: string;
  bgClass: string;
}

export interface SpotVibeVote {
  id: string;
  spotId: string;
  userId: string;
  username: string;
  vibe: SpotVibeKey;
  timestamp: string; // ISO string
  createdAt?: any;
}

export interface SpotVibeSummary {
  winningVibe: SpotVibeKey | null;
  totalVotes: number;
  votesCount: Record<SpotVibeKey, number>;
  userVotedVibe?: SpotVibeKey | null;
  userVotedAt?: string | null;
}

export interface BeerEvent {
  id: string;
  title: string;
  location: string;
  date: string;
  description: string;
  coverPhoto: string;
  price: number; // For Apple Pay purchase simulation
  organizer: string;
  category: 'festival' | 'tasting' | 'release' | 'workshop';
  endDate?: string;
}

export interface LoyaltyStampCard {
  id: string;
  barId: string;
  stampsCount: number;
  maxStamps: number; // typically 5 or 8
  rewardDescription: string;
}

export interface CheckinRecord {
  id?: string;
  userId: string;
  spotId: string;
  spotName?: string;
  dateString: string; // 'YYYY-MM-DD'
  timestamp?: any;
  beerStyle?: string;
}

export interface Badge {
  id: string;
  code: string;
  icon: string;
  namePt: string;
  nameEn: string;
  descriptionPt: string;
  descriptionEn: string;
  category: 'checkins' | 'spots' | 'regions' | 'styles' | 'time' | 'community' | 'special' | 'holidays';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  points: number;
  level: string; // e.g. "Hop Novice", "IPA Connoisseur", "Master Cicerone"
  stamps: Record<string, number>; // barId -> stamps count
  favorites: string[]; // barId[]
  friends?: string[]; // uids of friends
  purchasedEventTickets: string[]; // eventId[]
  biometricsEnabled: boolean;
  isLoggedIn: boolean;
  checkedInBars: string[]; // barId[]
  lastCheckinDates?: Record<string, string>; // barId -> 'YYYY-MM-DD'
  tenStampsDates?: Record<string, string>; // barId -> 'YYYY-MM-DD'
  checkinHistory?: Array<{ id: string; barId: string; barName: string; location: string; date: string; timestamp?: string; beerStyle?: string }>;
  checkedInFestivals?: string[]; // festivalId[]
  earnedBadges?: string[]; // badge ids
  donationsCount?: number;
  reviewsCount?: number;
  shareCheckinsEnabled?: boolean;
  notificationsEnabled?: boolean;
  user_language?: 'PT' | 'EN';
}

export interface HopNotification {
  id: string;
  title: string;
  titleEn?: string;
  body: string;
  bodyEn?: string;
  timestamp: string;
  timestampEn?: string;
  createdAt?: number;
  isRead: boolean;
  type: 'event' | 'reward' | 'loyalty' | 'system' | 'mention' | 'chat' | 'vibe';
  actionUrl?: string;
  senderName?: string;
}

export interface RouteStop {
  barId: string;
  order: number;
}

export interface CustomRoute {
  id: string;
  name: string;
  stops: RouteStop[];
  totalDistanceKm: number;
  totalDurationMin: number;
}

export type AnalyticsEventType =
  | 'spot_checkin'
  | 'spot_reward_granted'
  | 'spot_view'
  | 'spot_social_share'
  | 'spot_directions_click';

export interface AnalyticsEvent {
  id: string;
  eventType: AnalyticsEventType;
  spotId: string;
  spotName: string;
  userId: string;
  username: string;
  month: string; // 'YYYY-MM'
  timestamp: string; // ISO string
  metadata?: Record<string, any>;
}

export interface SpotMonthlyMetrics {
  spotId: string;
  spotName: string;
  checkins: number;
  rewards: number;
  views: number;
  shares: number;
  directions: number;
  consumedStyles?: Record<string, number>;
}

export interface TopUserMetrics {
  userId: string;
  username: string;
  checkinsCount: number;
  rewardsCount: number;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  donorEmail?: string;
  userId?: string;
  amount: number; // in EUR
  currency: string;
  paymentMethod: 'mbway' | 'apple_google_pay' | 'revolut' | 'stripe_card';
  timestamp: string; // ISO string
  month: string; // 'YYYY-MM'
  status: 'completed' | 'pending';
  referenceOrPhone?: string;
  notes?: string;
}

export interface MonthlyReport {
  id: string;
  month: string; // e.g. "2026-08"
  monthLabel: string; // e.g. "Agosto 2026"
  recipientEmail: string; // "cobeertaste@gmail.com"
  generatedAt: string;
  status: 'generated' | 'sent' | 'scheduled';
  sentAt?: string;
  scheduledDispatchDate?: string; // e.g. "1 de Outubro de 2026"
  isCompletedMonth?: boolean;
  totalCheckins: number;
  totalRewards: number;
  totalViews: number;
  totalShares: number;
  totalDirections: number;
  totalDonationsAmount: number;
  totalDonationsCount: number;
  donationsBreakdown: DonationRecord[];
  spotsBreakdown: SpotMonthlyMetrics[];
  topUsers: TopUserMetrics[];
  consumedStylesBreakdown?: Record<string, number>;
  topBeerStyles?: Array<{ style: string; count: number }>;
}
