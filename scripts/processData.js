// scripts/processData.js
// Runs before next build via "prebuild" script.
// Produces public/data/districts.geojson with KEI + ELA + trajectory data joined to CT district shapes.
//
// Metric direction reference (CRITICAL — do not invert silently):
//   KEI  LI_PCT1:             higher = WORSE  (more students needing support)
//   ELA  Ind1ELA_All_Rate:    higher = BETTER (higher performance index)
//
// Quartile convention used in output:
//   kei_quartile:  1 = best (lowest LI_PCT1),  4 = worst (highest LI_PCT1)
//   ela_quartile:  1 = worst (lowest ELA rate), 4 = best (highest ELA rate)

const fs = require('fs');
const path = require('path');
const https = require('https');
const XLSX = require('xlsx');
const { distance } = require('fastest-levenshtein');

// ─── paths ───────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const KEI_FILE = path.join(ROOT, 'data', 'KEI_201415_to_202526_public.xlsx');
const ELA_FILE = path.join(ROOT, 'data', 'nextgenacct.csv');
const RAW_SHAPES = path.join(ROOT, 'public', 'data', 'ct-districts-raw.geojson');
const OUT_FILE = path.join(ROOT, 'public', 'data', 'districts.geojson');

// ─── manual name overrides ────────────────────────────────────────────────────
// Key = normalized KEI/ELA name  →  Value = normalized shapefile name
// Add entries here when the build logs report unmatched districts.
const MANUAL_OVERRIDES = {
  'regional school district 1': 'regional school district no. 1',
  'regional school district 4': 'regional school district no. 4',
  'regional school district 5': 'regional school district no. 5',
  'regional school district 6': 'regional school district no. 6',
  'regional school district 7': 'regional school district no. 7',
  'regional school district 8': 'regional school district no. 8',
  'regional school district 9': 'regional school district no. 9',
  'regional school district 10': 'regional school district no. 10',
  'regional school district 11': 'regional school district no. 11',
  'regional school district 12': 'regional school district no. 12',
  'regional school district 13': 'regional school district no. 13',
  'regional school district 14': 'regional school district no. 14',
  'regional school district 15': 'regional school district no. 15',
  'regional school district 16': 'regional school district no. 16',
  'regional school district 17': 'regional school district no. 17',
  'regional school district 18': 'regional school district no. 18',
  'regional school district 19': 'regional school district no. 19',
};

// ─── helpers ──────────────────────────────────────────────────────────────────
function normalizeName(name) {
  return String(name ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\bschool district\b/g, '')
    .replace(/\bpublic schools\b/g, '')
    .replace(/\bschools\b/g, '')
    .replace(/\bschool\b/g, '')
    .replace(/\bdistrict\b/g, '')
    .replace(/\bsd\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse failed: ${e.message}\n${data.slice(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

function quartile(values, value) {
  // Returns 1–4 quartile rank for `value` within sorted `values` array.
  // Q1 = bottom 25%, Q4 = top 25%.
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const rank = sorted.findIndex((v) => v >= value);
  const pct = rank / n;
  if (pct < 0.25) return 1;
  if (pct < 0.50) return 2;
  if (pct < 0.75) return 3;
  return 4;
}

// ─── 1. Read KEI ──────────────────────────────────────────────────────────────
console.log('Reading KEI data…');
const keiWb = XLSX.readFile(KEI_FILE);
const keiWs = keiWb.Sheets['KEI Data - All Years'];
const keiRaw = XLSX.utils.sheet_to_json(keiWs, { header: 1 });
// Row index 2 = headers, row index 3+ = data
const keiHeaders = keiRaw[2];
const yearIdx     = keiHeaders.indexOf('Year');
const distNameIdx = keiHeaders.indexOf('districtname');
const distNumIdx  = keiHeaders.indexOf('Dist_Num');
const liPct1Idx   = keiHeaders.indexOf('LI_PCT1');

const keiByDistrict = {};
for (let i = 3; i < keiRaw.length; i++) {
  const row = keiRaw[i];
  if (!row || row[yearIdx] !== '2020-21') continue;
  const name = String(row[distNameIdx] ?? '').trim();
  const code = String(row[distNumIdx] ?? '').padStart(3, '0');
  const liPct1 = parseFloat(row[liPct1Idx]);
  if (!name || isNaN(liPct1)) continue;
  keiByDistrict[normalizeName(name)] = { raw_name: name, dist_num: code, li_pct1: liPct1 };
}
console.log(`  KEI 2020-21: ${Object.keys(keiByDistrict).length} districts`);

// ─── 2. Read ELA ──────────────────────────────────────────────────────────────
console.log('Reading ELA data…');
const elaRaw = fs.readFileSync(ELA_FILE, 'utf8').split('\n').filter((l) => l.trim());
// Row 0 = title, row 1 = headers, row 2+ = data
const elaHeaderLine = elaRaw[1].replace(/^"|"$/g, '');
const elaHeaders = elaHeaderLine.split('","');

function elaCol(name) { return elaHeaders.indexOf(name); }
const colDistName  = elaCol('RptngDistrictName');
const colDistCode  = elaCol('ReportingDistrictCode');
const colCategory  = elaCol('Category');
const colOrgType   = elaCol('SchoolOrgType');
const colElaRate   = elaCol('Ind1ELA_All_Rate');
const colElaHnRate = elaCol('Ind1ELA_HN_Rate');
const colElaGrowth = elaCol('Ind2ELA_All_Rate');
const colPartRate  = elaCol('Ind3ELA_All_Rate');

const elaByDistrict = {};
for (let i = 2; i < elaRaw.length; i++) {
  const cols = elaRaw[i].split(',');
  const category = (cols[colCategory] ?? '').replace(/"/g, '').trim();
  const orgType  = (cols[colOrgType]  ?? '').replace(/"/g, '').trim();
  if (category !== 'DistrictTot' || orgType !== 'District') continue;

  const rawName  = (cols[colDistName] ?? '').replace(/"/g, '').trim();
  // District code stored as ="0140011" — strip the formula wrapper
  const rawCode  = (cols[colDistCode] ?? '').replace(/[="]/g, '').trim();
  const elaRate  = parseFloat(cols[colElaRate]);
  const elaHnRate = parseFloat(cols[colElaHnRate]);
  const elaGrowth = parseFloat(cols[colElaGrowth]);
  const partRate  = parseFloat(cols[colPartRate]);

  if (!rawName || isNaN(elaRate)) continue;
  elaByDistrict[normalizeName(rawName)] = {
    raw_name: rawName,
    district_code: rawCode,
    ela_performance_index: Math.round(elaRate * 10) / 10,
    ela_hn_rate: isNaN(elaHnRate) ? null : Math.round(elaHnRate * 10) / 10,
    ela_growth_rate: isNaN(elaGrowth) ? null : Math.round(elaGrowth * 10) / 10,
    ela_participation_rate: isNaN(partRate) ? null : Math.round(partRate * 1000) / 10,
  };
}
console.log(`  ELA 2024-25: ${Object.keys(elaByDistrict).length} districts`);

// ─── 3–8. Async main ─────────────────────────────────────────────────────────
async function main() {

// ─── 3. Fetch or load CT district shapefile ───────────────────────────────────
let shapes;
if (fs.existsSync(RAW_SHAPES)) {
  console.log('Loading cached CT district shapes…');
  shapes = JSON.parse(fs.readFileSync(RAW_SHAPES, 'utf8'));
} else {
  console.log('Fetching CT district shapes from ArcGIS…');
  // Connecticut FIPS = '09'; filter by STATEFP and active unified/elementary/secondary districts
  const url =
    'https://services1.arcgis.com/Ua5sjt3LWTPigjyD/arcgis/rest/services/School_Districts_Current/FeatureServer/0/query' +
    "?where=STATEFP='09'&outFields=NAME,STATEFP,GEOID,UNSDLEA,ELSDLEA,SCSDLEA,FUNCSTAT&f=geojson&resultRecordCount=300";
  shapes = await fetchJson(url);
  fs.mkdirSync(path.dirname(RAW_SHAPES), { recursive: true });
  fs.writeFileSync(RAW_SHAPES, JSON.stringify(shapes));
  console.log(`  Fetched ${shapes.features.length} CT district features`);
}

// ─── 4. Compute quartiles ─────────────────────────────────────────────────────
// KEI: higher LI_PCT1 = worse. kei_quartile 1 = best (lowest LI_PCT1).
// We invert: rank by LI_PCT1 ascending, so Q1 = lowest (best) LI_PCT1.
const keiValues = Object.values(keiByDistrict).map((d) => d.li_pct1);
const elaValues = Object.values(elaByDistrict).map((d) => d.ela_performance_index);

function keiQuartile(li_pct1) {
  // Raw quartile of li_pct1 (Q4 = highest = worst). Invert so Q1 = best.
  const rawQ = quartile(keiValues, li_pct1);
  return 5 - rawQ; // 1→4, 2→3, 3→2, 4→1
}

function elaQuartile(perf) {
  // Q1 = lowest ELA = worst, Q4 = highest ELA = best. No inversion needed.
  return quartile(elaValues, perf);
}

function trajectory(keiQ, elaQ) {
  // kei_quartile: 1=best KEI (low risk), 4=worst KEI (high risk)
  // ela_quartile: 1=worst ELA, 4=best ELA
  const goodKei = keiQ >= 3; // kei quartile 3–4 = good (low LI_PCT1)
  const goodEla = elaQ >= 3; // ela quartile 3–4 = good (high performance)
  if (goodKei && goodEla)  return 'stayed_high';
  if (!goodKei && !goodEla) return 'stayed_low';
  if (!goodKei && goodEla)  return 'improved';
  return 'declined'; // goodKei && !goodEla
}

// ─── 5. Fuzzy name matching ───────────────────────────────────────────────────
function findMatch(normalizedName, lookupMap) {
  if (MANUAL_OVERRIDES[normalizedName]) {
    return lookupMap[MANUAL_OVERRIDES[normalizedName]] ?? null;
  }
  if (lookupMap[normalizedName]) return lookupMap[normalizedName];
  // Fuzzy: find closest name with Levenshtein distance ≤ 3
  let best = null, bestDist = Infinity;
  for (const key of Object.keys(lookupMap)) {
    const d = distance(normalizedName, key);
    if (d < bestDist) { bestDist = d; best = key; }
  }
  if (bestDist <= 3) return lookupMap[best];
  return null;
}

// ─── 6. Join to shapes ────────────────────────────────────────────────────────
console.log('Joining data to shapes…');

// Build lookup: normalized shapefile name → feature index
const shapeNameField = shapes.features[0]?.properties?.NAME
  ? 'NAME'
  : shapes.features[0]?.properties?.DISTRICT_NAME
  ? 'DISTRICT_NAME'
  : Object.keys(shapes.features[0]?.properties ?? {}).find((k) =>
      k.toUpperCase().includes('NAME')
    );
console.log(`  Shapefile name field: ${shapeNameField}`);

const shapeByNorm = {};
shapes.features.forEach((f, i) => {
  const n = normalizeName(f.properties?.[shapeNameField] ?? '');
  shapeByNorm[n] = i;
});

// Build lookup for KEI and ELA index → their data objects
const keiLookup = {}; // normalized name → kei data
Object.entries(keiByDistrict).forEach(([norm, data]) => { keiLookup[norm] = data; });
const elaLookup = {};
Object.entries(elaByDistrict).forEach(([norm, data]) => { elaLookup[norm] = data; });

const unmatched = { kei: [], ela: [] };
let matched = 0, noData = 0;

const outputFeatures = shapes.features.map((feature) => {
  const shapeNorm = normalizeName(feature.properties?.[shapeNameField] ?? '');

  const kei = findMatch(shapeNorm, keiByDistrict);
  const ela = findMatch(shapeNorm, elaByDistrict);

  if (!kei) unmatched.kei.push(feature.properties?.[shapeNameField]);
  if (!ela) unmatched.ela.push(feature.properties?.[shapeNameField]);

  const keiQ = kei ? keiQuartile(kei.li_pct1) : null;
  const elaQ = ela ? elaQuartile(ela.ela_performance_index) : null;
  const traj = keiQ !== null && elaQ !== null ? trajectory(keiQ, elaQ) : 'no_data';

  if (traj !== 'no_data') matched++; else noData++;

  return {
    ...feature,
    properties: {
      district_name: feature.properties?.[shapeNameField] ?? '',
      district_code: ela?.district_code ?? kei?.dist_num ?? null,

      // KEI
      kei_li_pct1: kei?.li_pct1 ?? null,
      kei_quartile: keiQ,
      kei_year: kei ? '2020-21' : null,

      // ELA
      ela_performance_index: ela?.ela_performance_index ?? null,
      ela_hn_rate: ela?.ela_hn_rate ?? null,
      ela_growth_rate: ela?.ela_growth_rate ?? null,
      ela_participation_rate: ela?.ela_participation_rate ?? null,
      ela_quartile: elaQ,
      ela_year: ela ? '2024-25' : null,

      // Bivariate
      trajectory: traj,
    },
  };
});

// ─── 7. Log unmatched ─────────────────────────────────────────────────────────
if (unmatched.kei.length) {
  console.warn(`\n  ⚠ KEI unmatched (${unmatched.kei.length}):`, unmatched.kei.join(', '));
}
if (unmatched.ela.length) {
  console.warn(`  ⚠ ELA unmatched (${unmatched.ela.length}):`, unmatched.ela.join(', '));
}
console.log(`\n  ✓ ${matched} districts with full data, ${noData} with missing data`);

// ─── 8. Write output ──────────────────────────────────────────────────────────
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify({ type: 'FeatureCollection', features: outputFeatures }));
console.log(`\n✓ Written to ${OUT_FILE}`);

} // end main
main().catch((err) => { console.error(err); process.exit(1); });
