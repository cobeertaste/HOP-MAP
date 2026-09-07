/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Share2, Copy, Check, Award, Users, Sparkles, MessageCircle, Facebook, Instagram } from 'lucide-react';
import { Language, t } from '../lib/i18n';

interface ReferralInviteCardProps {
  userId: string;
  isLoggedIn: boolean;
  lang: Language;
  darkMode?: boolean;
  hasAmbassadorBadge: boolean;
  triggerSelfPush: (title: string, message: string, type: 'reward' | 'loyalty' | 'system') => void;
}

export const ReferralInviteCard: React.FC<ReferralInviteCardProps> = ({
  userId,
  isLoggedIn,
  lang,
  hasAmbassadorBadge,
  triggerSelfPush
}) => {
  const [copied, setCopied] = useState(false);

  // Generate unique referral link: https://hopmap.app/?ref={userID}
  const cleanUserId = userId || 'hop-user';
  const referralLink = `https://hopmap.app/?ref=${encodeURIComponent(cleanUserId)}`;

  const shareTitle = t('inviteShareTitle', lang);
  const shareText = t('inviteShareText', lang);
  const fullInviteMessage = `${shareText} ${referralLink}`;

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = referralLink;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      triggerSelfPush(
        t('inviteLinkCopiedTitle', lang),
        t('inviteLinkCopiedMsg', lang),
        'system'
      );
    } catch (err) {
      console.warn('Could not copy referral link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: fullInviteMessage,
          url: referralLink
        });
        triggerSelfPush(
          lang === 'PT' ? 'Convite Partilhado! 🍻' : 'Invite Shared! 🍻',
          lang === 'PT' ? 'O teu link de recomendação foi partilhado com sucesso!' : 'Your referral link was shared successfully!',
          'system'
        );
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return; // User canceled native share sheet
        }
        console.warn('Navigator.share failed, fallback to clipboard:', err);
      }
    }

    // Fallback if navigator.share is not supported or rejected
    await copyToClipboard();
  };

  // Direct WhatsApp sharing
  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullInviteMessage)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    triggerSelfPush(
      lang === 'PT' ? 'A abrir WhatsApp... 💬' : 'Opening WhatsApp... 💬',
      lang === 'PT' ? 'Envia o teu link de convite aos teus amigos ou grupos!' : 'Send your invite link to your friends or groups!',
      'system'
    );
  };

  // Direct Facebook / Messenger sharing
  const handleFacebookShare = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullInviteMessage);
      }
    } catch (_) {}

    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=620,height=480');
    triggerSelfPush(
      lang === 'PT' ? 'A abrir Facebook / Messenger 💬' : 'Opening Facebook / Messenger 💬',
      lang === 'PT' ? 'Partilha o link e mensagem com os teus amigos no Facebook ou Messenger!' : 'Share the link and message with your friends on Facebook or Messenger!',
      'system'
    );
  };

  // Direct Instagram Direct message sharing
  const handleInstagramShare = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullInviteMessage);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = fullInviteMessage;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch (e) {
      console.warn('Could not copy invite text for Instagram:', e);
    }

    triggerSelfPush(
      t('instagramCopiedNoticeTitle', lang),
      t('instagramCopiedNoticeMsg', lang),
      'system'
    );

    setTimeout(() => {
      window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noopener,noreferrer');
    }, 350);
  };

  return (
    <div
      id="referral-invite-card"
      className="rounded-2xl p-3 sm:p-4 border border-zinc-700 bg-[#EFE6CC] shadow-[2px_2px_0px_#1B2036] space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-zinc-700 flex items-center justify-center text-amber-700 shadow-sm shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-zinc-900 font-display">
                {t('inviteFriendTitle', lang)}
              </h4>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-amber-400 text-black border border-zinc-700">
                <Sparkles className="w-2.5 h-2.5" />
                Badge
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-zinc-600 leading-tight mt-0.5">
              {t('inviteFriendSubtitle', lang)}
            </p>
          </div>
        </div>
      </div>

      {/* Ambassador Badge Status Preview Banner */}
      <div
        className={`flex items-center justify-between p-2.5 rounded-xl border border-zinc-700 transition-colors ${
          hasAmbassadorBadge
            ? 'bg-amber-100/90 text-amber-950 border-amber-600'
            : 'bg-white/60 text-zinc-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl select-none" role="img" aria-label="handshake">
            🤝
          </span>
          <div className="text-left">
            <div className="text-[10px] font-black leading-tight flex items-center gap-1">
              <span>{t('ambassadorBadgeName', lang)}</span>
              {hasAmbassadorBadge && (
                <Award className="w-3 h-3 text-amber-600 inline" />
              )}
            </div>
            <div className="text-[8px] text-zinc-500 leading-tight mt-0.5">
              {hasAmbassadorBadge
                ? t('ambassadorBadgeStatusUnlocked', lang)
                : t('ambassadorBadgeStatusPending', lang)}
            </div>
          </div>
        </div>
        <span
          className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border border-zinc-700 ${
            hasAmbassadorBadge
              ? 'bg-emerald-500 text-white'
              : 'bg-zinc-200 text-zinc-600'
          }`}
        >
          {hasAmbassadorBadge ? (lang === 'PT' ? 'GANHO' : 'EARNED') : (lang === 'PT' ? 'PENDENTE' : 'PENDING')}
        </span>
      </div>

      {/* Link Input & Actions */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <input
            type="text"
            readOnly
            value={referralLink}
            aria-label={t('referralLinkTooltip', lang)}
            className="w-full pl-3 pr-20 py-2 text-[10px] font-mono bg-white/80 rounded-xl border border-zinc-700 text-zinc-800 select-all outline-none truncate"
          />
          <button
            type="button"
            id="copy-referral-link-btn"
            onClick={copyToClipboard}
            className="absolute right-1 px-2.5 py-1 text-[9px] font-black font-display bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg border border-zinc-700 transition active:scale-95 cursor-pointer flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">{lang === 'PT' ? 'Copiado!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-zinc-600" />
                <span>{t('copyLinkBtn', lang)}</span>
              </>
            )}
          </button>
        </div>

        {/* Primary Share Button */}
        <button
          type="button"
          id="share-referral-invite-btn"
          onClick={handleNativeShare}
          className="w-full py-2.5 px-4 text-xs font-black font-display uppercase tracking-wider rounded-xl bg-amber-500 hover:bg-amber-400 text-black border-2 border-zinc-700 shadow-[2px_2px_0px_#1B2036] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{t('inviteFriendBtn', lang)}</span>
        </button>

        {/* Direct Social Networks Section: WhatsApp, Facebook, Instagram */}
        <div className="pt-2 space-y-1.5 border-t border-zinc-700/40">
          <span className="text-[9px] font-black uppercase tracking-wider text-zinc-700 font-display block">
            {t('shareSocialTitle', lang)}
          </span>

          <div className="grid grid-cols-3 gap-2">
            {/* WhatsApp */}
            <button
              type="button"
              id="share-referral-whatsapp-btn"
              onClick={handleWhatsAppShare}
              title={t('whatsappSharePrompt', lang)}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/70 hover:bg-[#25D366] hover:text-white text-zinc-800 border border-zinc-700 shadow-[1.5px_1.5px_0px_#1B2036] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-[#25D366]/20 group-hover:bg-white/20 flex items-center justify-center mb-1 text-[#25D366] group-hover:text-white transition-colors">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-black font-display tracking-tight leading-none text-center">
                {t('shareViaWhatsApp', lang)}
              </span>
            </button>

            {/* Facebook / Messenger */}
            <button
              type="button"
              id="share-referral-facebook-btn"
              onClick={handleFacebookShare}
              title={t('facebookSharePrompt', lang)}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/70 hover:bg-[#1877F2] hover:text-white text-zinc-800 border border-zinc-700 shadow-[1.5px_1.5px_0px_#1B2036] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-[#1877F2]/20 group-hover:bg-white/20 flex items-center justify-center mb-1 text-[#1877F2] group-hover:text-white transition-colors">
                <Facebook className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-black font-display tracking-tight leading-none text-center truncate w-full">
                Facebook
              </span>
            </button>

            {/* Instagram Direct */}
            <button
              type="button"
              id="share-referral-instagram-btn"
              onClick={handleInstagramShare}
              title={t('instagramSharePrompt', lang)}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/70 hover:bg-[#E4405F] hover:text-white text-zinc-800 border border-zinc-700 shadow-[1.5px_1.5px_0px_#1B2036] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-[#E4405F]/20 group-hover:bg-white/20 flex items-center justify-center mb-1 text-[#E4405F] group-hover:text-white transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-black font-display tracking-tight leading-none text-center truncate w-full">
                Instagram
              </span>
            </button>
          </div>
        </div>

        {!isLoggedIn && (
          <p className="text-[8px] text-zinc-500 text-center italic pt-1">
            {lang === 'PT'
              ? '💡 Cria conta ou inicia sessão para o teu link ficar permanentemente associado ao teu perfil!'
              : '💡 Create an account or login so your link is permanently tied to your profile!'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReferralInviteCard;
