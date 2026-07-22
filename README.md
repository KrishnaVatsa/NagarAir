<div align="center">

# 🌍 NagarAir
### AI-Powered Urban Air Quality Intelligence Platform

**From Air Quality Monitoring → Intelligent Urban Decision Making**

<img src="https://img.shields.io/badge/React-18-blue?logo=react"/>
<img src="https://img.shields.io/badge/FastAPI-Backend-green?logo=fastapi"/>
<img src="https://img.shields.io/badge/XGBoost-ML-orange"/>
<img src="https://img.shields.io/badge/SHAP-Explainable%20AI-red"/>
<img src="https://img.shields.io/badge/Open--Meteo-Live%20Weather-blue"/>
<img src="https://img.shields.io/badge/License-MIT-success"/>

---

### 🏆 ET AI Hackathon 2026
**Problem Statement PS5 — AI-Powered Urban Air Quality Intelligence for Smart City Intervention**

</div>

---

# 📖 Overview

NagarAir is an **AI-powered Urban Air Quality Intelligence Platform** designed to help city administrators predict air pollution before it becomes dangerous.

Unlike traditional AQI dashboards that simply display sensor readings, NagarAir transforms raw environmental data into **actionable intelligence** using Machine Learning, Explainable AI, geospatial reasoning, live weather forecasting, and regulatory recommendations.

The platform predicts air quality **24, 48, and 72 hours in advance**, explains every prediction using **real SHAP values**, identifies probable pollution sources, detects pollution movement using wind analysis, and recommends interventions based on India's **Graded Response Action Plan (GRAP).**

---

# 🚀 Why NagarAir?

Most air quality platforms answer only one question:

> **"What is the AQI right now?"**

NagarAir answers much more:

- 🔮 What will AQI be tomorrow?
- 📈 Why will AQI increase?
- 🌬️ Where is pollution coming from?
- 🚨 Which areas require immediate intervention?
- 🏛️ What actions should city authorities take?
- 👨‍⚕️ What health advisory should citizens follow?

---

# ✨ Key Features

## 🌎 Live Interactive AQI Dashboard

- Interactive city map
- Color-coded monitoring stations
- Official AQI categories
- Station-wise details
- Historical AQI trends
- Forecast horizon selector

Supported Forecasts

- 24 Hours
- 48 Hours
- 72 Hours

---

## 📈 AI Forecasting Engine

NagarAir predicts future AQI using three independently trained **XGBoost regression models.**

Each model is optimized for a different prediction horizon:

| Model | Prediction |
|---------|------------|
| 24h | Next Day AQI |
| 48h | Two-Day Forecast |
| 72h | Three-Day Forecast |

Models use:

- Lag Features
- Rolling Statistics
- Cyclical Time Encoding
- Historical AQI Patterns

---

# 🧠 Multi-Agent Air Intelligence Orchestrator

Instead of showing a single prediction, NagarAir runs every forecast through a **five-agent reasoning pipeline** that exposes the decision-making process to users. This architecture is described in the project documentation and is fully visible in the UI. :contentReference[oaicite:1]{index=1}

---

## 1️⃣ Forecast Agent

Responsible for:

- Selecting correct forecasting model
- Predicting AQI
- Identifying AQI category
- Returning confidence information

Output:

```
Current AQI
Predicted AQI
AQI Band
Forecast Horizon
```

---

## 2️⃣ Explainability Agent

Uses **SHAP (SHapley Additive Explanations)** to explain:

- Why prediction changed
- Most influential features
- Positive & negative contributors
- Feature importance ranking

Unlike static explanations, these are computed **live** for each prediction.

Example:

```
Top Contributors

✓ AQI 1 Hour Ago
✓ 24-Hour Rolling Mean
✓ Month
✓ AQI Last Week
✓ City Indicator
```

---

## 3️⃣ Risk Escalation Agent

Determines whether pollution is:

- Stable
- Improving
- Elevated
- Critical

Detects severity jumps such as:

```
Moderate → Poor
Poor → Very Poor
Very Poor → Severe
```

---

## 4️⃣ Source Attribution Agent

Combines multiple information sources:

- Land-use profile
- Live wind direction
- Live wind speed
- Seasonal fire-risk indicator

Predicts likely pollution source:

- Vehicular Emissions
- Industrial Activity
- Construction Dust
- Agricultural Burning
- Mixed Sources

---

## 5️⃣ Advisory & Intervention Agent

Matches predicted AQI against **India's official GRAP framework** to generate legally grounded recommendations for administrators and station-specific interventions. :contentReference[oaicite:2]{index=2}

Examples:

- Construction Restrictions
- Traffic Control
- Public Transport Intensification
- Generator Restrictions
- School Advisory
- Dust Control Measures

---

# 🌬️ Wind Plume Tracking

A unique feature that analyses pollution movement between stations.

Checks:

- Wind direction
- Wind speed
- Station distance
- AQI severity

If pollution is expected to move:

```
Station A
      ↓
Wind Direction
      ↓
Station B

⚠ Pollution likely to reach Station B
```

This provides administrators with lead time to act before downwind stations are affected. :contentReference[oaicite:3]{index=3}

---

# 🏛️ Administrator Command Center

Designed specifically for urban administrators.

Provides:

- City-wide AQI ranking
- Highest-risk stations
- GRAP Stage
- Source Attribution
- Forecast AQI
- Active Plume Alerts
- Intervention Priority

Rather than exploring stations one by one, administrators can immediately identify the most urgent locations and required actions. :contentReference[oaicite:4]{index=4}

---

# 👨‍⚕️ Citizen Health Advisory

Citizen-friendly dashboard including:

- AQI health category
- Bilingual support
- Risk explanation
- Recommended precautions

Languages:

- 🇬🇧 English
- 🇮🇳 Hindi

---

# 🗂 Project Structure

```
NagarAir/

│
├── backend/
│   └── forecast_api.py
│
├── frontend/
│
├── frontend-react/
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── start.bat
└── README.md
```

---

# 🛠 Technology Stack

## Frontend

- React 18
- Vite
- React Leaflet
- Recharts
- CSS3

## Backend

- FastAPI
- Uvicorn
- Python

## Machine Learning

- XGBoost
- SHAP
- Scikit-learn

## Data Processing

- Pandas
- NumPy
- OpenPyXL

## Live APIs

- Open-Meteo Weather API

---

# 📊 Dataset

Primary Dataset:

**Central Pollution Control Board (CPCB)**

Includes:

- Hourly AQI
- Multiple Cities
- Multiple Stations
- Historical Records

Dataset Size

```
54,193+
Hourly Records
```

The accompanying technical document states the implementation uses one year of CPCB hourly AQI data across multiple stations and cities, along with live weather and static geospatial context. :contentReference[oaicite:5]{index=5}

---

# 📈 Model Performance

| Horizon | Baseline RMSE | Model RMSE | Improvement |
|----------|--------------:|-----------:|------------:|
| 24 Hours | 50.77 | 44.31 | **12.7%** |
| 48 Hours | 63.40 | 49.64 | **21.7%** |
| 72 Hours | 73.62 | 52.19 | **29.1%** |

These results were evaluated using a chronological hold-out test set against a naive persistence baseline, as documented in the project report. :contentReference[oaicite:6]{index=6}

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/NagarAir.git

cd NagarAir
```

---

## Backend

```bash
cd backend

pip install fastapi uvicorn joblib pandas xgboost shap requests

python -m uvicorn forecast_api:app --reload --port 8000
```

---

## Frontend

```bash
cd frontend-react

npm install

npm run dev
```

Open

```
http://127.0.0.1:5500
```

---

# 📁 Required Files

```
C:\AQI DATA\

master_aqi_dataset.csv

aqi_forecast_model_24h.pkl

aqi_forecast_model_48h.pkl

aqi_forecast_model_72h.pkl
```

If your dataset path changes, update:

```
forecast_api.py

DATA_FILE

MODEL_DIR
```

---

# 🖥️ Screenshots

```
📍 Dashboard

📍 Interactive Map

📍 Trend Chart

📍 Administrator Command Center

📍 Air Intelligence Agents

📍 Wind Plume Tracking

📍 Citizen Health Advisory
```

(Add screenshots here before publishing.)

---

# 🎯 Future Improvements

- NASA FIRMS satellite integration
- Live traffic APIs
- Real GIS land-use layers
- Support for 900+ monitoring stations
- Regulatory audit trail
- Mobile application
- Notification & alert system
- Public REST API

These future enhancements align with the limitations and roadmap documented for the current implementation. :contentReference[oaicite:7]{index=7}

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

# 📜 License

This project is released under the MIT License.

---

# 👨‍💻 Authors

**Krishna Kumar**

AI • Machine Learning 

---

**Yashi Piparsaniya**

AI • Data Science • Full Stack Development

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a star!

Made with ❤️ for smarter, healthier cities.

</div>
