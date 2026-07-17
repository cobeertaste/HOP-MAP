/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Map, Compass } from 'lucide-react';
import { Bar } from '../types';

interface MapInteractiveProps {
  bars: Bar[];
  selectedBar: Bar | null;
  onSelectBar: (bar: Bar) => void;
  darkMode: boolean;
  activeRoute: string[] | null;
  userLocation: { latitude: number; longitude: number };
  proximityMode: boolean;
}

export default function MapInteractive({
  darkMode,
}: MapInteractiveProps) {
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  return (
    <div className={`relative w-full h-full min-h-[460px] flex flex-col rounded-3xl overflow-hidden border-4 shadow-xl select-none ${
      darkMode ? 'border-zinc-800 bg-black text-white' : 'border-zinc-200 bg-white text-zinc-900'
    }`}>
      
      {/* Main Map Viewer Area */}
      <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-stretch min-h-[400px]">
        {isIframeLoading && (
          <div className="absolute inset-0 bg-[#121828] z-20 flex flex-col p-4 justify-between animate-pulse">
            {/* Top Mock Search Bar Skeleton */}
            <div className="w-full flex items-center space-x-3 bg-white/5 border border-white/10 rounded-2xl p-3">
              <div className="w-4 h-4 rounded-full bg-zinc-700" />
              <div className="h-3 bg-zinc-700 rounded-md w-1/3" />
            </div>

            {/* Middle Grid of Mock Points / Grid Lines */}
            <div className="flex-1 my-6 flex flex-col items-center justify-center relative">
              {/* Spinner in the center */}
              <div className="relative z-30 flex flex-col items-center space-y-3 p-4 rounded-3xl bg-zinc-950/40 backdrop-blur-md border border-white/5">
                <div className="w-10 h-10 rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin" />
                <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest text-center">
                  A carregar Google My Maps...
                </p>
              </div>

              {/* Fake Map Grid Accents */}
              <div className="absolute inset-0 flex flex-col justify-around pointer-events-none opacity-20">
                <div className="w-full h-[1px] bg-zinc-700" />
                <div className="w-full h-[1px] bg-zinc-700" />
                <div className="w-full h-[1px] bg-zinc-700" />
              </div>
              <div className="absolute inset-0 flex justify-around pointer-events-none opacity-20">
                <div className="w-[1px] h-full bg-zinc-700" />
                <div className="w-[1px] h-full bg-zinc-700" />
                <div className="w-[1px] h-full bg-zinc-700" />
              </div>

              {/* Fake Marker Pulses */}
              <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-amber-500/40 rounded-full" />
              <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-amber-500/40 rounded-full" />
            </div>

            {/* Bottom Mock Spot Details Card Skeleton */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-2.5">
              <div className="h-3.5 bg-zinc-700 rounded-md w-1/2" />
              <div className="h-2.5 bg-zinc-800 rounded-md w-3/4" />
              <div className="h-2 bg-zinc-800 rounded-md w-1/3" />
            </div>
          </div>
        )}
        <iframe
          src="https://www.google.com/maps/d/u/0/embed?mid=1MVkRKwWSeGAD2yFlJDid0ox75L4ZUes&femb=1&ll=35.217735727712686%2C-13.068564259374993&z=5"
          width="100%"
          height="100%"
          className="w-full h-full border-0 absolute inset-0"
          title="Google My Maps Viewer"
          allowFullScreen
          loading="lazy"
          onLoad={() => setIsIframeLoading(false)}
        />
      </div>
    </div>
  );
}
