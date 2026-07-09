import { Coord } from "./types";

const R = 6371000; // earth radius, metres

// Haversine distance between two coords, metres.
export function haversine(a: Coord, b: Coord): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Total route distance, metres. Skips jitter (< 1m) and low-accuracy jumps.
export function totalDistance(coords: Coord[]): number {
  let d = 0;
  for (let i = 1; i < coords.length; i++) {
    const step = haversine(coords[i - 1], coords[i]);
    // drop sub-metre GPS jitter that would inflate distance while standing still
    if (step >= 1) d += step;
  }
  return d;
}

// Positive elevation gain, metres. Smoothed with a 2m threshold to kill noise.
export function elevationGain(coords: Coord[]): number {
  let gain = 0;
  let lastAlt: number | null = null;
  for (const c of coords) {
    if (c.alt == null) continue;
    if (lastAlt == null) {
      lastAlt = c.alt;
      continue;
    }
    const delta = c.alt - lastAlt;
    if (delta >= 2) {
      gain += delta;
      lastAlt = c.alt;
    } else if (delta <= -2) {
      lastAlt = c.alt; // descending, reset baseline but don't count
    }
  }
  return gain;
}

// seconds per km, 0 if distance negligible
export function avgPace(distanceM: number, durationSec: number): number {
  if (distanceM < 10) return 0;
  return durationSec / (distanceM / 1000);
}

// --- formatting ---

export function fmtDistance(m: number): string {
  return (m / 1000).toFixed(2);
}

export function fmtDuration(sec: number): string {
  const s = Math.floor(sec % 60);
  const m = Math.floor((sec / 60) % 60);
  const h = Math.floor(sec / 3600);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function fmtPace(secPerKm: number): string {
  if (secPerKm <= 0) return "--:--";
  const m = Math.floor(secPerKm / 60);
  const s = Math.floor(secPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function fmtDate(epochMs: number): string {
  const d = new Date(epochMs);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }) + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
