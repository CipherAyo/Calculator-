#  Calculator

A vanilla HTML/CSS/JavaScript implementation based on the supplied competition-level product specification.

## Included
- Responsive application shell with desktop sidebar and mobile bottom navigation
- Dashboard
- Basic calculator with memory and keyboard support
- Scientific calculator UI and scientific function insertion
- Persistent calculation history and favorites-ready architecture
- Math Notes with autosave
- Unit converter
- Currency-converter-ready 
- Global search / Ctrl+K command palette
- Dark/light/system themes are avaialable based on user preference 
- Settings, JSON export/import and reset
- Accessible focus states, semantic controls and reduced-motion support
- PWA manifest and service worker

## Run
Open `index.html` in a browser. For service-worker/PWA testing, use a local static server, e.g. VS Code Live Server.

## Production notes
The currency section intentionally does a live exchange rate, Connect a real exchange-rate API
## Live currency converter
The currency converter uses ExchangeRate-API Open Access directly from the browser:

`https://open.er-api.com/v6/latest/{BASE_CURRENCY}`

No API key is required. The UI displays the live rate, conversion result, and the provider's last-update timestamp. Refresh requests the latest available rate data. If the API/network is unavailable, the interface shows an explicit error instead of pretending that a hard-coded rate is live.


## v2 navigation and converter update
- Unit Converter now contains only Length, Area, and Volume.
- Length, Area, and Volume conversions use unit factors in the frontend.
- Basic Calculator, Scientific Calculator, and Math Notes are grouped in a collapsible sidebar submenu under Dashboard.
- Service worker cache updated to v2 and removes older caches on activation.
