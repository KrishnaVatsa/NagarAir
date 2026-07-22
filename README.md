# NagarAir — Urban Air Quality Intelligence

## Folder structure

```
NagarAir/
  backend/
    forecast_api.py          <- FastAPI server, serves AQI predictions
  frontend/                   <- simple HTML/CSS/JS version (no build step)
  frontend-react/             <- React + Vite version (recommended for demo)
    package.json
    vite.config.js
    index.html
    src/
      main.jsx
      App.jsx
      api.js
      styles.css
      components/
        Header.jsx
        Sidebar.jsx
        StationCard.jsx
        MapView.jsx
        DetailPanel.jsx
        Legend.jsx
      utils/
        aqi.js
  start.bat                   <- one-click launcher for the plain HTML version
  README.md
```

Use **frontend-react** for your demo/judging — it's a proper component-based
React app and fixes the layering bug from the plain HTML version (the AQI
legend/detail panel disappearing behind the map). The **frontend** folder
still works as a lightweight no-build-step fallback if npm ever gives you
trouble right before your demo.

## What's inside (feature summary)

- **Forecast dashboard**: live map, station list, +24h/48h/72h toggle
- **Trend chart**: 7-day actual AQI history + forecast point, per station
- **Multi-Agent Air Intelligence Orchestrator**: a visible 5-agent reasoning
  pipeline per prediction —
  1. Forecast Agent (runs the XGBoost model)
  2. Explainability Agent (real SHAP values — which factors actually
     drove this specific prediction, computed live, not hardcoded)
  3. Risk Escalation Agent (detects severity-band jumps, e.g. Poor → Severe)
  4. Source Attribution Agent (land-use profile + live wind forecast +
     seasonal fire-risk signal — fuses meteorological & geospatial context)
  5. Advisory & Intervention Agent (matches forecast AQI against real
     GRAP — India's Graded Response Action Plan — thresholds and returns
     the actual mandated actions for that stage, plus station-specific
     targeted actions)
- **Wind Plume Tracking**: checks live wind direction/speed between
  station pairs in the same city — flags when pollution from one station
  is likely blowing toward another within the next few hours
- **Administrator Command Center** (toggle in header): a ranked,
  city-wide table across all stations — current/forecast AQI, GRAP stage,
  urgency, likely source, and any active plume alerts — built for how a
  city administrator actually needs to triage, not a single-station view
- **Citizen Health Advisory**: bilingual (EN/Hindi), risk-band guidance

## One-time setup

1. Make sure Node.js is installed (check with `node --version` in Command
   Prompt — if not installed, get it from nodejs.org, LTS version)
2. Make sure your trained models and dataset exist at `C:\AQI DATA\`:
   - `master_aqi_dataset.csv`
   - `aqi_forecast_model_24h.pkl`, `_48h.pkl`, `_72h.pkl`
   (If your paths differ, edit `DATA_FILE` / `MODEL_DIR` in
   `backend/forecast_api.py`.)
3. Install backend dependencies:
   ```
   pip install fastapi uvicorn joblib pandas xgboost shap requests
   ```
4. Install frontend dependencies (one time only):
   ```
   cd NagarAir\frontend-react
   npm install
   ```
   This downloads React, Vite, and react-leaflet — may take a minute or two.

## Running it

**Terminal 1 — backend:**
```
cd NagarAir\backend
python -m uvicorn forecast_api:app --reload --port 8000
```

**Terminal 2 — React frontend:**
```
cd NagarAir\frontend-react
npm run dev
```

Vite will print a local URL — usually **http://127.0.0.1:5500**. Open that
in your browser.

## Troubleshooting

**Sidebar shows "Cannot reach API..."**
Backend isn't running, or crashed. Check Terminal 1 for errors — most
common cause is `master_aqi_dataset.csv` or the `.pkl` files not being at
the path set in `forecast_api.py`.

**`npm install` fails or is very slow**
Check your internet connection. If it keeps failing, fall back to the
plain `frontend/` folder (see below) while you debug — it needs no npm
install at all.

**Legend or detail panel still hidden behind the map**
This was fixed in the React version via explicit z-index layering (see
`styles.css` — header/sidebar/legend/panel are all given z-index values
above Leaflet's internal panes). If you still see this in the plain
`frontend/` HTML version, switch to `frontend-react`.

**Port already in use**
Close old terminal windows from previous runs, or change the port in
`vite.config.js` (frontend) and re-check `API_BASE` in `src/api.js` if you
change the backend's port too.

---

## Fallback: plain HTML frontend (no npm needed)

If React/npm gives you trouble close to your demo, `frontend/` (plain
HTML/CSS/JS) still works as backup:

```
cd NagarAir\frontend
python -m http.server 5500
```
Then open **http://127.0.0.1:5500** (type it manually, don't click a
`[::]` link if your terminal prints one).
