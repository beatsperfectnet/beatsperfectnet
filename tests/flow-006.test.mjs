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

test("FLOW-006 preserves FLOW-005 and adds founder acceptance before listing", () => {
  const flow005 = load("workflows/FLOW-005.yaml")["FLOW-005"];
  const flow006 = load("workflows/FLOW-006.yaml")["FLOW-006"];
  const stepIds005 = flow005.flow.map((stage) => stage.step_id);
  const stepIds006 = flow006.flow.map((stage) => stage.step_id);

  assert.equal(stepIds005.includes("08_founder_acceptance_simulation"), false);
  assert.equal(stepIds006.includes("08_founder_acceptance_simulation"), true);
  assert.ok(stepIds006.indexOf("08_founder_acceptance_simulation") < stepIds006.indexOf("10_listing_creative_assembly"));
  assert.equal(load("config/active-flow.yaml").active_flow_id, "FLOW-006");
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
  assert.ok(ids.includes("competitor_failure_treated_as_blocker"));
  assert.ok(ids.includes("market_research_tool_missing_but_flow_continued"));
  assert.ok(ids.includes("paid_rerun_same_outcome"));
  assert.ok(ids.includes("record_pass_without_artifact_proof"));
});

test("FLOW-006 blocks good-enough-demo reruns and hookless clean listings", () => {
  const flow = load("workflows/FLOW-006.yaml")["FLOW-006"];
  const schema = load("specs/SCHEMA-006.yaml")["SCHEMA-006"];
  const model = load("specs/MODEL-006.yaml")["MODEL-006"];
  const bls = load("specs/BLS-006.yaml")["BLS-006"];
  const budget = load("governance/08_product_generation_budget_006.yaml").product_generation_budget;

  const build = flow.flow.find((stage) => stage.step_id === "06_first_pass_connected_build");
  assert.equal(build.gate.visible_human_scale_capacity_required, true);
  assert.equal(build.gate.material_delta_against_prior_failed_artifact_required, true);
  assert.equal(build.gate.regenerated_timestamps_do_not_count_as_artifact_delta, true);

  const founder = flow.flow.find((stage) => stage.step_id === "08_founder_acceptance_simulation");
  assert.ok(founder.action.includes("fail_if_current_artifact_is_same_demo_workbook_after_rerun"));
  assert.ok(founder.action.includes("fail_if_paid_rerun_produced_same_outcome"));
  assert.equal(founder.gate.material_artifact_delta_required, true);
  assert.equal(founder.gate.cost_outcome_accountability_required, true);

  const launch = flow.flow.find((stage) => stage.step_id === "12_delivery_launch");
  assert.ok(launch.gate.ready_status_requires.includes("visible_human_scale_capacity_pass"));
  assert.ok(launch.gate.ready_status_requires.includes("material_artifact_delta_pass"));
  assert.ok(launch.gate.ready_status_requires.includes("per_image_real_hook_pass"));
  assert.ok(launch.gate.ready_status_requires.includes("cost_outcome_accountability_pass"));

  assert.ok(schema.first_pass_build_manifest.required_top_level_fields.includes("artifact_delta_against_prior"));
  assert.ok(schema.qa_result.required_top_level_fields.includes("visible_capacity_results"));
  assert.ok(schema.founder_acceptance_simulation.required_top_level_fields.includes("cost_outcome_accountability"));
  assert.ok(schema.listing_quality_gate.required_top_level_fields.includes("real_hook_quality_gate"));
  assert.ok(schema.launch_package.ready_for_marketplace_publish_requires.includes("per_image_real_hook_pass"));

  assert.ok(model.stage_quality_rules.founder_acceptance_simulation.fail_if.includes("product_visible_capacity_matches_prior_failed_demo_version"));
  assert.ok(model.stage_quality_rules.founder_acceptance_simulation.fail_if.includes("listing_hook_criteria_would_allow_clean_layout_without_real_hook"));
  assert.ok(model.stage_quality_rules.listing_quality_gate.fail_if.includes("clean_assets_lack_real_hook"));

  assert.ok(bls.launch_requires.includes("material_artifact_delta_passed"));
  assert.ok(bls.launch_requires.includes("cost_outcome_accountability_passed"));
  assert.equal(budget.hard_stop_rules.paid_rerun_must_stop_if_material_artifact_delta_is_absent, true);
});

test("Runtime launcher can derive FLOW-006 policy and budget by suffix", () => {
  const launcher = fs.readFileSync(path.join(repoRoot, "runtime/model-stage-launcher.mjs"), "utf8");

  assert.match(launcher, /const flowSuffix = flowVersion\.split\('-'\)\[1\]/);
  assert.match(launcher, /const modelPolicyRef = `specs\/MODEL-\$\{flowSuffix\}\.yaml`/);
  assert.match(launcher, /const generationBudgetRef = `governance\/08_product_generation_budget_\$\{flowSuffix\}\.yaml`/);
});
