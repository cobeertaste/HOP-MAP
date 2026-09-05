/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, addDoc, doc, setDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { AnalyticsEvent, AnalyticsEventType, MonthlyReport, SpotMonthlyMetrics, TopUserMetrics, DonationRecord, Bar } from '../types';
import { getDonationsForMonth } from './donations';
import { getSpotConsumedBeerStyles, fetchSpotConsumedBeerStylesForMonth, recordSpotBeerStyleConsumption } from './craftBeerStyles';
import { getCurrentMonthKey, getMonthLabel } from './dateUtils';
export { getCurrentMonthKey, getMonthLabel };

export const OFFICIAL_REPORT_EMAIL = 'cobeertaste@gmail.com';

/**
 * Checks if a given user email corresponds to the authorized Administrator
 */
export function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === OFFICIAL_REPORT_EMAIL.toLowerCase();
}

const LOCAL_STORAGE_EVENTS_KEY = 'hop_analytics_events_v2';
const LOCAL_STORAGE_REPORTS_KEY = 'hop_monthly_reports_v2';

/**
 * Read cached local events
 */
export function getLocalEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save event to local storage buffer (always ensures instant tracking & offline resilience)
 */
function saveEventLocally(event: AnalyticsEvent) {
  try {
    const list = getLocalEvents();
    list.unshift(event);
    // Keep reasonable max size (last 2000 events)
    if (list.length > 2000) {
      list.length = 2000;
    }
    localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not save analytics event locally:', e);
  }
}

/**
 * Core event tracking engine (Firestore + Local Buffer + Console Diagnostics)
 */
export async function trackAnalyticsEvent(
  eventType: AnalyticsEventType,
  spot: { id: string; name: string },
  user: { id: string; username: string },
  metadata: Record<string, any> = {}
): Promise<AnalyticsEvent> {
  const now = new Date();
  const month = getCurrentMonthKey(now);
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const event: AnalyticsEvent = {
    id: eventId,
    eventType,
    spotId: spot.id,
    spotName: spot.name,
    userId: user.id || 'anonymous',
    username: user.username || 'Visitante Hop-Map',
    month,
    timestamp: now.toISOString(),
    metadata
  };

  // 1. Save locally for instant reactivity and aggregation
  saveEventLocally(event);

  // 2. Persist to Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'analytics_events'), {
        ...event,
        serverTimestamp: now.toISOString()
      });
    } catch (err) {
      // Non-blocking fallback
      console.warn('[Hop-Map Analytics] Firestore write note:', err);
    }
  }

  // 3. Increment spot_metrics aggregate document for efficient querying
  incrementSpotMetricLocally(spot.id, spot.name, eventType, month);

  return event;
}

/**
 * Convenience tracker: Check-in
 */
export async function trackSpotCheckin(
  spot: { id: string; name: string },
  user: { id: string; username: string },
  isTenthStamp: boolean = false,
  points: number = 1
) {
  const evt = await trackAnalyticsEvent('spot_checkin', spot, user, {
    isTenthStamp,
    pointsEarned: points,
    channel: 'app_gamification'
  });

  if (isTenthStamp) {
    await trackSpotReward(spot, user, '10_stamps_free_beer');
  }

  return evt;
}

/**
 * Convenience tracker: Reward / Prize granted
 */
export async function trackSpotReward(
  spot: { id: string; name: string },
  user: { id: string; username: string },
  rewardType: string = '10_stamps_free_beer'
) {
  return trackAnalyticsEvent('spot_reward_granted', spot, user, {
    rewardType,
    rewardTitle: '10.º Selo Conquistado - Cerveja Grátis'
  });
}

/**
 * Convenience tracker: Spot detail view
 */
export async function trackSpotView(
  spot: { id: string; name: string },
  user: { id: string; username: string }
) {
  return trackAnalyticsEvent('spot_view', spot, user, {
    source: 'spot_card_click'
  });
}

/**
 * Convenience tracker: Social Media Share
 */
export async function trackSpotShare(
  spot: { id: string; name: string },
  user: { id: string; username: string },
  platform: 'whatsapp' | 'facebook' | 'twitter' | 'native_share' | 'copy_link' | 'image_download' | string
) {
  return trackAnalyticsEvent('spot_social_share', spot, user, {
    platform,
    shareTextPrompt: `Descobre as cervejas de hoje no ${spot.name}!`
  });
}

/**
 * Convenience tracker: Directions / GPS / Como Chegar
 */
export async function trackSpotDirections(
  spot: { id: string; name: string },
  user: { id: string; username: string },
  navigationService: 'google_maps' | 'waze' | 'apple_maps' | 'in_app_route' | string = 'google_maps'
) {
  return trackAnalyticsEvent('spot_directions_click', spot, user, {
    navigationService,
    action: 'como_chegar_gps_click'
  });
}

/**
 * Update spot aggregated counters in local storage cache
 */
function incrementSpotMetricLocally(
  spotId: string,
  spotName: string,
  eventType: AnalyticsEventType,
  monthKey: string
) {
  try {
    const key = `hop_spot_metrics_${monthKey}`;
    const raw = localStorage.getItem(key);
    const metrics: Record<string, SpotMonthlyMetrics> = raw ? JSON.parse(raw) : {};

    if (!metrics[spotId]) {
      metrics[spotId] = {
        spotId,
        spotName,
        checkins: 0,
        rewards: 0,
        views: 0,
        shares: 0,
        directions: 0
      };
    }

    if (eventType === 'spot_checkin') metrics[spotId].checkins += 1;
    else if (eventType === 'spot_reward_granted') metrics[spotId].rewards += 1;
    else if (eventType === 'spot_view') metrics[spotId].views += 1;
    else if (eventType === 'spot_social_share') metrics[spotId].shares += 1;
    else if (eventType === 'spot_directions_click') metrics[spotId].directions += 1;

    localStorage.setItem(key, JSON.stringify(metrics));
  } catch (e) {
    // ignore
  }
}

/**
 * Generate a complete Monthly Report for the given month
 */
export async function generateMonthlyReport(
  monthKey: string,
  allSpots: Array<{ id: string; name: string }>
): Promise<MonthlyReport> {
  // 1. Gather all events from local buffer
  const allEvents = getLocalEvents().filter(evt => evt.month === monthKey);

  // 2. Fetch from Firestore if accessible
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'analytics_events'),
        where('month', '==', monthKey),
        limit(1500)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as AnalyticsEvent;
        if (!allEvents.some(e => e.id === docSnap.id || (e.timestamp === data.timestamp && e.spotId === data.spotId && e.eventType === data.eventType))) {
          allEvents.push({ ...data, id: docSnap.id });
        }
      });
    } catch (err) {
      console.warn('[Hop-Map Analytics] Notice querying Firestore events:', err);
    }
  }

  // 3. Seed baseline metrics for all spots to ensure complete coverage
  const spotMetricsMap = new Map<string, SpotMonthlyMetrics>();
  for (const s of allSpots) {
    spotMetricsMap.set(s.id, {
      spotId: s.id,
      spotName: s.name,
      checkins: 0,
      rewards: 0,
      views: 0,
      shares: 0,
      directions: 0
    });
  }

  // User check-ins & rewards map for Top Users ranking
  const userCheckinsMap = new Map<string, { username: string; checkins: number; rewards: number }>();

  // Process all events
  for (const evt of allEvents) {
    let metric = spotMetricsMap.get(evt.spotId);
    if (!metric) {
      metric = {
        spotId: evt.spotId,
        spotName: evt.spotName || evt.spotId,
        checkins: 0,
        rewards: 0,
        views: 0,
        shares: 0,
        directions: 0
      };
      spotMetricsMap.set(evt.spotId, metric);
    }

    if (evt.eventType === 'spot_checkin') {
      metric.checkins += 1;
      const userKey = evt.userId || evt.username;
      const curUser = userCheckinsMap.get(userKey) || { username: evt.username || 'Utilizador', checkins: 0, rewards: 0 };
      curUser.checkins += 1;
      userCheckinsMap.set(userKey, curUser);
    } else if (evt.eventType === 'spot_reward_granted') {
      metric.rewards += 1;
      const userKey = evt.userId || evt.username;
      const curUser = userCheckinsMap.get(userKey) || { username: evt.username || 'Utilizador', checkins: 0, rewards: 0 };
      curUser.rewards += 1;
      userCheckinsMap.set(userKey, curUser);
    } else if (evt.eventType === 'spot_view') {
      metric.views += 1;
    } else if (evt.eventType === 'spot_social_share') {
      metric.shares += 1;
    } else if (evt.eventType === 'spot_directions_click') {
      metric.directions += 1;
    }
  }

  const spotsBreakdown = Array.from(spotMetricsMap.values())
    .sort((a, b) => (b.checkins + b.views + b.directions + b.shares) - (a.checkins + a.views + a.directions + a.shares));

  const topUsers: TopUserMetrics[] = Array.from(userCheckinsMap.entries())
    .map(([userId, data]) => ({
      userId,
      username: data.username,
      checkinsCount: data.checkins,
      rewardsCount: data.rewards
    }))
    .sort((a, b) => b.checkinsCount - a.checkinsCount)
    .slice(0, 15);

  let totalCheckins = 0;
  let totalRewards = 0;
  let totalViews = 0;
  let totalShares = 0;
  let totalDirections = 0;

  for (const s of spotsBreakdown) {
    // Populate spot consumed styles from month-specific Firestore/local sync
    const spotStyles = await fetchSpotConsumedBeerStylesForMonth(s.spotId, monthKey);
    s.consumedStyles = spotStyles;

    totalCheckins += s.checkins;
    totalRewards += s.rewards;
    totalViews += s.views;
    totalShares += s.shares;
    totalDirections += s.directions;
  }

  // 3.5. Aggregate global consumed beer styles across all spots
  const globalStylesMap: Record<string, number> = {};
  spotsBreakdown.forEach(s => {
    if (s.consumedStyles) {
      Object.entries(s.consumedStyles).forEach(([style, count]) => {
        globalStylesMap[style] = (globalStylesMap[style] || 0) + (Number(count) || 0);
      });
    }
  });

  const topBeerStyles = Object.entries(globalStylesMap)
    .map(([style, count]) => ({ style, count }))
    .sort((a, b) => b.count - a.count);

  // 4. Fetch and aggregate donations for the month
  let donationsBreakdown: DonationRecord[] = [];
  try {
    donationsBreakdown = await getDonationsForMonth(monthKey);
  } catch (err) {
    console.warn('Notice loading donations for monthly report:', err);
  }

  const totalDonationsAmount = donationsBreakdown.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalDonationsCount = donationsBreakdown.length;

  const report: MonthlyReport = {
    id: `report_${monthKey}`,
    month: monthKey,
    monthLabel: getMonthLabel(monthKey),
    recipientEmail: OFFICIAL_REPORT_EMAIL,
    generatedAt: new Date().toISOString(),
    status: 'generated',
    totalCheckins,
    totalRewards,
    totalViews,
    totalShares,
    totalDirections,
    totalDonationsAmount,
    totalDonationsCount,
    donationsBreakdown,
    spotsBreakdown,
    topUsers,
    consumedStylesBreakdown: globalStylesMap,
    topBeerStyles
  };

  // Cache report locally
  saveReportLocally(report);

  return report;
}

/**
 * Save report in local storage
 */
export function saveReportLocally(report: MonthlyReport) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
    const reports: Record<string, MonthlyReport> = raw ? JSON.parse(raw) : {};
    reports[report.month] = report;
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(reports));
  } catch (e) {
    // ignore
  }
}

/**
 * Get all stored reports
 */
export function getStoredReports(): MonthlyReport[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
    if (!raw) return [];
    const reports: Record<string, MonthlyReport> = JSON.parse(raw);
    return Object.values(reports).sort((a, b) => b.month.localeCompare(a.month));
  } catch (e) {
    return [];
  }
}

/**
 * Formats the email body in plain text for mailto or standard email clients
 */
export function formatEmailReportPlainText(report: MonthlyReport): string {
  const lines: string[] = [
    `📊 RELATÓRIO MENSAL HOP-MAP - ${report.monthLabel.toUpperCase()}`,
    `Destinatário Oficial: ${report.recipientEmail}`,
    `Gerado em: ${new Date(report.generatedAt).toLocaleString('pt-PT')}`,
    `Plataforma: Hop-Map by CoBeer Taste (https://www.cobeertaste.com)`,
    ``,
    `═══════════════════════════════════════════════════════════`,
    `📈 RESUMO GLOBAL DO MÊS`,
    `═══════════════════════════════════════════════════════════`,
    `• Total de Check-ins efetuados: ${report.totalCheckins}`,
    `• Total de Prémios atribuídos (10.º Selo/Cerveja Grátis): ${report.totalRewards}`,
    `• Total de Visitas às Fichas dos Locais: ${report.totalViews}`,
    `• Total de Partilhas nas Redes Sociais: ${report.totalShares}`,
    `• Total de Cliques em "Como Chegar" (GPS/Rota): ${report.totalDirections}`,
    `• Total de Doações/Apoios ("Buy us a Beer"): ${(report.totalDonationsAmount || 0).toFixed(2)} € (${report.totalDonationsCount || 0} doações)`,
    ``,
    `═══════════════════════════════════════════════════════════`,
    `🍻 LISTA DE APOIOS & DOAÇÕES RECEBIDAS`,
    `═══════════════════════════════════════════════════════════`,
    ...(report.donationsBreakdown && report.donationsBreakdown.length > 0 
      ? report.donationsBreakdown.map((d, idx) => {
          const methodLabel = d.paymentMethod === 'mbway' ? 'MB WAY' : d.paymentMethod === 'revolut' ? 'Revolut' : d.paymentMethod === 'apple_google_pay' ? 'Apple/Google Pay' : 'Cartão/Stripe';
          return `${idx + 1}. ${d.donorName} — ${Number(d.amount).toFixed(2)} € via ${methodLabel} (${new Date(d.timestamp).toLocaleDateString('pt-PT')})`;
        })
      : [`(Sem doações registadas neste período)`]),
    ``,
    `═══════════════════════════════════════════════════════════`,
    `🏆 TOP UTILIZADORES COM MAIS CHECK-INS`,
    `═══════════════════════════════════════════════════════════`
  ];

  if (report.topUsers.length === 0) {
    lines.push(`(Sem check-ins registados no período selecionado)`);
  } else {
    report.topUsers.forEach((u, idx) => {
      lines.push(`${idx + 1}. ${u.username} — ${u.checkinsCount} Check-ins | ${u.rewardsCount} Prémios`);
    });
  }

  lines.push(
    ``,
    `═══════════════════════════════════════════════════════════`,
    `🍺 ESTILOS DE CERVEJA MAIS CONSUMIDOS (CHECK-INS)`,
    `═══════════════════════════════════════════════════════════`
  );

  if (!report.topBeerStyles || report.topBeerStyles.length === 0) {
    lines.push(`(Sem estilos de cerveja especificados neste período)`);
  } else {
    report.topBeerStyles.forEach((bs, idx) => {
      lines.push(`${idx + 1}. ${bs.style}: ${bs.count} consumos registados`);
    });
  }

  lines.push(
    ``,
    `═══════════════════════════════════════════════════════════`,
    `📍 MÉTRICAS DETALHADAS POR SPOT (LOCAL)`,
    `═══════════════════════════════════════════════════════════`
  );

  const activeSpots = report.spotsBreakdown.filter(s => (s.checkins + s.views + s.directions + s.shares + s.rewards) > 0);
  const spotsToDisplay = activeSpots.length > 0 ? activeSpots : report.spotsBreakdown.slice(0, 10);

  spotsToDisplay.forEach((s, idx) => {
    const stylesSummary = s.consumedStyles && Object.keys(s.consumedStyles).length > 0
      ? Object.entries(s.consumedStyles).map(([st, cnt]) => `${st} (${cnt})`).join(', ')
      : 'Nenhum registado';

    lines.push(
      `${idx + 1}. ${s.spotName}:`,
      `   • Check-ins: ${s.checkins}`,
      `   • Prémios Atribuídos: ${s.rewards}`,
      `   • Estilos Consumidos: ${stylesSummary}`,
      `   • Visitas à Ficha: ${s.views}`,
      `   • Partilhas Sociais: ${s.shares}`,
      `   • Cliques "Como Chegar" (GPS): ${s.directions}`,
      ``
    );
  });

  lines.push(
    `═══════════════════════════════════════════════════════════`,
    `🍻 HOP-MAP by COBEER TASTE — Plataforma de Taprooms & Cerveja Artesanal`,
    `www.cobeertaste.com`
  );

  return lines.join('\n');
}

/**
 * Formats rich HTML template for email / web preview
 */
export function formatEmailReportHtml(report: MonthlyReport): string {
  const activeSpots = report.spotsBreakdown.filter(s => (s.checkins + s.views + s.directions + s.shares + s.rewards) > 0);
  const spotsToDisplay = activeSpots.length > 0 ? activeSpots : report.spotsBreakdown.slice(0, 15);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Relatório Mensal Hop-Map - ${report.monthLabel}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #111827; color: #f3f4f6; margin: 0; padding: 24px; }
    .container { max-width: 680px; margin: 0 auto; background-color: #1f2937; border-radius: 16px; border: 1px solid #374151; overflow: hidden; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; font-weight: 700; opacity: 0.9; }
    .content { padding: 24px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
    .kpi-card { background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 16px; text-align: center; }
    .kpi-val { font-size: 26px; font-weight: 800; color: #f59e0b; font-family: monospace; }
    .kpi-label { font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: 700; margin-top: 4px; }
    .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #f59e0b; border-bottom: 2px solid #374151; padding-bottom: 6px; margin: 24px 0 14px 0; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
    th { background: #111827; color: #f59e0b; text-align: left; padding: 10px; border-bottom: 2px solid #374151; font-weight: 700; text-transform: uppercase; font-size: 10px; }
    td { padding: 10px; border-bottom: 1px solid #374151; }
    tr:nth-child(even) { background: #182234; }
    .badge { display: inline-block; background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 6px; padding: 2px 6px; font-weight: 700; font-family: monospace; }
    .footer { text-align: center; padding: 20px; font-size: 11px; color: #9ca3af; border-top: 1px solid #374151; background: #111827; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 RELATÓRIO MENSAL HOP-MAP</h1>
      <p>${report.monthLabel.toUpperCase()} • Destinatário: ${report.recipientEmail}</p>
    </div>
    
    <div class="content">
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-val">${report.totalCheckins}</div>
          <div class="kpi-label">Total de Check-ins</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">${report.totalRewards}</div>
          <div class="kpi-label">Prémios Conquistados</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">${report.totalViews}</div>
          <div class="kpi-label">Visitas às Fichas</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">${report.totalDirections}</div>
          <div class="kpi-label">Cliques "Como Chegar" (GPS)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">${report.totalShares}</div>
          <div class="kpi-label">Partilhas nas Redes Sociais</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val" style="color: #10b981;">${(report.totalDonationsAmount || 0).toFixed(2)} €</div>
          <div class="kpi-label">Total Doações / Apoios (${report.totalDonationsCount || 0})</div>
        </div>
      </div>

      <div class="section-title">🍻 Apoios & Doações ("Buy us a Beer")</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nome / Nickname Doador</th>
            <th>Valor</th>
            <th>Método</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          ${!report.donationsBreakdown || report.donationsBreakdown.length === 0 
            ? '<tr><td colspan="5" style="text-align: center; color: #9ca3af;">Nenhum apoio financeiro registado neste período.</td></tr>' 
            : report.donationsBreakdown.map((d, i) => `
              <tr>
                <td><strong style="color: #f59e0b;">${i + 1}</strong></td>
                <td><strong>${d.donorName}</strong></td>
                <td><span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border-color: rgba(16, 185, 129, 0.4);">${Number(d.amount).toFixed(2)} €</span></td>
                <td>${d.paymentMethod === 'mbway' ? 'MB WAY' : d.paymentMethod === 'revolut' ? 'Revolut' : d.paymentMethod === 'apple_google_pay' ? 'Apple/Google Pay' : 'Cartão/Stripe'}</td>
                <td>${new Date(d.timestamp).toLocaleDateString('pt-PT')}</td>
              </tr>
            `).join('')}
        </tbody>
      </table>

      <div class="section-title">🏆 Utilizadores com Mais Check-ins</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Utilizador</th>
            <th>Check-ins</th>
            <th>Prémios</th>
          </tr>
        </thead>
        <tbody>
          ${report.topUsers.length === 0 ? '<tr><td colspan="4" style="text-align: center; color: #9ca3af;">Nenhum check-in registado neste período.</td></tr>' : ''}
          ${report.topUsers.map((u, i) => `
            <tr>
              <td><strong style="color: #f59e0b;">${i + 1}</strong></td>
              <td><strong>${u.username}</strong></td>
              <td><span class="badge">${u.checkinsCount}</span></td>
              <td>${u.rewardsCount > 0 ? `🎁 ${u.rewardsCount}` : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-title">🍺 Estilos de Cerveja Mais Consumidos</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Estilo de Cerveja</th>
            <th>Consumos (Check-ins)</th>
          </tr>
        </thead>
        <tbody>
          ${!report.topBeerStyles || report.topBeerStyles.length === 0 ? '<tr><td colspan="3" style="text-align: center; color: #9ca3af;">Nenhum estilo registado neste período.</td></tr>' : ''}
          ${(report.topBeerStyles || []).slice(0, 10).map((bs, i) => `
            <tr>
              <td><strong style="color: #f59e0b;">${i + 1}</strong></td>
              <td><strong>🍺 ${bs.style}</strong></td>
              <td><span class="badge">${bs.count}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-title">📍 Estatísticas & Estilos por Local (Spot)</div>
      <table>
        <thead>
          <tr>
            <th>Local</th>
            <th>Estilos de Cerveja Consumidos</th>
            <th>Check-ins</th>
            <th>Prémios</th>
            <th>Visitas</th>
            <th>GPS</th>
          </tr>
        </thead>
        <tbody>
          ${spotsToDisplay.map(s => {
            const stylesHtml = s.consumedStyles && Object.keys(s.consumedStyles).length > 0
              ? Object.entries(s.consumedStyles)
                  .map(([st, cnt]) => `<span class="badge" style="margin: 2px 2px 2px 0; font-size: 9px;">🍺 ${st} (${cnt})</span>`)
                  .join(' ')
              : '<span style="color: #6b7280; font-size: 10px;">Sem registo</span>';

            return `
            <tr>
              <td><strong>${s.spotName}</strong></td>
              <td>${stylesHtml}</td>
              <td><span class="badge">${s.checkins}</span></td>
              <td>${s.rewards > 0 ? `<strong style="color: #10b981;">🎁 ${s.rewards}</strong>` : '0'}</td>
              <td>${s.views}</td>
              <td>${s.directions}</td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      Relatório gerado automaticamente por <strong>Hop-Map by CoBeer Taste</strong><br>
      Website: <a href="https://www.cobeertaste.com" style="color: #f59e0b;">www.cobeertaste.com</a>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispatches and records the sending of monthly report to cobeertaste@gmail.com
 */
export async function sendMonthlyReportEmail(report: MonthlyReport): Promise<{
  success: boolean;
  message: string;
  mailToUrl: string;
}> {
  const subject = encodeURIComponent(`[Hop-Map] Relatório Mensal - ${report.monthLabel} (${report.month})`);
  const bodyText = encodeURIComponent(formatEmailReportPlainText(report));
  const mailToUrl = `mailto:${report.recipientEmail}?subject=${subject}&body=${bodyText}`;

  // Update report status
  const updatedReport: MonthlyReport = {
    ...report,
    status: 'sent',
    sentAt: new Date().toISOString()
  };

  saveReportLocally(updatedReport);

  // Save record in Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'monthly_reports', `report_${report.month}`), {
        ...updatedReport,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Note updating report in Firestore:', e);
    }
  }

  return {
    success: true,
    message: `Relatório de ${report.monthLabel} preparado com sucesso para envio para ${report.recipientEmail}.`,
    mailToUrl
  };
}

/**
 * Automatically checks and dispatches the previous month's metrics report to cobeertaste@gmail.com on the 1st of each month.
 */
export async function checkAndAutoDispatchMonthlyReport(allSpots: Bar[]): Promise<MonthlyReport | null> {
  const now = new Date();
  
  // Calculate previous month key (e.g. if now is 2026-08, prev is 2026-07)
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const autoSentKey = `hop_monthly_report_auto_sent_${prevMonthKey}`;

  // Check if today is the 1st of the month
  const isFirstDayOfMonth = now.getDate() === 1;
  const alreadySent = localStorage.getItem(autoSentKey);

  if (isFirstDayOfMonth && !alreadySent) {
    console.log(`[Hop-Map Auto-Report] Dia 1 do mês detetado. A gerar e enviar relatório do mês anterior (${prevMonthKey}) para ${OFFICIAL_REPORT_EMAIL}...`);
    try {
      const report = await generateMonthlyReport(prevMonthKey, allSpots);
      await sendMonthlyReportEmail(report);
      localStorage.setItem(autoSentKey, new Date().toISOString());
      console.log(`[Hop-Map Auto-Report] ✅ Relatório mensal (${prevMonthKey}) registado e enviado para ${OFFICIAL_REPORT_EMAIL}.`);
      return report;
    } catch (e) {
      console.error('[Hop-Map Auto-Report] Erro ao enviar relatório automático:', e);
      return null;
    }
  }

  return null;
}

