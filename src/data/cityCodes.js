export const CITY_CODE_EXPANSIONS = {
  NYC: ['LGA', 'JFK', 'EWR'],
  WAS: ['DCA', 'IAD', 'BWI'],
  CHI: ['ORD', 'MDW'],
  LON: ['LHR', 'LGW', 'LCY', 'STN', 'LTN'],
  PAR: ['CDG', 'ORY'],
  TYO: ['HND', 'NRT'],
  ROM: ['FCO', 'CIA'],
  MIL: ['MXP', 'LIN', 'BGY'],
  SAO: ['GRU', 'CGH', 'VCP'],
  RIO: ['GIG', 'SDU'],
  BUE: ['EZE', 'AEP'],
  YMQ: ['YUL'],
  QSF: ['SFO', 'SJC', 'OAK'],
  LAX: ['LAX'],
  YYZ: ['YYZ'],
};

export function normalizeAirportCode(value) {
  return value.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
}

export function expandAirportOrCity(value) {
  const code = normalizeAirportCode(value);
  if (!code) return [];
  return CITY_CODE_EXPANSIONS[code] ?? [code];
}

export function expandRoutes(origin, destination) {
  const origins = expandAirportOrCity(origin);
  const destinations = expandAirportOrCity(destination);
  return origins.flatMap((from) => destinations.map((to) => ({ origin: from, destination: to })));
}
