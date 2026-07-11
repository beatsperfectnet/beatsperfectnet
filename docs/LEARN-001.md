# LEARN-001

Purpose: convert failures into validated company controls instead of product reruns.

## Principle

A serious failure is not closed by patching records, rerunning the flow, or rebuilding the product.

It closes only when the company can prove:

1. failure intake exists
2. post-mortem exists
3. findings were extracted
4. governance/system findings have patch records
5. patches were applied
6. regression replay blocks the failed case earlier than before
7. company memory was updated with an active guard
8. the next-run preflight would load that guard at the correct owner gate

Shortest version:

Fail -> explain -> extract finding -> patch control -> replay failed case -> memory guard -> next run.

## Candidate Success vs Process Success

LEARN-001 applies not only to bad candidate outcomes, but also to bad process outcomes.

A run may end with a publishable candidate and still count as a learning failure if the flow needed human product-management intervention to reach the right scope.

Example pattern:

- `candidate_outcome: LAUNCH_READY`
- `process_outcome: HUMAN_SCOPE_RESCUE`
- `learning_required: true`

The company should not treat "artifact ended up good" as proof that the active flow worked well enough.

## Operational Truth Failures

LEARN-001 also applies when the public operating surface reports the wrong truth even if no candidate rebuild is happening.

Example pattern:

- `public_outcome: READY_COUNT_UNDERSTATED`
- `process_outcome: PUBLIC_STATE_DRIFT`
- `learning_required: true`

Typical cases:

- a one-day bucket edit leaves cumulative totals wrong
- `records/dashboard_state.yaml` and fallback state disagree
- a public snapshot or fallback reports a terminal count/spend state that no longer matches source records

These are governance/process failures because the company is publishing the wrong operating truth.

## When LEARN-001 Triggers

- `BUILT_QA_FAILED_ARCHITECTURE`
- `BUILT_QA_FAILED_IMPLEMENTATION_AFTER_REPAIR`
- `LISTING_FAILED`
- `FOUNDER_REJECTED`
- `LAUNCH_GATE_FAILED`
- `COST_OVERRUN`
- `SAME_FAILED_PRODUCT_CLASS_BLOCKED`
- `REPEATED_RERUN_WITH_NO_MATERIAL_DELTA`
- human labels: `epic_fail`, `founder_rejected`, `not_good_enough_for_humans`, `same_failed_product_class`, `flow_failed_to_block`

Additional process-gap triggers:

- `human_scope_correction_required`
- `human_input_used_as_product_direction`
- `human_input_used_as_scope_evidence_without_new_evidence`
- `candidate_salvaged_but_process_failed`
- `launch_ready_after_human_product_management_intervention`
- `public_state_drift_detected`

## Hard Rules

- Failed runs must not be repeated until failure is closed.
- Architecture failures require flow patch, not product patch.
- Governance findings require regression replay before company memory activation.
- Company memory entries are active guards, not notes.
- The company has not learned until the same failed case is blocked earlier.
- Candidate success does not imply process success.
- Human governance correction is not market evidence.
- If human intervention upgrades the product from an intermediate domain layer to the real-world decision layer without new evidence, the flow missed a domain-evidence implication.
- A mathematically correct sub-model is not enough when domain evidence implies a higher decision layer.
- Public dashboard and fallback state are governed truth; drift between them counts as process failure, not cosmetic cleanup.

## Required Record Chain

- `records/failures/FAIL-XXXX.yaml`
- `records/postmortems/PMR-XXXX.yaml`
- `records/findings/FND-XXXX.yaml`
- `records/flow_patches/FP-XXXX.yaml`
- `records/regression_replays/RGR-XXXX.yaml`
- `docs/COMPANY-MEMORY.md` active entry
- `records/learning_closure/LCL-XXXX.yaml`

## Domain-Evidence Learning

Some learning failures are not about broken artifacts. They are about underfit scope.

That happens when the flow solves an intermediate domain layer but not the buyer's real-world decision layer.

Example:

- intermediate layer: `unit_economy`
- terminal layer: `total_outcome = unit_economy * units`

If evidence implies the buyer ultimately judges the terminal layer, then the intermediate layer is necessary but not sufficient.

LEARN-001 should classify that as:

- `process_outcome: DOMAIN_EVIDENCE_UNDERFIT`
- `required_patch_target: target_audience -> insight/KPP -> domain_evidence -> decision_outputs`

## Human Intervention Classification

Every substantive human intervention should be classified as one of:

- `governance_correction`
- `evidence_addition`
- `product_management_intervention`

If a human intervention materially changes scope, decision outputs, architecture, or buyer promise without new external evidence, the process outcome is not healthy even if the candidate eventually passes.

## FLOW-007 Connection

- `pre_run` must block same-lane runs when applicable learning closure is still open.
- `on_failure` must trigger `LEARN-001`.
- `founder_launch_gate` must require `LEARN-001` if launch is rejected.
- company-memory preflight must map every applicable active memory rule to an owner gate and fail if no owner gate exists.

## Regression Rule

Regression replay is normally dry for architecture/governance/model-routing/validator failures.

Expected behavior for those failures:

- `should_reach_build: false`
- `build_performed: false`
- the failed case must be blocked earlier than its original failure stage

For process-gap and domain-evidence-underfit cases, replay may pass in either of two ways:

- the patched flow now derives the corrected real-world decision layer from the original evidence
- or the patched flow blocks the under-scoped version before build and demands evidence refresh or scope correction at the correct earlier stage

Replay should fail if the next similar case still depends on human product-management intervention to reach the right scope.

## Activation Rule

An active company-memory entry may be marked `ACTIVE` only after its linked regression replay passes.
