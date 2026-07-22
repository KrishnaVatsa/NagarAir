import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import DetailPanel from "./components/DetailPanel";
import TrendChart from "./components/TrendChart";
import AgentTrace from "./components/AgentTrace";
import AdvisoryPanel from "./components/AdvisoryPanel";
import InterventionSimulator from "./components/InterventionSimulator";
import Legend from "./components/Legend";
import AdminView from "./components/AdminView";
import { fetchStations, fetchForecast } from "./api";

export default function App() {
  const [horizon, setHorizon] = useState(24);
  const [view, setView] = useState("map"); // "map" | "admin"
  const [stations, setStations] = useState([]);
  const [forecasts, setForecasts] = useState({}); // key -> forecast data
  const [selectedStation, setSelectedStation] = useState(null);
  const [error, setError] = useState(null);
  const [apiOnline, setApiOnline] = useState(true);

  // load station list once on mount
  useEffect(() => {
    fetchStations()
      .then((data) => {
        setStations(data);
        setApiOnline(true);
        setError(null);
      })
      .catch(() => {
        setApiOnline(false);
        setError(
          "Cannot reach API at http://127.0.0.1:8000 — is the backend running?"
        );
      });
  }, []);

  // whenever stations or horizon changes, refresh every station's forecast
  useEffect(() => {
    if (stations.length === 0) return;

    let cancelled = false;

    stations.forEach((s) => {
      const key = `${s.city}||${s.station}`;
      fetchForecast(s.city, s.station, horizon)
        .then((data) => {
          if (!cancelled) {
            setForecasts((prev) => ({ ...prev, [key]: data }));
          }
        })
        .catch(() => {
          /* leave this station's badge as loading if it fails */
        });
    });

    return () => {
      cancelled = true;
    };
  }, [stations, horizon]);

  const handleSelect = useCallback((station) => {
    setSelectedStation(station);
    setView("map");
  }, []);

  const selectedKey = selectedStation
    ? `${selectedStation.city}||${selectedStation.station}`
    : null;

  return (
    <div id="app">
      <Header
        horizon={horizon}
        setHorizon={setHorizon}
        apiOnline={apiOnline}
        view={view}
        setView={setView}
      />

      {view === "map" && (
        <>
          <Sidebar
            stations={stations}
            forecasts={forecasts}
            selectedKey={selectedKey}
            onSelect={handleSelect}
            error={error}
          />

          <div className="map-wrapper">
            <MapView
              stations={stations}
              forecasts={forecasts}
              selectedStation={selectedStation}
              onSelect={handleSelect}
            />
            <div className="right-stack">
              <DetailPanel
                station={selectedStation}
                forecast={selectedKey ? forecasts[selectedKey] : null}
                horizon={horizon}
              />
              <TrendChart
                station={selectedStation}
                forecast={selectedKey ? forecasts[selectedKey] : null}
                horizon={horizon}
              />
              <AgentTrace station={selectedStation} horizon={horizon} />
              <AdvisoryPanel
                station={selectedStation}
                forecast={selectedKey ? forecasts[selectedKey] : null}
              />
              <InterventionSimulator
                station={selectedStation}
                forecast={selectedKey ? forecasts[selectedKey] : null}
                horizon={horizon}
              />
            </div>
            <Legend />
          </div>
        </>
      )}

      {view === "admin" && (
        <div className="admin-wrapper">
          <AdminView horizon={horizon} />
        </div>
      )}
    </div>
  );
}
