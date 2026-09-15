/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Mail, RefreshCw, Download, Send, Check, 
  Search, Award, Eye, Share2, Navigation, 
  MapPin, Calendar, FileText, Sparkles,
  Beer, Layers, ChevronDown, ChevronUp,
  LayoutDashboard, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { Bar, MonthlyReport } from '../types';
import { 
  generateMonthlyReport, 
  sendMonthlyReportEmail, 
  getCurrentMonthKey, 
  getMonthLabel, 
  getDispatchDateLabel,
  getAvailableReportMonths,
  METRICS_START_MONTH,
  OFFICIAL_REPORT_EMAIL,
  isAdminUser,
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

type TabKey = 'summary' | 'styles' | 'spots';

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
  // Month selector options (Strictly starts from August 2026 / METRICS_START_MONTH)
  const monthOptions = useMemo(() => {
    return getAvailableReportMonths();
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const cur = getCurrentMonthKey();
    return cur >= METRICS_START_MONTH ? cur : METRICS_START_MONTH;
  });
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'checkins' | 'rewards' | 'views' | 'shares' | 'directions' | 'styles'>('checkins');
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [expandedSpotStyles, setExpandedSpotStyles] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch / Generate report fast with low memory overhead
  const loadReport = async (monthKey: string, forceRefresh = false) => {
    if (!isAuthorizedAdmin) return;
    setIsLoading(true);
    try {
      const generated = await generateMonthlyReport(monthKey, allSpots, forceRefresh);
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

  // Reset page when filter or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, activeTab]);

  // Helper to count total consumed styles for sorting
  const getTotalStylesForSpot = (s: any) => {
    if (!s.consumedStyles) return 0;
    return Object.values(s.consumedStyles as Record<string, number>).reduce((acc, c) => acc + (Number(c) || 0), 0);
  };

  // Filtered and sorted spots (memoized for performance)
  const filteredSpots = useMemo(() => {
    if (!report) return [];
    return report.spotsBreakdown
      .filter(s => s.spotName.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'styles') {
          return getTotalStylesForSpot(b) - getTotalStylesForSpot(a);
        }
        return (b[sortBy] || 0) - (a[sortBy] || 0);
      });
  }, [report, searchTerm, sortBy]);

  // Paginated spots for ultra-lightweight DOM rendering
  const totalPages = Math.max(1, Math.ceil(filteredSpots.length / itemsPerPage));
  const paginatedSpots = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSpots.slice(start, start + itemsPerPage);
  }, [filteredSpots, currentPage, itemsPerPage]);

  // Spots that have consumed beer styles recorded
  const spotsWithBeerStyles = useMemo(() => {
    if (!report) return [];
    return report.spotsBreakdown.filter(s => s.consumedStyles && Object.keys(s.consumedStyles).length > 0);
  }, [report]);

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

  return (
    <div className="fixed inset-0 z-[280] flex items-center justify-center p-2 sm:p-4 bg-black/80 overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl my-auto rounded-2xl border-2 border-[#1B2036] bg-[#1B2036] text-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        id="modal-admin-monthly-report"
      >
        {/* Header - Retro Hop-Map Style */}
        <div className="px-4 py-3 bg-[#F2A93B] text-[#1B2036] flex items-center justify-between shrink-0 border-b-2 border-[#1B2036]">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#1B2036] text-[#F2A93B] flex items-center justify-center font-black shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider font-display truncate">
                  {lang === 'PT' ? 'Métricas & Relatório Mensal' : 'Metrics & Monthly Report'}
                </h2>
                <span className="px-1.5 py-0.2 rounded bg-[#1B2036] text-[#F2A93B] text-[8px] font-mono font-bold">
                  FAST MODE
                </span>
              </div>
              <p className="text-[9.5px] font-bold text-[#1B2036]/90 font-mono truncate">
                {lang === 'PT' ? 'Admin:' : 'Admin:'} <span className="underline">cobeertaste@gmail.com</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border-2 border-[#1B2036] bg-[#EFE6CC] hover:bg-white text-[#1B2036] flex items-center justify-center transition cursor-pointer shadow-sm shrink-0"
            id="btn-close-monthly-report"
            title={lang === 'PT' ? 'Fechar' : 'Close'}
          >
            <X className="w-4 h-4 text-[#1B2036] stroke-[2.5]" />
          </button>
        </div>

        {/* Action Bar & Month Selector */}
        <div className="p-2.5 sm:p-3 bg-[#131728] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-[#F2A93B]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#1B2036] border border-white/20 text-[#F2A93B] text-xs font-bold font-mono rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#F2A93B] cursor-pointer"
              id="select-report-month"
            >
              {monthOptions.map(opt => (
                <option key={opt.key} value={opt.key} className="bg-[#1B2036] text-white">
                  {opt.label} ({opt.key}) {opt.isCurrent ? (lang === 'PT' ? '• Mês em curso' : '• Current month') : (lang === 'PT' ? '• Mês completo' : '• Full month')}
                </option>
              ))}
            </select>

            <button
              onClick={() => loadReport(selectedMonth, true)}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition cursor-pointer"
              title={lang === 'PT' ? 'Recarregar dados frescos' : 'Reload fresh data'}
              id="btn-refresh-report"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#F2A93B]' : ''}`} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleCopySummary}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[9.5px] font-bold border border-white/10 flex items-center gap-1 transition cursor-pointer"
              id="btn-copy-report-summary"
            >
              {copiedSummary ? <Check className="w-3 h-3 text-emerald-400" /> : <FileText className="w-3 h-3 text-[#F2A93B]" />}
              <span>{copiedSummary ? (lang === 'PT' ? 'Copiado!' : 'Copied!') : (lang === 'PT' ? 'Copiar Texto' : 'Copy Text')}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[9.5px] font-bold border border-white/10 flex items-center gap-1 transition cursor-pointer"
              id="btn-export-report-csv"
            >
              <Download className="w-3 h-3 text-[#F2A93B]" />
              <span>{lang === 'PT' ? 'Exportar CSV' : 'Export CSV'}</span>
            </button>

            <button
              onClick={handleSendReport}
              className="px-3 py-1.5 rounded-lg bg-[#F2A93B] hover:bg-[#e0982d] text-[#1B2036] text-[9.5px] font-black uppercase tracking-wider font-display flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              id="btn-send-report-email"
            >
              <Send className="w-3 h-3" />
              <span>{lang === 'PT' ? 'Enviar p/ cobeertaste@gmail.com' : 'Send to cobeertaste@gmail.com'}</span>
            </button>
          </div>
        </div>

        {/* Automated Schedule & Timeline Status Banner */}
        <div className="px-3.5 py-2 bg-[#171C30] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold border border-amber-500/20 flex items-center gap-1">
              <span>📅 Início:</span>
              <span>Agosto de 2026</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold border border-blue-500/20 flex items-center gap-1">
              <span>✉️ Envio Automático:</span>
              <span>Dia 1 do mês seguinte p/ {OFFICIAL_REPORT_EMAIL}</span>
            </span>
          </div>
          <div className="text-neutral-300 font-mono text-[9.5px]">
            {selectedMonth === getCurrentMonthKey() ? (
              <span className="text-amber-400 font-bold">
                ⏳ {getMonthLabel(selectedMonth)} (em curso) ➔ Envio agendado para {getDispatchDateLabel(selectedMonth)}
              </span>
            ) : (
              <span className="text-emerald-400 font-bold">
                ✅ {getMonthLabel(selectedMonth)} (mês completo) ➔ Envio agendado/efetuado: {getDispatchDateLabel(selectedMonth)}
              </span>
            )}
          </div>
        </div>

        {/* Lightweight Segmented Navigation (Tabs) for Instant Loading & Minimal DOM */}
        <div className="flex items-center px-3 pt-2 bg-[#131728] border-b border-white/10 gap-1 overflow-x-auto select-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-t-lg text-xs font-extrabold flex items-center gap-1.5 border-t border-x transition cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-[#1B2036] text-[#F2A93B] border-white/15'
                : 'bg-transparent text-neutral-400 hover:text-white border-transparent'
            }`}
            id="tab-btn-summary"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{lang === 'PT' ? 'Resumo & Doações' : 'Summary & Donations'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('styles')}
            className={`px-3 py-1.5 rounded-t-lg text-xs font-extrabold flex items-center gap-1.5 border-t border-x transition cursor-pointer ${
              activeTab === 'styles'
                ? 'bg-[#1B2036] text-[#F2A93B] border-white/15'
                : 'bg-transparent text-neutral-400 hover:text-white border-transparent'
            }`}
            id="tab-btn-styles"
          >
            <Beer className="w-3.5 h-3.5" />
            <span>{lang === 'PT' ? 'Estilos de Cerveja' : 'Beer Styles'}</span>
            {report?.topBeerStyles && report.topBeerStyles.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#F2A93B]/20 text-[#F2A93B] text-[9px] font-mono">
                {report.topBeerStyles.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spots')}
            className={`px-3 py-1.5 rounded-t-lg text-xs font-extrabold flex items-center gap-1.5 border-t border-x transition cursor-pointer ${
              activeTab === 'spots'
                ? 'bg-[#1B2036] text-[#F2A93B] border-white/15'
                : 'bg-transparent text-neutral-400 hover:text-white border-transparent'
            }`}
            id="tab-btn-spots"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{lang === 'PT' ? 'Métricas por Spot' : 'Spot Metrics'}</span>
            {report && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#F2A93B]/20 text-[#F2A93B] text-[9px] font-mono">
                {filteredSpots.length}
              </span>
            )}
          </button>
        </div>

        {/* Feedback banner */}
        {sendSuccessMessage && (
          <div className="px-3 py-1.5 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
            {sendSuccessMessage}
          </div>
        )}

        {/* Report Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-3 border-[#F2A93B] border-t-transparent animate-spin" />
              <p className="text-xs text-neutral-400 font-mono">
                {lang === 'PT' ? 'A consolidar métricas do mês...' : 'Aggregating monthly metrics...'}
              </p>
            </div>
          ) : report ? (
            <>
              {/* TAB 1: SUMMARY & DONATIONS */}
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  {/* 1. Global KPI Cards */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#F2A93B] flex items-center gap-1.5 font-display">
                        <Sparkles className="w-3.5 h-3.5 text-[#F2A93B]" />
                        <span>{lang === 'PT' ? `Resumo Global de Métricas (${report.monthLabel})` : `Global Metrics Summary (${report.monthLabel})`}</span>
                      </h3>
                      <span className="text-[9px] text-neutral-400 font-mono">
                        {new Date(report.generatedAt).toLocaleDateString(lang === 'PT' ? 'pt-PT' : 'en-US')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      <div className="p-2.5 rounded-xl bg-[#131728] border border-white/10 text-center">
                        <div className="text-xl font-black text-[#F2A93B] font-mono">{report.totalCheckins}</div>
                        <div className="text-[9px] uppercase font-bold text-neutral-400 mt-0.5">{lang === 'PT' ? 'Total Check-ins' : 'Total Check-ins'}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#131728] border border-white/10 text-center">
                        <div className="text-xl font-black text-emerald-400 font-mono">{report.totalRewards}</div>
                        <div className="text-[9px] uppercase font-bold text-neutral-400 mt-0.5">{lang === 'PT' ? 'Prémios Conquistados' : 'Rewards Claimed'}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#131728] border border-white/10 text-center">
                        <div className="text-xl font-black text-sky-400 font-mono">{report.totalViews}</div>
                        <div className="text-[9px] uppercase font-bold text-neutral-400 mt-0.5">{lang === 'PT' ? 'Visitas Fichas' : 'Listing Views'}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#131728] border border-white/10 text-center">
                        <div className="text-xl font-black text-purple-400 font-mono">{report.totalShares}</div>
                        <div className="text-[9px] uppercase font-bold text-neutral-400 mt-0.5">{lang === 'PT' ? 'Partilhas Sociais' : 'Social Shares'}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#131728] border border-white/10 text-center">
                        <div className="text-xl font-black text-rose-400 font-mono">{report.totalDirections}</div>
                        <div className="text-[9px] uppercase font-bold text-neutral-400 mt-0.5">{lang === 'PT' ? 'Cliques GPS' : 'GPS Clicks'}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F2A93B]/20 to-emerald-500/20 border border-[#F2A93B]/30 text-center col-span-2 sm:col-span-1">
                        <div className="text-xl font-black text-[#F2A93B] font-mono">{(report.totalDonationsAmount || 0).toFixed(2)} €</div>
                        <div className="text-[9px] uppercase font-bold text-neutral-300 mt-0.5">
                          {lang === 'PT' ? `Doações (${report.totalDonationsCount || 0})` : `Donations (${report.totalDonationsCount || 0})`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Donations & Support List ("Buy us a Beer") */}
                  <div className="p-3.5 rounded-xl bg-[#131728] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#F2A93B] flex items-center gap-1.5 font-display">
                        <Beer className="w-3.5 h-3.5 text-[#F2A93B]" />
                        <span>{lang === 'PT' ? 'Apoios & Doações da Comunidade ("Buy us a Beer")' : 'Community Support & Donations ("Buy us a Beer")'}</span>
                      </h3>
                      <span className="text-[10px] text-[#F2A93B] font-mono font-bold">
                        {lang === 'PT' ? 'Total:' : 'Total:'} {(report.totalDonationsAmount || 0).toFixed(2)} €
                      </span>
                    </div>

                    {!report.donationsBreakdown || report.donationsBreakdown.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic py-1">
                        {lang === 'PT' ? 'Ainda não existem doações registadas neste mês.' : 'No donations recorded for this month yet.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {report.donationsBreakdown.map((d, idx) => (
                          <div 
                            key={d.id || idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 text-xs"
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-[#F2A93B]/20 border border-[#F2A93B]/30 flex items-center justify-center font-bold text-[10px] text-[#F2A93B] shrink-0">
                                🍻
                              </span>
                              <div className="min-w-0">
                                <span className="font-extrabold truncate block text-neutral-200 text-[11px]">{d.donorName}</span>
                                <span className="text-[9px] text-neutral-500 font-mono block">
                                  {new Date(d.timestamp).toLocaleDateString(lang === 'PT' ? 'pt-PT' : 'en-US')} • {d.paymentMethod === 'mbway' ? 'MB WAY' : d.paymentMethod === 'revolut' ? 'Revolut' : d.paymentMethod === 'apple_google_pay' ? 'Apple/Google Pay' : 'Cartão/Stripe'}
                                </span>
                              </div>
                            </div>
                            <div className="font-mono text-emerald-400 font-black text-xs shrink-0 pl-1.5">
                              +{Number(d.amount).toFixed(2)} €
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Top Users Ranking */}
                  <div className="p-3.5 rounded-xl bg-[#131728] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#F2A93B] flex items-center gap-1.5 font-display">
                        <Award className="w-3.5 h-3.5 text-[#F2A93B]" />
                        <span>{lang === 'PT' ? 'Top Utilizadores com Mais Check-ins' : 'Top Users with Most Check-ins'}</span>
                      </h3>
                      <span className="text-[9px] text-neutral-400 font-mono">
                        {lang === 'PT' ? 'Ranking Mensal' : 'Monthly Ranking'}
                      </span>
                    </div>

                    {report.topUsers.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic py-1">
                        {lang === 'PT' ? 'Ainda não existem check-ins gravados neste mês.' : 'No check-ins recorded for this month yet.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {report.topUsers.map((u, idx) => (
                          <div 
                            key={u.userId}
                            className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 text-xs"
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                                idx === 0 ? 'bg-[#F2A93B] text-black' : idx === 1 ? 'bg-neutral-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-neutral-800 text-neutral-400'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className="font-extrabold truncate text-neutral-200 text-[11px]">{u.username}</span>
                            </div>
                            <div className="flex items-center space-x-1.5 font-mono shrink-0">
                              <span className="px-1.5 py-0.5 rounded bg-[#F2A93B]/20 text-[#F2A93B] text-[9.5px] font-bold">
                                {u.checkinsCount} {lang === 'PT' ? 'check-ins' : 'check-ins'}
                              </span>
                              {u.rewardsCount > 0 && (
                                <span className="text-emerald-400 text-[9.5px] font-bold" title={lang === 'PT' ? 'Prémios atribuídos' : 'Rewards claimed'}>
                                  🎁 {u.rewardsCount}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Automation Info */}
                  <div className="p-3 rounded-xl bg-[#F2A93B]/10 border border-[#F2A93B]/20 text-[10px] text-[#F2A93B] flex items-start space-x-2">
                    <Mail className="w-4 h-4 shrink-0 text-[#F2A93B] mt-0.5" />
                    <div>
                      <strong className="block font-bold">{lang === 'PT' ? 'Automação Mensal de Envio' : 'Monthly Dispatch Automation'}</strong>
                      {lang === 'PT' 
                        ? 'Este relatório consolida todas as métricas geradas pelos utilizadores da aplicação Hop-Map. Pode ser despachado a qualquer momento para '
                        : 'This report consolidates all user-generated metrics across the Hop-Map application. It can be dispatched anytime to '}
                      <span className="underline font-bold text-white">cobeertaste@gmail.com</span>.
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BEER STYLES */}
              {activeTab === 'styles' && (
                <div className="space-y-4">
                  {/* Global Beer Styles */}
                  <div className="p-3.5 rounded-xl bg-[#131728] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#F2A93B] flex items-center gap-1.5 font-display">
                        <Beer className="w-3.5 h-3.5 text-[#F2A93B]" />
                        <span>{lang === 'PT' ? 'Estilos de Cerveja Mais Consumidos (Global)' : 'Most Consumed Beer Styles (Global)'}</span>
                      </h3>
                      <span className="text-[9px] text-[#F2A93B]/80 font-mono">
                        {lang === 'PT' ? 'Métricas Globais' : 'Global Metrics'}
                      </span>
                    </div>

                    {!report.topBeerStyles || report.topBeerStyles.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic py-1">
                        {lang === 'PT' ? 'Ainda não foram registados estilos de cerveja consumidos neste mês.' : 'No beer styles logged for this month yet.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                        {report.topBeerStyles.map((bs) => (
                          <div
                            key={bs.style}
                            className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 text-xs"
                          >
                            <span className="font-bold truncate text-neutral-200 text-[10.5px] pr-1">🍺 {bs.style}</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#F2A93B]/20 text-[#F2A93B] text-[9.5px] font-mono font-bold shrink-0">
                              {bs.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Beer Styles Consumed per Spot */}
                  <div className="p-3.5 rounded-xl bg-[#131728] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#F2A93B] flex items-center gap-1.5 font-display">
                        <Layers className="w-3.5 h-3.5 text-[#F2A93B]" />
                        <span>{lang === 'PT' ? 'Estilos de Cerveja Consumidos por Local (Spot)' : 'Beer Styles Consumed per Spot (Venue)'}</span>
                      </h3>
                      <span className="text-[9px] text-[#F2A93B] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F2A93B]/15 border border-[#F2A93B]/25">
                        {spotsWithBeerStyles.length} {lang === 'PT' ? 'spots com registos' : 'spots with logs'}
                      </span>
                    </div>

                    {spotsWithBeerStyles.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic py-1">
                        {lang === 'PT' ? 'Ainda não foram registados estilos associados a locais neste mês.' : 'No beer styles logged per spot yet this month.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {spotsWithBeerStyles.map(s => {
                          const styleEntries: Array<[string, number]> = Object.entries(s.consumedStyles || {})
                            .map(([st, cnt]): [string, number] => [st, Number(cnt) || 0])
                            .sort((a, b) => b[1] - a[1]);
                          const totalSpotDrinks = styleEntries.reduce((acc, [, c]) => acc + c, 0);

                          return (
                            <div 
                              key={s.spotId} 
                              className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-1.5 mb-1.5 pb-1 border-b border-white/5">
                                  <div>
                                    <h4 className="font-extrabold text-white text-xs">{s.spotName}</h4>
                                    <span className="text-[9px] text-neutral-400 font-mono">
                                      {s.checkins} check-ins • {totalSpotDrinks} {lang === 'PT' ? 'cervejas' : 'beers'}
                                    </span>
                                  </div>
                                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[#F2A93B] text-[8.5px] font-mono font-bold shrink-0">
                                    📍 {s.spotId}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  {styleEntries.map(([st, cnt]) => {
                                    const pct = totalSpotDrinks > 0 ? Math.round((cnt / totalSpotDrinks) * 100) : 0;
                                    return (
                                      <div key={st} className="text-[9.5px]">
                                        <div className="flex items-center justify-between mb-0.5">
                                          <span className="font-bold text-neutral-300 truncate pr-1">🍺 {st}</span>
                                          <span className="font-mono text-[#F2A93B] font-extrabold shrink-0">
                                            {cnt} <span className="text-neutral-500 font-normal text-[8.5px]">({pct}%)</span>
                                          </span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                                          <div 
                                            className="bg-[#F2A93B] h-full rounded-full"
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
                </div>
              )}

              {/* TAB 3: SPOT METRICS (Table with Instant Search & Pagination) */}
              {activeTab === 'spots' && (
                <div className="space-y-3">
                  {/* Controls: Search, Sort, Page Count */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#F2A93B] flex items-center gap-1.5 font-display">
                        <MapPin className="w-3.5 h-3.5 text-[#F2A93B]" />
                        <span>{lang === 'PT' ? `Métricas Detalhadas por Spot` : `Detailed Metrics per Spot`}</span>
                      </h3>
                      <span className="text-[9px] text-neutral-400 font-mono">
                        ({filteredSpots.length} {lang === 'PT' ? 'locais' : 'venues'})
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-neutral-400" />
                        <input
                          type="text"
                          placeholder={lang === 'PT' ? 'Pesquisar spot...' : 'Search spot...'}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-7 pr-2.5 py-1 bg-[#131728] border border-white/10 text-white text-xs rounded-lg focus:outline-none focus:border-[#F2A93B] w-36 sm:w-44"
                        />
                      </div>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-[#131728] border border-white/10 text-neutral-300 text-[9.5px] font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-[#F2A93B] cursor-pointer"
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

                  {/* Fast Lightweight Table */}
                  <div className="rounded-xl border border-white/10 overflow-x-auto bg-[#131728]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-black/50 text-neutral-400 uppercase text-[8.5px] font-mono border-b border-white/10">
                          <th className="p-2.5">{lang === 'PT' ? 'Local (Spot)' : 'Spot (Venue)'}</th>
                          <th className="p-2.5">{lang === 'PT' ? 'Estilos Consumidos' : 'Beer Styles'}</th>
                          <th className="p-2.5 text-center">{lang === 'PT' ? 'Check-ins' : 'Check-ins'}</th>
                          <th className="p-2.5 text-center">{lang === 'PT' ? 'Prémios' : 'Rewards'}</th>
                          <th className="p-2.5 text-center">{lang === 'PT' ? 'Visitas' : 'Views'}</th>
                          <th className="p-2.5 text-center">{lang === 'PT' ? 'Partilhas' : 'Shares'}</th>
                          <th className="p-2.5 text-center">{lang === 'PT' ? 'GPS' : 'GPS'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {paginatedSpots.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-5 text-center text-neutral-400 italic">
                              {lang === 'PT' ? 'Nenhum local encontrado.' : 'No venue found.'}
                            </td>
                          </tr>
                        ) : (
                          paginatedSpots.map(s => {
                            const stylesList = s.consumedStyles ? Object.entries(s.consumedStyles) : [];
                            const isExpanded = !!expandedSpotStyles[s.spotId];
                            const displayedStyles = isExpanded ? stylesList : stylesList.slice(0, 2);

                            return (
                              <tr key={s.spotId} className="hover:bg-white/5 transition">
                                <td className="p-2.5 font-bold text-white whitespace-nowrap">
                                  <div className="text-[11px]">{s.spotName}</div>
                                  <span className="text-[8px] text-neutral-500 font-mono">ID: {s.spotId}</span>
                                </td>

                                <td className="p-2.5 min-w-[160px]">
                                  {stylesList.length === 0 ? (
                                    <span className="text-[9.5px] text-neutral-500 italic">
                                      {lang === 'PT' ? 'Sem registos' : 'No logs'}
                                    </span>
                                  ) : (
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap gap-1">
                                        {displayedStyles.map(([st, cnt]) => (
                                          <span 
                                            key={st} 
                                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-[#F2A93B]/15 text-[#F2A93B] text-[8px] font-mono"
                                          >
                                            🍺 {st} <strong className="ml-0.5 text-white">({cnt})</strong>
                                          </span>
                                        ))}
                                      </div>
                                      {stylesList.length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() => toggleSpotStylesExpand(s.spotId)}
                                          className="text-[8px] text-[#F2A93B] hover:underline font-bold flex items-center gap-0.5 cursor-pointer pt-0.5"
                                        >
                                          {isExpanded ? (
                                            <>
                                              <ChevronUp className="w-2.5 h-2.5" />
                                              <span>{lang === 'PT' ? 'Menos' : 'Less'}</span>
                                            </>
                                          ) : (
                                            <>
                                              <ChevronDown className="w-2.5 h-2.5" />
                                              <span>+{stylesList.length - 2}</span>
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>

                                <td className="p-2.5 text-center font-mono">
                                  <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                                    s.checkins > 0 ? 'bg-[#F2A93B]/20 text-[#F2A93B] font-black' : 'text-neutral-500'
                                  }`}>
                                    {s.checkins}
                                  </span>
                                </td>
                                <td className="p-2.5 text-center font-mono">
                                  <span className={`text-[9.5px] font-bold ${s.rewards > 0 ? 'text-emerald-400 font-black' : 'text-neutral-500'}`}>
                                    {s.rewards > 0 ? `🎁 ${s.rewards}` : '0'}
                                  </span>
                                </td>
                                <td className="p-2.5 text-center font-mono text-neutral-300 text-[10px]">
                                  {s.views}
                                </td>
                                <td className="p-2.5 text-center font-mono text-neutral-300 text-[10px]">
                                  {s.shares}
                                </td>
                                <td className="p-2.5 text-center font-mono text-neutral-300 text-[10px]">
                                  {s.directions}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-1 py-1 text-xs">
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {lang === 'PT' 
                          ? `Página ${currentPage} de ${totalPages} (${filteredSpots.length} spots)` 
                          : `Page ${currentPage} of ${totalPages} (${filteredSpots.length} spots)`}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-3 h-3" />
                          <span>{lang === 'PT' ? 'Anterior' : 'Previous'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>{lang === 'PT' ? 'Seguinte' : 'Next'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
