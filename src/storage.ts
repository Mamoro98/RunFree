import AsyncStorage from "@react-native-async-storage/async-storage";
import { Run } from "./types";

const KEY = "runfree.runs.v1";

export async function loadRuns(): Promise<Run[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const runs = JSON.parse(raw) as Run[];
    // newest first
    return runs.sort((a, b) => b.startedAt - a.startedAt);
  } catch {
    return [];
  }
}

export async function saveRun(run: Run): Promise<void> {
  const runs = await loadRuns();
  runs.push(run);
  await AsyncStorage.setItem(KEY, JSON.stringify(runs));
}

export async function deleteRun(id: string): Promise<void> {
  const runs = await loadRuns();
  await AsyncStorage.setItem(KEY, JSON.stringify(runs.filter((r) => r.id !== id)));
}
