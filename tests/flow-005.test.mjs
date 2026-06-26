import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import YAML from "yaml";
import { validateActiveAppState, validateFixtures, validateFlow005Contracts } from "../validators/flow-005-validator.mjs";

const repoRoot = process.cwd();

function load(relativePath) {
  return YAML.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

test("FLOW-005 contracts validate", () => {
  assert.equal(validateFlow005Contracts(), true);
});

test("FLOW-005 fixtures validate", () => {
  assert.equal(validateFixtures(), true);
});

test("FLOW-005 launch fixtures require deterministic artifact gates before publish", () => {
  const dynamic = load("fixtures/flow-005/valid_dynamic_product.yaml");
  const staticProduct = load("fixtures/flow-005/valid_static_product.yaml");

  for (const fixture of [dynamic, staticProduct]) {
    assert.equal(fixture.qa_result.artifact_integrity_audit.status, "pass");
    assert.equal(fixture.qa_result.protection_truthfulness.status, "pass");
    assert.equal(fixture.qa_result.publish_blockers.status, "pass");
    assert.deepEqual(fixture.qa_result.publish_blockers.blockers, []);
    assert.equal(fixture.launch_package.publish_status, "pass_pending_marketplace_publish");
    assert.equal(fixture.launch_package.external_publish_approval.required, true);
    assert.equal(fixture.launch_package.external_publish_approval.decision, "pending");
  }
});

test("FLOW-005 distinguishes applicable period continuity from non-periodic products", () => {
  const dynamic = load("fixtures/flow-005/valid_dynamic_product.yaml");
  const staticProduct = load("fixtures/flow-005/valid_static_product.yaml");

  assert.equal(dynamic.period_continuity_manifest.applicable, true);
  assert.equal(dynamic.period_continuity_manifest.period_type, "weekly");
  assert.equal(dynamic.qa_result.period_continuity_results.status, "pass");
  assert.ok(dynamic.qa_result.period_continuity_results.test_cases.length >= 3);

  assert.equal(staticProduct.period_continuity_manifest.applicable, false);
  assert.equal(staticProduct.qa_result.period_continuity_results.status, "not_applicable_with_reason");
  assert.ok(staticProduct.qa_result.period_continuity_results.reason);
});

test("FLOW-005 schema blocks prose-only QA and unverified protection claims", () => {
  const schema = load("specs/SCHEMA-005.yaml")["SCHEMA-005"];
  assert.ok(schema.qa_result.required_top_level_fields.includes("artifact_integrity_audit"));
  assert.ok(schema.qa_result.required_top_level_fields.includes("formula_truth_table_results"));
  assert.ok(schema.qa_result.required_top_level_fields.includes("boundary_mutation_results"));
  assert.ok(schema.qa_result.required_top_level_fields.includes("period_continuity_results"));
  assert.ok(schema.qa_result.required_top_level_fields.includes("protection_truthfulness"));
  assert.ok(schema.propagation_system_spec.required_top_level_fields.includes("time_horizon_model"));
  assert.ok(schema.propagation_system_spec.required_top_level_fields.includes("period_model"));
  assert.ok(schema.propagation_system_spec.required_top_level_fields.includes("carry_forward_model"));
  assert.ok(schema.propagation_system_spec.required_top_level_fields.includes("renewal_or_rollover_path"));
  assert.ok(schema.listing_creative_assembly.required_top_level_fields.includes("creative_assets"));
  assert.ok(schema.listing_creative_assembly.required_top_level_fields.includes("no_fabricated_product_surfaces"));
  assert.ok(schema.listing_quality_gate.required_top_level_fields.includes("listing_creative_assembly_ref"));
  assert.ok(schema.listing_quality_gate.required_top_level_fields.includes("creative_asset_dependency"));
  assert.ok(schema.launch_package.ready_for_marketplace_publish_requires.includes("artifact_integrity_audit_pass"));
  assert.ok(schema.launch_package.ready_for_marketplace_publish_requires.includes("period_continuity_pass_or_not_applicable_with_reason"));
  assert.ok(schema.launch_package.ready_for_marketplace_publish_requires.includes("protection_truthfulness_pass"));
});

test("product lane exclusions block rejected and published duplicate lanes", () => {
  const rules = load("governance/03_admission_rules.yaml").admission_rules;
  const exclusions = load("governance/product_lane_exclusions.yaml").product_lane_exclusions;
  assert.ok(rules.tier_1.reject_if.includes("excluded_product_lane"));
  assert.ok(rules.candidate_creation.requires.includes("product_lane_exclusion_check_passed"));
  assert.equal(
    exclusions.lanes.find((lane) => lane.lane_id === "meal_planner_spreadsheet").status,
    "excluded_by_human_rejection",
  );
  assert.equal(
    exclusions.lanes.find((lane) => lane.lane_id === "budget_planner_spreadsheet").activation_trigger,
    "marketplace_publish_complete_or_publish_status_published",
  );
});

test("API cost accounting separates product and governance spend", () => {
  const accounting = load("governance/api_cost_accounting.yaml").api_cost_accounting;
  const dashboard = load("records/dashboard_state.yaml");
  assert.equal(accounting.dashboard_policy.competitor_purchase_cost_is_not_api_cost, true);
  assert.equal(dashboard.today.totals.totalSpendUsd, 13);
  assert.equal(dashboard.today.totals.productApiCostUsd, 5);
  assert.equal(dashboard.today.totals.governanceApiCostUsd, 8);
  assert.equal(dashboard.today.totals.humanEscalationsTotal, 0);
  assert.equal(dashboard.today.todayLog.some((entry) => entry.id === "FLOW-2026-06-26-005-to-006"), true);
  assert.equal(dashboard.period.totals.totalApiCostUsd, 64.66);
  assert.equal(dashboard.period.totals.productApiCostUsd, 37.5);
  assert.equal(dashboard.period.totals.governanceApiCostUsd, 27.16);
});

test("active app state points at configured flow", () => {
  assert.equal(validateActiveAppState(), true);
});

test("today snapshot is generated from active records", () => {
  const dashboard = load("records/dashboard_state.yaml");
  const activeFlow = load("config/active-flow.yaml");
  assert.equal(dashboard.today.dataMode, "event-log");
  assert.equal(dashboard.today.flowVersion, activeFlow.active_flow_id);
  assert.equal(dashboard.today.pipelineCandidates.length, 0);
  assert.equal(dashboard.today.inFlightCandidates.length, 1);
  assert.equal(dashboard.today.rejectedCandidates.length, 0);
  assert.equal(dashboard.today.inFlightCandidates[0].candidateId, "C-004-001");
  assert.equal(dashboard.today.inFlightCandidates[0].currentStepId, "12_delivery_launch");
  assert.equal(dashboard.today.activeEscalation.status, "none");
  assert.equal(dashboard.today.activeEscalation.governanceFile, activeFlow.stage_dispatch_ref);
});

test("period snapshot stores the real rejected launch", () => {
  const dashboard = load("records/dashboard_state.yaml");
  assert.equal(dashboard.period.rejectedLaunch.reviewId, "LR-C-001-001");
  assert.equal(dashboard.period.totals.rejectedLaunchCount, 1);
  assert.equal(dashboard.period.from, "2026-06-22");
  assert.equal(dashboard.period.to, "2026-06-26");
  assert.equal(dashboard.period.buckets.length, 5);
});

test("runtime launcher derives workflow defaults by flow suffix", () => {
  const launcher = fs.readFileSync(path.join(repoRoot, "runtime/model-stage-launcher.mjs"), "utf8");
  assert.match(launcher, /const flowSuffix = flowVersion\.split\('-'\)\[1\]/);
  assert.match(launcher, /const modelPolicyRef = `specs\/MODEL-\$\{flowSuffix\}\.yaml`/);
  assert.match(launcher, /const generationBudgetRef = `governance\/08_product_generation_budget_\$\{flowSuffix\}\.yaml`/);
});

test("FLOW-004 frozen evidence checksum matches", () => {
  const file = fs.readFileSync(path.join(repoRoot, "fixtures/flow-004/meal_planner_rejected.yaml"), "utf8");
  const checksum = fs.readFileSync(path.join(repoRoot, "fixtures/flow-004/meal_planner_rejected.yaml.sha256"), "utf8").trim();
  assert.equal(load("fixtures/flow-004/meal_planner_rejected.yaml").read_only, true);
  assert.equal(checksum, crypto.createHash("sha256").update(file).digest("hex"));
});
