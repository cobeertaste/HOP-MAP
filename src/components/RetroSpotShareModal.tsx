/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Share2, 
  MessageCircle, Facebook, Instagram, Star, Sparkles,
  Copy, Check, Link2
} from 'lucide-react';
import { Bar, UserProfile } from '../types';
import { trackSpotShare } from '../lib/analytics';
import { getBarDescription } from '../lib/i18n';
import { getSpotShareUrl } from '../lib/router';

interface RetroSpotShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  bar: Bar | null;
  user: UserProfile;
  lang: 'PT' | 'EN';
  darkMode: boolean;
}

export default function RetroSpotShareModal({
  isOpen,
  onClose,
  bar,
  user,
  lang,
  darkMode
}: RetroSpotShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !bar) return null;

  const spotDirectUrl = getSpotShareUrl(bar);
  const shareCatchphrase = lang === 'PT' 
    ? `Descobre as cervejas de hoje no ${bar.name}!` 
    : `Discover today's beers at ${bar.name}!`;

  const shareSubphrase = lang === 'PT'
    ? 'Vem experimentar as melhores torneiras e artesanais neste local imperdível!'
    : 'Come taste the best craft beers on tap at this must-visit spot!';

  const shareFullText = lang === 'PT'
    ? `🍻 HOP-MAP by COBEER TASTE 🍻\n\n` +
      `📍 ${bar.name.toUpperCase()} (${bar.zone})\n` +
      `⭐ Avaliação: ${bar.rating.toFixed(1)} / 5.0\n` +
      `🍺 Estilos: ${bar.styles.join(', ')}\n\n` +
      `👉 ${shareCatchphrase}\n\n` +
      `Acede diretamente ao spot no HOP-MAP:\n` +
      `${spotDirectUrl}`
    : `🍻 HOP-MAP by COBEER TASTE 🍻\n\n` +
      `📍 ${bar.name.toUpperCase()} (${bar.zone})\n` +
      `⭐ Rating: ${bar.rating.toFixed(1)} / 5.0\n` +
      `🍺 Styles: ${bar.styles.join(', ')}\n\n` +
      `👉 ${shareCatchphrase}\n\n` +
      `Access this spot directly on HOP-MAP:\n` +
      `${spotDirectUrl}`;

  const handleCopyDirectUrl = async () => {
    try {
      await navigator.clipboard.writeText(spotDirectUrl);
      setUrlCopied(true);
      trackSpotShare(bar, user, 'copy_direct_url');
      setTimeout(() => setUrlCopied(false), 2500);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareFullText);
      setCopied(true);
      trackSpotShare(bar, user, 'copy_link');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  const handleNativeShare = async () => {
    trackSpotShare(bar, user, 'native_share');
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hop-Map - ${bar.name}`,
          text: shareFullText,
          url: spotDirectUrl
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    handleCopyDirectUrl();
  };

  const handleWhatsAppShare = () => {
    trackSpotShare(bar, user, 'whatsapp');
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareFullText)}`;
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    trackSpotShare(bar, user, 'facebook');
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(spotDirectUrl)}&quote=${encodeURIComponent(shareCatchphrase + ' ' + shareFullText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleInstagramShare = async () => {
    trackSpotShare(bar, user, 'instagram');
    try {
      await navigator.clipboard.writeText(shareFullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
    window.open('https://www.instagram.com/', '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md my-auto rounded-3xl border-3 border-[#1B2036] bg-[#F6EFDC] text-[#1B2036] shadow-[6px_6px_0px_#1B2036] overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-3.5 bg-[#F2A93B] border-b-2 border-[#1B2036] flex items-center justify-between text-[#1B2036]">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#F6EFDC] text-[#1B2036] flex items-center justify-center border-2 border-[#1B2036] shadow-[1px_1px_0px_#1B2036]">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider font-press text-[#1B2036]">
                  {lang === 'PT' ? 'Partilhar Spot' : 'Share Spot'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-black bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black flex items-center justify-center transition cursor-pointer shadow-[2px_2px_0px_#000000]"
              id="btn-close-share-modal"
              title={lang === 'PT' ? 'Fechar' : 'Close'}
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* RETRO CARD PREVIEW */}
            <div 
              ref={cardRef}
              className="relative p-4 rounded-2xl bg-[#EFE6CC] border-2 border-[#1B2036] shadow-[3px_3px_0px_#1B2036] space-y-3 select-none text-[#1B2036]"
            >
              {/* Retro top badge */}
              <div className="flex items-center justify-between border-b-2 border-[#1B2036]/20 pb-2">
                <div className="flex items-center space-x-1 text-[9px] font-mono font-black text-[#E85B41]">
                  <Sparkles className="w-3 h-3 text-[#E85B41] animate-pulse" />
                  <span>HOP-MAP • COBEER TASTE</span>
                </div>
                <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-[#F2A93B] text-[#1B2036] border border-[#1B2036] font-bold uppercase shadow-[1px_1px_0px_#1B2036]">
                  {bar.zone}
                </span>
              </div>

              {/* Spot Image with Retro Frame */}
              <div className="relative h-36 w-full rounded-xl overflow-hidden border-2 border-[#1B2036]">
                <img 
                  src={bar.coverPhoto} 
                  alt={bar.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px]">
                  <span className="font-extrabold truncate drop-shadow">{bar.name}</span>
                  <span className="flex items-center gap-1 font-mono text-[#1B2036] font-bold bg-[#F6EFDC] border border-[#1B2036] px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#1B2036]">
                    <Star className="w-3 h-3 fill-current text-[#F2A93B]" />
                    {bar.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* HIGHLIGHT PHRASE */}
              <div className="p-2.5 rounded-xl bg-[#F6EFDC] border-2 border-[#1B2036] text-center shadow-[2px_2px_0px_#1B2036]">
                <p className="text-[11px] font-black text-[#E85B41] font-display leading-tight">
                  "{shareCatchphrase}"
                </p>
                <p className="text-[9px] text-[#1B2036]/80 mt-1 italic font-body">
                  {shareSubphrase}
                </p>
              </div>

              {/* Styles and address */}
              <div className="space-y-1.5 text-[9px] text-[#1B2036]/80">
                <div className="flex flex-wrap gap-1 justify-center">
                  {bar.styles.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-lg bg-[#F6EFDC] border border-[#1B2036] text-[#1B2036] font-mono font-bold">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-center font-mono text-[8.5px] text-[#1B2036]/70 truncate">
                  📍 {bar.address}
                </p>
              </div>

              {/* Footer Stamp */}
              <div className="pt-2 border-t-2 border-[#1B2036]/20 flex items-center justify-between text-[8px] text-[#1B2036]/70 font-mono">
                <span className="text-[#12908C] font-bold">HOP-MAP</span>
                <span className="text-[#12908C] font-bold">www.cobeertaste.com</span>
              </div>
            </div>

            {/* Direct Spot Link Copy Section */}
            <div className="p-3 rounded-2xl bg-[#EFE6CC] border-2 border-[#1B2036] space-y-2 shadow-[2px_2px_0px_#1B2036]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#1B2036] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Link2 className="w-3.5 h-3.5 text-[#12908C]" />
                  {lang === 'PT' ? 'URL Direto do Spot' : 'Direct Spot URL'}
                </span>
                {urlCopied && (
                  <span className="text-[9px] font-bold text-[#12908C] flex items-center gap-1 font-mono animate-bounce">
                    <Check className="w-3 h-3" />
                    {lang === 'PT' ? 'Copiado!' : 'Copied!'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={spotDirectUrl}
                  className="flex-1 bg-[#F6EFDC] border-2 border-[#1B2036] rounded-xl px-2.5 py-2 text-[10px] font-mono text-[#1B2036] select-all focus:outline-none"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  onClick={handleCopyDirectUrl}
                  className={`px-3 py-2 rounded-xl text-[10px] font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border-2 border-[#1B2036] ${
                    urlCopied
                      ? 'bg-[#12908C] text-white shadow-[2px_2px_0px_#1B2036]'
                      : 'bg-[#F2A93B] hover:bg-[#E85B41] hover:text-white text-[#1B2036] active:scale-95 shadow-[2px_2px_0px_#1B2036]'
                  }`}
                  id="btn-copy-spot-direct-url"
                >
                  {urlCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{urlCopied ? (lang === 'PT' ? 'Copiado' : 'Copied') : (lang === 'PT' ? 'Copiar' : 'Copy')}</span>
                </button>
              </div>
            </div>

            {/* ACTION BUTTONS GRID */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold text-[#1B2036] uppercase tracking-wider block font-label">
                {lang === 'PT' ? 'Escolhe onde partilhar:' : 'Choose where to share:'}
              </span>

              {/* Direct Social Buttons: WhatsApp, Facebook, Instagram */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#EFE6CC] hover:bg-[#25D366] hover:text-white text-[#1B2036] border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] transition cursor-pointer"
                  id="btn-share-whatsapp"
                >
                  <MessageCircle className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-bold font-display">WhatsApp</span>
                </button>

                <button
                  onClick={handleFacebookShare}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#EFE6CC] hover:bg-[#1877F2] hover:text-white text-[#1B2036] border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] transition cursor-pointer"
                  id="btn-share-facebook"
                >
                  <Facebook className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-bold font-display">Facebook</span>
                </button>

                <button
                  onClick={handleInstagramShare}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#EFE6CC] hover:bg-[#E1306C] hover:text-white text-[#1B2036] border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] transition cursor-pointer"
                  id="btn-share-instagram"
                >
                  <Instagram className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-bold font-display">Instagram</span>
                </button>
              </div>

              {/* Quick / Native Share */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full mt-2 py-2.5 px-3 rounded-xl bg-[#12908C] hover:bg-[#0E7370] text-white border-2 border-[#1B2036] shadow-[3px_3px_0px_#1B2036] font-extrabold text-[10px] uppercase tracking-wider font-display flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                  id="btn-native-share-device"
                >
                  <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{lang === 'PT' ? 'Partilhar Spot' : 'Share Spot'}</span>
                </button>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
