
const COMMON_BRANDS = [
  "YAMAHA", "SUZUKI", "HONDA", "BAJAJ", "AKT", "KAWASAKI", "KTM", 
  "HERO", "TVS", "VICTORY", "KYMCO", "PIAGGIO", "SYM", "SIGMA"
];

const COMMON_MODELS = [
  "BWS", "PULSAR", "BOXER", "GN", "TS", "DT", "RX", "XTZ", "NMAX", 
  "FZ", "GIXER", "APACHE", "NKD", "LIBERO", "BWS 125", "BWS 4T", "FZ 16", "CB 125", "NS 200"
];

function extractBrand(title) {
  const upperTitle = title.toUpperCase();
  for (const brand of COMMON_BRANDS) {
    if (upperTitle.includes(brand)) return brand;
  }
  return null;
}

function extractModel(title) {
  const upperTitle = title.toUpperCase();
  const sortedModels = [...COMMON_MODELS].sort((a, b) => b.length - a.length);
  for (const model of sortedModels) {
    if (upperTitle.includes(model)) return model;
  }
  return null;
}

function normalizeYear(y) {
  if (y >= 1000) return y;
  if (y < 30) return 2000 + y;
  if (y >= 70) return 1900 + y;
  return y;
}

function extractYears(title) {
  const years = [];
  const upperTitle = title.toUpperCase();
  const modMatch = upperTitle.match(/\(MOD\s+([^)]+)\)/);
  if (!modMatch) return [];
  const content = modMatch[1].trim();
  const parts = content.split(/[\s,/]+|(?<=\d)-(?=\d)/);
  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      let start = parseInt(startStr);
      let end = parseInt(endStr);
      if (!isNaN(start) && !isNaN(end)) {
        start = normalizeYear(start);
        end = normalizeYear(end);
        for (let y = Math.min(start, end); y <= Math.max(start, end); y++) {
          years.push(y);
        }
      }
    } else {
      const year = parseInt(part);
      if (!isNaN(year)) {
        years.push(normalizeYear(year));
      }
    }
  }
  return [...new Set(years)].sort();
}

const testTitles = [
  "KIT PIN PASADOR MORDAZA FZ 16 YAMAHA (MOD 11-15)",
  "EMPAQUE CULATA HONDA CB 125 (MOD 2024)",
  "DISCO FRENO SUZUKI GN 125",
  "RETEN MOTOR AKT NKD 125 (MOD 08-12 / 15)",
  "SWICHE ENCENDIDO BOXER CT 100 BAJAJ (MOD 10-18)",
  "PASTILLA FRENO PULSAR 200 NS / RS (DELANTERA)"
];

console.log('--- TEST DE EXTRACCION DE VEHICULOS (INTERNAL LOGIC) ---');

testTitles.forEach(title => {
  console.log(`\nTitulo: "${title}"`);
  console.log(`  Marca:  ${extractBrand(title)}`);
  console.log(`  Modelo: ${extractModel(title)}`);
  console.log(`  Años:   ${JSON.stringify(extractYears(title))}`);
});
