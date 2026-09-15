/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bar, BeerEvent, BarZone } from './types';
import { ALL_SPOTS } from './all_spots';
import { SPOT_DESCRIPTIONS_EN_BY_ID } from './lib/i18n';

export { ALL_SPOTS };

const ALL_BARS_RAW: Bar[] = ALL_SPOTS;

const seenBarIds = new Set<string>();
export const BARS_DATA: Bar[] = ALL_BARS_RAW
  .filter((bar) => {
    if (!bar.id || seenBarIds.has(bar.id)) {
      return false;
    }
    seenBarIds.add(bar.id);
    return true;
  })
  .map((bar) => {
    const enDesc = SPOT_DESCRIPTIONS_EN_BY_ID[bar.id];
    return {
      ...bar,
      descriptionEN: enDesc || bar.descriptionEN || bar.description,
      descriptionPT: bar.descriptionPT || bar.description
    };
  });

export const EVENTS_DATA: BeerEvent[] = [
  {
    id: 'bash_beer_fest',
    title: 'BASH Beer Fest',
    location: 'Coimbra',
    date: '8 a 10 de Maio de 2026',
    description: 'O festival de cerveja artesanal BASH Beer Fest celebra a inovação e o espírito craft de produtores de elite.',
    coverPhoto: '/spots_pics/bash+beer+fest.jpg',
    price: 5.00,
    organizer: 'BASH',
    category: 'festival',
    endDate: '2026-05-10'
  },
  {
    id: 'aveiro_beer_fest',
    title: 'Aveiro Beer Fest',
    location: 'Aveiro',
    date: '8 a 10 de Maio de 2026',
    description: 'Aveiro transforma-se na capital da cerveja artesanal com as melhores marcas nacionais, petiscos e música ao vivo.',
    coverPhoto: '/spots_pics/aveiro+beer+fest.jpg',
    price: 5.00,
    organizer: 'Aveiro Craft',
    category: 'festival',
    endDate: '2026-05-10'
  },
  {
    id: 'wow_festival_craft',
    title: 'WOW Festival Craft',
    location: 'V.N.Gaia',
    date: '22 a 24 de Maio de 2026',
    description: 'No prestigiado quarteirão cultural WOW em Vila Nova de Gaia, uma experiência sofisticada de cervejas e gastronomia.',
    coverPhoto: '/spots_pics/wow+festival+craft.jpg',
    price: 8.00,
    organizer: 'WOW Gaia',
    category: 'festival',
    endDate: '2026-05-24'
  },
  {
    id: 'maia_beer_market',
    title: 'Maia',
    location: 'Maia',
    date: '22 a 24 de Maio de 2026',
    description: 'O mercado de cerveja traz os melhores produtores artesanais e muita animação descontraída ao coração da Maia.',
    coverPhoto: '/spots_pics/Maia-Beer-Market.jpg',
    price: 5.00,
    organizer: 'Município da Maia',
    category: 'festival',
    endDate: '2026-05-24'
  },
  {
    id: 'hopen_braga',
    title: 'HOPEN',
    location: 'Braga',
    date: '29 a 31 de Maio de 2026',
    description: 'O festival urbano HOPEN em Braga reúne cerveja de excelência, street food incrível e um cartaz musical de primeira linha.',
    coverPhoto: '/spots_pics/hopen+braga+beer+fest.png',
    price: 6.00,
    organizer: 'HOPEN',
    category: 'festival',
    endDate: '2026-05-31'
  },
  {
    id: 'rural_beer_fest',
    title: 'Rural Beer Fest',
    location: 'Braga',
    date: '5 a 6 de Junho de 2026',
    description: 'Uma atmosfera rústica e acolhedora em Braga para saborear a ligação direta entre a tradição rural e a mestria cervejeira.',
    coverPhoto: '/spots_pics/486553629_122094809888830425_6610238651526796041_n.jpg',
    price: 5.00,
    organizer: 'Rural Braga',
    category: 'festival',
    endDate: '2026-06-06'
  },
  {
    id: 'viana_beer_fest',
    title: 'Viana Beer Fest',
    location: 'Viana do Castelo',
    date: '2 a 5 de Julho de 2026',
    description: 'Cerveja artesanal fresca e o melhor ambiente na histórica e marítima cidade de Viana do Castelo.',
    coverPhoto: '/spots_pics/viana+beer+fest.png',
    price: 5.00,
    organizer: 'Viana Craft',
    category: 'festival',
    endDate: '2026-07-05'
  },
  {
    id: 'art_beer_fest',
    title: 'Art Beer Fest',
    location: 'Caminha',
    date: '9 a 12 de Julho de 2026',
    description: 'O maior festival de cerveja artesanal ao ar livre da Península Ibérica está de volta! Mais de 40 cervejeiras mundiais e nacionais pelas históricas ruas de Caminha.',
    coverPhoto: '/spots_pics/art+beer+fest.jpg',
    price: 10.00,
    organizer: 'OG & Caminha',
    category: 'festival',
    endDate: '2026-07-12'
  },
  {
    id: 'fura_beer_fest',
    title: 'Fura Beer Fest',
    location: 'Furadouro',
    date: '31 de Julho a 2 de Agosto de 2026',
    description: 'Um refrescante festival costeiro na bela Praia do Furadouro, com muito mar, sol e excelentes cervejas artesanais.',
    coverPhoto: '/spots_pics/fura+beer+fest.jpg',
    price: 6.00,
    organizer: 'Fura Craft',
    category: 'festival',
    endDate: '2026-08-02'
  },
  {
    id: 'beer_garden',
    title: 'Beer Garden',
    location: 'Castelo de Vide',
    date: '6 a 8 de Agosto de 2026',
    description: 'Um belíssimo festival no jardim histórico de Castelo de Vide, combinando a pacatez alentejana com lúpulo fresco.',
    coverPhoto: '/spots_pics/beer+garden+beer+fest.jpg',
    price: 5.00,
    organizer: 'Vide Events',
    category: 'festival',
    endDate: '2026-08-08'
  },
  {
    id: 'brew_coimbra',
    title: 'Brew!',
    location: 'Coimbra',
    date: '11 a 13 de Setembro de 2026',
    description: 'O prestigiado festival Brew! regressa a Coimbra no belo Parque Verde do Mondego com muita animação e os melhores brewers do país.',
    coverPhoto: '/spots_pics/brew+coimbra.jpg',
    price: 5.00,
    organizer: 'Brew Coimbra',
    category: 'festival',
    endDate: '2026-09-13'
  },
  {
    id: 'ouro_incenso_birra',
    title: 'Ouro Incenso e Birra',
    location: 'Lisboa',
    date: '10 de Janeiro de 2026',
    description: 'O tradicional evento de inverno que junta cervejas artesanais raras, gastronomia de conforto e um ambiente caloroso em Lisboa.',
    coverPhoto: '/spots_pics/ouro-incenso-e-birra-2026.jpg',
    price: 5.00,
    organizer: 'Ouro Incenso',
    category: 'festival',
    endDate: '2026-01-10'
  },
  {
    id: 'caldas_beer_fest',
    title: 'Caldas Beer Fest',
    location: 'Caldas da Rainha',
    date: '27 de Fevereiro a 1 de Março de 2026',
    description: 'Caldas da Rainha acolhe este festival dinâmico que celebra o movimento craft com provas, concertos e street food.',
    coverPhoto: '/spots_pics/caldas+beer+fest.png',
    price: 5.00,
    organizer: 'Caldas Craft',
    category: 'festival',
    endDate: '2026-03-01'
  },
  {
    id: 'cerveja_com_todos_beerfest',
    title: 'Cerveja com Todos Beerfest',
    location: 'Linhó',
    date: '10 a 11 de Abril de 2026',
    description: 'O grande encontro de apaixonados pela cerveja em Linhó, promovendo a partilha, workshops e os lançamentos mais recentes.',
    coverPhoto: '/spots_pics/Cerveja+com+Todos+Beerfest.jpg',
    price: 5.00,
    organizer: 'Cerveja com Todos',
    category: 'festival',
    endDate: '2026-04-11'
  },
  {
    id: 'borba_beer_fest',
    title: 'Borba Beer Fest',
    location: 'Borba de Montanha',
    date: '12 a 13 de Junho de 2026',
    description: 'Uma festa vibrante celebrando a melhor cerveja artesanal em Borba de Montanha, com street food fantástica e grandes concertos.',
    coverPhoto: '/spots_pics/borba+beer+fest.png',
    price: 5.00,
    organizer: 'Borba Craft',
    category: 'festival',
    endDate: '2026-06-13'
  },
  {
    id: 'porto_beer_fest',
    title: 'Porto Beer Fest',
    location: 'Porto',
    date: '17 a 21 de Junho de 2026',
    description: 'O maior festival urbano de cerveja artesanal no Porto, reunindo dezenas de cervejeiras nacionais e internacionais de referência.',
    coverPhoto: '/spots_pics/porto+beer+fest.jpg',
    price: 8.00,
    organizer: 'Porto Craft',
    category: 'festival',
    endDate: '2026-06-21'
  },
  {
    id: 'santa_maria_da_feira_beer_fest',
    title: 'Festival de cerveja artesanal de Santa Maria da Feira',
    location: 'Santa Maria da Feira',
    date: '3 a 5 de Julho de 2026',
    description: 'O castelo medieval e as ruas de Santa Maria da Feira enchem-se de animação, sabores maltados e lúpulo fresco.',
    coverPhoto: '/spots_pics/festival+cerveja+santa+maria+da+feira.jpeg',
    price: 5.00,
    organizer: 'Feira Craft',
    category: 'festival',
    endDate: '2026-07-05'
  },
  {
    id: 'famalicao_beer_fest',
    title: 'Famalicão Beer Fest',
    location: 'Famalicão',
    date: '2 a 5 de Julho de 2026',
    description: 'Grande celebração do movimento craft em Famalicão com excelentes produtores nacionais, gastronomia regional e muito convívio.',
    coverPhoto: '/spots_pics/famalicao+beer+fest.jpg',
    price: 5.00,
    organizer: 'Famalicão Eventos',
    category: 'festival',
    endDate: '2026-07-05'
  },
  {
    id: 'silves_beer_fest',
    title: 'Silves Beer Fest',
    location: 'Silves',
    date: '14 a 18 de Julho de 2026',
    description: 'A histórica cidade de Silves recebe este festival incrível no Algarve, aliando o património à paixão pela cerveja artesanal.',
    coverPhoto: '/spots_pics/silves+beer+fest.jpg',
    price: 5.00,
    organizer: 'Silves Craft',
    category: 'festival',
    endDate: '2026-07-18'
  },
  {
    id: 'beer_ato',
    title: 'Beer Ato',
    location: 'Lisboa',
    date: '3 a 4 de Julho de 2026',
    description: 'Um evento alternativo em Lisboa, focado na cultura independente da cerveja de autor, arte e boa música.',
    coverPhoto: '/spots_pics/beer+ato.png',
    price: 5.00,
    organizer: 'Ato Lisboa',
    category: 'festival',
    endDate: '2026-07-04'
  },
  {
    id: 'maria_da_fonte_beer_fest',
    title: 'Festival de Cerveja Artesanal Maria da Fonte',
    location: 'Póvoa do Lanhoso',
    date: '17 a 18 de Julho de 2026',
    description: 'Homenagem à história e tradição na Póvoa de Lanhoso com os melhores produtores artesanais e animação popular.',
    coverPhoto: '/spots_pics/Festival+de+cerveja+artesanal+maria+da+fonte.jpg',
    price: 5.00,
    organizer: 'Maria da Fonte',
    category: 'festival',
    endDate: '2026-07-18'
  },
  {
    id: 'amadora_beer_fest',
    title: 'Amadora Beer Fest',
    location: 'Amadora',
    date: '3 a 5 de Julho de 2026',
    description: 'A Amadora acolhe o seu festival anual de cerveja artesanal, trazendo as novidades do setor e deliciosas harmonizações gastronómicas.',
    coverPhoto: '/spots_pics/amadora+beer+fest.jpg',
    price: 5.00,
    organizer: 'Município da Amadora',
    category: 'festival',
    endDate: '2026-07-05'
  },
  {
    id: 'letra_harvest',
    title: 'Letra Harvest',
    location: 'Vila Verde',
    date: '21 a 23 de Agosto',
    description: 'O festival anual de colheita do lúpulo da Cerveja Letra em Vila Verde. Uma celebração da terra e da cerveja fresca diretamente da origem.',
    coverPhoto: '/spots_pics/harvest_2026.png',
    price: 5.00,
    organizer: 'Cerveja Letra',
    category: 'festival',
    endDate: '2026-08-23'
  },
  {
    id: 'craft_craft_beer_fest',
    title: 'Craft & Craft Beer Fest',
    location: 'Alvaiázere',
    date: '30 de Maio de 2026',
    description: 'O festival dinâmico que junta artesãos da cerveja e artes tradicionais em Alvaiázere para um dia inesquecível de partilha.',
    coverPhoto: '/spots_pics/festival+craft+constancia.png',
    price: 5.00,
    organizer: 'Craft & Craft',
    category: 'festival',
    endDate: '2026-05-30'
  },
  {
    id: 'arco_beer_fest',
    title: 'Arco Beer Fest',
    location: 'Arco de Baúlhe',
    date: 'Sem data',
    description: 'O encanto do Arco de Baúlhe combinado com os melhores aromas do malte e do lúpulo nacionais.',
    coverPhoto: '',
    price: 5.00,
    organizer: 'Arco Craft',
    category: 'festival'
  },
  {
    id: 'beericeira',
    title: 'BEERiceira',
    location: 'Ericeira',
    date: '4 a 6 de Setembro de 2026',
    description: 'Ondas, surf e excelente cerveja artesanal na vila pitoresca e costeira da Ericeira.',
    coverPhoto: '/spots_pics/beericeira.png',
    price: 5.00,
    organizer: 'BEERiceira Crew',
    category: 'festival',
    endDate: '2026-09-06'
  },
  {
    id: 'oktoberfesta',
    title: 'Oktoberfesta',
    location: 'Lisboa',
    date: 'Sem data',
    description: 'Inspirado no tradicional festival de Munique, com reinterpretação artesanal portuguesa de excelência em Lisboa.',
    coverPhoto: '',
    price: 5.00,
    organizer: 'Marvila Brewers',
    category: 'festival'
  },
  {
    id: 'ebora_beer_fest',
    title: 'Ebora Beer Fest',
    location: 'Évora',
    date: 'Sem data',
    description: 'Uma belíssima celebração no coração do Alentejo, reunindo a história milenar de Évora à paixão pela cerveja craft.',
    coverPhoto: '',
    price: 5.00,
    organizer: 'Ebora Craft',
    category: 'festival'
  },
  {
    id: 'into_the_woods',
    title: 'Into the Woods',
    location: 'Lisboa',
    date: 'Sem data',
    description: 'Um evento intimista focado em cervejas envelhecidas em barrica, sours complexas e gastronomia selecionada.',
    coverPhoto: '',
    price: 6.00,
    organizer: 'Woods Brewery',
    category: 'festival'
  },
  {
    id: 'guimaraes_beer_fest',
    title: 'Guimarães Beer Fest',
    location: 'Guimarães',
    date: 'Sem data',
    description: 'Na cidade berço, ergue-se uma festa em honra do malte e lúpulo artesanais portugueses, repleta de sabor.',
    coverPhoto: '',
    price: 5.00,
    organizer: 'Guimarães Craft',
    category: 'festival'
  },
  {
    id: 'christmas_hopen',
    title: 'Christmas HOPEN',
    location: 'Braga',
    date: 'Sem data',
    description: 'A magia do Natal em Braga alia-se ao calor e riqueza das cervejas de inverno do coletivo HOPEN.',
    coverPhoto: '',
    price: 5.00,
    organizer: 'HOPEN',
    category: 'festival'
  },
  {
    id: 'festival_craft_beer_constancia',
    title: 'Festival Craft Beer',
    location: 'Constância',
    date: '22 a 23 de Agosto de 2026',
    description: 'Cerveja artesanal e convívio descontraído na pitoresca vila ribeirinha de Constância.',
    coverPhoto: '/spots_pics/festival+craft+constancia.png',
    price: 5.00,
    organizer: 'Constância Craft',
    category: 'festival',
    endDate: '2026-08-23'
  }
];;

export const SAMPLE_REVIEWS: Record<string, Bar['reviews']> = {};
export const getReviewsForBar = (barId: string): Bar['reviews'] => {
  return [];
};

export { getLevelDetails, getUserTierIndex, type LevelInfo } from './lib/levels';
export { getBarOpenStatus, getBarFeatures, type OpenStatusResult, type BarFeaturesResult } from './lib/openingHours';

