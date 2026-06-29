import type { PeriodState } from "./types";

export const mockPeriodState: PeriodState = {
  from: "2026-06-22",
  to: "2026-06-29",
  dataMode: "mock",
  flowVersion: "FLOW-007",
  totals: {
    launchedCount: 0,
    readyForLaunchCount: 1,
    rejectedCount: 2,
    totalSpendUsd: 5.41,
    buildSpendUsd: 0,
    governanceApiCostUsd: 0,
    otherSpendUsd: 5.41
  },
  buckets: [
    {
      date: "2026-06-22",
      launchedCount: 0,
      readyForLaunchCount: 0,
      rejectedCount: 1,
      totalSpendUsd: 1.97,
      buildSpendUsd: 0,
      governanceApiCostUsd: 0,
      otherSpendUsd: 1.97
    },
    {
      date: "2026-06-23",
      launchedCount: 0,
      readyForLaunchCount: 0,
      rejectedCount: 0,
      totalSpendUsd: 3.44,
      buildSpendUsd: 0,
      governanceApiCostUsd: 0,
      otherSpendUsd: 3.44
    },
    {
      date: "2026-06-24",
      launchedCount: 0,
      readyForLaunchCount: 1,
      rejectedCount: 0,
      totalSpendUsd: 0,
      buildSpendUsd: 0,
      governanceApiCostUsd: 0,
      otherSpendUsd: 0
    }
  ]
};
