import type { PeriodState } from "./types";

export const mockPeriodState: PeriodState = {
  from: "2026-06-22",
  to: "2026-06-22",
  dataMode: "mock",
  flowVersion: "FLOW-006",
  rejectedLaunch: {
    reviewId: "LR-C-001-001",
    candidateId: "C-001-001",
    candidateTitle: "Meal Planner Studio",
    reviewedAt: "2026-06-22",
    flowContractRef: "workflows/FLOW-004.yaml",
    status: "revision_requested_after_human_review",
    decisionSummary: "Human review rejected the build before marketplace publishing.",
    blockerSummary:
      "Insufficient visible input cells, missing protection, unclear row and column behavior, and non-screenshot listing assets.",
    evidenceRefs: [
      "records/validation/LR-C-001-001.yaml",
      "records/escalations/ESC-C-001-001.yaml"
    ]
  },
  totals: {
    launchedCount: 0,
    rejectedLaunchCount: 1,
    modelTokensTotal: 31_800,
    launchTokensTotal: 420,
    governanceTokensTotal: 140,
    postLaunchSupportTokensTotal: 0,
    refundTokensTotal: 0,
    refundCountTotal: 0,
    usdTotalSpend: 24.96,
    totalApiCostUsd: 0,
    productApiCostUsd: 0,
    governanceApiCostUsd: 0,
    unallocatedApiCostUsd: 0,
    humanEscalationsTotal: 0,
    avgModelTokensPerLaunch: 31_800,
    avgUsdSpendPerLaunch: 24.96
  },
  buckets: [
    {
      date: "2026-06-22",
      launchedCount: 0,
      rejectedLaunchCount: 1,
      avgModelTokensPerLaunch: 31_800,
      avgUsdSpendPerLaunch: 24.96,
      totalApiCostUsd: 0,
      productApiCostUsd: 0,
      governanceApiCostUsd: 0,
      unallocatedApiCostUsd: 0,
      humanEscalations: 0,
      launchTokens: 420,
      governanceTokens: 140,
      postLaunchSupportTokens: 0,
      refundTokens: 0,
      refundCount: 0
    }
  ]
};
