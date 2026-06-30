import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import YAML from "yaml";
import { validateFlow007Contracts } from "../validators/flow-007-validator.mjs";

const repoRoot = process.cwd();

function load(relativePath) {
  return YAML.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

test("FLOW-007 contracts validate", () => {
  assert.equal(validateFlow007Contracts(), true);
});

test("FLOW-007 defines canonical future-build blocker classes and enforces them through run gates", () => {
  const flow = load("workflows/FLOW-007.yaml")["FLOW-007"];
  const preflight = load("templates/company-memory-preflight-template.yaml").company_memory_preflight;
  const findings = load("templates/findings-ledger-template.yaml").findings_ledger;
  const buildReadiness = load("templates/build-readiness-review-template.yaml").build_readiness_review;
  const pac = load("templates/product-architecture-contract-template.yaml").product_architecture_contract;
  const schema = load("specs/SCHEMA-007.yaml")["SCHEMA-007"];
  const model = load("specs/MODEL-007.yaml")["MODEL-007"];
  const bls = load("specs/BLS-007.yaml")["BLS-007"];

  assert.deepEqual(flow.canonical_failure_modes.map((entry) => entry.failure_mode_id), [
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
  ]);
  assert.equal(flow.pre_run.canonical_failure_modes_catalog_ref, "workflows/FLOW-007.yaml#canonical_failure_modes");
  assert.equal(flow.pre_run.gate.canonical_failure_modes_assessment_required, true);
  assert.equal(flow.pre_run.gate.every_canonical_failure_mode_must_be_assessed_before_market_evidence, true);
  assert.equal(flow.pre_run.gate.open_run_blockers_must_have_owner_gate_and_due_gate, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "07_product_architecture_contract").gate.applicable_canonical_failure_modes_must_be_mapped_into_contract_or_later_gate, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "10_build_readiness_review").gate.no_open_run_blockers_due_by_build_readiness, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "11_pre_build_architecture_premortem").gate.premortem_repeat_path_failure_mode_closed_required, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "17_founder_launch_gate").gate.no_open_run_blockers_due_by_launch, true);

  assert.equal(preflight.canonical_failure_modes_catalog_ref, "workflows/FLOW-007.yaml#canonical_failure_modes");
  assert.ok(Array.isArray(preflight.canonical_failure_modes_assessment));
  assert.ok(preflight.fail_if.includes("canonical_failure_mode_not_assessed"));
  assert.ok(preflight.fail_if.includes("open_run_blocker_missing_owner_gate_or_due_gate"));
  assert.equal(findings.canonical_failure_modes_catalog_ref, "workflows/FLOW-007.yaml#canonical_failure_modes");
  assert.ok(Array.isArray(findings.run_blockers));
  assert.equal(findings.closure_rules.required_pre_build_run_blockers_must_be_resolved_before_BUILD_READY, true);
  assert.equal(findings.closure_rules.no_open_run_blocker_due_by_gate_can_be_ignored, true);

  assert.equal(buildReadiness.canonical_failure_modes_catalog_ref, "workflows/FLOW-007.yaml#canonical_failure_modes");
  assert.ok("applicable_canonical_failure_modes_assessed" in buildReadiness.checks);
  assert.ok("no_open_run_blockers_due_by_build_readiness" in buildReadiness.checks);
  assert.ok(Array.isArray(buildReadiness.run_blocker_resolution));
  assert.ok(buildReadiness.fail_if.includes("applicable_canonical_failure_mode_not_assessed"));
  assert.ok(buildReadiness.fail_if.includes("open_run_blocker_due_by_build_readiness_still_open"));

  assert.equal(pac.canonical_failure_modes_catalog_ref, "workflows/FLOW-007.yaml#canonical_failure_modes");
  assert.ok("canonical_failure_mode_resolution" in pac);
  assert.ok(pac.build_readiness.required_fields.includes("run_blocker_resolution"));
  assert.ok(schema.company_memory_preflight.required_top_level_fields.includes("canonical_failure_modes_catalog_ref"));
  assert.ok(schema.company_memory_preflight.required_top_level_fields.includes("canonical_failure_modes_assessment"));
  assert.ok(schema.findings_ledger.required_top_level_fields.includes("run_blockers"));
  assert.ok(schema.product_architecture_contract.required_sections.includes("canonical_failure_mode_resolution"));
  assert.ok(schema.build_readiness_review.required_checks.includes("applicable_canonical_failure_modes_assessed"));
  assert.ok(schema.build_readiness_review.required_checks.includes("no_open_run_blockers_due_by_build_readiness"));
  assert.ok(schema.build_readiness_review.required_top_level_fields.includes("run_blocker_resolution"));

  assert.ok(bls.pre_build_tracking.includes("canonical_failure_modes_catalog_ref"));
  assert.ok(bls.pre_build_tracking.includes("open_run_blocker_ids"));
  assert.ok(bls.launch_requires.includes("no_open_run_blockers_due_by_launch"));
  assert.equal(bls.hard_blocks.required_pre_build_run_blockers_resolved_before_BUILD_READY, true);

  assert.ok(model.stage_quality_rules.product_architecture_contract.required_outputs.includes("canonical_failure_mode_resolution"));
  assert.ok(model.stage_quality_rules.product_architecture_contract.fail_if.includes("applicable_canonical_failure_mode_unmapped_to_contract_or_later_gate"));
  assert.ok(model.stage_quality_rules.build_readiness_review.fail_if.includes("applicable_canonical_failure_mode_not_assessed"));
  assert.ok(model.stage_quality_rules.build_readiness_review.fail_if.includes("open_run_blocker_due_by_build_readiness_still_open"));
  assert.ok(model.stage_quality_rules.pre_build_architecture_premortem.required_outputs.includes("run_blocker_closure_check"));
  assert.ok(model.stage_quality_rules.pre_build_architecture_premortem.fail_if.includes("premortem_repeat_path_failure_mode_still_open_at_build"));
  assert.ok(model.stage_quality_rules.founder_launch_gate.fail_if.includes("open_run_blocker_due_by_launch_still_open"));
});

test("FLOW-007 is the active market-derived architecture-first flow", () => {
  const active = load("config/active-flow.yaml");
  const flow = load("workflows/FLOW-007.yaml")["FLOW-007"];
  const steps = flow.flow.map((stage) => stage.step_id);

  assert.equal(active.active_flow_id, "FLOW-007");
  assert.deepEqual(steps, [
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
  ]);
  assert.equal(flow.flow.find((stage) => stage.step_id === "00_market_evidence").gate.product_direction_must_be_derived_from_market_evidence_or_marked_unproven, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "02_target_audience_exploration").gate.target_audience_exploration_status_required, "PASS");
  assert.equal(flow.flow.find((stage) => stage.step_id === "03_competitor_selection_purchase_approval").gate.exactly_one_competitor_by_default, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "04_purchased_competitor_inspection").gate.unresolved_benchmark_adequacy_blocks_architecture, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "04_purchased_competitor_inspection").gate.benchmark_adequacy_final_review_required, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "04_purchased_competitor_inspection").gate.benchmark_adequacy_final_review_status_required, "PASS");
  assert.equal(flow.flow.find((stage) => stage.step_id === "04_purchased_competitor_inspection").gate.benchmark_adequacy_final_review_model_required, "gpt-5.5");
  assert.equal(flow.flow.find((stage) => stage.step_id === "05_target_audience_lock").gate.target_audience_lock_status_required, "PASS");
  assert.equal(flow.flow.find((stage) => stage.step_id === "05_target_audience_lock").gate.exactly_one_primary_ta_locked, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "06_product_identity_reframe").gate.product_identity_status_required, "PASS");
  assert.equal(flow.flow.find((stage) => stage.step_id === "07_product_architecture_contract").gate.target_audience_contract_status_required, "PASS");
  assert.ok(flow.flow.find((stage) => stage.step_id === "07_product_architecture_contract").action.includes("define_exact_trigger_moment_capability_band_and_current_workaround_for_primary_buyer"));
  assert.ok(flow.flow.find((stage) => stage.step_id === "07_product_architecture_contract").action.includes("define_assumed_prior_knowledge_and_irreducible_value_after_that_knowledge"));
  assert.equal(flow.flow.find((stage) => stage.step_id === "08_scenario_matrix").gate.scenario_fixtures_required_before_build, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "09_workbook_or_product_blueprint").gate.product_blueprint_status_required, "PASS");
  assert.equal(flow.flow.find((stage) => stage.step_id === "10_build_readiness_review").gate.build_readiness_status_required, "BUILD_READY");
  assert.equal(flow.flow.find((stage) => stage.step_id === "10_build_readiness_review").gate.builder_input_completeness_status_required, "PASS");
  assert.equal(flow.flow.find((stage) => stage.step_id === "11_pre_build_architecture_premortem").gate.no_same_failed_product_path_remaining, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "13_real_artifact_inspection").gate.executable_adversarial_scenario_mutations_required, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "13_real_artifact_inspection").gate.architecture_vs_implementation_classification_required, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "13_real_artifact_inspection").gate.material_product_delta_against_failed_baseline_required_when_applicable, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "16_pre_mortem_failure_analysis").gate.unsupported_scope_expansion_forbidden, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "17_founder_launch_gate").gate.cost_outcome_accountability_required, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "17_founder_launch_gate").gate.governance_only_delta_cannot_pass_launch, true);
});

test("FLOW-007 requires measured material product delta against failed baselines", () => {
  const flow = load("workflows/FLOW-007.yaml")["FLOW-007"];
  const schema = load("specs/SCHEMA-007.yaml")["SCHEMA-007"];
  const pac = load("templates/product-architecture-contract-template.yaml").product_architecture_contract;
  const delta = load("templates/material-product-delta-template.yaml").material_product_delta;
  const launchGate = load("templates/launch-gate-template.yaml").launch_gate;

  assert.equal(flow.flow.find((stage) => stage.step_id === "07_product_architecture_contract").gate.failed_baseline_material_delta_required_when_same_domain_or_repair_seeded, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "10_build_readiness_review").gate.no_build_ready_for_governance_only_delta, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "12_product_build").gate.no_clone_build_required, true);
  assert.ok(schema.product_identity_reframe.required_top_level_fields.includes("product_identity"));
  assert.ok(schema.product_architecture_contract.required_sections.includes("failure_baseline_and_material_delta"));
  assert.ok(schema.product_architecture_contract.required_sections.includes("product_identity_reframe"));
  assert.ok(schema.workbook_or_product_blueprint.required_top_level_fields.includes("required_sheets"));
  assert.ok(schema.scenario_matrix.required_top_level_fields.includes("scenario_fixtures"));
  assert.ok(pac.failure_baseline_and_material_delta.required_fields.includes("prior_failed_baseline_refs"));
  assert.ok(pac.target_audience_contract.required_fields.includes("exact_trigger_moment"));
  assert.ok(pac.target_audience_contract.required_fields.includes("current_workaround"));
  assert.ok(pac.target_audience_contract.required_fields.includes("assumed_prior_knowledge"));
  assert.ok(pac.target_audience_contract.required_fields.includes("product_value_after_prior_knowledge"));
  assert.ok(pac.target_audience_contract.pass_fail_criteria.pass.includes("product_value_remains_material_after_assumed_prior_knowledge"));
  assert.ok(pac.target_audience_contract.pass_fail_criteria.fail.includes("product_is_only_a_faster_calculator_or_data_entry_shell_for_declared_buyer"));
  assert.ok(pac.buyer_behavior_contract.required_fields.includes("before_product_decision_workaround"));
  assert.ok(pac.buyer_behavior_contract.required_fields.includes("after_product_decision_delta"));
  assert.ok(pac.buyer_behavior_contract.pass_fail_criteria.pass.includes("product_changes_the_decision_quality_speed_or_consistency_vs_the_current_workaround"));
  assert.ok(pac.buyer_behavior_contract.pass_fail_criteria.fail.includes("product_only_reformats_inputs_the_buyer_already_knows_how_to_resolve_without_meaningful_decision_help"));
  assert.ok(delta.fail_if.includes("same_workbook_shape_same_formulas_same_outputs_without_buyer_value_delta"));
  assert.ok(delta.fail_if.includes("seed_data_weakens_the_declared_behavior_demo"));
  assert.ok(launchGate.fail_if.includes("launch_ready_claim_depends_on_governance_records_without_material_product_delta"));
});

test("FLOW-007 requires company memory preflight and findings ledger before runs", () => {
  const flow = load("workflows/FLOW-007.yaml")["FLOW-007"];
  const governance = load("governance/05_governance_rules.yaml").governance_rules;
  const exclusions = load("governance/product_lane_exclusions.yaml").product_lane_exclusions;
  const c004Failed = load("records/failed_product_labels/C-004-FAILED.yaml").failed_product_label;
  const c005Failed = load("records/failed_product_labels/C-005-FAILED.yaml").failed_product_label;
  const schema = load("specs/SCHEMA-007.yaml")["SCHEMA-007"];
  const ideaRun = load("templates/ideas-run-template.yaml").idea_run;
  const candidateRun = load("templates/candidates-run-template.yaml").candidate_run;
  const preflight = load("templates/company-memory-preflight-template.yaml").company_memory_preflight;
  const findings = load("templates/findings-ledger-template.yaml").findings_ledger;
  const launchGate = load("templates/launch-gate-template.yaml").launch_gate;

  assert.equal(flow.pre_run.required_before_step_id, "00_market_evidence");
  assert.equal(flow.pre_run.product_lane_exclusion_ref, "governance/product_lane_exclusions.yaml");
  assert.equal(flow.pre_run.admission_rules_ref, "governance/03_admission_rules.yaml");
  assert.equal(flow.pre_run.ideas_run_template_ref, "templates/ideas-run-template.yaml");
  assert.equal(flow.pre_run.candidate_run_template_ref, "templates/candidates-run-template.yaml");
  assert.equal(flow.pre_run.gate.product_lane_exclusion_check_required, true);
  assert.equal(flow.pre_run.gate.fresh_idea_generation_required, true);
  assert.equal(flow.pre_run.gate.fresh_candidate_admission_required_before_market_evidence, true);
  assert.equal(flow.pre_run.gate.multiple_viable_ideas_required_before_candidate_lock, true);
  assert.equal(flow.pre_run.gate.candidate_selection_rationale_required, true);
  assert.equal(flow.pre_run.gate.failed_product_labels_required_for_excluded_failed_asset_lanes, true);
  assert.equal(flow.pre_run.gate.excluded_product_lane_blocks_run_before_market_evidence, true);
  assert.equal(flow.pre_run.gate.company_memory_preflight_required, true);
  assert.equal(flow.pre_run.gate.findings_ledger_required, true);
  assert.equal(flow.pre_run.gate.build_findings_cannot_be_closed_by_governance_wording_only, true);
  assert.equal(flow.flow.find((stage) => stage.step_id === "10_build_readiness_review").gate.company_memory_preflight_pass_required, true);
  assert.ok(governance.flow_rules.includes("new_flow_007_runs_must_start_with_company_memory_preflight_and_findings_ledger"));
  assert.ok(governance.flow_rules.includes("new_flow_007_runs_must_check_product_lane_exclusions_before_market_evidence"));
  assert.ok(schema.company_memory_preflight.required_top_level_fields.includes("idea_run_ref"));
  assert.ok(schema.company_memory_preflight.required_top_level_fields.includes("candidate_run_ref"));
  assert.ok(schema.company_memory_preflight.required_top_level_fields.includes("build_findings"));
  assert.ok(schema.company_memory_preflight.required_top_level_fields.includes("product_lane_exclusion_check"));
  assert.ok(schema.idea_run.required_top_level_fields.includes("selected_idea_id"));
  assert.ok(schema.candidate_run.required_top_level_fields.includes("selection_rationale"));
  assert.equal(ideaRun.minimum_distinct_ideas_required, 3);
  assert.equal(ideaRun.direct_carryforward_rejected_without_fresh_idea_generation, true);
  assert.equal(candidateRun.reject_if_candidate_is_direct_carryforward_without_fresh_idea_set, true);
  assert.ok(schema.failed_product_label.required_top_level_fields.includes("future_build_input_policy"));
  assert.ok(schema.findings_ledger.required_top_level_fields.includes("governance_findings"));
  assert.ok(preflight.fail_if.includes("product_lane_exclusion_file_not_checked"));
  assert.ok(preflight.fail_if.includes("fresh_idea_generation_missing"));
  assert.ok(preflight.fail_if.includes("fewer_than_required_distinct_ideas_without_market_exhaustion_reason"));
  assert.ok(preflight.fail_if.includes("candidate_selected_without_why_this_not_that_rationale"));
  assert.ok(preflight.fail_if.includes("matched_failed_product_asset_lane_without_failed_product_label_records"));
  assert.ok(preflight.fail_if.includes("applicable_prior_failure_lesson_not_classified"));
  assert.equal(findings.closure_rules.open_applicable_findings_must_be_carried_to_launch_gate, true);
  assert.ok(launchGate.fail_if.includes("company_memory_preflight_or_findings_ledger_missing"));

  const lane = exclusions.lanes.find((entry) => entry.lane_id === "inventory_tracker_reorder_workbook");
  assert.equal(exclusions.enforcement.applies_to_flow_007_pre_run, true);
  assert.equal(lane.excluded_from_flow_007_pre_run, true);
  assert.ok(lane.source_candidate_refs.includes("C-004-001"));
  assert.ok(lane.source_candidate_refs.includes("C-005-001"));
  assert.ok(lane.failed_product_label_refs.includes("records/failed_product_labels/C-004-FAILED.yaml"));
  assert.ok(lane.failed_product_label_refs.includes("records/failed_product_labels/C-005-FAILED.yaml"));
  assert.ok(lane.failed_product_asset_refs.includes("archive/candidates/C-005-001/C-005-001-FAILED/product/Inventory-Tracker-Studio.xlsx"));
  assert.ok(lane.keyword_match_terms.includes("reorder planner"));
  assert.equal(c004Failed.label_id, "C-004-FAILED");
  assert.equal(c005Failed.label_id, "C-005-FAILED");
  assert.equal(c004Failed.status, "ACTIVE_FAILED_LABEL");
  assert.equal(c005Failed.status, "ACTIVE_FAILED_LABEL");
  assert.ok(c004Failed.failed_asset_refs.every((assetRef) => assetRef.startsWith("archive/candidates/")));
  assert.ok(c005Failed.failed_asset_refs.every((assetRef) => assetRef.startsWith("archive/candidates/")));
  assert.ok(c005Failed.future_build_input_policy.must_not_be_used_as.includes("product_blueprint"));
});

test("FLOW-007 first three pilots require aggressive gpt-5.5 frontier gates", () => {
  const model = load("specs/MODEL-007.yaml")["MODEL-007"];
  const dispatch = load("governance/09_stage_dispatch_007.yaml").stage_dispatch;
  const pilotPolicy = load("governance/10_flow_007_pilot_policy.yaml").flow_007_pilot_policy;
  const budget = load("governance/08_product_generation_budget_007.yaml").product_generation_budget;
  const governance = load("governance/05_governance_rules.yaml").governance_rules;

  assert.equal(pilotPolicy.frontier_model, "gpt-5.5");
  assert.ok(pilotPolicy.prohibited_models.includes("gpt-5.5-pro"));
  assert.ok(pilotPolicy.prohibited_models.includes("any pro model"));
  assert.equal(pilotPolicy.cost_control.hard_stop_api_cost_usd, 40);
  assert.equal(pilotPolicy.mandatory_frontier_stages.length, 17);
  assert.ok(pilotPolicy.mandatory_frontier_stages.every((stage) => stage.requested_model === "gpt-5.5"));
  assert.equal(model.first_three_pilots_override.frontier_model, "gpt-5.5");
  assert.equal(dispatch.enforcement.pro_model_substitution_forbidden, true);
  assert.equal(dispatch.stage_model_map["00_market_evidence"].requested_model, "gpt-5.4");
  assert.equal(dispatch.stage_model_map["03_competitor_selection_purchase_approval"].dispatch_action, "human_gate");
  assert.equal(dispatch.stage_model_map["05_target_audience_lock"].requested_model, "gpt-5.5");
  assert.equal(dispatch.stage_model_map["11_pre_build_architecture_premortem"].requested_model, "gpt-5.5");
  assert.equal(dispatch.stage_model_map["12_product_build"].requested_model, "gpt-5.4");
  assert.equal(dispatch.stage_model_map["14_blind_buyer_walkthrough"].requested_model, "gpt-5.5");
  assert.equal(dispatch.stage_model_map["15_listing_packaging_qa"].requested_model, "gpt-5.4");
  assert.equal(dispatch.pilot_mandatory_frontier_stage_model_map["17_launch_gate"].requested_model, "gpt-5.5");
  assert.equal(budget.total_hard_budget_usd, 40);
  assert.ok(!governance.flow_rules.includes("candidate_domain_brief_is_required_before_competitor_selection"));
});

test("C-004-001 is preserved as a FLOW-006 failure case and blocked by FLOW-007 dry validation", () => {
  const validation = load("records/flow_007_validation/F7V-C-004-001.yaml").flow_007_validation;
  const failureCase = fs.readFileSync(path.join(repoRoot, "records/failure-cases/C-004-001-FLOW-006-postmortem.md"), "utf8");

  assert.match(failureCase, /FLOW-006 allowed artifact generation before the product had a locked buyer-behavior and domain-model contract\./);
  assert.match(failureCase, /Opening Stock as a static SKU field was architecturally wrong\./);
  assert.equal(validation.artifact_rebuild_performed, false);
  assert.equal(validation.build_readiness.status, "NOT_BUILD_READY");
  assert.equal(validation.result.product_generation_allowed, false);
  assert.equal(validation.result.launch_status_allowed, false);
  assert.ok(validation.expected_blockers.includes("scenario matrix would fail supplier/lead-time/receipt/stock-count-change cases"));
});

test("Runtime launcher pauses cleanly at the FLOW-007 purchase approval gate during dry runs", () => {
  const result = spawnSync("node", [
    "runtime/model-stage-launcher.mjs",
    "--run-id",
    "R-007",
    "--candidate-ref",
    "C-007-001",
    "--dry-run",
    "--stop-at",
    "04_purchased_competitor_inspection",
  ], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout);
  assert.equal(summary.dryRun, true);
  assert.equal(summary.stages.at(-1)?.stepId, "03_competitor_selection_purchase_approval");
  assert.equal(summary.stages.at(-1)?.observedModel, "human");
});

test("FLOW-007 live templates no longer require candidate domain briefs", () => {
  const buildManifest = load("templates/build-manifest-template.yaml").build_manifest;
  const candidateRun = load("templates/candidates-run-template.yaml").candidate_run;
  const purchase = load("templates/competitive-purchase-approval-template.yaml").competitive_purchase_approval;
  const inspection = load("templates/purchased-competitor-inspection-template.yaml").purchased_competitor_inspection;
  const listing = load("templates/listing-spec-template.yaml").listing_spec;
  const product = load("templates/product-spec-template.yaml").product_spec;
  const delivery = load("templates/delivery-spec-template.yaml").delivery_spec;
  const geh = load("templates/good-enough-for-humans-spec-template.yaml").good_enough_for_humans_spec;
  const runLedger = load("templates/model-run-ledger-template.yaml").model_run_ledger;
  const dispatchTemplate = load("templates/model-stage-dispatch-template.yaml").model_stage_dispatch;

  assert.ok(!("candidate_domain_brief_ref" in buildManifest));
  assert.ok(!buildManifest.ready_for_publish_requires.includes("candidate_domain_brief_complete"));
  assert.ok(!("candidate_domain_brief_ref" in candidateRun.candidates[0]));
  assert.ok(!("candidate_domain_brief_ref" in purchase));
  assert.ok(!("candidate_domain_brief_ref" in inspection));
  assert.ok(!("domain_brief_application" in listing));
  assert.ok(!("domain_brief_application" in product));
  assert.ok(!("domain_brief_application" in delivery));
  assert.ok(!("domain_brief_application" in geh));
  assert.ok(!("candidate_domain_brief_ref" in runLedger.stages[0]));
  assert.ok(!("candidate_domain_brief_ref" in dispatchTemplate.stages[0]));
});
