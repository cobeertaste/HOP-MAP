/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, RefreshCw, Download, Send, Check, 
  Search, Award, Eye, Share2, Navigation, 
  MapPin, Calendar, FileText, ExternalLink, Sparkles,
  Beer, Heart, DollarSign, Wallet, Layers, ChevronDown, ChevronUp
} from 'lucide-react';
import { Bar, MonthlyReport } from '../types';
import { 
  generateMonthlyReport, 
  sendMonthlyReportEmail, 
  getCurrentMonthKey, 
  getMonthLabel, 
  OFFICIAL_REPORT_EMAIL,
  isAdminUser,
  formatEmailReportHtml,
  formatEmailReportPlainText
} from '../lib/analytics';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allSpots: Bar[];
  userEmail?: string;
  isAdmin?: boolean;
  lang: 'PT' | 'EN';
  darkMode: boolean;
}

export default function MonthlyReportModal({
  isOpen,
  onClose,
  allSpots,
  userEmail,
  isAdmin,
  lang,
  darkMode
}: MonthlyReportModalProps) {
  const isAuthorizedAdmin = isAdmin ?? isAdminUser(userEmail);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'checkins' | 'rewards' | 'views' | 'shares' | 'directions' | 'styles'>('checkins');
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [expandedSpotStyles, setExpandedSpotStyles] = useState<Record<string, boolean>>({});

  // Month selector options (Last 6 months)
  const monthOptions = React.useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      options.push({
        key,
        label: getMonthLabel(key)
      });
    }
    return options;
  }, []);

  // Fetch / Generate report only if authorized admin
  const loadReport = async (monthKey: string) => {
    if (!isAuthorizedAdmin) return;
    setIsLoading(true);
    try {
      const generated = await generateMonthlyReport(monthKey, allSpots);
      setReport(generated);
    } catch (e) {
      console.error('Error generating monthly report:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthorizedAdmin) {
      loadReport(selectedMonth);
    }
  }, [isOpen, selectedMonth, allSpots, isAuthorizedAdmin]);

  if (!isOpen || !isAuthorizedAdmin) return null;

  const toggleSpotStylesExpand = (spotId: string) => {
    setExpandedSpotStyles(prev => ({
      ...prev,
      [spotId]: !prev[spotId]
    }));
  };

  const handleSendReport = async () => {
    if (!report) return;
    try {
      const res = await sendMonthlyReportEmail(report);
      setSendSuccessMessage(
        lang === 'PT' 
          ? `✅ Relatório preparado para ${OFFICIAL_REPORT_EMAIL}! A abrir cliente de e-mail...` 
          : `✅ Report ready for ${OFFICIAL_REPORT_EMAIL}! Opening email client...`
      );
      window.location.href = res.mailToUrl;
      setTimeout(() => setSendSuccessMessage(null), 6000);
    } catch (e) {
      console.error('Error sending report:', e);
    }
  };

  const handleCopySummary = async () => {
    if (!report) return;
    try {
      const text = formatEmailReportPlainText(report);
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch (e) {
      console.warn('Clipboard copy error:', e);
    }
  };

  const handleExportCsv = () => {
    if (!report) return;
    const isPT = lang === 'PT';

    // 1. Spots Summary Table
    const headers = isPT 
      ? ['Spot ID', 'Nome do Spot', 'Check-ins', 'Prémios Conquistados', 'Estilos Consumidos (Resumo)', 'Visitas à Ficha', 'Partilhas Sociais', 'Cliques GPS/Como Chegar']
      : ['Spot ID', 'Spot Name', 'Check-ins', 'Rewards Claimed', 'Consumed Styles (Summary)', 'Listing Views', 'Social Shares', 'GPS/Directions Clicks'];

    const rows = report.spotsBreakdown.map(s => {
      const stylesSummary = s.consumedStyles && Object.keys(s.consumedStyles).length > 0
        ? Object.entries(s.consumedStyles).map(([st, cnt]) => `${st} (${cnt})`).join('; ')
        : (isPT ? 'Nenhum registado' : 'None logged');

      return [
        `"${s.spotId}"`,
        `"${s.spotName.replace(/"/g, '""')}"`,
        s.checkins,
        s.rewards,
        `"${stylesSummary.replace(/"/g, '""')}"`,
        s.views,
        s.shares,
        s.directions
      ];
    });

    // 2. Global Beer Styles
    const styleHeaders = isPT 
      ? ['Estilo de Cerveja', 'Consumos Globais no Mês']
      : ['Beer Style', 'Global Monthly Consumptions'];
    const styleRows = (report.topBeerStyles || []).map(bs => [
      `"${bs.style.replace(/"/g, '""')}"`,
      bs.count
    ]);

    // 3. Detailed Beer Styles per Spot
    const spotStyleHeaders = isPT
      ? ['Spot ID', 'Nome do Spot', 'Estilo de Cerveja', 'Quantidade Consumida no Local']
      : ['Spot ID', 'Spot Name', 'Beer Style', 'Quantity Consumed at Spot'];
    
    const spotStyleRows: string[][] = [];
    report.spotsBreakdown.forEach(s => {
      if (s.consumedStyles && Object.keys(s.consumedStyles).length > 0) {
        Object.entries(s.consumedStyles).forEach(([st, cnt]) => {
          spotStyleRows.push([
            `"${s.spotId}"`,
            `"${s.spotName.replace(/"/g, '""')}"`,
            `"${st.replace(/"/g, '""')}"`,
            cnt.toString()
          ]);
        });
      }
    });

    // 4. Donations Breakdown
    const donationHeaders = isPT
      ? ['Doador (Nome/Nickname)', 'Valor (€)', 'Método de Pagamento', 'Data', 'Estado']
      : ['Donor (Name/Nickname)', 'Amount (€)', 'Payment Method', 'Date', 'Status'];
    const donationRows = (report.donationsBreakdown || []).map(d => [
      `"${d.donorName.replace(/"/g, '""')}"`,
      Number(d.amount).toFixed(2),
      `"${d.paymentMethod}"`,
      `"${new Date(d.timestamp).toLocaleString('pt-PT')}"`,
      `"${d.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
      `"${isPT ? 'Relatório Mensal Hop-Map' : 'Hop-Map Monthly Report'}: ${report.monthLabel}"`,
      `"${isPT ? 'Destinatário Oficial' : 'Official Recipient'}: ${report.recipientEmail}"`,
      `"${isPT ? 'Gerado em' : 'Generated on'}: ${new Date(report.generatedAt).toLocaleString(isPT ? 'pt-PT' : 'en-US')}"`,
      `"${isPT ? 'Total Doações' : 'Total Donations'}: ${(report.totalDonationsAmount || 0).toFixed(2)} € (${report.totalDonationsCount || 0} ${isPT ? 'apoios' : 'donations'})"`,
      '',
      isPT ? '--- ESTILOS DE CERVEJA DETALHADOS POR LOCAL (SPOTS) ---' : '--- DETAILED BEER STYLES PER SPOT (VENUE) ---',
      spotStyleHeaders.join(','),
      ...(spotStyleRows.length > 0 ? spotStyleRows.map(r => r.join(',')) : [`"${isPT ? 'Sem estilos consumidos por spot' : 'No spot beer styles recorded'}",0`]),
      '',
      isPT ? '--- ESTILOS DE CERVEJA GLOBAIS (CHECK-INS) ---' : '--- GLOBAL BEER STYLES (CHECK-INS) ---',
      styleHeaders.join(','),
      ...(styleRows.length > 0 ? styleRows.map(r => r.join(',')) : [`"${isPT ? 'Sem estilos registados neste mês' : 'No beer styles recorded this month'}",0`]),
      '',
      isPT ? '--- MÉTRICAS POR LOCAL (SPOTS) ---' : '--- METRICS PER SPOT (VENUES) ---',
      headers.join(','),
      ...rows.map(r => r.join(',')),
      '',
      isPT ? '--- APOIOS E DOAÇÕES RECEBIDAS (BUY US A BEER) ---' : '--- DONATIONS & COMMUNITY SUPPORTS (BUY US A BEER) ---',
      donationHeaders.join(','),
      ...(donationRows.length > 0 ? donationRows.map(r => r.join(',')) : [`"${isPT ? 'Sem doações registadas neste mês' : 'No donations recorded this month'}"`])
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hopmap_relatorio_${report.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to count total consumed styles for sorting
  const getTotalStylesForSpot = (s: any) => {
    if (!s.consumedStyles) return 0;
    return Object.values(s.consumedStyles as Record<string, number>).reduce((acc, c) => acc + (Number(c) || 0), 0);
  };

  // Filtered and sorted spots
  const filteredSpots = report ? report.spotsBreakdown
    .filter(s => s.spotName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'styles') {
        return getTotalStylesForSpot(b) - getTotalStylesForSpot(a);
      }
      return (b[sortBy] || 0) - (a[sortBy] || 0);
    })
    : [];

  // Spots that have consumed beer styles recorded
  const spotsWithBeerStyles = report ? report.spotsBreakdown.filter(s => s.consumedStyles && Object.keys(s.consumedStyles).length > 0) : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[280] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className={`relative w-full max-w-3xl my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
            darkMode ? 'bg-zinc-950 border-amber-500/30 text-white' : 'bg-neutral-900 border-amber-500/40 text-white'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-black flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-black text-amber-400 flex items-center justify-center font-black shadow-inner">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider font-display">
                  {lang === 'PT' ? 'MÉTRICAS & RELATÓRIO MENSAL' : 'METRICS & MONTHLY REPORT'}
                </h2>
                <p className="text-[10px] font-bold text-black/80 font-mono">
                  {lang === 'PT' ? 'Destinatário Oficial:' : 'Official Recipient:'} <strong className="underline">{OFFICIAL_REPORT_EMAIL}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-black bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black flex items-center justify-center transition cursor-pointer shadow-md"
              id="btn-close-monthly-report"
              title={lang === 'PT' ? 'Fechar' : 'Close'}
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* Sub-header controls (Month Selector, Refresh, Send, Export) */}
          <div className="p-4 bg-neutral-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-neutral-800 border border-white/15 text-amber-400 text-xs font-bold font-mono rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400 cursor-pointer"
                id="select-report-month"
              >
                {monthOptions.map(opt => (
                  <option key={opt.key} value={opt.key} className="bg-neutral-900 text-white">
                    {opt.label} ({opt.key})
                  </option>
                ))}
              </select>

              <button
                onClick={() => loadReport(selectedMonth)}
                disabled={isLoading}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition cursor-pointer"
                title={lang === 'PT' ? 'Atualizar dados do mês' : 'Refresh monthly data'}
                id="btn-refresh-report"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold border border-white/10 flex items-center gap-1 transition cursor-pointer"
                id="btn-copy-report-summary"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5 text-amber-400" />}
                <span>{copiedSummary ? (lang === 'PT' ? 'Copiado!' : 'Copied!') : (lang === 'PT' ? 'Copiar Texto' : 'Copy Text')}</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold border border-white/10 flex items-center gap-1 transition cursor-pointer"
                id="btn-export-report-csv"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'PT' ? 'Exportar CSV' : 'Export CSV'}</span>
              </button>

              <button
                onClick={handleSendReport}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider font-display flex items-center gap-1.5 shadow-md transition cursor-pointer"
                id="btn-send-report-email"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'PT' ? 'Enviar para cobeertaste@gmail.com' : 'Send to cobeertaste@gmail.com'}</span>
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {sendSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold text-center"
            >
              {sendSuccessMessage}
            </motion.div>
          )}

          {/* Scrollable Report Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                <p className="text-xs text-neutral-400 font-mono">
                  {lang === 'PT' ? 'A consolidar métricas do mês...' : 'Aggregating monthly metrics...'}
                </p>
              </div>
            ) : report ? (
              <>
                {/* 1. KPI SUMMARY CARDS */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-1.5 font-display">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'PT' ? `Resumo Global de Métricas (${report.monthLabel})` : `Global Metrics Summary (${report.monthLabel})`}</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    <div className="p-3 rounded-2xl bg-neutral-900 border border-white/10 text-center space-y-1">
                      <div className="text-2xl font-black text-amber-400 font-mono">{report.totalCheckins}</div>
                      <div className="text-[9px] uppercase font-bold text-neutral-400">{lang === 'PT' ? 'Total Check-ins' : 'Total Check-ins'}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-neutral-900 border border-white/10 text-center space-y-1">
                      <div className="text-2xl font-black text-emerald-400 font-mono">{report.totalRewards}</div>
                      <div className="text-[9px] uppercase font-bold text-neutral-400">{lang === 'PT' ? 'Prémios Conquistados' : 'Rewards Claimed'}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-neutral-900 border border-white/10 text-center space-y-1">
                      <div className="text-2xl font-black text-sky-400 font-mono">{report.totalViews}</div>
                      <div className="text-[9px] uppercase font-bold text-neutral-400">{lang === 'PT' ? 'Visitas às Fichas' : 'Listing Views'}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-neutral-900 border border-white/10 text-center space-y-1">
                      <div className="text-2xl font-black text-purple-400 font-mono">{report.totalShares}</div>
                      <div className="text-[9px] uppercase font-bold text-neutral-400">{lang === 'PT' ? 'Partilhas Sociais' : 'Social Shares'}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-neutral-900 border border-white/10 text-center space-y-1">
                      <div className="text-2xl font-black text-rose-400 font-mono">{report.totalDirections}</div>
                      <div className="text-[9px] uppercase font-bold text-neutral-400">{lang === 'PT' ? 'Cliques GPS / Rota' : 'GPS / Route Clicks'}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-center space-y-1 col-span-2 sm:col-span-1">
                      <div className="text-2xl font-black text-amber-400 font-mono">{(report.totalDonationsAmount || 0).toFixed(2)} €</div>
                      <div className="text-[9px] uppercase font-bold text-neutral-300">
                        {lang === 'PT' ? `Doações (${report.totalDonationsCount || 0})` : `Donations (${report.totalDonationsCount || 0})`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1.5. DONATIONS & SUPPORT LIST (Buy us a Beer) */}
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5 font-display">
                      <Beer className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'PT' ? 'Apoios & Doações da Comunidade ("Buy us a Beer")' : 'Community Support & Donations ("Buy us a Beer")'}</span>
                    </h3>
                    <span className="text-[10px] text-amber-400/90 font-mono font-bold">
                      {lang === 'PT' ? 'Total:' : 'Total:'} {(report.totalDonationsAmount || 0).toFixed(2)} €
                    </span>
                  </div>

                  {!report.donationsBreakdown || report.donationsBreakdown.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic py-2">
                      {lang === 'PT' ? 'Ainda não existem doações registadas neste mês.' : 'No donations recorded for this month yet.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {report.donationsBreakdown.map((d, idx) => (
                        <div 
                          key={d.id || idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-amber-500/15 text-xs"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-[11px] text-amber-400 shrink-0">
                              🍻
                            </span>
                            <div className="min-w-0">
                              <span className="font-extrabold truncate block text-neutral-200">{d.donorName}</span>
                              <span className="text-[10px] text-neutral-500 font-mono block">
                                {new Date(d.timestamp).toLocaleDateString(lang === 'PT' ? 'pt-PT' : 'en-US')} • {d.paymentMethod === 'mbway' ? 'MB WAY' : d.paymentMethod === 'revolut' ? 'Revolut' : d.paymentMethod === 'apple_google_pay' ? 'Apple/Google Pay' : 'Cartão/Stripe'}
                              </span>
                            </div>
                          </div>
                          <div className="font-mono text-emerald-400 font-black text-sm shrink-0 pl-2">
                            +{Number(d.amount).toFixed(2)} €
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. TOP USERS RANKING */}
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5 font-display">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'PT' ? 'Top Utilizadores com Mais Check-ins' : 'Top Users with Most Check-ins'}</span>
                    </h3>
                    <span className="text-[9px] text-neutral-400 font-mono">
                      {lang === 'PT' ? 'Ranking Mensal' : 'Monthly Ranking'}
                    </span>
                  </div>

                  {report.topUsers.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic py-2">
                      {lang === 'PT' ? 'Ainda não existem check-ins gravados neste mês.' : 'No check-ins recorded for this month yet.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {report.topUsers.map((u, idx) => (
                        <div 
                          key={u.userId}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              idx === 0 ? 'bg-amber-500 text-black' : idx === 1 ? 'bg-neutral-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-extrabold truncate">{u.username}</span>
                          </div>
                          <div className="flex items-center space-x-2 font-mono shrink-0">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                              {u.checkinsCount} {lang === 'PT' ? 'check-ins' : 'check-ins'}
                            </span>
                            {u.rewardsCount > 0 && (
                              <span className="text-emerald-400 text-[10px] font-bold" title={lang === 'PT' ? 'Prémios atribuídos' : 'Rewards claimed'}>
                                🎁 {u.rewardsCount}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2.5 GLOBAL TOP BEER STYLES CONSUMED */}
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5 font-display">
                      <Beer className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'PT' ? 'Estilos de Cerveja Mais Consumidos (Global)' : 'Most Consumed Beer Styles (Global)'}</span>
                    </h3>
                    <span className="text-[9px] text-amber-400/80 font-mono">
                      {lang === 'PT' ? 'Métricas Globais' : 'Global Metrics'}
                    </span>
                  </div>

                  {!report.topBeerStyles || report.topBeerStyles.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic py-2">
                      {lang === 'PT' ? 'Ainda não foram registados estilos de cerveja consumidos neste mês.' : 'No beer styles logged for this month yet.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {report.topBeerStyles.slice(0, 9).map((bs, idx) => (
                        <div
                          key={bs.style}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-amber-500/20 text-xs"
                        >
                          <div className="flex items-center space-x-2 min-w-0 pr-1">
                            <span className="text-xs text-amber-400">🍺</span>
                            <span className="font-bold truncate text-neutral-200">{bs.style}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold shrink-0">
                            {bs.count} {lang === 'PT' ? 'consumos' : 'drinks'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2.6 BEER STYLES CONSUMED PER SPOT (LOCAL) - PROMINENT CARD VIEW */}
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-amber-500/30 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5 font-display">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'PT' ? 'Estilos de Cerveja Consumidos por Local (Spot)' : 'Beer Styles Consumed per Spot (Venue)'}</span>
                    </h3>
                    <span className="text-[9px] text-amber-300 font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/25">
                      {spotsWithBeerStyles.length} {lang === 'PT' ? 'spots com registos' : 'spots with logs'}
                    </span>
                  </div>

                  {spotsWithBeerStyles.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic py-2">
                      {lang === 'PT' ? 'Ainda não foram registados estilos associados a locais neste mês. Os estilos surgem aqui à medida que os utilizadores concluem check-ins.' : 'No beer styles logged per spot yet this month. Styles will appear here as users check-in and record what they drank.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {spotsWithBeerStyles.map(s => {
                        const styleEntries: Array<[string, number]> = Object.entries(s.consumedStyles || {})
                          .map(([st, cnt]): [string, number] => [st, Number(cnt) || 0])
                          .sort((a, b) => b[1] - a[1]);
                        const totalSpotDrinks = styleEntries.reduce((acc, [, c]) => acc + c, 0);

                        return (
                          <div 
                            key={s.spotId} 
                            className="p-3 rounded-xl bg-black/60 border border-white/10 hover:border-amber-500/40 transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2 pb-1.5 border-b border-white/5">
                                <div>
                                  <h4 className="font-extrabold text-white text-xs">{s.spotName}</h4>
                                  <span className="text-[9px] text-neutral-400 font-mono">
                                    {s.checkins} {lang === 'PT' ? 'check-ins' : 'check-ins'} • {totalSpotDrinks} {lang === 'PT' ? 'cervejas registadas' : 'beers logged'}
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9.5px] font-mono font-bold shrink-0">
                                  📍 {s.spotId}
                                </span>
                              </div>

                              {/* Styles List */}
                              <div className="space-y-1.5">
                                {styleEntries.map(([st, cnt]) => {
                                  const pct = totalSpotDrinks > 0 ? Math.round((cnt / totalSpotDrinks) * 100) : 0;
                                  return (
                                    <div key={st} className="space-y-0.5">
                                      <div className="flex items-center justify-between text-[10px]">
                                        <span className="font-bold text-neutral-200 flex items-center gap-1">
                                          🍺 {st}
                                        </span>
                                        <span className="font-mono text-amber-400 font-extrabold">
                                          {cnt} <span className="text-neutral-500 font-normal text-[9px]">({pct}%)</span>
                                        </span>
                                      </div>
                                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                          className="bg-amber-400 h-full rounded-full transition-all duration-300"
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. DETAILED SPOTS BREAKDOWN TABLE */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5 font-display">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'PT' ? `Métricas Detalhadas por Spot (${filteredSpots.length} locais)` : `Detailed Metrics per Spot (${filteredSpots.length} venues)`}</span>
                    </h3>

                    {/* Search & Sort */}
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                        <input
                          type="text"
                          placeholder={lang === 'PT' ? 'Pesquisar spot...' : 'Search spot...'}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 pr-3 py-1 bg-neutral-800 border border-white/10 text-white text-xs rounded-xl focus:outline-none focus:border-amber-400 w-36 sm:w-48"
                        />
                      </div>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-neutral-800 border border-white/10 text-neutral-300 text-[10px] font-bold rounded-xl px-2.5 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="checkins">{lang === 'PT' ? 'Ord: Check-ins' : 'Sort: Check-ins'}</option>
                        <option value="styles">{lang === 'PT' ? 'Ord: Estilos Consumidos' : 'Sort: Consumed Styles'}</option>
                        <option value="rewards">{lang === 'PT' ? 'Ord: Prémios' : 'Sort: Rewards'}</option>
                        <option value="views">{lang === 'PT' ? 'Ord: Visitas' : 'Sort: Views'}</option>
                        <option value="shares">{lang === 'PT' ? 'Ord: Partilhas' : 'Sort: Shares'}</option>
                        <option value="directions">{lang === 'PT' ? 'Ord: GPS' : 'Sort: GPS'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Table Container */}
                  <div className="rounded-2xl border border-white/10 overflow-x-auto bg-neutral-900/90 shadow-inner">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-black/60 text-neutral-400 uppercase text-[9px] font-mono border-b border-white/10">
                          <th className="p-3">{lang === 'PT' ? 'Local (Spot)' : 'Spot (Venue)'}</th>
                          <th className="p-3">{lang === 'PT' ? 'Estilos Consumidos no Local' : 'Beer Styles Consumed at Spot'}</th>
                          <th className="p-3 text-center">{lang === 'PT' ? 'Check-ins' : 'Check-ins'}</th>
                          <th className="p-3 text-center">{lang === 'PT' ? 'Prémios' : 'Rewards'}</th>
                          <th className="p-3 text-center">{lang === 'PT' ? 'Visitas' : 'Views'}</th>
                          <th className="p-3 text-center">{lang === 'PT' ? 'Partilhas' : 'Shares'}</th>
                          <th className="p-3 text-center">{lang === 'PT' ? 'GPS / Rota' : 'GPS / Route'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans">
                        {filteredSpots.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-neutral-400 italic">
                              {lang === 'PT' ? 'Nenhum local encontrado com o termo pesquisado.' : 'No venue found with the search term.'}
                            </td>
                          </tr>
                        ) : (
                          filteredSpots.map(s => {
                            const stylesList = s.consumedStyles ? Object.entries(s.consumedStyles) : [];
                            const isExpanded = !!expandedSpotStyles[s.spotId];
                            const displayedStyles = isExpanded ? stylesList : stylesList.slice(0, 3);

                            return (
                              <tr key={s.spotId} className="hover:bg-white/5 transition">
                                <td className="p-3 font-bold text-white whitespace-nowrap">
                                  <div>{s.spotName}</div>
                                  <span className="text-[8px] text-neutral-500 font-mono">ID: {s.spotId}</span>
                                </td>

                                <td className="p-3 min-w-[200px]">
                                  {stylesList.length === 0 ? (
                                    <span className="text-[10px] text-neutral-500 italic">
                                      {lang === 'PT' ? 'Sem registos' : 'No logs'}
                                    </span>
                                  ) : (
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap gap-1">
                                        {displayedStyles.map(([st, cnt]) => (
                                          <span 
                                            key={st} 
                                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[8.5px] font-mono border border-amber-500/25"
                                          >
                                            🍺 {st} <strong className="ml-0.5 text-amber-200">({cnt})</strong>
                                          </span>
                                        ))}
                                      </div>
                                      {stylesList.length > 3 && (
                                        <button
                                          type="button"
                                          onClick={() => toggleSpotStylesExpand(s.spotId)}
                                          className="text-[8.5px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 cursor-pointer pt-0.5"
                                        >
                                          {isExpanded ? (
                                            <>
                                              <ChevronUp className="w-3 h-3" />
                                              <span>{lang === 'PT' ? 'Mostrar menos' : 'Show less'}</span>
                                            </>
                                          ) : (
                                            <>
                                              <ChevronDown className="w-3 h-3" />
                                              <span>{lang === 'PT' ? `+${stylesList.length - 3} mais estilos` : `+${stylesList.length - 3} more styles`}</span>
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>

                                <td className="p-3 text-center font-mono">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    s.checkins > 0 ? 'bg-amber-500/20 text-amber-400 font-black' : 'text-neutral-500'
                                  }`}>
                                    {s.checkins}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono">
                                  <span className={`text-[10px] font-bold ${s.rewards > 0 ? 'text-emerald-400 font-black' : 'text-neutral-500'}`}>
                                    {s.rewards > 0 ? `🎁 ${s.rewards}` : '0'}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono text-neutral-300">
                                  {s.views}
                                </td>
                                <td className="p-3 text-center font-mono text-neutral-300">
                                  {s.shares}
                                </td>
                                <td className="p-3 text-center font-mono text-neutral-300">
                                  {s.directions}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Automation info */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 flex items-start space-x-2">
                  <Mail className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <strong className="block">{lang === 'PT' ? 'Automação Mensal de Envio' : 'Monthly Dispatch Automation'}</strong>
                    {lang === 'PT' 
                      ? 'Este relatório consolida todas as métricas geradas pelos utilizadores da aplicação Hop-Map, incluindo todos os estilos de cerveja consumidos por local. Pode ser despachado a qualquer momento para '
                      : 'This report consolidates all user-generated metrics across the Hop-Map application, including all consumed beer styles per spot. It can be dispatched anytime to '}
                    <span className="underline font-bold text-white">cobeertaste@gmail.com</span>
                    {lang === 'PT' ? ' e é mantido no arquivo histórico do Firestore.' : ' and is stored in the historical Firestore archive.'}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
