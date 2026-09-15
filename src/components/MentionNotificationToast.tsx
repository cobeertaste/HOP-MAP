import React, { useEffect } from 'react';
import { Language } from '../lib/i18n';
import { MessageSquare, Bell, X, Sparkles } from 'lucide-react';

export interface MentionNotificationPayload {
  id?: string;
  senderName: string;
  text: string;
  messagePT: string;
  messageEN: string;
}

interface MentionNotificationToastProps {
  notification: MentionNotificationPayload | null;
  onDismiss: () => void;
  onClick: () => void;
  lang?: Language;
}

export function MentionNotificationToast({
  notification,
  onDismiss,
  onClick,
  lang = 'PT'
}: MentionNotificationToastProps) {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-3 animate-slideDown">
      <div 
        onClick={onClick}
        className="bg-zinc-950/95 border-2 border-amber-400 text-white p-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-start space-x-3 cursor-pointer hover:bg-zinc-900 transition active:scale-98"
        id="toast-mention-notification"
      >
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-amber-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider font-display text-amber-400">
              Hop-Chat 🍻
            </span>
            <span className="text-[8px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-extrabold font-mono">
              @MENTION
            </span>
          </div>
          <p className="text-xs font-bold text-zinc-100 mt-0.5 leading-snug truncate">
            {lang === 'PT' ? notification.messagePT : notification.messageEN}
          </p>
          <p className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
            "{notification.text}"
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="w-6 h-6 rounded-full border-2 border-black bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
          title={lang === 'PT' ? 'Fechar' : 'Close'}
        >
          <X className="w-3.5 h-3.5 text-black stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
