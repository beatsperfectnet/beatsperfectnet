export type PeriodBucket = {
  date: string;
  launchedCount: number;
  rejectedLaunchCount: number;
  avgModelTokensPerLaunch: number;
  avgUsdSpendPerLaunch: number;
  totalApiCostUsd: number;
  productApiCostUsd: number;
  governanceApiCostUsd: number;
  unallocatedApiCostUsd: number;
  humanEscalations: number;
  launchTokens: number;
  governanceTokens: number;
  postLaunchSupportTokens: number;
  refundTokens: number;
  refundCount: number;
};

export type PeriodState = {
  from: string;
  to: string;
  dataMode: "mock" | "event-log";
  flowVersion: "FLOW-005";
  rejectedLaunch?: {
    reviewId: string;
    candidateId: string;
    candidateTitle: string;
    reviewedAt: string;
    flowContractRef: string;
    status: string;
    decisionSummary: string;
    blockerSummary: string;
    evidenceRefs: string[];
  };
  totals: {
    launchedCount: number;
    rejectedLaunchCount: number;
    modelTokensTotal: number;
    launchTokensTotal: number;
    governanceTokensTotal: number;
    postLaunchSupportTokensTotal: number;
    refundTokensTotal: number;
    refundCountTotal: number;
    usdTotalSpend: number;
    totalApiCostUsd: number;
    productApiCostUsd: number;
    governanceApiCostUsd: number;
    unallocatedApiCostUsd: number;
    humanEscalationsTotal: number;
    avgModelTokensPerLaunch: number;
    avgUsdSpendPerLaunch: number;
  };
  buckets: PeriodBucket[];
};
