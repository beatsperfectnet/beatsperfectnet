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
  const exclusions = loadYaml("governance/product_lane_exclusions.yaml").product_lane_exclusions;
  const costAccounting = loadYaml("governance/api_cost_accounting.yaml").api_cost_accounting;
  const brandbook = loadYaml("brandbook/beatsperfect-brandbook.v1.yaml").brandbook;

  assert(flow, "FLOW-005 root missing");
  assert(flow.run_telemetry?.exact_model_match_required === true, "FLOW-005 exact model telemetry must be required");
  assert(Array.isArray(flow.flow) && flow.flow.length === 17, "FLOW-005 must have 17 stages");
  assert(flow.flow[0].step_id === "00_candidate_admission", "Stage 0 must be candidate admission");
  assertIncludes(flow.required_inputs, "specs/TOOL-001.yaml", "FLOW-005 must require market research tool spec");
  assertIncludes(flow.flow[0].action, "confirm_market_research_tool_or_export_ready", "Candidate admission must verify market research readiness");
  assertIncludes(flow.flow[0].action, "refuse_historical_memory_or_generic_search_as_market_demand_substitute", "Candidate admission must forbid weak market substitutes");
  assert(flow.flow[0].gate?.market_research_tool_ready_or_explicit_human_override_required === true, "Candidate admission must gate on market tool readiness or override");
  assert(flow.flow[1].gate?.public_evidence_quality_pass_or_escalated_with_human_override_required === true, "Public shelf read must gate on evidence quality");
  assertIncludes(flow.flow[2].action, "refuse_lowest_friction_or_visible_price_as_primary_tie_breaker", "Competitor selection must not use visible price as primary tie-breaker");
  assert(flow.flow[2].gate?.additional_competitor_purchase_allowed_after_broken_or_unrepresentative_purchase === true, "FLOW-005 must allow second purchase escalation after bad benchmark");
  assertIncludes(flow.flow[3].action, "classify_each_competitor_finding_as_market_evidence_build_requirement_or_not_our_blocker", "Hidden inspection must classify competitor failures");
  assertIncludes(flow.flow[5].action, "define_working_capacity_requirements_not_demo_sample_only", "Propagation spec must define working capacity");
  assertIncludes(flow.flow[6].action, "build_working_capacity_product_not_demo_scale_sample", "Build step must require working-capacity product");
  assertIncludes(flow.flow[7].action, "fail_if_artifact_is_demo_scale_only", "QA must fail demo-scale artifacts");
  assert(flow.flow[9].step_id === "09_listing_creative_assembly", "Stage 9 must be listing creative assembly");
  assertIncludes(flow.flow[9].action, "define_visual_hook_strategy_for_listing_grid_browsing", "Listing assembly must define visual hook strategy");
  assertIncludes(flow.flow[9].action, "align_each_image_promise_to_jtbd_and_each_rtb_to_that_promise", "Listing assembly must align per-image promise and RTB");
  assert(flow.flow[10].step_id === "10_listing_quality_gate", "Stage 10 must be listing quality gate");
  assertIncludes(flow.flow[10].action, "judge_visual_hook_strength_against_real_marketplace_grid", "Listing gate must judge visual hook strength");
  assertIncludes(flow.flow[10].action, "fail_if_text_overlaps_clips_or_product_surface_is_too_small_to_prove_claim", "Listing gate must fail broken creative formatting");
  assert(flow.flow[11].step_id === "11_delivery_launch", "Stage 11 must be delivery launch");

  assert(schema?.candidate_admission?.required_top_level_fields.includes("admitted"), "SCHEMA-005 candidate admission shape missing");
  assertIncludes(schema?.candidate_admission?.required_top_level_fields, "market_research_tool_status", "SCHEMA-005 candidate admission must record market tool status");
  assertIncludes(schema?.public_shelf_read?.required_top_level_fields, "evidence_quality_gate", "SCHEMA-005 public shelf read must record evidence quality gate");
  assertIncludes(schema?.competitor_purchase?.selection_required_fields, "benchmark_representativeness_risk", "SCHEMA-005 competitor selection must record benchmark risk");
  assertIncludes(schema?.hidden_buyer_experience_inspection?.required_top_level_fields, "benchmark_adequacy", "SCHEMA-005 hidden inspection must record benchmark adequacy");
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
  assertIncludes(schema?.propagation_system_spec?.required_top_level_fields, "working_capacity_requirements", "SCHEMA-005 propagation spec must require working capacity requirements");
  assertIncludes(schema?.propagation_system_spec?.required_top_level_fields, "competitor_failure_handling", "SCHEMA-005 propagation spec must require competitor failure handling");
  assertIncludes(schema?.first_pass_build_manifest?.required_top_level_fields, "protection_truthfulness", "SCHEMA-005 build manifest must require protection truthfulness");
  assertIncludes(schema?.first_pass_build_manifest?.required_top_level_fields, "working_capacity_manifest", "SCHEMA-005 build manifest must require working capacity manifest");
  assertIncludes(schema?.first_pass_build_manifest?.required_top_level_fields, "period_continuity_manifest", "SCHEMA-005 build manifest must require period continuity manifest");
  assertIncludes(schema?.qa_result?.required_top_level_fields, "artifact_integrity_audit", "SCHEMA-005 QA must require artifact integrity audit");
  assertIncludes(schema?.qa_result?.required_top_level_fields, "formula_truth_table_results", "SCHEMA-005 QA must require formula truth table results");
  assertIncludes(schema?.qa_result?.required_top_level_fields, "boundary_mutation_results", "SCHEMA-005 QA must require boundary mutation results");
  assertIncludes(schema?.qa_result?.required_top_level_fields, "working_capacity_results", "SCHEMA-005 QA must require working capacity results");
  assertIncludes(schema?.qa_result?.required_top_level_fields, "period_continuity_results", "SCHEMA-005 QA must require period continuity results");
  assertIncludes(schema?.qa_result?.required_top_level_fields, "protection_truthfulness", "SCHEMA-005 QA must require protection truthfulness");
  assertIncludes(schema?.listing_hook?.required_top_level_fields, "insight_kpp_rtb_alignment", "SCHEMA-005 listing hook must require insight/KPP/RTB alignment");
  assertIncludes(schema?.listing_creative_assembly?.required_top_level_fields, "creative_assets", "SCHEMA-005 listing creative assembly must require creative assets");
  assertIncludes(schema?.listing_creative_assembly?.required_top_level_fields, "visual_hook_strategy", "SCHEMA-005 listing creative assembly must require visual hook strategy");
  assertIncludes(schema?.listing_creative_assembly?.required_top_level_fields, "per_image_promise_rtb_alignment", "SCHEMA-005 listing creative assembly must require per-image promise/RTB alignment");
  assertIncludes(schema?.listing_creative_assembly?.required_top_level_fields, "no_fabricated_product_surfaces", "SCHEMA-005 listing creative assembly must forbid fabricated product surfaces");
  assertIncludes(schema?.listing_quality_gate?.required_top_level_fields, "listing_creative_assembly_ref", "SCHEMA-005 listing quality gate must require creative assembly ref");
  assertIncludes(schema?.listing_quality_gate?.required_top_level_fields, "visual_hook_strength", "SCHEMA-005 listing quality gate must require visual hook strength");
  assertIncludes(schema?.listing_quality_gate?.required_top_level_fields, "creative_asset_dependency", "SCHEMA-005 listing quality gate must depend on final creative assets");
  assertIncludes(schema?.listing_quality_gate?.required_top_level_fields, "artifact_audit_dependency", "SCHEMA-005 listing gate must depend on artifact audit");
  assertIncludes(schema?.launch_package?.required_top_level_fields, "publish_blockers", "SCHEMA-005 launch must require publish blockers");
  assertIncludes(schema?.launch_package?.ready_for_marketplace_publish_requires, "artifact_integrity_audit_pass", "Launch ready requirements must include artifact audit");
  assertIncludes(schema?.launch_package?.ready_for_marketplace_publish_requires, "working_capacity_pass_or_not_applicable_with_reason", "Launch ready requirements must include working capacity");
  assertIncludes(schema?.launch_package?.ready_for_marketplace_publish_requires, "period_continuity_pass_or_not_applicable_with_reason", "Launch ready requirements must include period continuity");
  assertIncludes(schema?.launch_package?.ready_for_marketplace_publish_requires, "protection_truthfulness_pass", "Launch ready requirements must include protection truthfulness");

  assert(model?.exact_requested_vs_actual_validation === true, "MODEL-005 exact-model validation must be true");
  assert(model?.stage_quality_rules?.candidate_admission?.rule === "market_demand_must_use_ready_market_research_tool_or_explicit_human_override", "MODEL-005 must govern market tool readiness");
  assert(model?.stage_quality_rules?.competitor_selection?.tie_breaker_order?.[1] === "market_strength", "MODEL-005 competitor tie-breakers must prioritize market strength before price");
  assert(model?.stage_quality_rules?.purchased_competitor_inspection?.required_classifications?.includes("competitor_failure_not_our_blocker"), "MODEL-005 must classify competitor failures as not our blockers");
  assert(model?.stage_quality_rules?.qa_execution?.required_results?.includes("working_capacity_results"), "MODEL-005 QA rules must require working capacity results");
  assert(model?.stage_quality_rules?.listing_quality_gate?.required_checks?.includes("no_text_overlap_or_clipping"), "MODEL-005 listing gate must check text overlap");
  assert(model?.stage_routing?.listing_quality_gate?.requested_model === "gpt-5.5", "MODEL-005 listing quality routing must use frontier");
  assert(model?.model_catalog?.deterministic?.normal_flow_allowed === true, "MODEL-005 must define deterministic validation routing");
  assert(model?.stage_routing?.artifact_integrity_audit?.requested_model === "deterministic", "MODEL-005 artifact audit must be deterministic");
  assert(model?.stage_routing?.period_continuity_validation?.requested_model === "deterministic", "MODEL-005 period continuity audit must be deterministic");

  assert(bls?.candidate_stages?.includes("listing_creative_assembly"), "BLS-005 must include listing creative assembly");
  assert(bls?.launch_requires?.includes("market_research_tool_ready_or_human_override_recorded"), "BLS-005 launch must require market research readiness");
  assert(bls?.launch_requires?.includes("benchmark_adequacy_passed_or_additional_purchase_escalation_resolved"), "BLS-005 launch must require benchmark adequacy or resolved escalation");
  assert(bls?.launch_requires?.includes("working_capacity_passed_or_not_applicable_with_reason"), "BLS-005 launch must require working capacity");
  assert(bls?.launch_requires?.includes("visual_hook_quality_passed"), "BLS-005 launch must require visual hook quality");
  assert(bls?.launch_requires?.includes("listing_creatives_completed"), "BLS-005 launch must require final listing creatives");
  assert(bls?.launch_requires?.includes("artifact_integrity_audit_passed"), "BLS-005 launch must require artifact integrity audit");
  assert(bls?.launch_requires?.includes("period_continuity_passed_or_not_applicable_with_reason"), "BLS-005 launch must require period continuity");
  assert(bls?.launch_requires?.includes("protection_truthfulness_passed"), "BLS-005 launch must require protection truthfulness");
  assert(budget?.generation_budget_usd === 25.0, "Budget ceiling must remain 25");
  assert(dispatch?.enforcement?.exact_model_match_required === true, "Stage dispatch must require exact model match");
  assert(dispatch?.stage_model_map?.["02_mandatory_competitor_purchase"]?.dispatch_action === "human_gate", "Purchase approval must be human-gated");
  assert(costAccounting?.dashboard_policy?.governance_cost_includes_flow_dashboard_domain_and_accounting_work === true, "Governance API cost policy must include FLOW/dashboard/domain/accounting work");
  assert(costAccounting?.dashboard_policy?.competitor_purchase_cost_is_not_api_cost === true, "Competitor purchase cost must not be counted as API cost");
  assert(exclusions?.enforcement?.applies_to_future_idea_runs === true, "Product lane exclusions must apply to future idea runs");
  assert(exclusions?.enforcement?.applies_to_candidate_admission === true, "Product lane exclusions must apply to candidate admission");
  assert(
    exclusions?.lanes?.some((lane) => lane.lane_id === "meal_planner_spreadsheet" && lane.status === "excluded_by_human_rejection"),
    "Meal planner lane must remain excluded after human rejection",
  );
  assert(
    exclusions?.lanes?.some((lane) => lane.lane_id === "budget_planner_spreadsheet" && lane.status === "pending_exclusion_after_marketplace_publish"),
    "Budget planner lane must have a post-publish exclusion trigger",
  );
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
  const activeFlow = loadYaml("config/active-flow.yaml");
  const dashboard = loadYaml("records/dashboard_state.yaml");
  const today = dashboard?.today;
  const period = dashboard?.period;
  const activeFlowId = activeFlow?.active_flow_id;

  assert(today?.flowVersion === activeFlowId, "Dashboard today flow version must match active flow");
  assert(period?.flowVersion === activeFlowId, "Dashboard period flow version must match active flow");
  assert(today?.dataMode === "event-log", "Dashboard today must be generated from event logs");
  assert(Array.isArray(today?.flowTimeline) && today.flowTimeline.length >= 13, "Dashboard must expose the active flow stage timeline");
  const allCandidates = [
    ...(today?.pipelineCandidates || []),
    ...(today?.inFlightCandidates || []),
    ...(today?.launchedCandidates || []),
    ...(today?.rejectedCandidates || []),
  ];
  allCandidates.forEach((candidate, index) => validCandidateSnapshot(candidate, `Dashboard candidate ${index}`));
  assert(!allCandidates.some((candidate) => /meal planner/i.test(candidate.candidateTitle)), "Dashboard Today must not show excluded meal-planner candidates as active");
  assert(today?.totals?.pipelineCandidates === (today?.pipelineCandidates || []).length, "Dashboard pipeline total mismatch");
  assert(today?.totals?.inFlightCandidates === (today?.inFlightCandidates || []).length, "Dashboard in-flight total mismatch");
  assert(today?.totals?.launchedCandidates === (today?.launchedCandidates || []).length, "Dashboard launched total mismatch");
  assert(today?.totals?.rejectedCandidates === (today?.rejectedCandidates || []).length, "Dashboard rejected total mismatch");
  assert(typeof today?.totals?.productApiCostUsd === "number", "Dashboard today product API cost must be numeric");
  assert(typeof today?.totals?.governanceApiCostUsd === "number", "Dashboard today governance API cost must be numeric");
  assert(typeof today?.totals?.humanEscalationsTotal === "number", "Dashboard today human escalation count must be numeric");
  assert(Array.isArray(period?.buckets) && period.buckets.length >= 1, "Dashboard period buckets must contain entries");
  assert(typeof period?.totals?.rejectedLaunchCount === "number", "Dashboard period rejected launch count must be numeric");
  assert(typeof period?.totals?.totalApiCostUsd === "number", "Dashboard period total API cost must be numeric");
  assert(typeof period?.totals?.governanceApiCostUsd === "number", "Dashboard period governance API cost must be numeric");
  assert(today?.activeEscalation?.governanceFile === activeFlow?.stage_dispatch_ref, "Dashboard escalation must point to active dispatch");
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  validateFlow005Contracts();
  validateFixtures();
  console.log("FLOW-005 validation passed");
}
