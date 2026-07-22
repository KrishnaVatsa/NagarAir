export default function Header({ horizon, setHorizon, apiOnline, view, setView }) {
  return (
    <header>
      <div className="brand">
        <div className="brand-mark">N</div>
        <div className="brand-text">
          <h1>NagarAir</h1>
          <div className="tag">
            <span className={`pulse ${apiOnline ? "" : "offline"}`}></span>
            URBAN AIR QUALITY INTELLIGENCE
          </div>
        </div>
      </div>

      <div className="header-controls">
        <div className="horizon-toggle">
          {[24, 48, 72].map((h) => (
            <button
              key={h}
              className={horizon === h ? "active" : ""}
              onClick={() => setHorizon(h)}
            >
              +{h}H
            </button>
          ))}
        </div>
        <div className="view-toggle">
          <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}>
            Citizen View
          </button>
          <button className={view === "admin" ? "active" : ""} onClick={() => setView("admin")}>
            Admin View
          </button>
        </div>
      </div>
    </header>
  );
}
