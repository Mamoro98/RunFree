import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { C } from "../theme";

export function Stat({
  label,
  value,
  unit,
  big,
}: {
  label: string;
  value: string;
  unit?: string;
  big?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={[styles.value, big && styles.valueBig]}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", flex: 1 },
  label: {
    color: C.textDim,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  row: { flexDirection: "row", alignItems: "flex-end" },
  value: { color: C.text, fontSize: 34, fontWeight: "800", fontVariant: ["tabular-nums"] },
  valueBig: { fontSize: 64, lineHeight: 68 },
  unit: { color: C.textDim, fontSize: 15, fontWeight: "600", marginBottom: 8, marginLeft: 4 },
});
