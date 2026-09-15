import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, X } from 'lucide-react';
import { Badge } from '../types';
import { Language } from '../lib/i18n';

interface BadgeUnlockedToastProps {
  badge: Badge | null;
  onClose: () => void;
  lang: Language;
}

export function BadgeUnlockedToast({
  badge,
  onClose,
  lang
}: BadgeUnlockedToastProps) {
  useEffect(() => {
    if (!badge) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [badge, onClose]);

  if (!badge) return null;

  const badgeName = lang === 'PT' ? badge.namePt : badge.nameEn;
  const badgeDesc = lang === 'PT' ? badge.descriptionPt : badge.descriptionEn;

  return (
    <AnimatePresence>
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -25, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="bg-[#F6EFDC] border-3 border-[#1B2036] rounded-2xl p-3.5 shadow-[4px_4px_0px_#1B2036] text-[#1B2036] flex items-center justify-between gap-3 relative overflow-hidden"
          id="toast-badge-unlocked"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Animated Icon Container */}
            <div className="w-12 h-12 rounded-xl bg-[#F2A93B] border-2 border-[#1B2036] flex items-center justify-center text-3xl shrink-0 shadow-[2px_2px_0px_#1B2036] animate-bounce">
              {badge.icon}
            </div>

            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5 text-[#E85B41]">
                <Sparkles className="w-3.5 h-3.5 shrink-0 animate-spin" />
                <span className="text-[8px] font-bold uppercase tracking-wider font-label">
                  {lang === 'PT' ? 'NOVO BADGE DESBLOQUEADO!' : 'NEW BADGE UNLOCKED!'}
                </span>
              </div>
              
              <h4 className="text-xs font-bold text-[#1B2036] font-press truncate mt-0.5">
                {badgeName}
              </h4>
              <p className="text-[10px] text-[#1B2036]/80 line-clamp-1 font-body mt-0.5">
                {badgeDesc}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black flex items-center justify-center border-2 border-black transition shrink-0 cursor-pointer shadow-[1px_1px_0px_#000000]"
            title={lang === 'PT' ? 'Fechar Notificação' : 'Close Notification'}
          >
            <X className="w-3.5 h-3.5 text-black stroke-[2.5]" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
