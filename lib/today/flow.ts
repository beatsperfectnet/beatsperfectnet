import type { FlowStepId, StageGroup } from "./types";

export const stageLabels: Array<{ label: StageGroup; steps: FlowStepId[] }> = [
  {
    label: "market",
    steps: ["00_market_evidence"]
  },
  {
    label: "benchmark",
    steps: ["01_competitor_product_autopsy"]
  },
  {
    label: "architecture",
    steps: ["02_product_architecture_contract"]
  },
  {
    label: "scenarios",
    steps: ["03_scenario_matrix"]
  },
  {
    label: "readiness",
    steps: ["04_build_readiness_review"]
  },
  {
    label: "build",
    steps: ["05_product_build"]
  },
  {
    label: "artifact_qa",
    steps: ["06_real_artifact_inspection"]
  },
  {
    label: "walkthrough",
    steps: ["07_blind_buyer_walkthrough"]
  },
  {
    label: "listing",
    steps: ["08_listing_packaging_qa"]
  },
  {
    label: "launch",
    steps: ["09_founder_launch_gate"]
  },
  {
    label: "admission",
    steps: [
      "00_candidate_admission"
    ]
  },
  {
    label: "read",
    steps: [
      "01_public_shelf_read"
    ]
  },
  {
    label: "purchase",
    steps: ["02_mandatory_competitor_purchase"]
  },
  {
    label: "inspect",
    steps: ["03_hidden_buyer_experience_inspection"]
  },
  {
    label: "synthesis",
    steps: ["04_alignment_synthesis"]
  },
  {
    label: "spec",
    steps: ["05_one_promise_propagation_system_spec"]
  },
  {
    label: "build",
    steps: ["06_first_pass_connected_build"]
  },
  {
    label: "qa",
    steps: ["07_propagation_buyer_experience_product_visual_qa"]
  },
  {
    label: "founder_acceptance",
    steps: ["08_founder_acceptance_simulation"]
  },
  {
    label: "optional",
    steps: ["09_optional_supporting_feature_pass"]
  },
  {
    label: "listing",
    steps: ["10_listing_creative_assembly"]
  },
  {
    label: "gate",
    steps: ["11_listing_quality_gate"]
  },
  {
    label: "pre_mortem",
    steps: ["11b_pre_mortem_failure_analysis"]
  },
  {
    label: "launch",
    steps: ["12_delivery_launch"]
  },
  {
    label: "post_launch",
    steps: ["13_monthly_outcomes", "14_competitor_purchase_accounting", "15_kill_rules", "16_resource_allocation_rules", "17_company_metrics"]
  }
];

export function formatStepLabel(stepId: FlowStepId) {
  return stepId.replaceAll("_", " ");
}
