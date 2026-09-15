import { Bar } from '../types';
import { Language, getBarWorkingHours } from './i18n';

export interface OpenStatusResult {
  isOpen: boolean;
  statusText: string;
  isConsult: boolean;
  colorClass: string;
}

export interface BarFeaturesResult {
  taps: number;
  hasFood: boolean;
  petFriendly: boolean;
  hasTerrace: boolean;
  hasParking: boolean;
  hasBeerShop: boolean;
}

const DAY_MAP: Record<string, number> = {
  dom: 0, domingo: 0, sun: 0, sunday: 0,
  seg: 1, segunda: 1, mon: 1, monday: 1,
  ter: 2, terça: 2, tue: 2, tuesday: 2,
  qua: 3, quarta: 3, wed: 3, wednesday: 3,
  qui: 4, quinta: 4, thu: 4, thursday: 4,
  sex: 5, sexta: 5, fri: 5, friday: 5,
  sáb: 6, sab: 6, sábado: 6, sat: 6, saturday: 6
};

const DAY_NAMES_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTimeStr(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function getBarOpenStatus(bar: Bar, lang: Language = 'PT'): OpenStatusResult {
  const text = getBarWorkingHours(bar, lang);

  if (!text || text.toLowerCase().includes('consultar') || text.toLowerCase().includes('check working hours')) {
    return {
      isOpen: false,
      isConsult: true,
      statusText: lang === 'PT' ? '🟡 Horário sob consulta' : '🟡 Schedule on request',
      colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    };
  }

  const now = new Date();
  const currentDay = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Day schedules: day (0..6) -> Array of { start: number, end: number, isClosed: boolean }
  const schedulePerDay: Record<number, Array<{ start: number; end: number; isClosed: boolean }>> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  };

  for (const line of lines) {
    const isClosed = /fechado|encerrado|closed/i.test(line);

    // Extract day specs
    let targetDays: number[] = [];
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes('diariamente') || lowerLine.includes('daily') || lowerLine.includes('todos os dias') || lowerLine.includes('dom a sáb') || lowerLine.includes('sun to sat')) {
      targetDays = [0, 1, 2, 3, 4, 5, 6];
    } else {
      // Check day ranges e.g. "Ter a Qui", "Seg a Sex", "Dom a Qua", "Qua a Dom", "Wed to Sun"
      const rangeMatch = lowerLine.match(/(seg|ter|qua|qui|sex|sáb|sab|dom|mon|tue|wed|thu|fri|sat)(a|ª|-|\s+a\s+|\s+to\s+)(seg|ter|qua|qui|sex|sáb|sab|dom|mon|tue|wed|thu|fri|sat)/i);
      if (rangeMatch) {
        const startDay = DAY_MAP[rangeMatch[1]];
        const endDay = DAY_MAP[rangeMatch[3]];
        if (startDay !== undefined && endDay !== undefined) {
          let d = startDay;
          while (d !== endDay) {
            targetDays.push(d);
            d = (d + 1) % 7;
          }
          targetDays.push(endDay);
        }
      }

      if (targetDays.length === 0) {
        // Individual days listed e.g. "Sex e Sáb", "Seg, Ter, Qui"
        for (const [key, dayNum] of Object.entries(DAY_MAP)) {
          if (new RegExp(`\\b${key}\\b`, 'i').test(lowerLine)) {
            if (!targetDays.includes(dayNum)) {
              targetDays.push(dayNum);
            }
          }
        }
      }
    }

    if (targetDays.length === 0) {
      // Default to all days if no day specified but hours given
      targetDays = [0, 1, 2, 3, 4, 5, 6];
    }

    // Extract time numbers e.g. "16:00h às 00:00h", "17:00–23:00", "12:00/15:00 à 01:30h"
    const timeMatches = [...line.matchAll(/(\d{1,2})[:h](\d{2})?/gi)];
    if (timeMatches.length >= 2 && !isClosed) {
      const startH = parseInt(timeMatches[0][1], 10);
      const startM = timeMatches[0][2] ? parseInt(timeMatches[0][2], 10) : 0;

      // Last match as close time
      const lastMatch = timeMatches[timeMatches.length - 1];
      const endH = parseInt(lastMatch[1], 10);
      const endM = lastMatch[2] ? parseInt(lastMatch[2], 10) : 0;

      let startMin = startH * 60 + startM;
      let endMin = endH * 60 + endM;

      if (endMin <= startMin) {
        endMin += 1440; // Past midnight closing
      }

      for (const d of targetDays) {
        schedulePerDay[d].push({ start: startMin, end: endMin, isClosed: false });
      }
    } else if (isClosed) {
      for (const d of targetDays) {
        schedulePerDay[d].push({ start: 0, end: 0, isClosed: true });
      }
    }
  }

  // Check if open right now (including shift from yesterday that spilled past midnight)
  const yesterday = (currentDay + 6) % 7;
  const yesterdayShifts = schedulePerDay[yesterday] || [];
  for (const shift of yesterdayShifts) {
    if (!shift.isClosed && shift.end > 1440) {
      const adjustedNow = nowMinutes + 1440;
      if (adjustedNow >= shift.start && adjustedNow < shift.end) {
        const closeStr = formatTimeStr(shift.end);
        return {
          isOpen: true,
          isConsult: false,
          statusText: lang === 'PT' ? `🟢 Aberto agora até às ${closeStr}` : `🟢 Open now until ${closeStr}`,
          colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
        };
      }
    }
  }

  const todayShifts = schedulePerDay[currentDay] || [];
  if (todayShifts.length > 0) {
    for (const shift of todayShifts) {
      if (shift.isClosed) continue;

      if (nowMinutes >= shift.start && nowMinutes < shift.end) {
        const closeStr = formatTimeStr(shift.end);
        return {
          isOpen: true,
          isConsult: false,
          statusText: lang === 'PT' ? `🟢 Aberto agora até às ${closeStr}` : `🟢 Open now until ${closeStr}`,
          colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
        };
      }

      if (nowMinutes < shift.start) {
        const openStr = formatTimeStr(shift.start);
        return {
          isOpen: false,
          isConsult: false,
          statusText: lang === 'PT' ? `🔴 Fechado - Abre às ${openStr}` : `🔴 Closed - Opens at ${openStr}`,
          colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
        };
      }
    }
  }

  // If today is closed or shifts passed, find next open day
  for (let offset = 1; offset <= 7; offset++) {
    const nextD = (currentDay + offset) % 7;
    const nextShifts = schedulePerDay[nextD] || [];
    for (const s of nextShifts) {
      if (!s.isClosed && s.start > 0) {
        const openStr = formatTimeStr(s.start);
        if (offset === 1) {
          return {
            isOpen: false,
            isConsult: false,
            statusText: lang === 'PT' ? `🔴 Fechado - Abre amanhã às ${openStr}` : `🔴 Closed - Opens tomorrow at ${openStr}`,
            colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
          };
        } else {
          const dayName = lang === 'PT' ? DAY_NAMES_PT[nextD] : DAY_NAMES_EN[nextD];
          return {
            isOpen: false,
            isConsult: false,
            statusText: lang === 'PT' ? `🔴 Fechado - Abre ${dayName} às ${openStr}` : `🔴 Closed - Opens ${dayName} at ${openStr}`,
            colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
          };
        }
      }
    }
  }

  return {
    isOpen: false,
    isConsult: true,
    statusText: lang === 'PT' ? '🔴 Fechado' : '🔴 Closed',
    colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
  };
}

export function getBarFeatures(bar: Bar, _lang: Language = 'PT'): BarFeaturesResult {
  const desc = (bar.description || '').toLowerCase();
  const name = (bar.name || '').toLowerCase();

  // Deduce or use explicit attributes
  const taps = bar.taps || (desc.includes('torneiras') ? 12 : 10);
  const hasFood = bar.hasFood !== undefined ? bar.hasFood : true;
  const petFriendly = bar.petFriendly !== undefined ? bar.petFriendly : true;
  const hasTerrace = bar.hasTerrace !== undefined ? bar.hasTerrace : true;
  const hasParking = bar.hasParking !== undefined 
    ? bar.hasParking 
    : (desc.includes('estacionamento') || desc.includes('parque') || desc.includes('parking') || true);
  const hasBeerShop = bar.hasBeerShop !== undefined 
    ? bar.hasBeerShop 
    : (desc.includes('loja') || desc.includes('garrafeira') || desc.includes('take-away') || desc.includes('bottleshop') || desc.includes('beer shop') || name.includes('beerstore'));

  return {
    taps,
    hasFood,
    petFriendly,
    hasTerrace,
    hasParking,
    hasBeerShop
  };
}
