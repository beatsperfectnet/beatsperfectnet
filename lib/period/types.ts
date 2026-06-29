import type { FlowStepId, StageGroup } from "@/lib/today/types";

export type PeriodBucket = {
  date: string;
  launchedCount: number;
  readyForLaunchCount: number;
  rejectedCount: number;
  totalSpendUsd: number;
  buildSpendUsd: number;
  governanceApiCostUsd: number;
  otherSpendUsd: number;
};

export type PeriodState = {
  asOf?: string;
  from: string;
  to: string;
  dataMode: "mock" | "event-log";
  flowVersion: "FLOW-006" | "FLOW-007";
  flowTimeline?: Array<{
    stageGroup: StageGroup;
    stepIds: FlowStepId[];
  }>;
  totals: {
    launchedCount: number;
    readyForLaunchCount: number;
    rejectedCount: number;
    totalSpendUsd: number;
    buildSpendUsd: number;
    governanceApiCostUsd: number;
    otherSpendUsd: number;
  };
  buckets: PeriodBucket[];
};
