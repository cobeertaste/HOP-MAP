import { Bar, FriendSocialActivity } from '../types';
import { ALL_BADGES } from './badges';
import { getLevelDetails } from './levels';
import { Language } from './i18n';

// Deterministic pseudo-random number generator for consistent friend activity
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Format relative time helper
export function formatRelativeTime(timestampMs: number, lang: Language = 'PT'): string {
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
  return lang === 'PT' ? (diffDays === 1 ? 'ontem' : `há ${diffDays} dias`) : (diffDays === 1 ? 'yesterday' : `${diffDays}d ago`);
}

const COMMON_BEER_STYLES = [
  'Imperial IPA',
  'New England IPA',
  'Sour Ale',
  'Russian Imperial Stout',
  'Pilsner Artesanal',
  'Belgian Dubbel',
  'Session IPA',
  'Gose Frutada',
  'American Pale Ale',
  'Doppelbock'
];

/**
 * Generates or compiles the last 10 social actions of the user's friends.
 * Combines real-time / stored activities with deterministic simulated history for connected friends.
 */
export function getFriendsSocialActivities(
  friends: { id: string; username: string; points: number }[],
  bars: Bar[],
  lang: Language = 'PT',
  realtimeActivities: FriendSocialActivity[] = []
): FriendSocialActivity[] {
  if (!friends || friends.length === 0) {
    return [];
  }

  const activities: FriendSocialActivity[] = [...realtimeActivities];
  const now = Date.now();

  // Create deterministic activities for each friend
  friends.forEach((friend, friendIdx) => {
    // Generate 2 to 4 actions per friend to ensure rich feed of 10+ items
    const actionsCount = 3;
    const friendSeedBase = friend.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + friendIdx * 47;

    for (let actIdx = 0; actIdx < actionsCount; actIdx++) {
      const seed = friendSeedBase + actIdx * 19;
      const randType = pseudoRandom(seed);
      // Time spread between 10 minutes and 42 hours ago
      const timeOffsetMinutes = Math.floor(10 + (randType * 2400) + (actIdx * 180) + (friendIdx * 80));
      const activityTime = now - (timeOffsetMinutes * 60 * 1000);

      // Select deterministic spot from bars
      const barIndex = Math.floor(pseudoRandom(seed + 3) * (bars.length || 1)) % (bars.length || 1);
      const spot = bars[barIndex] || {
        id: 'catraio',
        name: 'Catraio Craft Beer Shop',
        zone: 'Porto' as const,
      };

      const styleIndex = Math.floor(pseudoRandom(seed + 7) * COMMON_BEER_STYLES.length);
      const beerStyle = COMMON_BEER_STYLES[styleIndex];

      // Select deterministic badge from ALL_BADGES
      const badgeIndex = Math.floor(pseudoRandom(seed + 11) * ALL_BADGES.length);
      const badge = ALL_BADGES[badgeIndex] || ALL_BADGES[0];

      // 60% check-in, 30% badge earned, 10% high rating
      if (randType < 0.60) {
        activities.push({
          id: `act_${friend.id}_checkin_${actIdx}`,
          friendId: friend.id,
          friendUsername: friend.username,
          friendPoints: friend.points,
          type: 'checkin',
          spotId: spot.id,
          spotName: spot.name,
          spotZone: spot.zone || 'Portugal',
          beerStyle,
          timestamp: activityTime,
          relativeTimePt: formatRelativeTime(activityTime, 'PT'),
          relativeTimeEn: formatRelativeTime(activityTime, 'EN'),
        });
      } else if (randType < 0.90) {
        activities.push({
          id: `act_${friend.id}_badge_${actIdx}`,
          friendId: friend.id,
          friendUsername: friend.username,
          friendPoints: friend.points,
          type: 'badge',
          badgeId: badge.id,
          badgeName: lang === 'PT' ? badge.namePt : badge.nameEn,
          badgeIcon: badge.icon,
          badgeRarity: badge.rarity,
          timestamp: activityTime,
          relativeTimePt: formatRelativeTime(activityTime, 'PT'),
          relativeTimeEn: formatRelativeTime(activityTime, 'EN'),
        });
      } else {
        activities.push({
          id: `act_${friend.id}_rating_${actIdx}`,
          friendId: friend.id,
          friendUsername: friend.username,
          friendPoints: friend.points,
          type: 'rating',
          spotId: spot.id,
          spotName: spot.name,
          spotZone: spot.zone || 'Portugal',
          beerStyle,
          stars: 5,
          timestamp: activityTime,
          relativeTimePt: formatRelativeTime(activityTime, 'PT'),
          relativeTimeEn: formatRelativeTime(activityTime, 'EN'),
        });
      }
    }
  });

  // Sort descending by timestamp
  activities.sort((a, b) => b.timestamp - a.timestamp);

  // Return strictly the last 10 actions of the user's friends
  return activities.slice(0, 10);
}

/**
 * Returns friend profile details for the FriendProfileModal
 */
export function getFriendProfileData(
  friend: { id: string; username: string; points: number },
  bars: Bar[],
  lang: Language = 'PT'
) {
  const levelInfo = getLevelDetails(friend.points, lang);
  const friendSeedBase = friend.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Calculate 3-5 deterministic badges unlocked by this friend based on points
  const unlockedBadges = ALL_BADGES.filter((b, idx) => {
    if (idx === 0) return true; // FIRST HOP
    const badgeRand = pseudoRandom(friendSeedBase + idx * 7);
    if (friend.points >= 200) return badgeRand > 0.35;
    if (friend.points >= 100) return badgeRand > 0.55;
    if (friend.points >= 50) return badgeRand > 0.70;
    return badgeRand > 0.85;
  }).slice(0, 6);

  // Calculate 3 recent visited spots
  const visitedSpots = [0, 1, 2].map(i => {
    const spotIdx = Math.floor(pseudoRandom(friendSeedBase + i * 13) * (bars.length || 1)) % (bars.length || 1);
    const spot = bars[spotIdx];
    const style = COMMON_BEER_STYLES[Math.floor(pseudoRandom(friendSeedBase + i * 29) * COMMON_BEER_STYLES.length)];
    const daysAgo = i * 2 + 1;
    return {
      spot,
      beerStyle: style,
      dateStr: lang === 'PT' ? `há ${daysAgo} dias` : `${daysAgo}d ago`
    };
  }).filter(item => Boolean(item.spot));

  return {
    levelInfo,
    unlockedBadges,
    visitedSpots,
    totalCheckins: Math.max(3, Math.round(friend.points / 1.5))
  };
}
