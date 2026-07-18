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
    <div className="min-h-screen w-full flex flex-col bg-[#121828] text-white">
      {/* Main Full Screen Container */}
      <div className="relative w-full h-screen flex flex-col overflow-hidden bg-[#121828]">
        {/* Content Wrapper inside Screen */}
        <div className="flex-1 w-full h-full overflow-hidden relative flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
