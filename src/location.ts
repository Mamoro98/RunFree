import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Coord } from "./types";

export const TASK = "runfree-location-task";

// Module-level state. Persists for the app's JS lifetime, which iOS keeps
// alive while background location updates are being delivered.
let points: Coord[] = [];
let listener: ((pts: Coord[]) => void) | null = null;

function toCoord(l: Location.LocationObject): Coord {
  return {
    lat: l.coords.latitude,
    lon: l.coords.longitude,
    alt: l.coords.altitude ?? null,
    acc: l.coords.accuracy ?? null,
    t: l.timestamp,
  };
}

// Registered once at module import (App.tsx imports this file).
TaskManager.defineTask(TASK, async ({ data, error }) => {
  if (error) {
    console.warn("location task error", error.message);
    return;
  }
  const locs = (data as { locations?: Location.LocationObject[] })?.locations;
  if (!locs?.length) return;
  for (const l of locs) {
    const c = toCoord(l);
    // drop garbage fixes: no/huge accuracy radius
    if (c.acc != null && c.acc > 40) continue;
    points.push(c);
  }
  listener?.(points.slice());
});

export type PermResult = "granted" | "foreground-only" | "denied";

// Requests foreground + background permission. Foreground alone still works
// (tracking pauses when screen locks); background is needed for screen-off runs.
export async function requestPerms(): Promise<PermResult> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== "granted") return "denied";
  const bg = await Location.requestBackgroundPermissionsAsync();
  return bg.status === "granted" ? "granted" : "foreground-only";
}

export async function startTracking(onUpdate: (pts: Coord[]) => void): Promise<void> {
  points = [];
  listener = onUpdate;

  const already = await Location.hasStartedLocationUpdatesAsync(TASK).catch(() => false);
  if (already) await Location.stopLocationUpdatesAsync(TASK);

  await Location.startLocationUpdatesAsync(TASK, {
    accuracy: Location.Accuracy.BestForNavigation,
    activityType: Location.ActivityType.Fitness,
    distanceInterval: 5, // metres
    deferredUpdatesInterval: 1000,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true, // iOS blue bar
    foregroundService: {
      notificationTitle: "RunFree is tracking your run",
      notificationBody: "Tap to return to the app.",
      notificationColor: "#FF5A1F",
    },
  });
}

// Stops the task and returns the full recorded route.
export async function stopTracking(): Promise<Coord[]> {
  const already = await Location.hasStartedLocationUpdatesAsync(TASK).catch(() => false);
  if (already) await Location.stopLocationUpdatesAsync(TASK);
  listener = null;
  return points.slice();
}

// Fetch one fix to centre the map before a run starts.
export async function getOnce(): Promise<Coord | null> {
  try {
    const l = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return toCoord(l);
  } catch {
    return null;
  }
}
