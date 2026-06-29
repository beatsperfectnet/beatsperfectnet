#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import YAML from "yaml";

const repoRoot = process.cwd();

function activeFlowConfig() {
  return readYaml("config/active-flow.yaml") || {
    active_flow_id: "FLOW-007",
    workflow_contract_ref: "workflows/FLOW-007.yaml",
    model_policy_ref: "specs/MODEL-007.yaml",
    stage_dispatch_ref: "governance/09_stage_dispatch_007.yaml",
    schema_ref: "specs/SCHEMA-007.yaml",
    build_lifecycle_ref: "specs/BLS-007.yaml",
  };
}

const activeFlow = activeFlowConfig();
const activeFlowId = activeFlow.active_flow_id || "FLOW-007";
const activeDispatchRef = activeFlow.stage_dispatch_ref || "governance/09_stage_dispatch_007.yaml";
const activeContractRefs = [
  activeFlow.workflow_contract_ref,
  activeFlow.schema_ref,
  activeFlow.model_policy_ref,
  activeFlow.build_lifecycle_ref,
  "governance/05_governance_rules.yaml",
  activeFlowId === "FLOW-007" ? "docs/FLOW-007.md" : null,
  activeFlowId === "FLOW-006" ? "specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml" : null,
  activeFlowId === "FLOW-007" ? "governance/08_product_generation_budget_007.yaml" : "governance/08_product_generation_budget_006.yaml",
  activeDispatchRef,
].filter(Boolean);

const flow006Timeline = [
  { stageGroup: "admission", stepIds: ["00_candidate_admission"] },
  { stageGroup: "read", stepIds: ["01_public_shelf_read"] },
  { stageGroup: "purchase", stepIds: ["02_mandatory_competitor_purchase"] },
  { stageGroup: "inspect", stepIds: ["03_hidden_buyer_experience_inspection"] },
  { stageGroup: "synthesis", stepIds: ["04_alignment_synthesis"] },
  { stageGroup: "spec", stepIds: ["05_one_promise_propagation_system_spec"] },
  { stageGroup: "build", stepIds: ["06_first_pass_connected_build"] },
  { stageGroup: "qa", stepIds: ["07_propagation_buyer_experience_product_visual_qa"] },
  { stageGroup: "founder_acceptance", stepIds: ["08_founder_acceptance_simulation"] },
  { stageGroup: "optional", stepIds: ["09_optional_supporting_feature_pass"] },
  { stageGroup: "listing", stepIds: ["10_listing_creative_assembly"] },
  { stageGroup: "gate", stepIds: ["11_listing_quality_gate"] },
  { stageGroup: "pre_mortem", stepIds: ["11b_pre_mortem_failure_analysis"] },
  { stageGroup: "launch", stepIds: ["12_delivery_launch"] },
  { stageGroup: "post_launch", stepIds: ["13_monthly_outcomes", "14_competitor_purchase_accounting", "15_kill_rules", "16_resource_allocation_rules", "17_company_metrics"] },
];

const flow007Timeline = [
  { stageGroup: "market", stepIds: ["00_market_evidence"] },
  { stageGroup: "benchmark", stepIds: ["01_competitor_product_autopsy"] },
  { stageGroup: "architecture", stepIds: ["02_product_architecture_contract"] },
  { stageGroup: "scenarios", stepIds: ["03_scenario_matrix"] },
  { stageGroup: "readiness", stepIds: ["04_build_readiness_review"] },
  { stageGroup: "build", stepIds: ["05_product_build"] },
  { stageGroup: "artifact_qa", stepIds: ["06_real_artifact_inspection"] },
  { stageGroup: "walkthrough", stepIds: ["07_blind_buyer_walkthrough"] },
  { stageGroup: "listing", stepIds: ["08_listing_packaging_qa"] },
  { stageGroup: "launch", stepIds: ["09_founder_launch_gate"] },
];

const stageTimeline = activeFlowId === "FLOW-007" ? flow007Timeline : flow006Timeline;

function readYaml(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  return YAML.parse(fs.readFileSync(absolutePath, "utf8"));
}

function fileMtimeMs(relativePath) {
  if (!relativePath) return 0;
  const absolutePath = path.join(repoRoot, String(relativePath).split("#")[0]);
  if (!fs.existsSync(absolutePath)) return 0;
  return fs.statSync(absolutePath).mtimeMs;
}

function latestMtimeMs(relativePaths) {
  return Math.max(0, ...relativePaths.map(fileMtimeMs));
}

function readYamlFiles(relativeDir) {
  const absoluteDir = path.join(repoRoot, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  return fs
    .readdirSync(absoluteDir)
    .filter((name) => name.endsWith(".yaml") || name.endsWith(".yml"))
    .sort()
    .map((name) => ({
      relativePath: path.join(relativeDir, name),
      doc: readYaml(path.join(relativeDir, name)),
    }))
    .filter((entry) => entry.doc);
}

function nowBerlin() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")} ${value("hour")}:${value("minute")} ${value("timeZoneName")}`;
}

function currentBerlinDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function ledgerAsOfText() {
  const asOf = String(apiCostLedger().as_of || "").trim();
  return asOf || null;
}

function ledgerAsOfDate() {
  const asOf = ledgerAsOfText();
  const match = asOf?.match(/^(\d{4}-\d{2}-\d{2})\b/);
  return match?.[1] || null;
}

function stageGroupForStep(stepId) {
  return stageTimeline.find((stage) => stage.stepIds.includes(stepId))?.stageGroup ?? null;
}

function stepForEscalationStage(stageGroup) {
  const normalized = String(stageGroup || "").trim().toLowerCase();
  const map = {
    flow_governance: "04_alignment_synthesis",
    product_quality: "07_propagation_buyer_experience_product_visual_qa",
    product_model: "05_one_promise_propagation_system_spec",
    buyer_safety: "05_one_promise_propagation_system_spec",
    purchase: "02_mandatory_competitor_purchase",
    mandatory_competitor_purchase: "02_mandatory_competitor_purchase",
  };
  return map[normalized] || null;
}

function normalizeCurrentStep(candidate) {
  const raw = String(candidate.current_stage || "").trim();
  if (stageTimeline.some((stage) => stage.stepIds.includes(raw))) return raw;

  const aliases = {
    purchase_approval: "02_mandatory_competitor_purchase",
    mandatory_competitor_purchase: "02_mandatory_competitor_purchase",
    publish_pending: "12_delivery_launch",
    marketplace_publish: "12_delivery_launch",
    ready_for_marketplace_publish: "12_delivery_launch",
    pass_pending_marketplace_publish: "12_delivery_launch",
    published: "12_monthly_outcomes",
    FLOW_006_FAILURE_CASE: "04_build_readiness_review",
    NOT_BUILD_READY: "04_build_readiness_review",
  };
  return aliases[raw] ?? null;
}

function candidateTitle(candidate) {
  const candidateId = candidate.candidate_id;
  const listingSpecRef = candidate.listing_spec_ref;
  const productSpecRef = candidate.product_spec_ref;
  const listingSpec = listingSpecRef ? readYaml(listingSpecRef)?.listing_spec : null;
  const productSpec = productSpecRef ? readYaml(productSpecRef)?.product_spec : null;
  return (
    listingSpec?.product_name ||
    productSpec?.product_name ||
    candidate.product_name ||
    candidate.product_thesis ||
    candidateId
  );
}

function candidateTitleById(candidateId) {
  const candidate = allCandidates().find((item) => item?.candidate_id === candidateId);
  return candidate ? candidateTitle(candidate) : candidateId;
}

function allCandidates() {
  return readYamlFiles("records/candidates").flatMap((entry) => entry.doc?.candidates || []);
}

function launchRecord(candidate) {
  const ref = candidate.launch_review_result;
  if (!ref) return null;
  const doc = readYaml(ref);
  return doc?.launch_package || doc?.launch_review || null;
}

function productLaneExclusions() {
  const doc = readYaml("governance/product_lane_exclusions.yaml");
  return doc?.product_lane_exclusions?.lanes || [];
}

function apiCostLedger() {
  return readYaml("records/costs/api_cost_ledger.yaml")?.api_cost_ledger || {
    entries: [],
    human_escalations: [],
  };
}

function activeGenerationBudget() {
  const budgetRef = activeFlowId === "FLOW-007"
    ? "governance/08_product_generation_budget_007.yaml"
    : "governance/08_product_generation_budget_006.yaml";
  return readYaml(budgetRef)?.product_generation_budget || {};
}

function ledgerEntries() {
  return apiCostLedger().entries || [];
}

function humanEscalations() {
  return apiCostLedger().human_escalations || [];
}

function flowStepChanges() {
  return readYamlFiles("records/flow_step_changes")
    .map((entry) => ({
      relativePath: entry.relativePath,
      ...(entry.doc?.flow_step_change || {}),
    }))
    .filter((entry) => entry.change_id);
}

function flow007ValidationByCandidateId() {
  const out = new Map();
  for (const entry of readYamlFiles("records/flow_007_validation")) {
    const validation = entry.doc?.flow_007_validation;
    if (validation?.candidate_id) {
      out.set(validation.candidate_id, { relativePath: entry.relativePath, ...validation });
    }
  }
  return out;
}

function failureCaseByCandidateId() {
  const out = new Map();
  const dir = path.join(repoRoot, "records", "failure-cases");
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir).filter((entry) => entry.endsWith(".md")).sort()) {
    const relativePath = path.join("records", "failure-cases", name);
    const content = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
    const candidateMatch = content.match(/^Candidate:\s*(.+)$/m);
    const statusMatch = content.match(/^Status:\s*(.+)$/m);
    if (candidateMatch) {
      out.set(candidateMatch[1].trim(), {
        relativePath,
        status: statusMatch?.[1]?.trim() || "FLOW_006_FAILURE_CASE",
      });
    }
  }
  return out;
}

function timestampMs(value) {
  const ms = Date.parse(String(value || ""));
  return Number.isFinite(ms) ? ms : 0;
}

function latestFlowStepChangeForCandidate(candidate) {
  const candidateId = candidate?.candidate_id;
  if (!candidateId) return null;
  return flowStepChanges()
    .filter((entry) => entry.candidate_id === candidateId)
    .sort((a, b) => {
      const byTime = timestampMs(a.triggered_at) - timestampMs(b.triggered_at);
      if (byTime !== 0) return byTime;
      return String(a.relativePath).localeCompare(String(b.relativePath));
    })
    .at(-1) || null;
}

function latestFlowStepChangeAfterActiveContractChange(candidate) {
  const latestChange = latestFlowStepChangeForCandidate(candidate);
  if (!latestChange) return false;
  return timestampMs(latestChange.triggered_at) > latestMtimeMs(activeContractRefs);
}

function ledgerEntryDate(entry) {
  return String(entry.date || "").slice(0, 10);
}

function sumLedger(entries) {
  return Number(entries.reduce((total, entry) => total + Number(entry.amount_usd || 0), 0).toFixed(2));
}

function totalCostForCandidate(candidateId) {
  return sumLedger(
    ledgerEntries().filter((entry) => String(entry.candidate_id || "").trim() === candidateId),
  );
}

function rejectedProductCandidateIds(candidates = allCandidates()) {
  const ids = new Set();
  for (const entry of readYamlFiles("records/validation")) {
    const review = entry.doc?.launch_review;
    if (review?.candidate_ref && isRejectedLaunch(review)) {
      ids.add(review.candidate_ref);
    }
  }
  return ids;
}

function rejectedProductCostEntries(entries = ledgerEntries(), candidates = allCandidates()) {
  const rejectedIds = rejectedProductCandidateIds(candidates);
  return entries.filter((entry) => entry.bucket === "product_generation" && rejectedIds.has(entry.candidate_id));
}

function todayLedgerEntries() {
  const today = currentBerlinDate();
  return ledgerEntries().filter((entry) => ledgerEntryDate(entry) === today);
}

function todayHumanEscalations() {
  const today = currentBerlinDate();
  return humanEscalations().filter((entry) => ledgerEntryDate(entry) === today);
}

function latestHumanEscalationForCandidate(candidate) {
  const candidateId = candidate?.candidate_id;
  const entries = todayHumanEscalations().filter((entry) => {
    const entryCandidate = String(entry.candidate_id || "").trim();
    return entryCandidate === candidateId || (!entryCandidate && String(entry.stage_group || "") === "flow_governance");
  });
  return entries.at(-1) || null;
}

function latestHumanEscalationForDashboard(candidates) {
  const candidateIds = new Set(candidates.map((candidate) => candidate.candidate_id));
  const entries = todayHumanEscalations().filter((entry) => {
    const entryCandidate = String(entry.candidate_id || "").trim();
    return !entryCandidate || candidateIds.has(entryCandidate);
  });
  return entries.at(-1) || null;
}

function activeContractChangedAfterCandidateReview(candidate) {
  const reviewRef = candidate?.launch_review_result;
  if (!reviewRef) return false;
  if (latestFlowStepChangeAfterActiveContractChange(candidate)) return false;
  const reviewMtime = fileMtimeMs(reviewRef);
  if (!reviewMtime) return false;
  return latestMtimeMs(activeContractRefs) > reviewMtime;
}

function costBreakdown(entries) {
  const productEntries = entries.filter((entry) => entry.bucket === "product_generation");
  const governanceEntries = entries.filter((entry) => entry.bucket === "governance");
  const unallocatedEntries = entries.filter((entry) => !["product_generation", "governance"].includes(entry.bucket));
  return {
    productApiCostUsd: sumLedger(productEntries),
    governanceApiCostUsd: sumLedger(governanceEntries),
    unallocatedApiCostUsd: sumLedger(unallocatedEntries),
    totalApiCostUsd: sumLedger(entries),
  };
}

function todayLogEntries() {
  return todayLedgerEntries().map((entry) => {
    const bucket = String(entry.bucket || "");
    const entryId = String(entry.entry_id || "");
    const isFlowTransition = entryId.startsWith("FLOW-");
    const amount = Number(entry.amount_usd || 0);
    return {
      id: entryId,
      kind: isFlowTransition
        ? "flow_transition"
        : bucket === "product_generation"
          ? "product_cost"
          : bucket === "governance"
            ? "governance_cost"
            : "other",
      label: isFlowTransition
        ? "Archived flow to FLOW-006"
        : bucket === "product_generation"
          ? `${entry.product_name || "Product"} product API`
          : bucket === "governance"
            ? "Governance cost"
            : "Other cost",
      detail: String(entry.notes || entry.product_name || entry.source || ""),
      amountUsd: Number(amount.toFixed(2)),
    };
  });
}

function candidateSearchText(candidate) {
  return [
    candidate.candidate_id,
    candidate.product_thesis,
    candidateTitle(candidate),
    candidate.current_stage,
    candidate.terminal_status,
    candidate.terminal_reason,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function laneMatchesCandidate(lane, candidate) {
  if ((lane.source_candidate_refs || []).includes(candidate.candidate_id)) return true;
  const searchText = candidateSearchText(candidate);
  return (lane.keyword_match_terms || []).some((term) => searchText.includes(String(term).toLowerCase()));
}

function laneIsCurrentlyExcluded(lane, candidate) {
  if (lane.status === "excluded_by_human_rejection") return true;
  if (lane.status === "pending_exclusion_after_marketplace_publish") {
    const record = launchRecord(candidate);
    return isPublished(record) || String(candidate.current_stage || "").toLowerCase() === "published";
  }
  return Boolean(lane.excluded_from_future_idea_runs || lane.excluded_from_candidate_admission);
}

function isExcludedFromActiveDashboard(candidate) {
  if (String(candidate.exclusion_check?.status || "").startsWith("rejected_excluded")) return true;
  if (String(candidate.terminal_status || "") === "rejected_before_launch") return true;
  return productLaneExclusions().some((lane) => laneMatchesCandidate(lane, candidate) && laneIsCurrentlyExcluded(lane, candidate));
}

function isRejectedLaunch(record) {
  const status = String(record?.status || record?.result || "").toLowerCase();
  return status.includes("revision_required") || status.includes("revision_requested") || status.includes("rejected");
}

function isPublished(record) {
  const status = String(record?.publish_status || record?.status || record?.result || "").toLowerCase();
  return status === "published" || status.includes("marketplace_publish_complete");
}

function readableValue(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(readableValue).filter(Boolean).join(" ");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, entryValue]) => [key, readableValue(entryValue)].filter(Boolean).join(": "))
      .join(" ");
  }
  return String(value);
}

function outcomeStatus(candidate) {
  const validation = flow007ValidationByCandidateId().get(candidate.candidate_id);
  const failureCase = failureCaseByCandidateId().get(candidate.candidate_id);
  if (
    failureCase?.status === "FLOW_006_FAILURE_CASE" ||
    validation?.build_readiness?.status === "NOT_BUILD_READY" ||
    validation?.result?.status === "NOT_BUILD_READY"
  ) {
    return "rejected_before_launch";
  }
  const record = launchRecord(candidate);
  const current = String(candidate.current_stage || "").toLowerCase();
  if (isPublished(record) || current === "published") return "launched";
  if (isRejectedLaunch(record)) return "rejected_before_launch";
  if (current === "purchase_approval" || current === "queued") return "pipeline";
  return "in_flight";
}

function healthFor(candidate) {
  const hardBudgetUsd = Number(
    candidate.generation_budget_usd ||
    activeGenerationBudget().generation_budget_usd ||
    activeGenerationBudget().total_hard_budget_usd ||
    25,
  );
  const totalUsdSpent = totalCostForCandidate(candidate.candidate_id);
  const budgetPass = candidate.generation_budget_pass !== false && totalUsdSpent <= hardBudgetUsd;
  const qualityPass =
    candidate.listing_quality_pass !== false &&
    candidate.product_quality_pass !== false &&
    candidate.delivery_quality_pass !== false;
  return {
    budgetHealth: budgetPass ? "green" : "red",
    processHealth: qualityPass ? "green" : "yellow",
  };
}

function publicCandidateSnapshot(candidate) {
  const status = outcomeStatus(candidate);
  const validation = flow007ValidationByCandidateId().get(candidate.candidate_id);
  const failureCase = failureCaseByCandidateId().get(candidate.candidate_id);
  const latestStepChange = latestFlowStepChangeForCandidate(candidate);
  const humanEscalation = latestHumanEscalationForCandidate(candidate);
  const escalationStepId = stepForEscalationStage(humanEscalation?.stage_group);
  const contractInvalidatesReview = activeContractChangedAfterCandidateReview(candidate);
  const stepChangeStepId = latestStepChange?.to_step_id || latestStepChange?.from_step_id || null;
  const currentStepId = validation?.build_readiness?.status === "NOT_BUILD_READY"
    ? "04_build_readiness_review"
    : stepChangeStepId || (contractInvalidatesReview ? (activeFlowId === "FLOW-007" ? "02_product_architecture_contract" : "04_alignment_synthesis") : (escalationStepId || normalizeCurrentStep(candidate)));
  const currentStageGroup = currentStepId ? stageGroupForStep(currentStepId) : null;
  const launch = launchRecord(candidate);
  const terminalReason = status === "rejected_before_launch"
    ? validation?.result?.summary || failureCase?.status || launch?.decisionSummary || launch?.reason || launch?.result || "Rejected before marketplace launch."
    : undefined;
  const health = healthFor(candidate);
  const stageReason = validation?.build_readiness?.status === "NOT_BUILD_READY"
    ? validation.result?.summary || "FLOW-007 dry validation returned NOT_BUILD_READY."
    : latestStepChange?.reason
    ? String(latestStepChange.reason)
    : humanEscalation?.reason
    ? String(humanEscalation.reason)
    : contractInvalidatesReview
      ? "Active FLOW-006 contract changed after the last launch review; product is not ready for publish and must rerun from synthesis."
      : undefined;

  return {
    candidateId: candidate.candidate_id,
    candidateLabel: candidate.idea_ref || "",
    candidateTitle: candidateTitle(candidate),
    outcomeStatus: status,
    ...(currentStepId ? { currentStepId } : {}),
    ...(currentStageGroup ? { currentStageGroup } : {}),
    ...(stageReason ? { stageReason } : {}),
    ...(latestStepChange ? {
      latestStepChange: {
        changeId: latestStepChange.change_id,
        fromStepId: latestStepChange.from_step_id || "",
        toStepId: latestStepChange.to_step_id || "",
        status: latestStepChange.status || "",
        triggeredAt: latestStepChange.triggered_at || "",
        sourceRef: latestStepChange.relativePath,
      },
    } : {}),
    totalTokensUsed: Number(candidate.cumulative_total_tokens || 0),
    totalUsdSpent: totalCostForCandidate(candidate.candidate_id),
    launchTokens: 0,
    governanceTokens: 0,
    postLaunchSupportTokens: 0,
    refundTokens: 0,
    refundCount: 0,
    budgetHealth: health.budgetHealth,
    processHealth: status === "rejected_before_launch" ? "red" : contractInvalidatesReview ? "yellow" : health.processHealth,
    ...(terminalReason ? { terminalReason } : {}),
  };
}

function activeFlowCandidates() {
  return readYamlFiles("records/candidates")
    .flatMap((entry) => entry.doc?.candidates || [])
    .filter((candidate) => candidate?.candidate_id)
    .filter((candidate) => {
      const original = String(candidate.original_flow_contract_ref || "");
      const requalified = candidate.requalified_under || [];
      const validation = flow007ValidationByCandidateId().has(candidate.candidate_id);
      if (activeFlowId === "FLOW-007") return validation || original.includes("FLOW-007") || requalified.some((ref) => String(ref).includes("FLOW-007"));
      return original.includes("FLOW-006");
    })
    .filter((candidate) => !isExcludedFromActiveDashboard(candidate));
}

function activePurchaseEscalation(candidates) {
  const pendingPurchaseCandidate = candidates.find((candidate) => {
    const currentStepId = normalizeCurrentStep(candidate);
    return currentStepId === "02_mandatory_competitor_purchase" && String(candidate.purchase_status || "") !== "complete";
  });
  if (!pendingPurchaseCandidate) return null;

  return {
    status: "pending",
    scope: "build",
    candidateId: pendingPurchaseCandidate.candidate_id,
    candidateLabel: pendingPurchaseCandidate.idea_ref || "",
    candidateTitle: candidateTitle(pendingPurchaseCandidate),
    reason: "Competitor purchase requires human approval before external spend.",
    recommendedAction: "Approve or reject the purchase before continuing FLOW-006.",
    governanceFile: activeDispatchRef,
  };
}

function contractChangeEscalation(candidates) {
  const candidate = candidates.find(activeContractChangedAfterCandidateReview);
  if (!candidate) return null;
  return {
    status: "pending",
    scope: "build",
    candidateId: candidate.candidate_id,
    candidateLabel: candidate.idea_ref || "",
    candidateTitle: candidateTitle(candidate),
    reason: `Active ${activeFlowId} contract changed after this candidate's last launch review.`,
    recommendedAction: activeFlowId === "FLOW-007" ? "Return to Product Architecture Contract before any build." : "Rerun from 04_alignment_synthesis so the dashboard and artifact state match the live flow.",
    governanceFile: activeDispatchRef,
  };
}

function humanEscalationDashboardState(escalation, candidates) {
  if (!escalation) return null;
  const candidateId = String(escalation.candidate_id || "").trim();
  const candidate = candidateId
    ? candidates.find((item) => item.candidate_id === candidateId)
    : candidates.find((item) => String(item.original_flow_contract_ref || "").includes("FLOW-006"));
  const scope = String(escalation.stage_group || "").includes("post_launch") ? "post_launch" : "build";
  const outcome = String(escalation.outcome || "").trim();
  return {
    status: outcome ? "resolved" : "pending",
    scope,
    candidateId: candidate?.candidate_id || candidateId,
    candidateLabel: candidate?.idea_ref || "",
    candidateTitle: candidate ? candidateTitle(candidate) : candidateId,
    reason: String(escalation.reason || ""),
    recommendedAction: outcome
      ? `Recorded outcome: ${outcome}.`
      : "Resolve the human-requested product or flow change before continuing.",
    governanceFile: activeDispatchRef,
  };
}

function sum(items, getter) {
  return Number(items.reduce((total, item) => total + Number(getter(item) || 0), 0).toFixed(6));
}

function bucketTotals(candidates) {
  const todayCosts = costBreakdown(todayLedgerEntries());
  const todayEscalations = todayHumanEscalations();
  return {
    pipelineCandidates: candidates.filter((candidate) => candidate.outcomeStatus === "pipeline").length,
    inFlightCandidates: candidates.filter((candidate) => candidate.outcomeStatus === "in_flight").length,
    launchedCandidates: candidates.filter((candidate) => candidate.outcomeStatus === "launched").length,
    rejectedCandidates: candidates.filter((candidate) => candidate.outcomeStatus === "rejected_before_launch").length,
    totalSpendUsd: todayCosts.totalApiCostUsd,
    productApiCostUsd: todayCosts.productApiCostUsd,
    governanceApiCostUsd: todayCosts.governanceApiCostUsd,
    unallocatedApiCostUsd: todayCosts.unallocatedApiCostUsd,
    humanEscalationsTotal: todayEscalations.length,
    pipelineUsdTotal: sum(candidates.filter((candidate) => candidate.outcomeStatus === "pipeline"), (candidate) => candidate.totalUsdSpent),
    inFlightUsdTotal: sum(candidates.filter((candidate) => candidate.outcomeStatus === "in_flight"), (candidate) => candidate.totalUsdSpent),
    launchedUsdTotal: sum(candidates.filter((candidate) => candidate.outcomeStatus === "launched"), (candidate) => candidate.totalUsdSpent),
    rejectedUsdTotal: sum(candidates.filter((candidate) => candidate.outcomeStatus === "rejected_before_launch"), (candidate) => candidate.totalUsdSpent),
    pipelineTokensTotal: sum(candidates.filter((candidate) => candidate.outcomeStatus === "pipeline"), (candidate) => candidate.totalTokensUsed),
    inFlightTokensTotal: sum(candidates.filter((candidate) => candidate.outcomeStatus === "in_flight"), (candidate) => candidate.totalTokensUsed),
    launchedTokensTotal: sum(candidates.filter((candidate) => candidate.outcomeStatus === "launched"), (candidate) => candidate.totalTokensUsed),
    rejectedTokensTotal: sum(candidates.filter((candidate) => candidate.outcomeStatus === "rejected_before_launch"), (candidate) => candidate.totalTokensUsed),
    launchTokensTotal: sum(candidates, (candidate) => candidate.launchTokens),
    governanceTokensTotal: sum(candidates, (candidate) => candidate.governanceTokens),
    postLaunchSupportTokensTotal: sum(candidates, (candidate) => candidate.postLaunchSupportTokens),
    refundTokensTotal: sum(candidates, (candidate) => candidate.refundTokens),
    refundCountTotal: sum(candidates, (candidate) => candidate.refundCount),
  };
}

function latestRejectedLaunch() {
  const rejected = readYamlFiles("records/validation")
    .map((entry) => {
      const review = entry.doc?.launch_review;
      if (!review || !isRejectedLaunch(review)) return null;
      return {
        reviewId: review.review_id || path.basename(entry.relativePath, path.extname(entry.relativePath)),
        candidateId: review.candidate_ref || "",
        candidateTitle: candidateTitleById(review.candidate_ref),
        reviewedAt: String(review.reviewed_at || ""),
        flowContractRef: review.flow_contract_ref || "",
        status: review.status || review.result || "",
        decisionSummary: review.marketplace_publish_gate?.reason || review.decisionSummary || review.decision_summary || review.result || "Rejected before marketplace publishing.",
        blockerSummary: readableValue(review.launch_blockers),
        evidenceRefs: [entry.relativePath, ...(review.consumed_refs ? Object.values(review.consumed_refs).filter(Boolean) : [])],
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(b.reviewedAt).localeCompare(String(a.reviewedAt)));
  return rejected[0] || null;
}

function competitorPurchaseSpendEntries() {
  return readYamlFiles("records/competitive_purchase_approval")
    .map((entry) => {
      const approval = entry.doc?.competitive_purchase_approval;
      const acquisition = approval?.acquisition || approval?.purchase_execution || {};
      const status = String(acquisition.purchase_status || approval?.status || "").toLowerCase();
      const date = String(acquisition.purchase_date || approval?.human_decision?.decision_date || "").slice(0, 10);
      const amount = Number(acquisition.actual_price_usd ?? acquisition.actual_price ?? approval?.spend?.approved_amount ?? 0);
      if (!date || !amount || !(status.includes("complete") || status.includes("completed"))) return null;
      return {
        date,
        amount_usd: amount,
        candidate_id: approval?.candidate_id || approval?.candidate_ref || "",
      };
    })
    .filter(Boolean);
}

function flow007RejectedOutcomes() {
  return Array.from(flow007ValidationByCandidateId().values())
    .filter((validation) => validation?.result?.status === "NOT_BUILD_READY" || validation?.build_readiness?.status === "NOT_BUILD_READY")
    .map((validation) => ({
      candidateId: validation.candidate_id,
      date: String(validation.validated_at || currentBerlinDate()).slice(0, 10),
      status: "rejected",
    }));
}

function excludedRejectedOutcomes() {
  return productLaneExclusions()
    .filter((lane) => lane.status === "excluded_by_human_rejection")
    .flatMap((lane) =>
      (lane.source_candidate_refs || []).map((candidateId) => ({
        candidateId,
        date: String(lane.source_refs?.[0] || "").includes("LR-C-001-001") ? "2026-06-22" : currentBerlinDate(),
        status: "rejected",
      })),
    );
}

function launchPackageOutcomes() {
  const rejectedIds = new Set([
    ...flow007RejectedOutcomes().map((entry) => entry.candidateId),
    ...excludedRejectedOutcomes().map((entry) => entry.candidateId),
  ]);

  return readYamlFiles("records/validation")
    .map((entry) => {
      const launch = entry.doc?.launch_package;
      if (!launch?.candidate_id || rejectedIds.has(launch.candidate_id)) return null;
      const statusText = String(launch.publish_status || launch.status || launch.result || "").toLowerCase();
      const date = String(launch.launch_date || "").slice(0, 10);
      if (!date) return null;
      const published =
        statusText === "published" ||
        statusText.includes("marketplace_publish_complete") ||
        (launch.listing_url && launch.external_publish_approval?.decision === "approved");
      const ready =
        !published &&
        (statusText.includes("ready_for_marketplace_publish") ||
          statusText.includes("pass_pending_marketplace_publish")) &&
        launch.publish_blockers?.status === "pass" &&
        launch.prepublish_validation?.publish_blockers_absent === true;
      if (!published && !ready) return null;
      return {
        candidateId: launch.candidate_id,
        date,
        status: published ? "launched" : "ready",
      };
    })
    .filter(Boolean);
}

function currentProductOutcomes() {
  const byCandidate = new Map();
  for (const outcome of [...launchPackageOutcomes(), ...excludedRejectedOutcomes(), ...flow007RejectedOutcomes()]) {
    const existing = byCandidate.get(outcome.candidateId);
    if (!existing || String(outcome.date).localeCompare(String(existing.date)) >= 0) {
      byCandidate.set(outcome.candidateId, outcome);
    }
  }
  return Array.from(byCandidate.values());
}

function periodState() {
  const today = currentBerlinDate();
  const allEntries = ledgerEntries();
  const allCosts = costBreakdown(allEntries);
  const competitorSpend = competitorPurchaseSpendEntries();
  const productOutcomes = currentProductOutcomes();
  const dates = Array.from(new Set([
    ...allEntries.map(ledgerEntryDate).filter(Boolean),
    ...competitorSpend.map((entry) => entry.date).filter(Boolean),
    ...productOutcomes.map((entry) => entry.date).filter(Boolean),
    today,
  ])).sort();
  const totalCompetitorSpend = sumLedger(competitorSpend.map((entry) => ({ amount_usd: entry.amount_usd })));
  const totalSpendUsd = Number((allCosts.totalApiCostUsd + totalCompetitorSpend).toFixed(2));

  return {
    from: dates[0] || today,
    to: dates[dates.length - 1] || today,
    dataMode: "event-log",
    flowVersion: activeFlowId,
    totals: {
      launchedCount: productOutcomes.filter((entry) => entry.status === "launched").length,
      readyForLaunchCount: productOutcomes.filter((entry) => entry.status === "ready").length,
      rejectedCount: productOutcomes.filter((entry) => entry.status === "rejected").length,
      totalSpendUsd,
      buildSpendUsd: allCosts.productApiCostUsd,
      governanceApiCostUsd: allCosts.governanceApiCostUsd,
      otherSpendUsd: Number((allCosts.unallocatedApiCostUsd + totalCompetitorSpend).toFixed(2)),
    },
    buckets: dates.map((date) => {
      const dateEntries = allEntries.filter((entry) => ledgerEntryDate(entry) === date);
      const dateCosts = costBreakdown(dateEntries);
      const dateCompetitorSpend = sumLedger(
        competitorSpend
          .filter((entry) => entry.date === date)
          .map((entry) => ({ amount_usd: entry.amount_usd })),
      );
      const dateOutcomes = productOutcomes.filter((entry) => entry.date === date);
      const dateTotalSpend = Number((dateCosts.totalApiCostUsd + dateCompetitorSpend).toFixed(2));
      return {
        date,
        launchedCount: dateOutcomes.filter((entry) => entry.status === "launched").length,
        readyForLaunchCount: dateOutcomes.filter((entry) => entry.status === "ready").length,
        rejectedCount: dateOutcomes.filter((entry) => entry.status === "rejected").length,
        totalSpendUsd: dateTotalSpend,
        buildSpendUsd: dateCosts.productApiCostUsd,
        governanceApiCostUsd: dateCosts.governanceApiCostUsd,
        otherSpendUsd: Number((dateCosts.unallocatedApiCostUsd + dateCompetitorSpend).toFixed(2)),
      };
    }),
  };
}

function buildDashboardState() {
  const rawCandidates = activeFlowCandidates();
  const candidates = rawCandidates.map(publicCandidateSnapshot);
  const byStatus = (status) => candidates.filter((candidate) => candidate.outcomeStatus === status);
  const contractEscalation = contractChangeEscalation(rawCandidates);
  const humanEscalation = humanEscalationDashboardState(latestHumanEscalationForDashboard(rawCandidates), rawCandidates);
  const purchaseEscalation = activePurchaseEscalation(rawCandidates);
  const activeEscalation = contractEscalation || humanEscalation || purchaseEscalation || {
    status: "none",
    scope: "build",
    candidateId: "",
    candidateLabel: "",
    candidateTitle: "",
    reason: "",
    recommendedAction: "",
    governanceFile: activeDispatchRef,
  };

  return {
    today: {
      asOf: nowBerlin(),
      dataMode: "event-log",
      flowVersion: activeFlowId,
      flowTimeline: stageTimeline,
      sourceRefs: {
        activeFlow: "config/active-flow.yaml",
        candidateRecords: "records/candidates/*.yaml",
        validationRecords: "records/validation/*.yaml",
        flow007ValidationRecords: "records/flow_007_validation/*.yaml",
        failureCases: "records/failure-cases/*.md",
      },
      todayLog: todayLogEntries(),
      totals: bucketTotals(candidates),
      pipelineCandidates: byStatus("pipeline"),
      inFlightCandidates: byStatus("in_flight"),
      launchedCandidates: byStatus("launched"),
      rejectedCandidates: byStatus("rejected_before_launch"),
      activeEscalation,
    },
    period: periodState(),
  };
}

const dashboardState = buildDashboardState();
const outPath = path.join(repoRoot, "records", "dashboard_state.yaml");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, YAML.stringify(dashboardState, { lineWidth: 0 }), "utf8");
process.stdout.write(`Updated ${path.relative(repoRoot, outPath)}\n`);
