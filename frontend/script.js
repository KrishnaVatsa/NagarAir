const API_BASE = "http://127.0.0.1:8000";
let currentHorizon = 24;
let stations = [];
let markers = {};
let selectedKey = null;

function aqiColor(aqi){
  if (aqi <= 50) return "#1fa85c";
  if (aqi <= 100) return "#84b52e";
  if (aqi <= 200) return "#e0ab13";
  if (aqi <= 300) return "#f0793a";
  if (aqi <= 400) return "#e8432e";
  return "#9c1f38";
}
function aqiLabel(aqi){
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

const map = L.map('map', { zoomControl: false }).setView([24.5, 80], 5);
L.control.zoom({ position: 'bottomright' }).addTo(map);
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  maxZoom: 19
}).addTo(map);

function keyFor(s){ return s.city + "||" + s.station; }

function setApiStatus(message){
  const el = document.getElementById('apiStatus');
  const pulse = document.querySelector('.pulse');
  if (message){
    el.textContent = message;
    el.classList.add('error');
    pulse.classList.add('offline');
  } else {
    el.textContent = "";
    el.classList.remove('error');
    pulse.classList.remove('offline');
  }
}

async function loadStations(){
  let res;
  try{
    res = await fetch(`${API_BASE}/stations`);
  } catch(e){
    setApiStatus("⚠ Cannot reach API at " + API_BASE + " — is the backend running?");
    document.getElementById('stationList').innerHTML =
      '<div class="placeholder">Backend not reachable.<br>Start it with:<br>python -m uvicorn forecast_api:app --reload --port 8000</div>';
    return;
  }

  if (!res.ok){
    setApiStatus("⚠ API returned an error (" + res.status + ")");
    return;
  }

  setApiStatus(null);
  stations = await res.json();

  const listEl = document.getElementById('stationList');
  listEl.innerHTML = "";

  if (stations.length === 0){
    listEl.innerHTML = '<div class="placeholder">API connected, but no stations returned. Check master_aqi_dataset.csv.</div>';
    return;
  }

  for (const s of stations){
    if (s.lat == null) continue;

    const card = document.createElement('div');
    card.className = 'station-card';
    card.dataset.key = keyFor(s);
    card.innerHTML = `
      <div class="row1">
        <div>
          <div class="name">${s.station}</div>
          <div class="city">${s.city.toUpperCase()}</div>
        </div>
        <div class="aqi-pill" style="background:#c7cfd8; color:#fff;">···</div>
      </div>`;
    card.addEventListener('click', () => selectStation(s));
    listEl.appendChild(card);

    const marker = L.circleMarker([s.lat, s.lon], {
      radius: 9, weight: 2.5, color: "#fff", fillColor: "#c7cfd8", fillOpacity: 0.95, className: 'marker-glow'
    }).addTo(map);
    marker.on('click', () => selectStation(s));
    markers[keyFor(s)] = marker;

    refreshStationBadge(s, card, marker);
  }
}

async function refreshStationBadge(s, card, marker){
  try{
    const res = await fetch(`${API_BASE}/forecast?city=${encodeURIComponent(s.city)}&station=${encodeURIComponent(s.station)}&horizon=${currentHorizon}`);
    if (!res.ok) return;
    const data = await res.json();
    const color = aqiColor(data.current_aqi);
    const pill = card.querySelector('.aqi-pill');
    pill.textContent = Math.round(data.current_aqi);
    pill.style.background = color;
    marker.setStyle({ fillColor: color, color: "#fff" });
    s._lastData = data;
  } catch(e){ /* API not reachable */ }
}

function selectStation(s){
  selectedKey = keyFor(s);
  document.querySelectorAll('.station-card').forEach(c => c.classList.toggle('selected', c.dataset.key === selectedKey));
  map.flyTo([s.lat, s.lon], 8, { duration: 0.7 });
  loadForecastDetail(s);
}

async function loadForecastDetail(s){
  const panel = document.getElementById('detailPanel');
  panel.classList.add('show');
  document.getElementById('dpTitle').textContent = s.station;
  document.getElementById('dpSub').textContent = s.city.toUpperCase() + " · LIVE STATION";
  document.getElementById('dpHorizonLabel').textContent = `Forecast +${currentHorizon}h`;
  document.getElementById('dpCurrent').textContent = "···";
  document.getElementById('dpPredicted').textContent = "···";
  document.getElementById('dpDelta').textContent = "";
  document.getElementById('dpCurrentLabel').textContent = "";

  try{
    const res = await fetch(`${API_BASE}/forecast?city=${encodeURIComponent(s.city)}&station=${encodeURIComponent(s.station)}&horizon=${currentHorizon}`);
    const data = await res.json();
    const cur = data.current_aqi, pred = data.predicted_aqi;
    document.getElementById('dpCurrent').textContent = Math.round(cur);
    document.getElementById('dpCurrent').style.color = aqiColor(cur);
    document.getElementById('dpCurrentLabel').textContent = aqiLabel(cur);
    document.getElementById('dpPredicted').textContent = Math.round(pred);
    document.getElementById('dpPredicted').style.color = aqiColor(pred);

    const diff = pred - cur;
    const deltaEl = document.getElementById('dpDelta');
    deltaEl.textContent = (diff >= 0 ? "▲ +" : "▼ ") + Math.round(diff) + " · " + aqiLabel(pred);
    deltaEl.className = "delta " + (diff >= 0 ? "up" : "down");
  } catch(e){
    document.getElementById('dpCurrent').textContent = "n/a";
  }
}

document.getElementById('horizonToggle').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  document.querySelectorAll('#horizonToggle button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentHorizon = parseInt(btn.dataset.h);

  document.querySelectorAll('.station-card').forEach(card => {
    const s = stations.find(st => keyFor(st) === card.dataset.key);
    if (s) refreshStationBadge(s, card, markers[card.dataset.key]);
  });
  if (selectedKey){
    const s = stations.find(st => keyFor(st) === selectedKey);
    if (s) loadForecastDetail(s);
  }
});

loadStations();
