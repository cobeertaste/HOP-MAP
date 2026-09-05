import React from 'react';
import { SpecialEventInfo } from '../utils/specialEvents';

// Pixel Festive Shamrock (St. Patrick's)
export function PixelShamrock({ size = 20, className = '' }: { size?: number; className?: string }) {
  const grid = [
    "...GG...GG...",
    "..GGGG.GGGG..",
    "..GGGG.GGGG..",
    "...GG...GG...",
    "GG.........GG",
    "GGGG..G..GGGG",
    "GGGG..G..GGGG",
    ".GG..GGG..GG.",
    "....GGGGG....",
    ".....GGG.....",
    ".....GGG.....",
    "......G......"
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 13 12" className={`select-none ${className}`} style={{ imageRendering: 'pixelated' }}>
      {grid.map((row, r) => row.split('').map((c, col) => c === 'G' ? (
        <rect key={`${r}-${col}`} x={col} y={r} width={1} height={1} fill="#22C55E" />
      ) : null))}
    </svg>
  );
}

// Pixel Christmas Tree
export function PixelChristmasTree({ size = 22, className = '' }: { size?: number; className?: string }) {
  const grid = [
    ".....YY.....",
    ".....YY.....",
    "....GGGG....",
    "...GGGGGG...",
    "..GGGRGGGG..",
    ".GGGGGGGGGG.",
    "..GGGYGGGG..",
    ".GGGGGGGGGG.",
    "GGGGGGGGGGGG",
    "GGGGGRGGGGGG",
    "....WWWW....",
    "....WWWW...."
  ];
  const colors: Record<string, string> = {
    'Y': '#FFCA00',
    'G': '#16A34A',
    'R': '#EF4444',
    'W': '#78350F'
  };
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={`select-none ${className}`} style={{ imageRendering: 'pixelated' }}>
      {grid.map((row, r) => row.split('').map((c, col) => colors[c] ? (
        <rect key={`${r}-${col}`} x={col} y={r} width={1} height={1} fill={colors[c]} />
      ) : null))}
    </svg>
  );
}

// Pixel Santa Hat
export function PixelSantaHat({ size = 20, className = '' }: { size?: number; className?: string }) {
  const grid = [
    "........WW..",
    ".......WWWW.",
    "......RR....",
    ".....RRRR...",
    "....RRRRRR..",
    "...RRRRRRRR.",
    "..RRRRRRRRRR",
    ".RRRRRRRRRRR",
    "WWWWWWWWWWWW",
    "WWWWWWWWWWWW",
    "............",
    "............"
  ];
  const colors: Record<string, string> = {
    'W': '#FFFFFF',
    'R': '#DC2626'
  };
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={`select-none ${className}`} style={{ imageRendering: 'pixelated' }}>
      {grid.map((row, r) => row.split('').map((c, col) => colors[c] ? (
        <rect key={`${r}-${col}`} x={col} y={r} width={1} height={1} fill={colors[c]} />
      ) : null))}
    </svg>
  );
}

// Pixel Christmas Gift
export function PixelChristmasGift({ size = 20, className = '' }: { size?: number; className?: string }) {
  const grid = [
    "...YY..YY...",
    "..YYYYYYYY..",
    "....YYYY....",
    ".RRRRYYRRRR.",
    ".RRRRYYRRRR.",
    "YYYYYYYYYYYY",
    "YYYYYYYYYYYY",
    ".RRRRYYRRRR.",
    ".RRRRYYRRRR.",
    ".RRRRYYRRRR.",
    ".RRRRYYRRRR.",
    "............"
  ];
  const colors: Record<string, string> = {
    'Y': '#FFCA00',
    'R': '#DC2626'
  };
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={`select-none ${className}`} style={{ imageRendering: 'pixelated' }}>
      {grid.map((row, r) => row.split('').map((c, col) => colors[c] ? (
        <rect key={`${r}-${col}`} x={col} y={r} width={1} height={1} fill={colors[c]} />
      ) : null))}
    </svg>
  );
}

// Pixel Beer Toast / Cheers
export function PixelBeerToast({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      <span className="text-sm select-none">🍻</span>
    </div>
  );
}

// Pixel Reinheitsgebot Shield
export function PixelPureShield({ size = 20, className = '' }: { size?: number; className?: string }) {
  const grid = [
    "..YYYYYYYY..",
    ".YYYYYYYYYY.",
    "YY.BB..BB.YY",
    "YY.BB..BB.YY",
    "YYYY.BB.YYYY",
    "YYYY.BB.YYYY",
    ".YY..BB..YY.",
    ".YY..BB..YY.",
    "..YY....YY..",
    "...YYYYYY...",
    "....YYYY....",
    ".....YY....."
  ];
  const colors: Record<string, string> = {
    'Y': '#FFCA00',
    'B': '#3B82F6'
  };
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={`select-none ${className}`} style={{ imageRendering: 'pixelated' }}>
      {grid.map((row, r) => row.split('').map((c, col) => colors[c] ? (
        <rect key={`${r}-${col}`} x={col} y={r} width={1} height={1} fill={colors[c]} />
      ) : null))}
    </svg>
  );
}

// Pixel Crown / Chalice for St. Wenceslaus
export function PixelCrown({ size = 20, className = '' }: { size?: number; className?: string }) {
  const grid = [
    ".R...R...R..",
    ".Y...Y...Y..",
    ".YY.YYY.YY..",
    ".YYYYYYYYY..",
    "..YYYYYYY...",
    "..YYYYYYY...",
    "...YYYYY....",
    "...YYYYY....",
    "....YYY.....",
    "....YYY.....",
    "...YYYYY....",
    "..YYYYYYY..."
  ];
  const colors: Record<string, string> = {
    'Y': '#FFCA00',
    'R': '#EF4444'
  };
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={`select-none ${className}`} style={{ imageRendering: 'pixelated' }}>
      {grid.map((row, r) => row.split('').map((c, col) => colors[c] ? (
        <rect key={`${r}-${col}`} x={col} y={r} width={1} height={1} fill={colors[c]} />
      ) : null))}
    </svg>
  );
}

// Falling pixel snowflakes for Christmas season
export function PixelSnowEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      <div className="absolute top-1 left-[10%] animate-bounce text-[9px]">❄</div>
      <div className="absolute top-3 left-[25%] animate-pulse text-[8px]">✨</div>
      <div className="absolute top-2 left-[50%] animate-bounce text-[10px]" style={{ animationDelay: '0.3s' }}>❄</div>
      <div className="absolute top-3 left-[75%] animate-pulse text-[8px]" style={{ animationDelay: '0.7s' }}>✨</div>
      <div className="absolute top-1 left-[90%] animate-bounce text-[9px]" style={{ animationDelay: '0.5s' }}>❄</div>
    </div>
  );
}

interface SpecialEventsBannerProps {
  event: SpecialEventInfo | null;
  lang: 'PT' | 'EN';
  darkMode: boolean;
}

export function SpecialEventsBanner({ event, lang, darkMode }: SpecialEventsBannerProps) {
  if (!event) return null;

  const title = lang === 'PT' ? event.titlePT : event.titleEN;
  const subtitle = lang === 'PT' ? event.subtitlePT : event.subtitleEN;

  // St. Patrick's Day style
  if (event.type === 'st_patricks') {
    return (
      <div 
        id="special-event-banner-st-patricks"
        className="w-full relative overflow-hidden rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-emerald-950/90 text-white p-2.5 sm:p-3 shadow-lg shadow-emerald-950/50 select-none animate-fade-in"
      >
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 shrink-0">
            <PixelShamrock size={24} className="animate-bounce" />
            <PixelShamrock size={18} className="hidden sm:inline-block" />
          </div>

          <div className="text-center min-w-0 flex-1">
            <h2 
              className="text-xs sm:text-sm font-black font-press-start tracking-wider text-emerald-300 drop-shadow-md whitespace-normal leading-relaxed"
              style={{ textShadow: '1px 1px 0px #064E3B, 2px 2px 0px #022C22' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-[9px] sm:text-[10px] text-emerald-100 font-mono font-bold mt-0.5 tracking-wide">
                🍀 {subtitle} 🍀
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <PixelShamrock size={18} className="hidden sm:inline-block" />
            <PixelShamrock size={24} className="animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  // Christmas / Boas Festas style
  if (event.type === 'christmas') {
    return (
      <div 
        id="special-event-banner-christmas"
        className="w-full relative overflow-hidden rounded-2xl border-2 border-red-500/80 bg-gradient-to-r from-red-950/90 via-emerald-950/80 to-red-950/90 text-white p-2.5 sm:p-3 shadow-lg shadow-black/60 select-none animate-fade-in"
      >
        <PixelSnowEffect />
        <div className="relative z-10 flex items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 shrink-0">
            <PixelChristmasTree size={24} className="animate-pulse" />
            <PixelSantaHat size={20} className="hidden sm:inline-block" />
          </div>

          <div className="text-center min-w-0 flex-1">
            <h2 
              className="text-xs sm:text-sm font-black font-press-start tracking-wider text-amber-300 drop-shadow-md whitespace-normal leading-relaxed"
              style={{ textShadow: '1.5px 1.5px 0px #991B1B, 2.5px 2.5px 0px #000000' }}
            >
              🎄 {title} 🎅
            </h2>
            {subtitle && (
              <p className="text-[9px] sm:text-[10px] text-zinc-200 font-mono font-bold mt-0.5 tracking-wide">
                🎁 {subtitle} ⭐
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <PixelChristmasGift size={20} className="hidden sm:inline-block" />
            <PixelChristmasTree size={24} className="animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // International Beer Day
  if (event.type === 'beer_day') {
    return (
      <div 
        id="special-event-banner-beer-day"
        className="w-full relative overflow-hidden rounded-2xl border-2 border-[#1B2036] bg-[#F2A93B] text-[#1B2036] p-2.5 sm:p-3 shadow-[3px_3px_0px_#1B2036] select-none animate-fade-in"
      >
        <div className="relative z-10 flex items-center justify-between gap-2.5">
          <div className="flex items-center space-x-1.5 shrink-0 text-xl animate-bounce">
            🍻
          </div>

          <div className="text-center min-w-0 flex-1">
            <h2 
              className="text-xs sm:text-sm font-black font-press tracking-wider text-[#1B2036] drop-shadow-sm whitespace-normal leading-relaxed"
            >
              🍻 {title} 🍻
            </h2>
            {subtitle && (
              <p className="text-[9px] sm:text-[10px] text-[#1B2036]/80 font-data font-bold mt-0.5 tracking-wide">
                ✨ {subtitle} ✨
              </p>
            )}
          </div>

          <div className="flex items-center space-x-1.5 shrink-0 text-xl animate-bounce">
            🍻
          </div>
        </div>
      </div>
    );
  }

  // Reinheitsgebot Day
  if (event.type === 'reinheitsgebot') {
    return (
      <div 
        id="special-event-banner-reinheitsgebot"
        className="w-full relative overflow-hidden rounded-2xl border-2 border-[#1B2036] bg-[#12908C] text-[#F6EFDC] p-2.5 sm:p-3 shadow-[3px_3px_0px_#1B2036] select-none animate-fade-in"
      >
        <div className="relative z-10 flex items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 shrink-0">
            <PixelPureShield size={22} className="animate-pulse" />
          </div>

          <div className="text-center min-w-0 flex-1">
            <h2 
              className="text-xs sm:text-sm font-black font-press tracking-wider text-[#F6EFDC] whitespace-normal leading-relaxed"
            >
              📜 {title} 📜
            </h2>
            {subtitle && (
              <p className="text-[9px] sm:text-[10px] text-[#F6EFDC]/90 font-data font-bold mt-0.5 tracking-wide">
                💧 {subtitle} 🌾
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <PixelPureShield size={22} className="animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // St. Wenceslaus Day
  if (event.type === 'wenceslaus') {
    return (
      <div 
        id="special-event-banner-wenceslaus"
        className="w-full relative overflow-hidden rounded-2xl border-2 border-[#1B2036] bg-[#E85B41] text-[#F6EFDC] p-2.5 sm:p-3 shadow-[3px_3px_0px_#1B2036] select-none animate-fade-in"
      >
        <div className="relative z-10 flex items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 shrink-0">
            <PixelCrown size={22} className="animate-pulse" />
          </div>

          <div className="text-center min-w-0 flex-1">
            <h2 
              className="text-xs sm:text-sm font-black font-press tracking-wider text-[#F6EFDC] whitespace-normal leading-relaxed"
            >
              👑 {title} 👑
            </h2>
            {subtitle && (
              <p className="text-[9px] sm:text-[10px] text-[#F6EFDC]/90 font-data font-bold mt-0.5 tracking-wide">
                🌿 {subtitle} 🌿
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <PixelCrown size={22} className="animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
