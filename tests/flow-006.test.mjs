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
  assert.ok(ids.includes("developerish_buyer_copy"));
  assert.ok(ids.includes("tiny_listing_surface"));
  assert.ok(ids.includes("report_slide_listing_asset"));
  assert.ok(ids.includes("feature_list_instead_of_promise"));
  assert.ok(ids.includes("competitor_failure_treated_as_blocker"));
  assert.ok(ids.includes("market_research_tool_missing_but_flow_continued"));
});

test("Runtime launcher can derive FLOW-006 policy and budget by suffix", () => {
  const launcher = fs.readFileSync(path.join(repoRoot, "runtime/model-stage-launcher.mjs"), "utf8");

  assert.match(launcher, /const flowSuffix = flowVersion\.split\('-'\)\[1\]/);
  assert.match(launcher, /const modelPolicyRef = `specs\/MODEL-\$\{flowSuffix\}\.yaml`/);
  assert.match(launcher, /const generationBudgetRef = `governance\/08_product_generation_budget_\$\{flowSuffix\}\.yaml`/);
});
