import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Beer, Award, Trophy, UserCheck, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { Bar } from '../types';
import { Language } from '../lib/i18n';
import { getFriendProfileData } from '../lib/socialActivity';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

interface FriendProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: { 
    id: string; 
    username: string; 
    points: number;
    earnedBadges?: string[];
    checkedInBars?: string[];
    checkinHistory?: any[];
  } | null;
  bars: Bar[];
  lang: Language;
  onSelectSpot: (bar: Bar) => void;
  onRemoveFriend?: (id: string, username: string) => void;
  isFriend?: boolean;
}

export const FriendProfileModal: React.FC<FriendProfileModalProps> = ({
  isOpen,
  onClose,
  friend,
  bars,
  lang,
  onSelectSpot,
  onRemoveFriend,
  isFriend = true,
}) => {
  const [cheersSent, setCheersSent] = useState(false);
  const [realUserData, setRealUserData] = useState<{
    points?: number;
    earnedBadges?: string[];
    checkedInBars?: string[];
    checkinHistory?: any[];
  } | null>(null);
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);

  // Fetch real user data from Firestore when modal opens
  useEffect(() => {
    if (!isOpen || !friend?.id) {
      setRealUserData(null);
      setIsLoadingRealData(false);
      return;
    }

    let isMounted = true;

    const fetchRealData = async () => {
      // Local or mock user
      if (friend.id.startsWith('mock_') || friend.id.startsWith('seed_') || friend.id.startsWith('local-')) {
        return;
      }

      setIsLoadingRealData(true);
      try {
        let earnedBadges = friend.earnedBadges || [];
        let checkedInBars = friend.checkedInBars || [];
        let checkinHistory = friend.checkinHistory || [];
        let points = friend.points;

        // 1. Fetch user doc for real earnedBadges and checkedInBars
        if (db) {
          try {
            const userSnap = await getDoc(doc(db, 'users', friend.id));
            if (userSnap.exists()) {
              const uData = userSnap.data();
              if (Array.isArray(uData.earnedBadges)) {
                earnedBadges = uData.earnedBadges;
              }
              if (Array.isArray(uData.checkedInBars)) {
                checkedInBars = uData.checkedInBars;
              }
              if (Array.isArray(uData.checkinHistory)) {
                checkinHistory = uData.checkinHistory;
              }
              if (typeof uData.points === 'number') {
                points = uData.points;
              }
            }
          } catch (docErr) {
            console.warn("Could not read friend user document:", docErr);
          }

          // 2. Fetch real check-ins from 'checkins' collection
          try {
            const q = query(
              collection(db, 'checkins'),
              where('userId', '==', friend.id),
              limit(10)
            );
            const checkinsSnap = await getDocs(q);
            const remoteHistory: any[] = [];
            checkinsSnap.forEach((docItem) => {
              const cdata = docItem.data();
              remoteHistory.push({
                barId: cdata.spotId,
                barName: cdata.spotName,
                date: cdata.dateString,
                timestamp: cdata.timestamp?.toMillis ? cdata.timestamp.toMillis() : (cdata.timestamp || Date.now())
              });
            });

            if (remoteHistory.length > 0) {
              remoteHistory.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
              const merged = [...remoteHistory, ...checkinHistory];
              checkinHistory = Array.from(
                new Map(merged.map(item => [item.barId + (item.date || ''), item])).values()
              );
              // Also add to checkedInBars if missing
              const remoteBarIds = remoteHistory.map(r => r.barId).filter(Boolean);
              checkedInBars = Array.from(new Set([...checkedInBars, ...remoteBarIds]));
            }
          } catch (chkErr) {
            console.warn("Could not query friend checkins from Firestore:", chkErr);
          }
        }

        if (isMounted) {
          setRealUserData({
            points,
            earnedBadges,
            checkedInBars,
            checkinHistory
          });
        }
      } catch (err) {
        console.warn("Error fetching real friend data:", err);
      } finally {
        if (isMounted) {
          setIsLoadingRealData(false);
        }
      }
    };

    fetchRealData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, friend?.id]);

  if (!isOpen || !friend) return null;

  const mergedFriend = {
    ...friend,
    points: typeof realUserData?.points === 'number' ? realUserData.points : friend.points,
    earnedBadges: realUserData?.earnedBadges ?? friend.earnedBadges ?? [],
    checkedInBars: realUserData?.checkedInBars ?? friend.checkedInBars ?? [],
    checkinHistory: realUserData?.checkinHistory ?? friend.checkinHistory ?? [],
  };

  const profileData = getFriendProfileData(mergedFriend, bars, lang);
  const { levelInfo, unlockedBadges, visitedSpots, totalCheckins } = profileData;

  const handleSendCheers = () => {
    setCheersSent(true);
    setTimeout(() => {
      setCheersSent(false);
    }, 3000);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[180] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl border-3 border-[#1B2036] shadow-[6px_6px_0px_#1B2036] overflow-hidden bg-[#F6EFDC] text-[#1B2036]"
          id="modal-friend-profile"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b-2 border-[#1B2036] flex items-center justify-between bg-[#EFE6CC] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F2A93B] border-2 border-[#1B2036] flex items-center justify-center text-base shrink-0 shadow-[2px_2px_0px_#1B2036]">
                🍻
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold font-press tracking-tight text-[#1B2036]">
                  {lang === 'PT' ? 'PERFIL DO AMIGO' : 'FRIEND PROFILE'}
                </h3>
                <p className="text-[9px] text-[#1B2036]/70 font-mono">
                  {lang === 'PT' ? 'Comunidade HOP-MAP' : 'HOP-MAP Community'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border-2 border-[#1B2036] bg-[#F6EFDC] hover:bg-[#EFE6CC] text-[#1B2036] transition cursor-pointer shadow-[2px_2px_0px_#1B2036] active:scale-95"
              id="btn-close-friend-profile-modal"
              title={lang === 'PT' ? 'Fechar' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {/* User Hero Banner */}
            <div className="p-4 rounded-2xl border-2 border-[#1B2036] bg-[#EFE6CC] shadow-[3px_3px_0px_#1B2036] relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl border-2 border-[#1B2036] bg-amber-200 flex items-center justify-center text-3xl shadow-[2px_2px_0px_#1B2036] shrink-0">
                      {levelInfo.badge}
                    </div>
                    <span className="absolute -bottom-1 -right-1 text-xs" title="Verificado">
                      ✨
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm sm:text-base font-black font-press tracking-tight text-[#1B2036]">
                        {friend.username}
                      </h4>
                      {isFriend && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#12908C]/15 border border-[#12908C] text-[#12908C] text-[8px] font-mono font-bold">
                          <UserCheck className="w-2.5 h-2.5" />
                          {lang === 'PT' ? 'Amigo' : 'Friend'}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-display font-bold text-amber-700 mt-0.5">
                      "{levelInfo.title}"
                    </p>
                    <p className="text-[9px] text-[#1B2036]/70 italic mt-0.5">
                      {levelInfo.concept}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t-2 border-[#1B2036]/20 text-center">
                <div className="p-2 rounded-xl bg-[#F6EFDC] border border-[#1B2036]">
                  <div className="text-[8px] uppercase tracking-wider font-mono font-bold text-[#1B2036]/70">
                    {lang === 'PT' ? 'Pontos' : 'Points'}
                  </div>
                  <div className="text-xs sm:text-sm font-black font-press text-[#12908C] mt-0.5">
                    {mergedFriend.points}
                  </div>
                  <div className="text-[7.5px] font-mono text-zinc-500">HOPS</div>
                </div>

                <div className="p-2 rounded-xl bg-[#F6EFDC] border border-[#1B2036]">
                  <div className="text-[8px] uppercase tracking-wider font-mono font-bold text-[#1B2036]/70">
                    {lang === 'PT' ? 'Check-ins' : 'Check-ins'}
                  </div>
                  <div className="text-xs sm:text-sm font-black font-press text-[#E85B41] mt-0.5">
                    {totalCheckins}
                  </div>
                  <div className="text-[7.5px] font-mono text-zinc-500">{lang === 'PT' ? 'Locais' : 'Spots'}</div>
                </div>

                <div className="p-2 rounded-xl bg-[#F6EFDC] border border-[#1B2036]">
                  <div className="text-[8px] uppercase tracking-wider font-mono font-bold text-[#1B2036]/70">
                    {lang === 'PT' ? 'Badges' : 'Badges'}
                  </div>
                  <div className="text-xs sm:text-sm font-black font-press text-amber-600 mt-0.5">
                    {unlockedBadges.length}
                  </div>
                  <div className="text-[7.5px] font-mono text-zinc-500">{lang === 'PT' ? 'Emblemas' : 'Badges'}</div>
                </div>
              </div>

              {/* Interactive Cheers Action: Button text "CHEERS!!" */}
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={handleSendCheers}
                  className={`w-full py-2.5 px-3 rounded-xl border-2 border-[#1B2036] text-[10.5px] font-bold font-press uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_#1B2036] active:translate-y-0.5 active:shadow-none cursor-pointer ${
                    cheersSent
                      ? 'bg-[#12908C] text-white'
                      : 'bg-[#F2A93B] hover:bg-[#F2A93B]/90 text-[#1B2036]'
                  }`}
                  id="btn-send-friend-cheers"
                >
                  <Beer className="w-4 h-4" />
                  <span>
                    {cheersSent
                      ? (lang === 'PT' ? '🍻 CHEERS ENVIADO!' : '🍻 CHEERS SENT!')
                      : 'CHEERS!! 🍻'}
                  </span>
                </button>
              </div>
            </div>

            {/* Badges Conquistados Showcase (Real badges, or "SEM BADGES" / "NO BADGES") */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-[10.5px] font-bold font-press uppercase tracking-wider text-[#1B2036] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{lang === 'PT' ? 'Badges Conquistados' : 'Earned Badges'}</span>
                </h5>
                {unlockedBadges.length > 0 && (
                  <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EFE6CC] border border-[#1B2036] text-[#1B2036]">
                    {unlockedBadges.length} {lang === 'PT' ? 'emblemas' : 'badges'}
                  </span>
                )}
              </div>

              {isLoadingRealData && unlockedBadges.length === 0 ? (
                <div className="p-3 rounded-xl border border-[#1B2036]/20 bg-[#EFE6CC] flex items-center justify-center gap-2 text-[9px] font-mono text-zinc-600">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>{lang === 'PT' ? 'A verificar emblemas...' : 'Verifying badges...'}</span>
                </div>
              ) : unlockedBadges.length === 0 ? (
                <div className="p-4 rounded-xl border-2 border-dashed border-[#1B2036]/40 bg-[#EFE6CC] text-center space-y-1">
                  <span className="text-xs font-black font-press text-[#1B2036] block tracking-wide">
                    {lang === 'PT' ? 'SEM BADGES' : 'NO BADGES'}
                  </span>
                  <p className="text-[9px] text-[#1B2036]/70 font-mono">
                    {lang === 'PT' 
                      ? 'Este amigo ainda não conquistou nenhum badge.' 
                      : 'This friend has not earned any badges yet.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {unlockedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-2.5 rounded-xl border-2 border-[#1B2036] bg-[#EFE6CC] shadow-[2px_2px_0px_#1B2036] flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#F6EFDC] border border-[#1B2036] flex items-center justify-center text-lg shrink-0">
                        {badge.icon}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-[9px] font-bold font-press truncate text-[#1B2036]">
                          {lang === 'PT' ? badge.namePt : badge.nameEn}
                        </div>
                        <div className="text-[7.5px] font-mono text-zinc-600 uppercase mt-0.5 truncate">
                          {badge.rarity || 'common'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Spots Visited (Real visited spots or "SEM SPOTS VISITADOS" / "NO SPOTS VISITED YET") */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-[10.5px] font-bold font-press uppercase tracking-wider text-[#1B2036] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#12908C]" />
                  <span>{lang === 'PT' ? 'Últimos Spots Visitados' : 'Recent Spots Visited'}</span>
                </h5>
                {visitedSpots.length > 0 && (
                  <span className="text-[8px] font-mono text-zinc-500">
                    {lang === 'PT' ? 'Clica para ver spot' : 'Click to view spot'}
                  </span>
                )}
              </div>

              {isLoadingRealData && visitedSpots.length === 0 ? (
                <div className="p-3 rounded-xl border border-[#1B2036]/20 bg-[#EFE6CC] flex items-center justify-center gap-2 text-[9px] font-mono text-zinc-600">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#12908C]" />
                  <span>{lang === 'PT' ? 'A verificar check-ins...' : 'Verifying check-ins...'}</span>
                </div>
              ) : visitedSpots.length === 0 ? (
                <div className="p-4 rounded-xl border-2 border-dashed border-[#1B2036]/40 bg-[#EFE6CC] text-center space-y-1">
                  <span className="text-xs font-black font-press text-[#1B2036] block tracking-wide">
                    {lang === 'PT' ? 'SEM SPOTS VISITADOS' : 'NO SPOTS VISITED YET'}
                  </span>
                  <p className="text-[9px] text-[#1B2036]/70 font-mono">
                    {lang === 'PT' 
                      ? 'Este amigo ainda não realizou check-in em nenhum spot.' 
                      : 'This friend has not checked in at any spots yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {visitedSpots.map((item, index) => {
                    if (!item.spot) return null;
                    return (
                      <div
                        key={`${item.spot.id}-${index}`}
                        className="p-3 rounded-xl border-2 border-[#1B2036] bg-[#EFE6CC] shadow-[2px_2px_0px_#1B2036] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10.5px] font-bold font-display text-[#1B2036] truncate">
                              {item.spot.name}
                            </span>
                            <span className="text-[7.5px] font-mono px-1.5 py-0.2 rounded bg-[#F6EFDC] border border-[#1B2036] text-zinc-700">
                              📍 {item.spot.zone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[8px] font-mono text-zinc-600">
                            {item.beerStyle && (
                              <>
                                <span className="text-amber-700 font-bold">🍺 {item.beerStyle}</span>
                                <span>•</span>
                              </>
                            )}
                            <span className="flex items-center gap-0.5">
                              <Calendar className="w-2.5 h-2.5" />
                              {item.dateStr}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectSpot(item.spot);
                          }}
                          className="shrink-0 px-2.5 py-1.5 rounded-lg border border-[#1B2036] bg-[#12908C] hover:bg-[#12908C]/90 text-white text-[8px] font-bold font-press uppercase tracking-wider flex items-center gap-1 shadow-[1px_1px_0px_#1B2036] active:scale-95 cursor-pointer transition"
                          title={lang === 'PT' ? 'Ver Spot' : 'View Spot'}
                        >
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{lang === 'PT' ? 'Ver Spot' : 'View Spot'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Remove Friend Option */}
            {isFriend && onRemoveFriend && (
              <div className="pt-2 text-center border-t border-[#1B2036]/20">
                <button
                  type="button"
                  onClick={() => {
                    onRemoveFriend(friend.id, friend.username);
                    onClose();
                  }}
                  className="text-[8.5px] font-mono text-red-600 hover:text-red-700 hover:underline cursor-pointer transition"
                  id="btn-remove-friend-from-profile"
                >
                  {lang === 'PT' ? `Remover ${friend.username} dos meus amigos` : `Remove ${friend.username} from friends`}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
