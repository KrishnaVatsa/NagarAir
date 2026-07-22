const API_BASE = "http://127.0.0.1:8000";

export async function fetchStations() {
  const res = await fetch(`${API_BASE}/stations`);
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

export async function fetchForecast(city, station, horizon) {
  const url = `${API_BASE}/forecast?city=${encodeURIComponent(city)}&station=${encodeURIComponent(station)}&horizon=${horizon}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

export async function fetchHistory(city, station, hours = 168) {
  const url = `${API_BASE}/history?city=${encodeURIComponent(city)}&station=${encodeURIComponent(station)}&hours=${hours}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

export async function fetchAgentAnalysis(city, station, horizon) {
  const url = `${API_BASE}/agent/analyze?city=${encodeURIComponent(city)}&station=${encodeURIComponent(station)}&horizon=${horizon}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

export async function fetchPlume(city) {
  const url = `${API_BASE}/plume?city=${encodeURIComponent(city)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

export async function fetchAdminOverview(horizon) {
  const url = `${API_BASE}/admin/overview?horizon=${horizon}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

export async function fetchInterventions(city) {
  const url = `${API_BASE}/interventions?city=${encodeURIComponent(city)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

export async function fetchSimulation(city, station, horizon, interventionId) {
  const url = `${API_BASE}/simulate?city=${encodeURIComponent(city)}&station=${encodeURIComponent(station)}&horizon=${horizon}&intervention_id=${interventionId}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API returned ${res.status}`);
  }
  return res.json();
}

export { API_BASE };
