import React, { useCallback, useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import "./src/location"; // registers the background location task at startup
import { Run } from "./src/types";
import { loadRuns } from "./src/storage";
import { RecordScreen } from "./src/screens/RecordScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { RunDetailScreen } from "./src/screens/RunDetailScreen";
import { C } from "./src/theme";

type Tab = "record" | "history";

export default function App() {
  const [tab, setTab] = useState<Tab>("record");
  const [runs, setRuns] = useState<Run[]>([]);
  const [open, setOpen] = useState<Run | null>(null);

  const refresh = useCallback(() => {
    loadRuns().then(setRuns);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Detail view takes over the whole screen.
  if (open) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        <RunDetailScreen
          run={open}
          onBack={() => setOpen(null)}
          onDeleted={() => {
            setOpen(null);
            refresh();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.body}>
        {tab === "record" ? (
          <RecordScreen
            onSaved={() => {
              refresh();
              setTab("history");
            }}
          />
        ) : (
          <HistoryScreen runs={runs} onOpen={setOpen} />
        )}
      </View>

      <View style={styles.tabs}>
        <TabButton label="Record" active={tab === "record"} onPress={() => setTab("record")} />
        <TabButton label="History" active={tab === "history"} onPress={() => setTab("history")} />
      </View>
    </SafeAreaView>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.tab} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
      {active && <View style={styles.tabDot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  body: { flex: 1 },
  tabs: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.line,
    backgroundColor: C.bg,
    paddingBottom: 6,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12, gap: 5 },
  tabText: { color: C.textDim, fontSize: 15, fontWeight: "700" },
  tabTextActive: { color: C.text },
  tabDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.accent },
});
