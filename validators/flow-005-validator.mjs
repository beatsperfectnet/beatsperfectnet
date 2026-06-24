import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import YAML from "yaml";

const repoRoot = process.cwd();

function loadYaml(relativePath) {
  return YAML.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertIncludes(list, value, message) {
  assert(Array.isArray(list) && list.includes(value), message);
}

function assertPassStatus(value, message) {
  assert(value === true || value === "pass", message);
}

function validCandidateSnapshot(candidate, label) {
  assert(candidate?.candidateId, `${label} candidate id missing`);
  assert(candidate?.candidateTitle, `${label} candidate title missing`);
  assert(
    ["pipeline", "in_flight", "launched", "rejected_before_launch"].includes(candidate?.outcomeStatus),
    `${label} outcome status invalid`,
  );
  assert(typeof candidate?.totalTokensUsed === "number", `${label} token count must be numeric`);
  assert(typeof candidate?.totalUsdSpent === "number", `${label} USD spend must be numeric`);
  assert(["green", "yellow", "red"].includes(candidate?.budgetHealth), `${label} budget health invalid`);
  assert(["green", "yellow", "red"].includes(candidate?.processHealth), `${label} process health invalid`);
}

function validateQualityEvidence(record, label) {
  const qa = record?.qa_result;
  const launch = record?.launch_package;
  assert(qa, `${label} QA fixture missing`);
  assert(launch, `${label} launch fixture missing`);

  assertPassStatus(qa.artifact_integrity_audit?.status, `${label} artifact audit must pass`);
  assertPassStatus(qa.artifact_integrity_audit?.artifact_open_check, `${label} artifact open check must pass`);
  assertPassStatus(qa.artifact_integrity_audit?.required_surfaces_check, `${label} required surfaces check must pass`);
  assertPassStatus(qa.artifact_integrity_audit?.editable_range_check, `${label} editable range check must pass`);
  assertPassStatus(qa.artifact_integrity_audit?.listing_surface_fidelity_check, `${label} listing surface fidelity check must pass`);

  const formula = qa.formula_truth_table_results;
  assert(formula, `${label} formula truth table result missing`);
  if (formula.applicable === true) {
    assertPassStatus(formula.status, `${label} applicable formula truth table must pass`);
    assert(Array.isArray(formula.test_cases) && formula.test_cases.length > 0, `${label} applicable formula audit must include test cases`);
  } else {
    assert(formula.status === "not_applicable_with_reason" && formula.reason, `${label} non-formula product must explain formula audit non-applicability`);
  }

  const boundary = qa.boundary_mutation_results;
  assert(boundary, `${label} boundary mutation result missing`);
  if (boundary.applicable === true) {
    assertPassStatus(boundary.status, `${label} applicable boundary mutation audit must pass`);
    assert(Array.isArray(boundary.test_cases) && boundary.test_cases.length >= 2, `${label} boundary audit must test at least two edge cases`);
  } else {
    assert(boundary.status === "not_applicable_with_reason" && boundary.reason, `${label} non-formula product must explain boundary audit non-applicability`);
  }

  const period = qa.period_continuity_results;
  assert(period, `${label} period continuity result missing`);
  if (period.applicable === true) {
    assertPassStatus(period.status, `${label} applicable period continuity audit must pass`);
    assert(Array.isArray(period.test_cases) && period.test_cases.length >= 3, `${label} period audit must test labels, carry-forward, and next-cycle handoff`);
  } else {
    assert(period.status === "not_applicable_with_reason" && period.reason, `${label} non-periodic product must explain period continuity non-applicability`);
  }

  assertPassStatus(qa.protection_truthfulness?.status, `${label} protection truthfulness must pass`);
  assert(qa.protection_truthfulness?.unsupported_protection_claims_absent === true, `${label} unsupported protection claims must be absent`);
  assertPassStatus(qa.publish_blockers?.status, `${label} publish blockers status must pass`);
  assert(Array.isArray(qa.publish_blockers?.blockers) && qa.publish_blockers.blockers.length === 0, `${label} publish blockers must be empty`);

  assert(launch.prepublish_validation?.status === "pass", `${label} prepublish validation must pass`);
  assert(launch.prepublish_validation?.publish_blockers_absent === true, `${label} launch must require absent publish blockers`);
  assert(launch.publish_status === "pass_pending_marketplace_publish", `${label} fixture must stop at pending publish without external approval`);
  assert(launch.artifact_integrity_audit_ref, `${label} launch must reference artifact audit`);
  assert(launch.formula_truth_table_ref, `${label} launch must reference formula truth table`);
  assert(launch.period_continuity_ref, `${label} launch must reference period continuity results`);
  assert(launch.protection_truthfulness_ref, `${label} launch must reference protection truthfulness`);
  assertPassStatus(launch.publish_blockers?.status, `${label} launch publish blockers must pass`);
  assert(Array.isArray(launch.publish_blockers?.blockers) && launch.publish_blockers.blockers.length === 0, `${label} launch blockers must be empty`);
  assert(launch.external_publish_approval?.required === true, `${label} external publish approval must be required`);
  assert(launch.external_publish_approval?.decision === "pending", `${label} fixture must not imply external publish approval`);
}

export function validateFlow005Contracts() {
  const flow = loadYaml("workflows/FLOW-005.yaml")["FLOW-005"];
  const schema = loadYaml("specs/SCHEMA-005.yaml")["SCHEMA-005"];
  const model = loadYaml("specs/MODEL-005.yaml")["MODEL-005"];
  const bls = loadYaml("specs/BLS-005.yaml")["BLS-005"];
  const budget = loadYaml("governance/08_product_generation_budget_005.yaml").product_generation_budget;
  const dispatch = loadYaml("governance/09_stage_dispatch_005.yaml").stage_dispatch;
  const active = loadYaml("config/active-flow.yaml");
  const brandbook = loadYaml("brandbook/beatsperfect-brandbook.v1.yaml").brandbook;

  assert(flow, "FLOW-005 root missing");
  assert(flow.run_telemetry?.exact_model_match_required === true, "FLOW-005 exact model telemetry must be required");
  assert(Array.isArray(flow.flow) && flow.flow.length === 17, "FLOW-005 must have 17 stages");
  assert(flow.flow[0].step_id === "00_candidate_admission", "Stage 0 must be candidate admission");
  assert(flow.flow[9].step_id === "09_listing_creative_assembly", "Stage 9 must be listing creative assembly");
  assert(flow.flow[10].step_id === "10_listing_quality_gate", "Stage 10 must be listing quality gate");
  assert(flow.flow[11].step_id === "11_delivery_launch", "Stage 11 must be delivery launch");

  assert(schema?.candidate_admission?.required_top_level_fields.includes("admitted"), "SCHEMA-005 candidate admission shape missing");
  assert(schema?.qa_result?.required_top_level_fields.includes("product_visual_quality"), "SCHEMA-005 QA shape missing");
  assert(schema?.launch_package?.required_top_level_fields.includes("listing_url"), "SCHEMA-005 launch shape missing");
  assertIncludes(schema?.hidden_buyer_experience_inspection?.required_top_level_fields, "downstream_artifact_audit_requirements", "SCHEMA-005 hidden inspection must drive artifact audit requirements");
  assertIncludes(schema?.alignment_chain?.required_top_level_fields, "kpp_quality_check", "SCHEMA-005 alignment must require KPP quality check");
  assertIncludes(schema?.alignment_chain?.required_top_level_fields, "rtb_quality_check", "SCHEMA-005 alignment must require RTB quality check");
  assertIncludes(schema?.propagation_system_spec?.required_top_level_fields, "formula_truth_table_tests", "SCHEMA-005 propagation spec must require formula truth table tests");
  assertIncludes(schema?.propagation_system_spec?.required_top_level_fields, "time_horizon_model", "SCHEMA-005 propagation spec must require time horizon model");
  assertIncludes(schema?.propagation_system_spec?.required_top_level_fields, "period_model", "SCHEMA-005 propagation spec must require period model");
  assertIncludes(schema?.propagation_system_spec?.required_top_level_fields, "carry_forward_model", "SCHEMA-005 propagation spec must require carry-forward model");
  assertIncludes(schema?.propagation_system_spec?.required_top_level_fields, "renewal_or_rollover_path", "SCHEMA-005 propagation spec must require renewal or rollover path");
  assertIncludes(schema?.first_pass_build_manifest?.required_top_level_fields, "protection_truthfulness", "SCHEMA-005 build manifest must require protection truthfulness");
  assertIncludes(schema?.first_pass_build_manifest?.required_top_level_fields, "period_continuity_manifest", "SCHEMA-005 build manifest must require period continuity manifest");
  assertIncludes(schema?.qa_result?.required_top_level_fields, "artifact_integrity_audit", "SCHEMA-005 QA must require artifact integrity audit");
  assertIncludes(schema?.qa_result?.required_top_level_fields, "formula_truth_table_results", "SCHEMA-005 QA must require formula truth table results");
  assertIncludes(schema?.qa_result?.required_top_level_fields, "boundary_mutation_results", "SCHEMA-005 QA must require boundary mutation results");
  assertIncludes(schema?.qa_result?.required_top_level_fields, "period_continuity_results", "SCHEMA-005 QA must require period continuity results");
  assertIncludes(schema?.qa_result?.required_top_level_fields, "protection_truthfulness", "SCHEMA-005 QA must require protection truthfulness");
  assertIncludes(schema?.listing_hook?.required_top_level_fields, "insight_kpp_rtb_alignment", "SCHEMA-005 listing hook must require insight/KPP/RTB alignment");
  assertIncludes(schema?.listing_creative_assembly?.required_top_level_fields, "creative_assets", "SCHEMA-005 listing creative assembly must require creative assets");
  assertIncludes(schema?.listing_creative_assembly?.required_top_level_fields, "no_fabricated_product_surfaces", "SCHEMA-005 listing creative assembly must forbid fabricated product surfaces");
  assertIncludes(schema?.listing_quality_gate?.required_top_level_fields, "listing_creative_assembly_ref", "SCHEMA-005 listing quality gate must require creative assembly ref");
  assertIncludes(schema?.listing_quality_gate?.required_top_level_fields, "creative_asset_dependency", "SCHEMA-005 listing quality gate must depend on final creative assets");
  assertIncludes(schema?.listing_quality_gate?.required_top_level_fields, "artifact_audit_dependency", "SCHEMA-005 listing gate must depend on artifact audit");
  assertIncludes(schema?.launch_package?.required_top_level_fields, "publish_blockers", "SCHEMA-005 launch must require publish blockers");
  assertIncludes(schema?.launch_package?.ready_for_marketplace_publish_requires, "artifact_integrity_audit_pass", "Launch ready requirements must include artifact audit");
  assertIncludes(schema?.launch_package?.ready_for_marketplace_publish_requires, "period_continuity_pass_or_not_applicable_with_reason", "Launch ready requirements must include period continuity");
  assertIncludes(schema?.launch_package?.ready_for_marketplace_publish_requires, "protection_truthfulness_pass", "Launch ready requirements must include protection truthfulness");

  assert(model?.exact_requested_vs_actual_validation === true, "MODEL-005 exact-model validation must be true");
  assert(model?.stage_routing?.listing_quality_gate?.requested_model === "gpt-5.5", "MODEL-005 listing quality routing must use frontier");
  assert(model?.model_catalog?.deterministic?.normal_flow_allowed === true, "MODEL-005 must define deterministic validation routing");
  assert(model?.stage_routing?.artifact_integrity_audit?.requested_model === "deterministic", "MODEL-005 artifact audit must be deterministic");
  assert(model?.stage_routing?.period_continuity_validation?.requested_model === "deterministic", "MODEL-005 period continuity audit must be deterministic");

  assert(bls?.candidate_stages?.includes("listing_creative_assembly"), "BLS-005 must include listing creative assembly");
  assert(bls?.launch_requires?.includes("listing_creatives_completed"), "BLS-005 launch must require final listing creatives");
  assert(bls?.launch_requires?.includes("artifact_integrity_audit_passed"), "BLS-005 launch must require artifact integrity audit");
  assert(bls?.launch_requires?.includes("period_continuity_passed_or_not_applicable_with_reason"), "BLS-005 launch must require period continuity");
  assert(bls?.launch_requires?.includes("protection_truthfulness_passed"), "BLS-005 launch must require protection truthfulness");
  assert(budget?.generation_budget_usd === 25.0, "Budget ceiling must remain 25");
  assert(dispatch?.enforcement?.exact_model_match_required === true, "Stage dispatch must require exact model match");
  assert(dispatch?.stage_model_map?.["02_mandatory_competitor_purchase"]?.dispatch_action === "human_gate", "Purchase approval must be human-gated");
  assertIncludes(
    dispatch?.stage_model_map?.["07_propagation_buyer_experience_product_visual_qa"]?.deterministic_subgates,
    "artifact_integrity_audit",
    "Stage 07 must include deterministic artifact integrity audit",
  );
  assertIncludes(
    dispatch?.stage_model_map?.["07_propagation_buyer_experience_product_visual_qa"]?.deterministic_subgates,
    "period_continuity_validation",
    "Stage 07 must include deterministic period continuity validation",
  );

  assert(active?.active_flow_id === "FLOW-005", "Active flow must migrate to FLOW-005");
  assert(active?.workflow_contract_ref === "workflows/FLOW-005.yaml", "Active workflow ref mismatch");
  assert(active?.model_policy_ref === "specs/MODEL-005.yaml", "Active model policy ref mismatch");
  assert(active?.stage_dispatch_ref === "governance/09_stage_dispatch_005.yaml", "Active stage dispatch ref mismatch");

  assert(brandbook?.brand_name === "BeatsPerfect", "Brandbook must stay BeatsPerfect");
  assert(Array.isArray(brandbook?.rules) && brandbook.rules.includes("surface proof before polish"), "Brandbook must require proof before polish");

  return true;
}

export function validateFixtures() {
  const dynamic = loadYaml("fixtures/flow-005/valid_dynamic_product.yaml");
  const staticProduct = loadYaml("fixtures/flow-005/valid_static_product.yaml");
  const negativeCases = loadYaml("fixtures/flow-005/negative-cases.yaml");
  const frozenFlow004 = loadYaml("fixtures/flow-004/meal_planner_rejected.yaml");

  assert(dynamic?.qa_result?.product_visual_quality?.brandbook_compliance === "pass", "Dynamic fixture must pass brandbook compliance");
  assert(dynamic?.qa_result?.dynamic_mutation_results?.length === 3, "Dynamic fixture must include mutation tests");
  assert(staticProduct?.qa_result?.static_completion_results?.length === 1, "Static fixture must include completion tests");
  assert(staticProduct?.qa_result?.product_visual_quality?.default_template_appearance_absent === "pass", "Static fixture must pass visual QA");
  validateQualityEvidence(dynamic, "Dynamic fixture");
  validateQualityEvidence(staticProduct, "Static fixture");
  assert(Array.isArray(negativeCases?.cases) && negativeCases.cases.length > 16, "Negative case catalog missing");
  assert(negativeCases.cases.some((entry) => entry.violations?.includes("missing_artifact_integrity_audit")), "Negative cases must include missing artifact audit");
  assert(negativeCases.cases.some((entry) => entry.violations?.includes("protection_truthfulness_failure")), "Negative cases must include protection truthfulness failure");
  assert(negativeCases.cases.some((entry) => entry.violations?.includes("rtb_not_product_specific")), "Negative cases must include RTB quality failure");
  assert(negativeCases.cases.some((entry) => entry.violations?.includes("missing_period_model")), "Negative cases must include missing period model");
  assert(negativeCases.cases.some((entry) => entry.violations?.includes("missing_time_horizon_model")), "Negative cases must include missing time horizon model");
  assert(negativeCases.cases.some((entry) => entry.violations?.includes("missing_renewal_or_rollover_path")), "Negative cases must include missing rollover path");
  assert(frozenFlow004?.read_only === true, "Frozen FLOW-004 evidence must be read-only");
  assert(frozenFlow004?.status === "rejected_by_human", "Frozen FLOW-004 evidence must remain rejected");
  return true;
}

export function validateActiveAppState() {
  const dashboard = loadYaml("records/dashboard_state.yaml");
  const today = dashboard?.today;
  const period = dashboard?.period;

  assert(today?.flowVersion === "FLOW-005", "Dashboard today flow version must be FLOW-005");
  assert(period?.flowVersion === "FLOW-005", "Dashboard period flow version must be FLOW-005");
  assert(today?.dataMode === "event-log", "Dashboard today must be generated from event logs");
  assert(Array.isArray(today?.flowTimeline) && today.flowTimeline.length === 13, "Dashboard must expose the FLOW-005 stage timeline");
  const allCandidates = [
    ...(today?.pipelineCandidates || []),
    ...(today?.inFlightCandidates || []),
    ...(today?.launchedCandidates || []),
    ...(today?.rejectedCandidates || []),
  ];
  allCandidates.forEach((candidate, index) => validCandidateSnapshot(candidate, `Dashboard candidate ${index}`));
  assert(today?.totals?.pipelineCandidates === (today?.pipelineCandidates || []).length, "Dashboard pipeline total mismatch");
  assert(today?.totals?.inFlightCandidates === (today?.inFlightCandidates || []).length, "Dashboard in-flight total mismatch");
  assert(today?.totals?.launchedCandidates === (today?.launchedCandidates || []).length, "Dashboard launched total mismatch");
  assert(today?.totals?.rejectedCandidates === (today?.rejectedCandidates || []).length, "Dashboard rejected total mismatch");
  assert(Array.isArray(period?.buckets) && period.buckets.length >= 1, "Dashboard period buckets must contain entries");
  assert(typeof period?.totals?.rejectedLaunchCount === "number", "Dashboard period rejected launch count must be numeric");
  assert(today?.activeEscalation?.governanceFile === "governance/09_stage_dispatch_005.yaml", "Dashboard escalation must point to FLOW-005 dispatch");
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  validateFlow005Contracts();
  validateFixtures();
  validateActiveAppState();
  console.log("FLOW-005 validation passed");
}
