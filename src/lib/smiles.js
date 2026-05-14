import { expandRoutes } from '../data/cityCodes.js';
import { parseLocalDate } from './format.js';

export function buildSmilesUrl(origin, destination, departureDate) {
  const dateMillis = parseLocalDate(departureDate).getTime();
  const params = new URLSearchParams({
    adults: '1', cabin: 'ALL', children: '0', departureDate: String(dateMillis), infants: '0', isElegible: 'false', isFlexibleDateChecked: 'false', returnDate: '', searchType: 'congenere', segments: '1', tripType: '2', originAirport: origin.toUpperCase(), originCity: '', originCountry: '', originAirportIsAny: 'false', destinationAirport: destination.toUpperCase(), destinCity: '', destinCountry: '', destinAirportIsAny: 'false', 'novo-resultado-voos': 'true',
  });
  return `https://www.smiles.com.br/mfe/emissao-passagem/?${params.toString()}`;
}

export function buildExpandedSmilesUrls(inputs) {
  return expandRoutes(inputs.origin, inputs.destination).map((route) => ({ ...route, url: buildSmilesUrl(route.origin, route.destination, inputs.departureDate) }));
}

export function detectAutomationBlock(text) {
  const normalized = text.toLowerCase();
  const warningSignals = ['create account', 'access account', 'privacy policy', 'cookie preferences', 'travel fees', 'please wait while we search'];
  const realResultSignals = ['points', 'pontos', 'executiva', 'econômica', 'economica'];
  const warnings = [];
  const hasWarnings = warningSignals.filter((signal) => normalized.includes(signal)).length >= 2;
  const hasResults = realResultSignals.some((signal) => normalized.includes(signal));
  if (hasWarnings && !hasResults) warnings.push('Smiles likely blocked automation or served only the landing/loading page. Use manual paste mode or a local logged-in browser.');
  if (normalized.includes('captcha') || normalized.includes('recaptcha')) warnings.push('CAPTCHA detected. Do not try to bypass it automatically; complete it manually in your own browser.');
  return warnings;
}
