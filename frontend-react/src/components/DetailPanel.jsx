import { aqiColor, aqiLabel } from "../utils/aqi";

export default function DetailPanel({ station, forecast, horizon }) {
  if (!station) return null;

  const cur = forecast?.current_aqi;
  const pred = forecast?.predicted_aqi;
  const diff = cur != null && pred != null ? pred - cur : null;

  return (
    <div className="detail-panel show">
      <div className="dp-title">{station.station}</div>
      <div className="dp-sub">{station.city.toUpperCase()} · LIVE STATION</div>

      <div className="metric-row">
        <div>
          <div className="metric-label">Current AQI</div>
          <div className="metric-value" style={{ color: cur != null ? aqiColor(cur) : undefined }}>
            {cur != null ? Math.round(cur) : "···"}
          </div>
          <div className="metric-badge">{cur != null ? aqiLabel(cur) : ""}</div>
        </div>
      </div>

      <div className="metric-row">
        <div>
          <div className="metric-label">Forecast +{horizon}h</div>
          <div className="metric-value small" style={{ color: pred != null ? aqiColor(pred) : undefined }}>
            {pred != null ? Math.round(pred) : "···"}
          </div>
          {diff != null && (
            <div className={`delta ${diff >= 0 ? "up" : "down"}`}>
              {diff >= 0 ? "▲ +" : "▼ "}
              {Math.round(diff)} · {aqiLabel(pred)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
