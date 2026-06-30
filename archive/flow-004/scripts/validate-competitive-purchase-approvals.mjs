import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import YAML from "yaml";

const repoRoot = process.cwd();
const schemaPath = path.join(repoRoot, "specs", "SCHEMA-004.yaml");
const recordsDir = path.join(repoRoot, "records", "competitive_purchase_approval");

const schema = YAML.parse(fs.readFileSync(schemaPath, "utf8"))["SCHEMA-004"]
  .competitive_purchase_approval;

const requiredTopLevel = schema.required_top_level_fields;
const requiredSelected = schema.selected_competitor_required_fields;
const requiredLive = schema.live_purchase_verification_required_fields;
const requiredSpend = schema.spend_required_fields;
const requiredHumanDecision = schema.human_decision_required_fields;
const requiredPurchaseExecution = schema.purchase_execution_required_fields;

const legacyForbidden = [
  "selected_competitor.listing_url",
  "spend.external_purchase_cost_usd",
];

const files = fs
  .readdirSync(recordsDir)
  .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
  .sort();

const failures = [];

function getValue(root, dottedPath) {
  return dottedPath.split(".").reduce((value, key) => value?.[key], root);
}

function hasValue(value) {
  return value !== undefined && value !== "";
}

function requireFields(file, scopeName, object, fields) {
  for (const field of fields) {
    if (!hasValue(object?.[field])) {
      failures.push(`${file}: missing ${scopeName}.${field}`);
    }
  }
}

function valuesMatch(a, b) {
  return String(a) === String(b);
}

for (const file of files) {
  const relativePath = path.join("records", "competitive_purchase_approval", file);
  const fullPath = path.join(recordsDir, file);
  const parsed = YAML.parse(fs.readFileSync(fullPath, "utf8"));
  const approval = parsed?.competitive_purchase_approval;

  if (!approval) {
    failures.push(`${relativePath}: missing competitive_purchase_approval root`);
    continue;
  }

  requireFields(relativePath, "competitive_purchase_approval", approval, requiredTopLevel);
  requireFields(relativePath, "selected_competitor", approval.selected_competitor, requiredSelected);
  requireFields(relativePath, "spend", approval.spend, requiredSpend);
  requireFields(relativePath, "human_decision", approval.human_decision, requiredHumanDecision);
  requireFields(
    relativePath,
    "purchase_execution",
    approval.purchase_execution,
    requiredPurchaseExecution,
  );

  for (const forbiddenPath of legacyForbidden) {
    if (getValue(approval, forbiddenPath) !== undefined) {
      failures.push(`${relativePath}: forbidden legacy field ${forbiddenPath}`);
    }
  }

  const selected = approval.selected_competitor ?? {};
  const live = selected.live_purchase_verification ?? {};
  requireFields(relativePath, "selected_competitor.live_purchase_verification", live, requiredLive);

  if (live.verification_status !== "verified_live") {
    failures.push(`${relativePath}: live_purchase_verification.verification_status must be verified_live`);
  }

  for (const field of [
    "product_url",
    "title",
    "seller_name_if_visible",
    "current_price",
    "original_price_if_visible",
    "currency",
    "discount_summary_if_visible",
  ]) {
    if (hasValue(selected[field]) && hasValue(live[field]) && !valuesMatch(selected[field], live[field])) {
      failures.push(`${relativePath}: selected_competitor.${field} does not match live verification`);
    }
  }

  if (typeof selected.product_url === "string" && !/^https:\/\/www\.etsy\.com\/listing\/\d+\//.test(selected.product_url)) {
    failures.push(`${relativePath}: selected_competitor.product_url must be a buyable Etsy listing URL`);
  }

  if (hasValue(live.observed_at) && hasValue(live.max_age_hours_for_approval)) {
    const observedAt = new Date(live.observed_at);
    const maxAgeMs = Number(live.max_age_hours_for_approval) * 60 * 60 * 1000;
    if (Number.isNaN(observedAt.getTime())) {
      failures.push(`${relativePath}: live_purchase_verification.observed_at is not parseable`);
    } else if (!Number.isFinite(maxAgeMs) || maxAgeMs <= 0) {
      failures.push(`${relativePath}: live_purchase_verification.max_age_hours_for_approval must be positive`);
    } else if (Date.now() - observedAt.getTime() > maxAgeMs) {
      failures.push(`${relativePath}: live purchase verification is stale`);
    }
  }
}

if (failures.length > 0) {
  console.error("Competitive purchase approval validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Validated ${files.length} competitive purchase approval artifact(s).`);
