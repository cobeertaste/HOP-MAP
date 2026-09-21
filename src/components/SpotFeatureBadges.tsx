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

export function isSpotVerified(bar?: Bar | null): boolean {
  if (!bar) return false;
  if (bar.isVerified) return true;
  const id = bar.id || '';
  const name = (bar.name || '').toLowerCase();
  return (
    id === 'prost-guimaraes' ||
    name.includes('prost') ||
    id === 'deuses-do-malte-v-n-gaia' ||
    id === 'deuses-do-malte' ||
    name.includes('deuses do malte') ||
    id === 'a-fabrica-da-picaria-brew-pub-porto' ||
    id === 'fabrica-da-picaria' ||
    name.includes('picaria') ||
    id === 'musa-das-virtudes-porto' ||
    id === 'musa-virtudes' ||
    name.includes('virtudes') ||
    id === 'brew-portugal-lisboa' ||
    id === 'brew-portugal' ||
    name.includes('brew portugal') ||
    name === 'brew' ||
    name.startsWith('brew (') ||
    name.startsWith('brew!')
  );
}

export function SpotFeatureBadges({ bar, lang = 'PT', compact = false }: SpotFeatureBadgesProps) {
  const features = getBarFeatures(bar, lang);
  const isProst = bar.id === 'prost-guimaraes' || (bar.name && bar.name.toLowerCase().includes('prost'));
  const isDeusesDoMalte = bar.id === 'deuses-do-malte-v-n-gaia' || bar.id === 'deuses-do-malte' || (bar.name && bar.name.toLowerCase().includes('deuses do malte'));
  const isPicaria = bar.id === 'a-fabrica-da-picaria-brew-pub-porto' || bar.id === 'fabrica-da-picaria' || (bar.name && bar.name.toLowerCase().includes('picaria'));
  const isVirtudes = bar.id === 'musa-das-virtudes-porto' || bar.id === 'musa-virtudes' || (bar.name && bar.name.toLowerCase().includes('virtudes'));
  const isBrew = bar.id === 'brew-portugal-lisboa' || bar.id === 'brew-portugal' || (bar.name && bar.name.toLowerCase().includes('brew portugal')) || (bar.name && (bar.name.toLowerCase().startsWith('brew') && !bar.name.toLowerCase().includes('brewpub')));
  const isVerified = isSpotVerified(bar);

  let tapsCount = features.taps;
  if (isBrew) {
    tapsCount = 23;
  } else if (isPicaria) {
    tapsCount = 9;
  } else if (isVirtudes) {
    tapsCount = 15;
  } else if (isProst) {
    tapsCount = 7;
  } else if (isDeusesDoMalte) {
    tapsCount = 10;
  }

  let tapsLabel = `${tapsCount} Taps`;
  if (isVerified) {
    tapsLabel = lang === 'PT' ? `Torneiras: ${tapsCount}` : `Taps: ${tapsCount}`;
  }

  let foodLabel = lang === 'PT' ? 'Comida / Petiscos' : 'Food & Snacks';
  if (isVerified) {
    foodLabel = lang === 'PT' ? (features.hasFood ? 'Comida: Sim' : 'Comida: Não') : (features.hasFood ? 'Food: Yes' : 'Food: No');
  }

  let petLabel = 'Pet Friendly';
  if (isVerified) {
    petLabel = lang === 'PT' ? (features.petFriendly ? 'Pet friendly: Sim' : 'Pet friendly: Não') : (features.petFriendly ? 'Pet friendly: Yes' : 'Pet friendly: No');
  }

  let terraceLabel = lang === 'PT' ? 'Esplanada' : 'Terrace';
  let terraceNegative = false;
  if (isVerified) {
    if (features.hasTerrace) {
      terraceLabel = lang === 'PT' ? 'Esplanada: Sim' : 'Terrace: Yes';
      terraceNegative = false;
    } else {
      terraceLabel = lang === 'PT' ? 'Esplanada: Não' : 'Terrace: No';
      terraceNegative = true;
    }
  }

  let parkingLabel = lang === 'PT' ? 'Estacionamento' : 'Parking';
  let parkingNegative = !features.hasParking;
  if (bar.parkingNotePT) {
    parkingLabel = lang === 'PT'
      ? `Estacionamento: ${bar.parkingNotePT}`
      : `Parking: ${bar.parkingNoteEN || bar.parkingNotePT}`;
    parkingNegative = bar.hasParking === false || bar.parkingNotePT.toLowerCase().includes('não') || bar.parkingNotePT.toLowerCase().includes('nao');
  } else if (isBrew) {
    parkingLabel = lang === 'PT' ? 'Estacionamento: Não (público)' : 'Parking: No (public)';
    parkingNegative = true;
  } else if (isPicaria || isVirtudes) {
    parkingLabel = lang === 'PT' ? 'Estacionamento: Sim (público)' : 'Parking: Yes (public)';
    parkingNegative = false;
  } else if (isProst) {
    parkingLabel = lang === 'PT' ? 'Estacionamento: Não' : 'Parking: No';
    parkingNegative = true;
  } else if (isDeusesDoMalte) {
    parkingLabel = lang === 'PT' ? 'Estacionamento: Sim' : 'Parking: Yes';
    parkingNegative = false;
  } else if (isVerified) {
    if (features.hasParking) {
      parkingLabel = lang === 'PT' ? 'Estacionamento: Sim' : 'Parking: Yes';
      parkingNegative = false;
    } else {
      parkingLabel = lang === 'PT' ? 'Estacionamento: Não' : 'Parking: No';
      parkingNegative = true;
    }
  } else if (bar.hasParking === false) {
    parkingLabel = lang === 'PT' ? 'Estacionamento: Não' : 'Parking: No';
    parkingNegative = true;
  }

  const chips = [
    {
      id: 'taps',
      show: true,
      iconName: 'tap' as const,
      label: tapsLabel,
      isNegative: false
    },
    {
      id: 'food',
      show: isVerified ? true : features.hasFood,
      iconName: 'food' as const,
      label: foodLabel,
      isNegative: false
    },
    {
      id: 'pet',
      show: isVerified ? true : features.petFriendly,
      iconName: 'pet' as const,
      label: petLabel,
      isNegative: false
    },
    {
      id: 'terrace',
      show: isVerified ? true : features.hasTerrace,
      iconName: 'terrace' as const,
      label: terraceLabel,
      isNegative: terraceNegative
    },
    {
      id: 'parking',
      show: isVerified || features.hasParking || bar.hasParking === false,
      iconName: 'parking' as const,
      label: parkingLabel,
      isNegative: parkingNegative
    },
    {
      id: 'beershop',
      show: !isVerified && features.hasBeerShop,
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
