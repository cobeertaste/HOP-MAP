import React from 'react';
import { Bar } from '../types';
import { Language } from '../lib/i18n';
import { getBarFeatures } from '../lib/openingHours';
import { PixelIcon } from './PixelIcons';

interface SpotFeatureBadgesProps {
  bar: Bar;
  lang?: Language;
  compact?: boolean;
}

export function SpotFeatureBadges({ bar, lang = 'PT', compact = false }: SpotFeatureBadgesProps) {
  const features = getBarFeatures(bar, lang);

  const chips = [
    {
      id: 'taps',
      show: true,
      iconName: 'tap' as const,
      label: `${features.taps} Taps`
    },
    {
      id: 'food',
      show: features.hasFood,
      iconName: 'food' as const,
      label: lang === 'PT' ? 'Comida / Petiscos' : 'Food & Snacks'
    },
    {
      id: 'pet',
      show: features.petFriendly,
      iconName: 'pet' as const,
      label: 'Pet Friendly'
    },
    {
      id: 'terrace',
      show: features.hasTerrace,
      iconName: 'terrace' as const,
      label: lang === 'PT' ? 'Esplanada' : 'Terrace'
    },
    {
      id: 'parking',
      show: features.hasParking,
      iconName: 'parking' as const,
      label: lang === 'PT' ? 'Estacionamento' : 'Parking'
    },
    {
      id: 'beershop',
      show: features.hasBeerShop,
      iconName: 'beershop' as const,
      label: 'Beer Shop / Take-away'
    }
  ];

  return (
    <div className="flex flex-wrap gap-1.5 pt-1 select-none">
      {chips.filter(c => c.show).map(chip => (
        <span 
          key={chip.id} 
          className={`inline-flex items-center gap-1 rounded-lg border-2 border-[#1B2036] transition-colors ${
            compact 
              ? 'px-1.5 py-0.5 text-[8.5px] bg-[#F6EFDC] text-[#1B2036] shadow-[1.5px_1.5px_0px_#1B2036]' 
              : 'px-2 py-0.5 text-[9.5px] bg-[#F6EFDC] text-[#1B2036] shadow-[2px_2px_0px_#1B2036]'
          }`}
        >
          <PixelIcon name={chip.iconName} size={compact ? 12 : 14} className="shrink-0" />
          <span className={`whitespace-nowrap ${chip.id === 'taps' ? 'font-data' : 'font-label uppercase text-[7.5px] tracking-wider'}`}>
            {chip.label}
          </span>
        </span>
      ))}
    </div>
  );
}
