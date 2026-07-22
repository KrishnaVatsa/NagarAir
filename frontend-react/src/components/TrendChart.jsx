import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  CartesianGrid,
} from "recharts";
import { fetchHistory } from "../api";
import { aqiColor } from "../utils/aqi";

export default function TrendChart({ station, forecast, horizon }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!station) return;
    setLoading(true);
    fetchHistory(station.city, station.station, 168)
      .then((data) => setHistory(data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [station]);

  if (!station) return null;

  const chartData = history.map((h) => ({
    time: new Date(h.datetime).getTime(),
    aqi: h.aqi,
  }));

  const forecastPoint =
    forecast && chartData.length > 0
      ? {
          time: chartData[chartData.length - 1].time + horizon * 3600 * 1000,
          aqi: forecast.predicted_aqi,
        }
      : null;

  const combined = forecastPoint ? [...chartData, forecastPoint] : chartData;

  return (
    <div className="trend-panel">
      <div className="trend-header">
        <div className="advisory-title">7-Day Trend + Forecast</div>
        <div className="advisory-sub">{station.station} · {station.city.toUpperCase()}</div>
      </div>

      {loading && <div className="placeholder">Loading history…</div>}

      {!loading && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={combined} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,30,45,0.06)" />
            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(t) =>
                new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" })
              }
              tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#8b95a3" }}
              axisLine={{ stroke: "rgba(20,30,45,0.09)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#8b95a3" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              labelFormatter={(t) => new Date(t).toLocaleString()}
              formatter={(v) => [Math.round(v), "AQI"]}
              contentStyle={{
                background: "#fff",
                border: "1px solid rgba(20,30,45,0.09)",
                borderRadius: 8,
                fontFamily: "JetBrains Mono",
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#0e9488"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
            {forecastPoint && (
              <ReferenceDot
                x={forecastPoint.time}
                y={forecastPoint.aqi}
                r={5}
                fill={aqiColor(forecastPoint.aqi)}
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}

      {forecastPoint && (
        <div className="trend-footnote">
          <span className="dot" style={{ background: aqiColor(forecastPoint.aqi) }}></span>
          +{horizon}h forecast: {Math.round(forecastPoint.aqi)} AQI
        </div>
      )}
    </div>
  );
}
