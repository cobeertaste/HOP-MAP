import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Lock, Sparkles, Trophy, Calendar, MapPin, Beer, Clock, Users, Star } from 'lucide-react';
import { BadgeUnlockStatus } from '../lib/badges';
import { Language } from '../lib/i18n';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeStatuses: BadgeUnlockStatus[];
  lang: Language;
  darkMode?: boolean;
}

type BadgeFilterCategory = 'all' | 'holidays' | 'checkins' | 'spots' | 'regions' | 'styles' | 'time' | 'community' | 'special';

export function BadgesModal({
  isOpen,
  onClose,
  badgeStatuses,
  lang,
  darkMode = true
}: BadgesModalProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeUnlockStatus | null>(null);
  const [activeCategory, setActiveCategory] = useState<BadgeFilterCategory>('all');

  if (!isOpen) return null;

  const unlockedCount = badgeStatuses.filter(b => b.unlocked).length;
  const totalCount = badgeStatuses.length;
  const completionPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const categories: Array<{ id: BadgeFilterCategory; labelPt: string; labelEn: string; icon: string }> = [
    { id: 'all', labelPt: 'Todos', labelEn: 'All', icon: '🏆' },
    { id: 'holidays', labelPt: 'Dias Festivos', labelEn: 'Holidays & Fests', icon: '🎆' },
    { id: 'checkins', labelPt: 'Check-ins', labelEn: 'Check-ins', icon: '📍' },
    { id: 'spots', labelPt: 'Spots', labelEn: 'Spots', icon: '🏰' },
    { id: 'regions', labelPt: 'Regiões', labelEn: 'Regions', icon: '🗺️' },
    { id: 'styles', labelPt: 'Estilos', labelEn: 'Styles', icon: '🍺' },
    { id: 'time', labelPt: 'Horários', labelEn: 'Time', icon: '⏰' },
    { id: 'community', labelPt: 'Comunidade', labelEn: 'Community', icon: '👥' },
    { id: 'special', labelPt: 'Especiais', labelEn: 'Special', icon: '✨' },
  ];

  const filteredBadges = activeCategory === 'all'
    ? badgeStatuses
    : badgeStatuses.filter(b => b.badge.category === activeCategory);

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border-3 border-[#1B2036] shadow-[4px_4px_0px_#1B2036] overflow-hidden bg-[#F6EFDC] text-[#1B2036]"
          id="modal-badges-catalog"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b-2 border-[#1B2036] flex items-center justify-between bg-[#EFE6CC] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F2A93B] border-2 border-[#1B2036] flex items-center justify-center text-xl shrink-0 shadow-[2px_2px_0px_#1B2036]">
                🏆
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold font-press tracking-tight text-[#E85B41]">
                  {lang === 'PT' ? 'CONQUISTAS E BADGES' : 'ACHIEVEMENTS AND BADGES'}
                </h3>
                <p className="text-[10px] text-[#1B2036]/70 font-body">
                  {lang === 'PT' 
                    ? 'Lista completa de todos os emblemas e efemérides do HOP-MAP' 
                    : 'Complete list of all badges, holidays & achievements in HOP-MAP'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border-2 border-black bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black transition cursor-pointer shadow-[2px_2px_0px_#000]"
              id="btn-close-badges-modal"
              title={lang === 'PT' ? 'Fechar' : 'Close'}
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* Progress Overview Banner */}
          <div className="px-4 py-3 bg-[#F6EFDC] border-b-2 border-[#1B2036]/30 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#12908C] animate-pulse shrink-0" />
              <div>
                <span className="text-[10px] font-bold font-press text-[#1B2036]">
                  {unlockedCount} / {totalCount} {lang === 'PT' ? 'Badges Desbloqueados' : 'Badges Unlocked'}
                </span>
                <span className="text-[9px] text-[#1B2036]/70 block font-data">
                  {completionPercent}% {lang === 'PT' ? 'concluído' : 'completed'}
                </span>
              </div>
            </div>

            <div className="w-28 sm:w-36 h-3 bg-[#EFE6CC] rounded-full overflow-hidden border-2 border-[#1B2036]">
              <div 
                className="h-full bg-[#12908C] rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="px-3 py-2 bg-[#EFE6CC] border-b-2 border-[#1B2036]/30 overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const label = lang === 'PT' ? cat.labelPt : cat.labelEn;
              const countInCat = cat.id === 'all' 
                ? badgeStatuses.length 
                : badgeStatuses.filter(b => b.badge.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-label uppercase flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer shrink-0 border-2 border-[#1B2036] ${
                    isActive
                      ? 'bg-[#12908C] text-white shadow-[2px_2px_0px_#1B2036]'
                      : 'bg-[#F6EFDC] text-[#1B2036] hover:bg-[#F2A93B]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{label}</span>
                  <span className={`text-[8px] font-data px-1 py-0.2 rounded-md ${
                    isActive ? 'bg-[#0B6C69] text-white font-bold' : 'bg-[#EFE6CC] text-[#1B2036]'
                  }`}>
                    {countInCat}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Complete Badges List */}
          <div className="p-4 overflow-y-auto space-y-2.5 flex-1 max-h-[55vh] bg-[#F6EFDC]">
            {filteredBadges.map(({ badge, unlocked, progressText }) => {
              const name = lang === 'PT' ? badge.namePt : badge.nameEn;
              const description = lang === 'PT' ? badge.descriptionPt : badge.descriptionEn;

              return (
                <div
                  key={badge.id}
                  onClick={() => setSelectedBadge({ badge, unlocked, progressText })}
                  className={`p-3 rounded-xl border-2 border-[#1B2036] transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    unlocked
                      ? 'bg-[#EFE6CC] hover:bg-white text-[#1B2036] shadow-[2px_2px_0px_#1B2036]'
                      : 'bg-[#F6EFDC]/60 opacity-60 hover:opacity-85 text-[#1B2036]/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 border-2 border-[#1B2036] select-none transition-transform ${
                      unlocked
                        ? 'bg-[#F2A93B] shadow-[2px_2px_0px_#1B2036]'
                        : 'bg-[#EFE6CC] grayscale'
                    }`}>
                      {badge.icon}
                    </div>

                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <h4 className={`text-[10px] font-bold font-press truncate ${
                          unlocked ? 'text-[#1B2036]' : 'text-[#1B2036]/50'
                        }`}>
                          {name}
                        </h4>
                        {unlocked && (
                          <span className="text-[7.5px] font-label font-bold bg-[#12908C] text-white border border-[#1B2036] px-1.5 py-0.2 rounded-md">
                            {lang === 'PT' ? 'CONQUISTADO' : 'UNLOCKED'}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] leading-tight line-clamp-2 mt-0.5 font-body">
                        {description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right font-data text-[9px]">
                    {unlocked ? (
                      <div className="flex items-center gap-1 text-[#12908C] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{lang === 'PT' ? 'Desbloqueado' : 'Unlocked'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[#1B2036]/50 font-medium">
                        <Lock className="w-3 h-3" />
                        <span>{progressText || (lang === 'PT' ? 'Bloqueado' : 'Locked')}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Badge Detail Modal if a badge is selected */}
          {selectedBadge && (
            <div 
              className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedBadge(null)}
            >
              <div 
                className="bg-[#F6EFDC] border-3 border-[#1B2036] rounded-2xl p-5 max-w-sm w-full text-center shadow-[6px_6px_0px_#1B2036] text-[#1B2036] relative animate-scale-up"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black flex items-center justify-center border-2 border-black transition shadow-[2px_2px_0px_#000000]"
                  title={lang === 'PT' ? 'Fechar' : 'Close'}
                >
                  <X className="w-4 h-4 text-black stroke-[2.5]" />
                </button>

                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-4xl mb-3 border-2 border-[#1B2036] ${
                  selectedBadge.unlocked
                    ? 'bg-[#F2A93B] shadow-[3px_3px_0px_#1B2036]'
                    : 'bg-[#EFE6CC] grayscale'
                }`}>
                  {selectedBadge.badge.icon}
                </div>

                <div className="flex items-center justify-center gap-1 text-[#E85B41] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[8.5px] font-bold uppercase tracking-wider font-label">
                    {selectedBadge.badge.category.toUpperCase()} • {selectedBadge.badge.rarity?.toUpperCase() || 'COMMON'}
                  </span>
                </div>

                <h3 className="text-xs font-bold font-press text-[#1B2036] mb-2">
                  {lang === 'PT' ? selectedBadge.badge.namePt : selectedBadge.badge.nameEn}
                </h3>

                <p className="text-xs text-[#1B2036]/80 font-body leading-relaxed mb-4">
                  {lang === 'PT' ? selectedBadge.badge.descriptionPt : selectedBadge.badge.descriptionEn}
                </p>

                <div className={`p-2.5 rounded-xl font-data text-xs font-bold border-2 border-[#1B2036] ${
                  selectedBadge.unlocked 
                    ? 'bg-[#12908C] text-white shadow-[2px_2px_0px_#1B2036]' 
                    : 'bg-[#EFE6CC] text-[#1B2036]/60'
                }`}>
                  {selectedBadge.unlocked 
                    ? (lang === 'PT' ? '✅ Emblema Conquistado com Sucesso!' : '✅ Badge Successfully Unlocked!')
                    : (lang === 'PT' ? `🔒 ${selectedBadge.progressText || 'Bloqueado'}` : `🔒 ${selectedBadge.progressText || 'Locked'}`)}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-3 bg-[#EFE6CC] border-t-2 border-[#1B2036] flex items-center justify-between text-[10px] text-[#1B2036] px-4 shrink-0">
            <span className="font-data font-bold text-[#12908C]">
              {lang === 'PT' ? `${filteredBadges.length} de ${totalCount} Badges` : `${filteredBadges.length} of ${totalCount} Badges`}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-[9px] font-label uppercase bg-[#E85B41] text-white hover:bg-[#1B2036] border-2 border-[#1B2036] rounded-xl transition cursor-pointer shadow-[2px_2px_0px_#1B2036]"
            >
              {lang === 'PT' ? 'Fechar' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
