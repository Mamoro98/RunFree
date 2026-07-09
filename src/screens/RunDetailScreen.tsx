import React, { useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Run } from "../types";
import { fmtDate, fmtDistance, fmtDuration, fmtPace } from "../geo";
import { deleteRun } from "../storage";
import { Stat } from "../components/Stat";
import { C, S } from "../theme";

export function RunDetailScreen({
  run,
  onBack,
  onDeleted,
}: {
  run: Run;
  onBack: () => void;
  onDeleted: () => void;
}) {
  const poly = useMemo(
    () => run.coords.map((c) => ({ latitude: c.lat, longitude: c.lon })),
    [run]
  );
  const start = poly[0];
  const end = poly[poly.length - 1];

  const region = useMemo(() => {
    const lats = poly.map((p) => p.latitude);
    const lons = poly.map((p) => p.longitude);
    const minLat = Math.min(...lats),
      maxLat = Math.max(...lats);
    const minLon = Math.min(...lons),
      maxLon = Math.max(...lons);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: Math.max(0.003, (maxLat - minLat) * 1.4),
      longitudeDelta: Math.max(0.003, (maxLon - minLon) * 1.4),
    };
  }, [poly]);

  function confirmDelete() {
    Alert.alert("Delete run?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteRun(run.id);
          onDeleted();
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Pressable onPress={confirmDelete} hitSlop={12}>
          <Text style={styles.delete}>Delete</Text>
        </Pressable>
      </View>

      <Text style={styles.date}>{fmtDate(run.startedAt)}</Text>

      <MapView style={styles.map} initialRegion={region} scrollEnabled zoomEnabled>
        {poly.length > 1 && (
          <Polyline coordinates={poly} strokeColor={C.accent} strokeWidth={6} />
        )}
        {start && <Marker coordinate={start} title="Start" pinColor={C.good} />}
        {end && <Marker coordinate={end} title="Finish" pinColor={C.danger} />}
      </MapView>

      <View style={styles.statsGrid}>
        <View style={styles.statRow}>
          <Stat label="Distance" value={fmtDistance(run.distanceM)} unit="km" />
          <Stat label="Time" value={fmtDuration(run.durationSec)} />
        </View>
        <View style={styles.statRow}>
          <Stat label="Avg Pace" value={fmtPace(run.avgPaceSecPerKm)} unit="/km" />
          <Stat label="Elevation" value={`${Math.round(run.elevationGainM)}`} unit="m ↑" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: S.pad,
    paddingTop: 8,
  },
  back: { color: C.accent, fontSize: 17, fontWeight: "700" },
  delete: { color: C.danger, fontSize: 16, fontWeight: "700" },
  date: { color: C.text, fontSize: 22, fontWeight: "800", paddingHorizontal: S.pad, paddingVertical: 12 },
  map: { height: 320, marginHorizontal: S.pad, borderRadius: S.radius, overflow: "hidden" },
  statsGrid: { padding: S.pad, gap: 28, marginTop: 8 },
  statRow: { flexDirection: "row", justifyContent: "space-between" },
});
