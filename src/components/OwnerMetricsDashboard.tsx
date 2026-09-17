/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Store, Users, Award, Share2, Star, Clock, 
  Calendar, ArrowUpRight, ShieldCheck, RefreshCw,
  MessageSquare, Key, MapPin, Eye, Navigation, CheckCircle2
} from 'lucide-react';
import { Bar, UserProfile, OwnerSpotMonthlyMetrics } from '../types';
import { compileOwnerSpotMonthlyMetrics } from '../lib/ownerUtils';
import { getPreviousMonthKey, getMonthLabel, getDispatchDateLabel } from '../lib/dateUtils';
import { getSpotCheckinPin } from '../lib/spotPinUtils';

interface OwnerMetricsDashboardProps {
  spot: Bar;
  user: UserProfile;
  lang: 'PT' | 'EN';
  darkMode: boolean;
}

export default function OwnerMetricsDashboard({
  spot,
  user,
  lang,
  darkMode
}: OwnerMetricsDashboardProps) {
  const [metrics, setMetrics] = useState<OwnerSpotMonthlyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getPreviousMonthKey());

  const spotPin = getSpotCheckinPin(spot);

  const loadSpotMetrics = async (month?: string) => {
    setIsLoading(true);
    try {
      const data = await compileOwnerSpotMonthlyMetrics(spot.id, spot.name, month || selectedMonth);
      setMetrics(data);
    } catch (e) {
      console.warn('Notice compiling owner spot metrics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSpotMetrics(selectedMonth);
  }, [spot.id, selectedMonth]);

  const previousMonthLabel = getMonthLabel(selectedMonth);
  const dispatchLabel = getDispatchDateLabel(selectedMonth);

  return (
    <div className="space-y-4 font-sans text-left" id="owner-metrics-dashboard">
      {/* Spot Header Card */}
      <div className="p-4 sm:p-5 rounded-3xl border-2 border-zinc-700 bg-[#F6EFDC] text-zinc-900 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-700 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-zinc-700 flex items-center justify-center text-2xl shrink-0 select-none">
              🍻
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-display text-black uppercase tracking-wider">
                  {spot.name}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[9px] font-mono font-black border border-zinc-700">
                  PROPRIETÁRIO
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 flex items-center gap-1 mt-0.5 font-sans">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{spot.zone} {spot.address ? `• ${spot.address}` : ''}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-zinc-700 text-amber-900 text-xs font-mono font-bold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-700" />
              <span>PIN: <strong className="tracking-widest text-black">{spotPin}</strong></span>
            </div>
            <button
              onClick={() => loadSpotMetrics()}
              disabled={isLoading}
              className="p-1.5 rounded-xl border border-zinc-700 bg-white/70 hover:bg-white text-zinc-700 transition cursor-pointer"
              title={lang === 'PT' ? 'Atualizar Métricas' : 'Refresh Metrics'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-zinc-600 pt-0.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'PT' ? 'Gestão verificada por' : 'Verified management by'} <strong>{user.email}</strong></span>
          </div>
          <span className="font-mono text-[9.5px] bg-[#EFE6CC] px-2 py-0.5 rounded border border-zinc-700 text-zinc-700">
            ID: {spot.id}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Total Check-ins */}
        <div className="p-3.5 rounded-2xl border-2 border-zinc-700 bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider font-display">
            <span>{lang === 'PT' ? 'Total Check-ins' : 'Total Check-ins'}</span>
            <Users className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-black font-mono text-black">
            {metrics?.totalCheckins ?? 0}
          </div>
          <p className="text-[9.5px] text-zinc-500">
            {lang === 'PT' ? 'Visitas validadas por PIN' : 'PIN-verified visits'}
          </p>
        </div>

        {/* Visitantes Únicos */}
        <div className="p-3.5 rounded-2xl border-2 border-zinc-700 bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider font-display">
            <span>{lang === 'PT' ? 'Visitantes Únicos' : 'Unique Visitors'}</span>
            <Store className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-black font-mono text-black">
            {metrics?.uniqueVisitors ?? 0}
          </div>
          <p className="text-[9.5px] text-zinc-500">
            {lang === 'PT' ? 'Cervejeiros distintos' : 'Distinct craft lovers'}
          </p>
        </div>

        {/* HOPS Atribuídos */}
        <div className="p-3.5 rounded-2xl border-2 border-zinc-700 bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider font-display">
            <span>{lang === 'PT' ? 'HOPS Atribuídos' : 'HOPS Awarded'}</span>
            <Award className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-black font-mono text-amber-700">
            {metrics?.hopsAwarded ?? 0}
          </div>
          <p className="text-[9.5px] text-zinc-500">
            {lang === 'PT' ? 'Pontos gerados no spot' : 'Points earned at spot'}
          </p>
        </div>

        {/* Partilhas do Local */}
        <div className="p-3.5 rounded-2xl border-2 border-zinc-700 bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider font-display">
            <span>{lang === 'PT' ? 'Partilhas Sociais' : 'Social Shares'}</span>
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black font-mono text-black">
            {metrics?.totalShares ?? 0}
          </div>
          <p className="text-[9.5px] text-zinc-500">
            {lang === 'PT' ? 'Partilhas por clientes' : 'Shares by customers'}
          </p>
        </div>

        {/* Avaliação Média */}
        <div className="p-3.5 rounded-2xl border-2 border-zinc-700 bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider font-display">
            <span>{lang === 'PT' ? 'Avaliações' : 'Reviews'}</span>
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-xl font-black font-mono text-black flex items-center gap-1">
            <span>{metrics?.averageRating ?? 5.0}</span>
            <span className="text-xs text-amber-500">★</span>
          </div>
          <p className="text-[9.5px] text-zinc-500">
            {metrics?.ratingsCount ?? 0} {lang === 'PT' ? 'opiniões registadas' : 'registered reviews'}
          </p>
        </div>

        {/* Visualizações & Rotas GPS */}
        <div className="p-3.5 rounded-2xl border-2 border-zinc-700 bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider font-display">
            <span>{lang === 'PT' ? 'Visualizações' : 'Views & Routes'}</span>
            <Eye className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-black font-mono text-black">
            {(metrics?.totalViews ?? 0) + (metrics?.totalDirections ?? 0)}
          </div>
          <p className="text-[9.5px] text-zinc-500">
            {lang === 'PT' ? 'Fichas abertas & GPS' : 'Profiles opened & GPS'}
          </p>
        </div>
      </div>

      {/* Horários de Pico */}
      <div className="p-4 sm:p-5 rounded-3xl border-2 border-zinc-700 bg-[#F6EFDC] text-zinc-900 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-700 pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700" />
            <h4 className="text-xs font-black uppercase tracking-wider font-display text-black">
              {lang === 'PT' ? 'Horários de Maior Afluência (Pico)' : 'Peak Hours Distribution'}
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-900 border border-zinc-700 text-[9px] font-mono font-bold">
            {metrics?.peakHourRange || '18h - 21h'}
          </span>
        </div>

        <div className="space-y-2 pt-1 font-sans">
          {metrics?.hourlyBreakdown && metrics.hourlyBreakdown.length > 0 ? (
            metrics.hourlyBreakdown.map((item, idx) => {
              const isPeak = item.hourRange === metrics.peakHourRange && item.count > 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-700">
                    <span className={`font-medium ${isPeak ? 'font-black text-amber-900' : ''}`}>
                      {item.hourRange} {isPeak ? '🔥 (Pico)' : ''}
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-900">
                      {item.count} <span className="text-[10px] text-zinc-500 font-normal">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden border border-zinc-400">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isPeak ? 'bg-amber-500' : 'bg-zinc-700'
                      }`}
                      style={{ width: `${Math.max(item.percentage, item.count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-3 text-xs text-zinc-500">
              {lang === 'PT' ? 'A carregar dados de afluência...' : 'Loading attendance data...'}
            </div>
          )}
        </div>
      </div>

      {/* Resumo Estatístico Mensal (Anterior 1 a 30/31) */}
      <div className="p-4 sm:p-5 rounded-3xl border-2 border-zinc-700 bg-white text-zinc-900 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider font-display text-black">
                {lang === 'PT' ? 'Resumo Estatístico Mensal' : 'Monthly Statistical Summary'}
              </h4>
              <p className="text-[10px] text-zinc-500">
                {lang === 'PT' 
                  ? `Compilação de 1 a 30/31 do mês civil anterior (${previousMonthLabel})` 
                  : `Data from 1 to 30/31 of previous calendar month (${previousMonthLabel})`}
              </p>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-mono font-bold self-start sm:self-auto">
            {lang === 'PT' ? 'Relatório Oficial: Dia 1' : 'Official Report: Day 1'}
          </div>
        </div>

        {/* Detailed stats for previous month */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left pt-1">
          <div className="bg-[#FAF7F0] p-2.5 rounded-xl border border-zinc-200">
            <span className="text-[9px] uppercase font-bold text-zinc-500 block font-display">
              {lang === 'PT' ? 'Check-ins do Mês' : 'Month Check-ins'}
            </span>
            <span className="text-base font-black font-mono text-zinc-900 block mt-0.5">
              {metrics?.totalCheckins ?? 0}
            </span>
          </div>

          <div className="bg-[#FAF7F0] p-2.5 rounded-xl border border-zinc-200">
            <span className="text-[9px] uppercase font-bold text-zinc-500 block font-display">
              {lang === 'PT' ? 'Clientes Únicos' : 'Unique Clients'}
            </span>
            <span className="text-base font-black font-mono text-zinc-900 block mt-0.5">
              {metrics?.uniqueVisitors ?? 0}
            </span>
          </div>

          <div className="bg-[#FAF7F0] p-2.5 rounded-xl border border-zinc-200">
            <span className="text-[9px] uppercase font-bold text-zinc-500 block font-display">
              {lang === 'PT' ? 'Horário de Pico' : 'Top Peak Hour'}
            </span>
            <span className="text-xs font-bold font-mono text-amber-800 block mt-1 truncate">
              {metrics?.peakHourRange.split(' ')[0] || '19h'}
            </span>
          </div>

          <div className="bg-[#FAF7F0] p-2.5 rounded-xl border border-zinc-200">
            <span className="text-[9px] uppercase font-bold text-zinc-500 block font-display">
              {lang === 'PT' ? 'HOPS Distribuídos' : 'HOPS Distributed'}
            </span>
            <span className="text-base font-black font-mono text-amber-700 block mt-0.5">
              {metrics?.hopsAwarded ?? 0}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-zinc-700 text-[10.5px] text-zinc-700 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            {lang === 'PT' ? (
              <>
                Os dados consolidados de <strong>{previousMonthLabel}</strong> são compilados no dia <strong>{dispatchLabel}</strong> para o relatório executivo oficial do HOP MAP.
              </>
            ) : (
              <>
                Consolidated metrics for <strong>{previousMonthLabel}</strong> are compiled on <strong>{dispatchLabel}</strong> for the official HOP MAP executive report.
              </>
            )}
          </div>
        </div>
      </div>

      {/* Avaliações e Opiniões do Local */}
      <div className="p-4 sm:p-5 rounded-3xl border-2 border-zinc-700 bg-[#F6EFDC] text-zinc-900 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-700 pb-2.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-700" />
            <h4 className="text-xs font-black uppercase tracking-wider font-display text-black">
              {lang === 'PT' ? 'Avaliações e Opiniões dos Clientes' : 'Customer Reviews & Feedback'}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-zinc-600 font-bold">
            {metrics?.reviews.length || 0} {lang === 'PT' ? 'opiniões' : 'reviews'}
          </span>
        </div>

        {metrics?.reviews && metrics.reviews.length > 0 ? (
          <div className="space-y-2.5 pt-1">
            {metrics.reviews.slice(0, 8).map((rev) => (
              <div
                key={rev.id}
                className="p-3 rounded-2xl border border-zinc-700 bg-white space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold font-display text-zinc-900">{rev.userName}</span>
                    {rev.beerStyleReviewed && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[9px] font-medium border border-amber-300">
                        {rev.beerStyleReviewed}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-500 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < rev.rating ? 'opacity-100' : 'opacity-25'}>
                          ★
                        </span>
                      ))}
                    </div>
                    {rev.date && (
                      <span className="text-[9px] text-zinc-400 font-mono ml-1">{rev.date}</span>
                    )}
                  </div>
                </div>

                {rev.comment ? (
                  <p className="text-[11px] text-zinc-700 leading-relaxed italic bg-[#FAF7F0] p-2 rounded-xl border border-zinc-200">
                    "{rev.comment}"
                  </p>
                ) : (
                  <p className="text-[10px] text-zinc-400 italic">
                    {lang === 'PT' ? 'Classificação atribuída sem texto adicional.' : 'Rating submitted without comment.'}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-zinc-500 space-y-1 bg-white/40 rounded-2xl border border-dashed border-zinc-300">
            <p className="font-bold text-zinc-700">
              {lang === 'PT' ? 'Ainda sem avaliações escritas para este spot' : 'No written reviews yet for this spot'}
            </p>
            <p className="text-[10px]">
              {lang === 'PT' ? 'As opiniões e notas deixadas pelos cervejeiros surgirão aqui.' : 'Feedback left by craft beer lovers will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
