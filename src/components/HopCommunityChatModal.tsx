import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { Language } from '../lib/i18n';
import { ChatMessage, UserProfile } from '../types';
import { 
  X, 
  Send, 
  Smile, 
  AtSign, 
  Bell, 
  Beer,
  User as UserIcon,
  Award
} from 'lucide-react';
import { PixelIcon, PixelBeerGlass } from './PixelIcons';

export interface ChatRegisteredUser {
  id: string;
  username: string;
  name?: string;
  points?: number;
  avatarUrl?: string;
}

// Get the exact same ranking badge, title, and color used in Ranking / Leaderboard
export function getChatUserRankBadge(points: number = 0): { badge: string; title: string; color: string } {
  if (points >= 101) return { badge: '🛢️', title: 'Lord of the Barrels', color: '#FF0000' };
  if (points >= 91) return { badge: '👑', title: 'HOP Master', color: '#00FFFF' };
  if (points >= 71) return { badge: '🎖️', title: 'Cicerone', color: '#FFB8FF' };
  if (points >= 46) return { badge: '🤯', title: 'Hop Head', color: '#FFB852' };
  if (points >= 26) return { badge: '🧪', title: 'Homebrewer', color: '#22C55E' };
  if (points >= 11) return { badge: '🌿', title: 'HOP Rookie', color: '#FFCA00' };
  return { badge: '🌱', title: 'HOP Novice', color: '#A1A1AA' };
}

export function ChatUserAvatar({ 
  points = 0, 
  seed = '', 
  size = 32,
  isMe = false 
}: { 
  points?: number; 
  seed?: string; 
  size?: number;
  isMe?: boolean;
}) {
  const rankInfo = getChatUserRankBadge(points);

  return (
    <div 
      className={`relative flex items-center justify-center rounded-xl font-mono select-none transition-transform border-2 border-[#1B2036] ${
        isMe 
          ? 'bg-[#F2A93B]/30 shadow-[2px_2px_0px_#1B2036]' 
          : 'bg-[#EFE6CC] shadow-[1.5px_1.5px_0px_#1B2036]'
      }`}
      style={{ width: size, height: size }}
      title={`${seed ? `@${seed} • ` : ''}${rankInfo.title} (${points} HOPS)`}
    >
      <span className="text-base select-none leading-none transform group-hover:scale-110 transition-transform">
        {rankInfo.badge}
      </span>
    </div>
  );
}

interface HopCommunityChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  lang?: Language;
  darkMode?: boolean;
  onMentionNotification?: (notification: {
    senderName: string;
    text: string;
    messagePT: string;
    messageEN: string;
  }) => void;
}

const LOCAL_STORAGE_CHAT_KEY = 'hopmap_community_chat_messages_v2';
const PURGE_FLAG_KEY = 'hopmap_chat_history_purged_v2';
const QUICK_EMOJIS = ['🍻', '🍺', '🥨', '🔥', '🚀', '🥳', '👑', '👌', '⭐'];

// Purge all old conversation records from previous versions/users across localStorage and Firestore
export async function purgeAllPreviousChatHistory() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('hopmap_community_chat_messages_v1');
      localStorage.removeItem('hopmap_community_chat_messages_v0');
      localStorage.removeItem('hopmap_chat_messages');
      localStorage.removeItem(LOCAL_STORAGE_CHAT_KEY);
    } catch (e) {
      console.warn('Error clearing local chat cache:', e);
    }
  }

  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, 'chat_messages'));
      const batchDeletions = snap.docs.map(docSnap => deleteDoc(doc(db, 'chat_messages', docSnap.id)));
      await Promise.all(batchDeletions);
      console.log(`[HopChat] Successfully purged ${snap.docs.length} previous chat message documents from Firestore.`);
    } catch (err) {
      console.warn('[HopChat] Firestore purge note:', err);
    }
  }
}

function getLocalMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CHAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMessages(messages: ChatMessage[]) {
  try {
    const trimmed = messages.slice(-50);
    localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Error saving local chat messages', e);
  }
}

function formatChatTimestamp(isoDate: string, lang: Language): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) {
      return lang === 'PT' ? 'agora' : 'just now';
    }
    if (diffMins < 60) {
      return lang === 'PT' ? `há ${diffMins} min` : `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  } catch {
    return '';
  }
}

export function HopCommunityChatModal({
  isOpen,
  onClose,
  user,
  lang = 'PT',
  darkMode = true,
  onMentionNotification
}: HopCommunityChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Autocomplete state when typing letters or @
  const [autocompleteQuery, setAutocompleteQuery] = useState<string | null>(null);
  const [tokenStartPos, setTokenStartPos] = useState<number>(0);
  const [hasAtPrefix, setHasAtPrefix] = useState<boolean>(false);
  
  const [activeUsersList, setActiveUsersList] = useState<ChatRegisteredUser[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch strictly registered users from Firestore 'users' collection with their real points
  useEffect(() => {
    if (!isOpen) return;

    if (isFirebaseConfigured) {
      const fetchRegisteredUsers = async () => {
        try {
          const usersSnap = await getDocs(collection(db, 'users'));
          const regUsers: ChatRegisteredUser[] = [];
          usersSnap.forEach((docSnap) => {
            const data = docSnap.data();
            const uName = data.username || data.name || data.displayName;
            if (uName) {
              const clean = uName.replace(/^@/, '').trim();
              if (clean && !regUsers.some(u => u.username.toLowerCase() === clean.toLowerCase())) {
                regUsers.push({
                  id: docSnap.id,
                  username: clean,
                  name: data.displayName || data.name || undefined,
                  points: typeof data.points === 'number' ? data.points : 0,
                  avatarUrl: data.avatarUrl || undefined
                });
              }
            }
          });

          // Also include the currently active user if present
          if (user.username) {
            const existingIdx = regUsers.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
            if (existingIdx === -1) {
              regUsers.push({
                id: user.id || 'current_user',
                username: user.username,
                name: user.username,
                points: user.points || 0,
                avatarUrl: user.avatarUrl
              });
            } else {
              regUsers[existingIdx].points = user.points || regUsers[existingIdx].points || 0;
            }
          }

          // Sort alphabetically by username by default
          regUsers.sort((a, b) => a.username.localeCompare(b.username, undefined, { sensitivity: 'base' }));

          setActiveUsersList(regUsers);
        } catch (err) {
          console.warn('Error fetching registered users:', err);
          if (user.username) {
            setActiveUsersList([{
              id: user.id || 'current_user',
              username: user.username,
              points: user.points || 0
            }]);
          } else {
            setActiveUsersList([]);
          }
        }
      };

      fetchRegisteredUsers();
    } else {
      if (user.username) {
        setActiveUsersList([{
          id: user.id || 'current_user',
          username: user.username,
          points: user.points || 0
        }]);
      } else {
        setActiveUsersList([]);
      }
    }
  }, [isOpen, user.username, user.points, user.id, user.avatarUrl]);

  // Check notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPushEnabled(perm === 'granted');
      } catch (e) {
        console.warn('Error requesting notification permission:', e);
      }
    }
  };

  // Execute one-time purge of all old legacy conversations for clean slate
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(PURGE_FLAG_KEY)) {
      localStorage.setItem(PURGE_FLAG_KEY, 'true');
      purgeAllPreviousChatHistory().catch(err => console.warn('Chat purge background note:', err));
    }
  }, []);

  // Real-time Firestore Listener for the last 50 community messages
  useEffect(() => {
    if (!isOpen) return;

    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(db, 'chat_messages'),
          orderBy('timestamp', 'desc'),
          limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetched: ChatMessage[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            fetched.push({
              id: doc.id,
              text: data.text || '',
              senderId: data.senderId || 'anon',
              senderName: data.senderName || 'Hop Fan',
              senderAvatar: data.senderAvatar,
              timestamp: data.timestamp || new Date().toISOString(),
              mentions: data.mentions || []
            });
          });
          // Reverse so chronological order (oldest to newest)
          const sorted = fetched.reverse();
          setMessages(sorted);
        }, (err) => {
          console.warn('Firestore chat listener error, fallback to local storage:', err);
          setMessages(getLocalMessages());
        });

        return () => unsubscribe();
      } catch (err) {
        console.warn('Chat setup error:', err);
        setMessages(getLocalMessages());
      }
    } else {
      setMessages(getLocalMessages());
    }
  }, [isOpen]);

  // Scroll to bottom when messages update or modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen]);

  // Handle typing: autocomplete triggers when the user types any letter or @
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart || val.length;
    setInputText(val);

    const textBeforeCursor = val.slice(0, pos);
    // Find the current active token right before cursor
    const match = textBeforeCursor.match(/(?:^|\s)(@?)([a-zA-Z0-9_\u00C0-\u00FF]*)$/);

    if (match) {
      const isAt = match[1] === '@';
      const typedToken = match[2];
      const tokenIndex = pos - typedToken.length - (isAt ? 1 : 0);

      // If user typed @ or any letter/word, trigger autocomplete
      if (isAt || typedToken.length > 0) {
        setAutocompleteQuery(typedToken.toLowerCase());
        setTokenStartPos(tokenIndex);
        setHasAtPrefix(isAt);
        return;
      }
    }

    setAutocompleteQuery(null);
  };

  const handleSelectMention = (username: string) => {
    const cleanUsername = username.replace(/^@/, '').replace(/\s+/g, '_');
    const pos = inputRef.current?.selectionStart || inputText.length;
    const before = inputText.slice(0, tokenStartPos);
    const after = inputText.slice(pos);
    const newText = `${before}@${cleanUsername} ${after}`;
    setInputText(newText);
    setAutocompleteQuery(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    if (!user.isLoggedIn) {
      alert(lang === 'PT' ? 'Inicia sessão para enviar mensagens no Hop-Chat!' : 'Please log in to send messages in Hop-Chat!');
      return;
    }

    setIsSending(true);

    // Detect all @mentions in the message
    const mentionMatches = [...trimmed.matchAll(/@([a-zA-Z0-9_\u00C0-\u00FF]+)/g)];
    const detectedMentions = Array.from(new Set(mentionMatches.map(m => m[1].toLowerCase())));

    const nowIso = new Date().toISOString();
    const senderDisplayName = user.username || user.email?.split('@')[0] || `User_${user.id.slice(0, 4)}`;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${user.id}`,
      text: trimmed,
      senderId: user.id,
      senderName: senderDisplayName,
      senderAvatar: user.avatarUrl,
      timestamp: nowIso,
      mentions: detectedMentions
    };

    // Save locally
    const currentLocal = getLocalMessages();
    const updated = [...currentLocal, newMsg].slice(-50);
    saveLocalMessages(updated);
    setMessages(updated);
    setInputText('');
    setAutocompleteQuery(null);
    setShowEmojiPicker(false);

    // Write to Firebase Firestore
    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db, 'chat_messages'), {
          text: trimmed,
          senderId: user.id,
          senderName: senderDisplayName,
          senderAvatar: user.avatarUrl || '',
          timestamp: nowIso,
          mentions: detectedMentions,
          createdAt: serverTimestamp()
        });

        // Dispatch notifications for each mentioned user
        for (const mention of detectedMentions) {
          const titlePT = `@${senderDisplayName} mencionou-te no chat da comunidade! 🍻`;
          const titleEN = `@${senderDisplayName} mentioned you in the community chat! 🍻`;

          await addDoc(collection(db, 'notifications'), {
            recipientUsername: mention,
            senderId: user.id,
            senderName: senderDisplayName,
            type: 'mention',
            title: titlePT,
            titleEn: titleEN,
            message: trimmed,
            messageEn: trimmed,
            isRead: false,
            timestamp: nowIso,
            createdAt: serverTimestamp()
          }).catch(e => console.warn('Notification write error:', e));
        }
      } catch (err) {
        console.warn('Error broadcasting message to Firestore:', err);
      }
    }

    // Trigger local in-app mention dispatch if applicable
    if (detectedMentions.length > 0 && onMentionNotification) {
      detectedMentions.forEach(mention => {
        if (mention !== senderDisplayName.toLowerCase()) {
          onMentionNotification({
            senderName: senderDisplayName,
            text: trimmed,
            messagePT: `@${senderDisplayName} mencionou-te no chat da comunidade! 🍻`,
            messageEN: `@${senderDisplayName} mentioned you in the community chat! 🍻`
          });
        }
      });
    }

    setIsSending(false);
  };

  // Filter users whose username OR user_id starts with the query, sorted strictly alphabetically
  const filteredUsers = React.useMemo(() => {
    if (autocompleteQuery === null) return [];
    
    let matched = activeUsersList;
    if (autocompleteQuery.length > 0) {
      matched = activeUsersList.filter(u => 
        u.username.toLowerCase().startsWith(autocompleteQuery) || 
        (u.id && u.id.toLowerCase().startsWith(autocompleteQuery)) ||
        (u.name && u.name.toLowerCase().startsWith(autocompleteQuery))
      );
    }

    return [...matched].sort((a, b) => 
      a.username.localeCompare(b.username, undefined, { sensitivity: 'base' })
    ).slice(0, 8);
  }, [autocompleteQuery, activeUsersList]);

  // Helper map to quickly find user points for message icons
  const usersPointsMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    activeUsersList.forEach(u => {
      map[u.username.toLowerCase()] = u.points || 0;
      if (u.id) map[u.id.toLowerCase()] = u.points || 0;
    });
    return map;
  }, [activeUsersList]);

  if (!isOpen) return null;

  // Render message text with highlighted @mentions tags
  const renderMessageContent = (text: string) => {
    const parts = text.split(/(@[a-zA-Z0-9_\u00C0-\u00FF]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('@')) {
        const usernameWithoutAt = part.slice(1);
        const isMe = user.username && user.username.toLowerCase() === usernameWithoutAt.toLowerCase();
        return (
          <span 
            key={idx}
            className={`inline-block px-1.5 py-0.5 mx-0.5 rounded-md font-bold font-mono text-[10px] tracking-wide transition-transform border ${
              isMe 
                ? 'bg-[#F2A93B] text-[#1B2036] border-[#1B2036] shadow-[1px_1px_0px_#1B2036]' 
                : 'bg-[#12908C]/20 text-[#12908C] border-[#12908C]/50'
            }`}
          >
            {part}
          </span>
        );
      }
      return <span key={idx} className="text-[#1B2036] font-body">{part}</span>;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      {/* Modal Container */}
      <div 
        className="w-full max-w-lg h-[92vh] max-h-[700px] flex flex-col rounded-3xl border-3 border-[#1B2036] bg-[#F6EFDC] text-[#1B2036] shadow-[6px_6px_0px_#1B2036] overflow-hidden relative"
        id="hop-community-chat-modal"
      >
        {/* Chat Header */}
        <div className="px-4 py-3 border-b-2 border-[#1B2036] bg-[#F2A93B] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            {/* Beer Glass Pixel Icon */}
            <div className="w-8 h-8 rounded-xl bg-[#F6EFDC] border-2 border-[#1B2036] flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#1B2036]" id="chat-header-beerglass-icon">
              <PixelBeerGlass size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold uppercase font-press tracking-wider text-[#1B2036] truncate">
                  {lang === 'PT' ? 'HOP-CHAT Comunidade' : 'HOP-CHAT Community'}
                </h3>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#12908C] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#12908C]"></span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-black bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black flex items-center justify-center transition cursor-pointer shadow-[2px_2px_0px_#000] active:scale-95"
              id="btn-close-hop-chat"
              title={lang === 'PT' ? 'Fechar' : 'Close'}
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Current User Bar / Status */}
        <div className="px-4 py-2 bg-[#EFE6CC] border-b-2 border-[#1B2036] flex items-center justify-between text-[10px] shrink-0 font-mono text-[#1B2036]">
          <div className="flex items-center space-x-2">
            <span className="text-[#1B2036]/80 font-medium">
              {lang === 'PT' ? 'Tu:' : 'You:'} <strong className="text-[#12908C] font-bold">@{user.username || user.email?.split('@')[0] || user.id.slice(0, 6)}</strong>
            </span>
          </div>
          <span className="text-[9px] text-[#1B2036]/60 font-bold">
            {lang === 'PT' ? 'Usa @ para mencionar' : 'Type @ to mention'}
          </span>
        </div>

        {/* Message Feed Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth bg-[#F6EFDC]">
          {messages.map((msg) => {
            const isMe = user.isLoggedIn && (msg.senderId === user.id || msg.senderName === user.username);
            const isMentioned = user.username && msg.mentions?.includes(user.username.toLowerCase());
            
            // Get user's points for ranking icon
            const senderPoints = isMe 
              ? (user.points || 0) 
              : (usersPointsMap[msg.senderName?.toLowerCase()] ?? usersPointsMap[msg.senderId?.toLowerCase()] ?? 0);

            const senderRank = getChatUserRankBadge(senderPoints);

            return (
              <div 
                key={msg.id}
                className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'} group animate-fadeIn`}
              >
                {/* User Avatar with Exact Ranking Icon / Badge */}
                <div className="shrink-0 mt-0.5">
                  <ChatUserAvatar 
                    points={senderPoints} 
                    seed={msg.senderName || msg.senderId} 
                    size={32} 
                    isMe={isMe} 
                  />
                </div>

                {/* Message Bubble Box */}
                <div className={`max-w-[78%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name, Ranking Title & Timestamp */}
                  <div className="flex items-center space-x-1.5 mb-1 px-1 text-[9px] font-mono">
                    <span className={`font-bold ${isMe ? 'text-[#12908C]' : 'text-[#1B2036]'}`}>
                      @{msg.senderName}
                    </span>
                    <span className="text-[8px] text-[#E85B41] font-semibold">
                      [{senderRank.title}]
                    </span>
                    <span className="text-[#1B2036]/40">•</span>
                    <span className="text-[#1B2036]/60">
                      {formatChatTimestamp(msg.timestamp, lang)}
                    </span>
                  </div>

                  {/* Bubble Content */}
                  <div className={`p-3 rounded-2xl text-[11px] leading-relaxed break-words border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] ${
                    isMe 
                      ? 'bg-[#12908C]/15 text-[#1B2036] rounded-tr-xs' 
                      : isMentioned
                        ? 'bg-[#E85B41]/15 text-[#1B2036] rounded-tl-xs'
                        : 'bg-[#EFE6CC] text-[#1B2036] rounded-tl-xs'
                  }`}>
                    {renderMessageContent(msg.text)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Emoji Toolbar */}
        {showEmojiPicker && (
          <div className="p-2 border-t-2 border-[#1B2036] bg-[#EFE6CC] flex items-center justify-around shrink-0">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setInputText(prev => prev + emoji);
                  if (inputRef.current) inputRef.current.focus();
                }}
                className="text-lg hover:scale-125 transition active:scale-95 cursor-pointer p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Autocomplete Dropdown - strictly active/registered users starting with the typed letter, sorted alphabetically */}
        {autocompleteQuery !== null && filteredUsers.length > 0 && (
          <div className="absolute bottom-16 left-4 right-4 bg-[#F6EFDC] border-3 border-[#1B2036] rounded-2xl shadow-[4px_4px_0px_#1B2036] overflow-hidden z-30 max-h-52 overflow-y-auto">
            <div className="p-2 bg-[#F2A93B] border-b-2 border-[#1B2036] flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-[#1B2036] font-press">
              <div className="flex items-center space-x-1.5">
                <AtSign className="w-3 h-3 text-[#1B2036] shrink-0" />
                <span>{lang === 'PT' ? 'Membros Ativos' : 'Active Members'}</span>
              </div>
              <span className="text-[8px] font-mono text-[#1B2036]/70">
                {filteredUsers.length} {lang === 'PT' ? 'encontrados' : 'found'}
              </span>
            </div>
            <div className="p-1.5 space-y-1 bg-[#F6EFDC]">
              {filteredUsers.map((u) => {
                const userRank = getChatUserRankBadge(u.points || 0);
                return (
                  <button
                    key={u.username}
                    type="button"
                    onClick={() => handleSelectMention(u.username)}
                    className="w-full px-3 py-2 text-left text-xs font-mono font-bold flex items-center justify-between rounded-xl hover:bg-[#EFE6CC] border border-transparent hover:border-[#1B2036] text-[#1B2036] transition cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {/* Ranking Icon / Badge */}
                      <span className="text-base select-none shrink-0" title={`${userRank.title} (${u.points || 0} HOPS)`}>
                        {userRank.badge}
                      </span>
                      <div className="truncate text-left">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[#12908C] font-bold group-hover:text-[#0B6C69]">@{u.username}</span>
                          {u.name && u.name !== u.username && (
                            <span className="text-[10px] text-[#1B2036]/60 font-sans truncate">({u.name})</span>
                          )}
                        </div>
                        <span className="text-[8px] text-[#1B2036]/70 font-sans block">
                          {userRank.title} • {u.points || 0} HOPS
                        </span>
                      </div>
                    </div>
                    <span className="text-[8.5px] font-mono bg-[#F2A93B] border border-[#1B2036] text-[#1B2036] font-bold px-2 py-0.5 rounded-lg group-hover:bg-[#12908C] group-hover:text-white transition shrink-0 shadow-[1px_1px_0px_#1B2036]">
                      TAP 🍻
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Bar Form */}
        <form 
          onSubmit={handleSend}
          className="p-3 border-t-2 border-[#1B2036] bg-[#EFE6CC] flex items-center space-x-2 shrink-0 relative"
        >
          {/* Emoji Toggle Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-xl border-2 border-[#1B2036] transition cursor-pointer ${
              showEmojiPicker ? 'bg-[#F2A93B] text-[#1B2036] shadow-[2px_2px_0px_#1B2036]' : 'bg-[#F6EFDC] text-[#1B2036] hover:bg-[#F2A93B]'
            }`}
            title="Emojis"
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* Mention @ Button */}
          <button
            type="button"
            onClick={() => {
              setInputText(prev => prev + '@');
              setAutocompleteQuery('');
              setTokenStartPos(inputText.length);
              setHasAtPrefix(true);
              if (inputRef.current) inputRef.current.focus();
            }}
            className="p-2 rounded-xl bg-[#F6EFDC] border-2 border-[#1B2036] text-[#1B2036] hover:bg-[#F2A93B] transition cursor-pointer"
            title={lang === 'PT' ? 'Mencionar (@)' : 'Mention (@)'}
          >
            <AtSign className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={lang === 'PT' ? 'Escreve no Hop-Chat... (usa @)' : 'Message Hop-Chat... (use @)'}
            maxLength={300}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border-2 border-[#1B2036] outline-none font-sans transition bg-[#F6EFDC] text-[#1B2036] placeholder-[#1B2036]/50 focus:border-[#12908C]"
            id="input-hop-chat-message"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer font-label uppercase ${
              inputText.trim() && !isSending 
                ? 'bg-[#12908C] hover:bg-[#0B6C69] text-white font-bold border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036]' 
                : 'bg-[#EFE6CC] text-[#1B2036]/40 border-2 border-[#1B2036]/30 cursor-not-allowed'
            }`}
            id="btn-send-hop-chat"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{lang === 'PT' ? 'Enviar' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default HopCommunityChatModal;
