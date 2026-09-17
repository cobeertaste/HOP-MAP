/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ShieldCheck, CheckCircle2, XCircle, RefreshCw, 
  Store, UserCheck, AlertTriangle, Search, Clock, Mail
} from 'lucide-react';
import { Bar, OwnerClaimRecord } from '../types';
import { 
  getPendingOwnerClaims, 
  approveOwnerClaim, 
  rejectOwnerClaim 
} from '../lib/ownerUtils';
import { isAdminUser, OFFICIAL_REPORT_EMAIL } from '../lib/analytics';

interface AdminOwnerClaimsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allSpots: Bar[];
  userEmail?: string;
  isAdmin?: boolean;
  lang: 'PT' | 'EN';
  darkMode: boolean;
  onClaimApproved?: (userId: string, spotId: string) => void;
  onClaimRejected?: (userId: string) => void;
}

export default function AdminOwnerClaimsModal({
  isOpen,
  onClose,
  allSpots,
  userEmail,
  isAdmin,
  lang,
  darkMode,
  onClaimApproved,
  onClaimRejected
}: AdminOwnerClaimsModalProps) {
  const isAuthorizedAdmin = isAdmin ?? isAdminUser(userEmail);
  const [claims, setClaims] = useState<OwnerClaimRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const loadClaims = async () => {
    if (!isAuthorizedAdmin) return;
    setIsLoading(true);
    try {
      const data = await getPendingOwnerClaims();
      setClaims(data);
    } catch (e) {
      console.warn('Notice loading claims:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthorizedAdmin) {
      loadClaims();
    }
  }, [isOpen, isAuthorizedAdmin]);

  const handleApprove = async (claim: OwnerClaimRecord) => {
    setProcessingId(claim.userId);
    try {
      await approveOwnerClaim(claim.userId, claim.spotId, claim.spotName);
      setNotice(
        lang === 'PT'
          ? `Local "${claim.spotName}" aprovado para ${claim.userEmail}!`
          : `Venue "${claim.spotName}" approved for ${claim.userEmail}!`
      );
      setClaims(prev => prev.filter(c => c.userId !== claim.userId));
      onClaimApproved?.(claim.userId, claim.spotId);
    } catch (err: any) {
      setNotice(
        lang === 'PT'
          ? `Erro ao aprovar pedido: ${err?.message || 'Falha de rede'}`
          : `Error approving claim: ${err?.message || 'Network error'}`
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (claim: OwnerClaimRecord) => {
    setProcessingId(claim.userId);
    try {
      await rejectOwnerClaim(claim.userId);
      setNotice(
        lang === 'PT'
          ? `Pedido de ${claim.userEmail} rejeitado. Local libertado.`
          : `Claim by ${claim.userEmail} rejected. Spot released.`
      );
      setClaims(prev => prev.filter(c => c.userId !== claim.userId));
      onClaimRejected?.(claim.userId);
    } catch (err: any) {
      setNotice(
        lang === 'PT'
          ? `Erro ao rejeitar pedido: ${err?.message || 'Falha de rede'}`
          : `Error rejecting claim: ${err?.message || 'Network error'}`
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredClaims = claims.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.spotName.toLowerCase().includes(term) ||
      c.userEmail.toLowerCase().includes(term) ||
      c.username.toLowerCase().includes(term)
    );
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border-2 border-zinc-700 overflow-hidden shadow-2xl bg-[#F6EFDC] text-zinc-900"
          id="admin-owner-claims-modal"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b-2 border-zinc-700 bg-amber-500/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-zinc-700 text-amber-700">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider font-display text-zinc-900">
                    {lang === 'PT' ? 'Reivindicações de Proprietários' : 'Venue Owner Claims'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-mono font-black">
                    ADMIN
                  </span>
                </div>
                <p className="text-[10px] text-zinc-600 font-sans">
                  {lang === 'PT' 
                    ? 'Aprova ou rejeita pedidos de proprietários para gestão de spots no HOP MAP'
                    : 'Approve or reject owner claims to manage spots on HOP MAP'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-zinc-700 bg-white/60 hover:bg-zinc-200 transition cursor-pointer text-zinc-700"
              id="btn-close-owner-claims-modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notice banner if any */}
          {notice && (
            <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-900 text-xs font-semibold flex items-center justify-between">
              <span>{notice}</span>
              <button 
                onClick={() => setNotice(null)} 
                className="text-zinc-600 hover:text-black font-bold ml-2 text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Search & Actions Bar */}
          <div className="p-4 border-b border-zinc-700 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-amber-50/50">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder={lang === 'PT' ? 'Filtrar por local, email ou utilizador...' : 'Filter by spot, email or user...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-700 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={loadClaims}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl border border-zinc-700 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold font-display flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{lang === 'PT' ? 'Atualizar' : 'Refresh'}</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 font-sans">
            {!isAuthorizedAdmin ? (
              <div className="p-6 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-center space-y-2">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
                <h4 className="font-extrabold text-sm font-display text-red-800">
                  {lang === 'PT' ? 'Acesso Restrito' : 'Restricted Access'}
                </h4>
                <p className="text-xs text-red-700">
                  {lang === 'PT' 
                    ? `Este painel é exclusivo para o Administrador oficial: ${OFFICIAL_REPORT_EMAIL}`
                    : `This panel is strictly reserved for Administrator: ${OFFICIAL_REPORT_EMAIL}`}
                </p>
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-zinc-700 text-center space-y-2 bg-white/40">
                <UserCheck className="w-8 h-8 text-zinc-400 mx-auto" />
                <h4 className="font-bold text-sm font-display text-zinc-700">
                  {lang === 'PT' ? 'Nenhuma reivindicação pendente' : 'No pending claims'}
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  {lang === 'PT'
                    ? 'Todos os pedidos de proprietários foram processados ou ainda não há novas solicitações.'
                    : 'All owner claims have been processed or there are no new submissions yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider font-display">
                  {lang === 'PT' ? 'Pedidos Pendentes' : 'Pending Requests'} ({filteredClaims.length})
                </div>

                {filteredClaims.map((claim) => {
                  const spot = allSpots.find(b => b.id === claim.spotId);
                  const isProcessing = processingId === claim.userId;

                  return (
                    <div
                      key={claim.userId}
                      className="p-4 rounded-2xl border-2 border-zinc-700 bg-white shadow-xs space-y-3 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-zinc-700 flex items-center justify-center font-bold text-base text-amber-800 shrink-0">
                            🍻
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm font-display text-zinc-900 leading-tight">
                              {claim.spotName}
                            </h4>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              ID: {claim.spotId} {spot?.zone ? `• ${spot.zone}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>{new Date(claim.requestedAt).toLocaleDateString(lang === 'PT' ? 'pt-PT' : 'en-US')}</span>
                        </div>
                      </div>

                      {/* Applicant details */}
                      <div className="bg-[#FBF8EF] p-2.5 rounded-xl border border-zinc-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-zinc-700">
                          <span className="text-[10px] font-bold uppercase tracking-wider font-display text-zinc-500">
                            {lang === 'PT' ? 'Requerente' : 'Applicant'}:
                          </span>
                          <span className="font-bold text-zinc-900">{claim.username}</span>
                        </div>
                        <div className="flex items-center justify-between text-zinc-700">
                          <span className="text-[10px] font-bold uppercase tracking-wider font-display text-zinc-500">
                            Email:
                          </span>
                          <span className="font-mono text-[11px] text-amber-800">{claim.userEmail}</span>
                        </div>
                        {spot?.address && (
                          <div className="flex items-center justify-between text-zinc-600 text-[10px]">
                            <span className="font-bold uppercase tracking-wider font-display text-zinc-500">
                              {lang === 'PT' ? 'Morada' : 'Address'}:
                            </span>
                            <span className="truncate max-w-[280px]">{spot.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleReject(claim)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold font-display flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{lang === 'PT' ? 'Rejeitar' : 'Reject'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(claim)}
                          disabled={isProcessing}
                          className="px-4 py-1.5 rounded-xl border border-zinc-700 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{lang === 'PT' ? 'Aprovar Proprietário' : 'Approve Owner'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t-2 border-zinc-700 bg-[#EFE6CC] flex items-center justify-between text-[11px] text-zinc-600 font-sans">
            <span className="font-mono text-[10px]">
              Admin: <strong className="text-amber-800">{OFFICIAL_REPORT_EMAIL}</strong>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-zinc-800 hover:bg-black text-white font-bold rounded-xl text-xs font-display transition cursor-pointer"
            >
              {lang === 'PT' ? 'Fechar' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
