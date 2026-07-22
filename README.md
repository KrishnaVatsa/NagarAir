<div align="center">

# 🌍 NagarAir
### AI-Powered Urban Air Quality Intelligence Platform

### **From Air Quality Monitoring → Intelligent Urban Decision Making**

<img src="https://img.shields.io/badge/React-18-blue?logo=react"/>
<img src="https://img.shields.io/badge/FastAPI-Backend-green?logo=fastapi"/>
<img src="https://img.shields.io/badge/XGBoost-Machine%20Learning-orange"/>
<img src="https://img.shields.io/badge/SHAP-Explainable%20AI-red"/>
<img src="https://img.shields.io/badge/Open--Meteo-Live%20Weather-blue"/>
<img src="https://img.shields.io/badge/NASA-FIRMS%20Satellite-orange"/>
<img src="https://img.shields.io/badge/License-MIT-success"/>

---

## 🏆 ET AI Hackathon 2026

### Problem Statement PS5
### **AI-Powered Urban Air Quality Intelligence for Smart City Intervention**

---

### Predict • Explain • Prioritize • Simulate • Act

</div>

---

# 📖 Overview

NagarAir is an **AI-powered Urban Air Quality Intelligence Platform** designed to help city administrators and citizens understand, predict, and respond to urban air pollution through data-driven decision making.

Unlike conventional AQI dashboards that only display current pollution levels, NagarAir combines **Machine Learning, Explainable AI, Live Weather Intelligence, Geospatial Analysis, Satellite Data, and Government Air Quality Guidelines** into a single platform that supports proactive environmental management.

The platform forecasts air quality **24, 48, and 72 hours in advance**, explains every prediction using **real SHAP-based feature attribution**, estimates probable pollution sources, analyses pollution movement using live wind information, visualizes satellite-detected fire hotspots, recommends GRAP-based administrative actions, simulates the impact of pollution-control interventions, prioritizes high-risk monitoring stations, and provides health advisories for citizens.

---

# 🎯 Why NagarAir?

Most air-quality platforms answer only one question:

> **"What is the AQI right now?"**

For effective urban planning, city authorities need much more than current observations.

NagarAir is designed to answer questions such as:

- 🔮 What will AQI be over the next 24, 48 and 72 hours?
- 📈 Why is pollution expected to increase?
- 🌬️ Where is the pollution likely coming from?
- 🛰 Are nearby fire hotspots contributing to poor air quality?
- 🚨 Which monitoring stations require immediate attention?
- 🏛 Which intervention could improve tomorrow's AQI?
- 👨‍⚕️ What precautions should citizens follow?

By combining forecasting, explainability, satellite intelligence, environmental reasoning, and decision support, NagarAir transforms air-quality monitoring into actionable urban intelligence.

---

# ✨ Core Capabilities

NagarAir combines multiple AI and environmental intelligence components into a unified decision-support platform.

### 📈 AI-Based AQI Forecasting

- 24-hour AQI prediction
- 48-hour AQI prediction
- 72-hour AQI prediction
- Multi-model XGBoost forecasting pipeline

---

### 🧠 Explainable AI

Every prediction is accompanied by SHAP-based explanations showing:

- Most influential features
- Positive and negative contributors
- Feature importance ranking
- Transparent prediction reasoning

---

### 🌬️ Pollution Source Attribution

The platform combines multiple environmental signals including:

- Land-use profile
- Wind direction
- Wind speed
- Seasonal conditions
- Live NASA FIRMS satellite observations

to estimate the most probable pollution source.

---

### 🛰 Live Satellite Intelligence

NagarAir integrates **NASA FIRMS (Fire Information for Resource Management System)** to visualize active fire hotspots across North India.

Satellite observations are incorporated into the Source Attribution Agent to improve pollution-source reasoning. Whenever live satellite data is unavailable, the platform transparently falls back to a seasonal fire-risk model without interrupting system functionality.

---

### 🏛 Intervention Simulator

The Intervention Simulator enables city administrators to estimate the potential impact of different pollution-control measures before implementation.

Available intervention scenarios include:

- Construction Ban
- Truck Movement Reduction
- Odd-Even Traffic Scheme
- Diesel Generator Ban
- Stubble Burning Control

Each simulation presents:

- Current forecast
- Forecast after intervention
- Estimated AQI improvement
- Model assumptions
- Methodology disclaimer

The simulator is calibrated for **Delhi** using publicly available source-apportionment studies. For other cities, the platform explicitly indicates that sufficient calibration data is unavailable instead of generating unsupported estimates.

---

### 🔥 Priority Heat Map

The Administrator Dashboard includes a Priority Heat Map that ranks monitoring stations according to predicted pollution severity.

The visualization helps authorities:

- Identify the most critical stations
- Prioritize field response
- Allocate resources efficiently
- Focus on areas requiring immediate intervention

The heat map operates strictly at the monitoring-station level and does not infer ward-level pollution information.

---

# ✨ Key Features

## 🌍 Interactive Air Quality Dashboard

The dashboard provides a comprehensive view of urban air quality through an interactive map and AI-powered analytics.

Features include:

- Interactive monitoring station map
- Live AQI visualization
- Historical AQI trends
- Multi-horizon forecasting
- Source Attribution
- Wind Plume Tracking
- Live Satellite Fire Overlay
- GRAP Recommendations
- Citizen Health Advisory
- Administrator Dashboard
- Intervention Simulator
- Priority Heat Map

Supported Forecast Horizons:

| Horizon | Prediction |
|----------|------------|
| 24 Hours | Next-Day AQI |
| 48 Hours | Two-Day AQI |
| 72 Hours | Three-Day AQI |

---

# 📈 AI Forecasting Engine

NagarAir uses three independently trained **XGBoost Regression Models**, each optimized for a different forecasting horizon.

| Model | Purpose |
|---------|---------|
| AQI-24 | Predict AQI 24 Hours Ahead |
| AQI-48 | Predict AQI 48 Hours Ahead |
| AQI-72 | Predict AQI 72 Hours Ahead |

Each model learns from:

- Historical AQI observations
- Lag-based features
- Rolling statistical features
- Seasonal trends
- Time-based cyclical encoding

instead of relying on simple extrapolation, enabling more reliable forecasts for proactive urban planning and environmental decision making.

---
# 🏗 System Architecture

NagarAir follows a client-server architecture that combines Machine Learning, Explainable AI, Live Weather Intelligence, Satellite Data, and interactive visualization to support informed urban air-quality decision making.

```
                    User Interface (React + Vite)
                               │
                               ▼
                     FastAPI Backend Server
                               │
        ┌──────────────┬──────────────┬──────────────┐
        │              │              │              │
        ▼              ▼              ▼              ▼
 AQI Forecast     SHAP Analysis   Weather API   NASA FIRMS API
   Models          Engine            Data        Fire Hotspots
        │              │              │              │
        └──────────────┴──────────────┴──────────────┘
                               │
                               ▼
                    Interactive Decision Dashboard
```

---

# 🧠 Core AI Components

NagarAir combines several AI-powered components to transform raw environmental observations into meaningful insights for city administrators and citizens.

---

## 📈 AQI Forecasting Engine

The forecasting engine predicts future Air Quality Index values for multiple forecasting horizons using independently trained XGBoost regression models.

Supported forecast horizons include:

- 24 Hour Forecast
- 48 Hour Forecast
- 72 Hour Forecast

The models use engineered temporal features and historical AQI observations to estimate future pollution levels before they occur.

---

## 🔍 Explainable AI (SHAP)

Every forecast generated by NagarAir is accompanied by an explanation generated using SHAP (SHapley Additive Explanations).

Rather than acting as a black-box model, the system identifies the factors that influenced each prediction by displaying:

- Feature importance
- Positive contributors
- Negative contributors
- Relative impact of environmental variables

This improves transparency and allows users to better understand the reasoning behind each forecast.

---

## 🌬 Source Attribution

Understanding why pollution increases is as important as predicting it.

The Source Attribution module combines:

- Wind Direction
- Wind Speed
- Seasonal Conditions
- Land-Use Characteristics
- Live Satellite Fire Data

to estimate the most probable contributors to poor air quality.

Possible pollution sources include:

- Vehicular Emissions
- Industrial Activity
- Construction Dust
- Biomass Burning
- Agricultural Fires
- Regional Pollution Transport

---

## 🛰 Live Satellite Fire Monitoring

NagarAir integrates NASA FIRMS (Fire Information for Resource Management System) to retrieve active fire hotspots detected by satellite.

Satellite observations are used to improve pollution-source analysis by identifying nearby biomass-burning events that may influence local air quality.

Features include:

- Live fire hotspot retrieval
- Interactive hotspot visualization
- Source Attribution support
- Automatic fallback to seasonal fire-risk estimation when live data is unavailable

---

## 🌪 Wind Plume Visualization

Wind conditions significantly influence the movement of airborne pollutants.

NagarAir visualizes:

- Wind Direction
- Wind Speed
- Estimated Pollution Flow

This helps users interpret AQI forecasts and understand how pollutants may travel between regions.

---

# 🏛 Administrator Dashboard

The Administrator Dashboard is designed to assist environmental authorities with pollution monitoring, prioritization, and intervention planning.

Major capabilities include:

- Multi-horizon AQI forecasting
- Explainable AI insights
- GRAP recommendations
- Source Attribution
- Satellite fire visualization
- Priority Heat Map
- Intervention Simulator

---

## 🔥 Priority Heat Map

The Priority Heat Map ranks monitoring stations according to predicted AQI severity.

The visualization enables administrators to:

- Identify high-risk stations
- Prioritize field operations
- Allocate resources effectively
- Respond proactively to deteriorating air quality

The heat map represents monitoring stations only and does not infer pollution at the ward or neighborhood level.

---

## 🧪 Intervention Simulator

The Intervention Simulator estimates the potential impact of selected pollution-control measures before implementation.

Available intervention scenarios include:

- Construction Ban
- Truck Movement Reduction
- Odd-Even Traffic Scheme
- Diesel Generator Ban
- Stubble Burning Control

Simulation results include:

- Current AQI Forecast
- Simulated AQI
- Estimated AQI Reduction
- Model Assumptions
- Methodology Disclaimer

The simulator is currently calibrated for Delhi using publicly available source-apportionment studies. For cities without sufficient calibration data, the platform explicitly indicates that simulation results are unavailable rather than generating unsupported estimates.

---

## 📋 GRAP Recommendation System

Based on forecasted AQI values, NagarAir maps pollution severity to the corresponding stage of India's Graded Response Action Plan (GRAP).

These recommendations provide decision support for administrative planning while leaving final implementation decisions to the responsible authorities.

---

# 👨‍⚕ Citizen Dashboard

The Citizen Dashboard presents air-quality information in an intuitive and accessible format.

Users can explore:

- Current AQI
- Forecasted AQI
- AQI Trends
- Health Advisories
- Pollution Source Analysis
- Wind Information
- Satellite Fire Hotspots

The interface is designed to help citizens understand local air quality and take appropriate precautions.

---

## ❤️ Health Advisory

Based on predicted AQI levels, NagarAir provides health guidance tailored to different pollution categories.

The advisory includes:

- AQI Category
- Health Risk
- Recommended Precautions
- Outdoor Activity Guidance
- Sensitive Group Recommendations

These advisories support informed decision-making during periods of poor air quality.

---

# 🌍 Supported Cities

The current implementation supports monitoring stations across:

- Delhi
- Chandigarh
- Begusarai

The architecture is designed to support additional cities as historical monitoring data becomes available.

---

# 📂 Project Structure

```
NagarAir/
│
├── backend/
│   ├── forecast_api.py
│   └── __pycache__/
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── package-lock.json
│
├── frontend-react/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminView.jsx
│   │   │   ├── AdvisoryPanel.jsx
│   │   │   ├── AgentTrace.jsx
│   │   │   ├── DetailPanel.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── InterventionSimulator.jsx
│   │   │   ├── Legend.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── PriorityHeatMap.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StationCard.jsx
│   │   │   └── TrendChart.jsx
│   │   │
│   │   ├── utils/
│   │   │   ├── advisory.js
│   │   │   ├── aqi.js
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

---

# ⚙ Technology Stack

| Category | Technologies |
|-----------|--------------|
| Frontend | React, Vite, JavaScript, HTML5, CSS3 |
| Backend | FastAPI, Python |
| Machine Learning | XGBoost, SHAP, Scikit-learn |
| Data Processing | Pandas, NumPy |
| APIs | Open-Meteo API, NASA FIRMS API |
| Visualization | Leaflet, Chart.js |

---
# 🚀 Getting Started

Follow these steps to run NagarAir locally.

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/NagarAir.git
cd NagarAir
```

---

## 2️⃣ Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn forecast_api:app --reload
```

The backend will be available at:

```
http://127.0.0.1:8000
```

Interactive API Documentation:

```
http://127.0.0.1:8000/docs
```

---

## 3️⃣ Frontend Setup

Open a new terminal and navigate to the React frontend.

```bash
cd frontend-react
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
```

---

# 📡 API Endpoints

The FastAPI backend exposes REST APIs that power the frontend dashboard.

| Endpoint | Description |
|----------|-------------|
| `/forecast` | Predict AQI for 24, 48 or 72 hours |
| `/history` | Retrieve historical AQI data |
| `/stations` | List all supported cities and monitoring stations |
| `/agent/analyze` | Generate pollution source attribution |
| `/simulate` | Estimate the impact of pollution-control interventions |
| `/satellite/fires` | Retrieve nearby NASA FIRMS fire hotspots |

---

# 📊 Technologies Used

## Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3
- Leaflet
- Chart.js

---

## Backend

- FastAPI
- Python
- Pandas
- NumPy
- Requests
- Joblib

---

## Machine Learning

- XGBoost
- SHAP
- Scikit-learn

---

## External APIs

- Open-Meteo Weather API
- NASA FIRMS API

---
# 🌍 Supported Cities

NagarAir currently supports monitoring stations in:

- Delhi
- Chandigarh
- Begusarai

The platform is designed to support additional cities as more monitoring data becomes available.

---
# 🚀 Future Scope

Potential directions for future development include:

- Support for additional Indian cities
- Mobile application
- IoT sensor integration
- Real-time traffic data integration
- Industrial emission datasets
- Push notification alerts
- Public API for third-party developers
- Advanced GIS visualizations
- Reinforcement Learning for intervention optimization
- Multi-language support
---

# 📄 License

This project is licensed under the MIT License.

---

# 👥 Team

Developed for **ET AI Hackathon 2026**
---

# 🙏 Acknowledgements

We would like to acknowledge:

- Central Pollution Control Board (CPCB) for public AQI data.
- NASA FIRMS for satellite fire hotspot information.
- Open-Meteo for weather data services.
- The open-source community for the tools and libraries that made this project possible.

---

<div align="center">

# 🌍 NagarAir

### **Predict • Explain • Prioritize • Simulate • Act**

**Building AI-powered decision support systems for healthier and more sustainable cities.**

</div>
<div align="center"> Made with ❤️ by Team HackSmith for smarter, healthier cities. </div>
