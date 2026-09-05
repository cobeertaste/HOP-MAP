/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Beer, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { Bar, UserProfile } from '../types';
import { Language, t } from '../lib/i18n';
import { getSpotCheckinPin, playPinKeypadSound, playPinErrorSound } from '../lib/spotPinUtils';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface RetroPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  spot: Bar;
  user: UserProfile;
  lang: Language;
  onSuccess: (spot: Bar, enteredPin: string) => Promise<void> | void;
}

export default function RetroPinModal({
  isOpen,
  onClose,
  spot,
  user,
  lang,
  onSuccess,
}: RetroPinModalProps) {
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLockedToday, setIsLockedToday] = useState(false);
  const [isCheckingLock, setIsCheckingLock] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  // Check 24h lockout on modal open
  useEffect(() => {
    if (!isOpen || !spot) {
      setPinDigits([]);
      setErrorMessage(null);
      setIsLockedToday(false);
      return;
    }

    setPinDigits([]);
    setErrorMessage(null);

    const checkDailyLockout = async () => {
      setIsCheckingLock(true);
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      // 1. Fast offline / local user profile check
      const localLastDate = user.lastCheckinDates ? user.lastCheckinDates[spot.id] : undefined;
      if (localLastDate === todayStr) {
        setIsLockedToday(true);
        setIsCheckingLock(false);
        return;
      }

      // 2. Query Firestore checkins collection
      if (user.isLoggedIn && !user.id.startsWith('local-user-')) {
        try {
          const q = query(
            collection(db, 'checkins'),
            where('userId', '==', user.id),
            where('spotId', '==', spot.id),
            where('dateString', '==', todayStr)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            setIsLockedToday(true);
            setIsCheckingLock(false);
            return;
          }
        } catch (err) {
          console.warn('Firestore checkins query error (using local cache state):', err);
        }
      }

      setIsLockedToday(false);
      setIsCheckingLock(false);
    };

    checkDailyLockout();
  }, [isOpen, spot, user.id, user.lastCheckinDates]);

  if (!isOpen || !spot) return null;

  const handleKeyPress = (digit: string) => {
    if (isLockedToday || isVerifying) return;
    if (pinDigits.length >= 4) return;

    playPinKeypadSound(Number(digit));
    setErrorMessage(null);
    const nextDigits = [...pinDigits, digit];
    setPinDigits(nextDigits);

    // Auto-verify when 4 digits are reached
    if (nextDigits.length === 4) {
      verifyPin(nextDigits.join(''));
    }
  };

  const handleClear = () => {
    playPinKeypadSound();
    setPinDigits([]);
    setErrorMessage(null);
  };

  const handleBackspace = () => {
    if (pinDigits.length === 0) return;
    playPinKeypadSound();
    setPinDigits((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const verifyPin = async (candidatePin: string) => {
    if (candidatePin.length !== 4) {
      setErrorMessage(t('pinMustBe4Digits', lang));
      playPinErrorSound();
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    // Fetch or calculate expected PIN for this spot
    const expectedPin = getSpotCheckinPin(spot);

    // Simulate verification delay for tactile feedback
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (candidatePin === expectedPin) {
      // PIN Correct!
      setIsVerifying(false);
      onSuccess(spot, candidatePin);
      onClose();
    } else {
      // PIN Incorrect!
      playPinErrorSound();
      setIsVerifying(false);
      setErrorMessage(t('invalidPin', lang));
      setShakeKey((prev) => prev + 1);
      setPinDigits([]);
    }
  };

  const handleManualConfirm = () => {
    if (pinDigits.length === 4) {
      verifyPin(pinDigits.join(''));
    } else {
      setErrorMessage(t('pinMustBe4Digits', lang));
      playPinErrorSound();
      setShakeKey((prev) => prev + 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          key="retro-pin-card"
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm rounded-2xl bg-[#F6EFDC] border-3 border-[#1B2036] p-5 shadow-[5px_5px_0px_#1B2036] text-[#1B2036] font-mono select-none overflow-hidden"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#1B2036] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F2A93B] border-2 border-[#1B2036] flex items-center justify-center text-[#1B2036] shadow-[2px_2px_0px_#1B2036]">
                <Beer className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] tracking-wider uppercase font-bold text-[#E85B41] block font-label">
                  HOP-MAP 8-BIT PIN
                </span>
                <h3 className="text-xs font-bold tracking-wide uppercase text-[#1B2036] truncate max-w-[200px] font-press">
                  {spot.name}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black flex items-center justify-center border-2 border-black transition shadow-[2px_2px_0px_#000000]"
              aria-label="Close"
              title={lang === 'PT' ? 'Fechar' : 'Close'}
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* Daily Lockout Alert if already checked in today */}
          {isLockedToday ? (
            <div className="my-6 p-4 rounded-xl bg-[#EFE6CC] border-2 border-[#E85B41] text-center flex flex-col items-center gap-3 animate-fade-in shadow-[3px_3px_0px_#1B2036]">
              <div className="w-12 h-12 rounded-full bg-[#E85B41]/20 border-2 border-[#E85B41] flex items-center justify-center text-[#E85B41]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-[#1B2036] font-body leading-relaxed">
                {t('alreadyCheckedInToday', lang)}
              </p>
              <button
                onClick={onClose}
                className="mt-2 w-full py-2.5 px-4 rounded-xl bg-[#1B2036] hover:bg-[#12908C] border-2 border-[#1B2036] font-label font-bold text-xs uppercase text-white tracking-wider transition shadow-[2px_2px_0px_#1B2036]"
              >
                [ {lang === 'PT' ? 'VOLTAR AO MAPA' : 'BACK TO MAP'} ]
              </button>
            </div>
          ) : (
            <>
              {/* Bartender Prompt Banner */}
              <div className="mb-4 p-3 rounded-xl bg-[#EFE6CC] border-2 border-[#1B2036] text-center shadow-[2px_2px_0px_#1B2036]">
                <p className="text-xs font-bold text-[#E85B41] tracking-wide uppercase leading-snug font-label">
                  {t('bartenderPinPrompt', lang)}
                </p>
                <p className="text-[10px] text-[#1B2036]/70 mt-1 font-body">
                  {t('bartenderPinSubtitle', lang)}
                </p>
              </div>

              {/* 4 Digit Boxes */}
              <motion.div
                key={`boxes-${shakeKey}`}
                animate={shakeKey > 0 ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center gap-3 my-4"
              >
                {[0, 1, 2, 3].map((idx) => {
                  const digit = pinDigits[idx];
                  const isFilled = digit !== undefined;
                  const isCurrent = pinDigits.length === idx;

                  return (
                    <div
                      key={idx}
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold font-data transition-all duration-200 border-2 border-[#1B2036] ${
                        isFilled
                          ? 'bg-[#F2A93B] text-[#1B2036] shadow-[3px_3px_0px_#1B2036] scale-105'
                          : isCurrent
                          ? 'bg-white shadow-[2px_2px_0px_#1B2036] animate-pulse'
                          : 'bg-[#EFE6CC] text-[#1B2036]/30'
                      }`}
                    >
                      {isFilled ? (
                        <span className="animate-scale-up">{digit}</span>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1B2036]/30" />
                      )}
                    </div>
                  );
                })}
              </motion.div>

              {/* Error / Loading Status */}
              <div className="h-6 flex items-center justify-center text-center mb-3">
                {isVerifying ? (
                  <div className="flex items-center gap-2 text-[#12908C] text-xs font-bold animate-pulse font-data">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('verifyingPin', lang)}</span>
                  </div>
                ) : errorMessage ? (
                  <span className="text-[#E85B41] text-xs font-bold tracking-wide flex items-center gap-1 animate-bounce font-body">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errorMessage}
                  </span>
                ) : isCheckingLock ? (
                  <span className="text-[#1B2036]/70 text-[11px] font-bold font-body">
                    {lang === 'PT' ? 'A verificar histórico diário...' : 'Checking daily history...'}
                  </span>
                ) : null}
              </div>

              {/* 8-Bit Retro Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleKeyPress(digit)}
                    disabled={isVerifying || isLockedToday}
                    className="h-12 rounded-xl bg-[#EFE6CC] hover:bg-[#F2A93B] active:scale-95 text-[#1B2036] font-bold font-data text-lg border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {digit}
                  </button>
                ))}

                {/* Clear Button */}
                <button
                  onClick={handleClear}
                  disabled={isVerifying || isLockedToday}
                  className="h-12 rounded-xl bg-[#E85B41] hover:bg-[#1B2036] hover:text-white active:scale-95 text-white font-bold font-label text-[9px] border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] tracking-wider transition-all flex items-center justify-center uppercase disabled:opacity-50"
                >
                  {t('clearPin', lang)}
                </button>

                {/* '0' Button */}
                <button
                  onClick={() => handleKeyPress('0')}
                  disabled={isVerifying || isLockedToday}
                  className="h-12 rounded-xl bg-[#EFE6CC] hover:bg-[#F2A93B] active:scale-95 text-[#1B2036] font-bold font-data text-lg border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] transition-all flex items-center justify-center disabled:opacity-50"
                >
                  0
                </button>

                {/* Backspace / Delete */}
                <button
                  onClick={handleBackspace}
                  disabled={isVerifying || isLockedToday || pinDigits.length === 0}
                  className="h-12 rounded-xl bg-[#EFE6CC] hover:bg-white active:scale-95 text-[#1B2036] font-bold font-data text-base border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] transition-all flex items-center justify-center disabled:opacity-40"
                  aria-label="Backspace"
                >
                  ⌫
                </button>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleManualConfirm}
                disabled={isVerifying || isLockedToday || pinDigits.length !== 4}
                className="w-full py-3 rounded-xl bg-[#12908C] hover:bg-[#0B6C69] text-white font-bold font-label text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1B2036] border-2 border-[#1B2036] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-4 h-4" />
                {t('confirmPin', lang)}
              </button>

              {/* Anti-Fraud Footnote */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-[#1B2036]/60 text-center font-body">
                <span>{t('antiFraudNotice', lang)}</span>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
