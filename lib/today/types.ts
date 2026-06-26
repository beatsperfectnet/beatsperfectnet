export type FlowStepId =
  | "00_candidate_admission"
  | "01_public_shelf_read"
  | "02_mandatory_competitor_purchase"
  | "03_hidden_buyer_experience_inspection"
  | "04_alignment_synthesis"
  | "05_one_promise_propagation_system_spec"
  | "06_first_pass_connected_build"
  | "07_propagation_buyer_experience_product_visual_qa"
  | "08_founder_acceptance_simulation"
  | "09_optional_supporting_feature_pass"
  | "10_listing_creative_assembly"
  | "11_listing_quality_gate"
  | "12_delivery_launch"
  | "13_monthly_outcomes"
  | "14_competitor_purchase_accounting"
  | "15_kill_rules"
  | "16_resource_allocation_rules"
  | "17_company_metrics";

export type StageGroup =
  | "admission"
  | "read"
  | "purchase"
  | "inspect"
  | "synthesis"
  | "spec"
  | "build"
  | "qa"
  | "founder_acceptance"
  | "optional"
  | "listing"
  | "gate"
  | "launch"
  | "post_launch";

export type Health = "green" | "yellow" | "red";

export type ProductHealth = {
  budgetHealth: Health;
  processHealth: Health;
};

export type TodayOutcomeStatus =
  | "pipeline"
  | "in_flight"
  | "launched"
  | "rejected_before_launch";

export type TodayCandidateSnapshot = {
  candidateId: string;
  candidateLabel: string;
  candidateTitle: string;
  outcomeStatus: TodayOutcomeStatus;
  currentStepId?: FlowStepId;
  currentStageGroup?: StageGroup;
  totalTokensUsed: number;
  totalUsdSpent: number;
  launchTokens: number;
  governanceTokens: number;
  postLaunchSupportTokens: number;
  refundTokens: number;
  refundCount: number;
  budgetHealth: Health;
  processHealth: Health;
  lastHealthBeforeExit?: {
    budgetHealth: Health;
    processHealth: Health;
  };
  terminalReason?: string;
};

export type TodayState = {
  asOf: string;
  dataMode: "mock" | "event-log";
  flowVersion: "FLOW-005" | "FLOW-006";
  flowTimeline?: Array<{
    stageGroup: StageGroup;
    stepIds: FlowStepId[];
  }>;
  todayLog?: Array<{
    id: string;
    kind: "product_cost" | "governance_cost" | "flow_transition" | "other";
    label: string;
    detail: string;
    amountUsd: number;
  }>;
  totals: {
    pipelineCandidates: number;
    inFlightCandidates: number;
    launchedCandidates: number;
    rejectedCandidates: number;
    totalSpendUsd: number;
    productApiCostUsd: number;
    governanceApiCostUsd: number;
    unallocatedApiCostUsd: number;
    humanEscalationsTotal: number;
    pipelineUsdTotal: number;
    inFlightUsdTotal: number;
    launchedUsdTotal: number;
    rejectedUsdTotal: number;
    pipelineTokensTotal: number;
    inFlightTokensTotal: number;
    launchedTokensTotal: number;
    rejectedTokensTotal: number;
    launchTokensTotal: number;
    governanceTokensTotal: number;
    postLaunchSupportTokensTotal: number;
    refundTokensTotal: number;
    refundCountTotal: number;
  };
  pipelineCandidates: TodayCandidateSnapshot[];
  inFlightCandidates: TodayCandidateSnapshot[];
  launchedCandidates: TodayCandidateSnapshot[];
  rejectedCandidates: TodayCandidateSnapshot[];
  activeEscalation: {
    status: "none" | "pending" | "sent" | "resolved";
    scope: "build" | "post_launch";
    candidateId: string;
    candidateLabel: string;
    candidateTitle: string;
    reason: string;
    recommendedAction: string;
    governanceFile?: string;
  };
};
