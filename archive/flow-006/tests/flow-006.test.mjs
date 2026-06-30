import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import YAML from "yaml";
import { validateFlow006Contracts } from "../validators/flow-006-validator.mjs";

const repoRoot = process.cwd();

function load(relativePath) {
  return YAML.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

test("FLOW-006 contracts validate", () => {
  assert.equal(validateFlow006Contracts(), true);
});

test("C-004 repaired artifact is enforced by deterministic workbook validation", () => {
  const result = spawnSync("python3", ["validators/c004_artifact_validator.py"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("C-004 repaired rerun records cannot claim pass with missed human blockers", () => {
  const candidates = load("records/candidates/R-004.yaml").candidates;
  const c004 = candidates.find((candidate) => candidate.candidate_id === "C-004-001");
  const qa = load("records/validation/QA-C-004-001-R2.yaml").qa_result;
  const founder = load("records/validation/FA-C-004-001-R2.yaml").founder_acceptance_simulation;
  const preMortem = load("records/validation/PM-C-004-001-R2.yaml").pre_mortem_failure_analysis;
  const launch = load("records/validation/LR-C-004-001-R2.yaml").launch_package;

  assert.equal(c004.current_stage, "12_delivery_launch");
  assert.equal(c004.last_rerun.result, "pass_pending_marketplace_publish");
  assert.equal(c004.last_rerun.external_publish_status, "not_run");

  assert.equal(qa.derived_reorder_point_results.status, "pass");
  assert.equal(qa.negative_on_hand_invariant_results.status, "pass");
  assert.equal(qa.blank_formula_ready_capacity_results.status, "pass");
  assert.equal(qa.helper_behavior_walkthrough_results.status, "pass");

  assert.equal(founder.founder_acceptance_status, "pass");
  assert.equal(founder.publish_blockers.status, "pass");
  assert.deepEqual(founder.rejection_reasons, []);

  assert.equal(preMortem.status, "pass_watchlist_only");
  assert.deepEqual(preMortem.launch_blockers, []);
  assert.deepEqual(preMortem.missed_launch_blockers_after_human_review, []);

  assert.equal(launch.status, "pass_pending_marketplace_publish");
  assert.equal(launch.prepublish_validation.publish_blockers_absent, true);
  assert.equal(launch.publish_blockers.status, "pass");
  assert.equal(launch.external_publish_approval.decision, "pending");
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
  assert.ok(ids.includes("negative_on_hand_presented_as_healthy"));
  assert.ok(ids.includes("reorder_point_input_instead_of_derived"));
  assert.ok(ids.includes("fully_prefilled_working_capacity"));
  assert.ok(ids.includes("unclear_helper_behavior_scenario"));
});

test("FLOW-006 blocks C-004 inventory replenishment rerun failure modes", () => {
  const flow = load("workflows/FLOW-006.yaml")["FLOW-006"];
  const schema = load("specs/SCHEMA-006.yaml")["SCHEMA-006"];
  const model = load("specs/MODEL-006.yaml")["MODEL-006"];
  const bls = load("specs/BLS-006.yaml")["BLS-006"];
  const corpus = load("specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml").founder_acceptance_corpus;

  const spec = flow.flow.find((stage) => stage.step_id === "05_one_promise_propagation_system_spec");
  assert.ok(spec.action.includes("define_derived_reorder_point_policy_for_inventory_replenishment_from_lead_time_sales_velocity_and_buffer"));
  assert.ok(spec.action.includes("forbid_reorder_point_as_buyer_input_when_lead_time_sales_velocity_and_buffer_can_derive_it"));
  assert.ok(spec.action.includes("define_negative_on_hand_handling_as_block_or_review_not_healthy_no_action_or_publishable"));
  assert.ok(spec.action.includes("define_helper_behavior_scenario_as_step_by_step_input_to_transformation_to_output_to_next_action_walkthrough"));
  assert.equal(spec.gate.derived_reorder_point_policy_required_when_inventory_replenishment_applicable, true);
  assert.equal(spec.gate.negative_on_hand_handling_required_when_inventory_applicable, true);
  assert.equal(spec.gate.helper_behavior_scenario_required, true);

  const build = flow.flow.find((stage) => stage.step_id === "06_first_pass_connected_build");
  assert.ok(build.action.includes("derive_reorder_point_from_lead_time_sales_velocity_and_buffer_when_inventory_replenishment_applicable"));
  assert.ok(build.action.includes("block_or_flag_negative_on_hand_before_any_healthy_success_no_action_or_publish_state"));
  assert.ok(build.action.includes("keep_non_seed_capacity_rows_empty_for_buyer_use_while_preserving_formulas_validation_and_expansion"));
  assert.ok(build.action.includes("build_start_here_helper_as_clear_step_by_step_behavior_scenario_not_vague_feature_guidance"));

  const qa = flow.flow.find((stage) => stage.step_id === "07_propagation_buyer_experience_product_visual_qa");
  assert.ok(qa.action.includes("fail_if_negative_on_hand_is_labeled_healthy_successful_no_action_or_publishable"));
  assert.ok(qa.action.includes("fail_if_reorder_point_is_buyer_input_when_it_should_be_derived_from_lead_time_sales_velocity_and_buffer"));
  assert.ok(qa.action.includes("fail_if_all_working_capacity_rows_are_prefilled_instead_of_few_seed_examples_plus_blank_formula_ready_rows"));
  assert.ok(qa.action.includes("fail_if_helper_does_not_walk_buyer_step_by_step_from_inputs_to_results_to_next_action"));

  const founder = flow.flow.find((stage) => stage.step_id === "08_founder_acceptance_simulation");
  assert.ok(founder.action.includes("inspect_derived_reorder_point_logic_for_inventory_replenishment_products"));
  assert.ok(founder.action.includes("fail_if_negative_on_hand_or_other_domain_impossibility_is_presented_as_healthy_no_action_or_publishable"));
  assert.ok(founder.action.includes("fail_if_helper_or_start_here_is_not_a_clear_step_by_step_behavior_scenario"));

  const preMortem = flow.flow.find((stage) => stage.step_id === "11b_pre_mortem_failure_analysis");
  assert.ok(preMortem.action.includes("audit_product_logic_blockers_against_company_memory_and_founder_corpus"));
  assert.ok(preMortem.action.includes("inspect_inventory_replenishment_logic_for_derived_reorder_point_and_negative_on_hand_handling_when_applicable"));
  assert.ok(preMortem.action.includes("inspect_working_capacity_for_few_seed_examples_plus_blank_formula_ready_rows"));
  assert.equal(preMortem.gate.product_logic_blocker_audit_required, true);

  assert.ok(schema.propagation_system_spec.required_top_level_fields.includes("derived_reorder_point_policy"));
  assert.ok(schema.propagation_system_spec.required_top_level_fields.includes("negative_on_hand_handling"));
  assert.ok(schema.propagation_system_spec.required_top_level_fields.includes("helper_behavior_scenario"));
  assert.ok(schema.qa_result.required_top_level_fields.includes("derived_reorder_point_results"));
  assert.ok(schema.qa_result.required_top_level_fields.includes("negative_on_hand_invariant_results"));
  assert.ok(schema.qa_result.required_top_level_fields.includes("blank_formula_ready_capacity_results"));
  assert.ok(schema.qa_result.required_top_level_fields.includes("helper_behavior_walkthrough_results"));
  assert.ok(schema.pre_mortem_failure_analysis.required_top_level_fields.includes("product_logic_blocker_audit"));

  assert.ok(model.stage_quality_rules.one_promise_propagation_system_spec.fail_if.includes("inventory_replenishment_spec_exposes_reorder_point_as_buyer_input_when_lead_time_sales_velocity_and_buffer_should_derive_it"));
  assert.ok(model.stage_quality_rules.qa_execution.fail_if.includes("negative_on_hand_is_presented_as_healthy_successful_no_action_or_publishable"));
  assert.ok(model.stage_quality_rules.founder_acceptance_simulation.fail_if.includes("helper_or_start_here_does_not_provide_a_clear_step_by_step_behavior_scenario"));
  assert.ok(model.stage_quality_rules.pre_mortem_failure_analysis.fail_if.includes("product_logic_blocker_audit_misses_negative_on_hand_derived_reorder_point_blank_capacity_or_helper_behavior_failures_when_visible_in_current_assets"));

  const ids = corpus.rejection_patterns.map((pattern) => pattern.pattern_id);
  assert.ok(ids.includes("negative_on_hand_presented_as_healthy"));
  assert.ok(ids.includes("reorder_point_input_instead_of_derived"));
  assert.ok(ids.includes("fully_prefilled_working_capacity"));
  assert.ok(ids.includes("unclear_helper_behavior_scenario"));

  assert.ok(bls.launch_requires.includes("derived_reorder_point_passed_or_not_applicable_with_reason"));
  assert.ok(bls.launch_requires.includes("negative_on_hand_invariant_passed_or_not_applicable_with_reason"));
  assert.ok(bls.launch_requires.includes("non_seed_capacity_blank_formula_ready_passed"));
  assert.ok(bls.launch_requires.includes("helper_behavior_scenario_passed"));
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

test("Runtime launcher records and publishes dashboard state after step changes", () => {
  const launcher = fs.readFileSync(path.join(repoRoot, "runtime/model-stage-launcher.mjs"), "utf8");
  const publisher = fs.readFileSync(path.join(repoRoot, "scripts/publish-dashboard-state.mjs"), "utf8");

  assert.match(launcher, /function writeFlowStepChange\(/);
  assert.match(launcher, /records['"], ['"]flow_step_changes/);
  assert.match(launcher, /Completed \$\{stage\.step_id\}; \$\{nextStage\.step_id\} is now active\./);
  assert.match(launcher, /publishDashboardState\(/);
  assert.match(launcher, /publishDashboardState: true/);
  assert.match(launcher, /--no-publish-dashboard-state/);

  assert.match(publisher, /records\/flow_step_changes/);
  assert.match(publisher, /gitOutput\(\["status", "--short", "--", \.\.\.publishPaths\]\)/);
});

test("Dashboard generator derives current step from flow step-change events", () => {
  const generator = fs.readFileSync(path.join(repoRoot, "scripts/update-dashboard-state.mjs"), "utf8");

  assert.match(generator, /function flowStepChanges\(/);
  assert.match(generator, /function latestFlowStepChangeForCandidate\(/);
  assert.match(generator, /latestStepChange\?\.to_step_id \|\| latestStepChange\?\.from_step_id/);
  assert.match(generator, /latestFlowStepChangeAfterActiveContractChange/);
  assert.match(generator, /latestStepChange: \{/);
});

test("Dashboard state keeps repaired C-004 at local launch pending external publish and derives period costs from the ledger", () => {
  const dashboard = load("records/dashboard_state.yaml");
  const c004 = dashboard.today.inFlightCandidates.find((candidate) => candidate.candidateId === "C-004-001");
  const today = dashboard.today.totals;
  const period = dashboard.period.totals;
  const todayBucket = dashboard.period.buckets.find((bucket) => bucket.date === "2026-06-28");

  assert.equal(c004.outcomeStatus, "in_flight");
  assert.equal(c004.currentStepId, "12_delivery_launch");
  assert.equal(c004.currentStageGroup, "launch");
  assert.equal(c004.processHealth, "green");
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
