export function aqiColor(aqi) {
  if (aqi <= 50) return "#1fa85c";
  if (aqi <= 100) return "#84b52e";
  if (aqi <= 200) return "#e0ab13";
  if (aqi <= 300) return "#f0793a";
  if (aqi <= 400) return "#e8432e";
  return "#9c1f38";
}

export function aqiLabel(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

export const AQI_SCALE = [
  { label: "Good", color: "#1fa85c" },
  { label: "Satisfactory", color: "#84b52e" },
  { label: "Moderate", color: "#e0ab13" },
  { label: "Poor", color: "#f0793a" },
  { label: "Very Poor", color: "#e8432e" },
  { label: "Severe", color: "#9c1f38" },
];
