/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PixelCheckinAnimationProps {
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  id?: string;
}

// Retro 8-Bit Pixel Color Palette
const PIXEL_PALETTE = [
  '#FFCA00', // Hop Map Gold
  '#F59E0B', // Amber
  '#10B981', // Emerald Green (Success)
  '#3B82F6', // Electric Blue
  '#EC4899', // Magenta
  '#A855F7', // Purple
  '#FACC15', // Neon Yellow
  '#FFFFFF', // Foam White
  '#FB923C', // Orange
];

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  shape: 'square' | 'rect' | 'cross' | 'star';
  rotation: number;
  delay: number;
  scale: number;
}

// Generate 28 crisp pixel confetti particles
function generateConfettiParticles(count = 28): Particle[] {
  return Array.from({ length: count }).map((_, idx) => {
    const angle = (idx / count) * 360 + (Math.random() * 20 - 10);
    const distance = 35 + Math.random() * 60; // Spreads outwards from button
    const rad = (angle * Math.PI) / 180;
    const shapeTypes: ('square' | 'rect' | 'cross' | 'star')[] = ['square', 'rect', 'cross', 'star'];
    const shape = shapeTypes[idx % shapeTypes.length];

    return {
      id: idx,
      x: Math.cos(rad) * distance,
      y: Math.sin(rad) * distance + (Math.random() * 20), // Downward gravity drift
      size: shape === 'rect' ? 6 : shape === 'star' ? 8 : shape === 'cross' ? 7 : 5 + (idx % 3) * 2,
      color: PIXEL_PALETTE[idx % PIXEL_PALETTE.length],
      shape,
      rotation: Math.floor(Math.random() * 4) * 90, // Crisp 8-bit angles (0, 90, 180, 270)
      delay: Math.random() * 0.1,
      scale: 0.7 + Math.random() * 0.7,
    };
  });
}

// 8-Bit Pixel Cross Particle (+)
function PixelCrossShape({ color, size }: { color: string; size: number }) {
  return (
    <div
      className="grid grid-cols-3 grid-rows-3 select-none pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        imageRendering: 'pixelated',
      }}
    >
      <div />
      <div style={{ backgroundColor: color }} />
      <div />
      <div style={{ backgroundColor: color }} />
      <div style={{ backgroundColor: color }} />
      <div style={{ backgroundColor: color }} />
      <div />
      <div style={{ backgroundColor: color }} />
      <div />
    </div>
  );
}

// 8-Bit Pixel Star Particle
function PixelStarShape({ color, size }: { color: string; size: number }) {
  const grid = [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
  ];

  return (
    <div
      className="grid grid-cols-5 grid-rows-5 select-none pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        imageRendering: 'pixelated',
      }}
    >
      {grid.map((row, r) =>
        row.map((val, c) => (
          <div
            key={`${r}-${c}`}
            style={{ backgroundColor: val ? color : 'transparent' }}
          />
        ))
      )}
    </div>
  );
}

export default function PixelCheckinAnimation({
  isActive,
  children,
  className = '',
  containerClassName = 'w-full',
  onClick,
  disabled = false,
  id,
}: PixelCheckinAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [triggerKey, setTriggerKey] = useState(0);

  useEffect(() => {
    if (isActive) {
      setParticles(generateConfettiParticles(32));
      setTriggerKey((prev) => prev + 1);
    }
  }, [isActive]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Also trigger immediate local particle animation on click for tactile feel
    setParticles(generateConfettiParticles(28));
    setTriggerKey((prev) => prev + 1);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div className={`relative overflow-visible select-none ${containerClassName}`}>
      {/* 8-BIT CORNER SPARKLES & GLOW RING WHEN ACTIVE */}
      <AnimatePresence>
        {isActive && (
          <>
            {/* Retro Pixel Glow Pulse Ring around button */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{
                scale: [0.95, 1.08, 1],
                opacity: [0, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute -inset-1.5 rounded-2xl pointer-events-none z-0 border-2 border-dashed border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(255,202,0,0.8)]"
              style={{ imageRendering: 'pixelated' }}
            />

            {/* Corner 8-Bit Pixel Sparkles */}
            {[
              { top: '-10px', left: '-10px' },
              { top: '-10px', right: '-10px' },
              { bottom: '-10px', left: '-10px' },
              { bottom: '-10px', right: '-10px' },
            ].map((pos, i) => (
              <motion.div
                key={`sparkle-${i}`}
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1.3, 0.9, 1.2, 0],
                  rotate: [0, 90, 180, 270],
                }}
                transition={{ duration: 1.1, delay: i * 0.08, ease: 'easeInOut' }}
                className="absolute z-20 pointer-events-none"
                style={{ ...pos }}
              >
                <PixelStarShape color={i % 2 === 0 ? '#FFCA00' : '#FFFFFF'} size={12} />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* PIXELATED CONFETTI BURST OVERLAY */}
      <AnimatePresence mode="popLayout">
        {triggerKey > 0 && particles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-visible z-50 flex items-center justify-center">
            {particles.map((p) => (
              <motion.div
                key={`${triggerKey}-${p.id}`}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 1,
                  rotate: 0,
                }}
                animate={{
                  x: p.x,
                  y: p.y,
                  scale: [0, p.scale, p.scale * 0.8, 0],
                  opacity: [1, 1, 0.9, 0],
                  rotate: [0, p.rotation, p.rotation + 180],
                }}
                transition={{
                  duration: 1.25,
                  ease: 'easeOut',
                  delay: p.delay,
                }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {p.shape === 'star' ? (
                  <PixelStarShape color={p.color} size={p.size} />
                ) : p.shape === 'cross' ? (
                  <PixelCrossShape color={p.color} size={p.size} />
                ) : p.shape === 'rect' ? (
                  <div
                    style={{
                      width: `${p.size}px`,
                      height: `${p.size * 1.8}px`,
                      backgroundColor: p.color,
                      imageRendering: 'pixelated',
                      boxShadow: '0 0 2px rgba(0,0,0,0.3)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      backgroundColor: p.color,
                      imageRendering: 'pixelated',
                      boxShadow: '0 0 2px rgba(0,0,0,0.3)',
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* THE ACTUAL BUTTON WRAPPED WITH SMOOTH SPRING ANIMATION */}
      <motion.button
        id={id}
        disabled={disabled}
        onClick={handleClick}
        whileTap={{ scale: disabled ? 1 : 0.94 }}
        animate={
          isActive
            ? {
                scale: [1, 1.08, 0.96, 1.03, 1],
              }
            : {}
        }
        transition={{ duration: 0.6, type: 'spring', stiffness: 300, damping: 15 }}
        className={`relative z-10 w-full ${className}`}
      >
        {children}
      </motion.button>
    </div>
  );
}
