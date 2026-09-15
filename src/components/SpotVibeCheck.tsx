import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { Language } from '../lib/i18n';
import { SpotVibeKey, SpotVibeOption, SpotVibeVote, UserProfile } from '../types';
import { Zap, Clock, ThumbsUp, AlertCircle, CheckCircle2, Lock, MapPin } from 'lucide-react';

export const SPOT_VIBE_OPTIONS: SpotVibeOption[] = [
  {
    key: 'dead',
    id: 1,
    emoji: '😴',
    titlePT: 'Parado',
    titleEN: 'Dead',
    descPT: 'Pouca gente',
    descEN: 'Few people',
    colorClass: 'text-zinc-400 border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800',
    bgClass: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'
  },
  {
    key: 'chill',
    id: 2,
    emoji: '🧘',
    titlePT: 'Sossegado',
    titleEN: 'Chill',
    descPT: 'Ambiente calmo para conversar',
    descEN: 'Calm & relaxing',
    colorClass: 'text-sky-400 border-sky-600/40 bg-sky-950/30 hover:bg-sky-900/40',
    bgClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
  },
  {
    key: 'good',
    id: 3,
    emoji: '👌',
    titlePT: 'Bom',
    titleEN: 'Good',
    descPT: 'Aconchegante e animado q.b.',
    descEN: 'Cozy & lively',
    colorClass: 'text-emerald-400 border-emerald-600/40 bg-emerald-950/30 hover:bg-emerald-900/40',
    bgClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  },
  {
    key: 'great',
    id: 4,
    emoji: '🔥',
    titlePT: 'Excelente',
    titleEN: 'Great',
    descPT: 'Muito boa vibe / cheio',
    descEN: 'Buzzing / Full',
    colorClass: 'text-amber-400 border-amber-600/40 bg-amber-950/30 hover:bg-amber-900/40',
    bgClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  {
    key: 'lit',
    id: 5,
    emoji: '🚀',
    titlePT: 'Ao Rubro!',
    titleEN: 'Lit!',
    descPT: 'Festa / Casa cheia',
    descEN: 'Party / Packed',
    colorClass: 'text-rose-400 border-rose-600/40 bg-rose-950/30 hover:bg-rose-900/40',
    bgClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  }
];

const ONE_HOUR_MS = 60 * 60 * 1000;
const LOCAL_STORAGE_VIBES_KEY = 'hopmap_local_spot_vibes_v1';

function getLocalVotes(): SpotVibeVote[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VIBES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalVote(vote: SpotVibeVote) {
  try {
    const existing = getLocalVotes();
    existing.push(vote);
    // Keep only last 200 votes
    const trimmed = existing.slice(-200);
    localStorage.setItem(LOCAL_STORAGE_VIBES_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Error saving local vote', e);
  }
}

interface SpotVibeCheckProps {
  spotId: string;
  spotName: string;
  spotLatitude?: number;
  spotLongitude?: number;
  userLocation?: { latitude: number; longitude: number };
  user: UserProfile;
  lang?: Language;
  darkMode?: boolean;
  distanceMeters?: number;
  isWithin50m?: boolean;
  onVoted?: (vibe: SpotVibeKey) => void;
  onUserLocationChange?: (location: { latitude: number; longitude: number }) => void;
}

function calculateHaversineDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function SpotVibeCheck({
  spotId,
  spotName,
  spotLatitude,
  spotLongitude,
  userLocation,
  user,
  lang = 'PT',
  darkMode = true,
  distanceMeters = 999,
  isWithin50m = false,
  onVoted,
  onUserLocationChange
}: SpotVibeCheckProps) {
  const [votes, setVotes] = useState<SpotVibeVote[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Compute precise distance in meters
  const computedDistance = (spotLatitude !== undefined && spotLongitude !== undefined && userLocation?.latitude !== undefined && userLocation?.longitude !== undefined)
    ? calculateHaversineDistanceInMeters(userLocation.latitude, userLocation.longitude, spotLatitude, spotLongitude)
    : distanceMeters;

  // Proximity is strictly valid ONLY when within 50 meters (strictly matches check-in rule)
  const canVoteByProximity = (isWithin50m || isWithin50m === undefined) && computedDistance <= 50;

  // Real-time listener for this spot's vibes
  useEffect(() => {
    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(db, 'spot_vibes'),
          where('spotId', '==', spotId)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetched: SpotVibeVote[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            fetched.push({
              id: doc.id,
              spotId: data.spotId,
              userId: data.userId,
              username: data.username || 'Anónimo',
              vibe: data.vibe as SpotVibeKey,
              timestamp: data.timestamp || new Date().toISOString()
            });
          });
          setVotes(fetched);
        }, (err) => {
          console.warn('Firestore vibe listener note:', err?.message || err);
          const local = getLocalVotes().filter(v => v.spotId === spotId);
          setVotes(local);
        });

        return () => unsubscribe();
      } catch (err) {
        console.warn('Vibe listener setup failed:', err);
        const local = getLocalVotes().filter(v => v.spotId === spotId);
        setVotes(local);
      }
    } else {
      const local = getLocalVotes().filter(v => v.spotId === spotId);
      setVotes(local);
    }
  }, [spotId]);

  // Compute 1-hour active votes
  const now = Date.now();
  const recentVotes = votes.filter((v) => {
    const voteTime = new Date(v.timestamp).getTime();
    return !isNaN(voteTime) && (now - voteTime) < ONE_HOUR_MS;
  });

  // Calculate vote counts per vibe
  const voteCounts: Record<SpotVibeKey, number> = {
    dead: 0,
    chill: 0,
    good: 0,
    great: 0,
    lit: 0
  };

  recentVotes.forEach(v => {
    if (voteCounts[v.vibe] !== undefined) {
      voteCounts[v.vibe] += 1;
    }
  });

  // Find winning vibe
  let winningVibeKey: SpotVibeKey | null = null;
  let maxCount = 0;
  Object.entries(voteCounts).forEach(([k, count]) => {
    if (count > maxCount) {
      maxCount = count;
      winningVibeKey = k as SpotVibeKey;
    }
  });

  const winningOption = SPOT_VIBE_OPTIONS.find(o => o.key === winningVibeKey);

  // Check if current user has voted in the last 60 minutes for this spot
  const userRecentVote = recentVotes.find(v => v.userId === user.id);
  const minutesUntilNextVote = userRecentVote 
    ? Math.max(1, Math.ceil((ONE_HOUR_MS - (now - new Date(userRecentVote.timestamp).getTime())) / (60 * 1000)))
    : 0;

  const performVoteSubmission = async (vibeKey: SpotVibeKey) => {
    setIsSubmitting(true);
    const newVote: SpotVibeVote = {
      id: `vibe_${Date.now()}_${user.id}`,
      spotId,
      userId: user.id,
      username: user.username || 'User',
      vibe: vibeKey,
      timestamp: new Date().toISOString()
    };

    saveLocalVote(newVote);

    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db, 'spot_vibes'), {
          spotId,
          userId: user.id,
          username: user.username || 'User',
          vibe: vibeKey,
          timestamp: new Date().toISOString(),
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('Error saving vibe to Firestore:', err);
      }
    }

    // Immediate local state update
    setVotes(prev => [...prev.filter(v => v.id !== newVote.id), newVote]);
    setIsSubmitting(false);

    setFeedbackMsg({
      text: lang === 'PT' ? 'Obrigado pelo teu voto em tempo real! 🍻' : 'Thanks for your real-time vote! 🍻',
      type: 'success'
    });
    setTimeout(() => setFeedbackMsg(null), 3000);

    if (onVoted) {
      onVoted(vibeKey);
    }
  };

  const handleVote = async (vibeKey: SpotVibeKey) => {
    if (!user.isLoggedIn) {
      setFeedbackMsg({
        text: lang === 'PT' ? 'Inicia sessão para classificar o ambiente!' : 'Log in to rate the vibe!',
        type: 'error'
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    if (userRecentVote) {
      setFeedbackMsg({
        text: lang === 'PT' 
          ? `Já votaste recentemente. Podes votar novamente em ${minutesUntilNextVote} min.` 
          : `You already voted. You can vote again in ${minutesUntilNextVote} min.`,
        type: 'error'
      });
      setTimeout(() => setFeedbackMsg(null), 3500);
      return;
    }

    // If coordinates are present and browser geolocation is available, check with live high accuracy GPS
    if (typeof window !== 'undefined' && navigator.geolocation && spotLatitude !== undefined && spotLongitude !== undefined) {
      setIsSubmitting(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const preciseLat = position.coords.latitude;
          const preciseLng = position.coords.longitude;
          if (onUserLocationChange) {
            onUserLocationChange({ latitude: preciseLat, longitude: preciseLng });
          }
          const liveDist = calculateHaversineDistanceInMeters(preciseLat, preciseLng, spotLatitude, spotLongitude);
          if (liveDist > 50) {
            setIsSubmitting(false);
            setFeedbackMsg({
              text: lang === 'PT'
                ? `Classificação bloqueada: precisas de estar a menos de 50m do spot (estás a ${Math.round(liveDist)} metros com GPS).`
                : `Rating locked: you must be within 50m of the spot (you are ${Math.round(liveDist)} meters away with GPS).`,
              type: 'warning'
            });
            setTimeout(() => setFeedbackMsg(null), 4500);
            return;
          }
          performVoteSubmission(vibeKey);
        },
        (error) => {
          if (computedDistance > 50 || !canVoteByProximity) {
            setIsSubmitting(false);
            setFeedbackMsg({
              text: lang === 'PT'
                ? `Classificação bloqueada: precisas de estar a menos de 50m do spot (estás a ${Math.round(computedDistance)}m).`
                : `Rating locked: you must be within 50m of the spot (you are ${Math.round(computedDistance)}m away).`,
              type: 'warning'
            });
            setTimeout(() => setFeedbackMsg(null), 4500);
            return;
          }
          performVoteSubmission(vibeKey);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
      return;
    }

    if (!canVoteByProximity || computedDistance > 50) {
      setFeedbackMsg({
        text: lang === 'PT' 
          ? `Classificação bloqueada: precisas de estar a menos de 50m do spot (estás a ${Math.round(computedDistance)}m).` 
          : `Rating locked: you must be within 50m of the spot (you are ${Math.round(computedDistance)}m away).`,
        type: 'warning'
      });
      setTimeout(() => setFeedbackMsg(null), 4500);
      return;
    }

    performVoteSubmission(vibeKey);
  };

  return (
    <div className="p-3.5 rounded-2xl border-2 border-[#1B2036] bg-white text-[#1B2036] shadow-[2px_2px_0px_#1B2036] transition-all" id={`spot-vibe-box-${spotId}`}>
      {/* Header with Live Pulse */}
      <div className="flex items-center justify-between border-b-2 border-[#1B2036]/15 pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <h4 className="text-[11px] font-extrabold uppercase tracking-widest font-display text-[#1B2036]">
            {lang === 'PT' ? 'Ambiente Local' : 'Local Vibe'}
          </h4>
        </div>
        <div className="flex items-center space-x-1 text-[9px] font-mono text-[#1B2036] bg-[#F6EFDC] px-2 py-0.5 rounded-md border border-[#1B2036]/40 font-bold">
          <Clock className="w-2.5 h-2.5 text-amber-600" />
          <span>{lang === 'PT' ? 'Expira em 1h' : 'Expires in 1h'}</span>
        </div>
      </div>

      {/* Current Mood Display */}
      <div className="mt-3 py-2 px-3 rounded-xl bg-[#FAF6EB] border-2 border-[#1B2036] flex items-center justify-between shadow-[1.5px_1.5px_0px_#1B2036]">
        {winningOption ? (
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">{winningOption.emoji}</span>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black font-display text-[#1B2036]">
                  {lang === 'PT' ? winningOption.titlePT : winningOption.titleEN}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-[#F2A93B] text-black border border-[#1B2036]">
                  {recentVotes.length} {recentVotes.length === 1 ? (lang === 'PT' ? 'voto' : 'vote') : (lang === 'PT' ? 'votos' : 'votes')}
                </span>
              </div>
              <p className="text-[9.5px] text-[#1B2036]/80 font-medium">
                {lang === 'PT' ? winningOption.descPT : winningOption.descEN}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-[#1B2036]/70">
            <span className="text-lg">🍻</span>
            <p className="text-[10px] font-medium italic">
              {lang === 'PT' 
                ? 'Sem dados recentes — Sê o primeiro a classificar!' 
                : 'No recent data — Be the first to rate!'}
            </p>
          </div>
        )}
      </div>

      {/* 5 Vibe Selection Buttons */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#1B2036]/75 font-display">
            {lang === 'PT' ? 'Como está o ambiente agora?' : 'How is the vibe right now?'}
          </p>
          {!canVoteByProximity && (
            <span className="text-[8px] font-mono font-bold text-rose-600 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              {lang === 'PT' ? `Apenas a <50m (${Math.round(computedDistance)}m)` : `Only <50m (${Math.round(computedDistance)}m)`}
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {SPOT_VIBE_OPTIONS.map((opt) => {
            const isUserSelection = userRecentVote?.vibe === opt.key;
            const count = voteCounts[opt.key];
            const isDisabled = isSubmitting || !user.isLoggedIn || !!userRecentVote || !canVoteByProximity;

            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleVote(opt.key)}
                disabled={isDisabled}
                className={`py-2 px-1 rounded-xl border-2 border-[#1B2036] flex flex-col items-center justify-center transition-all select-none shadow-[1.5px_1.5px_0px_#1B2036] ${
                  isUserSelection 
                    ? 'bg-[#F2A93B] text-black font-extrabold ring-2 ring-black' 
                    : !canVoteByProximity
                      ? 'bg-[#EFE6CC] text-zinc-400 opacity-60 cursor-not-allowed border-[#1B2036]/40 shadow-none'
                      : 'bg-[#F6EFDC] hover:bg-[#EFE6CC] text-[#1B2036]'
                } ${userRecentVote ? 'opacity-80 cursor-default' : (!canVoteByProximity ? 'cursor-not-allowed' : 'cursor-pointer active:translate-x-[1px] active:translate-y-[1px]')}`}
                id={`btn-vibe-${spotId}-${opt.key}`}
                title={
                  !canVoteByProximity
                    ? (lang === 'PT' ? `Votação bloqueada: estás a ${Math.round(computedDistance)}m do spot (necessário <50m)` : `Voting locked: you are ${Math.round(computedDistance)}m from spot (must be <50m)`)
                    : (lang === 'PT' ? `${opt.titlePT}: ${opt.descPT}` : `${opt.titleEN}: ${opt.descEN}`)
                }
              >
                <span className="text-lg mb-0.5">{opt.emoji}</span>
                <span className="text-[8px] font-extrabold tracking-tight font-display text-center truncate w-full">
                  {lang === 'PT' ? opt.titlePT : opt.titleEN}
                </span>
                {count > 0 && (
                  <span className="text-[7px] font-mono font-bold mt-0.5 text-[#1B2036]">
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Geofence Notice when outside 50m */}
      {!canVoteByProximity && (
        <div className="mt-2.5 flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-[8.5px] text-rose-600 font-mono">
          <MapPin className="w-3 h-3 text-rose-600 shrink-0 animate-pulse" />
          <span>
            {lang === 'PT'
              ? `Votação bloqueada: estás a ${Math.round(computedDistance)}m do local. Só podes votar a menos de 50 metros.`
              : `Voting locked: you are ${Math.round(computedDistance)}m away. You must be within 50 meters to vote.`}
          </span>
        </div>
      )}

      {/* User Voted Notice or Feedback */}
      {userRecentVote && (
        <div className="mt-2.5 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-600/30 text-[9px] text-[#1B2036] font-mono font-bold">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>
              {lang === 'PT' 
                ? `Votaste "${SPOT_VIBE_OPTIONS.find(o => o.key === userRecentVote.vibe)?.titlePT}"` 
                : `You voted "${SPOT_VIBE_OPTIONS.find(o => o.key === userRecentVote.vibe)?.titleEN}"`}
            </span>
          </div>
          <span className="text-zinc-600 font-normal">
            {lang === 'PT' ? `Próximo voto em ${minutesUntilNextVote} min` : `Next vote in ${minutesUntilNextVote} min`}
          </span>
        </div>
      )}

      {feedbackMsg && (
        <div className={`mt-2 flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[9.5px] font-medium ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
            : feedbackMsg.type === 'warning'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
        }`}>
          {feedbackMsg.type === 'success' ? (
            <ThumbsUp className="w-3 h-3 shrink-0" />
          ) : feedbackMsg.type === 'warning' ? (
            <Lock className="w-3 h-3 shrink-0 text-amber-400" />
          ) : (
            <AlertCircle className="w-3 h-3 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}
    </div>
  );
}

export function CompactSpotVibeBadge({
  spotId,
  lang = 'PT'
}: {
  spotId: string;
  lang?: Language;
}) {
  const [votes, setVotes] = useState<SpotVibeVote[]>([]);

  useEffect(() => {
    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(db, 'spot_vibes'),
          where('spotId', '==', spotId)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetched: SpotVibeVote[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            fetched.push({
              id: doc.id,
              spotId: data.spotId,
              userId: data.userId,
              username: data.username || 'Anónimo',
              vibe: data.vibe as SpotVibeKey,
              timestamp: data.timestamp || new Date().toISOString()
            });
          });
          setVotes(fetched);
        }, () => {
          setVotes(getLocalVotes().filter(v => v.spotId === spotId));
        });
        return () => unsubscribe();
      } catch {
        setVotes(getLocalVotes().filter(v => v.spotId === spotId));
      }
    } else {
      setVotes(getLocalVotes().filter(v => v.spotId === spotId));
    }
  }, [spotId]);

  const now = Date.now();
  const recentVotes = votes.filter((v) => {
    const voteTime = new Date(v.timestamp).getTime();
    return !isNaN(voteTime) && (now - voteTime) < ONE_HOUR_MS;
  });

  if (recentVotes.length === 0) return null;

  const voteCounts: Record<SpotVibeKey, number> = {
    dead: 0, chill: 0, good: 0, great: 0, lit: 0
  };
  recentVotes.forEach(v => {
    if (voteCounts[v.vibe] !== undefined) voteCounts[v.vibe]++;
  });

  let winningKey: SpotVibeKey | null = null;
  let maxCount = 0;
  Object.entries(voteCounts).forEach(([k, c]) => {
    if (c > maxCount) {
      maxCount = c;
      winningKey = k as SpotVibeKey;
    }
  });

  const opt = SPOT_VIBE_OPTIONS.find(o => o.key === winningKey);
  if (!opt) return null;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8.5px] font-bold border font-mono ${opt.bgClass}`}>
      <span>{opt.emoji}</span>
      <span>{lang === 'PT' ? opt.titlePT : opt.titleEN}</span>
    </span>
  );
}
