/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Beer, Award, Sparkles, Star } from 'lucide-react';
import { Language, t } from '../lib/i18n';
import { playStageClearSound } from '../lib/spotPinUtils';

interface RetroStageClearCelebrationProps {
  isOpen: boolean;
  spotName: string;
  lang: Language;
  onClose: () => void;
}

interface FloatingSprite {
  id: number;
  type: 'coin' | 'beer' | 'star' | 'hop';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  scale: number;
  rotation: number;
  delay: number;
}

export default function RetroStageClearCelebration({
  isOpen,
  spotName,
  lang,
  onClose,
}: RetroStageClearCelebrationProps) {
  const [sprites, setSprites] = useState<FloatingSprite[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Play 8-bit STAGE CLEAR Web Audio fanfare
      playStageClearSound();

      // Generate 26 floating coins and beer mugs
      const generated: FloatingSprite[] = Array.from({ length: 26 }).map((_, i) => {
        const angle = (i / 26) * 360 + (Math.random() * 20 - 10);
        const distance = 100 + Math.random() * 180;
        const rad = (angle * Math.PI) / 180;
        const types: ('coin' | 'beer' | 'star' | 'hop')[] = ['coin', 'beer', 'coin', 'star', 'beer', 'hop'];

        return {
          id: i,
          type: types[i % types.length],
          x: 0,
          y: 0,
          targetX: Math.cos(rad) * distance,
          targetY: Math.sin(rad) * distance - (40 + Math.random() * 60), // Upwards pop drift
          scale: 0.8 + Math.random() * 0.6,
          rotation: Math.floor(Math.random() * 8) * 45,
          delay: Math.random() * 0.15,
        };
      });

      setSprites(generated);

      // Auto close after 3.6s
      const timer = setTimeout(() => {
        onClose();
      }, 3600);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Dark radial spotlight vignette */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Floating Flying Sprites (Coins, Beers, Stars) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {sprites.map((s) => (
            <motion.div
              key={s.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: s.targetX,
                y: [0, s.targetY - 50, s.targetY + 200], // Arc with gravity
                scale: [0, s.scale * 1.3, s.scale, 0],
                opacity: [1, 1, 0.9, 0],
                rotate: [0, s.rotation, s.rotation * 2],
              }}
              transition={{ duration: 2.2, delay: s.delay, ease: 'easeOut' }}
              className="absolute text-2xl select-none"
            >
              {s.type === 'coin' ? (
                <span className="inline-block filter drop-shadow-[0_0_8px_rgba(255,202,0,0.8)]">
                  🪙
                </span>
              ) : s.type === 'beer' ? (
                <span className="inline-block filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
                  🍻
                </span>
              ) : s.type === 'hop' ? (
                <span className="inline-block filter drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
                  🌿
                </span>
              ) : (
                <span className="inline-block filter drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">
                  ⭐
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Central 8-Bit Banner */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotate: -6 }}
          animate={{
            scale: [0.3, 1.15, 1],
            opacity: 1,
            rotate: [-6, 2, 0],
          }}
          exit={{ scale: 0.5, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 14, stiffness: 220 }}
          className="relative z-10 px-6 py-6 rounded-2xl bg-[#F6EFDC] border-4 border-[#1B2036] text-center shadow-[6px_6px_0px_#1B2036] max-w-sm mx-4 text-[#1B2036]"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Pixel Sparkles Banner Top */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#E85B41] animate-spin" />
            <span className="text-[9px] font-label font-bold text-[#E85B41] tracking-widest uppercase">
              ★ HOP-MAP REWARD ★
            </span>
            <Sparkles className="w-4 h-4 text-[#E85B41] animate-spin" />
          </div>

          {/* STAGE CLEAR Header */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B2036] tracking-wider uppercase font-press">
            STAGE CLEAR! 🍻
          </h2>

          <div className="my-3 py-2 px-4 rounded-xl bg-[#EFE6CC] border-2 border-[#1B2036]">
            <p className="text-xs font-bold text-[#1B2036] uppercase font-press truncate">
              {spotName}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#12908C] border-2 border-[#1B2036] text-white font-data font-bold text-[10px] shadow-[2px_2px_0px_#1B2036]">
              +1 HOP POINT 🪙
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F2A93B] border-2 border-[#1B2036] text-[#1B2036] font-data font-bold text-[10px] shadow-[2px_2px_0px_#1B2036]">
              +1 STAMP 🍻
            </span>
          </div>

          <p className="text-xs text-[#1B2036]/80 font-body mt-3">
            {t('checkinSuccessCoin', lang)}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
