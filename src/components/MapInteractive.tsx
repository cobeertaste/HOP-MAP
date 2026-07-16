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
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-black/70 backdrop-blur-sm z-20">
            <div className="w-10 h-10 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              A carregar Google My Maps...
            </p>
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
