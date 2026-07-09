import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Run } from "../types";
import { fmtDate, fmtDistance, fmtDuration, fmtPace } from "../geo";
import { C, S } from "../theme";

export function HistoryScreen({
  runs,
  onOpen,
}: {
  runs: Run[];
  onOpen: (r: Run) => void;
}) {
  if (runs.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyBig}>No runs yet</Text>
        <Text style={styles.emptyDim}>Hit Record and go for a run.</Text>
      </View>
    );
  }

  const totalKm = runs.reduce((s, r) => s + r.distanceM, 0) / 1000;

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={runs}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>History</Text>
          <Text style={styles.headerSub}>
            {runs.length} runs · {totalKm.toFixed(1)} km total
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => onOpen(item)}>
          <Text style={styles.date}>{fmtDate(item.startedAt)}</Text>
          <View style={styles.row}>
            <Metric v={fmtDistance(item.distanceM)} u="km" />
            <Metric v={fmtDuration(item.durationSec)} u="time" />
            <Metric v={fmtPace(item.avgPaceSecPerKm)} u="/km" />
            <Metric v={`${Math.round(item.elevationGainM)}`} u="m ↑" />
          </View>
        </Pressable>
      )}
    />
  );
}

function Metric({ v, u }: { v: string; u: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricVal}>{v}</Text>
      <Text style={styles.metricUnit}>{u}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: C.bg },
  listContent: { padding: S.pad, gap: S.gap },
  header: { marginBottom: 4 },
  headerTitle: { color: C.text, fontSize: 30, fontWeight: "800" },
  headerSub: { color: C.textDim, fontSize: 14, marginTop: 2 },
  card: {
    backgroundColor: C.card,
    borderRadius: S.radius,
    padding: S.pad,
    gap: 12,
  },
  date: { color: C.accent, fontSize: 14, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  metric: { alignItems: "flex-start" },
  metricVal: { color: C.text, fontSize: 20, fontWeight: "800", fontVariant: ["tabular-nums"] },
  metricUnit: { color: C.textDim, fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  empty: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyBig: { color: C.text, fontSize: 22, fontWeight: "800" },
  emptyDim: { color: C.textDim, fontSize: 15 },
});
