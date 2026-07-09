import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Polyline, Region } from "react-native-maps";
import { useKeepAwake } from "expo-keep-awake";
import { Coord, Run } from "../types";
import {
  avgPace,
  elevationGain,
  fmtDistance,
  fmtDuration,
  fmtPace,
  totalDistance,
} from "../geo";
import { getOnce, requestPerms, startTracking, stopTracking } from "../location";
import { saveRun } from "../storage";
import { Stat } from "../components/Stat";
import { C, S } from "../theme";

type Phase = "idle" | "running";

export function RecordScreen({ onSaved }: { onSaved: () => void }) {
  useKeepAwake();
  const [phase, setPhase] = useState<Phase>("idle");
  const [coords, setCoords] = useState<Coord[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [region, setRegion] = useState<Region | null>(null);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<MapView | null>(null);

  // centre map on current position when idle
  useEffect(() => {
    if (phase !== "idle") return;
    getOnce().then((c) => {
      if (c)
        setRegion({
          latitude: c.lat,
          longitude: c.lon,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
    });
  }, [phase]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const distanceM = totalDistance(coords);
  const paceSec = avgPace(distanceM, elapsed);

  async function handleStart() {
    const perm = await requestPerms();
    if (perm === "denied") {
      Alert.alert(
        "Location needed",
        "RunFree can't track a run without location access. Enable it in Settings."
      );
      return;
    }
    if (perm === "foreground-only") {
      Alert.alert(
        "Heads up",
        "Background location is off, so tracking will pause if you lock the screen. For screen-off runs, allow location 'Always' in Settings."
      );
    }
    setCoords([]);
    setElapsed(0);
    startRef.current = Date.now();
    setPhase("running");
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);

    await startTracking((pts) => {
      setCoords(pts);
      const last = pts[pts.length - 1];
      if (last && mapRef.current) {
        mapRef.current.animateCamera(
          { center: { latitude: last.lat, longitude: last.lon } },
          { duration: 500 }
        );
      }
    });
  }

  async function handleStop() {
    if (timerRef.current) clearInterval(timerRef.current);
    const pts = await stopTracking();
    const dist = totalDistance(pts);
    const dur = Math.floor((Date.now() - startRef.current) / 1000);

    if (pts.length < 2 || dist < 20) {
      Alert.alert("Run too short", "Not enough movement recorded to save.");
      setPhase("idle");
      setCoords([]);
      return;
    }

    const run: Run = {
      id: `${startRef.current}`,
      startedAt: startRef.current,
      durationSec: dur,
      distanceM: dist,
      elevationGainM: elevationGain(pts),
      avgPaceSecPerKm: avgPace(dist, dur),
      coords: pts,
    };
    await saveRun(run);
    setPhase("idle");
    setCoords([]);
    setElapsed(0);
    onSaved();
  }

  function confirmStop() {
    Alert.alert("Finish run?", "Stop tracking and save this run.", [
      { text: "Keep going", style: "cancel" },
      { text: "Finish", style: "destructive", onPress: handleStop },
    ]);
  }

  const polyCoords = coords.map((c) => ({ latitude: c.lat, longitude: c.lon }));

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        showsUserLocation
        followsUserLocation={phase === "running"}
        showsMyLocationButton={false}
        region={region ?? undefined}
      >
        {polyCoords.length > 1 && (
          <Polyline coordinates={polyCoords} strokeColor={C.accent} strokeWidth={6} />
        )}
      </MapView>

      <View style={styles.panel}>
        <View style={styles.statsRow}>
          <Stat label="Distance" value={fmtDistance(distanceM)} unit="km" />
          <Stat label="Time" value={fmtDuration(elapsed)} />
          <Stat label="Pace" value={fmtPace(paceSec)} unit="/km" />
        </View>

        {phase === "idle" ? (
          <Pressable style={[styles.btn, styles.start]} onPress={handleStart}>
            <Text style={styles.btnText}>START RUN</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.btn, styles.stop]} onPress={confirmStop}>
            <Text style={styles.btnText}>FINISH</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: S.pad,
    paddingTop: 20,
    paddingBottom: 34,
    gap: 20,
  },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  btn: {
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  start: { backgroundColor: C.accent },
  stop: { backgroundColor: C.danger },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "800", letterSpacing: 1 },
});
