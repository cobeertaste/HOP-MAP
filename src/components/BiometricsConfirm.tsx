/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScanFace, Check, AlertCircle } from 'lucide-react';

interface BiometricsConfirmProps {
  onSuccess: () => void;
  onCancel: () => void;
  reason: string;
}

export default function BiometricsConfirm({ onSuccess, onCancel, reason }: BiometricsConfirmProps) {
  const [scanState, setScanState] = useState<'scanning' | 'success' | 'failed'>('scanning');

  useEffect(() => {
    // Simulate biometric analysis
    const scanTimer = setTimeout(() => {
      setScanState('success');
    }, 1800);

    const successTimer = setTimeout(() => {
      onSuccess();
    }, 2800);

    return () => {
      clearTimeout(scanTimer);
      clearTimeout(successTimer);
    };
  }, [onSuccess]);

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-[200]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 max-w-[280px] w-full text-center flex flex-col items-center shadow-2xl relative overflow-hidden"
      >
        {/* Apple FaceID Scanner Ring */}
        <div className="relative w-24 h-24 flex items-center justify-center mb-6">
          <AnimatePresence mode="popLayout">
            {scanState === 'scanning' && (
              <motion.div 
                key="scanning-circle"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-2xl border-2 border-dashed border-amber-500/60"
              />
            )}
            {scanState === 'success' && (
              <motion.div 
                key="success-circle"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-2xl border-4 border-emerald-500"
              />
            )}
          </AnimatePresence>

          {/* Scanner Icon */}
          <div className="z-10 text-white">
            {scanState === 'scanning' ? (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <ScanFace className="w-12 h-12 text-amber-400" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.4 }}
                animate={{ scale: 1, type: "spring", stiffness: 200 }}
              >
                <Check className="w-12 h-12 text-emerald-500 stroke-[3]" />
              </motion.div>
            )}
          </div>

          {/* Glowing laser line for scanning effect */}
          {scanState === 'scanning' && (
            <motion.div 
              initial={{ top: '10%' }}
              animate={{ top: '85%' }}
              transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.2, ease: "easeInOut" }}
              className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-md shadow-amber-400/50"
            />
          )}
        </div>

        {/* Text descriptions */}
        <h3 className="text-white font-semibold text-lg tracking-tight font-sans">
          {scanState === 'scanning' ? 'Face ID' : 'Processado'}
        </h3>
        
        <p className="text-zinc-400 text-xs mt-2 leading-relaxed min-h-[32px] font-sans">
          {scanState === 'scanning' ? reason : 'Autenticação bem-sucedida'}
        </p>

        {/* Cancel actions */}
        {scanState === 'scanning' && (
          <button 
            onClick={onCancel}
            className="mt-6 text-zinc-500 hover:text-zinc-300 text-xs font-semibold py-1 px-4 transition underline underline-offset-4"
            id="btn-biometric-cancel"
          >
            Cancelar
          </button>
        )}
      </motion.div>
    </div>
  );
}
