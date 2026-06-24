#!/usr/bin/env node

import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const {
  r: startCodexConversationThread,
  h: setCodexConversationModel,
} = require('/opt/homebrew/lib/node_modules/openclaw/dist/conversation-binding-DhxO7Wl0.js');
const {
  o: readCodexAppServerBinding,
} = require('/opt/homebrew/lib/node_modules/openclaw/dist/session-binding-4NA-iGh7.js');

function parseArgs(argv) {
  const out = {
    dryRun: false,
    includePublish: false,
    stopAt: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      out.dryRun = true;
      continue;
    }
    if (arg === '--include-publish') {
      out.includePublish = true;
      continue;
    }
    if (arg === '--run-id') {
      out.runId = argv[++i];
      continue;
    }
    if (arg === '--build-manifest') {
      out.buildManifest = argv[++i];
      continue;
    }
  if (arg === '--workflow') {
      out.workflow = argv[++i];
      continue;
    }
    if (arg === '--dispatch-contract') {
      out.dispatchContract = argv[++i];
      continue;
    }
    if (arg === '--workspace') {
      out.workspace = argv[++i];
      continue;
    }
    if (arg === '--stop-at') {
      out.stopAt = argv[++i];
      continue;
    }
    if (arg === '--session-root') {
      out.sessionRoot = argv[++i];
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      out.help = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return out;
}

function printHelp() {
  process.stdout.write([
    'Usage: node runtime/model-stage-launcher.mjs --run-id R-004 [options]',
    '',
    'Options:',
    '  --build-manifest <path>  Build manifest to launch from (required)',
    '  --workflow <path>        Workflow contract to use',
    '  --dispatch-contract <path> Stage dispatch contract to use',
    '  --workspace <path>       Workspace directory for OpenClaw sessions',
    '  --session-root <path>     Root directory for session binding files',
    '  --stop-at <step_id>      Stop after the named step',
    '  --include-publish        Include the human publish gate stage',
    '  --dry-run                Read and plan only, do not start sessions',
  ].join('\n'));
  process.stdout.write('\n');
}

function rubyLoadYaml(filePath) {
  const ruby = String.raw`
require 'yaml'
require 'json'
data = YAML.load_file(ARGV[0])
puts JSON.generate(data)
`;
  const result = spawnSync('ruby', ['-e', ruby, filePath], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });
  if (result.status !== 0) {
    throw new Error(
      `Failed to load YAML from ${filePath}: ${result.stderr || result.stdout || 'unknown error'}`
    );
  }
  return JSON.parse(result.stdout);
}

function rubyDumpYaml(value) {
  const ruby = String.raw`
require 'yaml'
require 'json'
data = JSON.parse(STDIN.read)
puts YAML.dump(data)
`;
  const result = spawnSync('ruby', ['-e', ruby], {
    input: JSON.stringify(value),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });
  if (result.status !== 0) {
    throw new Error(`Failed to dump YAML: ${result.stderr || result.stdout || 'unknown error'}`);
  }
  return result.stdout;
}

function repoRootFromScript() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
}

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

function resolveExistingAssetPath(assetPath, buildRoot, repoRoot) {
  if (!assetPath) return null;

  const candidates = [];
  if (path.isAbsolute(assetPath)) {
    candidates.push(assetPath);
  } else {
    candidates.push(path.resolve(buildRoot, assetPath));
    candidates.push(path.resolve(repoRoot, assetPath));
  }

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function buildAssetReport({ manifest, buildRoot, repoRoot, dryRun }) {
  const report = {
    verified: [],
    missing: [],
  };

  const groupedKeys = [
    'listing_assets',
    'product_assets',
    'delivery_assets',
    'internal_process_artifacts',
  ];

  for (const groupKey of groupedKeys) {
    const assets = Array.isArray(manifest?.[groupKey]) ? manifest[groupKey] : [];
    for (const asset of assets) {
      const assetPath = typeof asset === 'string' ? asset : asset?.path;
      const resolvedPath = resolveExistingAssetPath(assetPath, buildRoot, repoRoot);
      if (resolvedPath) {
        report.verified.push({
          group: groupKey,
          path: assetPath,
          resolvedPath: path.relative(repoRoot, resolvedPath),
          role: asset?.role || null,
        });
      } else {
        report.missing.push({
          group: groupKey,
          path: assetPath || null,
          role: asset?.role || null,
          reason: 'asset listed in manifest was not found under build root or repo root',
        });
      }
    }
  }

  return report;
}

function effectiveSocketPathForCodexHome(codexHome) {
  return path.join(codexHome, 'app-server-control', 'app-server-control.sock');
}

function ensureShortCodexHome() {
  const originalHome = process.env.CODEX_HOME?.trim();
  if (!originalHome || !existsSync(originalHome)) return null;

  const resolvedOriginalHome = realpathSync(originalHome);
  const originalSocketPath = effectiveSocketPathForCodexHome(resolvedOriginalHome);
  if (originalSocketPath.length < 100) return null;

  const shortHome = process.env.BEATSPERFECT_CODEX_HOME?.trim() || '/tmp/beatsperfect-codex-home';
  ensureDir(shortHome);
  const rsync = spawnSync('rsync', [
    '-a',
    '--exclude',
    'app-server-control',
    '--exclude',
    'app-server-daemon',
    `${resolvedOriginalHome}/`,
    `${shortHome}/`,
  ], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });
  if (rsync.status !== 0) {
    throw new Error(
      `Failed to prepare short CODEX_HOME at ${shortHome}: ${rsync.stderr || rsync.stdout || 'unknown error'}`
    );
  }
  process.env.CODEX_HOME = shortHome;
  return {
    originalHome: resolvedOriginalHome,
    shortHome: realpathSync(shortHome),
    originalSocketPath,
    shortSocketPath: effectiveSocketPathForCodexHome(realpathSync(shortHome)),
  };
}

function rootEntry(doc, expectedKey, filePath) {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    throw new Error(`Expected ${filePath} to contain a single YAML mapping`);
  }
  if (!(expectedKey in doc)) {
    throw new Error(`Expected ${filePath} to have top-level key ${expectedKey}`);
  }
  return doc[expectedKey];
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256Hex(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function stageNameFromId(stepId) {
  return String(stepId)
    .replace(/^\d+_/, '')
    .replace(/_/g, ' ');
}

function stageDomainKey(stepId) {
  const mapping = {
    '09_select_competitor_for_purchase': 'competitor_selection_for_purchase',
    '11_purchased_competitor_inspection': 'purchased_competitor_inspection',
    '12_listing_spec': 'listing_spec',
    '13_product_spec': 'product_spec',
    '14_delivery_spec': 'delivery_spec',
    '15_create_good_enough_for_humans_spec': 'good_enough_for_humans',
    '20_quality_qa': 'quality_qa',
  };
  return mapping[stepId] || null;
}

function stageRequiresCandidateBrief(stepId) {
  return new Set([
    '09_select_competitor_for_purchase',
    '11_purchased_competitor_inspection',
    '12_listing_spec',
    '13_product_spec',
    '14_delivery_spec',
    '15_create_good_enough_for_humans_spec',
    '20_quality_qa',
    '22_launch_review',
  ]).has(stepId);
}

function stageUsesExecutionContext(stepId) {
  return new Set([
    '06_listing_analysis',
    '07_product_analysis',
    '08_create_candidate_domain_brief',
    '09_select_competitor_for_purchase',
    '11_purchased_competitor_inspection',
    '12_listing_spec',
    '13_product_spec',
    '14_delivery_spec',
    '15_create_good_enough_for_humans_spec',
    '20_quality_qa',
    '22_launch_review',
  ]).has(stepId);
}

function stageSuccessCondition(stepId, stage) {
  const custom = {
    '06_listing_analysis': 'Primary buyer JTBD and promise are extracted from observable marketplace evidence.',
    '07_product_analysis': 'Observable product scope, complaints, and eligible purchased references are extracted without generating a product.',
    '08_create_candidate_domain_brief': 'Exactly one primary buyer JTBD and one primary product type are captured with bounded domain considerations.',
    '09_select_competitor_for_purchase': 'The highest-match competitor is selected within the locked domain brief and governance constraints.',
    '11_purchased_competitor_inspection': 'Inspection-derived requirements and not_testable findings are captured without reinterpreting the domain brief.',
    '12_listing_spec': 'Listing terminology and promise stay faithful to evidence and locked domain brief considerations.',
    '13_product_spec': 'Product requirements resolve correctness risks without expanding scope beyond locked evidence.',
    '14_delivery_spec': 'Delivery guidance prevents predictable buyer errors and stays within support boundaries.',
    '15_create_good_enough_for_humans_spec': 'Applicable domain considerations are translated into measurable acceptance tests or explicit exclusions.',
    '20_quality_qa': 'All domain-derived checks pass, fail specific locked requirements, or escalate a real scope conflict.',
    '22_launch_review': 'Launch readiness is confirmed against locked specs, inspection traceability, and domain QA.',
  };
  return custom[stepId] || stage?.rule?.join(' | ') || stage?.action?.join(' | ') || stepId;
}

function prohibitedInferenceList() {
  return [
    'No new buyer workflow',
    'No new product category',
    'No new integration',
    'No new external data source',
    'No new selling claim',
    'No scope expansion from intuition',
    'No access to purchased competitor private files',
    'No override of governance',
  ];
}

function collectGovernanceRefs() {
  return [
    'governance/01_objective.yaml',
    'governance/02_constraints.yaml',
    'governance/03_admission_rules.yaml',
    'governance/04_kill_rules.yaml',
    'governance/05_governance_rules.yaml',
    'governance/06_resource_allocation.yaml',
    'governance/07_capacity_model.yaml',
    'governance/08_product_generation_budget_005.yaml',
    'governance/09_stage_dispatch_005.yaml',
  ];
}

function loadContract(repoRoot, relativePath, rootKey) {
  const filePath = path.resolve(repoRoot, relativePath);
  const doc = rubyLoadYaml(filePath);
  return rootEntry(doc, rootKey, filePath);
}

function loadModelPolicy(repoRoot) {
  return loadContract(repoRoot, 'specs/MODEL-005.yaml', 'MODEL-005');
}

function loadPricingSnapshot(repoRoot) {
  return loadContract(repoRoot, 'specs/PRICING-004.yaml', 'PRICING-004');
}

function loadGenerationBudget(repoRoot) {
  return loadContract(repoRoot, 'governance/08_product_generation_budget_005.yaml', 'product_generation_budget');
}

function getStagePolicy(modelPolicy, stage) {
  if (!modelPolicy || !stage?.model_policy_ref) return null;
  const key = String(stage.model_policy_ref).split('.').slice(1).join('.');
  return modelPolicy[key] || null;
}

function canonicalRequestedModelId(stage, stagePolicy) {
  return String(stage?.dispatch?.requested_model_id || stage?.dispatch?.requested_model || stagePolicy?.default_model || '').trim();
}

function resolveRuntimeModelId(pricingSnapshot, requestedModelId) {
  const modelId = String(requestedModelId || '').trim();
  if (!modelId) return null;
  if (modelId.toLowerCase() === 'human') return 'human';
  const catalog = pricingSnapshot?.model_catalog || {};
  for (const entry of Object.values(catalog)) {
    if (!entry || typeof entry !== 'object') continue;
    if (String(entry.model_id || '').toLowerCase() === modelId.toLowerCase()) {
      return String(entry.runtime_model_id || entry.model_id).toLowerCase();
    }
    if (String(entry.runtime_model_id || '').toLowerCase() === modelId.toLowerCase()) {
      return String(entry.runtime_model_id).toLowerCase();
    }
  }
  return null;
}

function normalizeObservedModelId(modelId, pricingSnapshot) {
  const observed = String(modelId || '').trim();
  if (!observed) return 'none';
  if (observed.toLowerCase() === 'human') return 'human';
  if (observed.toLowerCase().startsWith('openai/')) return observed.toLowerCase();
  const runtimeModelId = resolveRuntimeModelId(pricingSnapshot, observed);
  return runtimeModelId || observed.toLowerCase();
}

function estimateTokenCountFromContext(stageExecutionContext) {
  if (!stageExecutionContext) return 0;
  const serialized = stableStringify(stageExecutionContext);
  return Math.max(1, Math.ceil(Buffer.byteLength(serialized, 'utf8') / 4));
}

function getStagePricingSnapshot(pricingSnapshot, runtimeModelId) {
  if (!runtimeModelId) return null;
  const modelId = runtimeModelId.replace(/^openai\//i, '');
  return pricingSnapshot?.pricing_snapshot?.[modelId] || null;
}

function calculateStageCostUsd(pricingSnapshot, runtimeModelId, inputTokens, cachedInputTokens, outputTokens) {
  const pricing = getStagePricingSnapshot(pricingSnapshot, runtimeModelId);
  if (!pricing) return null;
  const uncachedInputTokens = Math.max(0, Number(inputTokens || 0) - Number(cachedInputTokens || 0));
  const cachedTokens = Math.max(0, Number(cachedInputTokens || 0));
  const output = Math.max(0, Number(outputTokens || 0));
  const inputCost = (uncachedInputTokens * Number(pricing.input || 0)) / 1_000_000;
  const cachedInputCost = (cachedTokens * Number(pricing.cached_input || 0)) / 1_000_000;
  const outputCost = (output * Number(pricing.output || 0)) / 1_000_000;
  return Number((inputCost + cachedInputCost + outputCost).toFixed(6));
}

function stageOutputBudgetLimit(stagePolicy, stageId) {
  if (Number.isFinite(Number(stagePolicy?.default_max_output_tokens))) {
    return Number(stagePolicy.default_max_output_tokens);
  }
  const stageNumber = Number(String(stageId).split('_')[0]);
  if (!Number.isFinite(stageNumber)) return 0;
  if (stageNumber <= 5) return 8000;
  if (stageNumber <= 10) return 16000;
  if (stageNumber <= 15) return 24000;
  if (stageNumber === 16) return 32000;
  if (stageNumber <= 19) return 16000;
  if (stageNumber <= 22) return 24000;
  return 8000;
}

function stageUsesBudget(stageId) {
  return String(stageId) !== '10_human_purchase_approval_and_acquisition';
}

function stageBeforeInitialQa(stageId) {
  return String(stageId) !== '20_quality_qa'
    && Number(String(stageId).split('_')[0]) < 20;
}

function budgetPreflight({
  budgetContract,
  pricingSnapshot,
  candidateRef,
  stepId,
  requestedModelId,
  inputTokens,
  maximumOutputTokens,
  estimatedPaidToolCostUsd,
  cumulativeActualCostUsd,
  protectedFutureReserveUsd,
}) {
  const generationBudgetUsd = Number(budgetContract?.generation_budget_usd || budgetContract?.total_hard_budget_usd || 0);
  const runtimeModelId = resolveRuntimeModelId(pricingSnapshot, requestedModelId);
  if (!Number.isFinite(generationBudgetUsd) || generationBudgetUsd <= 0) {
    return {
      candidate_ref: candidateRef || null,
      step_id: stepId,
      requested_model_id: requestedModelId || null,
      input_tokens: Number(inputTokens || 0),
      maximum_output_tokens: Number(maximumOutputTokens || 0),
      estimated_paid_tool_cost_usd: Number(estimatedPaidToolCostUsd || 0),
      projected_stage_maximum_usd: null,
      cumulative_actual_cost_usd: Number(cumulativeActualCostUsd || 0),
      protected_future_reserve_usd: Number(protectedFutureReserveUsd || 0),
      projected_total_after_stage_usd: null,
      allowed: false,
      denial_reason: 'missing_generation_budget',
    };
  }
  if (!runtimeModelId) {
    return {
      candidate_ref: candidateRef || null,
      step_id: stepId,
      requested_model_id: requestedModelId || null,
      input_tokens: Number(inputTokens || 0),
      maximum_output_tokens: Number(maximumOutputTokens || 0),
      estimated_paid_tool_cost_usd: Number(estimatedPaidToolCostUsd || 0),
      projected_stage_maximum_usd: null,
      cumulative_actual_cost_usd: Number(cumulativeActualCostUsd || 0),
      protected_future_reserve_usd: Number(protectedFutureReserveUsd || 0),
      projected_total_after_stage_usd: null,
      allowed: false,
      denial_reason: 'unknown_requested_model',
    };
  }
  const projectedStageMaximumUsd = calculateStageCostUsd(
    pricingSnapshot,
    runtimeModelId,
    inputTokens,
    0,
    maximumOutputTokens
  );
  const projectedTotalAfterStageUsd = Number((Number(cumulativeActualCostUsd || 0)
    + Number(projectedStageMaximumUsd || 0)
    + Number(estimatedPaidToolCostUsd || 0)).toFixed(6));
  const allowed = projectedTotalAfterStageUsd <= (generationBudgetUsd - Number(protectedFutureReserveUsd || 0));
  return {
    candidate_ref: candidateRef || null,
    step_id: stepId,
    requested_model_id: requestedModelId || null,
    input_tokens: Number(inputTokens || 0),
    maximum_output_tokens: Number(maximumOutputTokens || 0),
    estimated_paid_tool_cost_usd: Number(estimatedPaidToolCostUsd || 0),
    projected_stage_maximum_usd: projectedStageMaximumUsd,
    cumulative_actual_cost_usd: Number(cumulativeActualCostUsd || 0),
    protected_future_reserve_usd: Number(protectedFutureReserveUsd || 0),
    projected_total_after_stage_usd: projectedTotalAfterStageUsd,
    allowed,
    denial_reason: allowed ? '' : 'projected_total_exceeds_generation_budget_or_protected_reserve',
  };
}

function updateCandidateLedger(candidateQueueRecord, updates) {
  if (!candidateQueueRecord?.filePath) return null;
  const doc = rubyLoadYaml(candidateQueueRecord.filePath);
  const root = rootEntry(doc, 'candidate_run', candidateQueueRecord.filePath);
  const candidate = root.candidates?.find((entry) => entry?.candidate_id === candidateQueueRecord.candidate?.candidate_id);
  if (!candidate) return null;
  Object.assign(candidate, updates);
  writeFileSync(candidateQueueRecord.filePath, rubyDumpYaml(doc), 'utf8');
  return candidate;
}

function findCandidateQueueRecord(repoRoot, candidateRef) {
  const candidatesDir = path.join(repoRoot, 'records', 'candidates');
  if (!existsSync(candidatesDir)) {
    return null;
  }

  for (const entry of readdirSync(candidatesDir).sort()) {
    if (!entry.endsWith('.yaml')) continue;
    const filePath = path.join(candidatesDir, entry);
    const doc = rubyLoadYaml(filePath);
    const root = rootEntry(doc, 'candidate_run', filePath);
    for (const candidate of Array.isArray(root.candidates) ? root.candidates : []) {
      if (candidate?.candidate_id === candidateRef || candidate?.candidate_ref === candidateRef) {
        return {
          filePath,
          candidate,
          run: root,
        };
      }
    }
  }

  return null;
}

function loadCandidateDomainBrief(repoRoot, candidateRef, buildManifestCandidateBriefRef) {
  const candidateQueueRecord = findCandidateQueueRecord(repoRoot, candidateRef);
  const candidate = candidateQueueRecord?.candidate || null;
  const candidateDomainBriefRef = buildManifestCandidateBriefRef
    || candidate?.candidate_domain_brief_ref
    || null;
  if (!candidateDomainBriefRef) {
    return {
      candidateQueueRecord,
      candidate,
      candidateDomainBriefRef: null,
      candidateDomainBrief: null,
    };
  }

  const briefPath = path.isAbsolute(candidateDomainBriefRef)
    ? candidateDomainBriefRef
    : path.resolve(repoRoot, candidateDomainBriefRef);
  if (!existsSync(briefPath)) {
    return {
      candidateQueueRecord,
      candidate,
      candidateDomainBriefRef: path.relative(repoRoot, briefPath),
      candidateDomainBrief: null,
    };
  }

  const briefDoc = rubyLoadYaml(briefPath);
  const candidateDomainBrief = rootEntry(briefDoc, 'candidate_domain_brief', briefPath);
  return {
    candidateQueueRecord,
    candidate,
    candidateDomainBriefRef: path.relative(repoRoot, briefPath),
    candidateDomainBrief,
  };
}

function getApplicableDomainConsiderationIds(candidateDomainBrief, stageId) {
  const stageKey = stageDomainKey(stageId);
  if (!stageKey || !candidateDomainBrief?.domain_considerations) {
    return [];
  }

  const ids = [];
  for (const consideration of candidateDomainBrief.domain_considerations) {
    const applicableStages = Array.isArray(consideration?.applicable_stages)
      ? consideration.applicable_stages
      : [];
    if (applicableStages.includes(stageKey) && consideration?.consideration_id) {
      ids.push(String(consideration.consideration_id));
    }
  }
  return [...new Set(ids)];
}

function composeStageExecutionContext({
  stage,
  candidateRecord,
  candidateDomainBriefRef,
  candidateDomainBrief,
  applicableConsiderationIds,
  marketplaceAdapterRef,
}) {
  return {
    functional_mandate: stage.functional_mandate || null,
    candidate_domain_brief_ref: candidateDomainBriefRef || null,
    marketplace_adapter_ref: marketplaceAdapterRef || null,
    stage_rules: Array.isArray(stage.rule) ? stage.rule : [],
    authoritative_evidence_refs: {
      listing_analysis_ref: candidateRecord?.listing_analysis_ref
        || candidateDomainBrief?.authoritative_evidence_refs?.listing_analysis_ref
        || null,
      product_analysis_ref: candidateRecord?.product_analysis_ref
        || candidateDomainBrief?.authoritative_evidence_refs?.product_analysis_ref
        || null,
      governance_refs: collectGovernanceRefs(),
      external_authoritative_reference_refs: Array.isArray(candidateDomainBrief?.authoritative_evidence_refs?.external_authoritative_reference_refs)
        ? candidateDomainBrief.authoritative_evidence_refs.external_authoritative_reference_refs
        : [],
    },
    applicable_domain_consideration_ids: applicableConsiderationIds,
    prohibited_inferences: prohibitedInferenceList(),
    stage_success_condition: stageSuccessCondition(stage.step_id, stage),
  };
}

function stepNameFromId(stepId) {
  return String(stepId)
    .replace(/^\d+_/, '')
    .replace(/_/g, ' ');
}

function uniqueModels(stages) {
  return [...new Set(stages.map((stage) => stage.actualModelUsed).filter(Boolean))];
}

function sessionFileFor(root, runId, stepId, isChild) {
  const fileName = `${stepId}.binding.json`;
  if (isChild) {
    return path.join(root, runId, 'child', fileName);
  }
  if (stepId === 'main') {
    return path.join(root, runId, 'main.binding.json');
  }
  return path.join(root, runId, 'stage', fileName);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTokenCount(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : null;
}

function extractUsageFromRecord(record) {
  const usage = record?.message?.usage || record?.data?.usage || record?.usage || null;
  if (!usage || typeof usage !== 'object') return null;

  const promptTokens = normalizeTokenCount(
    usage.prompt_tokens ?? usage.input_tokens ?? usage.input
  );
  const completionTokens = normalizeTokenCount(
    usage.completion_tokens ?? usage.output_tokens ?? usage.output
  );
  const totalTokens = normalizeTokenCount(
    usage.total_tokens ?? usage.totalTokens ?? usage.total
  );

  if (promptTokens == null && completionTokens == null && totalTokens == null) {
    return null;
  }

  const resolvedPromptTokens = promptTokens ?? 0;
  const resolvedCompletionTokens = completionTokens ?? 0;
  const resolvedTotalTokens = totalTokens ?? resolvedPromptTokens + resolvedCompletionTokens;

  return {
    promptTokens: resolvedPromptTokens,
    completionTokens: resolvedCompletionTokens,
    totalTokens: resolvedTotalTokens,
  };
}

function aggregateSessionTokenUsageFromText(content) {
  const aggregate = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  };
  let sawUsage = false;

  for (const line of String(content || '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue;
    }

    const usage = extractUsageFromRecord(parsed);
    if (!usage) continue;

    sawUsage = true;
    aggregate.promptTokens += usage.promptTokens;
    aggregate.completionTokens += usage.completionTokens;
    aggregate.totalTokens += usage.totalTokens;
  }

  return sawUsage ? aggregate : null;
}

async function readSessionTokenUsage(sessionFile) {
  if (!sessionFile) return null;

  const candidateFiles = [sessionFile];
  if (sessionFile.endsWith('.jsonl')) {
    candidateFiles.push(sessionFile.replace(/\.jsonl$/, '.trajectory.jsonl'));
  }

  const deadline = Date.now() + 15000;
  let lastUsage = null;

  while (Date.now() <= deadline) {
    for (const candidateFile of candidateFiles) {
      if (!existsSync(candidateFile)) continue;

      const usage = aggregateSessionTokenUsageFromText(readFileSync(candidateFile, 'utf8'));
      if (usage) {
        return usage;
      }
      lastUsage = usage;
    }

    await sleep(250);
  }

  return lastUsage;
}

async function startStageSession({ sessionFile, workspaceDir, requestedModel }) {
  if (String(requestedModel || '').trim().toLowerCase() === 'human') {
    return { model: 'human', modelProvider: 'human-gate', threadId: 'human-gate' };
  }
  ensureDir(path.dirname(sessionFile));
  const existing = await readCodexAppServerBinding(sessionFile);
  if (!existing?.threadId) {
    await startCodexConversationThread({
      sessionFile,
      workspaceDir,
      model: requestedModel,
    });
    return readCodexAppServerBinding(sessionFile);
  }
  if (existing.model !== requestedModel) {
    await setCodexConversationModel({
      sessionFile,
      model: requestedModel,
    });
  }
  return readCodexAppServerBinding(sessionFile);
}

function stagePlan(flowStages, dispatchStageMap, stopAt, includePublish) {
  const dispatchById = new Map(Object.entries(dispatchStageMap || {}));
  const planned = [];
  const publishStageId = flowStages.find((stage) => /marketplace_publish$/.test(stage.step_id))?.step_id || null;
  for (const flowStage of flowStages) {
    if (!includePublish && flowStage.step_id === publishStageId) break;
    const dispatchStage = dispatchById.get(flowStage.step_id);
    if (!dispatchStage) continue;
    planned.push({
      ...flowStage,
      dispatch: dispatchStage,
    });
    if (flowStage.step_id === stopAt) break;
  }
  return planned;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  if (!args.runId) {
    throw new Error('Missing required argument: --run-id');
  }
  if (!args.buildManifest) {
    throw new Error('Missing required argument: --build-manifest');
  }
  const codexHomeRuntime = ensureShortCodexHome();

  const repoRoot = args.workspace ? path.resolve(args.workspace) : repoRootFromScript();
  const buildManifestPath = path.resolve(repoRoot, args.buildManifest);
  const workflowRef = args.workflow || 'workflows/FLOW-005.yaml';
  const dispatchContractRef = args.dispatchContract || 'governance/09_stage_dispatch_005.yaml';
  const workflowPath = path.resolve(repoRoot, workflowRef);
  const dispatchContractPath = path.resolve(repoRoot, dispatchContractRef);
  const runLedgerPath = path.resolve(repoRoot, `records/model_runs/${args.runId}.yaml`);
  const dispatchLogPath = path.resolve(repoRoot, `records/model_dispatches/${args.runId}.yaml`);
  const sessionRoot = path.resolve(repoRoot, args.sessionRoot || 'records/model_sessions');

  const buildManifestDoc = rubyLoadYaml(buildManifestPath);
  const workflowDoc = rubyLoadYaml(workflowPath);
  const dispatchDoc = rubyLoadYaml(dispatchContractPath);
  const flowVersion = /FLOW-005/.test(workflowRef) ? 'FLOW-005' : 'FLOW-004';
  const modelPolicyDoc = rubyLoadYaml(path.resolve(repoRoot, flowVersion === 'FLOW-005' ? 'specs/MODEL-005.yaml' : 'specs/MODEL-004.yaml'));
  const pricingSnapshotDoc = rubyLoadYaml(path.resolve(repoRoot, 'specs/PRICING-004.yaml'));
  const generationBudgetDoc = rubyLoadYaml(path.resolve(repoRoot, flowVersion === 'FLOW-005' ? 'governance/08_product_generation_budget_005.yaml' : 'governance/08_product_generation_budget_004.yaml'));
  const flowRootKey = Object.keys(workflowDoc).find((key) => /^FLOW-\d+$/.test(key));
  if (!flowRootKey) {
    throw new Error(`No FLOW-### root key found in ${workflowPath}`);
  }
  const flow = rootEntry(workflowDoc, flowRootKey, workflowPath);
  const modelPolicy = rootEntry(modelPolicyDoc, flowVersion === 'FLOW-005' ? 'MODEL-005' : 'MODEL-004', path.resolve(repoRoot, flowVersion === 'FLOW-005' ? 'specs/MODEL-005.yaml' : 'specs/MODEL-004.yaml'));
  const pricingSnapshot = rootEntry(pricingSnapshotDoc, 'PRICING-004', path.resolve(repoRoot, 'specs/PRICING-004.yaml'));
  const generationBudget = rootEntry(generationBudgetDoc, 'product_generation_budget', path.resolve(repoRoot, flowVersion === 'FLOW-005' ? 'governance/08_product_generation_budget_005.yaml' : 'governance/08_product_generation_budget_004.yaml'));
  const dispatch = rootEntry(dispatchDoc, 'stage_dispatch', dispatchContractPath);
  const manifest = rootEntry(buildManifestDoc, 'build_manifest', buildManifestPath);
  let candidateState = loadCandidateDomainBrief(
    repoRoot,
    manifest.candidate_ref,
    manifest.candidate_domain_brief_ref || null
  );
  const candidateCount = Math.max(1, candidateState?.candidateQueueRecord?.run?.candidates?.length || 1);
  let cumulativeGenerationCostUsd = 0;
  let sharedResearchActualCostUsd = 0;
  let sharedResearchAllocationUsd = 0;
  let sharedResearchAllocated = false;
  const assetReport = buildAssetReport({
    manifest,
    buildRoot: path.dirname(buildManifestPath),
    repoRoot,
    dryRun: args.dryRun,
  });
  const launchReviewStageId = flow.flow.find((stage) => /launch_review$/.test(stage.step_id))?.step_id || null;
  const stopAt = args.stopAt || (args.includePublish ? null : launchReviewStageId);

  const plannedStages = stagePlan(flow.flow, dispatch.stage_model_map, stopAt, args.includePublish);
  const initialRequestedModel = plannedStages[0]?.dispatch?.requested_model;
  if (!initialRequestedModel) {
    throw new Error('No dispatchable stages were found in the flow/contract pair.');
  }
  const exactModelMatchRequired = Boolean(dispatch.enforcement?.exact_model_match_required);

  const runLedger = {
    model_run_ledger: {
      run_id: args.runId,
      created_at: new Date().toISOString(),
      workflow_contract_ref: path.relative(repoRoot, workflowPath),
      dispatch_contract_ref: path.relative(repoRoot, dispatchContractPath),
      dispatch_log_ref: path.relative(repoRoot, dispatchLogPath),
      session_model_observed: 'pending',
      exact_model_match_required: exactModelMatchRequired,
      overall_exact_match: true,
      notes: [
        `Launcher: runtime/model-stage-launcher.mjs`,
        `Build manifest: ${path.relative(repoRoot, buildManifestPath)}`,
        ...(assetReport.missing.length
          ? [`Missing manifest assets: ${assetReport.missing.map((item) => `${item.group}:${item.path || '<missing path>'}`).join(', ')}`]
          : []),
        ...(codexHomeRuntime
          ? [`Codex app-server home mirrored to ${codexHomeRuntime.shortHome} because the original control socket path exceeds the macOS Unix socket length limit.`]
          : []),
      ],
      stages: [],
    },
  };

  const dispatchLog = {
    model_stage_dispatch: {
      run_id: args.runId,
      created_at: new Date().toISOString(),
      workflow_contract_ref: path.relative(repoRoot, workflowPath),
      contract_ref: path.relative(repoRoot, dispatchContractPath),
      exact_model_match_required: exactModelMatchRequired,
      overall_dispatch_match: true,
      notes: [
        `Launcher: runtime/model-stage-launcher.mjs`,
        `Build manifest: ${path.relative(repoRoot, buildManifestPath)}`,
        ...(assetReport.missing.length
          ? [`Missing manifest assets: ${assetReport.missing.map((item) => `${item.group}:${item.path || '<missing path>'}`).join(', ')}`]
          : []),
        ...(codexHomeRuntime
          ? [`Codex app-server home mirrored to ${codexHomeRuntime.shortHome} because the original control socket path exceeds the macOS Unix socket length limit.`]
          : []),
      ],
      stages: [],
    },
  };

  const mainSessionFile = sessionFileFor(sessionRoot, args.runId, 'main', false);
  let stageSessionFile = mainSessionFile;
  let stageResults = [];

  for (const stage of plannedStages) {
    candidateState = loadCandidateDomainBrief(
      repoRoot,
      manifest.candidate_ref,
      manifest.candidate_domain_brief_ref || null
    );
    const candidateRecord = candidateState.candidate;
    const candidateDomainBriefRef = candidateState.candidateDomainBriefRef;
    const candidateDomainBrief = candidateState.candidateDomainBrief;
    const stagePolicy = getStagePolicy(modelPolicy, stage) || {};
    const requestedModel = canonicalRequestedModelId(stage, stagePolicy);
    const requestedModelResolved = resolveRuntimeModelId(pricingSnapshot, requestedModel);
    const isChildSession = stage.dispatch.dispatch_action === 'spawn_child_session_with_model_override';
    const isHumanGate = String(stage.dispatch.dispatch_action || '').trim() === 'human_gate'
      || requestedModelResolved === 'human';
    stageSessionFile = isHumanGate ? null : sessionFileFor(sessionRoot, args.runId, stage.step_id, isChildSession);
    const stageUsesContextBlock = stageUsesExecutionContext(stage.step_id);
    const stageNeedsCandidateBrief = stageRequiresCandidateBrief(stage.step_id);
    const marketplaceAdapterRef = candidateDomainBrief?.marketplace_adapter_ref
      || candidateRecord?.marketplace
      || null;
    const applicableDomainConsiderationIds = stageUsesContextBlock
      ? getApplicableDomainConsiderationIds(candidateDomainBrief, stage.step_id)
      : [];
    const stageExecutionContext = stageUsesContextBlock
      ? composeStageExecutionContext({
          stage,
          candidateRecord,
          candidateDomainBriefRef,
          candidateDomainBrief,
          applicableConsiderationIds: applicableDomainConsiderationIds,
          marketplaceAdapterRef,
        })
      : null;
    const inputTokenEstimate = stageExecutionContext ? estimateTokenCountFromContext(stageExecutionContext) : 0;
    const maximumOutputTokens = stageOutputBudgetLimit(stagePolicy, stage.step_id);
    const protectedFutureReserveUsd = stageBeforeInitialQa(stage.step_id)
      ? Number(generationBudget.protected_qa_and_fix_reserve_usd || 0)
      : 0;
    if (!sharedResearchAllocated && Number(String(stage.step_id).split('_')[0]) >= 6) {
      sharedResearchAllocationUsd = Number((sharedResearchActualCostUsd / candidateCount).toFixed(6));
      sharedResearchAllocated = true;
      cumulativeGenerationCostUsd = Number((cumulativeGenerationCostUsd + sharedResearchAllocationUsd).toFixed(6));
    }
    const candidateSharedCostAllocationUsd = sharedResearchAllocated ? sharedResearchAllocationUsd : 0;
    if (stageNeedsCandidateBrief) {
      if (!candidateDomainBriefRef || candidateDomainBrief?.status !== 'complete') {
        throw new Error(
          `Stage ${stage.step_id} requires a complete candidate domain brief before execution.`
        );
      }
    }
    const stageExecutionContextHash = stageExecutionContext
      ? sha256Hex(stableStringify(stageExecutionContext))
      : null;
    const budgetPreflightResult = stageUsesBudget(stage.step_id)
      ? budgetPreflight({
          budgetContract: generationBudget,
          pricingSnapshot,
          candidateRef: manifest.candidate_ref,
          stepId: stage.step_id,
          requestedModelId: requestedModel,
          inputTokens: inputTokenEstimate,
          maximumOutputTokens,
          estimatedPaidToolCostUsd: 0,
          cumulativeActualCostUsd: cumulativeGenerationCostUsd,
          protectedFutureReserveUsd,
        })
      : {
          candidate_ref: manifest.candidate_ref,
          step_id: stage.step_id,
          requested_model_id: requestedModel,
          input_tokens: inputTokenEstimate,
          maximum_output_tokens: maximumOutputTokens,
          estimated_paid_tool_cost_usd: 0,
          projected_stage_maximum_usd: 0,
          cumulative_actual_cost_usd: cumulativeGenerationCostUsd,
          protected_future_reserve_usd: protectedFutureReserveUsd,
          projected_total_after_stage_usd: cumulativeGenerationCostUsd,
          allowed: true,
          denial_reason: '',
        };
    if (!budgetPreflightResult.allowed) {
      throw new Error(
        `Budget preflight denied ${stage.step_id}: ${budgetPreflightResult.denial_reason}`
      );
    }

    const sessionBinding = isHumanGate
      ? { model: 'human', modelProvider: 'human-gate', threadId: 'human-gate' }
      : args.dryRun
        ? { model: requestedModelResolved, modelProvider: 'dry-run', threadId: 'dry-run' }
        : await startStageSession({
            sessionFile: stageSessionFile,
            workspaceDir: repoRoot,
            requestedModel: requestedModelResolved,
          });

    const tokenUsage = isHumanGate || args.dryRun
      ? {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        }
      : await readSessionTokenUsage(stageSessionFile);

    if (!tokenUsage && !isHumanGate && !args.dryRun) {
      throw new Error(`Unable to read token usage from ${stageSessionFile}`);
    }

    const observedModel = sessionBinding?.model || 'none';
    const providerReportedModelId = normalizeObservedModelId(observedModel, pricingSnapshot);
    const exactMatch = isHumanGate
      ? true
      : providerReportedModelId === requestedModelResolved
        || providerReportedModelId === requestedModelResolved?.toLowerCase();
    const tokenUsageInputTokens = normalizeTokenCount(tokenUsage?.promptTokens) ?? 0;
    const tokenUsageOutputTokens = normalizeTokenCount(tokenUsage?.completionTokens) ?? 0;
    const tokenUsageTotalTokens = normalizeTokenCount(tokenUsage?.totalTokens) ?? tokenUsageInputTokens + tokenUsageOutputTokens;
    const stageModelCostUsd = isHumanGate || args.dryRun
      ? 0
      : calculateStageCostUsd(
          pricingSnapshot,
          requestedModelResolved,
          tokenUsageInputTokens,
          0,
          tokenUsageOutputTokens,
        ) || 0;
    const stageTotalCostUsd = Number((stageModelCostUsd
      + Number(budgetPreflightResult.estimated_paid_tool_cost_usd || 0)).toFixed(6));
    if (!isHumanGate && !args.dryRun) {
      cumulativeGenerationCostUsd = Number((cumulativeGenerationCostUsd + stageTotalCostUsd).toFixed(6));
      if (Number(String(stage.step_id).split('_')[0]) <= 5) {
        sharedResearchActualCostUsd = Number((sharedResearchActualCostUsd + stageTotalCostUsd).toFixed(6));
      }
    }
    const remainingGenerationBudgetUsd = Number((
      Number(generationBudget.generation_budget_usd || generationBudget.total_hard_budget_usd || 25) - cumulativeGenerationCostUsd
    ).toFixed(6));
    const generationBudgetPass = remainingGenerationBudgetUsd >= 0 && cumulativeGenerationCostUsd <= Number(generationBudget.generation_budget_usd || generationBudget.total_hard_budget_usd || 25);

    const stageRecord = {
      step_id: stage.step_id,
      step_name: stepNameFromId(stage.step_id),
      model_policy_ref: stage.model_policy_ref || null,
      governed_default_model: stage.dispatch.requested_model || null,
      governed_fallback_model: stage.dispatch.fallback_model || null,
      governed_escalation_model: stage.dispatch.escalation_model || null,
      governed_model_tier: stage.dispatch.governed_model_tier || stagePolicy.governed_model_tier || null,
      functional_mandate: stage.functional_mandate || null,
      candidate_domain_brief_ref: candidateDomainBriefRef || null,
      applied_domain_consideration_ids: applicableDomainConsiderationIds,
      stage_execution_context_hash: stageExecutionContextHash,
      requested_model_id: requestedModel || null,
      requested_model: requestedModel,
      requested_model_resolved: requestedModelResolved,
      runtime_resolved_model_id: requestedModelResolved || null,
      provider_reported_model_id: providerReportedModelId,
      reasoning_effort: stage.dispatch.reasoning_effort || stagePolicy.reasoning_effort || null,
      text_verbosity: stage.dispatch.text_verbosity || stagePolicy.text_verbosity || null,
      processing_mode: stage.dispatch.processing_mode || stagePolicy.processing_mode || null,
      quality_critical: Boolean(stage.dispatch.quality_critical ?? stagePolicy.quality_critical ?? false),
      automatic_downward_fallback_allowed: Boolean(stage.dispatch.automatic_downward_fallback_allowed ?? stagePolicy.automatic_downward_fallback_allowed ?? false),
      fresh_context_required: Boolean(stage.dispatch.fresh_context_required ?? stagePolicy.fresh_context_required ?? false),
      independence_required: Boolean(stage.dispatch.independence_required ?? stagePolicy.independence_required ?? false),
      model_call_required: Boolean(stage.dispatch.model_call_required ?? stagePolicy.model_call_required ?? true),
      mechanical_state_writer_if_needed: stage.dispatch.mechanical_state_writer_if_needed || stagePolicy.mechanical_state_writer_if_needed || null,
      input_tokens: tokenUsageInputTokens,
      cached_input_tokens: 0,
      output_tokens: tokenUsageOutputTokens,
      reasoning_tokens_if_reported: 0,
      paid_tool_calls: 0,
      paid_tool_cost_usd: 0,
      container_cost_usd: 0,
      image_generation_cost_usd: 0,
      stage_model_cost_usd: stageModelCostUsd,
      stage_total_cost_usd: stageTotalCostUsd,
      candidate_shared_cost_allocation_usd: candidateSharedCostAllocationUsd,
      cumulative_generation_cost_usd: cumulativeGenerationCostUsd,
      remaining_generation_budget_usd: remainingGenerationBudgetUsd,
      projected_remaining_cost_usd: remainingGenerationBudgetUsd,
      pricing_snapshot_ref: 'specs/PRICING-004.yaml',
      execution_status: isHumanGate ? 'waiting_on_human' : 'run',
      actual_model_used: observedModel,
      prompt_tokens: tokenUsageInputTokens,
      completion_tokens: tokenUsageOutputTokens,
      total_tokens: tokenUsageTotalTokens,
      exact_match: exactMatch,
      session_file: stageSessionFile ? path.relative(repoRoot, stageSessionFile) : null,
      fallback_used: false,
      escalation_used: false,
      output_artifact_id: null,
      evidence: [
        `source: ${path.relative(repoRoot, dispatchContractPath)}`,
        `source: ${path.relative(repoRoot, workflowPath)}`,
        ...(stageSessionFile ? [`source: ${path.relative(repoRoot, stageSessionFile)}`] : ['source: human gate']),
      ],
    };

    const dispatchRecord = {
      step_id: stage.step_id,
      model_policy_ref: stage.model_policy_ref || null,
      requested_model: requestedModel,
      requested_model_resolved: requestedModelResolved,
      requested_model_id: requestedModel || null,
      functional_mandate: stage.functional_mandate || null,
      candidate_domain_brief_ref: candidateDomainBriefRef || null,
      applied_domain_consideration_ids: applicableDomainConsiderationIds,
      stage_execution_context_hash: stageExecutionContextHash,
      governed_model_tier: stage.dispatch.governed_model_tier || stagePolicy.governed_model_tier || null,
      runtime_resolved_model_id: requestedModelResolved || null,
      provider_reported_model_id: providerReportedModelId,
      reasoning_effort: stage.dispatch.reasoning_effort || stagePolicy.reasoning_effort || null,
      text_verbosity: stage.dispatch.text_verbosity || stagePolicy.text_verbosity || null,
      processing_mode: stage.dispatch.processing_mode || stagePolicy.processing_mode || null,
      quality_critical: Boolean(stage.dispatch.quality_critical ?? stagePolicy.quality_critical ?? false),
      automatic_downward_fallback_allowed: Boolean(stage.dispatch.automatic_downward_fallback_allowed ?? stagePolicy.automatic_downward_fallback_allowed ?? false),
      fresh_context_required: Boolean(stage.dispatch.fresh_context_required ?? stagePolicy.fresh_context_required ?? false),
      independence_required: Boolean(stage.dispatch.independence_required ?? stagePolicy.independence_required ?? false),
      model_call_required: Boolean(stage.dispatch.model_call_required ?? stagePolicy.model_call_required ?? true),
      mechanical_state_writer_if_needed: stage.dispatch.mechanical_state_writer_if_needed || stagePolicy.mechanical_state_writer_if_needed || null,
      execution_status: isHumanGate ? 'waiting_on_human' : 'run',
      session_model_observed: observedModel,
      dispatch_match: exactMatch,
      fallback_used: false,
      escalation_used: false,
      output_artifact_id: null,
      session_file: stageSessionFile ? path.relative(repoRoot, stageSessionFile) : null,
      evidence: [
        `source: ${path.relative(repoRoot, dispatchContractPath)}`,
        ...(stageSessionFile ? [`source: ${path.relative(repoRoot, stageSessionFile)}`] : ['source: human gate']),
      ],
    };

    stageResults.push({
      requestedModel,
      observedModel,
      exactMatch,
      promptTokens: tokenUsage.promptTokens,
      completionTokens: tokenUsage.completionTokens,
      totalTokens: tokenUsage.totalTokens,
      sessionFile: stageSessionFile,
      stepId: stage.step_id,
    });

    const cumulativePromptTokens = stageResults.reduce((sum, item) => sum + Number(item.promptTokens || 0), 0);
    const cumulativeCompletionTokens = stageResults.reduce((sum, item) => sum + Number(item.completionTokens || 0), 0);
    const cumulativeTotalTokens = stageResults.reduce((sum, item) => sum + Number(item.totalTokens || 0), 0);
    if (candidateState?.candidateQueueRecord && !args.dryRun) {
      updateCandidateLedger(candidateState.candidateQueueRecord, {
        current_stage: stage.step_id,
        stage_iteration: Number(candidateRecord?.stage_iteration || 0),
        cumulative_prompt_tokens: cumulativePromptTokens,
        cumulative_completion_tokens: cumulativeCompletionTokens,
        cumulative_total_tokens: cumulativeTotalTokens,
        cumulative_api_cost_usd: Number(cumulativeGenerationCostUsd.toFixed(6)),
        pricing_snapshot_ref: 'specs/PRICING-004.yaml',
        generation_budget_usd: Number(generationBudget.generation_budget_usd || generationBudget.total_hard_budget_usd || 25),
        shared_research_cost_usd: sharedResearchAllocated ? sharedResearchAllocationUsd : 0,
        generation_api_and_tool_cost_usd: Number(cumulativeGenerationCostUsd.toFixed(6)),
        competitor_purchase_cost_usd: Number(candidateRecord?.competitor_purchase_cost_usd || 0),
        remaining_generation_budget_usd: remainingGenerationBudgetUsd,
        generation_budget_pass: generationBudgetPass,
      });
    }

    runLedger.model_run_ledger.stages.push(stageRecord);
    dispatchLog.model_stage_dispatch.stages.push(dispatchRecord);

    if (isHumanGate) {
      runLedger.model_run_ledger.notes.push(`Paused at ${stage.step_id} for human purchase approval before any external spend.`);
      dispatchLog.model_stage_dispatch.notes.push(`Paused at ${stage.step_id} for human purchase approval before any external spend.`);
      break;
    }

    if (!exactMatch) {
      runLedger.model_run_ledger.overall_exact_match = false;
      dispatchLog.model_stage_dispatch.overall_dispatch_match = false;
      runLedger.model_run_ledger.notes.push(
        `Stopped at ${stage.step_id} because requested ${requestedModel} did not match observed ${observedModel}.`
      );
      dispatchLog.model_stage_dispatch.notes.push(
        `Stopped at ${stage.step_id} because requested ${requestedModel} did not match observed ${observedModel}.`
      );
      break;
    }
  }

  const uniqueObservedModels = uniqueModels(runLedger.model_run_ledger.stages);
  runLedger.model_run_ledger.session_model_observed = uniqueObservedModels.length === 1
    ? uniqueObservedModels[0]
    : 'mixed';

  const lastPlannedIndex = runLedger.model_run_ledger.stages.length - 1;
  const lastPlannedStageId = runLedger.model_run_ledger.stages[lastPlannedIndex]?.step_id;
  const plannedStageIds = new Set(plannedStages.map((stage) => stage.step_id));
  const publishStageId = flow.flow.find((stage) => /marketplace_publish$/.test(stage.step_id))?.step_id || null;
  const allFlowStages = flow.flow.filter((stage) => {
    if (!args.includePublish && stage.step_id === publishStageId) return false;
    return plannedStageIds.has(stage.step_id);
  });

  for (const stage of flow.flow) {
    if (plannedStages.some((planned) => planned.step_id === stage.step_id)) {
      continue;
    }
    const dispatchStage = dispatch.stage_model_map?.[stage.step_id];
    if (!dispatchStage) continue;
    const notRunRecord = {
      step_id: stage.step_id,
      step_name: stepNameFromId(stage.step_id),
      model_policy_ref: stage.model_policy_ref || dispatchStage.model_policy_ref || null,
      governed_default_model: dispatchStage.requested_model || null,
      governed_fallback_model: dispatchStage.fallback_model || null,
      governed_escalation_model: dispatchStage.escalation_model || null,
      governed_model_tier: dispatchStage.governed_model_tier || null,
      functional_mandate: stage.functional_mandate || null,
      candidate_domain_brief_ref: candidateDomainBriefRef || null,
      applied_domain_consideration_ids: [],
      stage_execution_context_hash: null,
      requested_model: dispatchStage.requested_model || null,
      requested_model_id: dispatchStage.requested_model_id || dispatchStage.requested_model || null,
      execution_status: 'not_run',
      actual_model_used: 'none',
      requested_model_resolved: dispatchStage.runtime_resolved_model_id || null,
      runtime_resolved_model_id: dispatchStage.runtime_resolved_model_id || null,
      provider_reported_model_id: 'none',
      reasoning_effort: dispatchStage.reasoning_effort || null,
      text_verbosity: dispatchStage.text_verbosity || null,
      processing_mode: dispatchStage.processing_mode || null,
      input_tokens: 0,
      cached_input_tokens: 0,
      output_tokens: 0,
      reasoning_tokens_if_reported: 0,
      paid_tool_calls: 0,
      paid_tool_cost_usd: 0,
      container_cost_usd: 0,
      image_generation_cost_usd: 0,
      stage_model_cost_usd: 0,
      stage_total_cost_usd: 0,
      candidate_shared_cost_allocation_usd: 0,
      cumulative_generation_cost_usd: cumulativeGenerationCostUsd,
      remaining_generation_budget_usd: Number((
        Number(generationBudget.generation_budget_usd || generationBudget.total_hard_budget_usd || 25) - cumulativeGenerationCostUsd
      ).toFixed(6)),
      projected_remaining_cost_usd: Number((
        Number(generationBudget.generation_budget_usd || generationBudget.total_hard_budget_usd || 25) - cumulativeGenerationCostUsd
      ).toFixed(6)),
      pricing_snapshot_ref: 'specs/PRICING-004.yaml',
      exact_match: false,
      fallback_used: false,
      escalation_used: false,
      output_artifact_id: null,
      session_file: null,
      evidence: [
        `source: ${path.relative(repoRoot, workflowPath)}`,
        'source: stage not run',
      ],
    };
    const notRunDispatch = {
      step_id: stage.step_id,
      model_policy_ref: stage.model_policy_ref || dispatchStage.model_policy_ref || null,
      requested_model: dispatchStage.requested_model || null,
      requested_model_id: dispatchStage.requested_model_id || dispatchStage.requested_model || null,
      functional_mandate: stage.functional_mandate || null,
      candidate_domain_brief_ref: candidateDomainBriefRef || null,
      applied_domain_consideration_ids: [],
      stage_execution_context_hash: null,
      governed_model_tier: dispatchStage.governed_model_tier || null,
      runtime_resolved_model_id: dispatchStage.runtime_resolved_model_id || null,
      provider_reported_model_id: 'none',
      reasoning_effort: dispatchStage.reasoning_effort || null,
      text_verbosity: dispatchStage.text_verbosity || null,
      processing_mode: dispatchStage.processing_mode || null,
      quality_critical: Boolean(dispatchStage.quality_critical ?? false),
      automatic_downward_fallback_allowed: Boolean(dispatchStage.automatic_downward_fallback_allowed ?? false),
      fresh_context_required: Boolean(dispatchStage.fresh_context_required ?? false),
      independence_required: Boolean(dispatchStage.independence_required ?? false),
      model_call_required: Boolean(dispatchStage.model_call_required ?? true),
      mechanical_state_writer_if_needed: dispatchStage.mechanical_state_writer_if_needed || null,
      execution_status: 'not_run',
      session_model_observed: 'none',
      dispatch_match: false,
      fallback_used: false,
      escalation_used: false,
      output_artifact_id: null,
      session_file: null,
      evidence: [
        `source: ${path.relative(repoRoot, dispatchContractPath)}`,
        'source: stage not run',
      ],
    };
    runLedger.model_run_ledger.stages.push(notRunRecord);
    dispatchLog.model_stage_dispatch.stages.push(notRunDispatch);
  }

  if (!args.dryRun) {
    ensureDir(path.dirname(runLedgerPath));
    ensureDir(path.dirname(dispatchLogPath));
    writeFileSync(runLedgerPath, rubyDumpYaml(runLedger), 'utf8');
    writeFileSync(dispatchLogPath, rubyDumpYaml(dispatchLog), 'utf8');
  }

  const summary = {
    runId: args.runId,
    buildManifest: path.relative(repoRoot, buildManifestPath),
    launcher: 'runtime/model-stage-launcher.mjs',
    dryRun: args.dryRun,
    overallExactMatch: runLedger.model_run_ledger.overall_exact_match,
    overallDispatchMatch: dispatchLog.model_stage_dispatch.overall_dispatch_match,
    stages: stageResults,
    runLedgerPath: path.relative(repoRoot, runLedgerPath),
    dispatchLogPath: path.relative(repoRoot, dispatchLogPath),
    sessionRoot: path.relative(repoRoot, sessionRoot),
    manifestStatus: manifest.status,
    assetReport,
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  process.exit(0);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack || error.message : String(error)}\n`);
  process.exit(1);
});
