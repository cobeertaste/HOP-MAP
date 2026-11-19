import React, { useState, useEffect } from 'react';

export function PixelPacman({ 
  size = 32, 
  className = '',
  santaHat = false,
  overrideColor
}: { 
  size?: number; 
  className?: string;
  santaHat?: boolean;
  overrideColor?: string;
}) {
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
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {santaHat && (
        <div className="absolute -top-2.5 -right-1 z-10 pointer-events-none animate-pulse">
          <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 12 12" style={{ imageRendering: 'pixelated' }}>
            <rect x="7" y="0" width="2" height="2" fill="#FFFFFF" />
            <rect x="5" y="2" width="2" height="2" fill="#DC2626" />
            <rect x="4" y="4" width="3" height="2" fill="#DC2626" />
            <rect x="2" y="6" width="6" height="2" fill="#DC2626" />
            <rect x="1" y="8" width="8" height="2" fill="#FFFFFF" />
          </svg>
        </div>
      )}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 12 12" 
        className="select-none"
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
                fill={overrideColor || "#F2A93B"}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}

export function PixelIcon({
  name,
  size = 32,
  className = '',
  overrideColor
}: {
  name: 'pacman' | 'beer-mug' | 'beer-glass' | 'hop' | 'ghost-red' | 'ghost-pink' | 'ghost-cyan' | 'ghost-orange' | 'compass' | 'map-pin' | 'calendar' | 'star' | 'user' | 'tap' | 'food' | 'pet' | 'terrace' | 'parking' | 'beershop' | 'route' | 'podium' | 'coin' | 'mic' | 'microphone' | 'chat-bubble' | 'speech-bubble' | 'balloon' | 'ticket' | 'christmas-tree' | 'santa-hat' | 'gift' | 'shamrock' | 'bell' | 'firework' | 'champagne' | 'heart' | 'carnation';
  size?: number;
  className?: string;
  overrideColor?: string;
}) {
  const getGridAndColors = () => {
    switch (name) {
      case 'christmas-tree': {
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
        return {
          grid,
          colors: {
            'Y': '#FFCA00',
            'G': '#16A34A',
            'R': '#EF4444',
            'W': '#78350F'
          }
        };
      }
      case 'santa-hat': {
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
        return {
          grid,
          colors: {
            'W': '#FFFFFF',
            'R': '#DC2626'
          }
        };
      }
      case 'gift': {
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
        return {
          grid,
          colors: {
            'Y': overrideColor || '#FFCA00',
            'R': '#DC2626'
          }
        };
      }
      case 'shamrock': {
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
        return {
          grid,
          colors: {
            'G': overrideColor || '#22C55E'
          }
        };
      }
      case 'bell': {
        const grid = [
          "....YYYY....",
          "....YYYY....",
          "...YYYYYY...",
          "...YYYYYY...",
          "..YYYYYYYY..",
          "..YYYYYYYY..",
          ".YYYYYYYYYY.",
          "YYYYYYYYYYYY",
          "YYYYYYYYYYYY",
          "....RRRR....",
          "....RRRR....",
          "............"
        ];
        return {
          grid,
          colors: {
            'Y': overrideColor || '#FFCA00',
            'R': '#EF4444'
          }
        };
      }
      case 'firework': {
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
        return {
          grid,
          colors: {
            'Y': overrideColor || '#FFD770',
            'W': '#FFFDF5',
            'C': '#38BDF8',
            'S': '#FB7185'
          }
        };
      }
      case 'champagne': {
        const grid = [
          "....WWWW....",
          "....YYYY....",
          "....YYYY....",
          "....YYYY....",
          ".....YY.....",
          ".....YY.....",
          ".....GG.....",
          ".....GG.....",
          ".....GG.....",
          ".....GG.....",
          "...GGGGGG...",
          "............"
        ];
        return {
          grid,
          colors: {
            'W': '#FFFDF5',
            'Y': overrideColor || '#FFD770',
            'G': '#CBD5E1'
          }
        };
      }
      case 'heart': {
        const grid = [
          "............",
          "..RR....RR..",
          ".RRRR..RRRR.",
          "RRRRR..RRRRR",
          "RRRRRRRRRRRR",
          "RRRRRRRRRRRR",
          ".RRRRRRRRRR.",
          "..RRRRRRRR..",
          "...RRRRRR...",
          "....RRRR....",
          ".....RR.....",
          "............"
        ];
        return {
          grid,
          colors: {
            'R': overrideColor || '#FB7185'
          }
        };
      }
      case 'carnation': {
        const grid = [
          "...RR..RR...",
          "..RRRRRRRR..",
          ".RRRWRRWRRR.",
          ".RRRRRRRRRR.",
          "..RRRRRRRR..",
          "...RRRRRR...",
          "....GGGG....",
          ".....GG.....",
          "...GGGGGG...",
          ".....GG.....",
          ".....GG.....",
          ".....GG....."
        ];
        return {
          grid,
          colors: {
            'R': overrideColor || '#EF4444',
            'W': '#FCA5A5',
            'G': '#22C55E'
          }
        };
      }
      case 'ticket': {
        const grid = [
          "............",
          ".TTTTTTTTTT.",
          "TTTTTTTTTTTT",
          "TT.TTTTTT.TT",
          "..TTTTTTTT..",
          "..TTTTTTTT..",
          "TT.TTTTTT.TT",
          "TTTTTTTTTTTT",
          "TT.TTTTTT.TT",
          "TTTTTTTTTTTT",
          ".TTTTTTTTTT.",
          "............"
        ];
        return {
          grid,
          colors: {
            'T': overrideColor || '#FFCA00'
          }
        };
      }
      case 'chat-bubble':
      case 'speech-bubble':
      case 'balloon': {
        const grid = [
          "..CCCCCCCC..",
          ".CCCCCCCCCC.",
          "CCCCCCCCCCCC",
          "CC..CC..CC.C",
          "CCCCCCCCCCCC",
          "CCCCCCCCCCCC",
          "CCCCCCCCCCCC",
          ".CCCCCCCCCC.",
          "..CCCCCCCC..",
          "..CCCC......",
          "..CC........",
          "............"
        ];
        return {
          grid,
          colors: {
            'C': overrideColor || '#38BDF8'
          }
        };
      }
      case 'podium': {
        const grid = [
          "....YYYY....",
          "...YYYYYY...",
          "....YYYY....",
          "..SSYYYY....",
          "..SSYYYY....",
          "..SSYYYYBB..",
          "..SSYYYYBB..",
          "..SSYYYYBB..",
          "SSSSYYYYBBBB",
          "SSSSYYYYBBBB",
          "DDDDDDDDDDDD",
          "............"
        ];
        return {
          grid,
          colors: {
            'Y': overrideColor || '#FFCA00',
            'S': '#E2E8F0',
            'B': '#F97316',
            'D': '#1E293B'
          }
        };
      }
      case 'coin': {
        const grid = [
          "....YYYY....",
          "..YYYYYYYY..",
          ".YYWWYYYYYY.",
          "YYWWYYDDYYYY",
          "YYWWYYDDYYYY",
          "YYYYYYDDYYYY",
          "YYYYYYDDYYYY",
          "YYYYYYDDYYYY",
          "YYDDYYDDYYYY",
          ".YYDDDDDDYY.",
          "..YYYYYYYY..",
          "....YYYY...."
        ];
        return {
          grid,
          colors: {
            'Y': overrideColor || '#FFCA00',
            'W': '#FEF08A',
            'D': '#B45309'
          }
        };
      }
      case 'mic':
      case 'microphone': {
        const grid = [
          "....CCCC....",
          "...CCWWCC...",
          "..CCCCCCCC..",
          "..CCCCCCCC..",
          "...CCCCCC...",
          "W...CCCC...W",
          "W....DD....W",
          ".W...DD...W.",
          "..WWDDDDWW..",
          "....DDDD....",
          "...DDDDDD...",
          "..DDDDDDDD.."
        ];
        return {
          grid,
          colors: {
            'C': overrideColor || '#38BDF8',
            'W': '#FFFFFF',
            'D': '#64748B'
          }
        };
      }
      case 'route': {
        const grid = [
          "..RR........",
          ".RRRR...PP..",
          "..RR...PPPP.",
          "........PP..",
          "....RR......",
          "...RRRR.....",
          "....RR......",
          "........RR..",
          "..PP...RRRR.",
          ".PPPP...RR..",
          "..PP........",
          "............"
        ];
        return {
          grid,
          colors: {
            'R': overrideColor || '#FFCA00',
            'P': '#F59E0B'
          }
        };
      }
      case 'tap': {
        const grid = [
          "....CCCC....",
          "...CCCCCC...",
          "..CC....CC..",
          "..CC........",
          "CCCCCCC.....",
          "CCCCCCC.....",
          "..CC........",
          "..BB........",
          "..BB........",
          ".BBBB.......",
          "BBBBBB......",
          "............"
        ];
        return {
          grid,
          colors: {
            'C': overrideColor || '#38BDF8',
            'B': '#3B82F6'
          }
        };
      }
      case 'food': {
        const grid = [
          "............",
          "...YYYYYY...",
          "..YYYYYYYY..",
          ".YYWWWWYYYY.",
          ".YYWWWWYYYY.",
          "..YYYYYYYY..",
          "...YYYYYY...",
          "DDDCCCCCDDD.",
          "DDDDDDDDDDD.",
          "............",
          "............",
          "............"
        ];
        return {
          grid,
          colors: {
            'Y': '#F59E0B',
            'W': '#FFFFFF',
            'C': '#D97706',
            'D': overrideColor || '#78716C'
          }
        };
      }
      case 'pet': {
        const grid = [
          "..PP...PP...",
          ".PPPP.PPPP..",
          "..PP...PP...",
          "............",
          "PP.......PP.",
          "PPPP...PPPP.",
          ".PP.....PP..",
          "..PPPPPPP...",
          ".PPPPPPPPP..",
          ".PPPPPPPPP..",
          "..PPPPPPP...",
          "............"
        ];
        return {
          grid,
          colors: {
            'P': overrideColor || '#F97316'
          }
        };
      }
      case 'terrace': {
        const grid = [
          "......GG....",
          ".....GGGG...",
          "....GGGGGG..",
          "...GGGGGGGG.",
          "..GGGWGGGG..",
          ".GGGGWGGG...",
          "GGGGGWGG....",
          ".GGGGW......",
          "..GGGW......",
          "...GGW......",
          "....GW......",
          ".....W......"
        ];
        return {
          grid,
          colors: {
            'G': overrideColor || '#22C55E',
            'W': '#15803D'
          }
        };
      }
      case 'beershop': {
        const grid = [
          "....OOOO....",
          "..OOOOOOOO..",
          ".OOOOOOOOOO.",
          "OOOOOOOOOOOO",
          "OOOOTTTTOOOO",
          "OOOOTTTTOOOO",
          "OOOOOOOOOOOO",
          "OOOOOOOOOOOO",
          "OOOOOOOOOOOO",
          ".OOOOOOOOOO.",
          "..OOOOOOOO..",
          "....OOOO...."
        ];
        return {
          grid,
          colors: {
            'O': overrideColor || '#D97706',
            'T': '#F59E0B'
          }
        };
      }
      case 'parking': {
        const grid = [
          "BBBBBBBBBBBB",
          "BBBBBBBBBBBB",
          "BBWWWWWWWWBB",
          "BBWWWWWWWWBB",
          "BBWW....WWBB",
          "BBWW....WWBB",
          "BBWWWWWWWWBB",
          "BBWWWWWWWWBB",
          "BBWW........",
          "BBWW........",
          "BBBBBBBBBBBB",
          "BBBBBBBBBBBB"
        ];
        return {
          grid,
          colors: {
            'B': overrideColor || '#3B82F6',
            'W': '#FFFFFF'
          }
        };
      }
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
      case 'beer-glass': {
        const grid = [
          "....WWWW....",
          "..WWWWWWWW..",
          "..WWWWWWWW..",
          "..YYYYYYYY..",
          "..YLYYYYYY..",
          "..YLYYYYYY..",
          "..YLYYYYYY..",
          "...YYYYYY...",
          "...YYYYYY...",
          "...YYYYYY...",
          "....YYYY....",
          "...GGGGGG..."
        ];
        return {
          grid,
          colors: {
            'W': '#FFFFFF',
            'Y': overrideColor || '#FFCA00',
            'L': '#FFFBEB',
            'G': '#94A3B8'
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

export function PixelBeerGlass({ size = 24, className = '', overrideColor }: { size?: number; className?: string; overrideColor?: string }) {
  // A clean pixel craft beer glass (straight/tapered tumbler or pint glass, NOT a mug with handle)
  const grid = [
    "....WWWW....",
    "..WWWWWWWW..",
    "..WWWWWWWW..",
    "..YYYYYYYY..",
    "..YLYYYYYY..",
    "..YLYYYYYY..",
    "..YLYYYYYY..",
    "...YYYYYY...",
    "...YYYYYY...",
    "...YYYYYY...",
    "....YYYY....",
    "...GGGGGG..."
  ];

  const colors: Record<string, string> = {
    'W': '#FFFFFF',
    'Y': overrideColor || '#F2A93B',
    'L': '#F6EFDC',
    'G': '#12908C'
  };

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

// Logo Component replicating the retro craft aesthetic (HOP-MAP) & seasonal editions
export function PixelLogo({
  className = '',
  gta6Mode = false,
  christmasMode = false,
  newYearMode = false,
  valentinesMode = false,
  stPatricksMode = false,
  freedomDayMode = false
}: {
  size?: number | string;
  className?: string;
  gta6Mode?: boolean;
  christmasMode?: boolean;
  newYearMode?: boolean;
  valentinesMode?: boolean;
  stPatricksMode?: boolean;
  freedomDayMode?: boolean;
}) {
  if (gta6Mode) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-0 relative select-none w-full max-w-xs mx-auto ${className}`}
      >
        <div className="flex items-center justify-center gap-3 mb-2 relative">
          <div className="relative flex items-center justify-center drop-shadow-[0_0_12px_rgba(255,78,136,0.6)]">
            <PixelPacman size={38} overrideColor="#FF5E93" />
          </div>
          <div className="flex items-center gap-2">
            <PixelBeerGlass size={22} overrideColor="#FFB347" />
            <PixelBeerGlass size={22} overrideColor="#FF7EA8" />
            <PixelBeerGlass size={22} overrideColor="#2EE6D6" />
          </div>
        </div>

        <div className="w-full flex flex-col items-center justify-center select-none mt-1" id="login-hop-map-title">
          <span
            className="font-bold uppercase tracking-[0.14em] text-[44px] sm:text-[50px] leading-[0.95] text-transparent bg-clip-text bg-gradient-to-b from-[#FFE6A7] via-[#FF9E44] to-[#FF4E88] drop-shadow-[0_4px_16px_rgba(255,78,136,0.45)]"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            HOP-MAP
          </span>
          <span
            className="text-xl sm:text-2xl text-[#2EE6D6] -mt-2 drop-shadow-[0_2px_10px_rgba(46,230,214,0.65)]"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            Vice Edition
          </span>
        </div>
      </div>
    );
  }

  if (christmasMode) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-0 relative select-none w-full max-w-xs mx-auto ${className}`}
      >
        <div className="flex items-center justify-center gap-3 mb-2.5 relative">
          <div className="relative flex items-center justify-center drop-shadow-[0_2px_10px_rgba(255,209,102,0.45)]">
            <PixelPacman size={38} santaHat={true} overrideColor="#FFD166" />
          </div>
          <div className="flex items-center gap-2">
            <PixelBeerGlass size={22} overrideColor="#D62839" />
            <PixelBeerGlass size={22} overrideColor="#FFD166" />
            <PixelBeerGlass size={22} overrideColor="#4ADE80" />
          </div>
        </div>

        <div className="w-full flex flex-col items-center justify-center select-none mt-1" id="login-hop-map-title">
          <div className="w-full flex items-center justify-between px-0.5">
            {['H', 'O', 'P', '-', 'M', 'A', 'P'].map((char, index) => (
              <span
                key={index}
                className="font-bold font-press text-[#FFFDF7] text-[28px] sm:text-[34px] leading-none select-none inline-block text-center"
                style={{ textShadow: '2px 2px 0px #D62839, 3.5px 3.5px 0px #08150F' }}
              >
                {char}
              </span>
            ))}
          </div>
          <span
            className="text-lg sm:text-xl text-[#FFD166] mt-1 drop-shadow-[0_2px_8px_rgba(214,40,57,0.6)]"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            Boas Festas
          </span>
        </div>
      </div>
    );
  }

  if (newYearMode) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-0 relative select-none w-full max-w-xs mx-auto ${className}`}
      >
        <div className="flex items-center justify-center gap-3 mb-2.5 relative">
          <div className="relative flex items-center justify-center drop-shadow-[0_2px_12px_rgba(255,215,112,0.55)]">
            <PixelPacman size={38} overrideColor="#FFD770" />
          </div>
          <div className="flex items-center gap-2">
            <PixelBeerGlass size={22} overrideColor="#FFD770" />
            <PixelBeerGlass size={22} overrideColor="#38BDF8" />
            <PixelBeerGlass size={22} overrideColor="#FB7185" />
          </div>
        </div>

        <div className="w-full flex flex-col items-center justify-center select-none mt-1" id="login-hop-map-title">
          <div className="w-full flex items-center justify-between px-0.5">
            {['H', 'O', 'P', '-', 'M', 'A', 'P'].map((char, index) => (
              <span
                key={index}
                className="font-bold font-press text-[#FFFDF5] text-[28px] sm:text-[34px] leading-none select-none inline-block text-center"
                style={{ textShadow: '2px 2px 0px #D97706, 3.5px 3.5px 0px #080C1F' }}
              >
                {char}
              </span>
            ))}
          </div>
          <span
            className="text-lg sm:text-xl text-[#FFD770] mt-1 drop-shadow-[0_2px_10px_rgba(255,215,112,0.55)]"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            Feliz Ano Novo
          </span>
        </div>
      </div>
    );
  }

  if (valentinesMode) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-0 relative select-none w-full max-w-xs mx-auto ${className}`}
      >
        <div className="flex items-center justify-center gap-3 mb-2.5 relative">
          <div className="relative flex items-center justify-center drop-shadow-[0_2px_10px_rgba(251,113,133,0.55)]">
            <PixelPacman size={38} overrideColor="#FB7185" />
          </div>
          <div className="flex items-center gap-2">
            <PixelBeerGlass size={22} overrideColor="#E11D48" />
            <PixelBeerGlass size={22} overrideColor="#FCD34D" />
            <PixelBeerGlass size={22} overrideColor="#FB7185" />
          </div>
        </div>

        <div className="w-full flex flex-col items-center justify-center select-none mt-1" id="login-hop-map-title">
          <div className="w-full flex items-center justify-between px-0.5">
            {['H', 'O', 'P', '-', 'M', 'A', 'P'].map((char, index) => (
              <span
                key={index}
                className="font-bold font-press text-[#FFF5F7] text-[28px] sm:text-[34px] leading-none select-none inline-block text-center"
                style={{ textShadow: '2px 2px 0px #E11D48, 3.5px 3.5px 0px #190610' }}
              >
                {char}
              </span>
            ))}
          </div>
          <span
            className="text-lg sm:text-xl text-[#FCD34D] mt-1 drop-shadow-[0_2px_8px_rgba(225,29,72,0.6)]"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            Dia dos Namorados
          </span>
        </div>
      </div>
    );
  }

  if (stPatricksMode) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-0 relative select-none w-full max-w-xs mx-auto ${className}`}
      >
        <div className="flex items-center justify-center gap-3 mb-2.5 relative">
          <div className="relative flex items-center justify-center drop-shadow-[0_2px_10px_rgba(74,222,128,0.5)]">
            <PixelPacman size={38} overrideColor="#4ADE80" />
          </div>
          <div className="flex items-center gap-2">
            <PixelBeerGlass size={22} overrideColor="#16A34A" />
            <PixelBeerGlass size={22} overrideColor="#FACC15" />
            <PixelBeerGlass size={22} overrideColor="#4ADE80" />
          </div>
        </div>

        <div className="w-full flex flex-col items-center justify-center select-none mt-1" id="login-hop-map-title">
          <div className="w-full flex items-center justify-between px-0.5">
            {['H', 'O', 'P', '-', 'M', 'A', 'P'].map((char, index) => (
              <span
                key={index}
                className="font-bold font-press text-[#F0FDF4] text-[28px] sm:text-[34px] leading-none select-none inline-block text-center"
                style={{ textShadow: '2px 2px 0px #16A34A, 3.5px 3.5px 0px #04150E' }}
              >
                {char}
              </span>
            ))}
          </div>
          <span
            className="text-lg sm:text-xl text-[#FACC15] mt-1 drop-shadow-[0_2px_8px_rgba(22,163,74,0.6)]"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            St. Patrick&apos;s Day
          </span>
        </div>
      </div>
    );
  }

  if (freedomDayMode) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-0 relative select-none w-full max-w-xs mx-auto ${className}`}
      >
        <div className="flex items-center justify-center gap-3 mb-2.5 relative">
          <div className="relative flex items-center justify-center drop-shadow-[0_2px_10px_rgba(239,68,68,0.55)]">
            <PixelPacman size={38} overrideColor="#FBBF24" />
          </div>
          <div className="flex items-center gap-2">
            <PixelBeerGlass size={22} overrideColor="#DC2626" />
            <PixelBeerGlass size={22} overrideColor="#FBBF24" />
            <PixelBeerGlass size={22} overrideColor="#16A34A" />
          </div>
        </div>

        <div className="w-full flex flex-col items-center justify-center select-none mt-1" id="login-hop-map-title">
          <div className="w-full flex items-center justify-between px-0.5">
            {['H', 'O', 'P', '-', 'M', 'A', 'P'].map((char, index) => (
              <span
                key={index}
                className="font-bold font-press text-[#FFFDF7] text-[28px] sm:text-[34px] leading-none select-none inline-block text-center"
                style={{ textShadow: '2px 2px 0px #DC2626, 3.5px 3.5px 0px #14080A' }}
              >
                {char}
              </span>
            ))}
          </div>
          <span
            className="text-lg sm:text-xl text-[#FBBF24] mt-1 drop-shadow-[0_2px_8px_rgba(220,38,38,0.6)]"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            25 de Abril · Liberdade
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col items-center justify-center p-0 relative select-none w-full max-w-xs mx-auto ${className}`}
    >
      <div className="flex items-center justify-center gap-3 mb-2 relative">
        {/* Smaller Pac-man facing right in Mustard */}
        <div className="relative flex items-center justify-center">
          <PixelPacman size={38} overrideColor="#F2A93B" />
        </div>
        
        {/* Three pixelated beer glasses being eaten */}
        <div className="flex items-center gap-2 animate-pulse">
          <PixelBeerGlass size={22} overrideColor="#F2A93B" />
          <PixelBeerGlass size={22} overrideColor="#F2A93B" />
          <PixelBeerGlass size={22} overrideColor="#F2A93B" />
        </div>
      </div>

      {/* HOP-MAP retro text in dark gray #1B2036 justified to match the card edges */}
      <div className="w-full flex items-center justify-between select-none px-0.5 mt-1" id="login-hop-map-title">
        {['H', 'O', 'P', '-', 'M', 'A', 'P'].map((char, index) => (
          <span 
            key={index}
            className="font-bold font-press text-[#1B2036] text-[28px] sm:text-[34px] leading-none select-none inline-block text-center"
            style={{ textShadow: '2px 2px 0px #F2A93B' }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
