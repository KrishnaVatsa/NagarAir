import { useEffect, useState } from "react";
import { fetchAdminOverview, fetchPlume } from "../api";
import { aqiColor } from "../utils/aqi";
import PriorityHeatMap from "./PriorityHeatMap";

const URGENCY_ORDER = { critical: 0, elevated: 1, stable: 2, improving: 3 };

function UrgencyBadge({ urgency }) {
  const map = {
    critical: { color: "#9c1f38", label: "CRITICAL" },
    elevated: { color: "#e8432e", label: "ELEVATED" },
    stable: { color: "#e0ab13", label: "STABLE" },
    improving: { color: "#1fa85c", label: "IMPROVING" },
  };
  const cfg = map[urgency] || map.stable;
  return (
    <span className="urgency-pill" style={{ background: cfg.color }}>
      {cfg.label}
    </span>
  );
}

export default function AdminView({ horizon }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plumeAlerts, setPlumeAlerts] = useState([]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchAdminOverview(horizon)
      .then((data) => setRows(data))
      .catch(() => setError("Cannot reach API — is the backend running?"))
      .finally(() => setLoading(false));

    // fetch plume alerts for the two multi-station cities
    Promise.all([fetchPlume("Delhi"), fetchPlume("Chandigarh")])
      .then(([delhi, chandigarh]) => {
        setPlumeAlerts([...delhi.alerts, ...chandigarh.alerts]);
      })
      .catch(() => setPlumeAlerts([]));
  }, [horizon]);

  return (
    <div className="admin-view">
      <div className="admin-header">
        <div>
          <div className="admin-title">Administrator Command Center</div>
          <div className="advisory-sub">
            All stations ranked by forecast severity · +{horizon}h horizon
          </div>
        </div>
      </div>

      {error && <div className="api-status error" style={{ marginBottom: 16 }}>⚠ {error}</div>}
      {loading && <div className="placeholder">Loading city-wide overview…</div>}

      {plumeAlerts.length > 0 && (
        <div className="plume-banner">
          <div className="plume-banner-title">⚠ Wind Plume Alerts</div>
          {plumeAlerts.map((a, i) => (
            <div key={i} className="plume-alert-row">
              <span className="plume-arrow">→</span> {a.note}
              <span className="plume-meta">
                {a.distance_km}km · wind {a.wind_speed_kmh}km/h
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && rows.length > 0 && (
        <>
          <PriorityHeatMap rows={rows} />
          <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Station</th>
                <th>Current</th>
                <th>Forecast</th>
                <th>Status</th>
                <th>GRAP Stage</th>
                <th>Likely Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.city}-${r.station}`}>
                  <td>
                    <div className="admin-station-name">{r.station}</div>
                    <div className="admin-station-city">{r.city.toUpperCase()}</div>
                  </td>
                  <td>
                    <span className="aqi-pill" style={{ background: aqiColor(r.current_aqi) }}>
                      {Math.round(r.current_aqi)}
                    </span>
                  </td>
                  <td>
                    <span className="aqi-pill" style={{ background: aqiColor(r.predicted_aqi) }}>
                      {Math.round(r.predicted_aqi)}
                    </span>
                  </td>
                  <td><UrgencyBadge urgency={r.urgency} /></td>
                  <td className="admin-grap">{r.grap_stage}</td>
                  <td className="admin-source">{r.top_likely_source}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  );
}
