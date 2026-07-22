import { aqiColor } from "../utils/aqi";

export default function StationCard({ station, forecast, selected, onClick }) {
  const aqi = forecast?.current_aqi;
  const color = aqi != null ? aqiColor(aqi) : "#c7cfd8";

  return (
    <div
      className={`station-card ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div className="row1">
        <div>
          <div className="name">{station.station}</div>
          <div className="city">{station.city.toUpperCase()}</div>
        </div>
        <div className="aqi-pill" style={{ background: color }}>
          {aqi != null ? Math.round(aqi) : "···"}
        </div>
      </div>
    </div>
  );
}
