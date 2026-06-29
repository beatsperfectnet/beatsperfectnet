import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";

import { mockPeriodState } from "@/lib/period/mockPeriodState";
import type { PeriodState } from "@/lib/period/types";
import { mockTodayState } from "@/lib/today/mockTodayState";
import type { TodayState } from "@/lib/today/types";

type DashboardSnapshot = {
  today?: TodayState;
  period?: PeriodState;
};

async function readSnapshot(): Promise<DashboardSnapshot | null> {
  const snapshotPath = join(process.cwd(), "records", "dashboard_state.yaml");

  try {
    const file = await readFile(snapshotPath, "utf8");
    const parsed = parse(file) as DashboardSnapshot;
    return parsed ?? null;
  } catch {
    return null;
  }
}

export async function loadTodayState(): Promise<TodayState> {
  const snapshot = await readSnapshot();
  return snapshot?.today ?? mockTodayState;
}

export async function loadPeriodState(): Promise<PeriodState> {
  const snapshot = await readSnapshot();
  if (snapshot?.period) {
    return {
      ...snapshot.period,
      asOf: snapshot.period.asOf ?? snapshot.today?.asOf,
      flowTimeline: snapshot.period.flowTimeline ?? snapshot.today?.flowTimeline
    };
  }
  return mockPeriodState;
}
