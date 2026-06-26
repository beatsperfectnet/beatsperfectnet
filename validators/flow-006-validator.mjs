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
  assertIncludes(founderStage.action, "inspect_in_product_wording_for_human_language_not_developer_or_agent_language", "Founder acceptance must review buyer-facing wording");
  assert(founderStage.gate?.founder_acceptance_status_required === "pass", "Founder acceptance must be a hard pass gate");

  const listingAssembly = flow.flow.find((stage) => stage.step_id === "10_listing_creative_assembly");
  assert(listingAssembly.agent_tier === "medium", "Listing creative assembly must use medium tier");
  assert(listingAssembly.model_policy_ref === "MODEL-006.listing_title_description_and_claim_map_assembly", "Listing assembly model policy ref mismatch");
  assertIncludes(listingAssembly?.action, "consume_founder_acceptance_ref", "Listing assembly must consume founder acceptance");
  const listingGate = flow.flow.find((stage) => stage.step_id === "11_listing_quality_gate");
  assertIncludes(listingGate?.action, "consume_founder_acceptance_ref", "Listing quality gate must consume founder acceptance");
  const launch = flow.flow.find((stage) => stage.step_id === "12_delivery_launch");
  assertIncludes(launch?.gate?.ready_status_requires, "founder_acceptance_pass", "Delivery launch must require founder acceptance pass");

  assertIncludes(schema?.founder_acceptance_simulation?.required_top_level_fields, "founder_acceptance_status", "SCHEMA-006 founder acceptance status missing");
  assertIncludes(schema?.founder_acceptance_simulation?.required_top_level_fields, "corpus_pattern_results", "SCHEMA-006 corpus pattern results missing");
  assertIncludes(schema?.founder_acceptance_simulation?.required_top_level_fields, "rerun_from_step", "SCHEMA-006 rerun-from-step missing");
  assertIncludes(schema?.listing_quality_gate?.required_top_level_fields, "founder_acceptance_ref", "SCHEMA-006 listing gate must require founder acceptance ref");
  assertIncludes(schema?.launch_package?.required_top_level_fields, "founder_acceptance_ref", "SCHEMA-006 launch package must require founder acceptance ref");
  assertIncludes(schema?.launch_package?.ready_for_marketplace_publish_requires, "founder_acceptance_pass", "SCHEMA-006 launch ready must require founder acceptance");

  assert(model?.stage_routing?.public_shelf_read_synthesis?.requested_model === "gpt-5.4", "MODEL-006 public shelf read must use medium model");
  assert(model?.stage_routing?.founder_acceptance_simulation?.requested_model === "gpt-5.5", "MODEL-006 founder acceptance must use frontier model");
  assert(model?.stage_routing?.listing_title_description_and_claim_map_assembly?.requested_model === "gpt-5.4", "MODEL-006 listing assembly must use medium model");
  assert(model?.stage_quality_rules?.founder_acceptance_simulation?.corpus_ref === "specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml", "MODEL-006 founder rule must reference corpus");
  assertIncludes(model?.stage_quality_rules?.founder_acceptance_simulation?.required_review_lanes, "real_human_use_pressure", "MODEL-006 founder rule must include human-use pressure");
  assertIncludes(model?.stage_quality_rules?.founder_acceptance_simulation?.fail_if, "product_copy_sounds_like_developer_or_agent_language", "MODEL-006 founder rule must fail developerish copy");

  assertIncludes(bls?.candidate_stages, "founder_acceptance_simulation", "BLS-006 must include founder acceptance stage");
  assertIncludes(bls?.pre_launch_tracking, "founder_acceptance_ref", "BLS-006 must track founder acceptance ref");
  assertIncludes(bls?.launch_requires, "founder_acceptance_passed_or_explicit_human_override_recorded", "BLS-006 launch must require founder acceptance");

  assert(budget?.budget_id === "PGB-006", "PGB-006 budget id mismatch");
  assert(budget?.budget_window?.end_step_id === "12_delivery_launch", "PGB-006 budget must end at FLOW-006 launch step");
  assert(budget?.phase_budget_plan?.founder_acceptance?.stages?.includes("08_founder_acceptance_simulation"), "PGB-006 must budget founder acceptance");

  assert(dispatch?.stage_model_map?.["01_public_shelf_read"]?.model_policy_ref === "MODEL-006.public_shelf_read_synthesis", "Dispatch public shelf read must route synthesis");
  assert(dispatch?.stage_model_map?.["01_public_shelf_read"]?.requested_model === "gpt-5.4", "Dispatch public shelf read must use gpt-5.4");
  assert(dispatch?.stage_model_map?.["08_founder_acceptance_simulation"]?.model_policy_ref === "MODEL-006.founder_acceptance_simulation", "Dispatch must route founder acceptance");
  assert(dispatch?.stage_model_map?.["08_founder_acceptance_simulation"]?.requested_model === "gpt-5.5", "Dispatch founder acceptance must use gpt-5.5");
  assert(dispatch?.stage_model_map?.["10_listing_creative_assembly"]?.model_policy_ref === "MODEL-006.listing_title_description_and_claim_map_assembly", "Dispatch listing assembly must route listing assembly");
  assert(dispatch?.stage_model_map?.["10_listing_creative_assembly"]?.requested_model === "gpt-5.4", "Dispatch listing assembly must use gpt-5.4");
  assert(dispatch?.stage_model_map?.["12_delivery_launch"]?.model_policy_ref === "MODEL-006.delivery_assembly", "Dispatch launch step must be renumbered");

  assert(corpus?.corpus_id === "FOUNDER-ACCEPTANCE-CORPUS-001", "Founder corpus id mismatch");
  assert(corpus?.rejection_patterns?.some((pattern) => pattern.pattern_id === "demo_scale_rows"), "Founder corpus must include demo-scale rows rejection");
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
