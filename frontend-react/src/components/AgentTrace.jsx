import { useEffect, useState } from "react";
import { fetchAgentAnalysis } from "../api";

const URGENCY_COLOR = {
  critical: "#9c1f38",
  elevated: "#e8432e",
  stable: "#e0ab13",
  improving: "#1fa85c",
};

function AgentStep({ index, agent, active }) {
  return (
    <div className={`agent-step ${active ? "active" : ""}`}>
      <div className="agent-step-marker">
        <div className="agent-step-num">{index}</div>
        {index < 5 && <div className="agent-step-line"></div>}
      </div>
      <div className="agent-step-body">
        <div className="agent-step-name">{agent.agent}</div>
        <div className="agent-step-action">{agent.action}</div>

        {agent.agent === "Forecast Agent" && (
          <div className="agent-step-detail">
            <span className="chip">{agent.output.current_band} → {agent.output.predicted_band}</span>
          </div>
        )}

        {agent.agent === "Explainability Agent" && (
          <div className="agent-step-detail shap-list">
            {agent.output.top_factors.map((f, i) => (
              <div key={i} className="shap-row">
                <span className={`shap-arrow ${f.direction === "increases" ? "up" : "down"}`}>
                  {f.direction === "increases" ? "▲" : "▼"}
                </span>
                <span className="shap-factor">{f.factor}</span>
                <span className="shap-impact">{f.impact > 0 ? "+" : ""}{f.impact}</span>
              </div>
            ))}
          </div>
        )}

        {agent.agent === "Risk Escalation Agent" && (
          <div
            className="agent-step-detail urgency-badge"
            style={{ color: URGENCY_COLOR[agent.output.urgency] }}
          >
            {agent.output.message}
          </div>
        )}

        {agent.agent === "Source Attribution Agent" && (
          <div className="agent-step-detail source-attribution">
            <div className="sa-landuse">{agent.output.land_use}</div>
            {agent.output.likely_sources.length > 0 && (
              <div className="sa-sources">
                {agent.output.likely_sources.map((s, i) => (
                  <span key={i} className="chip chip-muted">{s}</span>
                ))}
              </div>
            )}
            <div className="sa-row">
              <span className="sa-label">Wind</span>
              <span>
                {agent.output.wind.wind_speed_kmh != null
                  ? `${agent.output.wind.wind_speed_kmh} km/h`
                  : "unavailable"}
                {" · "}{agent.output.dispersion_note}
              </span>
            </div>
            <div className="sa-row">
              <span className="sa-label">Fire risk</span>
              <span>
                <b>{agent.output.seasonal_fire_risk.risk}</b> — {agent.output.seasonal_fire_risk.note}
              </span>
            </div>
          </div>
        )}

        {agent.agent === "Advisory & Intervention Agent" && (
          <div className="agent-step-detail">
            <span className="chip">{agent.output.grap_stage}</span>
            <div style={{ marginTop: 8 }}>{agent.output.recommendation}</div>
            {agent.output.grap_actions.length > 0 && (
              <>
                <div className="intervention-label">GRAP mandated actions</div>
                <ul className="intervention-list">
                  {agent.output.grap_actions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </>
            )}
            {agent.output.source_interventions.length > 0 && (
              <>
                <div className="intervention-label">Local targeted actions</div>
                <ul className="intervention-list">
                  {agent.output.source_interventions.map((iv, i) => (
                    <li key={i}>{iv}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentTrace({ station, horizon }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!station) return;
    setLoading(true);
    setError(null);
    fetchAgentAnalysis(station.city, station.station, horizon)
      .then((res) => setData(res))
      .catch(() => setError("Agent pipeline unavailable"))
      .finally(() => setLoading(false));
  }, [station, horizon]);

  if (!station) return null;

  return (
    <div className="agent-panel">
      <div className="advisory-header">
        <div>
          <div className="advisory-title">Air Intelligence Orchestrator</div>
          <div className="advisory-sub">4-agent reasoning pipeline · live</div>
        </div>
      </div>

      {loading && <div className="placeholder">Running agent pipeline…</div>}
      {error && <div className="api-status error">⚠ {error}</div>}

      {data && (
        <div className="agent-steps">
          {data.pipeline.map((agent, i) => (
            <AgentStep key={agent.agent} index={i + 1} agent={agent} active={true} />
          ))}
        </div>
      )}
    </div>
  );
}
