export type SpecialEventType = 
  | 'beer_day' 
  | 'reinheitsgebot' 
  | 'wenceslaus' 
  | 'st_patricks' 
  | 'christmas' 
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
}

/**
 * Determines which special beer/cultural event is active today based on the date.
 * Allows passing an optional mock date for testing/preview purposes.
 */
export function getActiveSpecialEvent(customDate?: Date): SpecialEventInfo | null {
  const date = customDate || new Date();
  const month = date.getMonth(); // 0-indexed: 0=Jan, 2=Mar, 3=Apr, 7=Aug, 8=Sep, 11=Dec
  const day = date.getDate();
  const dayOfWeek = date.getDay(); // 0=Sun, 5=Fri

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

  // 5. Entre 10 de Dezembro e 5 de Janeiro: Boas Festas / Natal
  if ((month === 11 && day >= 10) || (month === 0 && day <= 5)) {
    return {
      type: 'christmas',
      titlePT: 'BOAS FESTAS',
      titleEN: 'HAPPY HOLIDAYS',
      subtitlePT: 'Votos de festas felizes e boas cervejas!',
      subtitleEN: 'Wishing you happy holidays and great beers!',
      isChristmas: true
    };
  }

  return null;
}
