import { UserProfile } from '../types';

export interface StreakMilestone {
  days: number;
  bonusHops: number;
  icon: string;
  titlePt: string;
  titleEn: string;
  badgeId: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 3,
    bonusHops: 2,
    icon: '⭐',
    titlePt: 'Estrela (3 Dias)',
    titleEn: 'Star (3 Days)',
    badgeId: 'streak_3_days'
  },
  {
    days: 5,
    bonusHops: 3,
    icon: '🌟',
    titlePt: 'Superestrela (5 Dias)',
    titleEn: 'Superstar (5 Days)',
    badgeId: 'streak_5_days'
  },
  {
    days: 7,
    bonusHops: 5,
    icon: '🏆',
    titlePt: 'Campeão (7 Dias)',
    titleEn: 'Champion (7 Days)',
    badgeId: 'streak_7_days'
  },
  {
    days: 14,
    bonusHops: 10,
    icon: '🔥',
    titlePt: 'Imparável (14 Dias)',
    titleEn: 'Unstoppable (14 Days)',
    badgeId: 'streak_14_days'
  },
  {
    days: 31,
    bonusHops: 20,
    icon: '💎',
    titlePt: 'Ícone (31 Dias)',
    titleEn: 'Icon (31 Days)',
    badgeId: 'streak_31_days'
  },
  {
    days: 50,
    bonusHops: 35,
    icon: '🏛️',
    titlePt: 'Hall da Fama (50 Dias)',
    titleEn: 'Hall of Fame (50 Days)',
    badgeId: 'streak_50_days'
  },
  {
    days: 100,
    bonusHops: 75,
    icon: '⚡',
    titlePt: 'Invencível (100 Dias)',
    titleEn: 'Invincible (100 Days)',
    badgeId: 'streak_100_days'
  },
  {
    days: 365,
    bonusHops: 250,
    icon: '👑',
    titlePt: 'Lenda (365 Dias)',
    titleEn: 'Legend (365 Days)',
    badgeId: 'streak_365_days'
  }
];

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate: string | null;
  checkedInToday: boolean;
  isStreakAtRisk: boolean; // Checked in yesterday, not yet today
  uniqueCheckinDates: string[]; // Sorted YYYY-MM-DD ascending
  nextMilestone: StreakMilestone | null;
  daysToNextMilestone: number;
  progressToNextPercent: number;
  achievedMilestones: StreakMilestone[];
}

export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function extractUniqueCheckinDates(
  user: Pick<UserProfile, 'checkinHistory' | 'lastCheckinDates' | 'tenStampsDates'>,
  extraDates: string[] = []
): string[] {
  const datesSet = new Set<string>();

  const addIfValid = (raw?: string) => {
    if (!raw || typeof raw !== 'string') return;
    const dStr = raw.substring(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
      datesSet.add(dStr);
    }
  };

  if (Array.isArray(user.checkinHistory)) {
    user.checkinHistory.forEach(item => {
      if (item.date) {
        addIfValid(item.date);
      } else if (item.timestamp) {
        try {
          const dt = new Date(item.timestamp);
          if (!isNaN(dt.getTime())) {
            const y = dt.getFullYear();
            const m = String(dt.getMonth() + 1).padStart(2, '0');
            const d = String(dt.getDate()).padStart(2, '0');
            datesSet.add(`${y}-${m}-${d}`);
          }
        } catch {
          // ignore invalid timestamp
        }
      }
    });
  }

  if (user.lastCheckinDates && typeof user.lastCheckinDates === 'object') {
    Object.values(user.lastCheckinDates).forEach(dStr => addIfValid(dStr));
  }

  if (user.tenStampsDates && typeof user.tenStampsDates === 'object') {
    Object.values(user.tenStampsDates).forEach(dStr => addIfValid(dStr));
  }

  extraDates.forEach(dStr => addIfValid(dStr));

  return Array.from(datesSet).sort();
}

export function calculateStreakStats(
  user: Pick<UserProfile, 'checkinHistory' | 'lastCheckinDates' | 'tenStampsDates' | 'currentStreak' | 'longestStreak' | 'awardedStreakMilestones'>,
  extraDates: string[] = [],
  referenceTodayStr?: string
): StreakStats {
  const todayStr = referenceTodayStr || getTodayDateStr();
  const uniqueCheckinDates = extractUniqueCheckinDates(user, extraDates);

  if (uniqueCheckinDates.length === 0) {
    const savedLongest = typeof user.longestStreak === 'number' ? user.longestStreak : 0;
    const firstMilestone = STREAK_MILESTONES[0];
    return {
      currentStreak: 0,
      longestStreak: savedLongest,
      lastCheckinDate: null,
      checkedInToday: false,
      isStreakAtRisk: false,
      uniqueCheckinDates: [],
      nextMilestone: firstMilestone,
      daysToNextMilestone: firstMilestone.days,
      progressToNextPercent: 0,
      achievedMilestones: STREAK_MILESTONES.filter(
        m => savedLongest >= m.days || (user.awardedStreakMilestones || []).includes(m.days)
      )
    };
  }

  const toUtcMs = (dStr: string): number => {
    const [y, m, d] = dStr.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };

  let longestRun = 0;
  let runningStreak = 0;
  let prevUtc: number | null = null;

  for (const dStr of uniqueCheckinDates) {
    const curUtc = toUtcMs(dStr);
    if (prevUtc === null) {
      runningStreak = 1;
    } else {
      const diffDays = Math.round((curUtc - prevUtc) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak += 1;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestRun) {
      longestRun = runningStreak;
    }
    prevUtc = curUtc;
  }

  const lastCheckinDate = uniqueCheckinDates[uniqueCheckinDates.length - 1];
  const todayUtc = toUtcMs(todayStr);
  const lastUtc = toUtcMs(lastCheckinDate);
  const diffFromToday = Math.round((todayUtc - lastUtc) / (1000 * 60 * 60 * 24));

  const checkedInToday = diffFromToday === 0;
  const isStreakAtRisk = diffFromToday === 1;

  // Active streak remains alive if the user checked in today (diff === 0) or yesterday (diff === 1).
  // If diffFromToday > 1, the streak has been broken and resets to 0 until their next check-in.
  const currentStreak = diffFromToday <= 1 ? runningStreak : 0;
  const longestStreak = Math.max(longestRun, typeof user.longestStreak === 'number' ? user.longestStreak : 0, currentStreak);

  // Next milestone relative to currentStreak
  const nextMilestone = STREAK_MILESTONES.find(m => m.days > currentStreak) || null;
  let daysToNextMilestone = 0;
  let progressToNextPercent = 100;

  if (nextMilestone) {
    const prevMilestoneDays = [...STREAK_MILESTONES]
      .reverse()
      .find(m => m.days <= currentStreak)?.days || 0;
    daysToNextMilestone = Math.max(0, nextMilestone.days - currentStreak);
    const span = Math.max(1, nextMilestone.days - prevMilestoneDays);
    const covered = Math.max(0, currentStreak - prevMilestoneDays);
    progressToNextPercent = Math.min(100, Math.round((covered / span) * 100));
  }

  const achievedMilestones = STREAK_MILESTONES.filter(
    m => longestStreak >= m.days || (user.awardedStreakMilestones || []).includes(m.days)
  );

  return {
    currentStreak,
    longestStreak,
    lastCheckinDate,
    checkedInToday,
    isStreakAtRisk,
    uniqueCheckinDates,
    nextMilestone,
    daysToNextMilestone,
    progressToNextPercent,
    achievedMilestones
  };
}

/**
 * Evaluates newly reached streak milestones on a check-in and returns any newly unlocked milestones
 * along with the total bonus HOPS to award.
 */
export function evaluateNewStreakMilestones(
  currentStreak: number,
  longestStreak: number,
  alreadyAwardedMilestones: number[] = []
): {
  newlyReachedMilestones: StreakMilestone[];
  totalBonusHops: number;
  updatedAwardedMilestones: number[];
} {
  const awardedSet = new Set<number>(alreadyAwardedMilestones);
  const newlyReachedMilestones: StreakMilestone[] = [];
  let totalBonusHops = 0;

  const effectiveMax = Math.max(currentStreak, longestStreak);

  for (const milestone of STREAK_MILESTONES) {
    if (effectiveMax >= milestone.days && !awardedSet.has(milestone.days)) {
      awardedSet.add(milestone.days);
      newlyReachedMilestones.push(milestone);
      totalBonusHops += milestone.bonusHops;
    }
  }

  return {
    newlyReachedMilestones,
    totalBonusHops,
    updatedAwardedMilestones: Array.from(awardedSet).sort((a, b) => a - b)
  };
}
