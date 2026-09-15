/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Key, RefreshCw, Copy, Check, Mail, 
  Search, ShieldCheck, Download, Sparkles, MapPin, 
  AlertTriangle, Filter, ExternalLink, Lock, CheckCircle2
} from 'lucide-react';
import { Bar } from '../types';
import { 
  fetchAllSpotPinsFromFirestore, 
  saveSpotPinToFirestore, 
  syncAndSeedAllSpotPins, 
  generateRandom4DigitPin,
  formatSpotPinsEmail,
  getSpotCheckinPin,
  playPinKeypadSound
} from '../lib/spotPinUtils';
import { OFFICIAL_REPORT_EMAIL, isAdminUser } from '../lib/analytics';
import { t } from '../lib/i18n';

interface AdminPinsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  allSpots: Bar[];
  userEmail?: string;
  isAdmin?: boolean;
  lang: 'PT' | 'EN';
  darkMode: boolean;
  onPinUpdated?: (spotId: string, newPin: string) => void;
}

export default function AdminPinsDashboardModal({
  isOpen,
  onClose,
  allSpots,
  userEmail,
  isAdmin,
  lang,
  darkMode,
  onPinUpdated
}: AdminPinsDashboardModalProps) {
  const isAuthorizedAdmin = isAdmin ?? isAdminUser(userEmail);
  const [pinsMap, setPinsMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingPin, setIsSavingPin] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [copiedSpotId, setCopiedSpotId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load all PINs from Firestore on open
  const loadAllPins = async () => {
    if (!isAuthorizedAdmin) return;
    setIsLoading(true);
    try {
      const pins = await fetchAllSpotPinsFromFirestore();
      // Ensure all spots have a pin in local view
      const merged: Record<string, string> = { ...pins };
      allSpots.forEach(spot => {
        if (!merged[spot.id]) {
          merged[spot.id] = getSpotCheckinPin(spot);
        }
      });
      setPinsMap(merged);
    } catch (err) {
      console.error('Error loading spot PINs from Firestore:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthorizedAdmin) {
      loadAllPins();
    }
  }, [isOpen, isAuthorizedAdmin, allSpots]);

  // Extract unique zones for quick filter
  const zonesList = useMemo(() => {
    const zones = new Set<string>();
    allSpots.forEach(s => {
      if (s.zone) zones.add(s.zone);
    });
    return Array.from(zones).sort();
  }, [allSpots]);

  // Filtered spots list
  const filteredSpots = useMemo(() => {
    return allSpots.filter(spot => {
      const matchesSearch = 
        spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesZone = selectedZone === 'all' || spot.zone === selectedZone;
      return matchesSearch && matchesZone;
    });
  }, [allSpots, searchTerm, selectedZone]);

  if (!isOpen || !isAuthorizedAdmin) return null;

  // Single spot PIN regeneration handler
  const handleRegeneratePin = async (spot: Bar) => {
    playPinKeypadSound(9);
    const newPin = generateRandom4DigitPin();
    setIsSavingPin(spot.id);
    
    // Update local state immediately
    setPinsMap(prev => ({ ...prev, [spot.id]: newPin }));

    const success = await saveSpotPinToFirestore(spot.id, spot.name, spot.zone, newPin);
    setIsSavingPin(null);

    if (onPinUpdated) {
      onPinUpdated(spot.id, newPin);
    }

    const notice = lang === 'PT'
      ? `PIN para "${spot.name}" alterado para [${newPin}] e guardado!`
      : `PIN for "${spot.name}" changed to [${newPin}] and saved!`;
    setActionNotice(notice);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // 1-Click Copy PIN
  const handleCopySinglePin = (spotId: string, pin: string) => {
    playPinKeypadSound(5);
    navigator.clipboard.writeText(pin);
    setCopiedSpotId(spotId);
    setTimeout(() => setCopiedSpotId(null), 2500);
  };

  // Sync / Seed missing PINs in Firestore
  const handleSyncMissingPins = async () => {
    playPinKeypadSound(1);
    setIsLoading(true);
    try {
      const updated = await syncAndSeedAllSpotPins(allSpots);
      setPinsMap(updated);
      const notice = lang === 'PT'
        ? 'Todos os PINs em falta foram gerados e sincronizados no Firestore!'
        : 'All missing PINs generated and synced in Firestore!';
      setActionNotice(notice);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      console.error('Error syncing PINs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy Complete formatted report to clipboard
  const handleCopyAllPins = () => {
    playPinKeypadSound(7);
    const { plainTextReport } = formatSpotPinsEmail(allSpots, pinsMap, lang);
    navigator.clipboard.writeText(plainTextReport);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
    const notice = lang === 'PT'
      ? 'Lista completa de PINs formatada e copiada para a área de transferência!'
      : 'Complete PINs list formatted and copied to clipboard!';
    setActionNotice(notice);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Send Email via mailto link
  const handleSendEmail = () => {
    playPinKeypadSound(8);
    const { mailtoUrl } = formatSpotPinsEmail(allSpots, pinsMap, lang);
    window.location.href = mailtoUrl;
    const notice = lang === 'PT'
      ? 'Cliente de e-mail aberto com o relatório para cobeertaste@gmail.com!'
      : 'Email client opened with report for cobeertaste@gmail.com!';
    setActionNotice(notice);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-5 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", duration: 0.35 }}
          className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border-4 shadow-2xl overflow-hidden z-10 ${
            darkMode 
              ? 'bg-[#0f0f13] border-amber-500/50 text-white shadow-amber-500/20' 
              : 'bg-neutral-50 border-amber-500 text-neutral-900 shadow-xl'
          }`}
          id="admin-pins-dashboard-modal"
        >
          {/* Top 8-Bit Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 border-b-4 border-black text-black shrink-0 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center border-2 border-white/40 shadow-inner">
                <Key className="w-5 h-5 text-amber-400 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase font-press-start">
                    {t('adminPinsDashboardTitle', lang)}
                  </h2>
                  <span className="bg-black text-amber-400 text-[8px] font-mono px-2 py-0.5 rounded font-black border border-amber-300">
                    MASTER
                  </span>
                </div>
                <p className="text-[10px] text-black/80 font-bold mt-0.5 leading-tight">
                  {t('adminPinsDashboardSubtitle', lang)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black flex items-center justify-center border-2 border-black transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
              title={lang === 'PT' ? 'Fechar' : 'Close'}
              id="btn-close-admin-pins"
            >
              <X className="w-5 h-5 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* Admin Context Banner & Quick Actions */}
          <div className="px-4 py-3 bg-black/40 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-2.5 text-[11px] shrink-0">
            <div className="flex items-center space-x-2 text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {lang === 'PT' ? 'Administrador Autenticado:' : 'Authenticated Admin:'} <strong className="text-amber-400 font-mono">cobeertaste@gmail.com</strong>
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400">
                {t('totalSpotsWithPins', lang)}: <strong className="text-white font-mono">{allSpots.length}</strong>
              </span>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSyncMissingPins}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 font-bold text-[10px] flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
                title={lang === 'PT' ? 'Gera PINs para spots sem código' : 'Generate PINs for spots without code'}
                id="btn-sync-missing-pins"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{t('generateAllMissingPins', lang)}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyAllPins}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-[10px] flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
                id="btn-copy-all-pins"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? (lang === 'PT' ? 'Copiado!' : 'Copied!') : t('copyAllPinsBtn', lang)}</span>
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] flex items-center space-x-1.5 transition active:scale-95 shadow-md font-display uppercase tracking-wider cursor-pointer border border-amber-300"
                id="btn-send-pins-email"
              >
                <Mail className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('sendPinsEmailBtn', lang)}</span>
              </button>
            </div>
          </div>

          {/* Action Notification Alert Bar */}
          <AnimatePresence>
            {actionNotice && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center justify-between shrink-0"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{actionNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActionNotice(null)}
                  className="text-emerald-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters & Search Toolbar */}
          <div className="p-3 sm:p-4 bg-black/20 border-b border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder={t('searchSpotsPlaceholder', lang)}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                id="input-search-pins"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Zone Filter */}
            <div className="flex items-center space-x-2 shrink-0">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                id="select-zone-pins"
              >
                <option value="all">{lang === 'PT' ? 'Todas as Cidades/Zonas' : 'All Cities/Zones'}</option>
                {zonesList.map(zone => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table / List of Spot PINs */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
            {filteredSpots.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto stroke-[1.5]" />
                <p className="text-xs font-bold font-display">
                  {lang === 'PT' ? 'Nenhum spot encontrado com este filtro.' : 'No spots found with this filter.'}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {lang === 'PT' ? 'Tenta alterar o termo de pesquisa ou a zona selecionada.' : 'Try changing your search term or selected zone.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredSpots.map((spot) => {
                  const currentPin = pinsMap[spot.id] || getSpotCheckinPin(spot);
                  const isCopied = copiedSpotId === spot.id;
                  const isRegenerating = isSavingPin === spot.id;

                  return (
                    <motion.div
                      key={spot.id}
                      layout
                      className={`p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                        darkMode 
                          ? 'bg-white/5 border-white/10 hover:border-amber-500/40 hover:bg-white/[0.07]' 
                          : 'bg-white border-zinc-200 hover:border-amber-400 shadow-xs'
                      }`}
                      id={`pin-card-${spot.id}`}
                    >
                      {/* Spot Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-white truncate font-display" title={spot.name}>
                            {spot.name}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[8.5px] font-mono font-bold">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{spot.zone}</span>
                          </span>
                          <span className="text-[8px] text-zinc-500 font-mono truncate max-w-[150px]">
                            {spot.address}
                          </span>
                        </div>
                      </div>

                      {/* 8-Bit LCD PIN Display & Action Buttons */}
                      <div className="flex items-center space-x-2 shrink-0">
                        {/* PIN Box */}
                        <div className="px-3 py-1.5 rounded-xl bg-black border-2 border-amber-400 text-amber-400 font-mono font-black text-sm tracking-widest shadow-inner select-all flex items-center space-x-1">
                          <Lock className="w-3 h-3 text-amber-400/70" />
                          <span>{currentPin}</span>
                        </div>

                        {/* Copy Button */}
                        <button
                          type="button"
                          onClick={() => handleCopySinglePin(spot.id, currentPin)}
                          className={`p-2 rounded-xl border transition cursor-pointer active:scale-95 ${
                            isCopied 
                              ? 'bg-emerald-500 border-emerald-400 text-black' 
                              : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                          }`}
                          title={lang === 'PT' ? 'Copiar PIN' : 'Copy PIN'}
                          id={`btn-copy-pin-${spot.id}`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Regenerate PIN Button */}
                        <button
                          type="button"
                          onClick={() => handleRegeneratePin(spot)}
                          disabled={isRegenerating}
                          className="px-2.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 hover:text-amber-300 font-bold text-[9px] flex items-center space-x-1 transition cursor-pointer active:scale-95"
                          title={lang === 'PT' ? 'Gerar novo código aleatório de 4 dígitos' : 'Generate new random 4-digit code'}
                          id={`btn-regen-pin-${spot.id}`}
                        >
                          <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                          <span className="hidden sm:inline">{t('regeneratePinBtn', lang)}</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with Security Notice and Email Dispatch summary */}
          <div className="p-4 bg-black/40 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-zinc-400 shrink-0">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {lang === 'PT'
                  ? 'Estes PINs são estritamente confidenciais. Apenas o staff autorizado deve ter acesso.'
                  : 'These PINs are strictly confidential. Only authorized staff must have access.'}
              </span>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleSendEmail}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-[10px] flex items-center space-x-1.5 transition shadow-lg shadow-amber-500/20 active:scale-95 uppercase tracking-wider font-display cursor-pointer"
                id="btn-footer-send-email-pins"
              >
                <Mail className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{lang === 'PT' ? 'Enviar Relatório para cobeertaste@gmail.com' : 'Send Report to cobeertaste@gmail.com'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
