import React, { useMemo } from 'react';
import { Activity, MapPin, Award, Star, User, ChevronRight, Beer, UserPlus } from 'lucide-react';
import { Bar, FriendSocialActivity } from '../types';
import { Language } from '../lib/i18n';
import { getFriendsSocialActivities } from '../lib/socialActivity';
import { getLevelDetails } from '../lib/levels';

interface SocialActivitySectionProps {
  friends: { id: string; username: string; points: number }[];
  bars: Bar[];
  lang: Language;
  onSelectSpot: (bar: Bar) => void;
  onViewFriendProfile: (friend: { id: string; username: string; points: number }) => void;
  onAddSuggestedFriend?: (id: string, username: string) => void;
  realtimeActivities?: FriendSocialActivity[];
}

export const SocialActivitySection: React.FC<SocialActivitySectionProps> = ({
  friends,
  bars,
  lang,
  onSelectSpot,
  onViewFriendProfile,
  onAddSuggestedFriend,
  realtimeActivities = [],
}) => {
  // Compute the last 10 actions of the user's friends
  const activities = useMemo(() => {
    return getFriendsSocialActivities(friends, bars, lang, realtimeActivities);
  }, [friends, bars, lang, realtimeActivities]);

  return (
    <div className="space-y-3" id="section-social-activity">
      {/* Section Header */}
      <div className="flex items-center justify-between pl-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#12908C] border border-[#1B2036] flex items-center justify-center text-white shadow-[1px_1px_0px_#1B2036]">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider font-press text-[#1B2036]">
              {lang === 'PT' ? 'ATIVIDADE SOCIAL' : 'SOCIAL ACTIVITY'}
            </h4>
            <p className="text-[9px] text-[#1B2036]/70 font-mono">
              {lang === 'PT' ? 'Últimas 10 ações dos teus amigos' : "Your friends' last 10 actions"}
            </p>
          </div>
        </div>

        {activities.length > 0 && (
          <span className="text-[8px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#12908C]/15 text-[#12908C] border border-[#12908C] shadow-xs">
            {activities.length}/10 {lang === 'PT' ? 'Ações' : 'Actions'}
          </span>
        )}
      </div>

      {/* Activities List */}
      {friends.length === 0 ? (
        <div className="p-4 rounded-2xl border-2 border-dashed border-[#1B2036]/40 bg-[#EFE6CC] text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-[#1B2036] flex items-center justify-center mx-auto text-amber-800 text-lg">
            🍻
          </div>
          <div>
            <p className="text-[11px] font-bold font-display text-[#1B2036]">
              {lang === 'PT' ? 'Sem atividade social de amigos' : 'No friends social activity yet'}
            </p>
            <p className="text-[9px] text-[#1B2036]/70 max-w-xs mx-auto leading-relaxed mt-0.5">
              {lang === 'PT' 
                ? 'Conecta-te com amigos cervejeiros para acompanhar os seus check-ins e emblemas em tempo real!' 
                : 'Connect with craft beer friends to follow their check-ins and badges in real-time!'}
            </p>
          </div>

          {/* Quick-add suggested community friends */}
          {onAddSuggestedFriend && (
            <div className="pt-2 border-t border-[#1B2036]/20">
              <span className="text-[8.5px] font-mono font-bold text-zinc-600 block mb-2 uppercase tracking-wider">
                {lang === 'PT' ? 'Sugestões da Comunidade:' : 'Community Suggestions:'}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { id: 'mock_1', username: 'MestreCervejeiro', points: 345 },
                  { id: 'mock_2', username: 'RitaSourLover', points: 280 },
                  { id: 'mock_3', username: 'HopKing_88', points: 215 },
                ].map((sug) => (
                  <button
                    key={sug.id}
                    type="button"
                    onClick={() => onAddSuggestedFriend(sug.id, sug.username)}
                    className="px-2.5 py-1.5 rounded-xl border border-[#1B2036] bg-[#F6EFDC] hover:bg-amber-400 text-[#1B2036] text-[8.5px] font-bold font-press flex items-center gap-1.5 shadow-[1px_1px_0px_#1B2036] active:scale-95 cursor-pointer transition"
                    id={`btn-add-suggested-${sug.id}`}
                  >
                    <UserPlus className="w-3 h-3 text-[#12908C]" />
                    <span>+{sug.username}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : activities.length === 0 ? (
        <div className="p-4 rounded-2xl border border-[#1B2036] bg-[#EFE6CC] text-center text-[10px] text-zinc-600 font-mono">
          {lang === 'PT' ? 'Nenhuma atividade registada recentemente.' : 'No activities recorded recently.'}
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((act) => {
            const friendObj = friends.find(f => f.id === act.friendId) || {
              id: act.friendId,
              username: act.friendUsername,
              points: act.friendPoints || 20,
            };
            const levelInfo = getLevelDetails(friendObj.points, lang);
            const spotObj = bars.find(b => b.id === act.spotId || b.name.toLowerCase() === act.spotName?.toLowerCase());

            return (
              <div
                key={act.id}
                className="p-3 rounded-2xl border-2 border-[#1B2036] bg-[#F6EFDC] shadow-[3px_3px_0px_#1B2036] transition-all hover:bg-[#FAF6EB] flex items-start gap-2.5"
              >
                {/* Friend Avatar / Badge Icon (Clickable -> Friend Profile) */}
                <button
                  type="button"
                  onClick={() => onViewFriendProfile(friendObj)}
                  className="w-9 h-9 rounded-xl border-2 border-[#1B2036] bg-[#EFE6CC] hover:bg-amber-200 flex items-center justify-center text-lg shrink-0 shadow-[1px_1px_0px_#1B2036] cursor-pointer transition active:scale-95 group"
                  title={lang === 'PT' ? `Ver perfil de ${friendObj.username}` : `View ${friendObj.username}'s profile`}
                >
                  <span className="group-hover:scale-110 transition-transform">
                    {levelInfo.badge}
                  </span>
                </button>

                {/* Main Activity Details */}
                <div className="flex-1 min-w-0">
                  {/* Action Description */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Friend Name (Clickable) */}
                    <button
                      type="button"
                      onClick={() => onViewFriendProfile(friendObj)}
                      className="text-[10.5px] font-black font-press text-[#1B2036] hover:text-amber-700 hover:underline cursor-pointer truncate max-w-[130px] sm:max-w-none text-left"
                      title={lang === 'PT' ? 'Ver perfil do amigo' : 'View friend profile'}
                    >
                      {friendObj.username}
                    </button>

                    {/* Action Verb */}
                    <span className="text-[10px] text-zinc-700 font-sans">
                      {act.type === 'checkin' && (
                        <span>{lang === 'PT' ? 'fez check-in no' : 'checked in at'}</span>
                      )}
                      {act.type === 'badge' && (
                        <span>{lang === 'PT' ? 'conquistou o badge' : 'earned the badge'}</span>
                      )}
                      {act.type === 'rating' && (
                        <span>{lang === 'PT' ? 'avaliou o spot' : 'rated spot'}</span>
                      )}
                    </span>

                    {/* Target Spot or Badge */}
                    {act.type === 'checkin' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (spotObj) onSelectSpot(spotObj);
                        }}
                        className="text-[10.5px] font-extrabold font-display text-[#12908C] hover:text-[#0e7471] hover:underline cursor-pointer inline-flex items-center gap-0.5"
                        title={lang === 'PT' ? 'Ver detalhes do spot' : 'View spot details'}
                      >
                        <MapPin className="w-3 h-3 shrink-0 text-[#12908C]" />
                        <span className="truncate max-w-[140px] sm:max-w-none">{act.spotName}</span>
                      </button>
                    )}

                    {act.type === 'badge' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#EFE6CC] border border-[#1B2036] text-[9px] font-bold font-press text-amber-800">
                        <span>{act.badgeIcon || '🏆'}</span>
                        <span className="truncate max-w-[130px] sm:max-w-none">{act.badgeName}</span>
                      </span>
                    )}

                    {act.type === 'rating' && (
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (spotObj) onSelectSpot(spotObj);
                          }}
                          className="text-[10.5px] font-extrabold font-display text-[#12908C] hover:underline cursor-pointer"
                        >
                          {act.spotName}
                        </button>
                        <div className="flex items-center text-amber-500">
                          {[...Array(act.stars || 5)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-current" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sub-meta: Beer Style & Relative Time */}
                  <div className="flex items-center gap-2 mt-1 text-[8.5px] font-mono text-zinc-600 flex-wrap">
                    {act.beerStyle && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-600/30 text-amber-900 font-bold">
                        <Beer className="w-2.5 h-2.5" />
                        {act.beerStyle}
                      </span>
                    )}

                    {act.spotZone && (
                      <span className="text-zinc-500">📍 {act.spotZone}</span>
                    )}

                    <span className="text-zinc-400">•</span>

                    <span className="text-zinc-500">
                      🕒 {lang === 'PT' ? act.relativeTimePt : act.relativeTimeEn}
                    </span>
                  </div>
                </div>

                {/* Right Quick Action: View Spot or View Friend Profile */}
                <div className="shrink-0 self-center flex items-center gap-1">
                  {act.type === 'checkin' && spotObj && (
                    <button
                      type="button"
                      onClick={() => onSelectSpot(spotObj)}
                      className="px-2 py-1 rounded-lg border border-[#1B2036] bg-[#12908C] hover:bg-[#12908C]/90 text-white text-[7.5px] font-bold font-press uppercase tracking-wider flex items-center gap-1 shadow-[1px_1px_0px_#1B2036] active:scale-95 cursor-pointer transition"
                      title={lang === 'PT' ? 'Ver Spot' : 'View Spot'}
                    >
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{lang === 'PT' ? 'Spot' : 'Spot'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onViewFriendProfile(friendObj)}
                    className="p-1 rounded-lg border border-[#1B2036] bg-[#EFE6CC] hover:bg-[#F2A93B] text-[#1B2036] text-[8px] font-bold shadow-[1px_1px_0px_#1B2036] active:scale-95 cursor-pointer transition"
                    title={lang === 'PT' ? `Ver perfil de ${friendObj.username}` : `View ${friendObj.username}'s profile`}
                  >
                    <User className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
