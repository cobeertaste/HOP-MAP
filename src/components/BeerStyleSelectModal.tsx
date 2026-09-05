/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Beer, Check, X, Sparkles, PlusCircle } from 'lucide-react';
import { CRAFT_BEER_STYLES, getLocalizedBeerStyle } from '../lib/craftBeerStyles';
import { Language } from '../lib/i18n';

interface BeerStyleSelectModalProps {
  isOpen: boolean;
  spotName: string;
  spotId: string;
  lang: Language;
  darkMode?: boolean;
  onSelectStyle: (style: string) => void;
  onClose: () => void;
}

export default function BeerStyleSelectModal({
  isOpen,
  spotName,
  spotId,
  lang,
  darkMode = true,
  onSelectStyle,
  onClose
}: BeerStyleSelectModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [customStyleInput, setCustomStyleInput] = useState<string>('');

  if (!isOpen) return null;

  const isOtherSelected = selectedStyle === 'Outra';

  const handleConfirm = () => {
    if (!selectedStyle) return;

    if (isOtherSelected && customStyleInput.trim()) {
      onSelectStyle(customStyleInput.trim());
    } else {
      onSelectStyle(selectedStyle);
    }
  };

  const titleText = lang === 'PT' 
    ? 'Qual o estilo de cerveja que bebeste?' 
    : 'Which beer style did you drink?';

  const subtitleText = lang === 'PT'
    ? 'Regista a tua cerveja e ajuda a calcular as métricas deste spot!'
    : 'Log your beer and help calculate this spot\'s statistics!';

  const otherLabel = lang === 'PT' ? 'Outra' : 'Other';
  const customPlaceholder = lang === 'PT' 
    ? 'Escreve o estilo da cerveja...' 
    : 'Type the beer style...';
  const confirmBtnText = lang === 'PT' ? 'Confirmar Estilo 🍺' : 'Confirm Style 🍺';
  const skipBtnText = lang === 'PT' ? 'Saltar' : 'Skip';

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[460] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        id="beer-style-modal-backdrop"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`relative w-full max-w-md my-auto rounded-[28px] p-5 sm:p-6 border-2 border-amber-500/50 shadow-2xl z-10 space-y-4 max-h-[90vh] flex flex-col ${
            darkMode ? 'bg-zinc-950 text-white' : 'bg-zinc-900 text-white'
          }`}
          id="beer-style-modal-content"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black border-2 border-black flex items-center justify-center transition cursor-pointer shadow-md"
            id="btn-close-beer-style-modal"
            title={skipBtnText}
          >
            <X className="w-4 h-4 text-black stroke-[2.5]" />
          </button>

          {/* Header Badge */}
          <div className="flex flex-col items-center text-center space-y-2 pt-1 shrink-0">
            <div className="flex items-center gap-2 bg-black/70 px-3.5 py-1 rounded-xl border border-amber-500/50 shadow-md">
              <Beer className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span 
                className="text-[11px] font-bold tracking-wider font-press-start text-amber-400"
                style={{ textShadow: '1px 1px 0px #000' }}
              >
                CHECK-IN CONFIRMADO
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-black text-amber-400 font-display tracking-tight">
                {titleText}
              </h2>
              <p className="text-xs text-zinc-300 font-medium">
                {spotName && (
                  <span className="text-amber-300 font-bold block mb-0.5">
                    📍 {spotName}
                  </span>
                )}
                <span className="text-[11px] text-zinc-400">{subtitleText}</span>
              </p>
            </div>
          </div>

          {/* Beer Styles Scrollable Grid */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 min-h-[220px] max-h-[340px] custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {CRAFT_BEER_STYLES.map((style) => {
                const isSelected = selectedStyle === style;
                const displayLabel = getLocalizedBeerStyle(style, lang);

                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => {
                      setSelectedStyle(style);
                      if (style !== 'Outra') {
                        setCustomStyleInput('');
                      }
                    }}
                    id={`btn-beer-style-${style.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black border-amber-400 shadow-md shadow-amber-500/20 scale-[1.01]'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-1">
                      <span className={`text-xs ${isSelected ? 'text-black' : 'text-amber-400'}`}>
                        🍺
                      </span>
                      <span className="truncate">{displayLabel}</span>
                    </div>

                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-black text-amber-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* If 'Outra' / 'Other' is selected, show custom input field */}
            {isOtherSelected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-2"
              >
                <div className="p-2.5 rounded-xl bg-black/60 border border-amber-500/40 space-y-1.5">
                  <label className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <PlusCircle className="w-3 h-3 text-amber-400" />
                    {lang === 'PT' ? 'Especifica o Estilo (Opcional):' : 'Specify Beer Style (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={customStyleInput}
                    onChange={(e) => setCustomStyleInput(e.target.value)}
                    placeholder={customPlaceholder}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/20 text-white text-xs rounded-lg focus:outline-none focus:border-amber-400 font-sans"
                    id="input-custom-beer-style"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 shrink-0 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-bold transition cursor-pointer text-center"
              id="btn-skip-beer-style"
            >
              {skipBtnText}
            </button>

            <button
              type="button"
              disabled={!selectedStyle}
              onClick={handleConfirm}
              className={`flex-[2] py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider font-display transition cursor-pointer shadow-lg text-center ${
                selectedStyle
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/25 active:scale-98'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
              }`}
              id="btn-confirm-beer-style"
            >
              {confirmBtnText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
