/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: '100%', height: '100%' });

  // Handle window resizing and orientation change smoothly across devices and browsers
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: `${clientWidth}px`,
          height: `${clientHeight}px`,
        });
      }
    };

    handleResize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-0 flex-1 flex flex-col rounded-2xl md:rounded-3xl overflow-hidden border-2 sm:border-3 border-[#1B2036] shadow-[3px_3px_0px_#1B2036] select-none transition-all bg-[#F6EFDC] text-[#1B2036]"
    >
      {/* Main Map Viewer Area occupying 100% available container space */}
      <div className="relative flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col justify-stretch">
        {isIframeLoading && (
          <div className="absolute inset-0 bg-[#F6EFDC] z-20 flex flex-col p-4 justify-between animate-pulse">
            {/* Top Mock Search Bar Skeleton */}
            <div className="w-full flex items-center space-x-3 bg-white/60 border-2 border-[#1B2036] rounded-xl p-3 shadow-[2px_2px_0px_#1B2036]">
              <div className="w-4 h-4 rounded-full bg-[#12908C]" />
              <div className="h-3 bg-[#1B2036]/30 rounded-md w-1/3" />
            </div>

            {/* Middle Grid of Mock Points / Grid Lines */}
            <div className="flex-1 my-4 sm:my-6 flex flex-col items-center justify-center relative">
              {/* Spinner in the center */}
              <div className="relative z-30 flex flex-col items-center space-y-3 p-4 rounded-2xl bg-[#EFE6CC] border-2 border-[#1B2036] shadow-[3px_3px_0px_#1B2036]">
                <div className="w-10 h-10 rounded-full border-4 border-[#12908C]/20 border-t-[#12908C] animate-spin" />
                <p className="text-[10px] text-[#1B2036] font-bold uppercase tracking-widest text-center font-press">
                  A carregar mapa...
                </p>
              </div>

              {/* Fake Map Grid Accents */}
              <div className="absolute inset-0 flex flex-col justify-around pointer-events-none opacity-15">
                <div className="w-full h-[1px] bg-[#1B2036]" />
                <div className="w-full h-[1px] bg-[#1B2036]" />
                <div className="w-full h-[1px] bg-[#1B2036]" />
              </div>
              <div className="absolute inset-0 flex justify-around pointer-events-none opacity-15">
                <div className="w-[1px] h-full bg-[#1B2036]" />
                <div className="w-[1px] h-full bg-[#1B2036]" />
                <div className="w-[1px] h-full bg-[#1B2036]" />
              </div>

              {/* Fake Marker Pulses */}
              <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-[#E85B41] rounded-full" />
              <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-[#F2A93B] rounded-full" />
            </div>

            {/* Bottom Mock Spot Details Card Skeleton */}
            <div className="bg-white/60 border-2 border-[#1B2036] rounded-xl p-3 sm:p-4 space-y-2 shadow-[2px_2px_0px_#1B2036]">
              <div className="h-3 bg-[#1B2036]/40 rounded-md w-1/2" />
              <div className="h-2.5 bg-[#1B2036]/20 rounded-md w-3/4" />
            </div>
          </div>
        )}
        <iframe
          src="https://www.google.com/maps/d/u/0/embed?mid=1MVkRKwWSeGAD2yFlJDid0ox75L4ZUes&femb=1&ll=35.217735727712686%2C-13.068564259374993&z=5"
          width="100%"
          height="100%"
          className="w-full h-full border-0 absolute inset-0 block"
          title="Google My Maps Viewer"
          allowFullScreen
          loading="lazy"
          onLoad={() => setIsIframeLoading(false)}
        />
      </div>
    </div>
  );
}
