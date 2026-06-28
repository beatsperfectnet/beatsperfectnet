import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { validateFlow006Contracts } from "../validators/flow-006-validator.mjs";

const repoRoot = process.cwd();

function load(relativePath) {
  return YAML.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

test("FLOW-006 contracts validate", () => {
  assert.equal(validateFlow006Contracts(), true);
});

test("FLOW-006 is active and keeps founder acceptance before listing", () => {
  const flow006 = load("workflows/FLOW-006.yaml")["FLOW-006"];
  const governance = load("governance/05_governance_rules.yaml").governance_rules;
  const stepIds006 = flow006.flow.map((stage) => stage.step_id);

  assert.equal(stepIds006.includes("08_founder_acceptance_simulation"), true);
  assert.ok(stepIds006.indexOf("08_founder_acceptance_simulation") < stepIds006.indexOf("10_listing_creative_assembly"));
  assert.ok(stepIds006.indexOf("11_listing_quality_gate") < stepIds006.indexOf("11b_pre_mortem_failure_analysis"));
  assert.ok(stepIds006.indexOf("11b_pre_mortem_failure_analysis") < stepIds006.indexOf("12_delivery_launch"));
  assert.equal(load("config/active-flow.yaml").active_flow_id, "FLOW-006");
  assert.equal(governance.active_rule_contracts.company_memory, "docs/COMPANY-MEMORY.md");
  assert.ok(governance.human_owned.includes("docs/COMPANY-MEMORY.md"));
  assert.ok(governance.flow_rules.includes("material_flow_or_governance_changes_must_update_company_memory_with_reason_failure_learning_and_prevention_target"));
  assert.equal(fs.existsSync(path.join(repoRoot, "docs/COMPANY-MEMORY.md")), true);
});

test("Founder corpus captures current rejection patterns", () => {
  const corpus = load("specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml").founder_acceptance_corpus;
  const ids = corpus.rejection_patterns.map((pattern) => pattern.pattern_id);

  assert.ok(ids.includes("demo_scale_rows"));
  assert.ok(ids.includes("same_demo_workbook_after_rerun"));
  assert.ok(ids.includes("developerish_buyer_copy"));
  assert.ok(ids.includes("tiny_listing_surface"));
  assert.ok(ids.includes("report_slide_listing_asset"));
  assert.ok(ids.includes("clean_listing_without_real_hook"));
  assert.ok(ids.includes("feature_list_instead_of_promise"));
  assert.ok(ids.includes("jtbd_defined_as_output_not_behavior"));
  assert.ok(ids.includes("competitor_failure_treated_as_blocker"));
  assert.ok(ids.includes("market_research_tool_missing_but_flow_continued"));
  assert.ok(ids.includes("paid_rerun_same_outcome"));
  assert.ok(ids.includes("record_pass_without_artifact_proof"));
  assert.ok(ids.includes("jtbd_decision_outputs_missing"));
});

test("FLOW-006 blocks good-enough-demo reruns and hookless clean listings", () => {
  const flow = load("workflows/FLOW-006.yaml")["FLOW-006"];
  const schema = load("specs/SCHEMA-006.yaml")["SCHEMA-006"];
  const model = load("specs/MODEL-006.yaml")["MODEL-006"];
  const bls = load("specs/BLS-006.yaml")["BLS-006"];
  const budget = load("governance/08_product_generation_budget_006.yaml").product_generation_budget;

  const build = flow.flow.find((stage) => stage.step_id === "06_first_pass_connected_build");
  assert.equal(build.gate.buyer_behavior_contract_consumed_required, true);
  assert.equal(build.gate.visible_human_scale_capacity_required, true);
  assert.equal(build.gate.material_delta_against_prior_failed_artifact_required, true);
  assert.equal(build.gate.regenerated_timestamps_do_not_count_as_artifact_delta, true);

  const founder = flow.flow.find((stage) => stage.step_id === "08_founder_acceptance_simulation");
  assert.ok(founder.action.includes("run_blind_buyer_behavior_walkthrough_from_first_open_to_next_action"));
  assert.ok(founder.action.includes("fail_if_jtbd_is_defined_as_output_or_feature_scope_without_buyer_behavior_loop"));
  assert.ok(founder.action.includes("fail_if_current_artifact_is_same_demo_workbook_after_rerun"));
  assert.ok(founder.action.includes("fail_if_paid_rerun_produced_same_outcome"));
  assert.equal(founder.gate.material_artifact_delta_required, true);
  assert.equal(founder.gate.cost_outcome_accountability_required, true);

  const launch = flow.flow.find((stage) => stage.step_id === "12_delivery_launch");
  assert.ok(launch.gate.ready_status_requires.includes("buyer_behavior_contract_pass"));
  assert.ok(launch.gate.ready_status_requires.includes("buyer_behavior_walkthrough_pass"));
  assert.ok(launch.gate.ready_status_requires.includes("executable_adversarial_scenarios_pass"));
  assert.ok(launch.gate.ready_status_requires.includes("visible_human_scale_capacity_pass"));
  assert.ok(launch.gate.ready_status_requires.includes("material_artifact_delta_pass"));
  assert.ok(launch.gate.ready_status_requires.includes("per_image_real_hook_pass"));
  assert.ok(launch.gate.ready_status_requires.includes("cost_outcome_accountability_pass"));
  assert.ok(launch.gate.ready_status_requires.includes("pre_mortem_failure_analysis_complete"));
  assert.ok(launch.gate.ready_status_requires.includes("pre_mortem_launch_blockers_absent"));

  assert.ok(schema.first_pass_build_manifest.required_top_level_fields.includes("artifact_delta_against_prior"));
  assert.ok(schema.first_pass_build_manifest.required_top_level_fields.includes("buyer_behavior_contract_ref"));
  assert.ok(schema.qa_result.required_top_level_fields.includes("buyer_behavior_walkthrough_results"));
  assert.ok(schema.qa_result.required_top_level_fields.includes("executable_adversarial_scenario_results"));
  assert.ok(schema.qa_result.required_top_level_fields.includes("visible_capacity_results"));
  assert.ok(schema.founder_acceptance_simulation.required_top_level_fields.includes("blind_buyer_behavior_walkthrough"));
  assert.ok(schema.founder_acceptance_simulation.required_top_level_fields.includes("cost_outcome_accountability"));
  assert.ok(schema.listing_quality_gate.required_top_level_fields.includes("real_hook_quality_gate"));
  assert.ok(schema.launch_package.ready_for_marketplace_publish_requires.includes("per_image_real_hook_pass"));
  assert.ok(schema.launch_package.ready_for_marketplace_publish_requires.includes("buyer_behavior_contract_pass"));
  assert.ok(schema.launch_package.ready_for_marketplace_publish_requires.includes("buyer_behavior_walkthrough_pass"));
  assert.ok(schema.launch_package.ready_for_marketplace_publish_requires.includes("executable_adversarial_scenarios_pass"));
  assert.ok(schema.launch_package.ready_for_marketplace_publish_requires.includes("pre_mortem_failure_analysis_complete"));
  assert.ok(schema.launch_package.ready_for_marketplace_publish_requires.includes("pre_mortem_launch_blockers_absent"));

  assert.ok(model.stage_quality_rules.founder_acceptance_simulation.fail_if.includes("product_visible_capacity_matches_prior_failed_demo_version"));
  assert.ok(model.stage_quality_rules.founder_acceptance_simulation.fail_if.includes("jtbd_is_defined_as_output_or_feature_scope_without_buyer_behavior_loop"));
  assert.ok(model.stage_quality_rules.founder_acceptance_simulation.fail_if.includes("listing_hook_criteria_would_allow_clean_layout_without_real_hook"));
  assert.ok(model.stage_quality_rules.listing_quality_gate.fail_if.includes("clean_assets_lack_real_hook"));

  assert.ok(bls.launch_requires.includes("material_artifact_delta_passed"));
  assert.ok(bls.launch_requires.includes("buyer_behavior_contract_passed"));
  assert.ok(bls.launch_requires.includes("buyer_behavior_walkthrough_passed"));
  assert.ok(bls.launch_requires.includes("executable_adversarial_scenarios_passed"));
  assert.ok(bls.launch_requires.includes("cost_outcome_accountability_passed"));
  assert.ok(bls.launch_requires.includes("pre_mortem_failure_analysis_completed"));
  assert.ok(bls.launch_requires.includes("pre_mortem_launch_blockers_absent"));
  assert.equal(budget.hard_stop_rules.paid_rerun_must_stop_if_material_artifact_delta_is_absent, true);
});

test("FLOW-006 runs one evidence-bound pre-mortem before delivery launch", () => {
  const flow = load("workflows/FLOW-006.yaml")["FLOW-006"];
  const schema = load("specs/SCHEMA-006.yaml")["SCHEMA-006"];
  const model = load("specs/MODEL-006.yaml")["MODEL-006"];
  const dispatch = load("governance/09_stage_dispatch_006.yaml").stage_dispatch;
  const bls = load("specs/BLS-006.yaml")["BLS-006"];

  const stepIds = flow.flow.map((stage) => stage.step_id);
  const preMortem = flow.flow.find((stage) => stage.step_id === "11b_pre_mortem_failure_analysis");
  assert.ok(stepIds.indexOf("11_listing_quality_gate") < stepIds.indexOf("11b_pre_mortem_failure_analysis"));
  assert.ok(stepIds.indexOf("11b_pre_mortem_failure_analysis") < stepIds.indexOf("12_delivery_launch"));
  assert.equal(preMortem.agent_tier, "frontier");
  assert.equal(preMortem.gate.one_pass_only, true);
  assert.equal(preMortem.gate.unsupported_scope_expansion_forbidden, true);
  assert.ok(preMortem.action.includes("inspect_delivered_product_assets"));
  assert.ok(preMortem.action.includes("inspect_listing_images_title_and_description"));
  assert.ok(preMortem.action.includes("inspect_delivery_readme_and_onboarding"));
  assert.ok(preMortem.action.includes("inspect_company_memory"));
  assert.ok(preMortem.action.includes("identify_top_3_likely_failure_modes_using_only_current_product_listing_delivery_and_market_evidence"));
  assert.ok(preMortem.action.includes("forbid_new_product_scope_unless_locked_buyer_behavior_jtbd_or_marketplace_evidence_proves_the_failure"));

  assert.ok(schema.pre_mortem_failure_analysis.required_top_level_fields.includes("top_3_likely_failure_modes"));
  assert.ok(schema.pre_mortem_failure_analysis.required_top_level_fields.includes("failure_mode_classification"));
  assert.ok(schema.pre_mortem_failure_analysis.required_top_level_fields.includes("rerun_from_step_by_blocker"));
  assert.ok(schema.pre_mortem_failure_analysis.required_top_level_fields.includes("post_launch_signal_by_watchlist"));
  assert.equal(schema.pre_mortem_failure_analysis.feature_scope_rule.unproven_failure_imagination_cannot_create_product_scope, true);

  assert.equal(model.stage_routing.pre_mortem_failure_analysis.requested_model, "gpt-5.5");
  assert.ok(model.stage_quality_rules.pre_mortem_failure_analysis.required_outputs.includes("scope_bloat_check"));
  assert.ok(model.stage_quality_rules.pre_mortem_failure_analysis.fail_if.includes("proposed_feature_is_not_proven_by_locked_buyer_behavior_jtbd_or_marketplace_evidence"));
  assert.equal(dispatch.stage_model_map["11b_pre_mortem_failure_analysis"].model_policy_ref, "MODEL-006.pre_mortem_failure_analysis");
  assert.ok(bls.pre_launch_tracking.includes("pre_mortem_watchlist_signals"));
});

test("FLOW-006 requires a machine-checkable JTBD-KPP-RTB product contract before build", () => {
  const flow = load("workflows/FLOW-006.yaml")["FLOW-006"];
  const schema = load("specs/SCHEMA-006.yaml")["SCHEMA-006"];
  const model = load("specs/MODEL-006.yaml")["MODEL-006"];
  const bls = load("specs/BLS-006.yaml")["BLS-006"];

  const spec = flow.flow.find((stage) => stage.step_id === "05_one_promise_propagation_system_spec");
  assert.ok(spec.action.includes("define_buyer_behavior_contract_before_build"));
  assert.ok(spec.action.includes("define_adversarial_buyer_scenarios_generated_from_behavior_failures_and_domain_invariants"));
  assert.ok(spec.action.includes("define_machine_checkable_product_contract_before_build"));
  assert.ok(spec.action.includes("define_primary_buyer_decision_outputs_required_by_jtbd_and_kpp"));
  assert.ok(spec.action.includes("define_jtbd_truth_table_tests_generated_from_primary_buyer_decision"));
  assert.equal(spec.gate.buyer_behavior_contract_required, true);
  assert.equal(spec.gate.adversarial_buyer_scenarios_required, true);
  assert.equal(spec.gate.machine_checkable_product_contract_required, true);
  assert.equal(spec.gate.shallow_status_or_feature_substitute_for_kpp_forbidden, true);

  const build = flow.flow.find((stage) => stage.step_id === "06_first_pass_connected_build");
  assert.ok(build.action.includes("consume_buyer_behavior_contract"));
  assert.ok(build.action.includes("implement_next_action_map_so_each_decision_output_tells_the_buyer_what_to_do"));
  assert.ok(build.action.includes("consume_machine_checkable_product_contract"));
  assert.ok(build.action.includes("implement_primary_buyer_decision_outputs_from_contract"));
  assert.equal(build.gate.primary_buyer_decision_outputs_implemented_required, true);

  const qa = flow.flow.find((stage) => stage.step_id === "07_propagation_buyer_experience_product_visual_qa");
  assert.ok(qa.action.includes("run_buyer_behavior_walkthrough_tests_against_visible_workbook_instructions"));
  assert.ok(qa.action.includes("run_executable_adversarial_scenario_mutation_tests_on_temporary_artifact_copy"));
  assert.ok(qa.action.includes("fail_if_mutation_tests_only_inspect_formula_references_without_recalculated_before_after_outputs"));
  assert.ok(qa.action.includes("run_jtbd_truth_table_tests_against_primary_buyer_decision_outputs"));
  assert.ok(qa.action.includes("fail_if_kpp_is_satisfied_only_by_feature_list_status_label_or_dashboard_count"));
  assert.equal(qa.gate.buyer_behavior_walkthrough_required, true);
  assert.equal(qa.gate.executable_adversarial_scenario_mutations_required, true);
  assert.equal(qa.gate.jtbd_truth_table_required, true);

  const launch = flow.flow.find((stage) => stage.step_id === "12_delivery_launch");
  assert.ok(launch.gate.ready_status_requires.includes("buyer_behavior_contract_pass"));
  assert.ok(launch.gate.ready_status_requires.includes("buyer_behavior_walkthrough_pass"));
  assert.ok(launch.gate.ready_status_requires.includes("executable_adversarial_scenarios_pass"));
  assert.ok(launch.gate.ready_status_requires.includes("machine_checkable_product_contract_pass"));
  assert.ok(launch.gate.ready_status_requires.includes("jtbd_decision_outputs_pass"));

  assert.ok(schema.propagation_system_spec.required_top_level_fields.includes("buyer_behavior_contract"));
  assert.ok(schema.propagation_system_spec.required_top_level_fields.includes("next_action_map"));
  assert.ok(schema.propagation_system_spec.required_top_level_fields.includes("domain_invariants"));
  assert.ok(schema.propagation_system_spec.required_top_level_fields.includes("adversarial_buyer_scenarios"));
  assert.ok(schema.propagation_system_spec.required_top_level_fields.includes("machine_checkable_product_contract"));
  assert.ok(schema.propagation_system_spec.required_top_level_fields.includes("primary_buyer_decision_contract"));
  assert.ok(schema.propagation_system_spec.required_top_level_fields.includes("jtbd_truth_table_tests"));
  assert.ok(schema.first_pass_build_manifest.required_top_level_fields.includes("primary_buyer_decision_outputs"));
  assert.ok(schema.qa_result.required_top_level_fields.includes("jtbd_truth_table_results"));
  assert.ok(schema.founder_acceptance_simulation.required_top_level_fields.includes("missing_decision_outputs"));
  assert.ok(schema.launch_package.ready_for_marketplace_publish_requires.includes("jtbd_decision_outputs_pass"));

  assert.ok(model.stage_quality_rules.one_promise_propagation_system_spec.spreadsheet_required_outputs.includes("buyer_behavior_contract"));
  assert.ok(model.stage_quality_rules.one_promise_propagation_system_spec.spreadsheet_required_outputs.includes("adversarial_buyer_scenarios"));
  assert.ok(model.stage_quality_rules.one_promise_propagation_system_spec.fail_if.includes("jtbd_is_defined_as_output_feature_scope_product_category_or_status_without_buyer_behavior_loop"));
  assert.ok(model.stage_quality_rules.one_promise_propagation_system_spec.spreadsheet_required_outputs.includes("machine_checkable_product_contract"));
  assert.ok(model.stage_quality_rules.qa_execution.required_results.includes("buyer_behavior_walkthrough_results"));
  assert.ok(model.stage_quality_rules.qa_execution.required_results.includes("executable_adversarial_scenario_results"));
  assert.ok(model.stage_quality_rules.qa_execution.fail_if.includes("kpp_passes_only_because_a_feature_status_label_or_dashboard_count_exists"));
  assert.ok(model.stage_quality_rules.founder_acceptance_simulation.fail_if.includes("primary_jtbd_decision_outputs_are_missing_or_only_in_prose"));

  assert.ok(bls.pre_launch_tracking.includes("buyer_behavior_contract_ref"));
  assert.ok(bls.launch_requires.includes("buyer_behavior_contract_passed"));
  assert.ok(bls.pre_launch_tracking.includes("machine_checkable_product_contract_ref"));
  assert.ok(bls.launch_requires.includes("machine_checkable_product_contract_passed"));
  assert.ok(bls.launch_requires.includes("jtbd_decision_outputs_passed"));
});

test("Runtime launcher can derive FLOW-006 policy and budget by suffix", () => {
  const launcher = fs.readFileSync(path.join(repoRoot, "runtime/model-stage-launcher.mjs"), "utf8");

  assert.match(launcher, /const flowSuffix = flowVersion\.split\('-'\)\[1\]/);
  assert.match(launcher, /const modelPolicyRef = `specs\/MODEL-\$\{flowSuffix\}\.yaml`/);
  assert.match(launcher, /const generationBudgetRef = `governance\/08_product_generation_budget_\$\{flowSuffix\}\.yaml`/);
});

test("Dashboard state keeps C-004 in synthesis and derives period costs from the ledger", () => {
  const dashboard = load("records/dashboard_state.yaml");
  const c004 = dashboard.today.inFlightCandidates.find((candidate) => candidate.candidateId === "C-004-001");
  const today = dashboard.today.totals;
  const period = dashboard.period.totals;
  const todayBucket = dashboard.period.buckets.find((bucket) => bucket.date === "2026-06-28");

  assert.equal(c004.outcomeStatus, "in_flight");
  assert.equal(c004.currentStepId, "04_alignment_synthesis");
  assert.equal(c004.currentStageGroup, "synthesis");
  assert.equal(c004.processHealth, "yellow");
  assert.equal(c004.totalUsdSpent, 21);

  assert.equal(today.totalSpendUsd, 11);
  assert.equal(today.productApiCostUsd, 3);
  assert.equal(today.governanceApiCostUsd, 8);
  assert.equal(today.humanEscalationsTotal, 1);

  assert.equal(period.usdTotalSpend, 137.8);
  assert.equal(period.totalApiCostUsd, 137.8);
  assert.equal(period.productApiCostUsd, 74.4);
  assert.equal(period.governanceApiCostUsd, 63.4);
  assert.equal(period.rejectedProductApiCostUsd, 25.4);
  assert.equal(todayBucket.totalApiCostUsd, 11);
  assert.equal(todayBucket.rejectedProductApiCostUsd, 0);
});
