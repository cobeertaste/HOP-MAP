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
    <div className="fixed inset-0 w-full h-full min-h-screen min-h-[100dvh] h-[100dvh] max-w-full flex flex-col bg-[#F6EFDC] text-[#1B2036] overflow-hidden select-none font-sans">
      {/* Main Full Screen Container */}
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#F6EFDC] min-h-0 flex-1">
        {/* Content Wrapper inside Screen */}
        <div className="flex-1 w-full h-full overflow-hidden relative flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
