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
  const governance = loadYaml("governance/05_governance_rules.yaml").governance_rules;
  const validation = loadYaml("records/flow_007_validation/F7V-C-004-001.yaml").flow_007_validation;
  const failureCase = loadText("records/failure-cases/C-004-001-FLOW-006-postmortem.md");
  const productSpecTemplate = loadYaml("templates/product-spec-template.yaml").product_spec;
  const buildManifestTemplate = loadYaml("templates/build-manifest-template.yaml").build_manifest;
  const listingSpecTemplate = loadYaml("templates/listing-spec-template.yaml").listing_spec;
  const ledgerTemplate = loadYaml("templates/model-run-ledger-template.yaml").model_run_ledger;

  assert(active.active_flow_id === "FLOW-007", "FLOW-007 must be active");
  assert(active.workflow_contract_ref === "workflows/FLOW-007.yaml", "Active workflow must point to FLOW-007");
  assert(governance.active_rule_contracts.flow === "FLOW-007", "Governance active flow must be FLOW-007");
  assert(governance.active_rule_contracts.schema === "SCHEMA-007", "Governance active schema must be SCHEMA-007");
  assertIncludes(governance.flow_rules, "FLOW_007_build_starts_only_when_build_readiness_status_is_BUILD_READY", "Governance must include BUILD_READY gate");

  for (const relativePath of [
    "docs/FLOW-007.md",
    "templates/product-architecture-contract-template.yaml",
    "templates/competitor-autopsy-template.yaml",
    "templates/scenario-matrix-template.yaml",
    "templates/build-readiness-review-template.yaml",
    "templates/blind-buyer-walkthrough-template.yaml",
    "records/failure-cases/C-004-001-FLOW-006-postmortem.md",
    "records/flow_007_validation/F7V-C-004-001.yaml",
  ]) {
    assertFile(relativePath);
  }

  const expectedSteps = [
    "00_market_evidence",
    "01_competitor_product_autopsy",
    "02_product_architecture_contract",
    "03_scenario_matrix",
    "04_build_readiness_review",
    "05_product_build",
    "06_real_artifact_inspection",
    "07_blind_buyer_walkthrough",
    "08_listing_packaging_qa",
    "09_founder_launch_gate",
  ];
  assert(JSON.stringify(flow.flow.map((stage) => stage.step_id)) === JSON.stringify(expectedSteps), "FLOW-007 step sequence must match required architecture-first sequence");
  assert(flow.hard_rule === "Only candidates with build_readiness.status = BUILD_READY may enter product generation.", "FLOW-007 hard build rule missing");

  const buildReadiness = flow.flow.find((stage) => stage.step_id === "04_build_readiness_review");
  assert(buildReadiness.gate.build_readiness_status_required === "BUILD_READY", "Build readiness gate must require BUILD_READY");
  assert(buildReadiness.gate.only_build_ready_candidates_may_enter_product_generation === true, "Build readiness must be the product generation gate");
  const productBuild = flow.flow.find((stage) => stage.step_id === "05_product_build");
  assert(productBuild.gate.build_readiness_status_must_equal_BUILD_READY === true, "Product build must hard-check BUILD_READY");

  for (const status of [
    "IDEA_RECEIVED",
    "MARKET_REJECTED",
    "MARKET_INSUFFICIENT",
    "BENCHMARK_INSUFFICIENT",
    "TARGET_CONTRACT_FAILED",
    "DOMAIN_MODEL_FAILED",
    "DECISION_OUTPUT_FAILED",
    "SCENARIO_MATRIX_FAILED",
    "NOT_BUILD_READY",
    "BUILD_READY",
    "BUILT_QA_FAILED_IMPLEMENTATION",
    "BUILT_QA_FAILED_ARCHITECTURE",
    "LISTING_FAILED",
    "LAUNCH_READY",
    "LAUNCHED",
    "FLOW_006_FAILURE_CASE",
  ]) {
    assertIncludes(schema.allowed_statuses, status, `${status} status missing from schema`);
    assertIncludes(bls.statuses, status, `${status} status missing from BLS`);
  }

  const pac = loadYaml("templates/product-architecture-contract-template.yaml").product_architecture_contract;
  for (const section of [
    "market_evidence",
    "competitor_autopsy",
    "target_audience_contract",
    "buyer_behavior_contract",
    "domain_model_contract",
    "decision_output_contract",
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
  assertIncludes(pac.build_readiness.allowed_statuses, "BUILD_READY", "PAC must allow BUILD_READY");
  assertIncludes(pac.build_readiness.allowed_statuses, "NOT_BUILD_READY", "PAC must allow NOT_BUILD_READY");
  assertIncludes(pac.target_audience_contract.required_fields, "data_maturity_segments", "PAC must require data maturity segments");
  assertIncludes(pac.buyer_behavior_contract.required_fields, "repeated_usage_loop", "PAC must require repeated usage loop");
  assertIncludes(pac.domain_model_contract.required_fields, "dated_events", "PAC must require dated events");
  assertIncludes(pac.decision_output_contract.c004_required_outputs, "suggested order quantity", "C-004 outputs must include suggested order quantity");

  const autopsy = loadYaml("templates/competitor-autopsy-template.yaml").competitor_autopsy;
  assertIncludes(autopsy.allowed_statuses, "BENCHMARK_INSUFFICIENT", "Competitor autopsy must allow BENCHMARK_INSUFFICIENT");
  assert(String(autopsy.hard_rule).includes("cannot satisfy benchmark autopsy"), "Competitor autopsy hard rule missing");

  const scenario = loadYaml("templates/scenario-matrix-template.yaml").scenario_matrix;
  assertIncludes(scenario.c004_canonical_scenarios, "supplier change", "C-004 scenario matrix must include supplier change");
  assertIncludes(scenario.c004_canonical_scenarios, "purchase received", "C-004 scenario matrix must include purchase received");

  const blind = loadYaml("templates/blind-buyer-walkthrough-template.yaml").blind_buyer_walkthrough;
  assertIncludes(blind.c004_canonical_walkthrough, "Decide what to reorder, when, and how much.", "C-004 walkthrough must include reorder decision");

  assert(productSpecTemplate.product_architecture_contract_ref === null, "Product spec template must cite Product Architecture Contract");
  assert(productSpecTemplate.architecture_lock_traceability.accepted_only_if_build_readiness_status_is_BUILD_READY === true, "Product spec must enforce BUILD_READY acceptance");
  assertIncludes(buildManifestTemplate.locked_architecture_fields_builder_must_not_change, "domain_model", "Build manifest must lock domain model");
  assertIncludes(buildManifestTemplate.spreadsheet_workbook_requirements, "no_demo_only_workbook", "Build manifest must block demo-only workbook");
  assert(listingSpecTemplate.generated_from.beatsperfect_brandbook_ref === "brandbook/beatsperfect-brandbook.v1.yaml", "Listing spec must use brandbook");
  assert(listingSpecTemplate.hard_rule === "Clean screenshots without a buyer hook do not pass.", "Listing hard rule missing");
  assert(ledgerTemplate.cost_control_rules.repeated_similar_artifact_regeneration_forbidden === true, "Ledger must forbid repeated similar artifact regeneration");

  assert(model.default_model_rule.includes("Use mini by default"), "MODEL-007 must use mini by default");
  assert(model.stage_quality_rules.build_readiness_review.hard_rule.includes("BUILD_READY"), "MODEL-007 build readiness hard rule missing");
  assert(budget.hard_stop_rules.no_paid_rebuild_unless_product_architecture_contract_changed_materially === true, "Budget must block paid rebuild without contract change");
  assert(dispatch.enforcement.repeated_rebuild_escalation_after_failed_artifacts_forbidden === true, "Dispatch must forbid repeated rebuild escalation");

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
