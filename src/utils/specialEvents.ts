export type SpecialEventType = 
  | 'beer_day' 
  | 'reinheitsgebot' 
  | 'wenceslaus' 
  | 'st_patricks' 
  | 'christmas'
  | 'new_year'
  | 'gta6'
  | null;

export interface SpecialEventInfo {
  type: SpecialEventType;
  titlePT: string;
  titleEN: string;
  subtitlePT?: string;
  subtitleEN?: string;
  themeColor?: string; // e.g. '#10B981' for St. Patrick's Day
  isGreenTheme?: boolean;
  isChristmas?: boolean;
  isNewYear?: boolean;
  isGta6Theme?: boolean;
}

/**
 * Returns true strictly between 19-11-2026 and 22-11-2026 (inclusive, local time).
 * After Sunday 22-11-2026, returns false so the UI reverts automatically to the base template.
 */
export function isGta6ThemeActive(customDate?: Date): boolean {
  const date = customDate || new Date();
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed: 10 = November
  const day = date.getDate();
  return year === 2026 && month === 10 && day >= 19 && day <= 22;
}

/**
 * Returns true strictly between December 1st and December 25th (inclusive, local time).
 * From December 26th onwards, returns false so the UI reverts automatically to the base template.
 */
export function isChristmasThemeActive(customDate?: Date): boolean {
  const date = customDate || new Date();
  const month = date.getMonth(); // 0-indexed: 11 = December
  const day = date.getDate();
  return month === 11 && day >= 1 && day <= 25;
}

/**
 * Returns true strictly on December 31st and January 1st of the following year (local time).
 * Starting January 2nd, returns false so the UI reverts automatically to the base template.
 */
export function isNewYearThemeActive(customDate?: Date): boolean {
  const date = customDate || new Date();
  const month = date.getMonth(); // 0-indexed: 11 = December, 0 = January
  const day = date.getDate();
  return (month === 11 && day === 31) || (month === 0 && day === 1);
}

/**
 * Determines which special beer/cultural event is active today based on the date.
 * Allows passing an optional mock date for testing/preview purposes.
 */
export function getActiveSpecialEvent(customDate?: Date): SpecialEventInfo | null {
  const date = customDate || new Date();
  const month = date.getMonth(); // 0-indexed: 0=Jan, 2=Mar, 3=Apr, 7=Aug, 8=Sep, 10=Nov, 11=Dec
  const day = date.getDate();
  const dayOfWeek = date.getDay(); // 0=Sun, 5=Fri

  // 0. Edição Especial Vice / GTA 6 UI (19-11-2026 até 22-11-2026)
  if (isGta6ThemeActive(date)) {
    return {
      type: 'gta6',
      titlePT: 'EDIÇÃO VICE · ROTA ARTESANAL',
      titleEN: 'VICE EDITION · CRAFT CRUISE',
      subtitlePT: '19 a 22 de Novembro · Faz check-in até Domingo e ganha o badge GTA VI',
      subtitleEN: 'Nov 19 – 22 · Check in by Sunday to earn the GTA VI badge',
      themeColor: '#FF4E88',
      isGta6Theme: true
    };
  }

  // 1. Primeira sexta-feira de Agosto: Dia Internacional da Cerveja
  if (month === 7 && dayOfWeek === 5 && day >= 1 && day <= 7) {
    return {
      type: 'beer_day',
      titlePT: 'DIA INTERNACIONAL DA CERVEJA',
      titleEN: 'INTERNATIONAL BEER DAY',
      subtitlePT: 'Celebra a cultura cervejeira com um brinde!',
      subtitleEN: 'Celebrate beer culture with a toast!'
    };
  }

  // 2. 23 de Abril: Dia da Reinheitsgebot (Lei da Pureza Alemã)
  if (month === 3 && day === 23) {
    return {
      type: 'reinheitsgebot',
      titlePT: 'DIA DA REINHEITSGEBOT (Lei da Pureza Alemã)',
      titleEN: 'REINHEITSGEBOT DAY (German Beer Purity Law)',
      subtitlePT: 'Água, Malte de Cevada e Lúpulo desde 1516',
      subtitleEN: 'Water, Barley Malt and Hops since 1516'
    };
  }

  // 3. 28 de Setembro: Dia de São Venceslau (Padroeiro da Cerveja)
  if (month === 8 && day === 28) {
    return {
      type: 'wenceslaus',
      titlePT: 'DIA DE SÃO VENCESLAU (Padroeiro da Cerveja)',
      titleEN: 'ST. WENCESLAUS DAY (Patron Saint of Beer)',
      subtitlePT: 'Padroeiro dos cervejeiros e mestres de lúpulo',
      subtitleEN: 'Patron saint of brewers and hop masters'
    };
  }

  // 4. 17 de Março: St. Patrick's Day (Tema Verde)
  if (month === 2 && day === 17) {
    return {
      type: 'st_patricks',
      titlePT: 'ST. PATRICK\'S DAY',
      titleEN: 'ST. PATRICK\'S DAY',
      subtitlePT: 'Sláinte! Celebração de St. Patrick',
      subtitleEN: 'Sláinte! St. Patrick celebration',
      themeColor: '#10B981',
      isGreenTheme: true
    };
  }

  // 5. De 1 de Dezembro a 25 de Dezembro: Natal (regressa ao template base após 26 de Dezembro)
  if (isChristmasThemeActive(date)) {
    return {
      type: 'christmas',
      titlePT: 'BOAS FESTAS · NATAL HOP-MAP',
      titleEN: 'HAPPY HOLIDAYS · CHRISTMAS EDITION',
      subtitlePT: '1 a 25 de Dezembro · Ambiente e sons de Natal',
      subtitleEN: 'Dec 1 – 25 · Special Christmas holiday atmosphere & sounds',
      themeColor: '#D62839',
      isChristmas: true
    };
  }

  // 6. De 31 de Dezembro a 1 de Janeiro: Passagem de Ano (regressa ao template base a partir de 2 de Janeiro)
  if (isNewYearThemeActive(date)) {
    const isJanFirst = month === 0 && day === 1;
    const celebratoryYear = isJanFirst ? date.getFullYear() : date.getFullYear() + 1;
    return {
      type: 'new_year',
      titlePT: `PASSAGEM DE ANO · FELIZ ${celebratoryYear}`,
      titleEN: `NEW YEAR'S EVE · HAPPY ${celebratoryYear}`,
      subtitlePT: '31 de Dezembro a 1 de Janeiro · Um brinde ao novo ano!',
      subtitleEN: 'Dec 31 – Jan 1 · Cheers to the New Year!',
      themeColor: '#FFD770',
      isNewYear: true
    };
  }

  return null;
}
