import StationCard from "./StationCard";

export default function Sidebar({ stations, forecasts, selectedKey, onSelect, error }) {
  return (
    <div id="sidebar">
      <h2>Monitoring stations</h2>

      {error && <div className="api-status error">⚠ {error}</div>}

      {!error && stations.length === 0 && (
        <div className="placeholder">Connecting to forecast API…</div>
      )}

      {stations.map((s) => {
        const key = `${s.city}||${s.station}`;
        return (
          <StationCard
            key={key}
            station={s}
            forecast={forecasts[key]}
            selected={selectedKey === key}
            onClick={() => onSelect(s)}
          />
        );
      })}
    </div>
  );
}
