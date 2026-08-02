const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../src/spots_all.csv');
const content = fs.readFileSync(csvPath, 'utf-8');

function parseCSV(text) {
  // Detect delimiter: if first line contains semicolons, use ';', otherwise ','
  const firstLine = text.split(/\r?\n/)[0] || '';
  const delimiter = firstLine.includes(';') ? ';' : ',';

  const rows = [];
  let currentRow = [];
  let currentToken = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i+1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentToken += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !insideQuotes) {
      if (char === '\r') i++;
      currentRow.push(currentToken.trim());
      if (currentRow.length > 1 || currentRow[0] !== '') {
        rows.push(currentRow);
      }
      currentRow = [];
      currentToken = '';
    } else {
      currentToken += char;
    }
  }
  if (currentToken !== '' || currentRow.length > 0) {
    currentRow.push(currentToken.trim());
    rows.push(currentRow);
  }
  return rows;
}

const zoneEnumMap = {
  'Açores': 'ACORES',
  'Coimbra': 'COIMBRA',
  'Aveiro': 'AVEIRO',
  'Óbidos': 'OBIDOS',
  'Ericeira': 'ERICEIRA',
  'Colares': 'COLARES',
  'Sintra': 'SINTRA',
  'Cascais': 'CASCAIS',
  'Lisboa': 'LISBOA',
  'Madeira': 'MADEIRA',
  'Caminha': 'CAMINHA',
  'Viana do Castelo': 'VIANA_DO_CASTELO',
  'Braga': 'BRAGA',
  'Bragança': 'BRAGANCA',
  'Vila Verde': 'VILA_VERDE',
  'Matosinhos': 'MATOSINHOS',
  'Porto': 'PORTO',
  'Évora': 'EVORA',
  'Castelo de Vide': 'CASTELO_DE_VIDE',
  'Setúbal': 'SETUBAL',
  'Lagos': 'LAGOS',
  'Portimão': 'PORTIMAO',
  'Faro': 'FARO',
  'Tavira': 'TAVIRA',
  'Fuzeta': 'FUZETA',
  'Vila Viçosa': 'VILA_VICOSA',
  'Lagoa': 'LAGOA',
  'Figueira de Castelo Rodrigo': 'FIGUEIRA_DE_CASTELO_RODRIGO',
  'Arganil': 'ARGANIL',
  'Vila Nova de Poiares': 'VILA_NOVA_DE_POIARES',
  'Monsanto': 'MONSANTO',
  'Oliveira de Azeméis': 'OLIVEIRA_DE_AZEMEIS',
  'V.N. Gaia': 'VN_GAIA',
  'Fermelã': 'FERMELA',
  'Penafiel': 'PENAFIEL',
  'Santa Maria da Feira': 'SANTA_MARIA_DA_FEIRA',
  'Ponte de Lima': 'PONTE_DE_LIMA',
  'Guimarães': 'GUIMARAES',
  'Senhora da Hora': 'SENHORA_DA_HORA',
  'Amarante': 'AMARANTE',
  'Lourinhã': 'LOURINHA',
  'Jesufrei': 'JESUFREI',
  'Caldas da Rainha': 'CALDAS_DA_RAINHA'
};

const defaultBeerStyles = [
  ["IPA", "Lager", "Stout", "Sour"],
  ["NEIPA", "Pilsner", "Session IPA", "Saison"],
  ["Craft Lager", "West Coast IPA", "Imperial Stout", "Porter"],
  ["Belgian Tripel", "Amber Ale", "Fruit Sour", "Wheat Beer"],
  ["Hazy IPA", "APA", "Double IPA", "Gose"]
];

const rows = parseCSV(content).slice(1);
const idSet = new Set();
const barObjects = [];

rows.forEach((row, index) => {
  let local = '', horarioPT = '', horarioEN = '', infoPT = '', infoEN = '', regiao = '', morada = '', coords = '', mapUrl = '', foto = '', instagram = '', facebook = '', site = '';

  if (row.length >= 12) {
    // 13 column schema
    [local, horarioPT, horarioEN, infoPT, infoEN, regiao, morada, coords, mapUrl, foto, instagram, facebook, site] = row;
  } else {
    // Legacy 11 column schema
    [local, horarioPT, infoPT, regiao, morada, coords, mapUrl, foto, instagram, facebook, site] = row;
  }
  
  if (!local) return;

  // Cleanup fields
  local = local.trim();
  horarioPT = (horarioPT || '').trim().replace(/\\n/g, '\n');
  horarioEN = (horarioEN || '').trim().replace(/\\n/g, '\n');
  infoPT = (infoPT || '').trim();
  infoEN = (infoEN || '').trim();
  regiao = (regiao || '').trim();
  morada = (morada || '').trim();
  coords = (coords || '').trim();
  foto = (foto || '').trim();
  instagram = (instagram || '').trim();
  facebook = (facebook || '').trim();
  site = (site || '').trim();

  // Unique ID slug
  let baseSlug = local.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  let regSlug = regiao.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let id = `${baseSlug}-${regSlug}`;
  if (idSet.has(id)) {
    id = `${id}-${index + 1}`;
  }
  idSet.add(id);

  // Coords
  let lat = 39.5, lng = -8.0;
  if (coords && coords.includes(',')) {
    const parts = coords.split(',').map(p => parseFloat(p.trim()));
    if (!isNaN(parts[0]) && !isNaN(parts[1])) {
      lat = parts[0];
      lng = parts[1];
    }
  }

  // Cover photo fallback
  if (!foto) {
    foto = "https://images.squarespace-cdn.com/content/v1/61e94a43b03e8e6c92a7ab39/eabab170-fdc1-4d6b-898e-859f60b073b0/01A.png?format=500w";
  }

  // BarZone
  const enumKey = zoneEnumMap[regiao] || 'PORTO';

  // Display Name: e.g. "Local (Regiao)"
  const displayName = local.includes(`(${regiao})`) ? local : `${local} (${regiao})`;

  const styles = defaultBeerStyles[index % defaultBeerStyles.length];
  const rating = +(4.5 + (index % 5) * 0.1).toFixed(1);
  const reviewsCount = 40 + (index * 7) % 350;

  const finalWorkingHoursPT = horarioPT || 'Consultar horários no local.';
  const finalWorkingHoursEN = horarioEN || horarioPT || 'Check working hours on site.';

  const finalDescriptionPT = infoPT || `${local} é um ponto de referência para os amantes de cerveja artesanal em ${regiao}.`;
  const finalDescriptionEN = infoEN || infoPT || `${local} is a craft beer spot in ${regiao}.`;

  barObjects.push({
    id,
    name: displayName,
    enumKey,
    address: morada || regiao,
    workingHours: finalWorkingHoursPT,
    workingHoursPT: finalWorkingHoursPT,
    workingHoursEN: finalWorkingHoursEN,
    styles,
    description: finalDescriptionPT,
    descriptionPT: finalDescriptionPT,
    descriptionEN: finalDescriptionEN,
    rating,
    reviewsCount,
    coverPhoto: foto,
    instagramUrl: instagram,
    facebookUrl: facebook,
    latitude: lat,
    longitude: lng,
    hasApplePay: true
  });
});

console.log(`Generated ${barObjects.length} bar objects.`);

// Write all_spots.ts file
let tsCode = `import { Bar, BarZone } from './types';\n\nexport const ALL_SPOTS: Bar[] = [\n`;

barObjects.forEach((b, i) => {
  tsCode += `  {\n`;
  tsCode += `    id: ${JSON.stringify(b.id)},\n`;
  tsCode += `    name: ${JSON.stringify(b.name)},\n`;
  tsCode += `    zone: BarZone.${b.enumKey},\n`;
  tsCode += `    address: ${JSON.stringify(b.address)},\n`;
  tsCode += `    workingHours: ${JSON.stringify(b.workingHours)},\n`;
  tsCode += `    workingHoursPT: ${JSON.stringify(b.workingHoursPT)},\n`;
  tsCode += `    workingHoursEN: ${JSON.stringify(b.workingHoursEN)},\n`;
  tsCode += `    styles: ${JSON.stringify(b.styles)},\n`;
  tsCode += `    description: ${JSON.stringify(b.description)},\n`;
  tsCode += `    descriptionPT: ${JSON.stringify(b.descriptionPT)},\n`;
  tsCode += `    descriptionEN: ${JSON.stringify(b.descriptionEN)},\n`;
  tsCode += `    rating: ${b.rating},\n`;
  tsCode += `    reviewsCount: ${b.reviewsCount},\n`;
  tsCode += `    coverPhoto: ${JSON.stringify(b.coverPhoto)},\n`;
  if (b.instagramUrl) tsCode += `    instagramUrl: ${JSON.stringify(b.instagramUrl)},\n`;
  if (b.facebookUrl) tsCode += `    facebookUrl: ${JSON.stringify(b.facebookUrl)},\n`;
  tsCode += `    latitude: ${b.latitude},\n`;
  tsCode += `    longitude: ${b.longitude},\n`;
  tsCode += `    hasApplePay: true\n`;
  tsCode += `  }${i < barObjects.length - 1 ? ',' : ''}\n`;
});

tsCode += `];\n`;

fs.writeFileSync(path.join(__dirname, '../src/all_spots.ts'), tsCode);
console.log('Saved src/all_spots.ts successfully!');
