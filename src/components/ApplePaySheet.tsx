/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, ShoppingBag, Check, X } from 'lucide-react';

interface ApplePaySheetProps {
  itemName: string;
  price: number;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ApplePaySheet({ itemName, price, onConfirm, onClose }: ApplePaySheetProps) {
  const [selectedCard, setSelectedCard] = useState<'apple' | 'millennium'>('apple');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const handlePayClick = () => {
    setIsProcessing(true);
    // Simulate payment sequence
    setTimeout(() => {
      setIsProcessing(false);
      setPurchaseSuccess(true);
      // Play a quick haptic-like tone if sounds were enabled, but wait for success display
      setTimeout(() => {
        onConfirm();
      }, 2000);
    }, 2200);
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col justify-end z-[150] overflow-hidden">
      {/* Background closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Apple Pay Sheet */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative bg-zinc-900 border-t border-zinc-800 rounded-t-[34px] p-6 pb-10 z-10 w-full flex flex-col font-sans text-white max-h-[90%] overflow-y-auto"
      >
        <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-4" />

        {/* Header with Title and Cancel button */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight"> Pay</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-semibold uppercase">Cobeer Taste</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition"
            id="btn-applepay-close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success screen overlay in sheet */}
        <AnimatePresence>
          {purchaseSuccess ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center">
                <Check className="w-8 h-8 text-emerald-500 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-xl font-bold">Pago com Sucesso!</h4>
                <p className="text-zinc-400 text-xs mt-1">O teu bilhete foi adicionado à Carteira Hop Map.</p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Product Info */}
              <div className="bg-zinc-800/40 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Festival / Evento Especial</p>
                    <p className="text-sm font-semibold text-white tracking-tight">{itemName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-white">{price.toFixed(2)}€</span>
                </div>
              </div>

              {/* Cards list */}
              <div>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1 mb-2">Cartão de Pagamento</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => setSelectedCard('apple')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition ${
                      selectedCard === 'apple' 
                        ? 'bg-zinc-800 border-amber-500' 
                        : 'bg-zinc-800/30 border-transparent hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-5 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded border border-zinc-600 flex items-center justify-center text-[10px] font-bold">
                         Card
                      </div>
                      <span className="text-xs font-medium text-white">Apple Card (•••• 4920)</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedCard === 'apple' ? 'border-amber-500 bg-amber-500 text-black' : 'border-zinc-600'}`}>
                      {selectedCard === 'apple' && <div className="w-1.5 h-1.5 bg-zinc-950 rounded-full" />}
                    </div>
                  </button>

                  <button 
                    onClick={() => setSelectedCard('millennium')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition ${
                      selectedCard === 'millennium' 
                        ? 'bg-zinc-800 border-amber-500' 
                        : 'bg-zinc-800/30 border-transparent hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-5 bg-gradient-to-br from-pink-800 to-rose-950 rounded border border-rose-900 flex items-center justify-center text-[8px] font-bold">
                        Bcp
                      </div>
                      <span className="text-xs font-medium text-white">Millennium bcp Visa (•••• 8821)</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedCard === 'millennium' ? 'border-amber-500 bg-amber-500 text-black' : 'border-zinc-600'}`}>
                      {selectedCard === 'millennium' && <div className="w-1.5 h-1.5 bg-zinc-950 rounded-full" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Secure Transaction Details */}
              <div className="pt-2 text-zinc-400 text-xs space-y-1.5">
                <div className="flex justify-between pl-1">
                  <span>Subtotal</span>
                  <span className="text-white">{(price - 1.5).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between pl-1">
                  <span>Kit de Copo Oficial & Taxas</span>
                  <span className="text-white">1.50€</span>
                </div>
                <div className="flex justify-between pl-1 border-t border-zinc-800 pt-2 font-semibold">
                  <span className="text-zinc-300">Valor Total</span>
                  <span className="text-amber-500 text-base">{price.toFixed(2)}€</span>
                </div>
              </div>

              {/* Payment Action Bar */}
              <div className="pt-4">
                {isProcessing ? (
                  <button 
                    disabled
                    className="w-full h-12 rounded-xl bg-zinc-800 text-zinc-400 font-bold flex items-center justify-center space-x-2"
                  >
                    <svg className="animate-spin h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Segurando ligação segura...</span>
                  </button>
                ) : (
                  <button 
                    onClick={handlePayClick}
                    className="w-full h-12 rounded-xl bg-white text-zinc-950 font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-zinc-100 transition active:scale-95 duration-100"
                    id="btn-confirm-applepay"
                  >
                    <CreditCard className="w-5 h-5 text-black" />
                    <span>Confirmar com Biometria  Pay</span>
                  </button>
                )}
                <p className="text-[10px] text-zinc-500 text-center mt-3">
                  Transação segura encriptada fim-a-fim certificada para Cobeer Taste.
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
