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
  const isProst = bar.id === 'prost-guimaraes' || (bar.name && bar.name.toLowerCase().includes('prost'));

  const chips = [
    {
      id: 'taps',
      show: true,
      iconName: 'tap' as const,
      label: isProst 
        ? (lang === 'PT' ? 'Torneiras: 7' : 'Taps: 7')
        : `${features.taps} Taps`,
      isNegative: false
    },
    {
      id: 'food',
      show: isProst ? true : features.hasFood,
      iconName: 'food' as const,
      label: isProst
        ? (lang === 'PT' ? 'Comida: Sim' : 'Food: Yes')
        : (lang === 'PT' ? 'Comida / Petiscos' : 'Food & Snacks'),
      isNegative: false
    },
    {
      id: 'pet',
      show: isProst ? true : features.petFriendly,
      iconName: 'pet' as const,
      label: isProst
        ? (lang === 'PT' ? 'Pet friendly: Sim' : 'Pet friendly: Yes')
        : 'Pet Friendly',
      isNegative: false
    },
    {
      id: 'terrace',
      show: isProst ? true : features.hasTerrace,
      iconName: 'terrace' as const,
      label: isProst
        ? (lang === 'PT' ? 'Esplanada: Sim' : 'Terrace: Yes')
        : (lang === 'PT' ? 'Esplanada' : 'Terrace'),
      isNegative: false
    },
    {
      id: 'parking',
      show: isProst || features.hasParking || bar.hasParking === false,
      iconName: 'parking' as const,
      label: isProst || bar.hasParking === false
        ? (features.hasParking ? (lang === 'PT' ? 'Estacionamento: Sim' : 'Parking: Yes') : (lang === 'PT' ? 'Estacionamento: Não' : 'Parking: No'))
        : (lang === 'PT' ? 'Estacionamento' : 'Parking'),
      isNegative: !features.hasParking
    },
    {
      id: 'beershop',
      show: !isProst && features.hasBeerShop,
      iconName: 'beershop' as const,
      label: 'Beer Shop / Take-away',
      isNegative: false
    }
  ];

  return (
    <div className="flex flex-wrap gap-1.5 pt-1 select-none">
      {chips.filter(c => c.show).map(chip => (
        <span 
          key={chip.id} 
          className={`inline-flex items-center gap-1 rounded-lg border-2 border-[#1B2036] transition-colors ${
            compact 
              ? 'px-1.5 py-0.5 text-[8.5px]' 
              : 'px-2 py-0.5 text-[9.5px]'
          } ${
            chip.isNegative 
              ? 'bg-[#FEE2E2] text-[#991B1B] shadow-[1.5px_1.5px_0px_#1B2036]' 
              : 'bg-[#F6EFDC] text-[#1B2036] shadow-[1.5px_1.5px_0px_#1B2036]'
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
