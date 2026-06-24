export type FlowStepId =
  | "00_candidate_admission"
  | "01_public_shelf_read"
  | "02_mandatory_competitor_purchase"
  | "03_hidden_buyer_experience_inspection"
  | "04_alignment_synthesis"
  | "05_one_promise_propagation_system_spec"
  | "06_first_pass_connected_build"
  | "07_propagation_buyer_experience_product_visual_qa"
  | "08_optional_supporting_feature_pass"
  | "09_listing_creative_assembly"
  | "10_listing_quality_gate"
  | "11_delivery_launch"
  | "12_monthly_outcomes"
  | "13_competitor_purchase_accounting"
  | "14_kill_rules"
  | "15_resource_allocation_rules"
  | "16_company_metrics";

export type StageGroup =
  | "admission"
  | "read"
  | "purchase"
  | "inspect"
  | "synthesis"
  | "spec"
  | "build"
  | "qa"
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
  flowVersion: "FLOW-005";
  flowTimeline?: Array<{
    stageGroup: StageGroup;
    stepIds: FlowStepId[];
  }>;
  totals: {
    pipelineCandidates: number;
    inFlightCandidates: number;
    launchedCandidates: number;
    rejectedCandidates: number;
    totalSpendUsd: number;
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
