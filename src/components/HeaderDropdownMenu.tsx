/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, User, MessageSquare, Beer, Trophy, HelpCircle, 
  FileText, ChevronRight
} from 'lucide-react';
import { PixelIcon } from './PixelIcons';

interface HeaderDropdownMenuProps {
  lang: 'PT' | 'EN';
  onOpenProfile: () => void;
  onOpenHopChat: () => void;
  onOpenDonation: () => void;
  onOpenLeaderboard: () => void;
  onOpenHelpFaq: () => void;
  isAdmin?: boolean;
  onOpenAdminReport?: () => void;
  hasUnreadNotifications?: boolean;
  isChristmas?: boolean;
}

export const HeaderDropdownMenu: React.FC<HeaderDropdownMenuProps> = ({
  lang,
  onOpenProfile,
  onOpenHopChat,
  onOpenDonation,
  onOpenLeaderboard,
  onOpenHelpFaq,
  isAdmin = false,
  onOpenAdminReport,
  hasUnreadNotifications = false,
  isChristmas = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPT = lang === 'PT';

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative shrink-0" ref={menuRef}>
      {/* 3 Horizontal Bars Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`inline-flex items-center justify-center border-2 border-[#1B2036] transition-all p-2 sm:p-2.5 min-w-[38px] sm:min-w-[42px] min-h-[38px] sm:min-h-[42px] rounded-xl cursor-pointer select-none shadow-[2px_2px_0px_#1B2036] active:scale-95 touch-target-expand ${
          isOpen ? 'bg-[#F2A93B]' : 'bg-[#EFE6CC] hover:bg-[#F2A93B]'
        }`}
        id="btn-header-dropdown-menu"
        aria-label={isPT ? "Abrir menu de opções" : "Open options menu"}
        aria-expanded={isOpen}
        title={isPT ? "Menu principal" : "Main menu"}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-[#1B2036]" />
        ) : (
          /* 3 distinct horizontal bars */
          <div className="w-5 h-4 flex flex-col justify-between items-center pointer-events-none">
            <span className="w-5 h-[2.5px] bg-[#1B2036] rounded-full" />
            <span className="w-5 h-[2.5px] bg-[#1B2036] rounded-full" />
            <span className="w-5 h-[2.5px] bg-[#1B2036] rounded-full" />
          </div>
        )}

        {hasUnreadNotifications && !isOpen && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E85B41] rounded-full border border-[#1B2036] animate-pulse" />
        )}
      </button>

      {/* Backdrop on mobile for clean dismiss */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 sm:hidden bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#FAF6EB] border-3 border-[#1B2036] rounded-2xl shadow-[5px_5px_0px_#1B2036] z-50 overflow-hidden text-[#1B2036] select-none"
            id="header-dropdown-menu-list"
          >
            {/* Header / Brand label */}
            <div className="px-4 py-2.5 bg-[#EFE6CC] border-b-2 border-[#1B2036] flex items-center justify-between">
              <span className="text-[10px] font-press uppercase tracking-wider text-[#1B2036]">
                HOP-MAP MENU
              </span>
              <span className="text-[9px] font-mono font-bold text-[#12908C]">
                v2.4
              </span>
            </div>

            <div className="p-1.5 space-y-1">
              {/* Option 1: Perfil */}
              <button
                type="button"
                onClick={() => handleSelect(onOpenProfile)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F2A93B]/25 active:bg-[#F2A93B]/40 transition-colors text-left cursor-pointer group"
                id="menu-item-profile"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#EFE6CC] border-2 border-[#1B2036] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1B2036] shrink-0 group-hover:scale-105 transition-transform">
                    <PixelIcon name="user" size={18} overrideColor="#1B2036" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold font-sans text-[#1B2036] flex items-center gap-1.5">
                      <span>{isPT ? 'Perfil' : 'Profile'}</span>
                      {hasUnreadNotifications && (
                        <span className="w-2 h-2 bg-[#E85B41] rounded-full" />
                      )}
                    </div>
                    <p className="text-[10px] text-[#1B2036]/70 font-mono truncate">
                      {isPT ? 'Selos, histórico e dados' : 'Stamps, history & stats'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#1B2036]/50 group-hover:text-[#1B2036] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              {/* Option 2: HOP-Chat comunidade */}
              <button
                type="button"
                onClick={() => handleSelect(onOpenHopChat)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F2A93B]/25 active:bg-[#F2A93B]/40 transition-colors text-left cursor-pointer group"
                id="menu-item-hop-chat"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#EFE6CC] border-2 border-[#1B2036] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1B2036] shrink-0 group-hover:scale-105 transition-transform">
                    <PixelIcon name={isChristmas ? "bell" : "chat-bubble"} size={18} overrideColor="#1B2036" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold font-sans text-[#1B2036]">
                      {isPT ? 'HOP-Chat comunidade' : 'Community HOP-Chat'}
                    </div>
                    <p className="text-[10px] text-[#1B2036]/70 font-mono truncate">
                      {isPT ? 'Conversas e cervejas ao vivo' : 'Live chat & beer talk'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#1B2036]/50 group-hover:text-[#1B2036] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              {/* Option 3: Oferece uma rodada */}
              <button
                type="button"
                onClick={() => handleSelect(onOpenDonation)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F2A93B]/25 active:bg-[#F2A93B]/40 transition-colors text-left cursor-pointer group"
                id="menu-item-buy-beer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#EFE6CC] border-2 border-[#1B2036] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1B2036] shrink-0 group-hover:scale-105 transition-transform">
                    <PixelIcon name={isChristmas ? "santa-hat" : "beer-mug"} size={18} overrideColor="#1B2036" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold font-sans text-[#1B2036]">
                      {isPT ? 'Oferece uma rodada' : 'Buy us a round'}
                    </div>
                    <p className="text-[10px] text-[#1B2036]/70 font-mono truncate">
                      {isPT ? 'Apoia o projeto independente 🍻' : 'Support the craft app 🍻'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#1B2036]/50 group-hover:text-[#1B2036] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              {/* Option 4: Ver tabela de classificações */}
              <button
                type="button"
                onClick={() => handleSelect(onOpenLeaderboard)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F2A93B]/25 active:bg-[#F2A93B]/40 transition-colors text-left cursor-pointer group"
                id="menu-item-leaderboard"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#EFE6CC] border-2 border-[#1B2036] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1B2036] shrink-0 group-hover:scale-105 transition-transform">
                    <PixelIcon name={isChristmas ? "gift" : "podium"} size={18} overrideColor="#1B2036" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold font-sans text-[#1B2036]">
                      {isPT ? 'Ver tabela de classificações' : 'View Leaderboard'}
                    </div>
                    <p className="text-[10px] text-[#1B2036]/70 font-mono truncate">
                      {isPT ? 'Ranking global e de amigos' : 'Global & friends ranking'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#1B2036]/50 group-hover:text-[#1B2036] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              {/* Option 5: Ajuda & FAQ */}
              <button
                type="button"
                onClick={() => handleSelect(onOpenHelpFaq)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F2A93B]/25 active:bg-[#F2A93B]/40 transition-colors text-left cursor-pointer group"
                id="menu-item-help-faq"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#EFE6CC] border-2 border-[#1B2036] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1B2036] shrink-0 group-hover:scale-105 transition-transform">
                    <HelpCircle className="w-4 h-4 text-[#1B2036]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold font-sans text-[#1B2036]">
                      {isPT ? 'Ajuda & Questões' : 'Help & FAQ'}
                    </div>
                    <p className="text-[10px] text-[#1B2036]/70 font-mono truncate">
                      {isPT ? 'Dúvidas, regras e contacto' : 'Questions, rules & support'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#1B2036]/50 group-hover:text-[#1B2036] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              {/* Administrator Option if applicable */}
              {isAdmin && onOpenAdminReport && (
                <div className="pt-1 mt-1 border-t-2 border-[#1B2036]/20">
                  <button
                    type="button"
                    onClick={() => handleSelect(onOpenAdminReport)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#12908C]/15 active:bg-[#12908C]/30 transition-colors text-left cursor-pointer group"
                    id="menu-item-admin-report"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#12908C]/20 border-2 border-[#1B2036] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1B2036] shrink-0">
                        <FileText className="w-4 h-4 text-[#1B2036]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold font-sans text-[#1B2036]">
                          {isPT ? 'Relatório Mensal Admin' : 'Admin Monthly Report'}
                        </div>
                        <p className="text-[10px] text-[#1B2036]/70 font-mono truncate">
                          cobeertaste@gmail.com
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#1B2036]/50 group-hover:text-[#1B2036] transition-all shrink-0" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
