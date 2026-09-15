import { Bar, FriendSocialActivity } from '../types';
import { ALL_BADGES } from './badges';
import { getLevelDetails } from './levels';
import { Language } from './i18n';

// Format relative time helper for real timestamps
export function formatRelativeTime(timestampMs: number, lang: Language = 'PT'): string {
  if (!timestampMs || isNaN(timestampMs)) {
    return lang === 'PT' ? 'Recentemente' : 'Recently';
  }
  const now = Date.now();
  const diffMinutes = Math.max(1, Math.floor((now - timestampMs) / (1000 * 60)));

  if (diffMinutes < 60) {
    return lang === 'PT' ? `há ${diffMinutes} min` : `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return lang === 'PT' ? `há ${diffHours}h` : `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return lang === 'PT' 
    ? (diffDays === 1 ? 'ontem' : `há ${diffDays} dias`) 
    : (diffDays === 1 ? 'yesterday' : `${diffDays}d ago`);
}

/**
 * Returns strictly the real social actions of the user's friends.
 * No fictitious or simulated data is generated.
 */
export function getFriendsSocialActivities(
  friends: { id: string; username: string; points: number }[],
  bars: Bar[],
  lang: Language = 'PT',
  realtimeActivities: FriendSocialActivity[] = []
): FriendSocialActivity[] {
  if (!friends || friends.length === 0 || !realtimeActivities || realtimeActivities.length === 0) {
    return [];
  }

  const friendIds = new Set(friends.map(f => f.id));
  const friendUsernames = new Set(friends.map(f => f.username.toLowerCase()));

  // Filter activities to only those actually performed by the user's friends
  const filtered = realtimeActivities.filter(act => 
    friendIds.has(act.friendId) || 
    (act.friendUsername && friendUsernames.has(act.friendUsername.toLowerCase()))
  );

  // Deduplicate by activity ID
  const uniqueActivitiesMap = new Map<string, FriendSocialActivity>();
  filtered.forEach(act => {
    // Enrich with bar details if spotName or spotZone missing
    let enriched = { ...act };
    if (act.spotId && (!enriched.spotName || !enriched.spotZone)) {
      const matchBar = bars.find(b => b.id === act.spotId);
      if (matchBar) {
        if (!enriched.spotName) enriched.spotName = matchBar.name;
        if (!enriched.spotZone) enriched.spotZone = matchBar.zone;
      }
    }
    // Ensure accurate localized relative time
    if (act.timestamp) {
      enriched.relativeTimePt = formatRelativeTime(act.timestamp, 'PT');
      enriched.relativeTimeEn = formatRelativeTime(act.timestamp, 'EN');
    }
    uniqueActivitiesMap.set(act.id, enriched);
  });

  const activities = Array.from(uniqueActivitiesMap.values());

  // Sort strictly descending by timestamp (most recent first)
  activities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // Return strictly the last 10 real actions of the user's friends
  return activities.slice(0, 10);
}

/**
 * Returns strictly real friend profile details for FriendProfileModal
 * based on the friend's real badges and real visited spots from Firestore / state.
 */
export function getFriendProfileData(
  friend: { 
    id: string; 
    username: string; 
    points: number;
    earnedBadges?: string[];
    checkedInBars?: string[];
    checkinHistory?: any[];
  },
  bars: Bar[],
  lang: Language = 'PT'
) {
  const levelInfo = getLevelDetails(friend.points || 0, lang);

  // 1. REAL BADGES: Only badges that were actually earned by this user
  const realBadgeIds = Array.isArray(friend.earnedBadges) ? friend.earnedBadges : [];
  const unlockedBadges = realBadgeIds
    .map(badgeId => ALL_BADGES.find(b => b.id === badgeId))
    .filter((b): b is (typeof ALL_BADGES)[number] => Boolean(b));

  // 2. REAL VISITED SPOTS: Only spots where this friend actually checked in
  let visitedSpots: Array<{ spot: Bar; beerStyle?: string; dateStr: string }> = [];

  if (Array.isArray(friend.checkinHistory) && friend.checkinHistory.length > 0) {
    // Check-in history logs
    visitedSpots = friend.checkinHistory
      .map((hist: any) => {
        const spot = bars.find(b => b.id === hist.barId || (hist.barName && b.name.toLowerCase() === hist.barName.toLowerCase()));
        if (!spot) return null;
        const timeMs = hist.timestamp 
          ? (typeof hist.timestamp === 'number' ? hist.timestamp : new Date(hist.timestamp).getTime())
          : null;
        const dateStr = hist.date 
          ? hist.date 
          : (timeMs ? formatRelativeTime(timeMs, lang) : (lang === 'PT' ? 'Visitado' : 'Visited'));
        return {
          spot,
          beerStyle: hist.beerStyle || hist.style || 'Craft Beer',
          dateStr
        };
      })
      .filter((item): item is { spot: Bar; beerStyle: string; dateStr: string } => Boolean(item));
  } else if (Array.isArray(friend.checkedInBars) && friend.checkedInBars.length > 0) {
    // IDs of checked-in bars
    visitedSpots = friend.checkedInBars
      .map((barId: string) => {
        const spot = bars.find(b => b.id === barId);
        if (!spot) return null;
        return {
          spot,
          beerStyle: 'Craft Beer',
          dateStr: lang === 'PT' ? 'Visitado' : 'Visited'
        };
      })
      .filter((item): item is { spot: Bar; beerStyle: string; dateStr: string } => Boolean(item));
  }

  const totalCheckins = friend.checkinHistory?.length || friend.checkedInBars?.length || 0;

  return {
    levelInfo,
    unlockedBadges,
    visitedSpots,
    totalCheckins
  };
}
