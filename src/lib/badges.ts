import { Badge, UserProfile, Bar, BarZone } from '../types';
import { Language } from './i18n';
import { getLevelDetails } from './levels';

export const ALL_BADGES: Badge[] = [
  // 1. Check-ins Volume & Loyalty
  {
    id: 'first_hop',
    code: 'FIRST_HOP',
    icon: '🍺',
    namePt: 'FIRST HOP',
    nameEn: 'FIRST HOP',
    descriptionPt: 'Primeiro check-in efetuado com sucesso no HOP-MAP.',
    descriptionEn: 'First check-in successfully completed on HOP-MAP.',
    category: 'checkins',
    rarity: 'common'
  },
  {
    id: 'hop_rookie',
    code: 'HOP_ROOKIE',
    icon: '🍻',
    namePt: 'HOP ROOKIE',
    nameEn: 'HOP ROOKIE',
    descriptionPt: '10 check-ins acumulados no mesmo spot.',
    descriptionEn: '10 check-ins accumulated at the same spot.',
    category: 'checkins',
    rarity: 'rare'
  },
  {
    id: 'hop_regular',
    code: 'HOP_REGULAR',
    icon: '🏆',
    namePt: 'HOP REGULAR',
    nameEn: 'HOP REGULAR',
    descriptionPt: '100 check-ins acumulados no mesmo spot. Um verdadeiro cliente da casa!',
    descriptionEn: '100 check-ins accumulated at the same spot. A true regular!',
    category: 'checkins',
    rarity: 'legendary'
  },
  {
    id: 'streak_3_days',
    code: 'STREAK_3_DAYS',
    icon: '⭐',
    namePt: 'Estrela',
    nameEn: 'Star',
    descriptionPt: '3 dias consecutivos de check-in efetuado.',
    descriptionEn: '3 consecutive days of check-ins completed.',
    category: 'checkins',
    rarity: 'common'
  },
  {
    id: 'streak_5_days',
    code: 'STREAK_5_DAYS',
    icon: '🌟',
    namePt: 'Superestrela',
    nameEn: 'Superstar',
    descriptionPt: '5 dias consecutivos de check-in efetuado.',
    descriptionEn: '5 consecutive days of check-ins completed.',
    category: 'checkins',
    rarity: 'rare'
  },
  {
    id: 'streak_7_days',
    code: 'STREAK_7_DAYS',
    icon: '🏆',
    namePt: 'Campeão',
    nameEn: 'Champion',
    descriptionPt: '7 dias consecutivos de check-in efetuado.',
    descriptionEn: '7 consecutive days of check-ins completed.',
    category: 'checkins',
    rarity: 'epic'
  },
  {
    id: 'streak_31_days',
    code: 'STREAK_31_DAYS',
    icon: '💎',
    namePt: 'Ícone',
    nameEn: 'Icon',
    descriptionPt: '31 dias consecutivos de check-in efetuado.',
    descriptionEn: '31 consecutive days of check-ins completed.',
    category: 'checkins',
    rarity: 'epic'
  },
  {
    id: 'streak_50_days',
    code: 'STREAK_50_DAYS',
    icon: '🏛️',
    namePt: 'Hall da Fama',
    nameEn: 'Hall of Fame',
    descriptionPt: '50 dias consecutivos de check-in efetuado.',
    descriptionEn: '50 consecutive days of check-ins completed.',
    category: 'checkins',
    rarity: 'legendary'
  },
  {
    id: 'streak_100_days',
    code: 'STREAK_100_DAYS',
    icon: '⚡',
    namePt: 'Invencível',
    nameEn: 'Invincible',
    descriptionPt: '100 dias consecutivos de check-in efetuado.',
    descriptionEn: '100 consecutive days of check-ins completed.',
    category: 'checkins',
    rarity: 'legendary'
  },
  {
    id: 'streak_365_days',
    code: 'STREAK_365_DAYS',
    icon: '👑',
    namePt: 'Lenda',
    nameEn: 'Legend',
    descriptionPt: '365 dias consecutivos de check-in efetuado.',
    descriptionEn: '365 consecutive days of check-ins completed.',
    category: 'checkins',
    rarity: 'legendary'
  },

  // 2. Spots Explorer & Discovery
  {
    id: 'hop_explorer',
    code: 'HOP_EXPLORER',
    icon: '🗺️',
    namePt: 'HOP EXPLORER',
    nameEn: 'HOP EXPLORER',
    descriptionPt: 'Check-in em 5 spots diferentes.',
    descriptionEn: 'Check-in at 5 different spots.',
    category: 'spots',
    rarity: 'common'
  },
  {
    id: 'hop_collector',
    code: 'HOP_COLLECTOR',
    icon: '🗺️',
    namePt: 'HOP COLLECTOR',
    nameEn: 'HOP COLLECTOR',
    descriptionPt: 'Check-in em 10 spots diferentes.',
    descriptionEn: 'Check-in at 10 different spots.',
    category: 'spots',
    rarity: 'rare'
  },
  {
    id: 'hop_hunter',
    code: 'HOP_HUNTER',
    icon: '🗺️',
    namePt: 'HOP HUNTER',
    nameEn: 'HOP HUNTER',
    descriptionPt: 'Check-in em 25 spots diferentes.',
    descriptionEn: 'Check-in at 25 different spots.',
    category: 'spots',
    rarity: 'epic'
  },
  {
    id: 'hop_master',
    code: 'HOP_MASTER',
    icon: '👑',
    namePt: 'HOP MASTER',
    nameEn: 'HOP MASTER',
    descriptionPt: 'Check-in em 50 spots diferentes.',
    descriptionEn: 'Check-in at 50 different spots.',
    category: 'spots',
    rarity: 'epic'
  },
  {
    id: 'hop_legend',
    code: 'HOP_LEGEND',
    icon: '🏆',
    namePt: 'HOP LEGEND',
    nameEn: 'HOP LEGEND',
    descriptionPt: 'Check-in em 100 spots diferentes por todo o país.',
    descriptionEn: 'Check-in at 100 different spots across the country.',
    category: 'spots',
    rarity: 'legendary'
  },

  // 3. Day Crawls & Regional Hoppers
  {
    id: 'five_in_a_day',
    code: 'FIVE_IN_A_DAY',
    icon: '🍺',
    namePt: '5 IN A DAY',
    nameEn: '5 IN A DAY',
    descriptionPt: '5 check-ins em spots diferentes no mesmo dia.',
    descriptionEn: '5 check-ins at different spots on the same day.',
    category: 'spots',
    rarity: 'rare'
  },
  {
    id: 'porto_hopper',
    code: 'PORTO_HOPPER',
    icon: '🌆',
    namePt: 'PORTO HOPPER',
    nameEn: 'PORTO HOPPER',
    descriptionPt: '5 spots diferentes no mesmo dia na região do Porto.',
    descriptionEn: '5 different spots in one day in the Porto region.',
    category: 'regions',
    rarity: 'epic'
  },
  {
    id: 'lisboa_hopper',
    code: 'LISBOA_HOPPER',
    icon: '🌆',
    namePt: 'LISBOA HOPPER',
    nameEn: 'LISBOA HOPPER',
    descriptionPt: '5 spots diferentes no mesmo dia na região de Lisboa.',
    descriptionEn: '5 different spots in one day in the Lisbon region.',
    category: 'regions',
    rarity: 'epic'
  },
  {
    id: 'azores_hopper',
    code: 'AZORES_HOPPER',
    icon: '🌊',
    namePt: 'AZORES HOPPER',
    nameEn: 'AZORES HOPPER',
    descriptionPt: '5 spots diferentes no mesmo dia nos Açores.',
    descriptionEn: '5 different spots in one day in the Azores.',
    category: 'regions',
    rarity: 'epic'
  },
  {
    id: 'madeira_hopper',
    code: 'MADEIRA_HOPPER',
    icon: '🏝️',
    namePt: 'MADEIRA HOPPER',
    nameEn: 'MADEIRA HOPPER',
    descriptionPt: '5 spots diferentes no mesmo dia na ilha da Madeira.',
    descriptionEn: '5 different spots in one day on Madeira Island.',
    category: 'regions',
    rarity: 'epic'
  },
  {
    id: 'porto_conqueror',
    code: 'PORTO_CONQUEROR',
    icon: '🏰',
    namePt: 'CONQUISTADOR DO PORTO',
    nameEn: 'PORTO CONQUEROR',
    descriptionPt: 'Fazer check-in em todos os spots da cidade do Porto.',
    descriptionEn: 'Check-in at all spots in the city of Porto.',
    category: 'regions',
    rarity: 'legendary'
  },
  {
    id: 'lisboa_conqueror',
    code: 'LISBOA_CONQUEROR',
    icon: '⛵',
    namePt: 'CONQUISTADOR DE LISBOA',
    nameEn: 'LISBON CONQUEROR',
    descriptionPt: 'Fazer check-in em todos os spots da cidade de Lisboa.',
    descriptionEn: 'Check-in at all spots in the city of Lisbon.',
    category: 'regions',
    rarity: 'legendary'
  },
  {
    id: 'azores_conqueror',
    code: 'AZORES_CONQUEROR',
    icon: '🌋',
    namePt: 'CONQUISTADOR DOS AÇORES',
    nameEn: 'AZORES CONQUEROR',
    descriptionPt: 'Fazer check-in em todos os spots dos Açores.',
    descriptionEn: 'Check-in at all spots in the Azores.',
    category: 'regions',
    rarity: 'legendary'
  },
  {
    id: 'madeira_conqueror',
    code: 'MADEIRA_CONQUEROR',
    icon: '🌺',
    namePt: 'CONQUISTADOR DA MADEIRA',
    nameEn: 'MADEIRA CONQUEROR',
    descriptionPt: 'Fazer check-in em todos os spots da Madeira.',
    descriptionEn: 'Check-in at all spots in Madeira.',
    category: 'regions',
    rarity: 'legendary'
  },

  // 4. Global Leaderboard Top Rank
  {
    id: 'hop_king',
    code: 'HOP_KING',
    icon: '👑',
    namePt: 'HOP KING',
    nameEn: 'HOP KING',
    descriptionPt: 'O utilizador com a pontuação mais alta no ranking Global (#1 do HOP-MAP).',
    descriptionEn: 'The top-ranked player on the HOP-MAP Global Leaderboard (#1).',
    category: 'special',
    rarity: 'legendary'
  },

  // 5. Beer Styles Lovers
  {
    id: 'ipa_lover',
    code: 'IPA_LOVER',
    icon: '🎯',
    namePt: 'IPA LOVER',
    nameEn: 'IPA LOVER',
    descriptionPt: '5 check-ins com estilo IPA registado ou em spots dedicados a IPAs.',
    descriptionEn: '5 check-ins with IPA style recorded or at IPA-focused spots.',
    category: 'styles',
    rarity: 'rare'
  },
  {
    id: 'sour_lover',
    code: 'SOUR_LOVER',
    icon: '🎯',
    namePt: 'SOUR LOVER',
    nameEn: 'SOUR LOVER',
    descriptionPt: '5 check-ins com estilo Sour/Wild registado ou em spots de cerveja ácida.',
    descriptionEn: '5 check-ins with Sour/Wild style recorded or at sour beer spots.',
    category: 'styles',
    rarity: 'rare'
  },
  {
    id: 'stout_lover',
    code: 'STOUT_LOVER',
    icon: '🎯',
    namePt: 'STOUT LOVER',
    nameEn: 'STOUT LOVER',
    descriptionPt: '5 check-ins com estilo Stout/Porter registado.',
    descriptionEn: '5 check-ins with Stout/Porter style recorded.',
    category: 'styles',
    rarity: 'rare'
  },
  {
    id: 'lager_lover',
    code: 'LAGER_LOVER',
    icon: '🎯',
    namePt: 'LAGER LOVER',
    nameEn: 'LAGER LOVER',
    descriptionPt: '5 check-ins com estilo Lager/Pilsner registado.',
    descriptionEn: '5 check-ins with Lager/Pilsner style recorded.',
    category: 'styles',
    rarity: 'rare'
  },
  {
    id: 'belgian_lover',
    code: 'BELGIAN_LOVER',
    icon: '🎯',
    namePt: 'BELGIAN LOVER',
    nameEn: 'BELGIAN LOVER',
    descriptionPt: '5 check-ins com estilo Belga (Tripel, Dubbel, Saison, Witbier).',
    descriptionEn: '5 check-ins with Belgian style (Tripel, Dubbel, Saison, Witbier).',
    category: 'styles',
    rarity: 'rare'
  },

  // 6. Time & Timing Hopper
  {
    id: 'night_hopper',
    code: 'NIGHT_HOPPER',
    icon: '🦉',
    namePt: 'NIGHT HOPPER',
    nameEn: 'NIGHT HOPPER',
    descriptionPt: 'Check-in realizado de madrugada / noite (depois da meia-noite, entre as 00:00 e as 06:00).',
    descriptionEn: 'Check-in completed late at night / early morning (00:00 - 06:00).',
    category: 'time',
    rarity: 'rare'
  },
  {
    id: 'sunset_hopper',
    code: 'SUNSET_HOPPER',
    icon: '☀️',
    namePt: 'SUNSET HOPPER',
    nameEn: 'SUNSET HOPPER',
    descriptionPt: 'Check-in realizado durante a hora dourada do pôr do sol (entre as 18:00 e as 20:00).',
    descriptionEn: 'Check-in completed during sunset golden hour (18:00 - 20:00).',
    category: 'time',
    rarity: 'rare'
  },
  {
    id: 'early_hopper',
    code: 'EARLY_HOPPER',
    icon: '🌅',
    namePt: 'EARLY HOPPER',
    nameEn: 'EARLY HOPPER',
    descriptionPt: 'Check-in matinal realizado antes das 12:00.',
    descriptionEn: 'Morning check-in completed before 12:00 noon.',
    category: 'time',
    rarity: 'rare'
  },
  {
    id: 'weekend_warrior',
    code: 'WEEKEND_WARRIOR',
    icon: '📅',
    namePt: 'WEEKEND WARRIOR',
    nameEn: 'WEEKEND WARRIOR',
    descriptionPt: 'Check-in realizado durante o fim de semana (Sexta, Sábado ou Domingo).',
    descriptionEn: 'Check-in completed over the weekend (Friday through Sunday).',
    category: 'time',
    rarity: 'common'
  },
  {
    id: 'midweek_hopper',
    code: 'MIDWEEK_HOPPER',
    icon: '📅',
    namePt: 'MIDWEEK HOPPER',
    nameEn: 'MIDWEEK HOPPER',
    descriptionPt: 'Check-in realizado a meio da semana (Quarta-feira).',
    descriptionEn: 'Check-in completed in the middle of the week (Wednesday).',
    category: 'time',
    rarity: 'common'
  },

  // 7. Community, Reviews, Festivals & Support
  {
    id: 'festival_hopper',
    code: 'FESTIVAL_HOPPER',
    icon: '🎪',
    namePt: 'FESTIVAL HOPPER',
    nameEn: 'FESTIVAL HOPPER',
    descriptionPt: 'Check-in realizado num Festival ou Evento especial cervejeiro.',
    descriptionEn: 'Check-in completed at a Beer Festival or special event.',
    category: 'community',
    rarity: 'rare'
  },
  {
    id: 'hop_critic',
    code: 'HOP_CRITIC',
    icon: '💬',
    namePt: 'HOP CRITIC',
    nameEn: 'HOP CRITIC',
    descriptionPt: '5 avaliações ou comentários partilhados sobre spots de cerveja.',
    descriptionEn: '5 reviews or ratings shared about craft beer spots.',
    category: 'community',
    rarity: 'rare'
  },
  {
    id: 'social_hopper',
    code: 'SOCIAL_HOPPER',
    icon: '👥',
    namePt: 'SOCIAL HOPPER',
    nameEn: 'SOCIAL HOPPER',
    descriptionPt: 'Ter pelo menos 5 amigos adicionados à tua rede HOP-MAP.',
    descriptionEn: 'Have at least 5 friends connected to your HOP-MAP profile.',
    category: 'community',
    rarity: 'rare'
  },
  {
    id: 'hop_supporter',
    code: 'HOP_SUPPORTER',
    icon: '💖',
    namePt: 'HOP SUPPORTER',
    nameEn: 'HOP SUPPORTER',
    descriptionPt: 'Apoiou o desenvolvimento independente do projeto HOP-MAP com uma doação.',
    descriptionEn: 'Supported the independent development of HOP-MAP with a donation.',
    category: 'special',
    rarity: 'epic'
  },

  // 8. Festive Days & Public Holidays (Dias Festivos e Efemérides)
  {
    id: 'holiday_new_year',
    code: 'HOLIDAY_NEW_YEAR',
    icon: '🎆',
    namePt: 'ANO NOVO',
    nameEn: 'NEW YEAR\'S DAY',
    descriptionPt: 'Check-in realizado no dia de Ano Novo (1 de Janeiro). Um brinde craft ao novo ano!',
    descriptionEn: 'Check-in completed on New Year\'s Day (January 1st). A craft toast to the new year!',
    category: 'holidays',
    rarity: 'epic'
  },
  {
    id: 'holiday_carnival',
    code: 'HOLIDAY_CARNIVAL',
    icon: '🎭',
    namePt: 'CARNAVAL HOPPER',
    nameEn: 'CARNIVAL HOPPER',
    descriptionPt: 'Check-in realizado durante a época e festejos de Carnaval.',
    descriptionEn: 'Check-in completed during Carnival season and festivities.',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_valentines',
    code: 'HOLIDAY_VALENTINES',
    icon: '❤️',
    namePt: 'LOVE & BEER',
    nameEn: 'LOVE & BEER',
    descriptionPt: 'Check-in realizado no Dia dos Namorados (14 de Fevereiro). Brindar ao amor com boa cerveja!',
    descriptionEn: 'Check-in completed on Valentine\'s Day (February 14th). Toasting to love with great craft beer!',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_st_patricks',
    code: 'HOLIDAY_ST_PATRICKS',
    icon: '☘️',
    namePt: 'ST. PATRICK\'S DAY',
    nameEn: 'ST. PATRICK\'S DAY',
    descriptionPt: 'Check-in realizado no Dia de São Patrício (17 de Março). Sláinte!',
    descriptionEn: 'Check-in completed on St. Patrick\'s Day (March 17th). Sláinte!',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_easter',
    code: 'HOLIDAY_EASTER',
    icon: '🐣',
    namePt: 'PÁSCOA CRAFT',
    nameEn: 'CRAFT EASTER',
    descriptionPt: 'Check-in realizado durante o período pascal (Sexta-feira Santa a Segunda de Páscoa).',
    descriptionEn: 'Check-in completed during Easter (Good Friday through Easter Monday).',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_freedom_day',
    code: 'HOLIDAY_FREEDOM_DAY',
    icon: '🌺',
    namePt: '25 DE ABRIL (LIBERDADE)',
    nameEn: 'FREEDOM DAY (25 DE ABRIL)',
    descriptionPt: 'Check-in realizado no Dia da Liberdade (25 de Abril). 25 de Abril sempre, com cerveja livre e artesanal!',
    descriptionEn: 'Check-in completed on Portugal\'s Freedom Day (April 25th). Celebrating liberty with independent craft beer!',
    category: 'holidays',
    rarity: 'epic'
  },
  {
    id: 'holiday_labour_day',
    code: 'HOLIDAY_LABOUR_DAY',
    icon: '🛠️',
    namePt: 'DIA DO TRABALHADOR',
    nameEn: 'LABOUR DAY',
    descriptionPt: 'Check-in realizado no Dia do Trabalhador (1 de Maio). O merecido descanso dos guerreiros da cerveja!',
    descriptionEn: 'Check-in completed on Labour Day (May 1st). A well-deserved craft break for hardworking hoppers!',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_portugal_day',
    code: 'HOLIDAY_PORTUGAL_DAY',
    icon: '🇵🇹',
    namePt: 'DIA DE PORTUGAL',
    nameEn: 'PORTUGAL DAY',
    descriptionPt: 'Check-in realizado no Dia de Portugal, de Camões e das Comunidades Portuguesas (10 de Junho).',
    descriptionEn: 'Check-in completed on Portugal Day (June 10th). Celebrating Portuguese heritage and brewing talent!',
    category: 'holidays',
    rarity: 'epic'
  },
  {
    id: 'holiday_santo_antonio',
    code: 'HOLIDAY_SANTO_ANTONIO',
    icon: '🐟',
    namePt: 'SANTO ANTÓNIO',
    nameEn: 'SANTO ANTÓNIO FEST',
    descriptionPt: 'Check-in realizado nas festas de Santo António / Santos Populares (12 ou 13 de Junho).',
    descriptionEn: 'Check-in completed during the Santo António street festivities (June 12th or 13th).',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_sao_joao',
    code: 'HOLIDAY_SAO_JOAO',
    icon: '🔨',
    namePt: 'SÃO JOÃO',
    nameEn: 'SÃO JOÃO FEST',
    descriptionPt: 'Check-in realizado na noite ou dia de São João (23 ou 24 de Junho).',
    descriptionEn: 'Check-in completed on the legendary São João night or festival day (June 23rd or 24th).',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_sao_pedro',
    code: 'HOLIDAY_SAO_PEDRO',
    icon: '🗝️',
    namePt: 'SÃO PEDRO',
    nameEn: 'SÃO PEDRO FEST',
    descriptionPt: 'Check-in realizado nas festas de São Pedro (28 ou 29 de Junho).',
    descriptionEn: 'Check-in completed during the São Pedro celebrations (June 28th or 29th).',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_ipa_day',
    code: 'HOLIDAY_IPA_DAY',
    icon: '🌿',
    namePt: 'INTERNATIONAL IPA DAY',
    nameEn: 'INTERNATIONAL IPA DAY',
    descriptionPt: 'Check-in realizado no Dia Internacional da IPA (primeira quinta-feira de Agosto). Para os verdadeiros amantes de lúpulo!',
    descriptionEn: 'Check-in completed on International IPA Day (first Thursday of August). Dedicated to true hopheads!',
    category: 'holidays',
    rarity: 'epic'
  },
  {
    id: 'holiday_beer_day',
    code: 'HOLIDAY_BEER_DAY',
    icon: '🍻',
    namePt: 'DIA INTERNACIONAL DA CERVEJA',
    nameEn: 'INTERNATIONAL BEER DAY',
    descriptionPt: 'Check-in realizado no Dia Internacional da Cerveja (primeira sexta-feira de Agosto). A maior celebração global do nosso néctar favorito!',
    descriptionEn: 'Check-in completed on International Beer Day (first Friday of August). The ultimate global tribute to great beer!',
    category: 'holidays',
    rarity: 'legendary'
  },
  {
    id: 'holiday_assuncao',
    code: 'HOLIDAY_ASSUNCAO',
    icon: '☀️',
    namePt: '15 DE AGOSTO (FERIADO DE VERÃO)',
    nameEn: 'AUGUST 15TH (SUMMER HOLIDAY)',
    descriptionPt: 'Check-in realizado no feriado nacional de Verão de 15 de Agosto.',
    descriptionEn: 'Check-in completed on the sunny August 15th public holiday.',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_oktoberfest',
    code: 'HOLIDAY_OKTOBERFEST',
    icon: '🥨',
    namePt: 'OKTOBERFEST CRAFT',
    nameEn: 'CRAFT OKTOBERFEST',
    descriptionPt: 'Check-in realizado durante a época tradicional da Oktoberfest (meados de Setembro a início de Outubro). Prost!',
    descriptionEn: 'Check-in completed during Oktoberfest season (mid-September to early October). Prost!',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_republic_day',
    code: 'HOLIDAY_REPUBLIC_DAY',
    icon: '🏛️',
    namePt: '5 DE OUTUBRO (REPÚBLICA)',
    nameEn: 'REPUBLIC DAY (5 DE OUTUBRO)',
    descriptionPt: 'Check-in realizado no feriado da Implantação da República (5 de Outubro).',
    descriptionEn: 'Check-in completed on Portugal\'s Republic Day (October 5th).',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_halloween',
    code: 'HOLIDAY_HALLOWEEN',
    icon: '🎃',
    namePt: 'HALLOWEEN HOPPER',
    nameEn: 'HALLOWEEN HOPPER',
    descriptionPt: 'Check-in realizado na noite mística de Halloween (31 de Outubro). Gostosuras, travessuras e cerveja artesanal!',
    descriptionEn: 'Check-in completed on Halloween (October 31st). Spooky sips and frightful crafts!',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_all_saints',
    code: 'HOLIDAY_ALL_SAINTS',
    icon: '🕯️',
    namePt: 'TODOS OS SANTOS',
    nameEn: 'ALL SAINTS\' DAY',
    descriptionPt: 'Check-in realizado no Dia de Todos os Santos (1 de Novembro).',
    descriptionEn: 'Check-in completed on All Saints\' Day (November 1st).',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_stout_day',
    code: 'HOLIDAY_STOUT_DAY',
    icon: '☕',
    namePt: 'INTERNATIONAL STOUT DAY',
    nameEn: 'INTERNATIONAL STOUT DAY',
    descriptionPt: 'Check-in realizado no Dia Internacional da Stout (primeira quinta-feira de Novembro). Uma ode aos maltes torrados!',
    descriptionEn: 'Check-in completed on International Stout Day (first Thursday of November). Dedicated to dark malts and roasty goodness!',
    category: 'holidays',
    rarity: 'epic'
  },
  {
    id: 'holiday_restoration_day',
    code: 'HOLIDAY_RESTORATION_DAY',
    icon: '🛡️',
    namePt: '1 DE DEZEMBRO (RESTAURAÇÃO)',
    nameEn: 'RESTORATION OF INDEPENDENCE',
    descriptionPt: 'Check-in realizado no Dia da Restauração da Independência (1 de Dezembro).',
    descriptionEn: 'Check-in completed on Portugal\'s Restoration of Independence Day (December 1st).',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_imaculada',
    code: 'HOLIDAY_IMACULADA',
    icon: '⭐',
    namePt: '8 DE DEZEMBRO',
    nameEn: 'DECEMBER 8TH HOLIDAY',
    descriptionPt: 'Check-in realizado no feriado da Imaculada Conceição (8 de Dezembro).',
    descriptionEn: 'Check-in completed on the December 8th public holiday.',
    category: 'holidays',
    rarity: 'rare'
  },
  {
    id: 'holiday_christmas',
    code: 'HOLIDAY_CHRISTMAS',
    icon: '🎄',
    namePt: 'NATAL CRAFT',
    nameEn: 'CRAFT CHRISTMAS',
    descriptionPt: 'Check-in realizado na Véspera ou no Dia de Natal (24 ou 25 de Dezembro). Boas Festas com o melhor copo na mão!',
    descriptionEn: 'Check-in completed on Christmas Eve or Christmas Day (December 24th or 25th). Happy Hoppy Holidays!',
    category: 'holidays',
    rarity: 'epic'
  },
  {
    id: 'holiday_new_years_eve',
    code: 'HOLIDAY_NEW_YEARS_EVE',
    icon: '🍾',
    namePt: 'RÉVEILLON HOPPER',
    nameEn: 'NEW YEAR\'S EVE HOPPER',
    descriptionPt: 'Check-in realizado na noite de Véspera de Ano Novo (31 de Dezembro). Despedida do ano em grande estilo!',
    descriptionEn: 'Check-in completed on New Year\'s Eve (December 31st). Bidding farewell to the year in craft style!',
    category: 'holidays',
    rarity: 'epic'
  }
];

export interface BadgeUnlockStatus {
  badge: Badge;
  unlocked: boolean;
  unlockedAt?: string;
  progressText?: string;
  progressPercent?: number;
}

export interface BadgeCalculationContext {
  user: UserProfile;
  bars: Bar[];
  userRank?: number; // 1 = #1 Global
  reviewsCount?: number;
  donationsCount?: number;
  lang?: Language;
}

// Anonymous Gregorian Easter Sunday calculation
function getEasterSundayForYear(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function parseCheckinDate(dateStr?: string, timestamp?: string): { month: number; day: number; dayOfWeek: number; year: number } | null {
  let d: Date | null = null;
  if (timestamp) {
    d = new Date(timestamp);
  } else if (dateStr) {
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const parts = dateStr.substring(0, 10).split('-');
      d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      d = new Date(dateStr);
    }
  }
  if (!d || isNaN(d.getTime())) return null;
  return {
    month: d.getMonth() + 1,
    day: d.getDate(),
    dayOfWeek: d.getDay(),
    year: d.getFullYear()
  };
}

function checkIsHolidayDate(
  info: { month: number; day: number; dayOfWeek: number; year: number },
  holidayId: string
): boolean {
  const { month, day, dayOfWeek, year } = info;

  switch (holidayId) {
    case 'holiday_new_year':
      // 1 de Janeiro (Ano Novo)
      return month === 1 && day === 1;

    case 'holiday_carnival': {
      // Carnaval (Terça-feira gorda e época de festividades)
      const validYear = year >= 2000 ? year : new Date().getFullYear();
      const easter = getEasterSundayForYear(validYear);
      const easterDate = new Date(validYear, easter.month - 1, easter.day);
      const carnivalTue = new Date(easterDate.getTime() - 47 * 24 * 60 * 60 * 1000);
      const carnivalStart = new Date(carnivalTue.getTime() - 4 * 24 * 60 * 60 * 1000);
      const carnivalEnd = new Date(carnivalTue.getTime() + 1 * 24 * 60 * 60 * 1000);
      const checkDate = new Date(validYear, month - 1, day);
      if (checkDate >= carnivalStart && checkDate <= carnivalEnd) return true;
      return month === 2 && day >= 10 && day <= 24;
    }

    case 'holiday_valentines':
      // 14 de Fevereiro (Dia dos Namorados)
      return month === 2 && day === 14;

    case 'holiday_st_patricks':
      // 17 de Março (St. Patrick's Day)
      return month === 3 && day === 17;

    case 'holiday_easter': {
      // Páscoa (Sexta-feira Santa a Segunda de Páscoa)
      const validYear = year >= 2000 ? year : new Date().getFullYear();
      const easter = getEasterSundayForYear(validYear);
      const easterDate = new Date(validYear, easter.month - 1, easter.day);
      const goodFriday = new Date(easterDate.getTime() - 2 * 24 * 60 * 60 * 1000);
      const easterMonday = new Date(easterDate.getTime() + 1 * 24 * 60 * 60 * 1000);
      const checkDate = new Date(validYear, month - 1, day);
      if (checkDate >= goodFriday && checkDate <= easterMonday) return true;
      return (month === 3 && day >= 27) || (month === 4 && day <= 15);
    }

    case 'holiday_freedom_day':
      // 25 de Abril (Dia da Liberdade)
      return month === 4 && day === 25;

    case 'holiday_labour_day':
      // 1 de Maio (Dia do Trabalhador)
      return month === 5 && day === 1;

    case 'holiday_portugal_day':
      // 10 de Junho (Dia de Portugal, de Camões e das Comunidades)
      return month === 6 && day === 10;

    case 'holiday_santo_antonio':
      // 12 e 13 de Junho (Santo António - Santos Populares)
      return month === 6 && (day === 12 || day === 13);

    case 'holiday_sao_joao':
      // 23 e 24 de Junho (São João - Santos Populares)
      return month === 6 && (day === 23 || day === 24);

    case 'holiday_sao_pedro':
      // 28 e 29 de Junho (São Pedro - Santos Populares)
      return month === 6 && (day === 28 || day === 29);

    case 'holiday_ipa_day':
      // 1ª Quinta-feira de Agosto (ou 1 a 7 de Agosto)
      return (month === 8 && dayOfWeek === 4 && day <= 7) || (month === 8 && day >= 1 && day <= 7);

    case 'holiday_beer_day':
      // 1ª Sexta-feira de Agosto (ou 1 a 8 de Agosto)
      return (month === 8 && dayOfWeek === 5 && day <= 7) || (month === 8 && day >= 1 && day <= 8);

    case 'holiday_assuncao':
      // 15 de Agosto (Assunção de Nossa Senhora)
      return month === 8 && day === 15;

    case 'holiday_oktoberfest':
      // 15 de Setembro a 7 de Outubro (Oktoberfest)
      return (month === 9 && day >= 15) || (month === 10 && day <= 7);

    case 'holiday_republic_day':
      // 5 de Outubro (Implantação da República)
      return month === 10 && day === 5;

    case 'holiday_halloween':
      // 31 de Outubro (Halloween / Noite das Bruxas)
      return month === 10 && day === 31;

    case 'holiday_all_saints':
      // 1 de Novembro (Dia de Todos os Santos)
      return month === 11 && day === 1;

    case 'holiday_stout_day':
      // 1ª Quinta-feira de Novembro (ou 1 a 7 de Novembro)
      return (month === 11 && dayOfWeek === 4 && day <= 7) || (month === 11 && day >= 1 && day <= 7);

    case 'holiday_restoration_day':
      // 1 de Dezembro (Restauração da Independência)
      return month === 12 && day === 1;

    case 'holiday_imaculada':
      // 8 de Dezembro (Imaculada Conceição)
      return month === 12 && day === 8;

    case 'holiday_christmas':
      // 24 e 25 de Dezembro (Véspera e Dia de Natal)
      return month === 12 && (day === 24 || day === 25);

    case 'holiday_new_years_eve':
      // 31 de Dezembro (Véspera de Ano Novo / Réveillon)
      return month === 12 && day === 31;

    default:
      return false;
  }
}

/**
 * Evaluates whether a user has unlocked a specific badge given current context.
 */
export function calculateUserBadges(ctx: BadgeCalculationContext): BadgeUnlockStatus[] {
  const { user, bars, userRank, reviewsCount = 0, donationsCount = 0 } = ctx;
  const history = user.checkinHistory || [];
  const stamps = user.stamps || {};
  const friends = user.friends || [];
  const festivals = user.checkedInFestivals || [];
  const checkedInBars = Array.from(new Set([
    ...(user.checkedInBars || []),
    ...history.map(h => h.barId),
    ...Object.keys(stamps).filter(k => (stamps[k] || 0) > 0)
  ]));

  const barsMap = new Map<string, Bar>();
  bars.forEach(b => barsMap.set(b.id, b));

  // Max stamps in any single spot
  const maxSingleSpotStamps = Math.max(
    0,
    ...Object.values(stamps),
    ...Object.values(
      history.reduce((acc, h) => {
        acc[h.barId] = (acc[h.barId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
  );

  // Group check-ins by Date 'YYYY-MM-DD'
  const checkinsByDate: Record<string, typeof history> = {};
  history.forEach(h => {
    const d = h.date ? h.date.substring(0, 10) : '2026-01-01';
    if (!checkinsByDate[d]) checkinsByDate[d] = [];
    checkinsByDate[d].push(h);
  });

  // Unique spots in any single day
  let maxUniqueSpotsInOneDay = 0;
  let maxPortoInOneDay = 0;
  let maxLisboaInOneDay = 0;
  let maxAzoresInOneDay = 0;
  let maxMadeiraInOneDay = 0;

  Object.values(checkinsByDate).forEach(dayList => {
    const uniqueSpotIds = Array.from(new Set(dayList.map(item => item.barId)));
    if (uniqueSpotIds.length > maxUniqueSpotsInOneDay) {
      maxUniqueSpotsInOneDay = uniqueSpotIds.length;
    }

    let portoCount = 0;
    let lisboaCount = 0;
    let azoresCount = 0;
    let madeiraCount = 0;

    uniqueSpotIds.forEach(barId => {
      const b = barsMap.get(barId);
      const locStr = `${b?.zone || ''} ${b?.address || ''} ${b?.name || ''}`.toLowerCase();
      if (locStr.includes('porto') || locStr.includes('gaia') || locStr.includes('matosinhos')) portoCount++;
      if (locStr.includes('lisboa') || locStr.includes('cascais') || locStr.includes('sintra') || locStr.includes('ericeira')) lisboaCount++;
      if (locStr.includes('açores') || locStr.includes('acores') || locStr.includes('ponta delgada') || locStr.includes('angra')) azoresCount++;
      if (locStr.includes('madeira') || locStr.includes('funchal')) madeiraCount++;
    });

    if (portoCount > maxPortoInOneDay) maxPortoInOneDay = portoCount;
    if (lisboaCount > maxLisboaInOneDay) maxLisboaInOneDay = lisboaCount;
    if (azoresCount > maxAzoresInOneDay) maxAzoresInOneDay = azoresCount;
    if (madeiraCount > maxMadeiraInOneDay) maxMadeiraInOneDay = madeiraCount;
  });

  // Beer styles count
  let ipaCount = 0;
  let sourCount = 0;
  let stoutCount = 0;
  let lagerCount = 0;
  let belgianCount = 0;

  history.forEach(h => {
    const style = (h.beerStyle || '').toLowerCase();
    const bar = barsMap.get(h.barId);
    const barVibes = (bar?.styles || []).map(s => s.toLowerCase()).join(' ');

    if (style.includes('ipa') || style.includes('neipa') || style.includes('dipa') || barVibes.includes('ipa')) ipaCount++;
    if (style.includes('sour') || style.includes('gose') || style.includes('lambic') || barVibes.includes('sour')) sourCount++;
    if (style.includes('stout') || style.includes('porter') || style.includes('imperial') || barVibes.includes('stout')) stoutCount++;
    if (style.includes('lager') || style.includes('pils') || style.includes('helles') || barVibes.includes('lager') || barVibes.includes('pilsner')) lagerCount++;
    if (style.includes('belgian') || style.includes('tripel') || style.includes('dubbel') || style.includes('saison') || style.includes('wit') || barVibes.includes('belgian')) belgianCount++;
  });

  // Time-based check-ins
  let nightCount = 0;
  let sunsetCount = 0;
  let earlyCount = 0;
  let weekendCount = 0;
  let midweekCount = 0;

  history.forEach(h => {
    let d: Date;
    if (h.timestamp) {
      d = new Date(h.timestamp);
    } else if (h.date) {
      d = new Date(h.date);
    } else {
      d = new Date();
    }

    if (!isNaN(d.getTime())) {
      const hours = d.getHours();
      const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 3 = Wednesday, 5 = Friday, 6 = Saturday

      if (hours >= 0 && hours < 6) nightCount++;
      if (hours >= 18 && hours < 21) sunsetCount++;
      if (hours < 12) earlyCount++;
      if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) weekendCount++;
      if (dayOfWeek === 3) midweekCount++;
    }
  });

  // Collect all checkin date records for holiday / festive badges
  const allParsedDates: Array<{ month: number; day: number; dayOfWeek: number; year: number }> = [];
  history.forEach(h => {
    const parsed = parseCheckinDate(h.date, h.timestamp);
    if (parsed) allParsedDates.push(parsed);
  });
  if (user.lastCheckinDates) {
    Object.values(user.lastCheckinDates).forEach(dStr => {
      const parsed = parseCheckinDate(dStr);
      if (parsed) allParsedDates.push(parsed);
    });
  }
  if (user.tenStampsDates) {
    Object.values(user.tenStampsDates).forEach(dStr => {
      const parsed = parseCheckinDate(dStr);
      if (parsed) allParsedDates.push(parsed);
    });
  }

  const isHolidayUnlocked = (holidayId: string) => {
    return allParsedDates.some(info => checkIsHolidayDate(info, holidayId));
  };

  const isPt = (ctx.lang || 'PT') === 'PT';

  const totalCheckinsCount = history.length > 0 ? history.length : Object.values(stamps).reduce((a, b) => a + b, 0);

  // Regional spots for city/region completion badges
  const isPortoBar = (b: Bar) => b.zone === BarZone.PORTO || (b.name && b.name.toLowerCase().includes('(porto)'));
  const isLisboaBar = (b: Bar) => b.zone === BarZone.LISBOA || (b.name && b.name.toLowerCase().includes('(lisboa)'));
  const isAcoresBar = (b: Bar) => b.zone === BarZone.ACORES || (b.name && (b.name.toLowerCase().includes('(açores)') || b.name.toLowerCase().includes('(acores)')));
  const isMadeiraBar = (b: Bar) => b.zone === BarZone.MADEIRA || (b.name && b.name.toLowerCase().includes('(madeira)'));

  const portoBarsList = bars.filter(isPortoBar);
  const lisboaBarsList = bars.filter(isLisboaBar);
  const acoresBarsList = bars.filter(isAcoresBar);
  const madeiraBarsList = bars.filter(isMadeiraBar);

  const checkedInPortoCount = portoBarsList.filter(b => checkedInBars.includes(b.id)).length;
  const checkedInLisboaCount = lisboaBarsList.filter(b => checkedInBars.includes(b.id)).length;
  const checkedInAcoresCount = acoresBarsList.filter(b => checkedInBars.includes(b.id)).length;
  const checkedInMadeiraCount = madeiraBarsList.filter(b => checkedInBars.includes(b.id)).length;

  // Consecutive days check-in streak calculation
  const checkinDatesSet = new Set<string>();
  history.forEach(h => {
    if (h.date) {
      const d = h.date.substring(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) checkinDatesSet.add(d);
    } else if (h.timestamp) {
      const d = new Date(h.timestamp).toISOString().substring(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) checkinDatesSet.add(d);
    }
  });
  if (user.lastCheckinDates) {
    Object.values(user.lastCheckinDates).forEach(dStr => {
      if (dStr && /^\d{4}-\d{2}-\d{2}$/.test(dStr.substring(0, 10))) {
        checkinDatesSet.add(dStr.substring(0, 10));
      }
    });
  }
  const sortedStreakDates = Array.from(checkinDatesSet).sort();
  let maxConsecutiveStreak = 0;
  let currentStreak = 0;
  let prevDateTimestamp: number | null = null;

  for (const dStr of sortedStreakDates) {
    const [y, m, d] = dStr.split('-').map(Number);
    const dateUtc = Date.UTC(y, m - 1, d);
    if (prevDateTimestamp === null) {
      currentStreak = 1;
    } else {
      const diffDays = Math.round((dateUtc - prevDateTimestamp) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
    if (currentStreak > maxConsecutiveStreak) {
      maxConsecutiveStreak = currentStreak;
    }
    prevDateTimestamp = dateUtc;
  }

  return ALL_BADGES.map(badge => {
    let unlocked = false;
    let progressText = '';
    let progressPercent = 0;

    switch (badge.id) {
      case 'first_hop':
        unlocked = totalCheckinsCount >= 1;
        progressPercent = unlocked ? 100 : 0;
        progressText = `${Math.min(1, totalCheckinsCount)}/1`;
        break;

      case 'hop_rookie':
        unlocked = maxSingleSpotStamps >= 10;
        progressPercent = Math.min(100, Math.round((maxSingleSpotStamps / 10) * 100));
        progressText = `${Math.min(10, maxSingleSpotStamps)}/10`;
        break;

      case 'hop_regular':
        unlocked = maxSingleSpotStamps >= 100;
        progressPercent = Math.min(100, Math.round((maxSingleSpotStamps / 100) * 100));
        progressText = `${Math.min(100, maxSingleSpotStamps)}/100`;
        break;

      case 'streak_3_days':
        unlocked = maxConsecutiveStreak >= 3;
        progressPercent = Math.min(100, Math.round((maxConsecutiveStreak / 3) * 100));
        progressText = `${Math.min(3, maxConsecutiveStreak)}/3 ${isPt ? 'dias' : 'days'}`;
        break;

      case 'streak_5_days':
        unlocked = maxConsecutiveStreak >= 5;
        progressPercent = Math.min(100, Math.round((maxConsecutiveStreak / 5) * 100));
        progressText = `${Math.min(5, maxConsecutiveStreak)}/5 ${isPt ? 'dias' : 'days'}`;
        break;

      case 'streak_7_days':
        unlocked = maxConsecutiveStreak >= 7;
        progressPercent = Math.min(100, Math.round((maxConsecutiveStreak / 7) * 100));
        progressText = `${Math.min(7, maxConsecutiveStreak)}/7 ${isPt ? 'dias' : 'days'}`;
        break;

      case 'streak_31_days':
        unlocked = maxConsecutiveStreak >= 31;
        progressPercent = Math.min(100, Math.round((maxConsecutiveStreak / 31) * 100));
        progressText = `${Math.min(31, maxConsecutiveStreak)}/31 ${isPt ? 'dias' : 'days'}`;
        break;

      case 'streak_50_days':
        unlocked = maxConsecutiveStreak >= 50;
        progressPercent = Math.min(100, Math.round((maxConsecutiveStreak / 50) * 100));
        progressText = `${Math.min(50, maxConsecutiveStreak)}/50 ${isPt ? 'dias' : 'days'}`;
        break;

      case 'streak_100_days':
        unlocked = maxConsecutiveStreak >= 100;
        progressPercent = Math.min(100, Math.round((maxConsecutiveStreak / 100) * 100));
        progressText = `${Math.min(100, maxConsecutiveStreak)}/100 ${isPt ? 'dias' : 'days'}`;
        break;

      case 'streak_365_days':
        unlocked = maxConsecutiveStreak >= 365;
        progressPercent = Math.min(100, Math.round((maxConsecutiveStreak / 365) * 100));
        progressText = `${Math.min(365, maxConsecutiveStreak)}/365 ${isPt ? 'dias' : 'days'}`;
        break;

      case 'hop_explorer':
        unlocked = checkedInBars.length >= 5;
        progressPercent = Math.min(100, Math.round((checkedInBars.length / 5) * 100));
        progressText = `${Math.min(5, checkedInBars.length)}/5 spots`;
        break;

      case 'hop_collector':
        unlocked = checkedInBars.length >= 10;
        progressPercent = Math.min(100, Math.round((checkedInBars.length / 10) * 100));
        progressText = `${Math.min(10, checkedInBars.length)}/10 spots`;
        break;

      case 'hop_hunter':
        unlocked = checkedInBars.length >= 25;
        progressPercent = Math.min(100, Math.round((checkedInBars.length / 25) * 100));
        progressText = `${Math.min(25, checkedInBars.length)}/25 spots`;
        break;

      case 'hop_master':
        unlocked = checkedInBars.length >= 50;
        progressPercent = Math.min(100, Math.round((checkedInBars.length / 50) * 100));
        progressText = `${Math.min(50, checkedInBars.length)}/50 spots`;
        break;

      case 'hop_legend':
        unlocked = checkedInBars.length >= 100;
        progressPercent = Math.min(100, Math.round((checkedInBars.length / 100) * 100));
        progressText = `${Math.min(100, checkedInBars.length)}/100 spots`;
        break;

      case 'five_in_a_day':
        unlocked = maxUniqueSpotsInOneDay >= 5;
        progressPercent = Math.min(100, Math.round((maxUniqueSpotsInOneDay / 5) * 100));
        progressText = `${Math.min(5, maxUniqueSpotsInOneDay)}/5 no mesmo dia`;
        break;

      case 'porto_hopper':
        unlocked = maxPortoInOneDay >= 5;
        progressPercent = Math.min(100, Math.round((maxPortoInOneDay / 5) * 100));
        progressText = `${Math.min(5, maxPortoInOneDay)}/5 no Porto`;
        break;

      case 'lisboa_hopper':
        unlocked = maxLisboaInOneDay >= 5;
        progressPercent = Math.min(100, Math.round((maxLisboaInOneDay / 5) * 100));
        progressText = `${Math.min(5, maxLisboaInOneDay)}/5 em Lisboa`;
        break;

      case 'azores_hopper':
        unlocked = maxAzoresInOneDay >= 5;
        progressPercent = Math.min(100, Math.round((maxAzoresInOneDay / 5) * 100));
        progressText = `${Math.min(5, maxAzoresInOneDay)}/5 nos Açores`;
        break;

      case 'madeira_hopper':
        unlocked = maxMadeiraInOneDay >= 5;
        progressPercent = Math.min(100, Math.round((maxMadeiraInOneDay / 5) * 100));
        progressText = `${Math.min(5, maxMadeiraInOneDay)}/5 na Madeira`;
        break;

      case 'porto_conqueror': {
        const total = portoBarsList.length || 13;
        unlocked = checkedInPortoCount >= total && total > 0;
        progressPercent = Math.min(100, Math.round((checkedInPortoCount / total) * 100));
        progressText = `${Math.min(total, checkedInPortoCount)}/${total} spots`;
        break;
      }

      case 'lisboa_conqueror': {
        const total = lisboaBarsList.length || 29;
        unlocked = checkedInLisboaCount >= total && total > 0;
        progressPercent = Math.min(100, Math.round((checkedInLisboaCount / total) * 100));
        progressText = `${Math.min(total, checkedInLisboaCount)}/${total} spots`;
        break;
      }

      case 'azores_conqueror': {
        const total = acoresBarsList.length || 5;
        unlocked = checkedInAcoresCount >= total && total > 0;
        progressPercent = Math.min(100, Math.round((checkedInAcoresCount / total) * 100));
        progressText = `${Math.min(total, checkedInAcoresCount)}/${total} spots`;
        break;
      }

      case 'madeira_conqueror': {
        const total = madeiraBarsList.length || 5;
        unlocked = checkedInMadeiraCount >= total && total > 0;
        progressPercent = Math.min(100, Math.round((checkedInMadeiraCount / total) * 100));
        progressText = `${Math.min(total, checkedInMadeiraCount)}/${total} spots`;
        break;
      }

      case 'hop_king':
        unlocked = userRank === 1 && (user.points || 0) > 0;
        progressPercent = unlocked ? 100 : (userRank ? Math.max(10, 100 - (userRank - 1) * 15) : 0);
        progressText = unlocked ? '👑 #1 GLOBAL' : (userRank ? `#${userRank} Global` : 'Top 1 Global');
        break;

      case 'ipa_lover':
        unlocked = ipaCount >= 5;
        progressPercent = Math.min(100, Math.round((ipaCount / 5) * 100));
        progressText = `${Math.min(5, ipaCount)}/5 IPA`;
        break;

      case 'sour_lover':
        unlocked = sourCount >= 5;
        progressPercent = Math.min(100, Math.round((sourCount / 5) * 100));
        progressText = `${Math.min(5, sourCount)}/5 Sour`;
        break;

      case 'stout_lover':
        unlocked = stoutCount >= 5;
        progressPercent = Math.min(100, Math.round((stoutCount / 5) * 100));
        progressText = `${Math.min(5, stoutCount)}/5 Stout`;
        break;

      case 'lager_lover':
        unlocked = lagerCount >= 5;
        progressPercent = Math.min(100, Math.round((lagerCount / 5) * 100));
        progressText = `${Math.min(5, lagerCount)}/5 Lager`;
        break;

      case 'belgian_lover':
        unlocked = belgianCount >= 5;
        progressPercent = Math.min(100, Math.round((belgianCount / 5) * 100));
        progressText = `${Math.min(5, belgianCount)}/5 Belga`;
        break;

      case 'night_hopper':
        unlocked = nightCount >= 1;
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? 'Desbloqueado 🦉' : '0/1 (00h-06h)';
        break;

      case 'sunset_hopper':
        unlocked = sunsetCount >= 1;
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? 'Desbloqueado ☀️' : '0/1 (18h-20h)';
        break;

      case 'early_hopper':
        unlocked = earlyCount >= 1;
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? 'Desbloqueado 🌅' : '0/1 (<12h)';
        break;

      case 'weekend_warrior':
        unlocked = weekendCount >= 1;
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? 'Desbloqueado 📅' : '0/1 (Fim de semana)';
        break;

      case 'midweek_hopper':
        unlocked = midweekCount >= 1;
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? 'Desbloqueado 📅' : '0/1 (Quarta-feira)';
        break;

      case 'festival_hopper':
        unlocked = festivals.length >= 1;
        progressPercent = unlocked ? 100 : 0;
        progressText = `${festivals.length}/1 Evento`;
        break;

      case 'hop_critic':
        const totalReviews = (user.reviewsCount || 0) + reviewsCount;
        unlocked = totalReviews >= 5;
        progressPercent = Math.min(100, Math.round((totalReviews / 5) * 100));
        progressText = `${Math.min(5, totalReviews)}/5 Reviews`;
        break;

      case 'social_hopper':
        unlocked = friends.length >= 5;
        progressPercent = Math.min(100, Math.round((friends.length / 5) * 100));
        progressText = `${Math.min(5, friends.length)}/5 Amigos`;
        break;

      case 'hop_supporter':
        const totalDonations = (user.donationsCount || 0) + donationsCount;
        unlocked = totalDonations >= 1;
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked 
          ? (isPt ? 'Apoiante Oficial 💖' : 'Official Supporter 💖') 
          : (isPt ? '0/1 Doação' : '0/1 Donation');
        break;

      // Festive Days & Public Holidays
      case 'holiday_new_year':
        unlocked = isHolidayUnlocked('holiday_new_year');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🎆' : 'Unlocked 🎆') : (isPt ? '0/1 (1 de Jan)' : '0/1 (Jan 1st)');
        break;

      case 'holiday_carnival':
        unlocked = isHolidayUnlocked('holiday_carnival');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🎭' : 'Unlocked 🎭') : (isPt ? '0/1 (Carnaval)' : '0/1 (Carnival)');
        break;

      case 'holiday_valentines':
        unlocked = isHolidayUnlocked('holiday_valentines');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado ❤️' : 'Unlocked ❤️') : (isPt ? '0/1 (14 de Fev)' : '0/1 (Feb 14th)');
        break;

      case 'holiday_st_patricks':
        unlocked = isHolidayUnlocked('holiday_st_patricks');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado ☘️' : 'Unlocked ☘️') : (isPt ? '0/1 (17 de Mar)' : '0/1 (Mar 17th)');
        break;

      case 'holiday_easter':
        unlocked = isHolidayUnlocked('holiday_easter');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🐣' : 'Unlocked 🐣') : (isPt ? '0/1 (Páscoa)' : '0/1 (Easter)');
        break;

      case 'holiday_freedom_day':
        unlocked = isHolidayUnlocked('holiday_freedom_day');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🌺' : 'Unlocked 🌺') : (isPt ? '0/1 (25 de Abr)' : '0/1 (Apr 25th)');
        break;

      case 'holiday_labour_day':
        unlocked = isHolidayUnlocked('holiday_labour_day');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🛠️' : 'Unlocked 🛠️') : (isPt ? '0/1 (1 de Maio)' : '0/1 (May 1st)');
        break;

      case 'holiday_portugal_day':
        unlocked = isHolidayUnlocked('holiday_portugal_day');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🇵🇹' : 'Unlocked 🇵🇹') : (isPt ? '0/1 (10 de Jun)' : '0/1 (Jun 10th)');
        break;

      case 'holiday_santo_antonio':
        unlocked = isHolidayUnlocked('holiday_santo_antonio');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🐟' : 'Unlocked 🐟') : (isPt ? '0/1 (12/13 Jun)' : '0/1 (Jun 12/13)');
        break;

      case 'holiday_sao_joao':
        unlocked = isHolidayUnlocked('holiday_sao_joao');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🔨' : 'Unlocked 🔨') : (isPt ? '0/1 (23/24 Jun)' : '0/1 (Jun 23/24)');
        break;

      case 'holiday_sao_pedro':
        unlocked = isHolidayUnlocked('holiday_sao_pedro');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🗝️' : 'Unlocked 🗝️') : (isPt ? '0/1 (28/29 Jun)' : '0/1 (Jun 28/29)');
        break;

      case 'holiday_ipa_day':
        unlocked = isHolidayUnlocked('holiday_ipa_day');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🌿' : 'Unlocked 🌿') : (isPt ? '0/1 (IPA Day)' : '0/1 (IPA Day)');
        break;

      case 'holiday_beer_day':
        unlocked = isHolidayUnlocked('holiday_beer_day');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🍻' : 'Unlocked 🍻') : (isPt ? '0/1 (Beer Day)' : '0/1 (Beer Day)');
        break;

      case 'holiday_assuncao':
        unlocked = isHolidayUnlocked('holiday_assuncao');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado ☀️' : 'Unlocked ☀️') : (isPt ? '0/1 (15 de Ago)' : '0/1 (Aug 15th)');
        break;

      case 'holiday_oktoberfest':
        unlocked = isHolidayUnlocked('holiday_oktoberfest');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🥨' : 'Unlocked 🥨') : (isPt ? '0/1 (Oktoberfest)' : '0/1 (Oktoberfest)');
        break;

      case 'holiday_republic_day':
        unlocked = isHolidayUnlocked('holiday_republic_day');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🏛️' : 'Unlocked 🏛️') : (isPt ? '0/1 (5 de Out)' : '0/1 (Oct 5th)');
        break;

      case 'holiday_halloween':
        unlocked = isHolidayUnlocked('holiday_halloween');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🎃' : 'Unlocked 🎃') : (isPt ? '0/1 (31 de Out)' : '0/1 (Oct 31st)');
        break;

      case 'holiday_all_saints':
        unlocked = isHolidayUnlocked('holiday_all_saints');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🕯️' : 'Unlocked 🕯️') : (isPt ? '0/1 (1 de Nov)' : '0/1 (Nov 1st)');
        break;

      case 'holiday_stout_day':
        unlocked = isHolidayUnlocked('holiday_stout_day');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado ☕' : 'Unlocked ☕') : (isPt ? '0/1 (Stout Day)' : '0/1 (Stout Day)');
        break;

      case 'holiday_restoration_day':
        unlocked = isHolidayUnlocked('holiday_restoration_day');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🛡️' : 'Unlocked 🛡️') : (isPt ? '0/1 (1 de Dez)' : '0/1 (Dec 1st)');
        break;

      case 'holiday_imaculada':
        unlocked = isHolidayUnlocked('holiday_imaculada');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado ⭐' : 'Unlocked ⭐') : (isPt ? '0/1 (8 de Dez)' : '0/1 (Dec 8th)');
        break;

      case 'holiday_christmas':
        unlocked = isHolidayUnlocked('holiday_christmas');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🎄' : 'Unlocked 🎄') : (isPt ? '0/1 (24/25 Dez)' : '0/1 (Dec 24/25)');
        break;

      case 'holiday_new_years_eve':
        unlocked = isHolidayUnlocked('holiday_new_years_eve');
        progressPercent = unlocked ? 100 : 0;
        progressText = unlocked ? (isPt ? 'Desbloqueado 🍾' : 'Unlocked 🍾') : (isPt ? '0/1 (31 de Dez)' : '0/1 (Dec 31st)');
        break;

      default:
        unlocked = false;
        progressPercent = 0;
        break;
    }

    // If already stored in user.earnedBadges, force unlocked
    if (user.earnedBadges && user.earnedBadges.includes(badge.id)) {
      unlocked = true;
      progressPercent = 100;
    }

    return {
      badge,
      unlocked,
      progressText,
      progressPercent
    };
  });
}

/**
 * Returns only the list of unlocked badges for a user.
 */
export function getUnlockedBadges(ctx: BadgeCalculationContext): Badge[] {
  return calculateUserBadges(ctx)
    .filter(item => item.unlocked)
    .map(item => item.badge);
}

/**
 * Determines which rank color should be assigned to a username.
 * For #1 Global user, returns 'gold-flashing'.
 */
export function getUserRankingStyling(userPoints: number = 0, isGlobalRank1: boolean = false, lang: Language = 'PT'): {
  color: string;
  isFlashing: boolean;
  className: string;
  tierTitle: string;
} {
  const level = getLevelDetails(userPoints, lang);

  if (isGlobalRank1 && userPoints > 0) {
    return {
      color: '#FFD700',
      isFlashing: true,
      className: 'text-amber-300 font-black tracking-wider animate-pulse drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]',
      tierTitle: '#1 GLOBAL MASTER'
    };
  }

  if (userPoints >= 101) {
    return { color: '#FF0000', isFlashing: false, className: 'text-red-500 font-extrabold', tierTitle: level.title };
  }
  if (userPoints >= 91) {
    return { color: '#00FFFF', isFlashing: false, className: 'text-cyan-400 font-extrabold', tierTitle: level.title };
  }
  if (userPoints >= 71) {
    return { color: '#FFB8FF', isFlashing: false, className: 'text-pink-300 font-extrabold', tierTitle: level.title };
  }
  if (userPoints >= 46) {
    return { color: '#FFB852', isFlashing: false, className: 'text-amber-400 font-bold', tierTitle: level.title };
  }
  if (userPoints >= 26) {
    return { color: '#22C55E', isFlashing: false, className: 'text-emerald-400 font-bold', tierTitle: level.title };
  }
  if (userPoints >= 11) {
    return { color: '#FFCA00', isFlashing: false, className: 'text-amber-300 font-semibold', tierTitle: level.title };
  }

  return { color: '#A1A1AA', isFlashing: false, className: 'text-zinc-300 font-medium', tierTitle: level.title };
}
