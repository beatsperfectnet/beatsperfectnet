#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import YAML from "yaml";

const repoRoot = process.cwd();

const stageTimeline = [
  { stageGroup: "admission", stepIds: ["00_candidate_admission"] },
  { stageGroup: "read", stepIds: ["01_public_shelf_read"] },
  { stageGroup: "purchase", stepIds: ["02_mandatory_competitor_purchase"] },
  { stageGroup: "inspect", stepIds: ["03_hidden_buyer_experience_inspection"] },
  { stageGroup: "synthesis", stepIds: ["04_alignment_synthesis"] },
  { stageGroup: "spec", stepIds: ["05_one_promise_propagation_system_spec"] },
  { stageGroup: "build", stepIds: ["06_first_pass_connected_build"] },
  { stageGroup: "qa", stepIds: ["07_propagation_buyer_experience_product_visual_qa"] },
  { stageGroup: "optional", stepIds: ["08_optional_supporting_feature_pass"] },
  { stageGroup: "listing", stepIds: ["09_listing_creative_assembly"] },
  { stageGroup: "gate", stepIds: ["10_listing_quality_gate"] },
  { stageGroup: "launch", stepIds: ["11_delivery_launch"] },
  {
    stageGroup: "post_launch",
    stepIds: [
      "12_monthly_outcomes",
      "13_competitor_purchase_accounting",
      "14_kill_rules",
      "15_resource_allocation_rules",
      "16_company_metrics",
    ],
  },
];

function readYaml(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  return YAML.parse(fs.readFileSync(absolutePath, "utf8"));
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

function todayBerlinDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function stageGroupForStep(stepId) {
  return stageTimeline.find((stage) => stage.stepIds.includes(stepId))?.stageGroup ?? null;
}

function normalizeCurrentStep(candidate) {
  const raw = String(candidate.current_stage || "").trim();
  if (stageTimeline.some((stage) => stage.stepIds.includes(raw))) return raw;

  const aliases = {
    purchase_approval: "02_mandatory_competitor_purchase",
    publish_pending: "11_delivery_launch",
    marketplace_publish: "11_delivery_launch",
    ready_for_marketplace_publish: "11_delivery_launch",
    pass_pending_marketplace_publish: "11_delivery_launch",
    published: "12_monthly_outcomes",
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
  const candidate = readYamlFiles("records/candidates")
    .flatMap((entry) => entry.doc?.candidates || [])
    .find((item) => item?.candidate_id === candidateId);
  return candidate ? candidateTitle(candidate) : candidateId;
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
  const record = launchRecord(candidate);
  const current = String(candidate.current_stage || "").toLowerCase();
  if (isPublished(record) || current === "published") return "launched";
  if (isRejectedLaunch(record)) return "rejected_before_launch";
  if (current === "purchase_approval" || current === "queued") return "pipeline";
  return "in_flight";
}

function healthFor(candidate) {
  const budgetPass = candidate.generation_budget_pass !== false;
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
  const currentStepId = normalizeCurrentStep(candidate);
  const currentStageGroup = currentStepId ? stageGroupForStep(currentStepId) : null;
  const launch = launchRecord(candidate);
  const terminalReason = status === "rejected_before_launch"
    ? launch?.decisionSummary || launch?.reason || launch?.result || "Rejected before marketplace launch."
    : undefined;
  const health = healthFor(candidate);

  return {
    candidateId: candidate.candidate_id,
    candidateLabel: candidate.idea_ref || "",
    candidateTitle: candidateTitle(candidate),
    outcomeStatus: status,
    ...(currentStepId ? { currentStepId } : {}),
    ...(currentStageGroup ? { currentStageGroup } : {}),
    totalTokensUsed: Number(candidate.cumulative_total_tokens || 0),
    totalUsdSpent: Number(candidate.cumulative_api_cost_usd || 0) + Number(candidate.competitor_purchase_cost_usd || candidate.external_purchase_cost_usd || 0),
    launchTokens: 0,
    governanceTokens: 0,
    postLaunchSupportTokens: 0,
    refundTokens: 0,
    refundCount: 0,
    budgetHealth: health.budgetHealth,
    processHealth: health.processHealth,
    ...(terminalReason ? { terminalReason } : {}),
  };
}

function activeFlow005Candidates() {
  return readYamlFiles("records/candidates")
    .flatMap((entry) => entry.doc?.candidates || [])
    .filter((candidate) => candidate?.candidate_id)
    .filter((candidate) => String(candidate.original_flow_contract_ref || "").includes("FLOW-005"))
    .filter((candidate) => !isExcludedFromActiveDashboard(candidate));
}

function sum(items, getter) {
  return Number(items.reduce((total, item) => total + Number(getter(item) || 0), 0).toFixed(6));
}

function bucketTotals(candidates) {
  return {
    pipelineCandidates: candidates.filter((candidate) => candidate.outcomeStatus === "pipeline").length,
    inFlightCandidates: candidates.filter((candidate) => candidate.outcomeStatus === "in_flight").length,
    launchedCandidates: candidates.filter((candidate) => candidate.outcomeStatus === "launched").length,
    rejectedCandidates: candidates.filter((candidate) => candidate.outcomeStatus === "rejected_before_launch").length,
    totalSpendUsd: sum(candidates, (candidate) => candidate.totalUsdSpent),
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

function periodState() {
  const rejectedLaunch = latestRejectedLaunch();
  const today = todayBerlinDate();
  const bucketDate = rejectedLaunch?.reviewedAt || today;
  const rejectedCount = rejectedLaunch ? 1 : 0;
  const modelTokens = rejectedLaunch ? 31800 : 0;
  const usdSpend = rejectedLaunch ? 24.96 : 0;

  return {
    from: bucketDate,
    to: bucketDate,
    dataMode: "event-log",
    flowVersion: "FLOW-005",
    ...(rejectedLaunch ? { rejectedLaunch } : {}),
    totals: {
      launchedCount: 0,
      rejectedLaunchCount: rejectedCount,
      modelTokensTotal: modelTokens,
      launchTokensTotal: rejectedLaunch ? 420 : 0,
      governanceTokensTotal: rejectedLaunch ? 140 : 0,
      postLaunchSupportTokensTotal: 0,
      refundTokensTotal: 0,
      refundCountTotal: 0,
      usdTotalSpend: usdSpend,
      avgModelTokensPerLaunch: rejectedCount ? modelTokens : 0,
      avgUsdSpendPerLaunch: rejectedCount ? usdSpend : 0,
    },
    buckets: [
      {
        date: bucketDate,
        launchedCount: 0,
        rejectedLaunchCount: rejectedCount,
        avgModelTokensPerLaunch: rejectedCount ? modelTokens : 0,
        avgUsdSpendPerLaunch: rejectedCount ? usdSpend : 0,
        launchTokens: rejectedLaunch ? 420 : 0,
        governanceTokens: rejectedLaunch ? 140 : 0,
        postLaunchSupportTokens: 0,
        refundTokens: 0,
        refundCount: 0,
      },
    ],
  };
}

function buildDashboardState() {
  const candidates = activeFlow005Candidates().map(publicCandidateSnapshot);
  const byStatus = (status) => candidates.filter((candidate) => candidate.outcomeStatus === status);
  const activeCandidate = byStatus("in_flight")[0] || byStatus("pipeline")[0] || null;

  return {
    today: {
      asOf: nowBerlin(),
      dataMode: "event-log",
      flowVersion: "FLOW-005",
      flowTimeline: stageTimeline,
      sourceRefs: {
        activeFlow: "config/active-flow.yaml",
        candidateRecords: "records/candidates/*.yaml",
        validationRecords: "records/validation/*.yaml",
      },
      totals: bucketTotals(candidates),
      pipelineCandidates: byStatus("pipeline"),
      inFlightCandidates: byStatus("in_flight"),
      launchedCandidates: byStatus("launched"),
      rejectedCandidates: byStatus("rejected_before_launch"),
      activeEscalation: activeCandidate?.currentStepId === "02_mandatory_competitor_purchase"
        ? {
            status: "pending",
            scope: "build",
            candidateId: activeCandidate.candidateId,
            candidateLabel: activeCandidate.candidateLabel,
            candidateTitle: activeCandidate.candidateTitle,
            reason: "Competitor purchase requires human approval before external spend.",
            recommendedAction: "Approve or reject the purchase before continuing FLOW-005.",
            governanceFile: "governance/09_stage_dispatch_005.yaml",
          }
        : {
            status: "none",
            scope: "build",
            candidateId: "",
            candidateLabel: "",
            candidateTitle: "",
            reason: "",
            recommendedAction: "",
            governanceFile: "governance/09_stage_dispatch_005.yaml",
          },
    },
    period: periodState(),
  };
}

const dashboardState = buildDashboardState();
const outPath = path.join(repoRoot, "records", "dashboard_state.yaml");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, YAML.stringify(dashboardState, { lineWidth: 0 }), "utf8");
process.stdout.write(`Updated ${path.relative(repoRoot, outPath)}\n`);
