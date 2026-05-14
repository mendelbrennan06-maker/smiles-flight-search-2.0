import assert from 'node:assert/strict';
import { expandRoutes } from '../src/data/cityCodes.js';
import { brlToUsd } from '../src/lib/format.js';
import { parseManualSmilesText } from '../src/lib/parser.js';
import { detectAutomationBlock } from '../src/lib/smiles.js';

assert.deepEqual(expandRoutes('NYC', 'YYZ'), [
  { origin: 'LGA', destination: 'YYZ' },
  { origin: 'JFK', destination: 'YYZ' },
  { origin: 'EWR', destination: 'YYZ' },
]);
assert.deepEqual(expandRoutes('YYZ', 'NYC'), [
  { origin: 'YYZ', destination: 'LGA' },
  { origin: 'YYZ', destination: 'JFK' },
  { origin: 'YYZ', destination: 'EWR' },
]);
assert.equal(Math.round(brlToUsd(528, 5.38)), 100);

const text = `LGA 6:15am - YYZ 7:58am\nAir Canada Classe Econômica 20,000 points R$ 165,00\nAir Canada Classe Executiva 40,000 points R$ 210,00\n\nLGA 8:50am - YYZ 10:33am\nAir Canada Economica 18,000 pontos R$ 155,00\n\nJFK 12:45pm - YYZ 2:28pm\nAir Canada Executiva 45,000 points R$ 240,00`;
const results = parseManualSmilesText(text, { departureDate: '2026-11-11', maxPoints: 40000, exchangeRate: 5.38 });
assert.equal(results.length, 2);
assert.deepEqual(results[0].fares.map((fare) => fare.cabin), ['Economy', 'Business']);
assert.equal(results[1].fares[0].points, 18000);
assert.match(detectAutomationBlock('Create account Access account Privacy Policy Travel fees Please wait while we search')[0], /likely blocked/);

console.log('All parser and routing tests passed.');
