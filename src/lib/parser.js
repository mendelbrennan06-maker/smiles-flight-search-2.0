import { brlToUsd, calculatePointValue, formatPoints, formatTimeToAmPm, formatUsd, ordinalDay, timeToMinutes } from './format.js';

const AIRLINE_HINTS = ['Air Canada', 'American Airlines', 'Gol', 'GOL', 'Avianca', 'Copa', 'Delta', 'KLM', 'Air France', 'Iberia', 'TAP', 'Aeromexico', 'Qatar Airways', 'Emirates', 'Turkish Airlines', 'United', 'LATAM'];

function normalizeCabin(value) {
  const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (normalized.includes('executiva') || normalized.includes('business')) return 'Business';
  if (normalized.includes('economica') || normalized.includes('economy')) return 'Economy';
  return null;
}

function parseNumber(value) {
  const cleaned = value.replace(/[^\d.,]/g, '');
  if (cleaned.includes(',') && cleaned.includes('.')) return Number(cleaned.replace(/\./g, '').replace(',', '.'));
  if (cleaned.includes(',') && !cleaned.includes('.')) return Number(cleaned.replace(',', '.'));
  return Number(cleaned.replace(/,/g, ''));
}

function parsePoints(value) {
  return Number(value.replace(/[^\d]/g, ''));
}

function findAirline(text) {
  const match = AIRLINE_HINTS.find((name) => text.toLowerCase().includes(name.toLowerCase()));
  if (match) return match === 'GOL' ? 'Gol' : match;
  const airlineMatch = text.match(/(?:airline|companhia|operado por)[:\s]+([A-Za-zÀ-ÿ ]{3,40})/i);
  return airlineMatch?.[1]?.trim() ?? 'Unknown airline';
}

function parseFares(text, options) {
  const fareRegex = /(Econ[oô]mica|Economica|Classe Econ[oô]mica|Economy|Executiva|Classe Executiva|Business)[^\n\r]{0,80}?([\d.,]+)\s*(?:pontos|points|milhas|miles)[^\n\r]{0,100}?(?:R\$|BRL)?\s*([\d.,]+)?/gi;
  const fares = [];
  let match;
  while ((match = fareRegex.exec(text)) !== null) {
    const cabin = normalizeCabin(match[1]);
    if (!cabin) continue;
    const points = parsePoints(match[2]);
    if (!Number.isFinite(points) || points > options.maxPoints) continue;
    const taxBrl = match[3] ? parseNumber(match[3]) : 0;
    fares.push({ cabin, points, taxBrl, taxUsd: brlToUsd(taxBrl, options.exchangeRate), pointValue: calculatePointValue(points), verified: text.toLowerCase().includes('verified') ? 'Verified' : 'Manual review' });
  }
  return dedupeFares(fares);
}

function dedupeFares(fares) {
  const seen = new Set();
  return fares.filter((fare) => {
    const key = `${fare.cabin}-${fare.points}-${fare.taxBrl}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function splitCandidateBlocks(text) {
  const normalized = text.replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n');
  const blocks = normalized.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  if (blocks.length > 1) return blocks;
  return normalized.split(/(?=[A-Z]{3}\s+\d{1,2}[:h]\d{2})/).map((block) => block.trim()).filter(Boolean);
}

export function parseManualSmilesText(text, options) {
  const blocks = splitCandidateBlocks(text);
  const results = [];
  for (const block of blocks) {
    const routeMatch = block.match(/\b([A-Z]{3})\b\s*(?:→|->|-|to)?\s*(\d{1,2}[:h]\d{2}\s*(?:am|pm)?)\s*(?:.*?)\b([A-Z]{3})\b\s*(?:→|->|-|to)?\s*(\d{1,2}[:h]\d{2}\s*(?:am|pm)?)(?:\s*\(\+1\))?/is) ?? block.match(/\b([A-Z]{3})\b[^\n]{0,30}(\d{1,2}:\d{2}\s*(?:am|pm)?)[^\n]{0,80}\b([A-Z]{3})\b[^\n]{0,30}(\d{1,2}:\d{2}\s*(?:am|pm)?)/i);
    if (!routeMatch) continue;
    const fares = parseFares(block, options);
    if (fares.length === 0) continue;
    const origin = routeMatch[1].toUpperCase();
    const destination = routeMatch[3].toUpperCase();
    const departTime = formatTimeToAmPm(routeMatch[2].replace('h', ':'));
    const arriveTime = formatTimeToAmPm(routeMatch[4].replace('h', ':'));
    results.push({ id: `${origin}-${destination}-${departTime}-${arriveTime}-${results.length}`, dateLabel: ordinalDay(options.departureDate), origin, destination, departTime, arriveTime, nextDay: block.includes('(+1)') || timeToMinutes(arriveTime) < timeToMinutes(departTime), airline: findAirline(block), fares, rawText: block });
  }
  return sortResults(results);
}

export function sortResults(results) {
  return [...results].sort((a, b) => {
    const aCabinScore = cabinScore(a);
    const bCabinScore = cabinScore(b);
    if (aCabinScore !== bCabinScore) return aCabinScore - bCabinScore;
    if (a.origin !== b.origin) return a.origin.localeCompare(b.origin);
    if (a.airline !== b.airline) return a.airline.localeCompare(b.airline);
    return timeToMinutes(a.departTime) - timeToMinutes(b.departTime);
  });
}

function cabinScore(result) {
  const cabins = new Set(result.fares.map((fare) => fare.cabin));
  if (cabins.has('Economy') && cabins.has('Business')) return 0;
  if (cabins.has('Economy')) return 1;
  return 2;
}

export function formatPlainText(results) {
  if (results.length === 0) return 'No parsed flights matched your filters.';
  const lines = [results[0].dateLabel, ''];
  for (const result of results) {
    lines.push(`${result.origin} ${result.departTime} - ${result.destination} ${result.arriveTime}${result.nextDay ? ' (+1)' : ''}`);
    for (const fare of result.fares) lines.push(`${result.airline} ${fare.cabin} Class ${formatPoints(fare.points)} points + ${formatUsd(fare.taxUsd)} taxes`);
    lines.push('');
  }
  return lines.join('\n').trim();
}
