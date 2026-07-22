import { useEffect, useState } from "react";
import { fetchInterventions, fetchSimulation } from "../api";
import { aqiColor, aqiLabel } from "../utils/aqi";

export default function InterventionSimulator({ station, forecast, horizon }) {
  const [available, setAvailable] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [unavailableMsg, setUnavailableMsg] = useState("");
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!station) return;
    setResult(null);
    setSelected("");
    fetchInterventions(station.city)
      .then((data) => {
        setAvailable(data.available);
        setInterventions(data.interventions || []);
        setUnavailableMsg(data.message || "");
      })
      .catch(() => {
        setAvailable(false);
        setUnavailableMsg("Could not reach simulator endpoint.");
      });
  }, [station]);

  if (!station || !forecast) return null;

  const runSimulation = () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    fetchSimulation(station.city, station.station, horizon, selected)
      .then((data) => setResult(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="sim-panel">
      <div className="advisory-header">
        <div>
          <div className="advisory-title">Intervention Simulator</div>
          <div className="advisory-sub">What-if scenario estimator</div>
        </div>
      </div>

      {available === false && (
        <div className="sim-unavailable">{unavailableMsg}</div>
      )}

      {available === true && (
        <>
          <select
            className="sim-select"
            value={selected}
            onChange={(e) => { setSelected(e.target.value); setResult(null); }}
          >
            <option value="">Choose an intervention…</option>
            {interventions.map((iv) => (
              <option key={iv.id} value={iv.id}>{iv.label}</option>
            ))}
          </select>

          <button
            className="sim-run-btn"
            disabled={!selected || loading}
            onClick={runSimulation}
          >
            {loading ? "Simulating…" : "Simulate"}
          </button>

          {error && <div className="api-status error" style={{ marginTop: 10 }}>⚠ {error}</div>}

          {result && (
            <div className="sim-result">
              <div className="sim-result-row">
                <div className="sim-result-block">
                  <div className="sim-result-label">Current Forecast</div>
                  <div className="sim-result-aqi" style={{ color: aqiColor(result.baseline_aqi) }}>
                    {Math.round(result.baseline_aqi)}
                  </div>
                  <div className="sim-result-band">{aqiLabel(result.baseline_aqi)}</div>
                </div>
                <div className="sim-arrow">→</div>
                <div className="sim-result-block">
                  <div className="sim-result-label">After Intervention</div>
                  <div className="sim-result-aqi" style={{ color: aqiColor(result.simulated_aqi) }}>
                    {Math.round(result.simulated_aqi)}
                  </div>
                  <div className="sim-result-band">{aqiLabel(result.simulated_aqi)}</div>
                </div>
              </div>
              <div className="sim-delta">
                {result.delta < 0 ? "▼" : "▲"} {Math.abs(Math.round(result.delta))} AQI estimated change
                <span className="sim-delta-pct">({Math.round(result.reduction_fraction * 100)}% source reduction modeled)</span>
              </div>
              <div className="sim-assumption">
                <b>Assumption:</b> {result.assumption}
              </div>
              <div className="sim-methodology">{result.methodology_note}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
