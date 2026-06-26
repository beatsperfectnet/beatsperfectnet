import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import YAML from "yaml";

const repoRoot = process.cwd();

function loadYaml(relativePath) {
  return YAML.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(list, value, message) {
  assert(Array.isArray(list) && list.includes(value), message);
}

export function validateFlow006Contracts() {
  const flow = loadYaml("workflows/FLOW-006.yaml")["FLOW-006"];
  const schema = loadYaml("specs/SCHEMA-006.yaml")["SCHEMA-006"];
  const model = loadYaml("specs/MODEL-006.yaml")["MODEL-006"];
  const bls = loadYaml("specs/BLS-006.yaml")["BLS-006"];
  const budget = loadYaml("governance/08_product_generation_budget_006.yaml").product_generation_budget;
  const dispatch = loadYaml("governance/09_stage_dispatch_006.yaml").stage_dispatch;
  const corpus = loadYaml("specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml").founder_acceptance_corpus;
  const active = loadYaml("config/active-flow.yaml");

  assert(flow, "FLOW-006 root missing");
  assert(active?.active_flow_id === "FLOW-006", "FLOW-006 must be the active flow");
  assert(active?.workflow_contract_ref === "workflows/FLOW-006.yaml", "Active workflow ref must point to FLOW-006");
  assert(active?.stage_dispatch_ref === "governance/09_stage_dispatch_006.yaml", "Active dispatch ref must point to FLOW-006");
  assert(flow.purpose === "founder_acceptance_flow_for_publish_ready_human_products_and_listings", "FLOW-006 purpose must reflect founder acceptance");
  assert(Array.isArray(flow.required_inputs), "FLOW-006 required inputs missing");
  assertIncludes(flow.required_inputs, "specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml", "FLOW-006 must require founder corpus");
  assert(Array.isArray(flow.flow) && flow.flow.length === 18, "FLOW-006 must have 18 stages");

  const stepIds = flow.flow.map((stage) => stage.step_id);
  assertIncludes(stepIds, "08_founder_acceptance_simulation", "FLOW-006 founder acceptance stage missing");
  assert(stepIds.indexOf("08_founder_acceptance_simulation") < stepIds.indexOf("10_listing_creative_assembly"), "Founder acceptance must happen before listing assembly");
  const publicShelfRead = flow.flow.find((stage) => stage.step_id === "01_public_shelf_read");
  assert(publicShelfRead.agent_tier === "medium", "Public shelf read must use medium tier");
  assert(publicShelfRead.model_policy_ref === "MODEL-006.public_shelf_read_synthesis", "Public shelf read model policy ref mismatch");
  const founderStage = flow.flow.find((stage) => stage.step_id === "08_founder_acceptance_simulation");
  assert(founderStage.agent_tier === "frontier", "Founder acceptance must use frontier tier");
  assert(founderStage.model_policy_ref === "MODEL-006.founder_acceptance_simulation", "Founder acceptance model policy ref mismatch");
  assert(founderStage.corpus_ref === "specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml", "Founder acceptance corpus ref mismatch");
  assertIncludes(founderStage.action, "pressure_test_real_human_use_beyond_seed_demo_rows", "Founder acceptance must pressure test beyond demo rows");
  assertIncludes(founderStage.action, "directly_inspect_current_artifact_not_only_records", "Founder acceptance must directly inspect artifacts");
  assertIncludes(founderStage.action, "compare_current_product_to_prior_failed_artifact_for_material_delta", "Founder acceptance must compare against prior failed artifact");
  assertIncludes(founderStage.action, "define_listing_hook_rejection_criteria_before_asset_assembly", "Founder acceptance must define listing hook rejection criteria before assembly");
  assertIncludes(founderStage.action, "run_cost_outcome_accountability_review", "Founder acceptance must include cost/outcome accountability");
  assertIncludes(founderStage.action, "inspect_in_product_wording_for_human_language_not_developer_or_agent_language", "Founder acceptance must review buyer-facing wording");
  assert(founderStage.gate?.founder_acceptance_status_required === "pass", "Founder acceptance must be a hard pass gate");
  assert(founderStage.gate?.direct_artifact_inspection_required === true, "Founder acceptance must require direct artifact inspection");
  assert(founderStage.gate?.material_artifact_delta_required === true, "Founder acceptance must require material artifact delta");
  assert(founderStage.gate?.cost_outcome_accountability_required === true, "Founder acceptance must require cost/outcome accountability");

  const listingAssembly = flow.flow.find((stage) => stage.step_id === "10_listing_creative_assembly");
  assert(listingAssembly.agent_tier === "medium", "Listing creative assembly must use medium tier");
  assert(listingAssembly.model_policy_ref === "MODEL-006.listing_title_description_and_claim_map_assembly", "Listing assembly model policy ref mismatch");
  assertIncludes(listingAssembly?.action, "consume_founder_acceptance_ref", "Listing assembly must consume founder acceptance");
  assertIncludes(listingAssembly?.action, "define_specific_real_hook_for_each_listing_image", "Listing assembly must define a real hook for each image");
  assertIncludes(listingAssembly?.action, "record_grid_stop_reason_and_hook_delta_for_each_image", "Listing assembly must record grid-stop reason and hook delta");
  const listingGate = flow.flow.find((stage) => stage.step_id === "11_listing_quality_gate");
  assertIncludes(listingGate?.action, "consume_founder_acceptance_ref", "Listing quality gate must consume founder acceptance");
  assertIncludes(listingGate?.action, "judge_each_image_has_real_hook_not_only_clean_layout_or_screenshot_presence", "Listing gate must reject clean hookless assets");
  assertIncludes(listingGate?.action, "compare_listing_hook_strength_against_prior_hookless_assets", "Listing gate must compare hook strength against prior assets");
  const launch = flow.flow.find((stage) => stage.step_id === "12_delivery_launch");
  assertIncludes(launch?.gate?.ready_status_requires, "founder_acceptance_pass", "Delivery launch must require founder acceptance pass");
  assertIncludes(launch?.gate?.ready_status_requires, "visible_human_scale_capacity_pass", "Delivery launch must require visible human-scale capacity");
  assertIncludes(launch?.gate?.ready_status_requires, "material_artifact_delta_pass", "Delivery launch must require material artifact delta");
  assertIncludes(launch?.gate?.ready_status_requires, "cost_outcome_accountability_pass", "Delivery launch must require cost/outcome accountability");
  assertIncludes(launch?.gate?.ready_status_requires, "per_image_real_hook_pass", "Delivery launch must require real per-image hooks");

  assertIncludes(schema?.founder_acceptance_simulation?.required_top_level_fields, "founder_acceptance_status", "SCHEMA-006 founder acceptance status missing");
  assertIncludes(schema?.founder_acceptance_simulation?.required_top_level_fields, "direct_artifact_inspection_evidence", "SCHEMA-006 founder acceptance direct artifact evidence missing");
  assertIncludes(schema?.founder_acceptance_simulation?.required_top_level_fields, "artifact_delta_review", "SCHEMA-006 founder acceptance artifact delta missing");
  assertIncludes(schema?.founder_acceptance_simulation?.required_top_level_fields, "listing_hook_review", "SCHEMA-006 founder acceptance listing hook review missing");
  assertIncludes(schema?.founder_acceptance_simulation?.required_top_level_fields, "cost_outcome_accountability", "SCHEMA-006 founder acceptance cost accountability missing");
  assertIncludes(schema?.founder_acceptance_simulation?.required_top_level_fields, "corpus_pattern_results", "SCHEMA-006 corpus pattern results missing");
  assertIncludes(schema?.founder_acceptance_simulation?.required_top_level_fields, "rerun_from_step", "SCHEMA-006 rerun-from-step missing");
  assertIncludes(schema?.first_pass_build_manifest?.required_top_level_fields, "visible_capacity_manifest", "SCHEMA-006 build manifest visible capacity missing");
  assertIncludes(schema?.first_pass_build_manifest?.required_top_level_fields, "artifact_delta_against_prior", "SCHEMA-006 build manifest artifact delta missing");
  assertIncludes(schema?.qa_result?.required_top_level_fields, "visible_capacity_results", "SCHEMA-006 QA visible capacity missing");
  assertIncludes(schema?.qa_result?.required_top_level_fields, "artifact_delta_gate", "SCHEMA-006 QA artifact delta gate missing");
  assertIncludes(schema?.listing_creative_assembly?.required_top_level_fields, "per_image_visual_hook_strategy", "SCHEMA-006 listing assembly per-image hook strategy missing");
  assertIncludes(schema?.listing_creative_assembly?.required_top_level_fields, "founder_acceptance_ref", "SCHEMA-006 listing assembly founder acceptance ref missing");
  assertIncludes(schema?.listing_creative_assembly?.required_top_level_fields, "hook_delta_against_prior", "SCHEMA-006 listing assembly hook delta missing");
  assertIncludes(schema?.listing_quality_gate?.required_top_level_fields, "founder_acceptance_ref", "SCHEMA-006 listing gate must require founder acceptance ref");
  assertIncludes(schema?.listing_quality_gate?.required_top_level_fields, "real_hook_quality_gate", "SCHEMA-006 listing gate real hook quality missing");
  assertIncludes(schema?.listing_quality_gate?.required_top_level_fields, "grid_stop_reason_per_image", "SCHEMA-006 listing gate grid-stop reason missing");
  assertIncludes(schema?.launch_package?.required_top_level_fields, "founder_acceptance_ref", "SCHEMA-006 launch package must require founder acceptance ref");
  assertIncludes(schema?.launch_package?.required_top_level_fields, "artifact_delta_gate", "SCHEMA-006 launch package artifact delta missing");
  assertIncludes(schema?.launch_package?.required_top_level_fields, "cost_outcome_accountability_ref", "SCHEMA-006 launch package cost accountability ref missing");
  assertIncludes(schema?.launch_package?.ready_for_marketplace_publish_requires, "founder_acceptance_pass", "SCHEMA-006 launch ready must require founder acceptance");
  assertIncludes(schema?.launch_package?.ready_for_marketplace_publish_requires, "visible_human_scale_capacity_pass", "SCHEMA-006 launch ready must require visible capacity");
  assertIncludes(schema?.launch_package?.ready_for_marketplace_publish_requires, "material_artifact_delta_pass", "SCHEMA-006 launch ready must require material artifact delta");
  assertIncludes(schema?.launch_package?.ready_for_marketplace_publish_requires, "per_image_real_hook_pass", "SCHEMA-006 launch ready must require per-image real hook");

  assert(model?.stage_routing?.public_shelf_read_synthesis?.requested_model === "gpt-5.4", "MODEL-006 public shelf read must use medium model");
  assert(model?.stage_routing?.founder_acceptance_simulation?.requested_model === "gpt-5.5", "MODEL-006 founder acceptance must use frontier model");
  assert(model?.stage_routing?.listing_title_description_and_claim_map_assembly?.requested_model === "gpt-5.4", "MODEL-006 listing assembly must use medium model");
  assert(model?.stage_quality_rules?.founder_acceptance_simulation?.corpus_ref === "specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml", "MODEL-006 founder rule must reference corpus");
  assertIncludes(model?.stage_quality_rules?.founder_acceptance_simulation?.required_review_lanes, "real_human_use_pressure", "MODEL-006 founder rule must include human-use pressure");
  assertIncludes(model?.stage_quality_rules?.founder_acceptance_simulation?.required_review_lanes, "cost_outcome_accountability_review", "MODEL-006 founder rule must include cost accountability");
  assertIncludes(model?.stage_quality_rules?.founder_acceptance_simulation?.fail_if, "product_visible_capacity_matches_prior_failed_demo_version", "MODEL-006 founder rule must fail unchanged demo capacity");
  assertIncludes(model?.stage_quality_rules?.founder_acceptance_simulation?.fail_if, "listing_hook_criteria_would_allow_clean_layout_without_real_hook", "MODEL-006 founder rule must fail weak listing hook criteria");
  assertIncludes(model?.stage_quality_rules?.listing_title_description_and_claim_map_assembly?.forbidden_outputs, "repeated_clean_template_without_distinct_image_hooks", "MODEL-006 listing assembly must forbid repeated hookless templates");
  assertIncludes(model?.stage_quality_rules?.listing_quality_gate?.fail_if, "clean_assets_lack_real_hook", "MODEL-006 listing quality gate must fail clean hookless assets");
  assertIncludes(model?.stage_quality_rules?.founder_acceptance_simulation?.fail_if, "product_copy_sounds_like_developer_or_agent_language", "MODEL-006 founder rule must fail developerish copy");

  assertIncludes(bls?.candidate_stages, "founder_acceptance_simulation", "BLS-006 must include founder acceptance stage");
  assertIncludes(bls?.pre_launch_tracking, "founder_acceptance_ref", "BLS-006 must track founder acceptance ref");
  assertIncludes(bls?.pre_launch_tracking, "material_artifact_delta_status", "BLS-006 must track material artifact delta");
  assertIncludes(bls?.pre_launch_tracking, "per_image_real_hook_gate", "BLS-006 must track per-image hook gate");
  assertIncludes(bls?.pre_launch_tracking, "cost_outcome_accountability_status", "BLS-006 must track cost/outcome accountability");
  assertIncludes(bls?.launch_requires, "founder_acceptance_passed_or_explicit_human_override_recorded", "BLS-006 launch must require founder acceptance");
  assertIncludes(bls?.launch_requires, "visible_human_scale_capacity_passed", "BLS-006 launch must require visible human-scale capacity");
  assertIncludes(bls?.launch_requires, "material_artifact_delta_passed", "BLS-006 launch must require material artifact delta");
  assertIncludes(bls?.launch_requires, "per_image_real_hook_passed", "BLS-006 launch must require per-image hook pass");
  assertIncludes(bls?.launch_requires, "cost_outcome_accountability_passed", "BLS-006 launch must require cost/outcome accountability");

  assert(budget?.budget_id === "PGB-006", "PGB-006 budget id mismatch");
  assert(budget?.budget_window?.end_step_id === "12_delivery_launch", "PGB-006 budget must end at FLOW-006 launch step");
  assert(budget?.phase_budget_plan?.founder_acceptance?.stages?.includes("08_founder_acceptance_simulation"), "PGB-006 must budget founder acceptance");
  assert(budget?.hard_stop_rules?.paid_rerun_must_stop_if_material_artifact_delta_is_absent === true, "PGB-006 must stop paid reruns without material artifact delta");
  assert(budget?.hard_stop_rules?.material_spend_requires_product_or_listing_quality_delta === true, "PGB-006 must require quality delta for material spend");

  assert(dispatch?.stage_model_map?.["01_public_shelf_read"]?.model_policy_ref === "MODEL-006.public_shelf_read_synthesis", "Dispatch public shelf read must route synthesis");
  assert(dispatch?.stage_model_map?.["01_public_shelf_read"]?.requested_model === "gpt-5.4", "Dispatch public shelf read must use gpt-5.4");
  assert(dispatch?.stage_model_map?.["08_founder_acceptance_simulation"]?.model_policy_ref === "MODEL-006.founder_acceptance_simulation", "Dispatch must route founder acceptance");
  assert(dispatch?.stage_model_map?.["08_founder_acceptance_simulation"]?.requested_model === "gpt-5.5", "Dispatch founder acceptance must use gpt-5.5");
  assert(dispatch?.stage_model_map?.["10_listing_creative_assembly"]?.model_policy_ref === "MODEL-006.listing_title_description_and_claim_map_assembly", "Dispatch listing assembly must route listing assembly");
  assert(dispatch?.stage_model_map?.["10_listing_creative_assembly"]?.requested_model === "gpt-5.4", "Dispatch listing assembly must use gpt-5.4");
  assert(dispatch?.stage_model_map?.["12_delivery_launch"]?.model_policy_ref === "MODEL-006.delivery_assembly", "Dispatch launch step must be renumbered");

  assert(corpus?.corpus_id === "FOUNDER-ACCEPTANCE-CORPUS-001", "Founder corpus id mismatch");
  assert(corpus?.rejection_patterns?.some((pattern) => pattern.pattern_id === "demo_scale_rows"), "Founder corpus must include demo-scale rows rejection");
  assert(corpus?.rejection_patterns?.some((pattern) => pattern.pattern_id === "same_demo_workbook_after_rerun"), "Founder corpus must include same demo workbook rejection");
  assert(corpus?.rejection_patterns?.some((pattern) => pattern.pattern_id === "clean_listing_without_real_hook"), "Founder corpus must include clean hookless listing rejection");
  assert(corpus?.rejection_patterns?.some((pattern) => pattern.pattern_id === "paid_rerun_same_outcome"), "Founder corpus must include paid rerun same outcome rejection");
  assert(corpus?.rejection_patterns?.some((pattern) => pattern.pattern_id === "record_pass_without_artifact_proof"), "Founder corpus must include record pass without artifact proof rejection");
  assert(corpus?.rejection_patterns?.some((pattern) => pattern.pattern_id === "developerish_buyer_copy"), "Founder corpus must include developerish copy rejection");
  assert(corpus?.rejection_patterns?.some((pattern) => pattern.pattern_id === "report_slide_listing_asset"), "Founder corpus must include report-slide listing rejection");

  const launcher = fs.readFileSync(path.join(repoRoot, "runtime/model-stage-launcher.mjs"), "utf8");
  assert(/MODEL-\$\{flowSuffix\}/.test(launcher), "Runtime launcher must derive model policy from flow suffix");
  assert(/08_product_generation_budget_\$\{flowSuffix\}\.yaml/.test(launcher), "Runtime launcher must derive budget from flow suffix");

  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  validateFlow006Contracts();
  console.log("FLOW-006 validation passed");
}
