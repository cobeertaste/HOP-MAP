import React from 'react';
import { SpecialEventInfo } from '../utils/specialEvents';
import gta6ViceSkyline from '../assets/images/gta6_vice_skyline_1795092472161.jpg';
import christmasWinterScene from '../assets/images/christmas_winter_scene_1795093770691.jpg';
import newyearFireworksSkyline from '../assets/images/newyear_fireworks_skyline_1795094667421.jpg';

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

// Pixel Firework Burst for New Year's Eve
export function PixelFirework({ size = 22, className = '' }: { size?: number; className?: string }) {
  const grid = [
    ".....YY.....",
    ".S...YY...S.",
    "..S..YY..S..",
    "...C.YY.C...",
    "....CYYC....",
    "YYYYWWWWYYYY",
    "YYYYWWWWYYYY",
    "....CYYC....",
    "...C.YY.C...",
    "..S..YY..S..",
    ".S...YY...S.",
    ".....YY....."
  ];
  const colors: Record<string, string> = {
    'Y': '#FFD770',
    'W': '#FFFDF5',
    'C': '#38BDF8',
    'S': '#FB7185'
  };
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={`select-none ${className}`} style={{ imageRendering: 'pixelated' }}>
      {grid.map((row, r) => row.split('').map((c, col) => colors[c] ? (
        <rect key={`${r}-${col}`} x={col} y={r} width={1} height={1} fill={colors[c]} />
      ) : null))}
    </svg>
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

  // GTA 6 / Vice Edition style (19-11-2026 to 22-11-2026)
  if (event.type === 'gta6') {
    return (
      <div
        id="special-event-banner-gta6"
        className="w-full relative overflow-hidden rounded-2xl border-2 border-[#FF5E93]/70 bg-[#180C2E] text-[#FFF7F2] px-4 py-3.5 shadow-[0_8px_24px_rgba(255,78,136,0.22)] select-none animate-fade-in"
      >
        <img
          src={gta6ViceSkyline}
          alt="Vice Sunset Boulevard"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-55 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#120822]/90 via-[#1D0D36]/75 to-[#120822]/90 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1 text-left sm:text-center">
            <div className="flex items-center sm:justify-center gap-2 text-[11px] font-semibold tracking-wider text-[#2EE6D6] uppercase">
              <span className="font-gta-script normal-case text-sm text-[#FF7EA8] tracking-normal">Vice City Vibes</span>
              <span aria-hidden="true">·</span>
              <span>19–22 Nov</span>
            </div>
            <h2
              className="text-base sm:text-xl font-bold tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FFB347] via-[#FF5E93] to-[#2EE6D6] mt-0.5 leading-tight"
              style={{ fontFamily: "'Oswald', sans-serif", textShadow: '0 2px 14px rgba(255, 94, 147, 0.25)' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#F3E8FF] font-medium mt-0.5 leading-snug">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

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

  // Christmas / Boas Festas style (Dec 1 – Dec 25)
  if (event.type === 'christmas') {
    return (
      <div 
        id="special-event-banner-christmas"
        className="w-full relative overflow-hidden rounded-2xl border-2 border-[#D62839] bg-[#0F241B] text-[#FFFDF7] px-3.5 py-3 shadow-[0_8px_24px_rgba(214,40,57,0.22)] select-none animate-fade-in"
      >
        <img
          src={christmasWinterScene}
          alt="Christmas Winter Forest"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-55 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1A13]/92 via-[#122D21]/78 to-[#0A1A13]/92 pointer-events-none" />
        <PixelSnowEffect />
        <div className="relative z-10 flex items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 shrink-0">
            <PixelChristmasTree size={24} className="animate-pulse" />
            <PixelSantaHat size={20} className="hidden sm:inline-block" />
          </div>

          <div className="text-center min-w-0 flex-1">
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-wider text-[#FFD166] uppercase mb-0.5">
              <span>1 – 25 Dez</span>
              <span aria-hidden="true">·</span>
              <span>Boas Festas</span>
            </div>
            <h2 
              className="text-xs sm:text-sm font-black font-press-start tracking-wider text-[#FFD166] drop-shadow-md whitespace-normal leading-relaxed"
              style={{ textShadow: '1.5px 1.5px 0px #991B1B, 2.5px 2.5px 0px #09140F' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-[#E4F0E9] font-medium mt-0.5 tracking-wide">
                {subtitle}
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

  // New Year's Eve / Passagem de Ano style (Dec 31 – Jan 1)
  if (event.type === 'new_year') {
    return (
      <div
        id="special-event-banner-new-year"
        className="w-full relative overflow-hidden rounded-2xl border-2 border-[#FFD770] bg-gradient-to-r from-[#0B1026] via-[#172047] to-[#0B1026] text-[#FFFDF5] px-3.5 py-3 shadow-[0_8px_24px_rgba(255,215,112,0.22)] select-none animate-fade-in"
      >
        <img
          src={newyearFireworksSkyline}
          alt="New Year Fireworks Skyline"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-55 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080C1F]/90 via-[#11193B]/75 to-[#080C1F]/90 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 shrink-0">
            <PixelFirework size={24} className="animate-pulse" />
          </div>

          <div className="text-center min-w-0 flex-1">
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-wider text-[#FFD770] uppercase mb-0.5">
              <span>31 Dez – 1 Jan</span>
              <span aria-hidden="true">·</span>
              <span>Passagem de Ano</span>
            </div>
            <h2
              className="text-xs sm:text-sm font-black font-press-start tracking-wider text-[#FFD770] drop-shadow-md whitespace-normal leading-relaxed"
              style={{ textShadow: '1.5px 1.5px 0px #B45309, 2.5px 2.5px 0px #080C1F' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-[#E2E8F0] font-medium mt-0.5 tracking-wide">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <PixelFirework size={24} className="animate-pulse" />
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
