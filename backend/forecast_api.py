r"""
AQI Forecast API — with Multi-Agent Air Intelligence Orchestrator
--------------------------------------------------------------------
Serves predictions from the trained XGBoost models (24h/48h/72h),
plus a multi-agent reasoning endpoint (/agent/analyze) that chains:

  1. Forecast Agent        - runs the XGBoost model
  2. Explainability Agent  - SHAP values: which real factors drove this
                              specific prediction
  3. Risk Escalation Agent - detects severity-band crossings (e.g.
                              Poor -> Severe) between current and forecast
  4. Advisory Agent        - synthesizes a plain-language recommendation

Run from the backend/ folder:
    pip install fastapi uvicorn joblib pandas xgboost shap
    python -m uvicorn forecast_api:app --reload --port 8000

Then visit http://127.0.0.1:8000/docs to test it interactively.

IMPORTANT: update DATA_FILE and MODEL_DIR below to point at your
C:\AQI DATA folder (where master_aqi_dataset.csv and the .pkl
model files live).
"""

import joblib
import pandas as pd
import numpy as np
import shap
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

DATA_FILE = r"C:\AQI DATA\master_aqi_dataset.csv"
MODEL_DIR = r"C:\AQI DATA"

app = FastAPI(title="NagarAir Multi-Agent AQI Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading master dataset...")
df = pd.read_csv(DATA_FILE, parse_dates=["datetime"])
df = df.sort_values(["city", "station", "datetime"])

models = {}
explainers = {}
for horizon in [24, 48, 72]:
    path = Path(MODEL_DIR) / f"aqi_forecast_model_{horizon}h.pkl"
    if path.exists():
        m = joblib.load(path)
        models[horizon] = m
        # TreeExplainer is fast and exact for XGBoost models
        explainers[horizon] = shap.TreeExplainer(m)
        print(f"  Loaded model + SHAP explainer for {horizon}h horizon")
    else:
        print(f"  WARNING: model file not found: {path}")

STATION_COORDS = {
    ("Delhi", "Anand vihar"): (28.6469, 77.3152),
    ("Delhi", "Bawana"): (28.7756, 77.0521),
    ("Delhi", "Chandni Chowk"): (28.6506, 77.2303),
    ("Chandigarh", "Sector 22"): (30.7351, 76.7767),
    ("Chandigarh", "Sector 25"): (30.7046, 76.8043),
    ("Chandigarh", "Sector 53"): (30.6942, 76.7783),
    ("Begusarai", "Begusarai"): (25.4182, 86.1272),
}

STATIONS = []
for row in df[["city", "station"]].drop_duplicates().to_dict(orient="records"):
    coords = STATION_COORDS.get((row["city"], row["station"]))
    STATIONS.append({
        "city": row["city"],
        "station": row["station"],
        "lat": coords[0] if coords else None,
        "lon": coords[1] if coords else None,
    })

# Human-readable names for feature columns, used in SHAP explanations
FEATURE_LABELS = {
    "lag_1h": "AQI one hour ago",
    "lag_24h": "AQI 24 hours ago",
    "lag_168h": "AQI same time last week",
    "roll_mean_6h": "6-hour rolling average",
    "roll_mean_24h": "24-hour rolling average",
    "roll_std_24h": "24-hour volatility",
    "hour_sin": "time of day",
    "hour_cos": "time of day",
    "day_of_week": "day of week",
    "is_weekend": "weekend pattern",
    "month": "seasonal pattern",
}


def aqi_band(aqi: float) -> str:
    if aqi <= 50: return "Good"
    if aqi <= 100: return "Satisfactory"
    if aqi <= 200: return "Moderate"
    if aqi <= 300: return "Poor"
    if aqi <= 400: return "Very Poor"
    return "Severe"


BAND_ORDER = ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]

# --- GRAP: Graded Response Action Plan ---
# Real regulatory framework used by India's Commission for Air Quality
# Management (CAQM) in the Delhi-NCR region. Stages trigger by AQI
# threshold and mandate specific, legally-grounded actions. Included
# here as the source of truth for intervention recommendations instead
# of ad hoc suggestions.
GRAP_STAGES = [
    {
        "stage": 1,
        "name": "Stage I — Poor",
        "min_aqi": 201,
        "max_aqi": 300,
        "actions": [
            "Mechanized sweeping and water sprinkling on roads",
            "Strict action against open garbage burning",
            "Enforce PUC (Pollution Under Control) compliance",
            "Dust control mandatory at construction sites",
        ],
    },
    {
        "stage": 2,
        "name": "Stage II — Very Poor",
        "min_aqi": 301,
        "max_aqi": 400,
        "actions": [
            "Stop diesel generator use (except essential services)",
            "Intensify public transport frequency; increase parking fees to discourage private vehicles",
            "Stop coal/firewood use in hotels and open eateries",
        ],
    },
    {
        "stage": 3,
        "name": "Stage III — Severe",
        "min_aqi": 401,
        "max_aqi": 450,
        "actions": [
            "Ban construction & demolition activity (except essential projects)",
            "Ban BS-III petrol and BS-IV diesel light motor vehicles",
            "Ban stone crushers and mining operations",
        ],
    },
    {
        "stage": 4,
        "name": "Stage IV — Severe+",
        "min_aqi": 451,
        "max_aqi": 10_000,
        "actions": [
            "Ban truck entry (except essential commodities)",
            "Ban all construction/demolition activity",
            "Consider odd-even vehicle scheme",
            "Consider school closures / work-from-home advisory",
        ],
    },
]


def get_grap_stage(aqi: float):
    """Returns the GRAP stage triggered by a given AQI value, or None
    if AQI is below Stage I threshold (201)."""
    for stage in GRAP_STAGES:
        if stage["min_aqi"] <= aqi <= stage["max_aqi"]:
            return stage
    return None

# --- Geospatial land-use context, static per station ---
# NOTE: this is a static, real-world land-use profile (not a live
# geospatial data feed). It is disclosed as such — used to give the
# Source Attribution Agent grounded context about what is physically
# around each station, drawn from public knowledge of these locations.
STATION_PROFILE = {
    ("Delhi", "Anand vihar"): {
        "land_use": "Major transport hub — interstate bus terminal and railway station, adjacent highway interchange",
        "likely_sources": ["Heavy diesel bus/truck traffic", "Vehicular congestion at interchange"],
        "interventions": [
            "Restrict heavy diesel vehicle entry during 6-10 AM and 6-9 PM",
            "Deploy mobile anti-smog guns at the bus terminal",
            "Mandatory PUC (pollution check) enforcement at the interchange",
        ],
    },
    ("Delhi", "Bawana"): {
        "land_use": "Industrial estate — manufacturing units (DSIIDC industrial area)",
        "likely_sources": ["Industrial stack emissions", "Goods-vehicle traffic"],
        "interventions": [
            "Increase stack-emission inspection frequency for industrial units",
            "Enforce cleaner-fuel mandate for industrial boilers",
            "Restrict heavy truck movement during high-AQI hours",
        ],
    },
    ("Delhi", "Chandni Chowk"): {
        "land_use": "Dense historic market district — narrow streets, mixed commercial/residential",
        "likely_sources": ["Traffic congestion / idling vehicles", "Commercial generator use"],
        "interventions": [
            "Expand pedestrian-only zones during peak hours",
            "Restrict diesel generator use on high-AQI days",
            "Traffic decongestion measures at market entry points",
        ],
    },
    ("Chandigarh", "Sector 22"): {
        "land_use": "Planned commercial/residential sector",
        "likely_sources": ["Vehicular traffic", "Construction dust"],
        "interventions": [
            "Mandatory water sprinkling at active construction sites",
            "Traffic signal optimization to reduce vehicle idling",
        ],
    },
    ("Chandigarh", "Sector 25"): {
        "land_use": "Institutional / residential sector",
        "likely_sources": ["Vehicular traffic", "Seasonal biomass burning"],
        "interventions": [
            "Enforce open waste-burning ban",
            "Green buffer plantation along main roads",
        ],
    },
    ("Chandigarh", "Sector 53"): {
        "land_use": "Residential/institutional sector near green belt",
        "likely_sources": ["Vehicular traffic", "Regional transport pollution"],
        "interventions": [
            "Promote non-motorized transport corridors",
            "Coordinate with regional airshed (Punjab/Haryana) authorities",
        ],
    },
    ("Begusarai", "Begusarai"): {
        "land_use": "Industrial town — major oil refinery (IOCL Barauni) and thermal power plant nearby",
        "likely_sources": ["Refinery stack emissions", "Thermal power plant fly ash"],
        "interventions": [
            "Mandate continuous emission monitoring at the refinery",
            "Enforce fly-ash containment at the power plant",
            "Expand industrial buffer-zone green cover",
        ],
    },
}


def get_wind_forecast(lat: float, lon: float):
    """Live meteorological forecast (real API call, no key required)."""
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&current=wind_speed_10m,wind_direction_10m&timezone=Asia%2FKolkata"
        )
        resp = requests.get(url, timeout=4)
        resp.raise_for_status()
        current = resp.json().get("current", {})
        return {
            "wind_speed_kmh": current.get("wind_speed_10m"),
            "wind_direction_deg": current.get("wind_direction_10m"),
            "source": "Open-Meteo live forecast",
        }
    except Exception:
        return {"wind_speed_kmh": None, "wind_direction_deg": None, "source": "unavailable"}


def get_seasonal_fire_risk(month: int, city: str):
    """
    Static seasonal proxy for satellite-detected stubble-burning activity.
    Used as a FALLBACK when live FIRMS data is unavailable (no API key
    set, network issue, or rate limit). Punjab/Haryana stubble burning
    (Oct-Nov) is a well-documented, satellite-monitored seasonal
    pollution source affecting North India.
    """
    if city in ("Delhi", "Chandigarh") and month in (10, 11):
        return {
            "risk": "HIGH",
            "note": "Peak stubble-burning season in Punjab/Haryana — satellite fire-count data historically shows elevated regional smoke transport during this period.",
            "source": "seasonal proxy (live satellite data unavailable)",
        }
    if month in (10, 11):
        return {"risk": "MODERATE", "note": "Regional biomass-burning season.", "source": "seasonal proxy (live satellite data unavailable)"}
    return {"risk": "LOW", "note": "Outside peak stubble-burning season.", "source": "seasonal proxy (live satellite data unavailable)"}


# --- NASA FIRMS: real live satellite fire-hotspot detection ---
# Requires a free API key from https://firms.modaps.eosdis.nasa.gov/api/map_key/
# Paste it below. If left blank or the API call fails, the platform
# gracefully falls back to the static seasonal proxy above — the UI
# discloses which one was actually used.
FIRMS_MAP_KEY = "2d049b714f33140db7dd4abef1166fed"

# Bounding box covering North India (Punjab, Haryana, Delhi NCR, western UP)
# where stubble-burning fires most directly affect Delhi/Chandigarh AQI.
FIRMS_BBOX_NORTH_INDIA = "73,27,80,32"  # west,south,east,north

_firms_cache = {"data": None, "fetched_at": None}


def fetch_firms_hotspots(day_range: int = 2):
    """
    Fetches real active-fire detections from NASA FIRMS (VIIRS satellite,
    near-real-time) within the North India bounding box. Cached for the
    process lifetime + a short window to avoid hammering the API on
    every request. Returns None if unavailable (missing key, network
    error, rate limit) so callers can fall back gracefully.
    """
    if not FIRMS_MAP_KEY:
        return None

    now = pd.Timestamp.utcnow()
    if _firms_cache["data"] is not None and _firms_cache["fetched_at"] is not None:
        if (now - _firms_cache["fetched_at"]).total_seconds() < 1800:  # 30 min cache
            return _firms_cache["data"]

    try:
        url = (
            f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/"
            f"{FIRMS_MAP_KEY}/VIIRS_SNPP_NRT/{FIRMS_BBOX_NORTH_INDIA}/{day_range}"
        )
        resp = requests.get(url, timeout=6)
        resp.raise_for_status()
        from io import StringIO
        fire_df = pd.read_csv(StringIO(resp.text))
        if fire_df.empty or "latitude" not in fire_df.columns:
            hotspots = []
        else:
            hotspots = fire_df[["latitude", "longitude", "confidence", "acq_date"]].to_dict(orient="records")
        _firms_cache["data"] = hotspots
        _firms_cache["fetched_at"] = now
        return hotspots
    except Exception:
        return None


def get_fire_risk(lat: float, lon: float, month: int, city: str, radius_km: float = 100):
    """
    Real satellite fire-risk assessment: counts live FIRMS hotspots
    within radius_km of a station. Falls back to the static seasonal
    proxy if live data is unavailable.
    """
    hotspots = fetch_firms_hotspots()
    if hotspots is None:
        return get_seasonal_fire_risk(month, city)

    nearby = [
        h for h in hotspots
        if haversine_km(lat, lon, h["latitude"], h["longitude"]) <= radius_km
    ]
    count = len(nearby)

    if count == 0:
        risk = "LOW"
    elif count < 10:
        risk = "MODERATE"
    else:
        risk = "HIGH"

    return {
        "risk": risk,
        "note": f"{count} active fire hotspot(s) detected within {radius_km}km (NASA FIRMS, VIIRS satellite, last 48h).",
        "source": "NASA FIRMS live satellite data",
        "hotspot_count": count,
    }


# --- Intervention Simulator ---
# IMPORTANT — methodology disclosure:
# Source shares below are approximate figures drawn from published Delhi
# PM2.5 source-apportionment studies (TERI-ARAI 2018; SAFAR-IITM). They
# are NOT measured for this project — they are literature values used to
# build a disclosed, simplified scenario estimator. The simulator applies
# a linear proportional reduction to the AQI based on the targeted
# source share(s) — this is NOT an atmospheric dispersion model or a
# validated causal estimate. It is only calibrated for Delhi, where a
# public source-apportionment breakdown exists; it is intentionally not
# offered for Chandigarh or Begusarai, where no such published study was
# available to ground it.
SOURCE_SHARES = {
    "Delhi": {
        "vehicular": 0.23,
        "industrial": 0.18,
        "construction_dust": 0.17,
        "biomass_seasonal": 0.15,
        "domestic": 0.10,
        "waste_burning": 0.04,
        "other_background": 0.13,
    }
}

INTERVENTIONS = {
    "Delhi": [
        {
            "id": "construction_ban",
            "label": "Ban construction & demolition activity (48h)",
            "targets": {"construction_dust": 0.9},
            "assumption": "Assumes a 48h ban eliminates ~90% of active construction-dust emissions (residual from material already disturbed/stored on site).",
        },
        {
            "id": "truck_reduction_25",
            "label": "Reduce truck/freight traffic by 25%",
            "targets": {"vehicular": 0.10},
            "assumption": "Assumes heavy vehicles (trucks/buses) account for ~40% of the vehicular source share; a 25% cut in truck traffic reduces total vehicular contribution by ~10%.",
        },
        {
            "id": "odd_even",
            "label": "Odd-even private vehicle scheme",
            "targets": {"vehicular": 0.13},
            "assumption": "Based on ~10-15% vehicular emission reduction observed in past Delhi odd-even trials (CSE / IIT Kanpur studies); midpoint of 13% used.",
        },
        {
            "id": "diesel_genset_ban",
            "label": "Ban diesel generator sets",
            "targets": {"domestic": 0.5, "industrial": 0.05},
            "assumption": "Gensets assumed to be a subset of domestic/small-commercial backup power (~50% of that share) plus a minor share of industrial backup power (~5%).",
        },
        {
            "id": "stubble_control",
            "label": "Regional stubble-burning control",
            "targets": {"biomass_seasonal": 0.6},
            "assumption": "Assumes coordinated regional action reduces seasonal biomass-burning contribution by ~60%; only meaningful during Oct-Nov season.",
        },
    ]
}


def simulate_intervention(city: str, predicted_aqi: float, intervention_id: str):
    if city not in SOURCE_SHARES:
        return None, "No published source-apportionment data available for this city — simulator is calibrated for Delhi only."

    interventions = INTERVENTIONS.get(city, [])
    intervention = next((iv for iv in interventions if iv["id"] == intervention_id), None)
    if intervention is None:
        return None, f"Unknown intervention id: {intervention_id}"

    shares = SOURCE_SHARES[city]
    reduction_fraction = 0.0
    for source, cut in intervention["targets"].items():
        reduction_fraction += shares.get(source, 0.0) * cut

    # floor: don't simulate below the 'Good' band lower edge as a sanity bound
    new_aqi = max(predicted_aqi * (1 - reduction_fraction), 15.0)

    return {
        "intervention": intervention["label"],
        "assumption": intervention["assumption"],
        "baseline_aqi": round(predicted_aqi, 1),
        "simulated_aqi": round(new_aqi, 1),
        "delta": round(new_aqi - predicted_aqi, 1),
        "reduction_fraction": round(reduction_fraction, 3),
        "methodology_note": (
            "Simplified proportional estimate based on published Delhi PM2.5 "
            "source-apportionment shares (TERI-ARAI 2018; SAFAR-IITM). This is "
            "NOT an atmospheric dispersion simulation or a validated causal model."
        ),
    }, None


# --- Wind plume tracking: is one station's pollution likely to drift
# toward another station, based on real wind direction/speed? ---

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    p1, p2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)
    a = np.sin(dphi / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dlambda / 2) ** 2
    return 2 * R * np.arcsin(np.sqrt(a))


def bearing_deg(lat1, lon1, lat2, lon2):
    """Compass bearing (0-360, 0=North) from point 1 to point 2."""
    p1, p2 = np.radians(lat1), np.radians(lat2)
    dlambda = np.radians(lon2 - lon1)
    x = np.sin(dlambda) * np.cos(p2)
    y = np.cos(p1) * np.sin(p2) - np.sin(p1) * np.cos(p2) * np.cos(dlambda)
    return (np.degrees(np.arctan2(x, y)) + 360) % 360


def angular_diff(a, b):
    d = abs(a - b) % 360
    return min(d, 360 - d)


def check_plume_risk(from_station, to_station, from_aqi, from_band_idx, wind):
    """
    Given a 'from' station's current wind reading, check whether wind is
    plausibly carrying its air toward the 'to' station soon.
    Only flags a risk if:
      - the two stations are close enough for hourly-scale transport (<40km)
      - wind direction aligns with the bearing between them (within 40 degrees)
      - the source station's AQI band is Poor or worse (band_idx >= 3)
    """
    if wind["wind_speed_kmh"] is None or wind["wind_speed_kmh"] < 2:
        return None  # calm wind, no meaningful transport direction

    distance = haversine_km(
        from_station["lat"], from_station["lon"], to_station["lat"], to_station["lon"]
    )
    if distance > 40 or distance < 0.5:
        return None

    bearing_to_target = bearing_deg(
        from_station["lat"], from_station["lon"], to_station["lat"], to_station["lon"]
    )
    # wind_direction_10m is where the wind blows FROM; transport direction is opposite
    transport_dir = (wind["wind_direction_deg"] + 180) % 360

    diff = angular_diff(transport_dir, bearing_to_target)
    if diff > 40:
        return None

    if from_band_idx < 3:  # below "Poor" - not worth flagging
        return None

    eta_hours = round(distance / max(wind["wind_speed_kmh"], 1), 1)

    return {
        "from": f"{from_station['city']} / {from_station['station']}",
        "to": f"{to_station['city']} / {to_station['station']}",
        "distance_km": round(distance, 1),
        "wind_speed_kmh": wind["wind_speed_kmh"],
        "alignment_deg": round(diff, 1),
        "eta_hours": eta_hours,
        "note": f"Wind carrying air from {from_station['station']} toward {to_station['station']}, ~{eta_hours}h away",
    }


def build_features_for_station(city: str, station: str):
    g = df[(df["city"] == city) & (df["station"] == station)].copy()
    g = g.set_index("datetime").sort_index()

    if len(g) < 168:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough history for {city}/{station} to build features"
        )

    latest_time = g.index.max()

    hour = latest_time.hour
    hour_sin = np.sin(2 * np.pi * hour / 24)
    hour_cos = np.cos(2 * np.pi * hour / 24)
    day_of_week = latest_time.dayofweek
    is_weekend = int(day_of_week >= 5)
    month = latest_time.month

    lag_1h = g["aqi"].iloc[-1]
    lag_24h = g["aqi"].iloc[-24] if len(g) >= 24 else np.nan
    lag_168h = g["aqi"].iloc[-168] if len(g) >= 168 else np.nan
    roll_mean_6h = g["aqi"].iloc[-6:].mean()
    roll_mean_24h = g["aqi"].iloc[-24:].mean()
    roll_std_24h = g["aqi"].iloc[-24:].std()

    row = {
        "hour_sin": hour_sin,
        "hour_cos": hour_cos,
        "day_of_week": day_of_week,
        "is_weekend": is_weekend,
        "month": month,
        "lag_1h": lag_1h,
        "lag_24h": lag_24h,
        "lag_168h": lag_168h,
        "roll_mean_6h": roll_mean_6h,
        "roll_mean_24h": roll_mean_24h,
        "roll_std_24h": roll_std_24h,
    }
    return row, latest_time, lag_1h


def build_input_df(city, station, horizon):
    """Shared logic: build the model-ready one-row DataFrame for a
    given city/station/horizon. Used by both /forecast and /agent/analyze."""
    if horizon not in models:
        raise HTTPException(status_code=400, detail=f"No model available for horizon={horizon}")

    match = df[(df["city"] == city) & (df["station"] == station)]
    if match.empty:
        raise HTTPException(status_code=404, detail=f"No data for {city}/{station}")

    row, latest_time, current_aqi = build_features_for_station(city, station)
    model = models[horizon]

    input_df = pd.DataFrame([row])

    for col in model.get_booster().feature_names:
        if col.startswith("city_") or col.startswith("station_"):
            input_df[col] = 0
    city_col = f"city_{city}"
    station_col = f"station_{station}"
    if city_col in input_df.columns:
        input_df[city_col] = 1
    if station_col in input_df.columns:
        input_df[station_col] = 1

    input_df = input_df.reindex(columns=model.get_booster().feature_names, fill_value=0)
    return input_df, latest_time, current_aqi, model


@app.get("/")
def root():
    return {"status": "ok", "message": "NagarAir Multi-Agent AQI Intelligence API running"}


@app.get("/debug")
def debug():
    return {"loaded_horizons": list(models.keys())}


@app.get("/stations")
def get_stations():
    return STATIONS


@app.get("/forecast")
def forecast(city: str, station: str, horizon: int = 24):
    input_df, latest_time, current_aqi, model = build_input_df(city, station, horizon)
    prediction = float(model.predict(input_df)[0])

    return {
        "city": city,
        "station": station,
        "horizon_hours": horizon,
        "current_aqi": float(current_aqi),
        "as_of": str(latest_time),
        "predicted_aqi": round(prediction, 1),
    }


@app.get("/history")
def history(city: str, station: str, hours: int = 168):
    """Returns the last N hours of actual AQI readings for a station,
    used to draw the trend chart alongside the forecast."""
    match = df[(df["city"] == city) & (df["station"] == station)].copy()
    if match.empty:
        raise HTTPException(status_code=404, detail=f"No data for {city}/{station}")

    match = match.sort_values("datetime").tail(hours)
    return [
        {"datetime": str(row["datetime"]), "aqi": float(row["aqi"])}
        for _, row in match.iterrows()
    ]


@app.get("/agent/analyze")
def agent_analyze(city: str, station: str, horizon: int = 24):
    """
    Multi-agent reasoning pipeline. Chains four agents and returns
    each agent's output plus a combined reasoning trace, so the
    frontend can visualize the pipeline step by step.
    """
    input_df, latest_time, current_aqi, model = build_input_df(city, station, horizon)

    # --- Agent 1: Forecast Agent ---
    prediction = float(model.predict(input_df)[0])
    current_band = aqi_band(current_aqi)
    predicted_band = aqi_band(prediction)

    forecast_agent = {
        "agent": "Forecast Agent",
        "action": f"Ran {horizon}h XGBoost model for {station}, {city}",
        "output": {
            "current_aqi": round(float(current_aqi), 1),
            "current_band": current_band,
            "predicted_aqi": round(prediction, 1),
            "predicted_band": predicted_band,
        },
    }

    # --- Agent 2: Explainability Agent (real SHAP values) ---
    explainer = explainers[horizon]
    shap_values = explainer(input_df)
    contributions = list(zip(input_df.columns, shap_values.values[0]))
    # keep only meaningful, human-labeled features; sort by absolute impact
    contributions = [
        (FEATURE_LABELS.get(name, name), float(val))
        for name, val in contributions
        if name in FEATURE_LABELS
    ]
    contributions.sort(key=lambda x: abs(x[1]), reverse=True)
    top_factors = contributions[:4]

    explainability_agent = {
        "agent": "Explainability Agent",
        "action": "Computed SHAP feature attributions for this specific prediction",
        "output": {
            "top_factors": [
                {
                    "factor": name,
                    "impact": round(val, 1),
                    "direction": "increases" if val > 0 else "decreases",
                }
                for name, val in top_factors
            ]
        },
    }

    # --- Agent 3: Risk Escalation Agent ---
    cur_idx = BAND_ORDER.index(current_band)
    pred_idx = BAND_ORDER.index(predicted_band)
    escalation = pred_idx - cur_idx

    if escalation >= 2:
        urgency = "critical"
        escalation_msg = f"Severity projected to jump {escalation} bands ({current_band} → {predicted_band}) within {horizon}h — rapid deterioration."
    elif escalation == 1:
        urgency = "elevated"
        escalation_msg = f"Severity projected to worsen from {current_band} to {predicted_band} within {horizon}h."
    elif escalation <= -1:
        urgency = "improving"
        escalation_msg = f"Conditions projected to improve from {current_band} to {predicted_band} within {horizon}h."
    else:
        urgency = "stable"
        escalation_msg = f"Severity projected to remain in the {predicted_band} band."

    risk_agent = {
        "agent": "Risk Escalation Agent",
        "action": "Compared current vs forecast severity bands",
        "output": {
            "urgency": urgency,
            "message": escalation_msg,
            "band_shift": escalation,
        },
    }

    # --- Agent 4: Source Attribution Agent ---
    profile = STATION_PROFILE.get((city, station))
    station_lat, station_lon = None, None
    coords = STATION_COORDS.get((city, station))
    if coords:
        station_lat, station_lon = coords

    wind = get_wind_forecast(station_lat, station_lon) if station_lat else {
        "wind_speed_kmh": None, "wind_direction_deg": None, "source": "unavailable"
    }
    fire_risk = get_fire_risk(station_lat, station_lon, latest_time.month, city) if station_lat else get_seasonal_fire_risk(latest_time.month, city)

    dispersion_note = "unknown"
    if wind["wind_speed_kmh"] is not None:
        if wind["wind_speed_kmh"] < 6:
            dispersion_note = "Low wind speed — pollutant accumulation likely, weak dispersion"
        elif wind["wind_speed_kmh"] < 15:
            dispersion_note = "Moderate wind speed — some dispersion expected"
        else:
            dispersion_note = "High wind speed — strong dispersion expected"

    source_attribution_agent = {
        "agent": "Source Attribution Agent",
        "action": "Fused land-use profile, live meteorological data, and seasonal fire-risk signal",
        "output": {
            "land_use": profile["land_use"] if profile else "No profile available",
            "likely_sources": profile["likely_sources"] if profile else [],
            "wind": wind,
            "dispersion_note": dispersion_note,
            "seasonal_fire_risk": fire_risk,
        },
    }

    # --- Agent 5: Advisory & Intervention Agent (GRAP-based) ---
    grap_stage = get_grap_stage(prediction)

    if urgency == "critical":
        advisory_msg = f"GRAP {grap_stage['name'] if grap_stage else 'threshold'} triggered — immediate action required."
    elif urgency == "elevated":
        advisory_msg = f"Approaching {grap_stage['name'] if grap_stage else 'next GRAP threshold'} — prepare enforcement ahead of the forecast window."
    elif urgency == "improving":
        advisory_msg = "Conditions improving; step down GRAP actions if currently active."
    else:
        advisory_msg = f"Maintain {grap_stage['name'] if grap_stage else 'current'} actions."

    grap_actions = grap_stage["actions"] if grap_stage else []
    local_interventions = profile["interventions"] if profile and urgency in ("elevated", "critical") else []

    advisory_agent = {
        "agent": "Advisory & Intervention Agent",
        "action": "Matched forecast AQI against GRAP (Graded Response Action Plan) thresholds",
        "output": {
            "recommendation": advisory_msg,
            "grap_stage": grap_stage["name"] if grap_stage else "Below Stage I",
            "grap_actions": grap_actions,
            "source_interventions": local_interventions,
        },
    }

    return {
        "city": city,
        "station": station,
        "horizon_hours": horizon,
        "as_of": str(latest_time),
        "pipeline": [forecast_agent, explainability_agent, risk_agent, source_attribution_agent, advisory_agent],
    }


@app.get("/plume")
def plume_analysis(city: str):
    """
    Checks all station pairs within a city: is wind currently likely to
    carry pollution from a high-AQI station toward another station nearby?
    Uses each 'from' station's own live wind reading. Requires at least
    2 stations in the city (single-station cities return an empty list).
    """
    city_stations = [s for s in STATIONS if s["city"] == city and s["lat"] is not None]
    if len(city_stations) < 2:
        return {"city": city, "alerts": []}

    alerts = []
    for from_s in city_stations:
        try:
            row, latest_time, current_aqi = build_features_for_station(city, from_s["station"])
        except HTTPException:
            continue

        band_idx = BAND_ORDER.index(aqi_band(current_aqi))
        wind = get_wind_forecast(from_s["lat"], from_s["lon"])

        for to_s in city_stations:
            if to_s["station"] == from_s["station"]:
                continue
            alert = check_plume_risk(from_s, to_s, current_aqi, band_idx, wind)
            if alert:
                alerts.append(alert)

    return {"city": city, "alerts": alerts}


@app.get("/admin/overview")
def admin_overview(horizon: int = 24):
    """
    Lightweight multi-station summary for the Administrator Command
    Center: current + forecast AQI, GRAP stage, and top likely source
    per station, ranked by forecast severity. Skips SHAP (per-station
    /agent/analyze already provides that) to stay fast across all
    stations in one call.
    """
    rows = []
    for s in STATIONS:
        if s["lat"] is None:
            continue
        try:
            input_df, latest_time, current_aqi, model = build_input_df(
                s["city"], s["station"], horizon
            )
        except HTTPException:
            continue

        prediction = float(model.predict(input_df)[0])
        current_band = aqi_band(current_aqi)
        predicted_band = aqi_band(prediction)
        grap_stage = get_grap_stage(prediction)
        profile = STATION_PROFILE.get((s["city"], s["station"]))

        cur_idx = BAND_ORDER.index(current_band)
        pred_idx = BAND_ORDER.index(predicted_band)
        escalation = pred_idx - cur_idx
        if escalation >= 2:
            urgency = "critical"
        elif escalation == 1:
            urgency = "elevated"
        elif escalation <= -1:
            urgency = "improving"
        else:
            urgency = "stable"

        rows.append({
            "city": s["city"],
            "station": s["station"],
            "current_aqi": round(float(current_aqi), 1),
            "current_band": current_band,
            "predicted_aqi": round(prediction, 1),
            "predicted_band": predicted_band,
            "urgency": urgency,
            "grap_stage": grap_stage["name"] if grap_stage else "Below Stage I",
            "top_likely_source": profile["likely_sources"][0] if profile and profile["likely_sources"] else "Unknown",
        })

    rows.sort(key=lambda r: r["predicted_aqi"], reverse=True)
    return rows


@app.get("/interventions")
def list_interventions(city: str):
    """Lists available intervention scenarios for a city. Returns an
    empty list (with an explanatory message) for cities without a
    published source-apportionment study to ground the simulator."""
    if city not in SOURCE_SHARES:
        return {
            "city": city,
            "available": False,
            "message": "Intervention Simulator is currently calibrated for Delhi only — no published source-apportionment data was available for this city.",
            "interventions": [],
        }
    return {
        "city": city,
        "available": True,
        "source_shares": SOURCE_SHARES[city],
        "interventions": [
            {"id": iv["id"], "label": iv["label"]} for iv in INTERVENTIONS[city]
        ],
    }


@app.get("/simulate")
def simulate(city: str, station: str, horizon: int, intervention_id: str):
    input_df, latest_time, current_aqi, model = build_input_df(city, station, horizon)
    predicted_aqi = float(model.predict(input_df)[0])

    result, error = simulate_intervention(city, predicted_aqi, intervention_id)
    if error:
        raise HTTPException(status_code=400, detail=error)

    return result


@app.get("/satellite/fires")
def satellite_fires():
    """
    Real NASA FIRMS active-fire hotspots (VIIRS satellite, near-real-time)
    for the North India region, used to plot fire markers on the map.
    Returns an empty list with an 'available: false' flag if no API key
    is configured or the live call fails — the frontend shows this
    honestly rather than pretending data exists.
    """
    hotspots = fetch_firms_hotspots()
    if hotspots is None:
        return {
            "available": False,
            "message": "Live NASA FIRMS data unavailable (no API key configured, or request failed). Seasonal fire-risk proxy is used elsewhere as a fallback.",
            "hotspots": [],
        }
    return {"available": True, "hotspots": hotspots}
