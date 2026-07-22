import { aqiColor } from "../utils/aqi";

const MAX_AQI_SCALE = 500; // India's AQI scale max, used to size bars proportionally

export default function PriorityHeatMap({ rows }) {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="heatmap-panel">
      <div className="heatmap-title">Priority Ranking — Forecast Severity</div>
      <div className="heatmap-sub">Station-level, ranked worst to best (no ward-level data available)</div>

      <div className="heatmap-bars">
        {rows.map((r) => {
          const pct = Math.min((r.predicted_aqi / MAX_AQI_SCALE) * 100, 100);
          const color = aqiColor(r.predicted_aqi);
          return (
            <div key={`${r.city}-${r.station}`} className="heatmap-row">
              <div className="heatmap-label">
                <span className="heatmap-station">{r.station}</span>
                <span className="heatmap-city">{r.city}</span>
              </div>
              <div className="heatmap-track">
                <div
                  className="heatmap-fill"
                  style={{ width: `${pct}%`, background: color }}
                >
                  <span className="heatmap-value">{Math.round(r.predicted_aqi)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
