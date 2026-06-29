import type { PeriodState } from "./types";

export const mockPeriodState: PeriodState = {
  asOf: "2026-06-29 23:00 GMT+2",
  from: "2026-06-22",
  to: "2026-06-29",
  dataMode: "mock",
  flowVersion: "FLOW-007",
  flowTimeline: [
    { stageGroup: "market", stepIds: ["00_market_evidence"] },
    { stageGroup: "read", stepIds: ["01_public_shelf_read"] },
    { stageGroup: "purchase", stepIds: ["02_competitor_selection_purchase_approval"] },
    { stageGroup: "inspect", stepIds: ["03_purchased_competitor_inspection"] },
    { stageGroup: "architecture", stepIds: ["04_product_architecture_contract"] },
    { stageGroup: "scenarios", stepIds: ["05_scenario_matrix"] },
    { stageGroup: "readiness", stepIds: ["06_build_readiness_review"] },
    { stageGroup: "build", stepIds: ["07_product_build"] },
    { stageGroup: "artifact_qa", stepIds: ["08_real_artifact_inspection"] },
    { stageGroup: "walkthrough", stepIds: ["09_blind_buyer_walkthrough"] },
    { stageGroup: "listing", stepIds: ["10_listing_packaging_qa"] },
    { stageGroup: "pre_mortem", stepIds: ["11_pre_mortem_failure_analysis"] },
    { stageGroup: "launch", stepIds: ["12_founder_launch_gate"] }
  ],
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
