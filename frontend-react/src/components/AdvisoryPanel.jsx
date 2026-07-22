import { useState } from "react";
import { aqiColor, aqiLabel } from "../utils/aqi";
import { getAdvisory } from "../utils/advisory";

export default function AdvisoryPanel({ station, forecast }) {
  const [lang, setLang] = useState("en");

  if (!station || !forecast) return null;

  const aqi = forecast.predicted_aqi ?? forecast.current_aqi;
  const label = aqiLabel(aqi);
  const advisory = getAdvisory(label, lang);
  if (!advisory) return null;

  const color = aqiColor(aqi);

  return (
    <div className="advisory-panel show">
      <div className="advisory-header">
        <div>
          <div className="advisory-title">Health Advisory</div>
          <div className="advisory-sub">{station.station} · {station.city.toUpperCase()}</div>
        </div>
        <div className="lang-toggle">
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "hi" ? "active" : ""} onClick={() => setLang("hi")}>हिं</button>
        </div>
      </div>

      <div className="advisory-risk" style={{ borderColor: color }}>
        <span className="risk-dot" style={{ background: color }}></span>
        <span className="risk-text" style={{ color }}>{advisory.risk}</span>
      </div>

      <p className="advisory-message">{advisory.message}</p>

      {advisory.precautions.length > 0 && (
        <ul className="advisory-precautions">
          {advisory.precautions.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
