# Smiles Award Studio

A private, production-minded Version 1 for Smiles award-flight searching. It intentionally starts with a reliable manual-paste parser and polished hosted UI instead of pretending that Railway-hosted browser automation will reliably scrape Smiles. The shipped implementation is dependency-light vanilla JavaScript so a non-technical user has fewer install failures; the long-term premium product can migrate this same logic to Next.js/React when saved accounts, databases, and alert workflows are added.

## Best architecture recommendation

**Recommended Version 1: Railway-hosted React UI + manual paste parser + Smiles URL builder + optional future local worker.**

Why this is best:

1. Your previous Railway + Playwright attempt proved that the app can deploy, but Smiles often serves cloud browsers only a loading/marketing page.
2. A premium UI can still be hosted on Railway or any static host.
3. You keep value even when automation fails: open Smiles manually, copy visible results, paste into the app, and get filtered/converted/formatted output.
4. Later, a local worker or browser extension can send data into the same UI without redesigning the product.

## Architecture comparison

| Option | How it works | Pros | Cons | Anti-bot reliability | Non-technical ease | Mobile | Phantom verification | Login/session | Deployment | Maintenance | Cost | UI flexibility |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Full Railway scraper | Railway runs Playwright and scrapes Smiles live | One hosted app | Likely blocked; sessions/CAPTCHA hard | Low | Easy if it works, frustrating when blocked | Good UI possible | Possible in theory, fragile | Poor | Medium | High | Low-medium | High |
| Railway frontend + manual parser | Railway hosts this app; you paste text | Reliable, simple, useful now | Semi-manual | High because you use normal browser | High | Excellent | Manual review only | You log in normally | Low | Low | Low | High |
| Railway frontend + local worker | UI hosted; your computer runs Playwright/browser and posts results | Best automation/reliability balance | Requires local worker install | Medium-high | Medium | UI mobile, worker desktop | Possible by clicking/selecting locally | Good | Medium | Medium | Low | High |
| Fully local app | Everything runs on your computer | Best session control | No always-on hosted dashboard | Medium-high | Medium | Poor unless exposed | Possible | Good | Low-medium | Medium | Low | Medium-high |
| Browser extension + Railway dashboard | Extension reads pages you manually open | Excellent anti-bot posture | Extension build/signing complexity | High | Medium | Desktop Chrome only | Good if extension reads selection/checkout state | Excellent | Medium-high | Medium | Low | High |
| API/data provider | Buy award data from provider | Most robust if available | Smiles partner space may not be available; cost/legal constraints | Highest | High | Excellent | Provider-dependent | No Smiles session | Low-medium | Low | Medium-high | High |
| Desktop app | Electron/Tauri wrapper with browser/parser | Polished local experience | Install/update complexity | Medium-high | Medium | Desktop only | Possible | Good | Medium | Medium | Low | High |
| Telegram bot | Send routes/text; bot returns results | Great alerts later | Bad primary UI | N/A if parser-only | Medium | Excellent | Limited | Limited | Medium | Medium | Low | Low |
| WhatsApp bot | Similar to Telegram | Familiar interface | WhatsApp Business setup, template restrictions | N/A if parser-only | Medium | Excellent | Limited | Limited | High | Medium-high | Medium | Low |
| Hybrid browser assistant | Manual browser + local helper + hosted dashboard | Best long-term path | More moving pieces | High | Medium after setup | Good dashboard | Best realistic option | Good | Medium | Medium | Low-medium | High |

## What Version 1 includes

- Modern OTA-style dependency-light web UI. For a larger V2, Next.js + React + Tailwind/shadcn is the recommended premium frontend stack.
- Manual paste mode.
- Parser test mode via included sample text.
- City-code expansion including NYC, WAS, CHI, LON, PAR, SAO, RIO, and more.
- Smiles one-way URL builder for 1 adult, cabin ALL, miles-only-style partner search URL.
- Points threshold filtering: values equal to the max are included; values above max are hidden.
- Cabin translation: Econômica/Economica/Classe Econômica to Economy; Executiva/Classe Executiva to Business.
- BRL to USD conversion using `entered_rate - 0.10`.
- Point-value tier calculation.
- Clean copy-ready formatted output.
- Detection for likely automation-block landing/loading page text.

## Folder structure

```text
smiles-flight-search-2.0/
├── README.md
├── index.html
├── package.json
├── railway.json
├── scripts/
│   ├── build.js
│   ├── server.js
│   └── test.js
└── src/
    ├── data/
    │   └── cityCodes.js
    ├── lib/
    │   ├── format.js
    │   ├── parser.js
    │   └── smiles.js
    ├── main.js
    └── styles.css
```

## Mac setup, step by step

1. Install Google Chrome.
2. Install GitHub Desktop from `https://desktop.github.com/` if you do not want to use terminal Git.
3. Install Node.js LTS from `https://nodejs.org/`.
4. Open Terminal.
5. Go to the folder where you keep projects:

```bash
cd ~/Documents
```

6. Clone your GitHub repository, replacing the URL with your repo URL:

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
```

7. Enter the folder:

```bash
cd YOUR-REPO
```

8. Install dependencies:

```bash
npm install
```

9. Start the app:

```bash
npm run dev
```

10. Open the local URL shown in Terminal, usually `http://localhost:5173`.

## Windows setup, step by step

1. Install Google Chrome.
2. Install GitHub Desktop from `https://desktop.github.com/`.
3. Install Node.js LTS from `https://nodejs.org/`.
4. Open **PowerShell**.
5. Go to your Documents folder:

```powershell
cd $HOME\Documents
```

6. Clone your GitHub repository, replacing the URL with your repo URL:

```powershell
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
```

7. Enter the folder:

```powershell
cd YOUR-REPO
```

8. Install dependencies:

```powershell
npm install
```

9. Start the app:

```powershell
npm run dev
```

10. Open the local URL shown in PowerShell, usually `http://localhost:5173`.

## Railway deployment

Railway is realistic for this Version 1 UI/parser app.

1. Push this repository to GitHub.
2. In Railway, create a new project.
3. Choose **Deploy from GitHub repo**.
4. Select this repository.
5. Railway should detect the Node app.
6. Set the build command to:

```bash
npm run build
```

7. Set the start command to:

```bash
npm run preview -- --host 0.0.0.0 --port $PORT
```

8. Deploy.

Do **not** treat Railway as reliable for live Smiles browser automation. Use Railway for the UI, parser, saved searches, and future dashboard.

## Exact run commands

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Create production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Manual workflow

1. Open the app.
2. Enter origin, destination, date, max points, and BRL/USD rate.
3. Click one of the generated Smiles route links.
4. Search Smiles manually in your normal browser.
5. If Smiles requires login or CAPTCHA, complete it manually.
6. Copy the visible flight-result text.
7. Paste it into the app.
8. Review cards and copy-ready formatted output.

## Troubleshooting

### Smiles shows only loading text

If you see text like "Create account", "Access account", "Travel fees", "Privacy Policy", or "Please wait while we search" but no flights, Smiles likely blocked or limited automation. Use manual paste mode.

### Parser finds no flights

Try copying a larger block of visible result text. The parser expects each result to include:

- origin airport code,
- departure time,
- destination airport code,
- arrival time,
- airline,
- cabin,
- points.

### Taxes show as $0.00

The copied text may not include tax values. Smiles sometimes hides taxes until a fare is selected.

### Railway build fails

Run locally first:

```bash
npm install
npm run build
```

If local build works, check Railway's build/start commands.

## Future roadmap

1. Saved searches in a small database.
2. CSV export.
3. Google Sheets export.
4. Email alerts.
5. Telegram alerts.
6. WhatsApp alerts only after the core workflow is stable.
7. Chrome extension that reads visible Smiles result cards from pages you manually open.
8. Local Playwright worker that uses your logged-in browser profile and sends results to the hosted dashboard.
9. Phantom-ticket verification by selecting a fare and confirming that Smiles proceeds to the next step.
10. Residential proxy evaluation only if legally and contractually acceptable; never build CAPTCHA bypassing.
11. AI-assisted parsing for messy copied text.
12. Multi-date and multi-route batch searches.
