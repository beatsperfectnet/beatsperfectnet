# Company Memory

This is the durable BeatsPerfect memory for why company rules, flows, schemas, and gates changed.

It is not a changelog of every file edit. It records the business reason, the failure that caused the change, the rule learned, and the consequence for future runs.

## Memory Rule

Every material governance or flow change must add an entry here before the change is considered complete.

Before any new governed product run starts, the active flow must read this file and produce a run-specific company-memory preflight. The preflight must extract applicable lessons into build findings and governance findings before market evidence, purchase approval, model calls, or artifact generation proceed.

Each entry should answer:

- What failed or changed?
- What did we learn?
- Which rule, flow, schema, model, budget, dashboard, or validator changed?
- Which future failure should this prevent?
- Where is the evidence?

Do not replace candidate records, validation records, or the technical changelog with this file. Those records prove what happened in one run. This file preserves why the company changed its operating rules.

## Findings Rule

Each run should maintain a findings ledger:

- Build findings: artifact, product, listing, delivery, buyer-behavior, domain-model, scenario, and implementation lessons that must affect the product or its checks.
- Governance findings: flow, schema, routing, budget, dashboard, validator, memory, and record-chain lessons that must affect how the run is controlled.

Build findings must not be closed by governance wording. Governance findings must not be closed by generating a cleaner artifact. If a finding applies, the run must either consume it in the relevant gate or record why it is not applicable.

## Flow-Change Memory

### FLOW-001 - Baseline

Status: historical baseline.

Known reason: initial product-generation path before later human-readiness, competitor-inspection, budget, and founder-acceptance gates.

Backfill needed: reconstruct exact failure that caused FLOW-002 from older records or session logs if available.

### FLOW-002 - Human-Readiness Gate

Date: 2026-06-18

Reason: C-001-001 showed that a product could look structurally complete while still failing human use and buyer-facing presentation.

Learning:

- `ready_for_publish` must include human-readiness review.
- Buyer-facing text cannot be clipped, truncated, overlapped, squeezed, or unreadable on marketplace/mobile surfaces.
- Spreadsheet controls must look like human controls; exposed TRUE/FALSE values are not acceptable buyer UX.
- Listing/package images must faithfully match delivered workbook controls, content, and states.

Changed:

- Added pre-build Good Enough for Humans requirements.
- Added stricter QA/launch review around buyer-facing controls and presentation.

Prevents:

- Launching workbooks that pass formula/spec checks but fail first-open buyer trust and readability.

Evidence:

- OpenClaw memory `memory/2026-06-18.md`

### FLOW-003 - Backfill Required

Status: superseded historical flow.

Known reason: FLOW-003 is listed as superseded in governance, but this checkout does not contain enough tracked documentation to record the exact business reason confidently.

Rule:

- Do not infer this entry from the version number alone.
- Backfill only from commit history, archived records, or session memory with evidence.

### FLOW-004 - Purchased Competitor Evidence And Budget Discipline

Source: `CHANGELOG.md`

Reason: Public listing evidence and internally generated specs were not enough to know the actual delivered buyer experience, hidden support traps, workbook depth, formula behavior, and visual quality floor.

Learning:

- Mandatory competitor purchase is needed before final specs for spreadsheet-template products.
- Purchased competitor inspection must separate market evidence, hidden buyer experience, support traps, and originality boundaries.
- Domain expertise should improve implementation and tests, but must not invent market demand or expand scope.
- Generation budget and competitor purchase spend must be tracked separately.
- Canonical model IDs and budget preflight reduce execution ambiguity.

Changed:

- Added mandatory external competitor purchase approval and spend control.
- Added private purchased-asset handling and purchased competitor inspection.
- Reordered pre-build specification sequence so listing, product, delivery, and human-readiness specs are evidence-backed.
- Added spreadsheet resilience QA and support-by-design QA.
- Added versioned pricing/generation-budget contracts.

Prevents:

- Building from surface-level marketplace assumptions.
- Copying competitor assets.
- Treating hidden competitor breakage as either irrelevant or automatically category-blocking.
- Spending generation budget without accounting.

Evidence:

- `CHANGELOG.md`
- `archive/flow-004/workflows/FLOW-004.yaml`
- `archive/flow-004/specs/SCHEMA-004.yaml`
- `archive/flow-004/specs/MODEL-004.yaml`

### FLOW-005 - Insight/KPP/RTB/Hook System

Source: `archive/flow-005/docs/FLOW-005.md`

Reason: The company needed a tighter promise architecture: insight identifies the buyer job, KPP states the one selling promise, RTB proves it through one connected system, and hook sells the verified proof on the marketplace shelf.

Learning:

- Insight, KPP, RTB, and hook are separate but connected.
- The purchased competitor shows what to avoid; broken competitor parts are evidence, not our publish blockers.
- If our product is broken, that is our problem.
- Current bestsellers define the category visual-quality floor.

Changed:

- Added the FLOW-005 promise system.
- Kept mandatory competitor purchase and hidden inspection.
- Clarified competitor brokenness as avoidance evidence.

Prevents:

- Reducing product quality to feature lists.
- Treating competitor defects as excuses for our defects.
- Building a product without a marketplace-facing hook.

Evidence:

- `archive/flow-005/docs/FLOW-005.md`
- `archive/flow-005/workflows/FLOW-005.yaml`

### FLOW-006 - Founder Acceptance Before Listing

Date: 2026-06-26

Reason: FLOW-005 still allowed outputs that looked clean in records but needed founder feedback before they were human-ready or shelf-ready.

Learning:

- Founder-style adversarial review must happen before listing assembly.
- A flow needs reusable rejection patterns from actual founder inspection behavior.
- Frontier model use should be reserved for high-leverage judgment stages; medium/mini should handle mechanical stages.

Changed:

- Created FLOW-006 with hard `08_founder_acceptance_simulation` before listing creative assembly.
- Added `FOUNDER-ACCEPTANCE-CORPUS-001`.
- Added model routing discipline for FLOW-006.

Prevents:

- Continuing to listing after a product still needs founder-level feedback.
- Treating clean presentation as equivalent to product readiness.

Evidence:

- OpenClaw memory `memory/2026-06-26.md`
- `archive/flow-006/workflows/FLOW-006.yaml`
- `archive/flow-006/specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml`
- commit `99b9e06 Add FLOW-006 founder acceptance flow`

### FLOW-006 Patch - Demo-Scale Artifact, Weak Hooks, Cost/Outcome Accountability

Date: 2026-06-26

Reason: C-004-001 reached launch gate but the workbook remained a good-enough demo: visible row counts were effectively unchanged, listing images were clean but not shelf-stopping, and a paid rerun produced substantially the same outcome.

Learning:

- Founder acceptance must compare current artifact against prior failed artifact, not only read new records.
- Visible human-scale capacity matters; hidden formula ranges do not count as buyer-usable capacity.
- Listing images need a real grid-stop reason, not only clean layout and screenshots.
- Material spend requires material product or listing delta.

Changed:

- Added blockers for same demo workbook after rerun, demo-scale rows, clean listing without real hook, paid rerun same outcome, and record pass without artifact proof.
- Hardened FLOW-006 artifact outcome gates: visible capacity, material artifact delta, direct artifact inspection, per-image hook, hook delta, and cost/outcome accountability.

Prevents:

- Spending more to regenerate timestamps or records while shipping the same product.
- Passing launch with visually clean but commercially weak listing assets.

Evidence:

- OpenClaw memory `memory/2026-06-26.md`
- `archive/flow-006/docs/FLOW-006-C004-RERUN-HANDOFF.md`
- commits `c230eec Tighten founder acceptance rejection corpus`, `6b5eb5a Harden FLOW-006 artifact outcome gates`

### FLOW-007 - Product Architecture Contract Before Build

Date: 2026-06-29

Reason: C-004-001 showed that FLOW-006 could improve acceptance, QA, artifact inspection, listing gates, cost accountability, and founder rejection while still rebuilding from an under-specified product idea.

Learning:

- Market signal is real evidence but not build permission.
- Product generation must wait until target audience, buyer behavior, domain model, decision outputs, category standard, and scenario behavior are locked.
- Inventory replenishment cannot model Opening Stock as a static SKU field when stock changes through dated counts, sales, purchases/receipts, adjustments, and later counts.
- Architecture failure must return to Product Architecture Contract, not artifact patching.

Changed:

- Initially created FLOW-007 with Market Evidence -> Competitor Product Autopsy -> Product Architecture Contract -> Scenario Matrix -> Build Readiness Review before product build; later FLOW-007 patches below replaced the pre-architecture shortcut with market-derived public shelf read, competitor selection, and purchased inspection.
- Added Product Architecture Contract, Competitor Autopsy, Scenario Matrix, Build Readiness Review, and Blind Buyer Walkthrough templates.
- Added C-004-001 as a FLOW-006 failure case and dry-validated it as `NOT_BUILD_READY`.

Prevents:

- Repeated rebuilds that harden symptoms while leaving buyer behavior and domain model unlocked.
- Dashboard or records treating a failed architecture artifact as launch-ready.

Evidence:

- `docs/FLOW-007.md`
- `workflows/FLOW-007.yaml`
- `records/failure-cases/C-004-001-FLOW-006-postmortem.md`
- `records/flow_007_validation/F7V-C-004-001.yaml`

### FLOW-007 Patch - Market-Derived Product Direction Before Architecture

Date: 2026-06-29

Reason: The first FLOW-007 pilot for the small-seller inventory/reorder space stopped after multiple competitor purchases because the run treated `Small Seller Reorder Planner` as the product direction to validate. That repeated the wrong kind of certainty: a C-004 post-mortem hypothesis became the thing to prove, instead of using market evidence to discover what product idea the category actually supports.

Learning:

- Any flow must start from market evidence, not from a locked product direction.
- A post-mortem hypothesis can seed research terms, but it cannot pre-lock the product that market evidence is supposed to choose.
- FLOW-006's pre-architecture sequence was directionally correct: market/category evidence, public shelf read, deterministic one-competitor selection, purchased inspection, then architecture.
- Competitor purchase should be exactly one by default, selected from the evidence-backed market set by match tier, market strength, product surface completeness, gallery evidence, then price/friction.
- If the purchased competitor is formula-broken, inaccessible, unrepresentative, or missing core benchmark surfaces, request exactly one replacement purchase or equivalent benchmark evidence.
- Broken or shallow competitor products are evidence and build requirements; they should not make the system hunt for a competitor that matches an already-hypothesized product.
- Target audience, use cases, domain model, decision outputs, and scenario logic must be derived from market evidence plus purchased competitor inspection.

Changed:

- Revised FLOW-007's pre-architecture sequence to `Market Evidence -> Public Shelf Read -> Competitor Selection/Purchase Approval -> Purchased Competitor Inspection -> Product Architecture Contract`.
- Added explicit FLOW-007 rules that product direction must be market-derived or marked unproven before architecture.
- Added model-routing and dispatch stages for public shelf read, competitor selection, and purchased competitor inspection.
- Updated FLOW-007 pilot policy so first-three-pilot aggressive frontier review still applies, but does not override the market-derived sequence.
- Updated validator and tests so FLOW-007 fails if the pre-architecture gates collapse back into direct competitor autopsy of a prelocked product direction.
- Recorded the C-007-001 pilot as stopped for FLOW policy review before rerun.

Prevents:

- Spending competitor-purchase money and frontier tokens trying to validate a product guessed from a post-mortem rather than selected by market evidence.
- Confusing benchmark adequacy with "find a competitor that matches our hypothesis."
- Continuing to architecture from market signal alone while the actual market-backed product opportunity remains unresolved.
- Repeating C-004-style failures through a cleaner but still incorrectly sourced Product Architecture Contract.

Evidence:

- `records/flow_reviews/FLOW-007-vs-FLOW-006-market-evidence-review-2026-06-29.yaml`
- `docs/FLOW-007.md`
- `workflows/FLOW-007.yaml`
- `specs/MODEL-007.yaml`
- `governance/09_stage_dispatch_007.yaml`
- `governance/10_flow_007_pilot_policy.yaml`
- `validators/flow-007-validator.mjs`
- `tests/flow-007.test.mjs`

### FLOW-007 Patch - Preserve Proven FLOW-006 Delivery Gates Inside Architecture-First Flow

Date: 2026-06-29

Reason: After correcting FLOW-007's market-derived start, the next risk was losing FLOW-006's late hardening. The final FLOW-006 version had been strengthened by real C-004 failures: demo-scale workbooks, same-output paid reruns, clean but hookless listing assets, record passes without artifact proof, missing machine-checkable JTBD outputs, weak helper behavior, and QA that could inspect formulas without proving buyer behavior.

Learning:

- FLOW-007 should not copy FLOW-006 as a whole, because FLOW-007's main experiment is Product Architecture Contract before build.
- The proven FLOW-006 policies should move into the architecture-first spine as contract fields, build manifests, artifact inspection, listing/package QA, pre-mortem analysis, and launch gate requirements.
- Product Architecture Contract must include buyer behavior mapping, input-to-decision map, next-action map, domain invariants, setup-input propagation, machine-checkable output locations, truth table tests, working-capacity requirements, visible capacity floor, and helper behavior scenario.
- Product Build must consume the locked contract and record manifests proving implementation of buyer behavior, decision outputs, scenario coverage, setup propagation, working capacity, visible capacity, and helper behavior.
- Actual Artifact Inspection must execute buyer behavior, adversarial scenario mutations, recalculated before/after outputs, setup propagation, capacity checks, and helper walkthroughs on the actual artifact.
- Listing assets must have per-image buyer hook, product proof, grid-stop reason, and verified actual product surface; screenshots alone do not pass.
- Pre-mortem failure analysis must assume launch failed and identify top preventable failures from current evidence only, without inventing scope.
- Launch Gate must require pre-mortem blockers absent and cost/outcome accountability, not just clean records.

Changed:

- Added FLOW-007 templates for Actual Artifact Inspection, Pre-Mortem Failure Analysis, and Launch Gate.
- Strengthened Product Architecture Contract, Build Manifest, Listing Spec, FLOW-007 workflow, MODEL-007, SCHEMA-007, BLS-007, dispatch, validator, and tests.
- Added gpt-5.5 frontier routing for FLOW-007 pre-mortem failure analysis in first pilot policy.

Prevents:

- Reintroducing FLOW-006's old failure where records and formulas pass while buyer behavior, artifact capacity, and launch offer still fail.
- Treating architecture-first as a reason to weaken artifact proof after build.
- Spending frontier/build budget on same demo-scale or hookless outcomes.
- Launching from clean screenshots, prose QA, or schema validation without actual buyer workflow evidence.

Evidence:

- `archive/flow-006/workflows/FLOW-006.yaml`
- `archive/flow-006/specs/MODEL-006.yaml`
- `archive/flow-006/specs/SCHEMA-006.yaml`
- `archive/flow-006/specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml`
- `docs/FLOW-007.md`
- `workflows/FLOW-007.yaml`
- `templates/product-architecture-contract-template.yaml`
- `templates/build-manifest-template.yaml`
- `templates/actual-artifact-inspection-template.yaml`
- `templates/pre-mortem-failure-analysis-template.yaml`
- `templates/launch-gate-template.yaml`
- `validators/flow-007-validator.mjs`
- `tests/flow-007.test.mjs`

### FLOW-006 Patch - Machine-Checkable JTBD Decision Contract

Date: 2026-06-27

Reason: C-004-001 still failed because it behaved like an inventory status snapshot instead of a replenishment forecasting tracker.

Learning:

- Inventory tracker JTBD is not "show stock status"; it is to enter stock, sales velocity/history, lead time, incoming orders, and SKU rules, then decide what to reorder, when, and how much.
- Reorder point is usually derived from demand during lead time plus safety stock.
- Lead time and sales velocity must drive replenishment logic.
- Static `Healthy/Reorder/Out of stock` labels are not enough.
- QA must validate the buyer decision, not only formula mechanics.

Changed:

- FLOW-006 required a machine-checkable product contract before build.
- Contract must define primary buyer decision, required inputs/outputs, input-output map, domain failure modes, acceptance scenarios, and JTBD truth table tests.
- Missing decision outputs now block launch.
- Benchmark adequacy was tightened when purchased competitors are broken/unrepresentative.

Prevents:

- Treating feature presence, dashboards, counts, or prose as a KPP.
- Passing a product that cannot answer the buyer's core decision.

Evidence:

- OpenClaw memory `memory/2026-06-27.md`
- `records/propagation_system_spec/PSS-C-004-001.yaml`

### FLOW-006 Patch - Buyer Behavior Contract And Adversarial Scenarios

Date: 2026-06-28

Reason: After more inspection, the deeper failure was that FLOW-006 translated feedback into checklist gates rather than adversarial buyer scenarios. The product could pass formula-output gates while still failing the real buyer behavior.

Learning:

- Finished propagation system = buyer behavior -> required inputs -> transformations -> decision outputs -> understandable next action.
- JTBD must be a behavior loop, not a product category, output list, or promise sentence.
- Inputs exist only because buyer behavior requires them.
- Transformations exist only to convert inputs into decision outputs.
- Outputs must map to a next action.
- Domain invariants must prevent impossible or bad business states from being labeled healthy, successful, or no action.
- Working capacity should include small demo examples plus blank formula-ready rows, not fully pre-populated fake data.
- QA must mutate real artifact copies and compare recalculated before/after outputs.

Changed:

- Added buyer behavior contract, next-action map, domain invariants, adversarial buyer scenarios, demo-vs-working-capacity policy, executable scenario mutation tests, and blind buyer walkthrough gates.
- Updated FLOW-006 workflow, schema, model rules, BLS, founder corpus, dispatch, validator, and tests.

Prevents:

- Defining JTBD as a promise/output while missing the behavior that should generate the product.
- Passing products that work only as formula showcases.
- Labeling no-sales stock, negative inventory, or other domain failures as healthy/no action.

Evidence:

- OpenClaw memory `memory/2026-06-28.md`
- `archive/flow-006/workflows/FLOW-006.yaml`
- `archive/flow-006/specs/SCHEMA-006.yaml`
- `archive/flow-006/specs/MODEL-006.yaml`
- `archive/flow-006/specs/BLS-006.yaml`
- `archive/flow-006/specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml`
- `archive/flow-006/governance/09_stage_dispatch_006.yaml`

### FLOW-006 Patch - Inventory Replenishment Logic And Helper Scenario

Date: 2026-06-28

Reason: `C-004-001-R2` reached local delivery launch and failed human product inspection with mostly the same core product mistakes: negative on-hand inventory, manual reorder point input beside lead-time/sales inputs, fully populated generated rows, and unclear helper behavior. The pre-mortem did not catch these blockers.

Learning:

- Inventory replenishment products must derive reorder point from demand during lead time plus buffer/safety stock unless explicit category evidence proves a manual override is expected.
- Negative on-hand is a domain invariant failure; it cannot appear healthy, successful, no-action, or publishable.
- Buyer capacity should not be filled with fake generated data. Keep only a few seed rows, then leave the rest blank but formula-ready.
- The helper must be a step-by-step behavior scenario from first open through inputs, transformations, outputs, and next action.
- Pre-mortem must inspect product logic and onboarding against company memory and founder corpus, not only listing/watchlist risks.

Changed:

- Added explicit FLOW-006 actions, gates, schema fields, model fail rules, BLS tracking, founder corpus patterns, validator assertions, and tests for derived reorder point, negative on-hand handling, blank formula-ready capacity, helper behavior scenario, and product-logic pre-mortem audit.
- Marked `C-004-001-R2` as `failed_assets_status` and moved the active repair point back to `05_one_promise_propagation_system_spec`.

Prevents:

- Passing an inventory tracker that is a stock-status/demo workbook instead of a replenishment decision tool.
- Publishing workbooks where records pass while product logic and first-use behavior still fail founder inspection.

Evidence:

- OpenClaw memory `memory/2026-06-28.md`
- `records/candidates/R-004.yaml`
- `records/validation/FA-C-004-001-R2.yaml`
- `records/validation/PM-C-004-001-R2.yaml`
- `records/validation/LR-C-004-001-R2.yaml`
- `archive/flow-006/docs/FLOW-006-C004-RERUN-HANDOFF.md`
- `validators/flow-006-validator.mjs`
- `tests/flow-006.test.mjs`

### FLOW-006 Patch - Pre-Launch Failure Analysis

Date: 2026-06-28

Reason: Founder acceptance asks whether the artifact feels publishable, but it does not fully ask why the complete offer might still fail commercially after launch. The missing layer was an adversarial pre-launch analysis over the assembled product, listing, delivery, market evidence, competitor inspection, and company memory.

Learning:

- A product can work while the listing promise is weak or misaligned.
- A listing can look attractive while promising the wrong job.
- Product, listing, and delivery can each be acceptable separately but fail to propagate one buyer-visible promise.
- Pre-launch commercial failure analysis must be evidence-bound, not another invitation to invent product scope.
- If a proposed feature is not proven by locked buyer behavior/JTBD or marketplace evidence, it is feature bloat, not a blocker.

Changed:

- Added FLOW-006 step `11b_pre_mortem_failure_analysis` after `11_listing_quality_gate` and before `12_delivery_launch`.
- Required the step to produce the top three likely failure modes, evidence, category, blocker/watchlist status, rerun-from-step for blockers, and post-launch signal for watchlist risks.
- Updated schema, model routing, BLS, dispatch, budget, dashboard timeline, validator, and tests.

Prevents:

- Publishing an offer that passes product QA and listing quality separately but is commercially forgettable, confusing, mispromised, under-trusted, or misfit against shelf evidence.
- Blocking launch from speculative feature ideas that are not supported by buyer behavior or marketplace evidence.

Evidence:

- `archive/flow-006/workflows/FLOW-006.yaml`
- `archive/flow-006/specs/SCHEMA-006.yaml`
- `archive/flow-006/specs/MODEL-006.yaml`
- `archive/flow-006/specs/BLS-006.yaml`
- `archive/flow-006/governance/08_product_generation_budget_006.yaml`
- `archive/flow-006/governance/09_stage_dispatch_006.yaml`
- `validators/flow-006-validator.mjs`
- `tests/flow-006.test.mjs`

### FLOW-006 Patch - Artifact Enforcement For C-004

Date: 2026-06-28

Reason: Analysis of all C-004 records showed the right standard existed in governance and human-review notes, but the workbook generator still shipped the rejected product model. Records could pass by checking formula presence, row counts, and claim maps while the actual artifact still exposed manual reorder point input, allowed negative stock data into normal recommendation flow, filled working capacity with fake rows, and used helper text that did not fully walk the buyer behavior.

Learning:

- Product standards must be executable artifact checks, not only YAML gates.
- The build script must consume the product contract directly; record wording cannot compensate for a mismatched generator.
- QA must fail on forbidden artifact states, not just on missing formulas or missing surfaces.
- Founder/pre-mortem/launch records must not allow contradictory states such as `founder_acceptance_status: fail` with `publish_blockers: pass`.

Changed:

- Repaired the C-004 workbook generator to derive reorder point from velocity, lead time, and safety stock; block negative stock data with `Fix stock data` / `Review stock data`; leave non-seed capacity blank but formula-ready; and rewrite onboarding around the buyer behavior scenario.
- Added deterministic workbook validation in `validators/c004_artifact_validator.py`.
- Wired the artifact validator and C-004 record consistency checks into the now-archived FLOW-006 validator.
- Updated C-004 R2 records through local launch as `pass_pending_marketplace_publish`; external marketplace publish remains pending human approval and not run.

Prevents:

- Passing a product because records claim compliance while the artifact still violates founder standards.
- Publishing an inventory tracker that is a populated demo workbook instead of a buyer-usable replenishment planner.
- Letting post-hoc human rejection coexist with passing publish-blocker fields.

Evidence:

- `validators/c004_artifact_validator.py`
- `archive/candidates/C-004-001/C-004-001-FAILED/process/build_inventory_tracker.py`
- `records/validation/QA-C-004-001-R2.yaml`
- `records/validation/FA-C-004-001-R2.yaml`
- `records/validation/PM-C-004-001-R2.yaml`
- `records/validation/LR-C-004-001-R2.yaml`
- `records/flow_step_changes/2026-06-28T14-20-00Z-R-004-011-r2-repair-05-to-12.yaml`
- `tests/flow-006.test.mjs`

### FLOW-007 Patch - Pre-Run Company Memory And Findings Ledger

Date: 2026-06-29

Reason: C-005 showed that company memory can contain the right lessons while a new FLOW-007 run still consumes them too late or too vaguely. Company memory was referenced by the flow and pre-mortem, but not forced into a run-specific preflight before market evidence, purchase approval, model calls, or build work.

Learning:

- Company memory must be operational input before the run starts, not only late-stage review context.
- Durable lessons need to become typed findings with owner gates.
- Build findings and governance findings are different failure classes.
- Build findings must not be closed by governance wording, and governance findings must not be closed by generating a cleaner artifact.
- Open applicable findings must be carried forward to the gate that can actually close or block them.

Changed:

- Added a FLOW-007 `pre_run` contract requiring company-memory preflight before `00_market_evidence`.
- Added `templates/company-memory-preflight-template.yaml` and `templates/findings-ledger-template.yaml`.
- Added schema fields, BLS tracking, governance rules, workflow gates, PAC/build/readiness/artifact/launch refs, validator assertions, and tests for the preflight/findings chain.
- Strengthened `governance/product_lane_exclusions.yaml` so FLOW-007 pre-run must check excluded lanes before market evidence.
- Added `inventory_tracker_reorder_workbook` as an excluded failed-product-assets lane covering `C-004-001` and `C-005-001`, including their failed workbook assets and keyword terms such as inventory tracker, stock tracker, reorder planner, and replenishment planner.
- Added explicit failed-product labels `C-004-FAILED` and `C-005-FAILED` under `records/failed_product_labels/`, plus a reusable failed-product-label template. These labels are clean future-build inputs: they may be used as failed baselines, anti-clone inputs, exclusion evidence, and company-memory finding sources, but not as product blueprints or build seeds.
- Moved failed C-004/C-005 build directories out of live `builds/` into `archive/candidates/.../*-FAILED/`, and updated active labels, exclusions, validators, tests, and handoff docs to point at the archive locations.

Prevents:

- Starting a new run while forgetting prior expensive lessons.
- Treating company memory as background reading instead of a hard pre-run control.
- Closing product/build problems with prettier governance records.
- Closing flow/governance problems with another generated artifact.
- Re-entering the C-004/C-005 inventory/reorder workbook lane under a new candidate ID, renamed product thesis, or newer flow wrapper without explicit human reopen approval.
- Future runs inferring failure state from scattered manifests, launch records, or chat memory instead of reading a canonical failed-product label.
- Failed products remaining in live `builds/` where later agents could accidentally treat them as active product blueprints or benchmark candidates.

Evidence:

- `docs/COMPANY-MEMORY.md`
- `workflows/FLOW-007.yaml`
- `specs/SCHEMA-007.yaml`
- `specs/BLS-007.yaml`
- `governance/05_governance_rules.yaml`
- `governance/product_lane_exclusions.yaml`
- `records/failed_product_labels/C-004-FAILED.yaml`
- `records/failed_product_labels/C-005-FAILED.yaml`
- `archive/candidates/C-004-001/C-004-001-FAILED/`
- `archive/candidates/C-004-001/C-004-001-R2-FAILED/`
- `archive/candidates/C-005-001/C-005-001-FAILED/`
- `templates/failed-product-label-template.yaml`
- `templates/company-memory-preflight-template.yaml`
- `templates/findings-ledger-template.yaml`
- `validators/flow-007-validator.mjs`
- `tests/flow-007.test.mjs`

## C-010-001 Rejection and Lane Exclusions (2026-06-30)

Andrey rejected C-010-001 (Handyman Quote Readiness Planner) before Etsy publish. The build passed FLOW-007 QA and reached READY_TO_PUBLISH, but was not launched. Total spend: $3 competitor purchase + $17 build API = $20.

Actions taken:
- `records/failed_product_labels/C-010-FAILED.yaml` created with `ACTIVE_FAILED_LABEL` status.
- `builds/C-010-001` moved to `archive/candidates/C-010-001/C-010-001-REJECTED`.
- Three product lanes are now fully excluded from future FLOW-007 pre-runs and candidate admission:
  - `handyman_estimate_quote_workbook` (C-010-001 — rejected before publish)
  - `budget_planner_spreadsheet` (C-003-001 — activated to full exclusion by human decision)
  - `meal_planner_spreadsheet` (C-001-001, C-002-001 — already excluded)
- Dashboard updated: C-010-001 moved to `rejectedCandidates`, $20 cost recorded.

Do not generate handyman estimate, repair quote, scope-to-estimate, or contractor bid workbook variants unless Andrey explicitly reopens the lane.

Evidence:
- `records/failed_product_labels/C-010-FAILED.yaml`
- `archive/candidates/C-010-001/C-010-001-REJECTED/`
- `governance/product_lane_exclusions.yaml`
- `records/dashboard_state.yaml`

## Open Backfill Items

- Reconstruct FLOW-003 reason from older history or records.
- Reconstruct FLOW-001 to FLOW-002 transition from repository evidence if older commits become available.
- Add future flow or governance changes here at the same time as the code/spec patch.
