import { AQI_SCALE } from "../utils/aqi";

export default function Legend() {
  return (
    <div className="legend">
      {AQI_SCALE.map((item) => (
        <span key={item.label}>
          <span className="sw" style={{ background: item.color }}></span>
          {item.label}
        </span>
      ))}
    </div>
  );
}
