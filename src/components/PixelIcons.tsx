import React, { useState, useEffect } from 'react';

export function PixelPacman({ size = 32, className = '' }: { size?: number; className?: string }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f === 0 ? 1 : 0));
    }, 180);
    return () => clearInterval(timer);
  }, []);

  const openGrid = [
    "....YYYY....",
    "..YYYYYYYY..",
    ".YYYYYYYYYY.",
    "YYYYYYYY....",
    "YYYYYY......",
    "YYYY........",
    "YYYY........",
    "YYYYYY......",
    "YYYYYYYY....",
    ".YYYYYYYYYY.",
    "..YYYYYYYY..",
    "....YYYY...."
  ];

  const closedGrid = [
    "....YYYY....",
    "..YYYYYYYY..",
    ".YYYYYYYYYY.",
    "YYYYYYYYYYYY",
    "YYYYYYYYYYYY",
    "YYYYYYYYYYYY",
    "YYYYYYYYYYYY",
    "YYYYYYYYYYYY",
    "YYYYYYYYYYYY",
    ".YYYYYYYYYY.",
    "..YYYYYYYY..",
    "....YYYY...."
  ];

  const grid = frame === 0 ? openGrid : closedGrid;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 12 12" 
      className={`select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {grid.map((row, rIdx) => 
        row.split('').map((char, cIdx) => {
          if (char === '.') return null;
          return (
            <rect 
              key={`${rIdx}-${cIdx}`}
              x={cIdx}
              y={rIdx}
              width={1}
              height={1}
              fill="#FFCA00"
            />
          );
        })
      )}
    </svg>
  );
}

export function PixelIcon({
  name,
  size = 32,
  className = '',
  overrideColor
}: {
  name: 'pacman' | 'beer-mug' | 'hop' | 'ghost-red' | 'ghost-pink' | 'ghost-cyan' | 'ghost-orange' | 'compass' | 'map-pin' | 'calendar' | 'star' | 'user';
  size?: number;
  className?: string;
  overrideColor?: string;
}) {
  const getGridAndColors = () => {
    switch (name) {
      case 'compass': {
        const grid = [
          "....WWWW....",
          "..WWYYYYWW..",
          ".WYYYYYYYYW.",
          ".WYWYYYYYYW.",
          "WYWWYYYYYYYW",
          "WYWWWYYYYYYW",
          "WYYYYYWWWYWW",
          "WYYYYYYWWWYW",
          ".WYYYYYYYYW.",
          ".WYYYYYYYYW.",
          "..WWYYYYWW..",
          "....WWWW...."
        ];
        return {
          grid,
          colors: {
            'W': '#FFFFFF',
            'Y': overrideColor || '#FFCA00'
          }
        };
      }
      case 'map-pin': {
        const grid = [
          "....RRRR....",
          "..RRRRRRRR..",
          ".RRRRWWRRRR.",
          "RRRRWWWWRRRR",
          "RRRRWWWWRRRR",
          "RRRRWWRRRRRR",
          ".RRRRRRRRRR.",
          ".RRRRRRRRRR.",
          "..RRRRRRRR..",
          "...RRRRRR...",
          "....RRRR....",
          ".....RR....."
        ];
        return {
          grid,
          colors: {
            'R': overrideColor || '#FF0000',
            'W': '#FFFFFF'
          }
        };
      }
      case 'calendar': {
        const grid = [
          "..R.R..R.R..",
          ".WWWWWWWWWW.",
          "W.W.W.W.W.W.",
          "WWWWWWWWWWWW",
          "WBBWWBBWWBBW",
          "WBBWWBBWWBBW",
          "WWWWWWWWWWWW",
          "WBBWWBBWWBBW",
          "WBBWWBBWWBBW",
          "WWWWWWWWWWWW",
          ".WWWWWWWWWW.",
          "..WWWWWW...."
        ];
        return {
          grid,
          colors: {
            'R': '#FF0000',
            'W': '#FFFFFF',
            'B': overrideColor || '#00FFFF'
          }
        };
      }
      case 'star': {
        const grid = [
          ".....YY.....",
          ".....YY.....",
          "....YYYY....",
          ".YYYYYYYYYY.",
          "..YYYYYYYY..",
          "...YYYYYY...",
          "...YYYYYY...",
          "..YYYYYYYY..",
          ".YYYY..YYYY.",
          "YYY......YYY",
          "YY........YY",
          "............"
        ];
        return {
          grid,
          colors: {
            'Y': overrideColor || '#FFCA00'
          }
        };
      }
      case 'user': {
        const grid = [
          "....BBBB....",
          "..BBBBBBBB..",
          ".BBBBBBBBBB.",
          ".BBBBBBBBBB.",
          "..BBBBBBBB..",
          "....BBBB....",
          "..BBBBBBBB..",
          ".BBBBBBBBBB.",
          "BBBBBBBBBBBB",
          "BBBBBBBBBBBB",
          "BBBBBBBBBBBB",
          "BBBBBBBBBBBB"
        ];
        return {
          grid,
          colors: {
            'B': overrideColor || '#FFB8FF'
          }
        };
      }
      case 'pacman': {
        const grid = [
          "....YYYY....",
          "..YYYYYYYY..",
          ".YYYYYYYYYY.",
          "YYYYYYYY....",
          "YYYYYY......",
          "YYYY........",
          "YYYY........",
          "YYYYYY......",
          "YYYYYYYY....",
          ".YYYYYYYYYY.",
          "..YYYYYYYY..",
          "....YYYY...."
        ];
        return {
          grid,
          colors: {
            'Y': '#FFCA00'
          }
        };
      }
      case 'beer-mug': {
        const grid = [
          "..WWWWWW....",
          ".WWWWWWWW...",
          "WWWWWWWWWW..",
          "WWYYYYYYWWW.",
          ".WYYYYYYW.WW",
          ".WYYYYYYW..W",
          ".WYYYYYYW..W",
          ".WYYYYYYW.WW",
          ".WYYYYYYWWW.",
          ".WYYYYYYW...",
          ".WWWWWWWW...",
          "..WWWWWW...."
        ];
        return {
          grid,
          colors: {
            'W': '#FFFFFF',
            'Y': overrideColor || '#FFCA00'
          }
        };
      }
      case 'hop': {
        const grid = [
          ".....DD.....",
          "....DGGD....",
          "....DGGD....",
          "..DGDGGDGD..",
          ".DGGGDGGGD.",
          "DGGGDGGDGGGD",
          "DGGDGGGGGDGD",
          "DGDGDGGDGDGD",
          ".DGGGDGGGD.",
          "..DGGGGGGD..",
          "...DGGGGD...",
          "....DGGD...."
        ];
        return {
          grid,
          colors: {
            'G': overrideColor || '#22C55E',
            'D': '#15803D'
          }
        };
      }
      case 'ghost-red':
      case 'ghost-pink':
      case 'ghost-cyan':
      case 'ghost-orange': {
        const ghostColor = 
          name === 'ghost-red' ? '#FF0000' :
          name === 'ghost-pink' ? '#FFB8FF' :
          name === 'ghost-cyan' ? '#00FFFF' : '#FFB852';

        const grid = [
          ".....GG.....",
          "....GGGG....",
          "...GGGGGG...",
          "..GGGGGGGG..",
          ".GGWWGGWWGG.",
          ".GGWBGGWBGG.",
          "GGGGGGGGGGGG",
          "GGGGGGGGGGGG",
          "GGGGGGGGGGGG",
          ".GGGGGGGGGG.",
          "..GGGGGGGG..",
          "...GG..GG..."
        ];

        return {
          grid,
          colors: {
            'G': overrideColor || ghostColor,
            'W': '#FFFFFF',
            'B': '#2121DE'
          }
        };
      }
    }
  };

  const data = getGridAndColors();
  if (!data) return null;

  const { grid, colors } = data;
  const cols = 12;
  const rows = 12;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${cols} ${rows}`} 
      className={`select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {grid.map((row, rIdx) => 
        row.split('').map((char, cIdx) => {
          if (char === '.' || !colors[char]) return null;
          return (
            <rect 
              key={`${rIdx}-${cIdx}`}
              x={cIdx}
              y={rIdx}
              width={1}
              height={1}
              fill={colors[char]}
            />
          );
        })
      )}
    </svg>
  );
}

// Replicates the attached HOP-MAP logo with 3D shadow layers, central green hop in O, and splits in '-'
export function HopMapLogo({ className = '' }: { className?: string }) {
  const yellow = '#FFCA00';
  const strokeColor = '#0b0e17';
  
  return (
    <svg 
      viewBox="0 0 480 90" 
      className={`select-none ${className}`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* H */}
      <g transform="translate(10, 5)">
        {/* Shadow */}
        <path d="M0 0 H20 V32 H40 V0 H60 V80 H40 V48 H20 V80 H0 Z" fill="#000000" transform="translate(4,4)" />
        {/* 3D layer */}
        <path d="M0 0 H20 V32 H40 V0 H60 V80 H40 V48 H20 V80 H0 Z" fill={yellow} transform="translate(2,2)" />
        {/* Front main layer */}
        <path d="M0 0 H20 V32 H40 V0 H60 V80 H40 V48 H20 V80 H0 Z" fill={yellow} stroke={strokeColor} strokeWidth="4.5" strokeLinejoin="miter" />
        {/* Inner lines detail */}
        <line x1="10" y1="12" x2="10" y2="68" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50" y1="12" x2="50" y2="68" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* O */}
      <g transform="translate(80, 5)">
        {/* Shadow */}
        <circle cx="40" cy="40" r="40" fill="#000000" transform="translate(4,4)" />
        {/* 3D layer */}
        <circle cx="40" cy="40" r="40" fill={yellow} transform="translate(2,2)" />
        {/* Front circle */}
        <circle cx="40" cy="40" r="40" fill={yellow} stroke={strokeColor} strokeWidth="4.5" />
        {/* Inner dark circle */}
        <circle cx="40" cy="40" r="26" fill={strokeColor} stroke={strokeColor} strokeWidth="3.5" />
        {/* Green hop cone */}
        <g transform="translate(40, 40) scale(1.15)">
          {/* Central bract */}
          <path d="M -5,-12 C -5,-12 0,-15 5,-12 C 7,-10 7,-4 0,10 C -7,-4 -7,-10 -5,-12 Z" fill="#4EBD3A" stroke={strokeColor} strokeWidth="1.5" />
          {/* Left bract */}
          <path d="M -12,-6 C -15,-6 -13,0 -7,5 C -2,9 -1,11 -1,11" fill="#4EBD3A" stroke={strokeColor} strokeWidth="1.5" />
          {/* Right bract */}
          <path d="M 12,-6 C 15,-6 13,0 7,5 C 2,9 1,11 1,11" fill="#4EBD3A" stroke={strokeColor} strokeWidth="1.5" />
          {/* Top minor details */}
          <path d="M -5,-14 C -7,-17 -1,-19 0,-15" stroke={strokeColor} strokeWidth="1.2" fill="none" />
        </g>
      </g>

      {/* P */}
      <g transform="translate(170, 5)">
        {/* Shadow */}
        <path d="M0 0 H35 C50 0 55 12 55 21 C 55 30 50 42 35 42 H20 V80 H0 Z" fill="#000000" transform="translate(4,4)" />
        {/* 3D layer */}
        <path d="M0 0 H35 C50 0 55 12 55 21 C 55 30 50 42 35 42 H20 V80 H0 Z" fill={yellow} transform="translate(2,2)" />
        {/* Front P */}
        <path d="M0 0 H35 C50 0 55 12 55 21 C 55 30 50 42 35 42 H20 V80 H0 Z" fill={yellow} stroke={strokeColor} strokeWidth="4.5" strokeLinejoin="miter" />
        {/* Circle Cutout */}
        <circle cx="28" cy="21" r="7" fill={strokeColor} stroke={strokeColor} strokeWidth="3" />
        {/* Inner lines detail */}
        <line x1="10" y1="12" x2="10" y2="68" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="12" x2="32" y2="12" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* - */}
      <g transform="translate(235, 5)">
        {/* Upper hyphen block */}
        <g transform="translate(0, 26)">
          <rect x="0" y="0" width="25" height="12" rx="2" fill="#000000" transform="translate(4,4)" />
          <rect x="0" y="0" width="25" height="12" rx="2" fill={yellow} transform="translate(2,2)" />
          <rect x="0" y="0" width="25" height="12" rx="2" fill={yellow} stroke={strokeColor} strokeWidth="3.5" />
        </g>
        {/* Lower hyphen block */}
        <g transform="translate(10, 38)">
          <rect x="0" y="0" width="25" height="12" rx="2" fill="#000000" transform="translate(4,4)" />
          <rect x="0" y="0" width="25" height="12" rx="2" fill={yellow} transform="translate(2,2)" />
          <rect x="0" y="0" width="25" height="12" rx="2" fill={yellow} stroke={strokeColor} strokeWidth="3.5" />
        </g>
      </g>

      {/* M */}
      <g transform="translate(280, 5)">
        {/* Shadow */}
        <path d="M0 10 L22 10 L32 45 L42 10 L65 10 V80 H47 V36 L37 62 H27 L17 36 V80 H0 Z" fill="#000000" transform="translate(4,4)" />
        {/* 3D layer */}
        <path d="M0 10 L22 10 L32 45 L42 10 L65 10 V80 H47 V36 L37 62 H27 L17 36 V80 H0 Z" fill={yellow} transform="translate(2,2)" />
        {/* Front M */}
        <path d="M0 10 L22 10 L32 45 L42 10 L65 10 V80 H47 V36 L37 62 H27 L17 36 V80 H0 Z" fill={yellow} stroke={strokeColor} strokeWidth="4.5" strokeLinejoin="miter" />
        {/* Inner lines detail */}
        <line x1="9" y1="20" x2="9" y2="68" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="56" y1="20" x2="56" y2="68" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* A */}
      <g transform="translate(355, 5)">
        {/* Shadow */}
        <path d="M0 80 L32 10 L65 80 Z" fill="#000000" transform="translate(4,4)" />
        {/* 3D layer */}
        <path d="M0 80 L32 10 L65 80 Z" fill={yellow} transform="translate(2,2)" />
        {/* Front A */}
        <path d="M0 80 L32 10 L65 80 Z" fill={yellow} stroke={strokeColor} strokeWidth="4.5" strokeLinejoin="miter" />
        {/* Circle Cutout */}
        <circle cx="32.5" cy="58" r="8" fill={strokeColor} stroke={strokeColor} strokeWidth="3" />
        {/* Inner lines detail */}
        <line x1="32.5" y1="22" x2="32.5" y2="44" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* P */}
      <g transform="translate(425, 5)">
        {/* Shadow */}
        <path d="M0 0 H35 C50 0 55 12 55 21 C 55 30 50 42 35 42 H20 V80 H0 Z" fill="#000000" transform="translate(4,4)" />
        {/* 3D layer */}
        <path d="M0 0 H35 C50 0 55 12 55 21 C 55 30 50 42 35 42 H20 V80 H0 Z" fill={yellow} transform="translate(2,2)" />
        {/* Front P */}
        <path d="M0 0 H35 C50 0 55 12 55 21 C 55 30 50 42 35 42 H20 V80 H0 Z" fill={yellow} stroke={strokeColor} strokeWidth="4.5" strokeLinejoin="miter" />
        {/* Circle Cutout */}
        <circle cx="28" cy="21" r="7" fill={strokeColor} stroke={strokeColor} strokeWidth="3" />
        {/* Inner lines detail */}
        <line x1="10" y1="12" x2="10" y2="68" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="12" x2="32" y2="12" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Logo Component replicating the attached image (Square visual, Pac-Man eating hops + text "HOP MAP")
export function PixelLogo({ size = 180 }: { size?: number }) {
  return (
    <div 
      className="flex flex-col items-center justify-center p-6 bg-[#121828] border-4 border-white rounded-[24px] shadow-2xl relative select-none"
      style={{ width: size, height: size }}
    >
      <div className="flex items-center justify-center gap-2 mb-2 relative">
        {/* Large Pac-man facing right */}
        <div className="relative">
          <PixelPacman size={70} />
        </div>
        
        {/* Three green hops being eaten */}
        <div className="flex gap-1.5 animate-pulse">
          <PixelIcon name="hop" size={18} overrideColor="#22C55E" className="rotate-90" />
          <PixelIcon name="hop" size={18} overrideColor="#22C55E" className="rotate-90" />
          <PixelIcon name="hop" size={18} overrideColor="#22C55E" className="rotate-90" />
        </div>
      </div>

      {/* HOP MAP retro 3D-styled text */}
      <div className="text-center mt-1">
        <span className="text-xl font-bold tracking-wider font-press-start text-[#FFCA00] [text-shadow:_2px_2px_0px_#000,_4px_4px_0px_#7F7F7F]">
          HOP MAP
        </span>
      </div>
    </div>
  );
}
