import { Language } from './i18n';

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
