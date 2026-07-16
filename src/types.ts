/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum BarZone {
  PORTO = 'Porto',
  LISBOA = 'Lisboa',
  MADEIRA = 'Madeira',
  ACORES = 'Açores',
  CENTRO = 'Centro',
  NORTE = 'Norte',
  SUL = 'Sul',
  OUTRO = 'Outro'
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
  styles: string[];
  description: string;
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
  checkedInFestivals?: string[]; // festivalId[]
}

export interface HopNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: 'event' | 'reward' | 'loyalty' | 'system';
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
