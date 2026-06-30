import type { PeriodState } from "./types";

export const mockPeriodState: PeriodState = {
  asOf: "2026-06-30 18:40 GMT+2",
  from: "2026-06-22",
  to: "2026-06-30",
  dataMode: "mock",
  flowVersion: "FLOW-007",
  flowTimeline: [
    { stageGroup: "market", stepIds: ["00_market_evidence"] },
    { stageGroup: "read", stepIds: ["01_public_shelf_read"] },
    { stageGroup: "architecture", stepIds: ["02_target_audience_exploration"] },
    { stageGroup: "purchase", stepIds: ["03_competitor_selection_purchase_approval"] },
    { stageGroup: "inspect", stepIds: ["04_purchased_competitor_inspection"] },
    { stageGroup: "architecture", stepIds: ["05_target_audience_lock", "06_product_identity_reframe", "07_product_architecture_contract"] },
    { stageGroup: "scenarios", stepIds: ["08_scenario_matrix"] },
    { stageGroup: "build", stepIds: ["09_workbook_or_product_blueprint"] },
    { stageGroup: "readiness", stepIds: ["10_build_readiness_review"] },
    { stageGroup: "pre_mortem", stepIds: ["11_pre_build_architecture_premortem"] },
    { stageGroup: "build", stepIds: ["12_product_build"] },
    { stageGroup: "artifact_qa", stepIds: ["13_real_artifact_inspection"] },
    { stageGroup: "walkthrough", stepIds: ["14_blind_buyer_walkthrough"] },
    { stageGroup: "listing", stepIds: ["15_listing_packaging_qa"] },
    { stageGroup: "pre_mortem", stepIds: ["16_pre_mortem_failure_analysis"] },
    { stageGroup: "launch", stepIds: ["17_founder_launch_gate"] }
  ],
  totals: {
    launchedCount: 0,
    readyForLaunchCount: 1,
    rejectedCount: 3,
    totalSpendUsd: 346.25,
    buildSpendUsd: 136.4,
    governanceApiCostUsd: 163.4,
    otherSpendUsd: 46.45
  },
  buckets: [
    {
      date: "2026-06-22",
      launchedCount: 0,
      readyForLaunchCount: 0,
      rejectedCount: 2,
      totalSpendUsd: 27.37,
      buildSpendUsd: 25.4,
      governanceApiCostUsd: 0,
      otherSpendUsd: 1.97
    },
    {
      date: "2026-06-23",
      launchedCount: 0,
      readyForLaunchCount: 0,
      rejectedCount: 0,
      totalSpendUsd: 9.44,
      buildSpendUsd: 6,
      governanceApiCostUsd: 0,
      otherSpendUsd: 3.44
    },
    {
      date: "2026-06-24",
      launchedCount: 0,
      readyForLaunchCount: 0,
      rejectedCount: 0,
      totalSpendUsd: 41.4,
      buildSpendUsd: 22,
      governanceApiCostUsd: 19.4,
      otherSpendUsd: 0
    },
    {
      date: "2026-06-25",
      launchedCount: 0,
      readyForLaunchCount: 0,
      rejectedCount: 0,
      totalSpendUsd: 12.74,
      buildSpendUsd: 2,
      governanceApiCostUsd: 6.7,
      otherSpendUsd: 4.04
    },
    {
      date: "2026-06-26",
      launchedCount: 0,
      readyForLaunchCount: 0,
      rejectedCount: 0,
      totalSpendUsd: 31.6,
      buildSpendUsd: 16,
      governanceApiCostUsd: 15.6,
      otherSpendUsd: 0
    },
    {
      date: "2026-06-27",
      launchedCount: 0,
      readyForLaunchCount: 0,
      rejectedCount: 0,
      totalSpendUsd: 13.7,
      buildSpendUsd: 0,
      governanceApiCostUsd: 13.7,
      otherSpendUsd: 0
    },
    {
      date: "2026-06-28",
      launchedCount: 0,
      readyForLaunchCount: 0,
      rejectedCount: 0,
      totalSpendUsd: 41,
      buildSpendUsd: 20,
      governanceApiCostUsd: 20,
      otherSpendUsd: 1
    },
    {
      date: "2026-06-29",
      launchedCount: 0,
      readyForLaunchCount: 0,
      rejectedCount: 1,
      totalSpendUsd: 86,
      buildSpendUsd: 10,
      governanceApiCostUsd: 51,
      otherSpendUsd: 25
    },
    {
      date: "2026-06-30",
      launchedCount: 0,
      readyForLaunchCount: 1,
      rejectedCount: 0,
      totalSpendUsd: 83,
      buildSpendUsd: 35,
      governanceApiCostUsd: 37,
      otherSpendUsd: 11
    }
  ]
};
