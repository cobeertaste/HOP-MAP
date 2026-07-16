/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wifi, Battery, ShieldAlert, Moon, Sun } from 'lucide-react';

interface AppleDeviceFrameProps {
  children: React.ReactNode;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function AppleDeviceFrame({ children, darkMode, setDarkMode }: AppleDeviceFrameProps) {
  const [deviceTime, setDeviceTime] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setDeviceTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 max-sm:p-0 p-3 sm:p-6 md:p-8 bg-[#121828] text-white">
      
      {/* Top Brand Info floating outside physical device (Hidden on mobile or compact wide views to save screen real estate) */}
      <header className="mb-3 text-center hidden md:block max-w-lg shrink-0">
        <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent font-sans">
          HOP MAP
        </h1>
        <p className="text-[10px] mt-0.5 text-zinc-400 font-sans tracking-widest uppercase font-semibold">
          CRAFT BEER LOVERS
        </p>
      </header>

      {/* Main iPhone/Website Responsive Frame container */}
      <div className="relative w-full transition-all duration-300 flex flex-col overflow-hidden max-sm:h-screen max-sm:max-h-screen max-sm:w-full max-sm:rounded-none max-sm:border-0 max-sm:shadow-none sm:max-w-[440px] sm:h-[840px] sm:rounded-[50px] sm:border-[10px] md:max-w-[768px] md:h-[82vh] md:max-h-[860px] md:rounded-[36px] md:border-[6px] lg:max-w-[1024px] lg:h-[85vh] lg:max-h-[900px] lg:rounded-[40px] lg:border-[8px] xl:max-w-[1340px] xl:h-[88vh] xl:max-h-[960px] xl:rounded-[48px] xl:border-[10px] bg-[#121828] border-zinc-900 shadow-zinc-950/50">
        
        {/* Status Bar: Shown only in portrait mobile frame view (sm screens and not md wide desktop view) */}
        <div className="absolute top-0 left-0 right-0 h-11 px-6 flex items-center justify-between z-50 text-[13px] font-semibold tracking-tight hidden sm:flex md:hidden text-zinc-100">
          {/* Time */}
          <div className="w-14 text-left select-none">{deviceTime}</div>

          {/* Dynamic Island / Notch */}
          <div className={`w-[110px] h-[30px] rounded-full flex items-center justify-center transition-all duration-300 relative group overflow-hidden ${
            darkMode ? 'bg-zinc-900' : 'bg-black'
          }`}>
            <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center">
              <span className="text-[9px] text-amber-500 font-extrabold tracking-widest select-none uppercase scale-90 group-hover:scale-100 transition-all">
                Cobeer Taste
              </span>
            </div>
          </div>

          {/* Right Status (4G/5G, Wifi, Battery) */}
          <div className="flex items-center space-x-2 w-14 justify-end">
            <span className="text-[10px] select-none">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Content Wrapper inside Screen: Eliminates notch offset space when viewed full-screen on mobile or wide desktop */}
        <div className="flex-1 w-full h-full overflow-hidden relative flex flex-col max-sm:pt-0 max-sm:pb-0 sm:pt-11 sm:pb-6 md:pt-0 md:pb-0">
          {children}
        </div>

        {/* Home Swipe Indicator (Apple Home Bar): Shown only in portrait phone mock view */}
        <div className="absolute bottom-1 w-full flex justify-center pointer-events-none z-50 hidden sm:flex md:hidden">
          <div className={`w-32 h-1 rounded-full ${darkMode ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
        </div>
      </div>

      {/* Quick controls floaters outside phone in desktop */}
      <div className="mt-4 flex items-center space-x-4 bg-white/10 dark:bg-zinc-900/40 backdrop-blur-xl px-4 py-2 rounded-full border border-zinc-250/10 text-[10px] sm:text-xs">
        <span className="text-zinc-400 font-sans cursor-default">Formato Adaptável (Mobile/Website)</span>
      </div>
    </div>
  );
}
