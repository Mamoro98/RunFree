export type Coord = {
  lat: number;
  lon: number;
  alt: number | null; // metres, GPS/barometer fused by iOS
  t: number; // epoch ms
  acc: number | null; // horizontal accuracy in metres
};

export type Run = {
  id: string;
  startedAt: number; // epoch ms
  durationSec: number; // moving + paused wall time
  distanceM: number;
  elevationGainM: number;
  avgPaceSecPerKm: number; // 0 if distance too small
  coords: Coord[];
};
