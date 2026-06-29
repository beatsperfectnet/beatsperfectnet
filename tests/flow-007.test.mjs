import assert from "node:assert/strict";
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

test("FLOW-007 is the active architecture-first flow", () => {
  const active = load("config/active-flow.yaml");
  const flow = load("workflows/FLOW-007.yaml")["FLOW-007"];
  const steps = flow.flow.map((stage) => stage.step_id);

  assert.equal(active.active_flow_id, "FLOW-007");
  assert.deepEqual(steps, [
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
  ]);
  assert.equal(flow.flow.find((stage) => stage.step_id === "04_build_readiness_review").gate.build_readiness_status_required, "BUILD_READY");
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
