import { expandRoutes } from './data/cityCodes.js';
import { formatPlainText, parseManualSmilesText } from './lib/parser.js';
import { buildExpandedSmilesUrls, detectAutomationBlock } from './lib/smiles.js';
import { formatPoints, formatUsd } from './lib/format.js';

const sampleText = `LGA 6:15am - YYZ 7:58am\nAir Canada Classe Econômica 20,000 points R$ 165,00\nAir Canada Classe Executiva 40,000 points R$ 210,00\n\nLGA 8:50am - YYZ 10:33am\nAir Canada Economica 18,000 pontos R$ 155,00\n\nJFK 12:45pm - YYZ 2:28pm\nAir Canada Executiva 45,000 points R$ 240,00`;

const state = {
  origin: 'NYC',
  destination: 'YYZ',
  departureDate: '2026-11-11',
  maxPoints: 40000,
  exchangeRate: 5.38,
  searchMode: 'manual',
  debugMode: true,
  manualText: sampleText,
};

const app = document.querySelector('#root');

function icon(name) {
  const icons = {
    plane: '✈', sparkle: '✦', shield: '✓', arrow: '→', search: '⌕', copy: '⧉', external: '↗', warn: '⚠', moon: '◐', badge: '✓',
  };
  return `<span class="icon">${icons[name] ?? ''}</span>`;
}

function render() {
  const routes = expandRoutes(state.origin, state.destination);
  const urls = buildExpandedSmilesUrls(state);
  const parsed = parseManualSmilesText(state.manualText, state);
  const warnings = detectAutomationBlock(state.manualText);
  const formatted = formatPlainText(parsed);

  app.innerHTML = `
    <main class="shell">
      <section class="hero">
        <nav class="nav">
          <div class="brand"><span class="brandMark">${icon('plane')}</span> Smiles Award Studio</div>
          <div class="pill">${icon('moon')} Dark mode ready</div>
        </nav>
        <div class="heroGrid">
          <div>
            <div class="eyebrow">${icon('sparkle')} Private award-search workspace</div>
            <h1>Search, parse, filter, and format Smiles partner awards without depending on fragile cloud scraping.</h1>
            <p class="heroCopy">Version 1 is built around the reliable workflow: you search Smiles in your own browser, paste visible text here, and get clean OTA-style results with points filters, BRL-to-USD taxes, cabin translation, route expansion, and block detection.</p>
          </div>
          <div class="statusCard">
            <div class="bigIcon">${icon('shield')}</div>
            <strong>Recommended mode: Manual paste + local browser</strong>
            <span>Railway can host this UI, but live Smiles automation should run locally or be handled manually because cloud browsers are commonly blocked.</span>
          </div>
        </div>
      </section>
      <section class="searchPanel glass">
        ${field('Origin', 'origin', state.origin, 'NYC')}
        <span class="routeArrow">${icon('arrow')}</span>
        ${field('Destination', 'destination', state.destination, 'YYZ')}
        ${field('Departure date', 'departureDate', state.departureDate, '', 'date')}
        ${field('Max points', 'maxPoints', state.maxPoints, '', 'number')}
        ${field('BRL/USD rate', 'exchangeRate', state.exchangeRate, '', 'number', '0.01')}
        <button class="searchButton" id="parseButton">${icon('search')} Parse results</button>
      </section>
      <section class="metaGrid">
        <div class="miniCard"><strong>${routes.length}</strong><span>expanded route${routes.length === 1 ? '' : 's'}</span></div>
        <div class="miniCard"><strong>${parsed.length}</strong><span>matching flight${parsed.length === 1 ? '' : 's'}</span></div>
        <div class="miniCard"><strong>${Math.max(state.exchangeRate - 0.1, 0.01).toFixed(2)}</strong><span>adjusted FX rate</span></div>
        <div class="miniCard"><strong>1 adult</strong><span>one-way miles-only</span></div>
      </section>
      <div id="warnings">${warnings.map((warning) => `<div class="warning">${icon('warn')} ${escapeHtml(warning)}</div>`).join('')}</div>
      <section class="workspace">
        <div class="panel">
          <div class="panelHeader"><h2>Manual paste parser</h2><span>Best V1 reliability</span></div>
          <textarea id="manualText" placeholder="Paste visible Smiles search text here...">${escapeHtml(state.manualText)}</textarea>
          <div class="helperText">Tip: open Smiles manually, log in if needed, run your search, select all visible results text, then paste it here. The parser understands Econômica/Economica/Executiva, points, taxes, times, and route lines.</div>
        </div>
        <div class="panel">
          <div class="panelHeader"><h2>Copy-ready output</h2><button class="ghostButton" id="copyButton">${icon('copy')} Copy</button></div>
          <pre class="outputBox" id="formattedOutput">${escapeHtml(formatted)}</pre>
        </div>
      </section>
      <section class="resultsSection">
        <div class="sectionTitle"><h2>Results</h2><span>Sorted by both cabins, economy-only, business-only, then departure time.</span></div>
        <div class="cardsGrid">${parsed.map(renderFlightCard).join('')}</div>
      </section>
      <section class="panel urlsPanel">
        <div class="panelHeader"><h2>Smiles URL builder</h2><span>Open manually; do not rely on Railway scraping</span></div>
        ${urls.map((item) => `<a href="${item.url}" target="_blank" rel="noreferrer">${icon('external')} ${item.origin} → ${item.destination}</a>`).join('')}
      </section>
    </main>`;

  bindInputs();
}

function field(label, key, value, placeholder, type = 'text', step = '') {
  return `<div class="field ${key === 'origin' || key === 'destination' ? 'compact' : ''}"><label>${label}</label><input data-key="${key}" type="${type}" ${step ? `step="${step}"` : ''} value="${escapeHtml(String(value))}" placeholder="${placeholder}" /></div>`;
}

function renderFlightCard(flight) {
  return `<article class="flightCard">
    <div class="flightTop"><div class="logo">${escapeHtml(flight.airline.slice(0, 2).toUpperCase())}</div><div><strong>${escapeHtml(flight.airline)}</strong><span>${flight.dateLabel}</span></div><span class="verified">${icon('badge')}</span></div>
    <div class="timeline"><div><strong>${flight.departTime}</strong><span>${flight.origin}</span></div><div class="line">${icon('plane')}</div><div><strong>${flight.arriveTime}${flight.nextDay ? ' (+1)' : ''}</strong><span>${flight.destination}</span></div></div>
    <div class="fareList">${flight.fares.map((fare) => `<div class="fare"><span class="badge ${fare.cabin.toLowerCase()}">${fare.cabin}</span><strong>${formatPoints(fare.points)} pts</strong><span>${formatUsd(fare.taxUsd)} taxes</span><small>${(fare.pointValue * 100).toFixed(2)}¢/pt value • ${fare.verified}</small></div>`).join('')}</div>
  </article>`;
}

function bindInputs() {
  document.querySelectorAll('input[data-key]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const key = event.target.dataset.key;
      const rawValue = event.target.value;
      state[key] = key === 'maxPoints' || key === 'exchangeRate' ? Number(rawValue) : rawValue.toUpperCase?.() ?? rawValue;
      render();
    });
  });
  document.querySelector('#manualText').addEventListener('input', (event) => {
    state.manualText = event.target.value;
    render();
  });
  document.querySelector('#copyButton').addEventListener('click', async () => {
    await navigator.clipboard.writeText(document.querySelector('#formattedOutput').textContent);
    document.querySelector('#copyButton').innerHTML = `${icon('copy')} Copied`;
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

render();
