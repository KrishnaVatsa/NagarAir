import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import { aqiColor } from "../utils/aqi";

function FlyToStation({ station }) {
  const map = useMap();
  if (station) {
    map.flyTo([station.lat, station.lon], 8, { duration: 0.7 });
  }
  return null;
}

export default function MapView({ stations, forecasts, selectedStation, onSelect }) {
  return (
    <MapContainer
      center={[24.5, 80]}
      zoom={5}
      zoomControl={true}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {stations.map((s) => {
        if (s.lat == null) return null;
        const key = `${s.city}||${s.station}`;
        const aqi = forecasts[key]?.current_aqi;
        const color = aqi != null ? aqiColor(aqi) : "#c7cfd8";
        return (
          <CircleMarker
            key={key}
            center={[s.lat, s.lon]}
            radius={9}
            weight={2.5}
            color="#fff"
            fillColor={color}
            fillOpacity={0.95}
            eventHandlers={{ click: () => onSelect(s) }}
          />
        );
      })}
      {selectedStation && <FlyToStation station={selectedStation} />}
    </MapContainer>
  );
}
