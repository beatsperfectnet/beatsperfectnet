import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const repoRoot = process.cwd();

function loadYaml(relativePath) {
  return YAML.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

function loadText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(list, value, message) {
  assert(Array.isArray(list) && list.includes(value), message);
}

function assertFile(relativePath) {
  assert(fs.existsSync(path.join(repoRoot, relativePath)), `${relativePath} must exist`);
}

export function validateFlow007Contracts() {
  const active = loadYaml("config/active-flow.yaml");
  const flow = loadYaml("workflows/FLOW-007.yaml")["FLOW-007"];
  const schema = loadYaml("specs/SCHEMA-007.yaml")["SCHEMA-007"];
  const model = loadYaml("specs/MODEL-007.yaml")["MODEL-007"];
  const bls = loadYaml("specs/BLS-007.yaml")["BLS-007"];
  const budget = loadYaml("governance/08_product_generation_budget_007.yaml").product_generation_budget;
  const dispatch = loadYaml("governance/09_stage_dispatch_007.yaml").stage_dispatch;
  const pilotPolicy = loadYaml("governance/10_flow_007_pilot_policy.yaml").flow_007_pilot_policy;
  const learningLoop = loadYaml("governance/11_learning_loop.yaml").learning_loop;
  const governance = loadYaml("governance/05_governance_rules.yaml").governance_rules;
  const productLaneExclusions = loadYaml("governance/product_lane_exclusions.yaml").product_lane_exclusions;
  const admissionRules = loadYaml("governance/03_admission_rules.yaml").admission_rules;
  const validation = loadYaml("records/flow_007_validation/F7V-C-004-001.yaml").flow_007_validation;
  const failureCase = loadText("records/failure-cases/C-004-001-FLOW-006-postmortem.md");
  const companyMemoryText = loadText("docs/COMPANY-MEMORY.md");
  const c004FailedLabel = loadYaml("records/failed_product_labels/C-004-FAILED.yaml").failed_product_label;
  const c005FailedLabel = loadYaml("records/failed_product_labels/C-005-FAILED.yaml").failed_product_label;
  const failureIntakeTemplate = loadYaml("templates/failure-intake-template.yaml").failure_intake;
  const postmortemTemplate = loadYaml("templates/postmortem-template.yaml").postmortem;
  const learningFindingTemplate = loadYaml("templates/finding-template.yaml").finding;
  const flowPatchTemplate = loadYaml("templates/flow-patch-template.yaml").flow_patch;
  const regressionReplayTemplate = loadYaml("templates/regression-replay-template.yaml").regression_replay;
  const companyMemoryEntryTemplate = loadYaml("templates/company-memory-entry-template.yaml").company_memory_entry;
  const learningClosureTemplate = loadYaml("templates/learning-closure-template.yaml").learning_closure;
  const productSpecTemplate = loadYaml("templates/product-spec-template.yaml").product_spec;
  const buildManifestTemplate = loadYaml("templates/build-manifest-template.yaml").build_manifest;
  const failedProductLabelTemplate = loadYaml("templates/failed-product-label-template.yaml").failed_product_label;
  const ideasRunTemplate = loadYaml("templates/ideas-run-template.yaml").idea_run;
  const candidatesRunTemplate = loadYaml("templates/candidates-run-template.yaml").candidate_run;
  const companyMemoryPreflightTemplate = loadYaml("templates/company-memory-preflight-template.yaml").company_memory_preflight;
  const findingsLedgerTemplate = loadYaml("templates/findings-ledger-template.yaml").findings_ledger;
  const listingSpecTemplate = loadYaml("templates/listing-spec-template.yaml").listing_spec;
  const artifactInspectionTemplate = loadYaml("templates/actual-artifact-inspection-template.yaml").actual_artifact_inspection;
  const preMortemTemplate = loadYaml("templates/pre-mortem-failure-analysis-template.yaml").pre_mortem_failure_analysis;
  const launchGateTemplate = loadYaml("templates/launch-gate-template.yaml").launch_gate;
  const materialDeltaTemplate = loadYaml("templates/material-product-delta-template.yaml").material_product_delta;
  const ledgerTemplate = loadYaml("templates/model-run-ledger-template.yaml").model_run_ledger;
  const failureIntake = loadYaml("records/failures/FAIL-0001.yaml").failure_intake;
  const postmortem = loadYaml("records/postmortems/PMR-0001.yaml").postmortem;
  const learningFinding1 = loadYaml("records/findings/FND-0001.yaml").finding;
  const learningFinding2 = loadYaml("records/findings/FND-0002.yaml").finding;
  const learningFinding3 = loadYaml("records/findings/FND-0003.yaml").finding;
  const learningFinding4 = loadYaml("records/findings/FND-0004.yaml").finding;
  const flowPatch1 = loadYaml("records/flow_patches/FP-0001.yaml").flow_patch;
  const replay = loadYaml("records/regression_replays/RGR-0001.yaml").regression_replay;
  const closure = loadYaml("records/learning_closure/LCL-0001.yaml").learning_closure;

  assert(active.active_flow_id === "FLOW-007", "FLOW-007 must be active");
  assert(active.workflow_contract_ref === "workflows/FLOW-007.yaml", "Active workflow must point to FLOW-007");
  assert(governance.active_rule_contracts.flow === "FLOW-007", "Governance active flow must be FLOW-007");
  assert(governance.active_rule_contracts.schema === "SCHEMA-007", "Governance active schema must be SCHEMA-007");
  assert(governance.active_rule_contracts.learning_loop === "governance/11_learning_loop.yaml", "Governance active learning loop must point to LEARN-001");
  assertIncludes(governance.flow_rules, "FLOW_007_build_starts_only_when_build_readiness_status_is_BUILD_READY", "Governance must include BUILD_READY gate");
  assertIncludes(governance.flow_rules, "new_flow_007_runs_must_start_with_company_memory_preflight_and_findings_ledger", "Governance must require company memory preflight and findings ledger");
  assertIncludes(governance.flow_rules, "new_flow_007_runs_must_check_product_lane_exclusions_before_market_evidence", "Governance must require product lane exclusions before market evidence");
  assertIncludes(governance.flow_rules, "excluded_failed_product_asset_lanes_cannot_be_rerun_without_human_reopen_record", "Governance must block failed asset lane reruns without human reopen");
  assertIncludes(governance.flow_rules, "build_findings_cannot_be_closed_by_governance_wording_only", "Governance must separate build findings from governance wording");
  assertIncludes(governance.flow_rules, "governance_findings_cannot_be_closed_by_artifact_generation_only", "Governance must separate governance findings from artifact generation");
  assertIncludes(governance.flow_rules, "serious_flow_failures_must_trigger_LEARN_001_before_same_lane_repeat", "Governance must require LEARN-001 on serious failures");
  assertIncludes(governance.flow_rules, "active_company_memory_entries_must_map_to_owner_gate", "Governance must require active memory owner-gate mapping");
  assertIncludes(governance.flow_rules, "memory_entry_without_passed_regression_replay_cannot_be_ACTIVE", "Governance must block unproven active memory entries");

  for (const relativePath of [
    "docs/FLOW-007.md",
    "docs/FLOW-007-001.md",
    "governance/product_lane_exclusions.yaml",
    "governance/03_admission_rules.yaml",
    "templates/ideas-run-template.yaml",
    "templates/candidates-run-template.yaml",
    "records/failed_product_labels/C-004-FAILED.yaml",
    "records/failed_product_labels/C-005-FAILED.yaml",
    "templates/product-identity-reframe-template.yaml",
    "templates/target-audience-exploration-template.yaml",
    "templates/target-audience-lock-template.yaml",
    "templates/product-architecture-contract-template.yaml",
    "templates/failed-product-label-template.yaml",
    "templates/company-memory-preflight-template.yaml",
    "templates/findings-ledger-template.yaml",
    "templates/failure-intake-template.yaml",
    "templates/postmortem-template.yaml",
    "templates/finding-template.yaml",
    "templates/flow-patch-template.yaml",
    "templates/regression-replay-template.yaml",
    "templates/company-memory-entry-template.yaml",
    "templates/learning-closure-template.yaml",
    "templates/material-product-delta-template.yaml",
    "templates/competitor-autopsy-template.yaml",
    "templates/scenario-matrix-template.yaml",
    "templates/workbook-product-blueprint-template.yaml",
    "templates/build-readiness-review-template.yaml",
    "templates/actual-artifact-inspection-template.yaml",
    "templates/blind-buyer-walkthrough-template.yaml",
    "templates/pre-mortem-failure-analysis-template.yaml",
    "templates/launch-gate-template.yaml",
    "governance/10_flow_007_pilot_policy.yaml",
    "governance/11_learning_loop.yaml",
    "docs/LEARN-001.md",
    "records/failure-cases/C-004-001-FLOW-006-postmortem.md",
    "records/flow_007_validation/F7V-C-004-001.yaml",
    "records/failures/FAIL-0001.yaml",
    "records/postmortems/PMR-0001.yaml",
    "records/findings/FND-0001.yaml",
    "records/findings/FND-0002.yaml",
    "records/findings/FND-0003.yaml",
    "records/findings/FND-0004.yaml",
    "records/flow_patches/FP-0001.yaml",
    "records/regression_replays/RGR-0001.yaml",
    "records/learning_closure/LCL-0001.yaml",
  ]) {
    assertFile(relativePath);
  }

  const expectedSteps = [
    "00_market_evidence",
    "01_public_shelf_read",
    "02_target_audience_exploration",
    "03_competitor_selection_purchase_approval",
    "04_purchased_competitor_inspection",
    "05_target_audience_lock",
    "06_product_identity_reframe",
    "07_product_architecture_contract",
    "08_scenario_matrix",
    "09_workbook_or_product_blueprint",
    "10_build_readiness_review",
    "11_pre_build_architecture_premortem",
    "12_product_build",
    "13_real_artifact_inspection",
    "14_blind_buyer_walkthrough",
    "15_listing_packaging_qa",
    "16_pre_mortem_failure_analysis",
    "17_founder_launch_gate",
  ];
  assert(JSON.stringify(flow.flow.map((stage) => stage.step_id)) === JSON.stringify(expectedSteps), "FLOW-007 step sequence must match required market-derived architecture-first sequence");
  assert(flow.hard_rule === "Only candidates with build_readiness.status = BUILD_READY may enter product generation.", "FLOW-007 hard build rule missing");
  assert(flow.active_revision === "FLOW-007-001", "FLOW-007 active revision must be FLOW-007-001");
  assert(flow.pre_run?.required_before_step_id === "00_market_evidence", "FLOW-007 must require pre-run memory review before market evidence");
  assert(flow.pre_run?.learning_loop_ref === "governance/11_learning_loop.yaml", "FLOW-007 pre-run must cite LEARN-001");
  assert(flow.pre_run?.product_lane_exclusion_ref === "governance/product_lane_exclusions.yaml", "FLOW-007 pre-run must cite product lane exclusions");
  assert(flow.pre_run?.admission_rules_ref === "governance/03_admission_rules.yaml", "FLOW-007 pre-run must cite admission rules");
  assert(flow.pre_run?.ideas_run_template_ref === "templates/ideas-run-template.yaml", "FLOW-007 pre-run must cite ideas run template");
  assert(flow.pre_run?.candidate_run_template_ref === "templates/candidates-run-template.yaml", "FLOW-007 pre-run must cite candidate run template");
  assert(flow.pre_run?.canonical_failure_modes_catalog_ref === "workflows/FLOW-007.yaml#canonical_failure_modes", "FLOW-007 pre-run must cite canonical failure modes catalog");
  assert(flow.pre_run?.gate?.product_lane_exclusion_check_required === true, "FLOW-007 pre-run must require product lane exclusion check");
  assert(flow.pre_run?.gate?.fresh_idea_generation_required === true, "FLOW-007 pre-run must require fresh idea generation");
  assert(flow.pre_run?.gate?.fresh_candidate_admission_required_before_market_evidence === true, "FLOW-007 pre-run must require candidate admission before market evidence");
  assert(flow.pre_run?.gate?.multiple_viable_ideas_required_before_candidate_lock === true, "FLOW-007 pre-run must require multiple viable ideas before candidate lock");
  assert(flow.pre_run?.gate?.candidate_selection_rationale_required === true, "FLOW-007 pre-run must require candidate selection rationale");
  assert(flow.pre_run?.gate?.failed_product_labels_required_for_excluded_failed_asset_lanes === true, "FLOW-007 pre-run must require failed product labels for failed asset lanes");
  assert(flow.pre_run?.gate?.excluded_product_lane_blocks_run_before_market_evidence === true, "FLOW-007 pre-run must block excluded lanes before market evidence");
  assert(flow.pre_run?.gate?.company_memory_preflight_required === true, "FLOW-007 pre-run must require company memory preflight");
  assert(flow.pre_run?.gate?.findings_ledger_required === true, "FLOW-007 pre-run must require findings ledger");
  assert(flow.pre_run?.gate?.open_applicable_learning_failures_block_same_lane_run === true, "FLOW-007 pre-run must block open same-lane learning failures");
  assert(flow.pre_run?.gate?.active_company_memory_rules_must_map_to_owner_gate === true, "FLOW-007 pre-run must require active memory owner-gate mapping");
  assert(flow.pre_run?.gate?.memory_entry_without_regression_replay_cannot_be_active === true, "FLOW-007 pre-run must block active memory without replay");
  assert(flow.pre_run?.gate?.canonical_failure_modes_assessment_required === true, "FLOW-007 pre-run must require canonical failure mode assessment");
  assert(flow.pre_run?.gate?.every_canonical_failure_mode_must_be_assessed_before_market_evidence === true, "FLOW-007 pre-run must assess every canonical failure mode before market evidence");
  assert(flow.pre_run?.gate?.open_run_blockers_must_have_owner_gate_and_due_gate === true, "FLOW-007 pre-run must require owner and due gates for run blockers");
  assert(flow.pre_run?.gate?.build_findings_cannot_be_closed_by_governance_wording_only === true, "FLOW-007 pre-run must separate build findings from governance wording");
  assert(flow.pre_run?.gate?.governance_findings_cannot_be_closed_by_artifact_generation_only === true, "FLOW-007 pre-run must separate governance findings from artifact generation");
  assert(flow.on_failure?.trigger_learning_loop === "LEARN-001", "FLOW-007 must trigger LEARN-001 on failure");
  assert(flow.on_failure?.same_lane_next_run_blocked_until_learning_closure === true, "FLOW-007 must block same-lane reruns until closure");
  assert(Array.isArray(flow.canonical_failure_modes) && flow.canonical_failure_modes.length === 13, "FLOW-007 must define 13 canonical failure modes");
  assert(JSON.stringify(flow.canonical_failure_modes.map((entry) => entry.failure_mode_id)) === JSON.stringify([
    "EVIDENCE_TO_PRODUCT_LOCK_FAILURE",
    "BENCHMARK_ADEQUACY_FAILURE",
    "BUYER_CONTRACT_INCOMPLETENESS",
    "DOMAIN_MODEL_MISFIT",
    "DECISION_CONTRACT_FAILURE",
    "SCENARIO_MATRIX_FAILURE",
    "BLUEPRINT_BUILDER_INPUT_INVENTION",
    "PREMORTEM_REPEAT_PATH_FAILURE",
    "GOVERNANCE_WRAPPER_WITHOUT_MATERIAL_PRODUCT_DELTA",
    "FAILED_LANE_REUSE_WITHOUT_REOPEN",
    "TARGET_AUDIENCE_PRODUCT_INVERSION",
    "SCOPE_INFLATION_WITHOUT_EVIDENCE",
    "REAL_WORLD_DECISION_LAYER_UNDERFIT",
  ]), "FLOW-007 canonical failure mode set must match the enforced blocker catalog");

  assert(productLaneExclusions.enforcement?.applies_to_flow_007_pre_run === true, "Product lane exclusions must apply to FLOW-007 pre-run");
  assert(Array.isArray(admissionRules.tier_1?.reject_if) && admissionRules.tier_1.reject_if.includes("excluded_product_lane"), "Admission rules must reject excluded product lanes");
  assert(Array.isArray(admissionRules.candidate_creation?.requires) && admissionRules.candidate_creation.requires.includes("tier_1_passed"), "Candidate creation must require tier 1 pass");
  assert(productLaneExclusions.enforcement?.reopen_requires_human_approval === true, "Product lane exclusions must require human reopen approval");
  assertIncludes(productLaneExclusions.enforcement?.hard_rules, "every_new_flow_007_run_must_check_this_file_before_market_evidence", "Product lane exclusions must be checked before market evidence");
  const inventoryLane = productLaneExclusions.lanes.find((lane) => lane.lane_id === "inventory_tracker_reorder_workbook");
  const pricingLane = productLaneExclusions.lanes.find((lane) => lane.lane_id === "etsy_pricing_decision_workbook");
  assert(inventoryLane, "Inventory tracker/reorder workbook lane exclusion missing");
  assert(pricingLane, "Etsy pricing decision workbook lane exclusion missing");
  assert(inventoryLane.excluded_from_flow_007_pre_run === true, "Inventory tracker lane must be excluded from FLOW-007 pre-run");
  assert(pricingLane.excluded_from_flow_007_pre_run === true, "Etsy pricing decision lane must be excluded from FLOW-007 pre-run");
  assertIncludes(inventoryLane.source_candidate_refs, "C-004-001", "Inventory tracker lane must include C-004-001");
  assertIncludes(inventoryLane.source_candidate_refs, "C-005-001", "Inventory tracker lane must include C-005-001");
  assertIncludes(pricingLane.source_candidate_refs, "C-011-001", "Etsy pricing decision lane must include C-011-001");
  assert(pricingLane.status === "excluded_by_ready_to_publish_candidate", "Etsy pricing decision lane must be marked ready-to-publish");
  assertIncludes(pricingLane.source_refs, "records/candidates/R-011.yaml", "Etsy pricing decision lane must cite the candidate run");
  assertIncludes(pricingLane.source_refs, "records/validation/FLG-C-011-001.yaml", "Etsy pricing decision lane must cite the launch gate");
  assertIncludes(pricingLane.product_asset_refs, "builds/C-011-001/product/Etsy-Pricing-Decision-Planner.xlsx", "Etsy pricing decision lane must cite the workbook asset");
  assertIncludes(pricingLane.keyword_match_terms, "etsy fee calculator", "Etsy pricing decision lane must block fee-calculator reruns");
  assertIncludes(inventoryLane.failed_product_label_refs, "records/failed_product_labels/C-004-FAILED.yaml", "Inventory tracker lane must include C-004 failed label");
  assertIncludes(inventoryLane.failed_product_label_refs, "records/failed_product_labels/C-005-FAILED.yaml", "Inventory tracker lane must include C-005 failed label");
  assertIncludes(inventoryLane.failed_product_asset_refs, "archive/candidates/C-005-001/C-005-001-FAILED/product/Inventory-Tracker-Studio.xlsx", "Inventory tracker lane must include archived C-005 failed workbook");
  assertIncludes(inventoryLane.keyword_match_terms, "reorder planner", "Inventory tracker lane must block reorder planner reruns");

  const marketEvidence = flow.flow.find((stage) => stage.step_id === "00_market_evidence");
  assert(marketEvidence.action.includes("start_from_category_or_market_thesis_not_locked_product_direction"), "Market evidence must start from category/thesis, not locked product direction");
  assert(marketEvidence.gate.product_direction_must_be_derived_from_market_evidence_or_marked_unproven === true, "Market evidence must derive product direction");
  assert(model.stage_quality_rules.market_evidence.hard_rule.includes("fresh idea-generation pass"), "MODEL-007 market evidence must require fresh idea generation");
  assertIncludes(model.stage_quality_rules.market_evidence.fail_if, "fresh_idea_generation_or_candidate_selection_record_missing", "MODEL-007 market evidence must reject missing idea generation");
  assertIncludes(model.stage_quality_rules.market_evidence.fail_if, "candidate_was_carried_forward_without_fresh_idea_set", "MODEL-007 market evidence must reject direct carryforward without ideas");
  const publicShelfRead = flow.flow.find((stage) => stage.step_id === "01_public_shelf_read");
  assert(publicShelfRead.gate.gallery_or_thumbnail_evidence_required_or_escalated === true, "Public shelf read must require visual evidence or escalation");
  const targetAudienceExploration = flow.flow.find((stage) => stage.step_id === "02_target_audience_exploration");
  assert(targetAudienceExploration.gate.target_audience_exploration_status_required === "PASS", "Target audience exploration must require PASS");
  assert(targetAudienceExploration.gate.minimum_candidate_tas_required >= 2, "Target audience exploration must require at least 2 candidate TAs");
  assert(targetAudienceExploration.gate.at_least_one_grounded_evidence_ref_per_surviving_ta === true, "Target audience exploration must require grounded evidence refs");
  assert(targetAudienceExploration.gate.preliminary_primary_ta_required === true, "Target audience exploration must require a preliminary primary TA");
  assert(targetAudienceExploration.gate.jtbd_must_be_buyer_behavior_not_product_description === true, "Target audience exploration must reject product-description JTBD");
  const competitorSelection = flow.flow.find((stage) => stage.step_id === "03_competitor_selection_purchase_approval");
  assert(competitorSelection.gate.exactly_one_competitor_by_default === true, "Competitor selection must purchase exactly one competitor by default");
  assert(competitorSelection.action.includes("select_from_evidence_backed_candidate_set_only"), "Competitor selection must use evidence-backed market set");
  const purchasedInspection = flow.flow.find((stage) => stage.step_id === "04_purchased_competitor_inspection");
  assert(purchasedInspection.output_file_template === "records/competitor_autopsy/AUT-XXXX.yaml", "Purchased competitor inspection must write AUT competitor autopsy records");
  assert(purchasedInspection.gate.benchmark_adequacy_final_review_required === true, "Purchased competitor inspection must require benchmark adequacy final review");
  assert(purchasedInspection.gate.benchmark_adequacy_final_review_status_required === "PASS", "Purchased competitor inspection must require PASS benchmark adequacy review");
  assert(purchasedInspection.gate.benchmark_adequacy_final_review_model_required === "gpt-5.5", "Purchased competitor inspection must require gpt-5.5 final adequacy review");
  assert(purchasedInspection.frontier_review_ref === "MODEL-007.frontier_required.competitor_benchmark_adequacy_review", "Purchased competitor inspection must reference frontier benchmark adequacy review");
  assert(purchasedInspection.gate.unresolved_benchmark_adequacy_blocks_architecture === true, "Unresolved benchmark adequacy must block architecture");
  assert(purchasedInspection.gate.real_world_decision_layer_extraction_required === true, "Purchased competitor inspection must require real-world decision-layer extraction");
  const targetAudienceLock = flow.flow.find((stage) => stage.step_id === "05_target_audience_lock");
  assert(targetAudienceLock.gate.target_audience_lock_status_required === "PASS", "Target audience lock must require PASS");
  assert(targetAudienceLock.gate.exactly_one_primary_ta_locked === true, "Target audience lock must lock exactly one primary TA");
  assert(targetAudienceLock.gate.locked_ta_evidence_from_both_exploration_and_inspection === true, "Target audience lock must require evidence from both exploration and inspection");
  assert(targetAudienceLock.gate.locked_jtbd_is_buyer_behavior_not_product_description === true, "Target audience lock must enforce buyer-behavior JTBD");
  assert(targetAudienceLock.gate.real_world_decision_objective_required === true, "Target audience lock must require real-world decision objective");
  assert(targetAudienceLock.gate.terminal_success_measure_required === true, "Target audience lock must require terminal success measure");
  assert(targetAudienceLock.gate.target_audience_lock_required_before_product_identity_reframe === true, "Target audience lock must gate product identity reframe");
  const productIdentity = flow.flow.find((stage) => stage.step_id === "06_product_identity_reframe");
  assert(productIdentity.gate.product_identity_status_required === "PASS", "Product identity reframe must require PASS");
  const productArchitecture = flow.flow.find((stage) => stage.step_id === "07_product_architecture_contract");
  assert(productArchitecture.gate.product_class_delta_required_before_PAC === true, "PAC must require product class delta before approval");
  assert(productArchitecture.gate.applicable_canonical_failure_modes_must_be_mapped_into_contract_or_later_gate === true, "PAC must map applicable canonical failure modes");
  assert(productArchitecture.gate.real_world_decision_layer_required_when_implied_by_evidence === true, "PAC must require real-world decision layer when implied by evidence");
  assert(productArchitecture.gate.intermediate_vs_terminal_metric_classification_required === true, "PAC must classify intermediate vs terminal metrics");
  assert(productArchitecture.gate.terminal_decision_outputs_required_when_domain_evidence_implies_them === true, "PAC must require terminal decision outputs when implied");
  assertIncludes(productArchitecture.action, "define_exact_trigger_moment_capability_band_and_current_workaround_for_primary_buyer", "PAC must define exact trigger moment, capability band, and current workaround");
  assertIncludes(productArchitecture.action, "define_assumed_prior_knowledge_and_irreducible_value_after_that_knowledge", "PAC must define prior knowledge and irreducible value");
  assertIncludes(productArchitecture.action, "define_real_world_decision_objective_decision_altitude_and_terminal_success_measure", "PAC must define real-world decision objective and terminal success measure");
  assertIncludes(productArchitecture.action, "define_domain_evidence_in_terms_of_intermediate_metrics_terminal_metrics_and_aggregation_layer", "PAC must define domain evidence in terms of intermediate and terminal metrics");
  assertIncludes(productArchitecture.action, "reject_scope_that_solves_only_an_intermediate_metric_without_reaching_the_real_world_decision_layer", "PAC must reject intermediate-only scope");
  const scenarioMatrix = flow.flow.find((stage) => stage.step_id === "08_scenario_matrix");
  assert(scenarioMatrix.gate.numeric_truth_table_required_when_product_is_spreadsheet_or_calculator === true, "Scenario matrix must require numeric truth tables for spreadsheets");
  assert(scenarioMatrix.gate.scenario_fixtures_required_before_build === true, "Scenario matrix must require fixtures before build");
  const blueprint = flow.flow.find((stage) => stage.step_id === "09_workbook_or_product_blueprint");
  assert(blueprint.gate.product_blueprint_status_required === "PASS", "Workbook blueprint must require PASS");
  const buildReadiness = flow.flow.find((stage) => stage.step_id === "10_build_readiness_review");
  assert(buildReadiness.gate.build_readiness_status_required === "BUILD_READY", "Build readiness gate must require BUILD_READY");
  assert(buildReadiness.gate.only_build_ready_candidates_may_enter_product_generation === true, "Build readiness must be the product generation gate");
  assert(buildReadiness.gate.company_memory_preflight_pass_required === true, "Build readiness must require company memory preflight pass");
  assert(buildReadiness.gate.open_applicable_findings_must_have_owner_gate_before_build === true, "Build readiness must require owner gates for open findings");
  assert(buildReadiness.gate.builder_input_completeness_status_required === "PASS", "Build readiness must require builder input completeness");
  assert(buildReadiness.gate.no_open_run_blockers_due_by_build_readiness === true, "Build readiness must block open run blockers due before build");
  assert(buildReadiness.gate.real_world_decision_layer_reached_or_explicitly_blocked === true, "Build readiness must verify real-world decision layer reached or blocked");
  assert(buildReadiness.gate.terminal_decision_outputs_present_when_implied === true, "Build readiness must verify terminal decision outputs when implied");
  const preBuild = flow.flow.find((stage) => stage.step_id === "11_pre_build_architecture_premortem");
  assert(preBuild.gate.no_same_failed_product_path_remaining === true, "Pre-build premortem must block same failed path");
  assert(preBuild.gate.premortem_repeat_path_failure_mode_closed_required === true, "Pre-build premortem must close repeat-path blocker");
  const productBuild = flow.flow.find((stage) => stage.step_id === "12_product_build");
  assert(productBuild.gate.build_readiness_status_must_equal_BUILD_READY === true, "Product build must hard-check BUILD_READY");
  assert(productBuild.gate.builder_input_completeness_status_required === "PASS", "Product build must require builder input completeness");
  assert(productBuild.gate.product_identity_consumed_required === true, "Product build must consume product identity reframe");
  assert(productBuild.gate.scenario_fixtures_consumed_required === true, "Product build must consume scenario fixtures");
  assert(productBuild.gate.product_blueprint_consumed_required === true, "Product build must consume workbook blueprint");
  assert(productBuild.gate.pre_build_architecture_premortem_pass_required === true, "Product build must require pre-build architecture premortem");
  assert(productBuild.gate.buyer_behavior_contract_consumed_required === true, "Product build must consume buyer behavior contract");
  assert(productBuild.gate.visible_human_scale_capacity_required === true, "Product build must require visible human-scale capacity");
  assert(productBuild.gate.measured_prior_failed_artifact_delta_manifest_required_when_applicable === true, "Product build must require measured prior failed artifact delta when applicable");
  assert(productBuild.gate.no_clone_build_required === true, "Product build must reject clone builds");
  const artifactInspectionStage = flow.flow.find((stage) => stage.step_id === "13_real_artifact_inspection");
  assert(artifactInspectionStage.gate.executable_adversarial_scenario_mutations_required === true, "Artifact inspection must require executable adversarial mutations");
  assert(artifactInspectionStage.gate.architecture_vs_implementation_classification_required === true, "Artifact inspection must require architecture vs implementation classification");
  assert(artifactInspectionStage.gate.prose_only_qa_forbidden === true, "Artifact inspection must forbid prose-only QA");
  assert(artifactInspectionStage.gate.material_product_delta_against_failed_baseline_required_when_applicable === true, "Artifact inspection must require material delta against failed baseline when applicable");
  assert(artifactInspectionStage.action.includes("run_prior_failed_baseline_delta_inspector_when_applicable"), "Artifact inspection must run prior failed baseline delta inspector");
  const preMortemStage = flow.flow.find((stage) => stage.step_id === "16_pre_mortem_failure_analysis");
  assert(preMortemStage.gate.unsupported_scope_expansion_forbidden === true, "Pre-mortem must forbid unsupported scope expansion");
  assert(preMortemStage.gate.evidence_assumption_audit_required === true, "Pre-mortem must require evidence-assumption audit");
  assert(preMortemStage.gate.attempt_tracking_required === true, "Pre-mortem must require attempt tracking");
  assert(preMortemStage.gate.attempt_2_must_compare_prior_attempt === true, "Pre-mortem must compare prior attempt on attempt 2");
  assert(preMortemStage.gate.rebuild_recommended_forbidden_on_attempt_2 === true, "Pre-mortem must not return rebuild_recommended on attempt 2");
  assert(preMortemStage.gate.redundant_features_without_human_approval_block_launch === true, "Pre-mortem must block redundant features without human approval");
  const launchGateStage = flow.flow.find((stage) => stage.step_id === "17_founder_launch_gate");
  assert(launchGateStage.gate.cost_outcome_accountability_required === true, "Launch gate must require cost/outcome accountability");
  assert(launchGateStage.gate.measured_material_product_delta_required_when_applicable === true, "Launch gate must require measured material product delta when applicable");
  assert(launchGateStage.gate.governance_only_delta_cannot_pass_launch === true, "Launch gate must reject governance-only delta");
  assert(launchGateStage.gate.no_open_run_blockers_due_by_launch === true, "Launch gate must reject open run blockers due by launch");
  assert(launchGateStage.gate.assumption_red_team_required === true, "Launch gate must require assumption red-team");
  assert(launchGateStage.gate.phase_1_must_complete_before_phase_2 === true, "Launch gate must complete phase 1 before phase 2");
  assert(launchGateStage.gate.attempt_tracking_required === true, "Launch gate must require attempt tracking");
  assert(launchGateStage.gate.attempt_1_failure_must_return_REBUILD_REQUIRED === true, "Launch gate attempt 1 failure must return REBUILD_REQUIRED");
  assert(launchGateStage.gate.attempt_2_failure_must_return_REJECTED_ESCALATE === true, "Launch gate attempt 2 failure must return REJECTED_ESCALATE");
  assert(launchGateStage.gate.max_attempts === 2, "Launch gate max attempts must be 2");
  assert(launchGateStage.gate.rebuild_instruction_required_when_REBUILD_REQUIRED === true, "Launch gate must require rebuild instructions on REBUILD_REQUIRED");
  assert(launchGateStage.gate.escalation_detail_required_when_REJECTED_ESCALATE === true, "Launch gate must require escalation detail on REJECTED_ESCALATE");
  assert(launchGateStage.gate.if_launch_rejected_then_LEARN_001_required === true, "Launch rejection must require LEARN-001");

  for (const status of [
    "IDEA_RECEIVED",
    "MARKET_REJECTED",
    "MARKET_INSUFFICIENT",
    "BENCHMARK_INSUFFICIENT",
    "TARGET_CONTRACT_FAILED",
    "DOMAIN_MODEL_FAILED",
    "DECISION_OUTPUT_FAILED",
    "SCENARIO_MATRIX_FAILED",
    "PRODUCT_IDENTITY_FAILED",
    "PRODUCT_BLUEPRINT_FAILED",
    "BUILDER_INPUT_INCOMPLETE",
    "PRE_BUILD_ARCHITECTURE_PREMORTEM_FAILED",
    "SAME_FAILED_PRODUCT_CLASS_BLOCKED",
    "NOT_BUILD_READY",
    "BUILD_READY",
    "BUILT_QA_FAILED_IMPLEMENTATION",
    "BUILT_QA_FAILED_IMPLEMENTATION_AFTER_REPAIR",
    "BUILT_QA_FAILED_ARCHITECTURE",
    "LISTING_FAILED",
    "FOUNDER_REJECTED",
    "LAUNCH_GATE_FAILED",
    "COST_OVERRUN",
    "REPEATED_RERUN_WITH_NO_MATERIAL_DELTA",
    "FAILURE_INTAKE_REQUIRED",
    "POSTMORTEM_REQUIRED",
    "FINDINGS_EXTRACTION_REQUIRED",
    "FLOW_PATCH_REQUIRED",
    "REGRESSION_REPLAY_REQUIRED",
    "COMPANY_MEMORY_UPDATE_REQUIRED",
    "ACTIVE_GUARD_REQUIRED",
    "FAILURE_CLOSED",
    "LAUNCH_READY",
    "REBUILD_REQUIRED",
    "REJECTED_ESCALATE",
    "LAUNCHED",
    "FLOW_006_FAILURE_CASE",
  ]) {
    assertIncludes(schema.allowed_statuses, status, `${status} status missing from schema`);
    assertIncludes(bls.statuses, status, `${status} status missing from BLS`);
  }

  const pac = loadYaml("templates/product-architecture-contract-template.yaml").product_architecture_contract;
  for (const section of [
    "product_identity_reframe",
    "market_evidence",
    "competitor_autopsy",
    "target_audience_contract",
    "buyer_behavior_contract",
    "domain_model_contract",
    "decision_output_contract",
    "canonical_failure_mode_resolution",
    "failure_baseline_and_material_delta",
    "scenario_matrix",
    "support_risk",
    "build_readiness",
  ]) {
    assert(pac[section], `${section} missing from Product Architecture Contract template`);
    assert("status" in pac[section], `${section} must include status`);
    assert("required_fields" in pac[section], `${section} must include required_fields`);
    assert("pass_fail_criteria" in pac[section], `${section} must include pass_fail_criteria`);
    assert("blockers" in pac[section], `${section} must include blockers`);
  }
  assertIncludes(pac.product_identity_reframe.required_fields, "market_category_label", "PAC must require product identity reframe fields");
  assertIncludes(pac.product_identity_reframe.required_fields, "required_product_class_delta", "PAC must require product class delta");
  assertIncludes(pac.product_identity_reframe.pass_fail_criteria.pass, "product_identity_is_not_the_market_category_label", "PAC must require identity not equal market category");
  assertIncludes(pac.scenario_matrix.required_fields, "scenario_id", "PAC must require executable scenario ids");
  assertIncludes(pac.scenario_matrix.required_fields, "expected_outputs", "PAC must require expected outputs in scenario matrix");
  assertIncludes(pac.build_readiness.required_fields, "builder_input_completeness", "PAC must require builder input completeness");
  assertIncludes(pac.build_readiness.allowed_statuses, "BUILD_READY", "PAC must allow BUILD_READY");
  assertIncludes(pac.build_readiness.allowed_statuses, "NOT_BUILD_READY", "PAC must allow NOT_BUILD_READY");
  assertIncludes(pac.target_audience_contract.required_fields, "data_maturity_segments", "PAC must require data maturity segments");
  assertIncludes(pac.target_audience_contract.required_fields, "exact_trigger_moment", "PAC must require exact trigger moment");
  assertIncludes(pac.target_audience_contract.required_fields, "current_workaround", "PAC must require current workaround");
  assertIncludes(pac.target_audience_contract.required_fields, "expertise_floor", "PAC must require expertise floor");
  assertIncludes(pac.target_audience_contract.required_fields, "expertise_ceiling", "PAC must require expertise ceiling");
  assertIncludes(pac.target_audience_contract.required_fields, "assumed_prior_knowledge", "PAC must require assumed prior knowledge");
  assertIncludes(pac.target_audience_contract.required_fields, "product_value_after_prior_knowledge", "PAC must require product value after prior knowledge");
  assertIncludes(pac.target_audience_contract.pass_fail_criteria.pass, "target_audience_has_specific_trigger_moment_and_capability_band", "PAC target audience must require trigger moment and capability band");
  assertIncludes(pac.target_audience_contract.pass_fail_criteria.pass, "product_value_remains_material_after_assumed_prior_knowledge", "PAC target audience must require material value after prior knowledge");
  assertIncludes(pac.target_audience_contract.pass_fail_criteria.fail, "audience_collapses_novice_and_expert_without_distinct_product_behavior_or_explicit_exclusion", "PAC target audience must reject mixed novice/expert audience");
  assertIncludes(pac.target_audience_contract.pass_fail_criteria.fail, "product_is_only_a_faster_calculator_or_data_entry_shell_for_declared_buyer", "PAC target audience must reject weak calculator-only value");
  assertIncludes(pac.buyer_behavior_contract.required_fields, "repeated_usage_loop", "PAC must require repeated usage loop");
  assertIncludes(pac.buyer_behavior_contract.required_fields, "before_product_decision_workaround", "PAC must require before-product workaround");
  assertIncludes(pac.buyer_behavior_contract.required_fields, "after_product_decision_delta", "PAC must require after-product decision delta");
  assertIncludes(pac.buyer_behavior_contract.required_fields, "buyer_behavior_to_input_transformation_output_map", "PAC must require buyer behavior mapping");
  assertIncludes(pac.buyer_behavior_contract.pass_fail_criteria.pass, "product_changes_the_decision_quality_speed_or_consistency_vs_the_current_workaround", "PAC buyer behavior must require decision improvement vs workaround");
  assertIncludes(pac.buyer_behavior_contract.pass_fail_criteria.fail, "product_only_reformats_inputs_the_buyer_already_knows_how_to_resolve_without_meaningful_decision_help", "PAC buyer behavior must reject weak reformat-only value");
  assertIncludes(pac.domain_model_contract.required_fields, "dated_events", "PAC must require dated events");
  assertIncludes(pac.domain_model_contract.required_fields, "domain_invariants", "PAC must require domain invariants");
  assertIncludes(pac.decision_output_contract.required_fields, "machine_checkable_output_locations", "PAC must require machine-checkable output locations");
  assert(pac.canonical_failure_modes_catalog_ref === "workflows/FLOW-007.yaml#canonical_failure_modes", "PAC template must cite canonical failure mode catalog");
  assert(pac.canonical_failure_mode_resolution, "PAC must include canonical failure mode resolution");
  assertIncludes(pac.canonical_failure_mode_resolution.required_fields, "failure_mode_id", "PAC failure mode resolution must track failure mode ID");
  assertIncludes(pac.canonical_failure_mode_resolution.required_fields, "owner_stage", "PAC failure mode resolution must track owner stage");
  assertIncludes(pac.decision_output_contract.c004_required_outputs, "suggested order quantity", "C-004 outputs must include suggested order quantity");
  assertIncludes(pac.failure_baseline_and_material_delta.required_fields, "prior_failed_baseline_refs", "PAC must require prior failed baseline refs");
  assertIncludes(pac.failure_baseline_and_material_delta.required_fields, "governance_only_delta", "PAC must identify governance-only deltas");
  assert(pac.company_memory_preflight_ref === null, "PAC template must cite company memory preflight");
  assert(pac.findings_ledger_ref === null, "PAC template must cite findings ledger");
  assertIncludes(pac.build_readiness.required_fields, "visible_human_scale_capacity_floor", "PAC must require visible capacity floor before build readiness");
  assertIncludes(pac.build_readiness.required_fields, "artifact_acceptance_tests", "PAC must require artifact acceptance tests before build readiness");
  assertIncludes(pac.build_readiness.required_fields, "builder_input_completeness", "PAC must require builder input completeness before build readiness");
  assertIncludes(pac.build_readiness.required_fields, "applicable_company_memory_findings_consumed", "PAC must consume applicable company memory findings");
  assertIncludes(pac.build_readiness.required_fields, "run_blocker_resolution", "PAC must require run blocker resolution before build readiness");

  assertIncludes(companyMemoryPreflightTemplate.fail_if, "company_memory_not_read", "Company memory preflight must fail if company memory was not read");
  assertIncludes(companyMemoryPreflightTemplate.fail_if, "product_lane_exclusion_file_not_checked", "Company memory preflight must fail if product lane exclusions were not checked");
  assertIncludes(companyMemoryPreflightTemplate.fail_if, "matched_failed_product_asset_lane_without_failed_product_label_records", "Company memory preflight must require failed product labels for matched failed asset lanes");
  assertIncludes(companyMemoryPreflightTemplate.fail_if, "candidate_matches_excluded_product_lane_without_human_reopen_record", "Company memory preflight must block excluded product lane matches without reopen");
  assert(companyMemoryPreflightTemplate.idea_run_ref === null, "Company memory preflight must cite idea run");
  assert(companyMemoryPreflightTemplate.candidate_run_ref === null, "Company memory preflight must cite candidate run");
  assertIncludes(companyMemoryPreflightTemplate.fail_if, "fresh_idea_generation_missing", "Company memory preflight must reject missing fresh idea generation");
  assertIncludes(companyMemoryPreflightTemplate.fail_if, "fewer_than_required_distinct_ideas_without_market_exhaustion_reason", "Company memory preflight must reject insufficient idea set");
  assertIncludes(companyMemoryPreflightTemplate.fail_if, "candidate_selected_without_why_this_not_that_rationale", "Company memory preflight must reject missing candidate rationale");
  assertIncludes(companyMemoryPreflightTemplate.fail_if, "applicable_prior_failure_lesson_not_classified", "Company memory preflight must classify prior failure lessons");
  assert(companyMemoryPreflightTemplate.learning_loop_ref === "governance/11_learning_loop.yaml", "Company memory preflight must cite LEARN-001");
  assert(Array.isArray(companyMemoryPreflightTemplate.applicable_open_learning_failures), "Company memory preflight must track open learning failures");
  assert(Array.isArray(companyMemoryPreflightTemplate.same_lane_learning_blockers), "Company memory preflight must track same-lane learning blockers");
  assert("owner_gate" in companyMemoryPreflightTemplate.applicable_memory_entries[0], "Company memory preflight must map active memory to owner gate");
  assertIncludes(companyMemoryPreflightTemplate.fail_if, "applicable_active_memory_rule_missing_owner_gate", "Company memory preflight must fail without active memory owner-gate mapping");
  assertIncludes(companyMemoryPreflightTemplate.fail_if, "active_memory_entry_missing_passed_regression_replay", "Company memory preflight must fail without replay-backed activation");
  assertIncludes(companyMemoryPreflightTemplate.fail_if, "same_failed_lane_has_open_learning_closure", "Company memory preflight must fail when same-lane learning closure is open");
  assert(companyMemoryPreflightTemplate.canonical_failure_modes_catalog_ref === "workflows/FLOW-007.yaml#canonical_failure_modes", "Company memory preflight must cite canonical failure mode catalog");
  assert(Array.isArray(companyMemoryPreflightTemplate.canonical_failure_modes_assessment), "Company memory preflight must assess canonical failure modes");
  assertIncludes(companyMemoryPreflightTemplate.fail_if, "canonical_failure_mode_not_assessed", "Company memory preflight must fail if a canonical failure mode is not assessed");
  assertIncludes(companyMemoryPreflightTemplate.fail_if, "open_run_blocker_missing_owner_gate_or_due_gate", "Company memory preflight must fail if a run blocker lacks owner or due gate");
  assertIncludes(companyMemoryPreflightTemplate.fail_if, "build_finding_closed_by_governance_wording_only", "Company memory preflight must reject build findings closed by governance wording");
  assert(findingsLedgerTemplate.closure_rules.build_findings_cannot_be_closed_by_governance_wording_only === true, "Findings ledger must keep build findings out of governance-only closure");
  assert(findingsLedgerTemplate.closure_rules.governance_findings_cannot_be_closed_by_artifact_generation_only === true, "Findings ledger must keep governance findings out of artifact-only closure");
  assert(findingsLedgerTemplate.closure_rules.open_applicable_findings_must_be_carried_to_launch_gate === true, "Findings ledger must carry open applicable findings to launch");
  assert(findingsLedgerTemplate.canonical_failure_modes_catalog_ref === "workflows/FLOW-007.yaml#canonical_failure_modes", "Findings ledger must cite canonical failure mode catalog");
  assert(Array.isArray(findingsLedgerTemplate.run_blockers), "Findings ledger must define run blockers");
  assert(findingsLedgerTemplate.closure_rules.required_pre_build_run_blockers_must_be_resolved_before_BUILD_READY === true, "Findings ledger must resolve pre-build run blockers before BUILD_READY");
  assert(findingsLedgerTemplate.closure_rules.no_open_run_blocker_due_by_gate_can_be_ignored === true, "Findings ledger must forbid ignoring due run blockers");
  assert(findingsLedgerTemplate.learning_loop_ref === "governance/11_learning_loop.yaml", "Findings ledger must cite LEARN-001");
  assert(Array.isArray(findingsLedgerTemplate.applicable_memory_rule_gate_map), "Findings ledger must map memory rules to gates");
  assert(Array.isArray(findingsLedgerTemplate.open_learning_failure_refs), "Findings ledger must track open learning failures");
  assert(findingsLedgerTemplate.closure_rules.open_applicable_learning_failures_block_same_lane_run === true, "Findings ledger must block same-lane reruns while learning closure is open");
  assert(findingsLedgerTemplate.closure_rules.memory_entry_without_regression_replay_cannot_be_active === true, "Findings ledger must block unproven active memory");
  assert(failureIntakeTemplate.gate.failure_record_required === true, "Failure intake template must require a record");
  assert(postmortemTemplate.required_model === "gpt-5.5", "Serious postmortem template must require gpt-5.5");
  assert(learningFindingTemplate.hard_rules.governance_findings_cannot_be_closed_by_rebuilding_an_artifact === true, "Learning findings must reject artifact-only closure for governance failures");
  assert(flowPatchTemplate.gate.patch_targets_required === true, "Flow patch template must require patch targets");
  assert(regressionReplayTemplate.gate.no_build_allowed_during_regression_replay_if_expected_no_build === true, "Regression replay template must block build when not expected");
  assert(companyMemoryEntryTemplate.status === "ACTIVE", "Company memory entry template must default to ACTIVE");
  assertIncludes(learningClosureTemplate.allowed_statuses, "FAILURE_CLOSED", "Learning closure template must allow FAILURE_CLOSED");
  assert(failedProductLabelTemplate.canonical_status === "FAILED_PRODUCT_ASSET", "Failed product label template must use FAILED_PRODUCT_ASSET status");
  assert(ideasRunTemplate.flow_version === "FLOW-007", "Ideas run template must target FLOW-007");
  assert(ideasRunTemplate.minimum_distinct_ideas_required === 3, "Ideas run template must require 3 distinct ideas");
  assert(ideasRunTemplate.direct_carryforward_rejected_without_fresh_idea_generation === true, "Ideas run template must reject direct carryforward");
  assert(candidatesRunTemplate.flow_version === "FLOW-007", "Candidates run template must target FLOW-007");
  assert(candidatesRunTemplate.reject_if_candidate_is_direct_carryforward_without_fresh_idea_set === true, "Candidate run template must reject direct carryforward without ideas");
  for (const label of [c004FailedLabel, c005FailedLabel]) {
    assert(label.status === "ACTIVE_FAILED_LABEL", `${label.label_id} must be an active failed label`);
    assert(label.product_lane_id === "inventory_tracker_reorder_workbook", `${label.label_id} must map to inventory tracker lane`);
  assert(label.failed_asset_refs.every((assetRef) => assetRef.startsWith("archive/candidates/")), `${label.label_id} failed assets must point to archive/candidates`);
  assertIncludes(label.future_build_input_policy.may_be_used_as, "failed_baseline", `${label.label_id} must be usable as failed baseline`);
    assertIncludes(label.future_build_input_policy.must_not_be_used_as, "product_blueprint", `${label.label_id} must not be usable as product blueprint`);
    assertIncludes(label.future_build_input_policy.reopen_requires, "explicit_human_reopen_record", `${label.label_id} must require explicit human reopen`);
  }
  assert(c004FailedLabel.label_id === "C-004-FAILED", "C-004 failed label ID mismatch");
  assert(c005FailedLabel.label_id === "C-005-FAILED", "C-005 failed label ID mismatch");

  const targetAudienceExplorationTemplate = loadYaml("templates/target-audience-exploration-template.yaml").target_audience_exploration;
  assertIncludes(targetAudienceExplorationTemplate.allowed_statuses, "PASS", "Target audience exploration template must allow PASS");
  assertIncludes(targetAudienceExplorationTemplate.allowed_statuses, "TARGET_AUDIENCE_EXPLORATION_FAILED", "Target audience exploration template must allow TARGET_AUDIENCE_EXPLORATION_FAILED");
  assertIncludes(targetAudienceExplorationTemplate.fail_if, "fewer_than_two_candidate_target_audiences_explored", "Target audience exploration template must reject fewer than two TAs");
  assertIncludes(targetAudienceExplorationTemplate.fail_if, "no_evidence_refs_for_any_surviving_ta", "Target audience exploration template must reject missing evidence refs");
  assertIncludes(targetAudienceExplorationTemplate.fail_if, "jtbd_is_a_product_description_not_a_buyer_behavior", "Target audience exploration template must reject product-description JTBD");
  assertIncludes(targetAudienceExplorationTemplate.fail_if, "all_tas_are_hypotheses_without_grounded_evidence", "Target audience exploration template must reject all-hypothesis TA set");

  const targetAudienceLockTemplate = loadYaml("templates/target-audience-lock-template.yaml").target_audience_lock;
  assert(targetAudienceLockTemplate.flow_revision === "FLOW-007-001", "Target audience lock template must declare FLOW-007-001");
  assertIncludes(targetAudienceLockTemplate.allowed_statuses, "PASS", "Target audience lock template must allow PASS");
  assertIncludes(targetAudienceLockTemplate.allowed_statuses, "TARGET_AUDIENCE_LOCK_FAILED", "Target audience lock template must allow TARGET_AUDIENCE_LOCK_FAILED");
  assertIncludes(targetAudienceLockTemplate.fail_if, "no_primary_ta_locked_before_product_identity_reframe", "Target audience lock template must reject missing lock before product identity reframe");
  assertIncludes(targetAudienceLockTemplate.fail_if, "locked_ta_has_zero_grounded_evidence_refs", "Target audience lock template must reject locked TA without evidence refs");
  assertIncludes(targetAudienceLockTemplate.fail_if, "locked_jtbd_describes_the_product_not_the_buyer_behavior", "Target audience lock template must reject product-description JTBD");
  assertIncludes(targetAudienceLockTemplate.fail_if, "competitor_usage_patterns_contradict_locked_ta_without_resolution", "Target audience lock template must reject unresolved TA contradictions");
  assertIncludes(targetAudienceLockTemplate.fail_if, "real_world_decision_objective_or_terminal_success_measure_missing", "Target audience lock template must reject missing real-world decision objective");
  assertIncludes(targetAudienceLockTemplate.fail_if, "locked_ta_is_defined_by_intermediate_metric_only", "Target audience lock template must reject intermediate-metric-only lock");
  assert("decision_altitude" in (targetAudienceLockTemplate.locked_primary_ta || {}), "Target audience lock template must include decision altitude");
  assert("real_world_decision_objective" in (targetAudienceLockTemplate.locked_primary_ta || {}), "Target audience lock template must include real-world decision objective");

  const autopsy = loadYaml("templates/competitor-autopsy-template.yaml").competitor_autopsy;
  assert(autopsy.flow_revision === "FLOW-007-001", "Competitor autopsy template must declare FLOW-007-001");
  assertIncludes(autopsy.allowed_statuses, "BENCHMARK_INSUFFICIENT", "Competitor autopsy must allow BENCHMARK_INSUFFICIENT");
  assert(String(autopsy.hard_rule).includes("cannot satisfy benchmark autopsy"), "Competitor autopsy hard rule missing");
  assert(String(autopsy.hard_rule).includes("real-world decision layer"), "Competitor autopsy must require real-world decision-layer extraction");
  assert(Object.keys(autopsy.benchmark_adequacy_review || {}).includes("status"), "Competitor autopsy must carry benchmark adequacy review");
  assert("real_world_decision_layer" in autopsy, "Competitor autopsy must include real-world decision layer");
  assert("terminal_metrics" in autopsy, "Competitor autopsy must include terminal metrics");

  const scenario = loadYaml("templates/scenario-matrix-template.yaml").scenario_matrix;
  assert(scenario.numeric_truth_table_required_when_product_is_spreadsheet_or_calculator === true, "Scenario matrix must require numeric truth tables");
  assert(scenario.scenario_without_expected_outputs_blocks_build === true, "Scenario matrix must block scenarios without expected outputs");
  assert(scenario.scenario_fixtures_required_before_build === true, "Scenario matrix must require fixtures before build");
  assertIncludes(scenario.c004_canonical_scenarios, "supplier change", "C-004 scenario matrix must include supplier change");
  assertIncludes(scenario.c004_canonical_scenarios, "purchase received", "C-004 scenario matrix must include purchase received");
  assert(Array.isArray(scenario.executable_fixture_rules), "Scenario matrix must define executable fixture rules");

  const identity = loadYaml("templates/product-identity-reframe-template.yaml").product_identity_reframe;
  assertIncludes(identity.allowed_statuses, "PASS", "Identity reframe must allow PASS");
  assertIncludes(identity.fail_if, "candidate_remains_the_same_failed_product_class", "Identity reframe must reject same failed class");

  const blueprintTemplate = loadYaml("templates/workbook-product-blueprint-template.yaml").workbook_product_blueprint;
  assertIncludes(blueprintTemplate.allowed_statuses, "PASS", "Workbook blueprint must allow PASS");
  assertIncludes(blueprintTemplate.fail_if, "builder_must_invent_sheet_structure", "Workbook blueprint must reject invented sheet structure");

  const blind = loadYaml("templates/blind-buyer-walkthrough-template.yaml").blind_buyer_walkthrough;
  assertIncludes(blind.c004_canonical_walkthrough, "Decide what to reorder, when, and how much.", "C-004 walkthrough must include reorder decision");

  assert(productSpecTemplate.product_architecture_contract_ref === null, "Product spec template must cite Product Architecture Contract");
  assert(productSpecTemplate.architecture_lock_traceability.accepted_only_if_build_readiness_status_is_BUILD_READY === true, "Product spec must enforce BUILD_READY acceptance");
  assertIncludes(buildManifestTemplate.locked_architecture_fields_builder_must_not_change, "domain_model", "Build manifest must lock domain model");
  assertIncludes(buildManifestTemplate.locked_architecture_fields_builder_must_not_change, "buyer_behavior_loop", "Build manifest must lock buyer behavior loop");
  assertIncludes(buildManifestTemplate.spreadsheet_workbook_requirements, "no_demo_only_workbook", "Build manifest must block demo-only workbook");
  assertIncludes(buildManifestTemplate.required_behavior_manifests, "product_identity_reframe_manifest", "Build manifest must require identity reframe manifest");
  assertIncludes(buildManifestTemplate.required_behavior_manifests, "scenario_fixture_manifest", "Build manifest must require scenario fixture manifest");
  assertIncludes(buildManifestTemplate.required_behavior_manifests, "workbook_product_blueprint_manifest", "Build manifest must require workbook blueprint manifest");
  assertIncludes(buildManifestTemplate.required_behavior_manifests, "builder_input_completeness_manifest", "Build manifest must require builder input completeness manifest");
  assertIncludes(buildManifestTemplate.required_behavior_manifests, "pre_build_architecture_premortem_manifest", "Build manifest must require pre-build architecture premortem manifest");
  assertIncludes(buildManifestTemplate.required_behavior_manifests, "primary_buyer_decision_output_manifest", "Build manifest must require primary decision output manifest");
  assertIncludes(buildManifestTemplate.required_behavior_manifests, "prior_failed_artifact_delta_manifest", "Build manifest must require prior failed artifact delta manifest");
  assertIncludes(buildManifestTemplate.required_behavior_manifests, "seed_data_behavior_demo_manifest", "Build manifest must require seed data behavior demo manifest");
  assert(buildManifestTemplate.company_memory_preflight_ref === null, "Build manifest must cite company memory preflight");
  assert(buildManifestTemplate.findings_ledger_ref === null, "Build manifest must cite findings ledger");
  assertIncludes(buildManifestTemplate.ready_for_publish_requires, "pre_mortem_launch_blockers_absent", "Build manifest must require pre-mortem blockers absent");
  assertIncludes(buildManifestTemplate.ready_for_publish_requires, "measured_material_product_delta_pass", "Build manifest must require measured material product delta pass");
  assert(listingSpecTemplate.generated_from.beatsperfect_brandbook_ref === "brandbook/beatsperfect-brandbook.v1.yaml", "Listing spec must use brandbook");
  assert(listingSpecTemplate.hard_rule === "Clean screenshots without a buyer hook do not pass.", "Listing hard rule missing");
  assertIncludes(Object.keys(listingSpecTemplate.per_listing_image_requirements[0]), "grid_stop_reason", "Listing images must require grid-stop reason");
  assertIncludes(listingSpecTemplate.listing_quality_fail_if, "screenshot_presence_as_the_only_hook", "Listing spec must reject screenshot-only hooks");
  assertIncludes(artifactInspectionTemplate.required_results, "executable_adversarial_scenario_results", "Artifact inspection template must require adversarial scenario results");
  assertIncludes(artifactInspectionTemplate.required_results, "material_product_delta_results", "Artifact inspection template must require material product delta results");
  assertIncludes(artifactInspectionTemplate.required_results, "seed_data_behavior_demo_results", "Artifact inspection template must require seed data behavior demo results");
  assertIncludes(artifactInspectionTemplate.required_results, "build_findings_closure_results", "Artifact inspection template must require build findings closure results");
  assertIncludes(artifactInspectionTemplate.required_results, "architecture_vs_implementation_classification_results", "Artifact inspection template must require architecture-vs-implementation classification results");
  assertIncludes(artifactInspectionTemplate.fail_if, "mutation_tests_lack_recalculated_before_after_outputs", "Artifact inspection template must reject mutation tests without recalculation proof");
  assertIncludes(artifactInspectionTemplate.fail_if, "artifact_is_structural_or_behavior_clone_of_failed_baseline_without_material_buyer_value_delta", "Artifact inspection must reject clone artifacts without material buyer value delta");
  assertIncludes(preMortemTemplate.required_checks, "company_memory", "Pre-mortem must inspect company memory");
  assertIncludes(preMortemTemplate.required_checks, "ta_jtbd_evidence_trace", "Pre-mortem must check TA/JTBD evidence trace");
  assertIncludes(preMortemTemplate.required_checks, "kpp_evidence_trace", "Pre-mortem must check KPP evidence trace");
  assertIncludes(preMortemTemplate.required_checks, "per_feature_evidence_trace", "Pre-mortem must check per-feature evidence trace");
  assertIncludes(preMortemTemplate.required_checks, "redundant_feature_identification", "Pre-mortem must identify redundant features");
  assertIncludes(preMortemTemplate.required_checks, "attempt_number_tracked", "Pre-mortem must track attempt number");
  assertIncludes(preMortemTemplate.fail_if, "proposed_feature_is_not_proven_by_locked_buyer_behavior_or_marketplace_evidence", "Pre-mortem must reject unproven feature scope");
  assertIncludes(preMortemTemplate.fail_if, "locked_jtbd_has_no_buyer_language_evidence_trace", "Pre-mortem must reject JTBD without evidence trace");
  assertIncludes(preMortemTemplate.fail_if, "redundant_features_exist_without_launch_blocker_or_explicit_human_approval", "Pre-mortem must block redundant features without approval");
  assertIncludes(preMortemTemplate.fail_if, "attempt_2_returns_rebuild_recommended_instead_of_blocked", "Pre-mortem must not return rebuild_recommended on attempt 2");
  assertIncludes(preMortemTemplate.allowed_statuses, "rebuild_recommended", "Pre-mortem must allow rebuild_recommended status");
  assert(preMortemTemplate.evidence_assumption_audit, "Pre-mortem must include evidence_assumption_audit section");
  assert(preMortemTemplate.rebuild_feedback, "Pre-mortem must include rebuild_feedback section");
  assert(preMortemTemplate.decision_rule, "Pre-mortem must include decision_rule for attempt loop");
  assertIncludes(launchGateTemplate.required_checks_phase_1_red_team, "ta_is_grounded_in_market_evidence_not_shaped_by_product_concept", "Launch gate phase 1 must red-team TA");
  assertIncludes(launchGateTemplate.required_checks_phase_1_red_team, "jtbd_traces_to_buyer_language_not_contract_invention", "Launch gate phase 1 must red-team JTBD");
  assertIncludes(launchGateTemplate.required_checks_phase_1_red_team, "scope_is_proportional_to_price_point_and_buyer_sophistication", "Launch gate phase 1 must check scope proportionality");
  assertIncludes(launchGateTemplate.required_checks_phase_2_build_verification, "product_identity_reframe_passed", "Launch gate phase 2 must require product identity reframe");
  assertIncludes(launchGateTemplate.required_checks_phase_2_build_verification, "cost_outcome_accountability_passed", "Launch gate phase 2 must require cost/outcome accountability");
  assertIncludes(launchGateTemplate.required_checks_phase_2_build_verification, "measured_material_product_delta_passed_when_applicable", "Launch gate phase 2 must require material product delta when applicable");
  assertIncludes(launchGateTemplate.required_checks_phase_2_build_verification, "applicable_findings_closed_or_classified_as_launch_blockers", "Launch gate phase 2 must require findings closure or blocker classification");
  assertIncludes(launchGateTemplate.required_checks_phase_2_build_verification, "workbook_or_product_blueprint_passed", "Launch gate phase 2 must require workbook blueprint");
  assertIncludes(launchGateTemplate.required_checks_phase_2_build_verification, "pre_build_architecture_premortem_passed", "Launch gate phase 2 must require pre-build premortem");
  assertIncludes(launchGateTemplate.required_checks_phase_3_loop_decision, "attempt_number_tracked", "Launch gate phase 3 must track attempt number");
  assertIncludes(launchGateTemplate.required_checks_phase_3_loop_decision, "rebuild_instruction_complete_when_rebuild_required", "Launch gate phase 3 must require rebuild instructions");
  assertIncludes(launchGateTemplate.required_checks_phase_3_loop_decision, "escalation_detail_complete_when_rejected_escalate", "Launch gate phase 3 must require escalation detail");
  assert(launchGateTemplate.assumption_red_team, "Launch gate must include assumption_red_team section");
  assert(launchGateTemplate.rebuild_loop, "Launch gate must include rebuild_loop section");
  assert(launchGateTemplate.failure_rerun_mapping, "Launch gate must include failure_rerun_mapping");
  assert(launchGateTemplate.max_attempts === 2, "Launch gate max_attempts must be 2");
  assertIncludes(launchGateTemplate.allowed_statuses, "REBUILD_REQUIRED", "Launch gate must allow REBUILD_REQUIRED status");
  assertIncludes(launchGateTemplate.allowed_statuses, "REJECTED_ESCALATE", "Launch gate must allow REJECTED_ESCALATE status");
  assertIncludes(launchGateTemplate.fail_if, "ta_was_shaped_by_product_concept_not_by_evidence", "Launch gate must reject TA shaped by product concept");
  assertIncludes(launchGateTemplate.fail_if, "jtbd_was_invented_by_contracts_without_buyer_language_trace", "Launch gate must reject invented JTBD");
  assertIncludes(launchGateTemplate.fail_if, "scope_is_disproportionate_to_price_point_and_buyer_sophistication", "Launch gate must reject disproportionate scope");
  assertIncludes(launchGateTemplate.fail_if, "attempt_2_rebuild_instruction_issued_instead_of_reject", "Launch gate must not issue rebuild on attempt 2");
  assertIncludes(launchGateTemplate.fail_if, "escalation_detail_missing_on_rejected_escalate", "Launch gate must require escalation detail on reject");
  assertIncludes(launchGateTemplate.fail_if, "builder_input_completeness_missing_or_failed", "Launch gate must reject missing builder input completeness");
  assertIncludes(materialDeltaTemplate.fail_if, "same_workbook_shape_same_formulas_same_outputs_without_buyer_value_delta", "Material delta template must reject same workbook clone");
  assertIncludes(materialDeltaTemplate.fail_if, "seed_data_weakens_the_declared_behavior_demo", "Material delta template must reject weaker seed demos");
  assert(ledgerTemplate.cost_control_rules.repeated_similar_artifact_regeneration_forbidden === true, "Ledger must forbid repeated similar artifact regeneration");
  assert(ledgerTemplate.cost_control_rules.governance_only_delta_cannot_pass_launch === true, "Ledger must reject governance-only delta");
  assert(ledgerTemplate.cost_control_rules.measured_prior_vs_current_artifact_delta_required_when_applicable === true, "Ledger must require measured prior/current artifact delta");
  assertIncludes(dispatch.source_of_truth, "governance/11_learning_loop.yaml", "Dispatch must cite LEARN-001");
  assert(dispatch.learning_loop_stage_model_map["01_postmortem"].requested_model === "gpt-5.5", "Learning-loop postmortem dispatch must require gpt-5.5");
  assert(dispatch.learning_loop_stage_model_map["05_regression_replay"].requested_model === "gpt-5.4", "Learning-loop regression replay dispatch must stay build-light");
  assert(pilotPolicy.learning_loop.required_on_serious_failure === "LEARN-001", "Pilot policy must require LEARN-001 on serious failure");
  assert(pilotPolicy.learning_loop.same_lane_repeat_blocked_until_learning_closure === true, "Pilot policy must block same-lane repeats until closure");
  assert(model.learning_loop_routing.serious_failure_postmortem.requested_model === "gpt-5.5", "MODEL-007 must route serious postmortems to gpt-5.5");
  assert(model.learning_loop_routing.regression_replay.requested_model === "gpt-5.4", "MODEL-007 must define regression replay routing");
  assertIncludes(learningLoop.hard_rules, "failed_runs_must_not_be_repeated_until_failure_is_closed", "LEARN-001 hard rule missing");
  assertIncludes(learningLoop.trigger_on_status, "SAME_FAILED_PRODUCT_CLASS_BLOCKED", "LEARN-001 must trigger on same failed product class");
  assertIncludes(learningLoop.trigger_on_human_label, "flow_failed_to_block", "LEARN-001 must trigger on flow_failed_to_block");
  assert(companyMemoryText.includes("MEM-LEARN-001-0001"), "Company memory must include active LEARN-001 guard");
  assert(companyMemoryText.includes("status: ACTIVE"), "Company memory active guard status missing");
  assert(failureIntake.failure_id === "FAIL-0001", "Dry failure intake ID mismatch");
  assert(postmortem.postmortem_id === "PMR-0001", "Dry postmortem ID mismatch");
  assert(learningFinding1.finding_type === "governance", "Dry governance finding type mismatch");
  assert(learningFinding2.finding_type === "model_routing", "Dry model-routing finding type mismatch");
  assert(learningFinding3.finding_type === "validator", "Dry validator finding type mismatch");
  assert(learningFinding4.finding_type === "memory", "Dry memory finding type mismatch");
  assert(flowPatch1.status === "REGRESSION_REPLAY_REQUIRED", "Dry flow patch should wait for replay");
  assert(replay.build_performed === false, "Dry regression replay must not rebuild");
  assert(replay.expected_block_stage === "pre_run", "Dry regression replay must block at pre_run");
  assert(replay.pass_fail === "PASS", "Dry regression replay must pass");
  assert(closure.status === "FAILURE_CLOSED", "Dry learning closure must close the failure");

  assert(model.default_model_rule.includes("lowest-cost non-pro model"), "MODEL-007 must use the lowest-cost non-pro model by default");
  assert(model.stage_quality_rules.market_evidence.hard_rule.includes("Product direction must be derived from market evidence"), "MODEL-007 must prevent pre-locked product direction");
  assert(model.stage_quality_rules.competitor_selection.hard_rule.includes("Select exactly one competitor"), "MODEL-007 must restore one-competitor selection rule");
  assert(model.stage_quality_rules.purchased_competitor_inspection.additional_purchase_rule.includes("Exactly one additional purchase"), "MODEL-007 must cap replacement purchase rule");
  assert(model.stage_quality_rules.product_identity_reframe.hard_rule.includes("product identity"), "MODEL-007 must lock product identity reframe");
  assertIncludes(model.stage_quality_rules.product_identity_reframe.required_outputs, "product_identity", "MODEL-007 identity reframe must require product identity");
  assertIncludes(model.stage_quality_rules.product_identity_reframe.required_outputs, "required_product_class_delta", "MODEL-007 identity reframe must require product class delta");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.required_outputs, "next_action_map", "MODEL-007 PAC must require next-action map");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.required_outputs, "canonical_failure_mode_resolution", "MODEL-007 PAC must require canonical failure mode resolution");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.required_outputs, "failure_baseline_and_material_delta", "MODEL-007 PAC must require failure baseline material delta");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.required_outputs, "real_world_decision_objective", "MODEL-007 PAC must require real-world decision objective");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.required_outputs, "terminal_metrics", "MODEL-007 PAC must require terminal metrics");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.required_outputs, "terminal_decision_outputs_required", "MODEL-007 PAC must require terminal decision outputs");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.fail_if, "target_audience_trigger_moment_or_current_workaround_missing", "MODEL-007 PAC must reject missing trigger moment or current workaround");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.fail_if, "target_audience_capability_band_missing", "MODEL-007 PAC must reject missing capability band");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.fail_if, "audience_collapses_novice_and_expert_without_distinct_behavior_or_explicit_exclusion", "MODEL-007 PAC must reject mixed novice/expert audience");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.fail_if, "product_value_after_assumed_prior_knowledge_is_weak_or_unstated", "MODEL-007 PAC must reject weak value after assumed prior knowledge");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.fail_if, "product_requires_buyer_to_already_do_the_full_judgment_without_meaningful_decision_help", "MODEL-007 PAC must reject buyer-does-all-the-work audience");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.fail_if, "target_audience_is_locked_to_intermediate_metric_without_real_world_decision_objective", "MODEL-007 PAC must reject intermediate-metric target-audience lock");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.fail_if, "buyer_behavior_does_not_improve_on_the_current_workaround", "MODEL-007 PAC must reject no improvement over workaround");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.fail_if, "terminal_decision_layer_implied_by_evidence_is_missing_from_domain_model", "MODEL-007 PAC must reject missing terminal decision layer");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.fail_if, "decision_outputs_stop_at_intermediate_metric_without_terminal_decision_help", "MODEL-007 PAC must reject intermediate-only decision outputs");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.fail_if, "applicable_canonical_failure_mode_unmapped_to_contract_or_later_gate", "MODEL-007 PAC must reject unmapped canonical failure modes");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.fail_if, "claimed_delta_is_only_governance_records_model_routing_or_cleaner_writing", "MODEL-007 PAC must reject governance-only deltas");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.fail_if, "product_is_only_a_faster_calculator_or_data_entry_shell_for_the_declared_buyer", "MODEL-007 PAC must reject calculator-only value for the declared buyer");
  assertIncludes(model.stage_quality_rules.product_architecture_contract.fail_if, "mathematically_correct_submodel_is_presented_as_complete_buyer_decision_help", "MODEL-007 PAC must reject mathematically correct but underfit submodels");
  assert(model.stage_quality_rules.scenario_matrix.hard_rule.includes("Scenario Matrix must pass before build"), "MODEL-007 scenario matrix hard rule missing");
  assertIncludes(model.stage_quality_rules.scenario_matrix.required_outputs, "scenario_id", "MODEL-007 scenario matrix must require scenario ids");
  assertIncludes(model.stage_quality_rules.workbook_or_product_blueprint.required_outputs, "required_sheets", "MODEL-007 blueprint must require sheets");
  assertIncludes(model.stage_quality_rules.workbook_or_product_blueprint.fail_if, "builder_must_invent_sheet_structure", "MODEL-007 blueprint must reject invented structure");
  assert(model.stage_quality_rules.pre_build_architecture_premortem.hard_rule.includes("same failed artifact path"), "MODEL-007 pre-build premortem hard rule missing");
  assertIncludes(model.stage_quality_rules.pre_build_architecture_premortem.required_outputs, "generic_product_identity_risk", "MODEL-007 pre-build premortem must check generic identity risk");
  assertIncludes(model.stage_quality_rules.pre_build_architecture_premortem.required_outputs, "run_blocker_closure_check", "MODEL-007 pre-build premortem must check run blocker closure");
  assertIncludes(model.stage_quality_rules.pre_build_architecture_premortem.fail_if, "same_failed_product_path_is_not_identified", "MODEL-007 pre-build premortem must reject missing same-path finding");
  assertIncludes(model.stage_quality_rules.pre_build_architecture_premortem.fail_if, "premortem_repeat_path_failure_mode_still_open_at_build", "MODEL-007 pre-build premortem must reject open repeat-path blocker");
  assertIncludes(model.stage_quality_rules.build_readiness_review.fail_if, "builder_input_completeness_missing_or_failed", "MODEL-007 build readiness must reject missing builder input completeness");
  assertIncludes(model.stage_quality_rules.build_readiness_review.fail_if, "applicable_canonical_failure_mode_not_assessed", "MODEL-007 build readiness must reject unassessed canonical failure modes");
  assertIncludes(model.stage_quality_rules.build_readiness_review.fail_if, "open_run_blocker_due_by_build_readiness_still_open", "MODEL-007 build readiness must reject open run blockers due by build");
  assertIncludes(model.stage_quality_rules.build_readiness_review.fail_if, "scope_underfit_to_real_world_decision_layer", "MODEL-007 build readiness must reject real-world decision-layer underfit");
  assertIncludes(model.stage_quality_rules.build_readiness_review.fail_if, "terminal_decision_outputs_missing_when_implied_by_domain_evidence", "MODEL-007 build readiness must reject missing terminal decision outputs");
  assertIncludes(model.stage_quality_rules.product_build.required_manifests, "visible_capacity_manifest", "MODEL-007 build must require visible capacity manifest");
  assertIncludes(model.stage_quality_rules.product_build.required_manifests, "prior_failed_artifact_delta_manifest", "MODEL-007 build must require prior failed artifact delta manifest");
  assertIncludes(model.stage_quality_rules.product_build.required_manifests, "product_identity_reframe_manifest", "MODEL-007 build must require identity manifest");
  assertIncludes(model.stage_quality_rules.product_build.required_manifests, "scenario_fixture_manifest", "MODEL-007 build must require scenario fixture manifest");
  assertIncludes(model.stage_quality_rules.product_build.required_manifests, "workbook_product_blueprint_manifest", "MODEL-007 build must require workbook blueprint manifest");
  assertIncludes(model.stage_quality_rules.product_build.required_manifests, "builder_input_completeness_manifest", "MODEL-007 build must require builder input completeness manifest");
  assertIncludes(model.stage_quality_rules.product_build.required_manifests, "pre_build_architecture_premortem_manifest", "MODEL-007 build must require pre-build premortem manifest");
  assertIncludes(model.stage_quality_rules.real_artifact_inspection.required_results, "setup_input_propagation_results", "MODEL-007 QA must require setup propagation results");
  assertIncludes(model.stage_quality_rules.real_artifact_inspection.required_results, "material_product_delta_results", "MODEL-007 QA must require material product delta results");
  assertIncludes(model.stage_quality_rules.real_artifact_inspection.required_results, "architecture_vs_implementation_classification_results", "MODEL-007 QA must require architecture-vs-implementation classification results");
  assertIncludes(model.stage_quality_rules.pre_mortem_failure_analysis.required_outputs, "top_3_likely_failure_modes", "MODEL-007 pre-mortem must require top failure modes");
  assertIncludes(model.stage_quality_rules.pre_mortem_failure_analysis.required_inputs, "failed_baseline_material_delta_evidence", "MODEL-007 pre-mortem must inspect failed baseline material delta evidence");
  assertIncludes(model.stage_quality_rules.founder_launch_gate.fail_if, "launch_ready_claim_depends_on_governance_records_without_material_product_delta", "MODEL-007 launch gate must reject governance-only deltas");
  assertIncludes(model.stage_quality_rules.founder_launch_gate.fail_if, "open_run_blocker_due_by_launch_still_open", "MODEL-007 launch gate must reject open run blockers due by launch");
  assert(model.first_three_pilots_override?.frontier_model === "gpt-5.5", "FLOW-007 pilot override must require gpt-5.5");
  assertIncludes(model.first_three_pilots_override?.prohibited_models, "gpt-5.5-pro", "FLOW-007 pilot override must prohibit gpt-5.5-pro");
  assert(pilotPolicy.frontier_model === "gpt-5.5", "FLOW-007 pilot policy must use gpt-5.5");
  assertIncludes(pilotPolicy.prohibited_models, "any pro model", "FLOW-007 pilot policy must prohibit any pro model");
  assert(pilotPolicy.cost_control?.hard_stop_api_cost_usd === 40, "FLOW-007 pilot hard stop must be 40 USD");
  assert(Array.isArray(pilotPolicy.mandatory_frontier_stages) && pilotPolicy.mandatory_frontier_stages.length === 17, "FLOW-007 pilot must define 17 mandatory frontier stages");
  for (const stage of pilotPolicy.mandatory_frontier_stages) {
    assert(stage.requested_model === "gpt-5.5", `${stage.stage_id} must request gpt-5.5`);
  }
  assert(model.stage_quality_rules.build_readiness_review.hard_rule.includes("BUILD_READY"), "MODEL-007 build readiness hard rule missing");
  assert(budget.first_three_pilot_cost_target_usd?.min === 25, "Budget must record first-three pilot target minimum");
  assert(budget.first_three_pilot_cost_target_usd?.max === 40, "Budget must record first-three pilot target maximum");
  assert(budget.budget_window?.start_step_id === "00_market_evidence", "Budget window must start at market evidence");
  assert(budget.budget_window?.end_step_id === "17_founder_launch_gate", "Budget window must end at founder launch gate");
  assert(JSON.stringify(budget.phase_budget_plan?.architecture_lock?.stages || []) === JSON.stringify([
    "00_market_evidence",
    "01_public_shelf_read",
    "02_target_audience_exploration",
    "03_competitor_selection_purchase_approval",
    "04_purchased_competitor_inspection",
    "05_target_audience_lock",
    "06_product_identity_reframe",
    "07_product_architecture_contract",
    "08_scenario_matrix",
    "09_workbook_or_product_blueprint",
    "10_build_readiness_review",
    "11_pre_build_architecture_premortem",
  ]), "Architecture-lock budget stages must match the FLOW-007 pre-build contract");
  assert(JSON.stringify(budget.phase_budget_plan?.build_and_artifact_qa?.stages || []) === JSON.stringify([
    "12_product_build",
    "13_real_artifact_inspection",
    "14_blind_buyer_walkthrough",
  ]), "Build/QA budget stages must match the FLOW-007 build segment");
  assert(JSON.stringify(budget.phase_budget_plan?.listing_packaging_launch_gate?.stages || []) === JSON.stringify([
    "15_listing_packaging_qa",
    "16_pre_mortem_failure_analysis",
    "17_founder_launch_gate",
  ]), "Listing/pre-mortem/launch budget stages must match the FLOW-007 finish segment");
  assert(budget.total_hard_budget_usd === 40, "Budget hard stop must be 40 USD for first pilots");
  assert(budget.hard_stop_rules.no_paid_rebuild_unless_product_architecture_contract_changed_materially === true, "Budget must block paid rebuild without contract change");
  assert(dispatch.enforcement.repeated_rebuild_escalation_after_failed_artifacts_forbidden === true, "Dispatch must forbid repeated rebuild escalation");
  assert(dispatch.enforcement.first_three_pilots_require_gpt_5_5_for_frontier_required_gates === true, "Dispatch must require gpt-5.5 for pilot frontier gates");
  assert(dispatch.enforcement.pro_model_substitution_forbidden === true, "Dispatch must forbid Pro substitution");
  assert(dispatch.stage_model_map["02_target_audience_exploration"].requested_model === "gpt-5.4", "Target audience exploration must route to gpt-5.4");
  assert(dispatch.stage_model_map["03_competitor_selection_purchase_approval"].human_gate_required === "competitor_purchase_approval", "Dispatch must require human purchase approval before acquisition");
  assert(dispatch.stage_model_map["05_target_audience_lock"].requested_model === "gpt-5.5", "Target audience lock must route to gpt-5.5");
  assert(dispatch.stage_model_map["06_product_identity_reframe"].requested_model === "gpt-5.5", "Product identity reframe must route to gpt-5.5");
  assert(dispatch.stage_model_map["11_pre_build_architecture_premortem"].requested_model === "gpt-5.5", "Pre-build premortem must route to gpt-5.5");
  assert(dispatch.stage_model_map["12_product_build"].requested_model === "gpt-5.4", "Product build must route to gpt-5.4");
  assert(dispatch.stage_model_map["14_blind_buyer_walkthrough"].requested_model === "gpt-5.5", "Blind buyer walkthrough must route to gpt-5.5");
  assert(dispatch.stage_model_map["15_listing_packaging_qa"].requested_model === "gpt-5.4", "Listing packaging QA must route to gpt-5.4");
  assert(dispatch.pilot_mandatory_frontier_stage_model_map?.["17_launch_gate"]?.requested_model === "gpt-5.5", "Pilot launch gate must route to gpt-5.5");
  assert(dispatch.pilot_mandatory_frontier_stage_model_map?.["16_pre_mortem_failure_analysis"]?.requested_model === "gpt-5.5", "Pilot pre-mortem must route to gpt-5.5");

  assert(failureCase.includes("FLOW-006 allowed artifact generation before the product had a locked buyer-behavior and domain-model contract."), "C-004 failure root cause missing");
  assert(failureCase.includes("Opening Stock as a static SKU field was architecturally wrong."), "C-004 Opening Stock lesson missing");
  assert(validation.artifact_rebuild_performed === false, "C-004 dry validation must not rebuild");
  assert(validation.build_readiness.status === "NOT_BUILD_READY", "C-004 must be NOT_BUILD_READY");
  assert(validation.result.product_generation_allowed === false, "C-004 product generation must be blocked");
  assertIncludes(validation.expected_blockers, "domain model failed because Opening Stock was treated as static", "C-004 expected blocker missing");

  return true;
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  validateFlow007Contracts();
  process.stdout.write("FLOW-007 validation passed\n");
}
