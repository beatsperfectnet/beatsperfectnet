import { stageLabels } from "./flow";
import type { TodayState } from "./types";

export const mockTodayState: TodayState = {
  asOf: "2026-06-23 13:20 CET",
  dataMode: "mock",
  flowVersion: "FLOW-006",
  flowTimeline: stageLabels.map(({ label, steps }) => ({
    stageGroup: label,
    stepIds: steps
  })),
  todayLog: [
    {
      id: "FLOW-2026-06-26-005-to-006",
      kind: "flow_transition",
      label: "FLOW-005 to FLOW-006",
      detail: "Active flow changed before the next run.",
      amountUsd: 0
    }
  ],
  totals: {
    pipelineCandidates: 0,
    inFlightCandidates: 0,
    launchedCandidates: 0,
    rejectedCandidates: 0,
    totalSpendUsd: 0,
    productApiCostUsd: 0,
    governanceApiCostUsd: 0,
    unallocatedApiCostUsd: 0,
    humanEscalationsTotal: 0,
    pipelineUsdTotal: 0,
    inFlightUsdTotal: 0,
    launchedUsdTotal: 0,
    rejectedUsdTotal: 0,
    pipelineTokensTotal: 0,
    inFlightTokensTotal: 0,
    launchedTokensTotal: 0,
    rejectedTokensTotal: 0,
    launchTokensTotal: 0,
    governanceTokensTotal: 0,
    postLaunchSupportTokensTotal: 0,
    refundTokensTotal: 0,
    refundCountTotal: 0
  },
  pipelineCandidates: [],
  inFlightCandidates: [],
  launchedCandidates: [],
  rejectedCandidates: [],
  activeEscalation: {
    status: "none",
    scope: "build",
    candidateId: "",
    candidateLabel: "",
    candidateTitle: "",
    reason: "",
    recommendedAction: "",
    governanceFile: "governance/09_stage_dispatch_006.yaml"
  }
};
