# Company Memory

This is the durable BeatsPerfect memory for why company rules, flows, schemas, and gates changed.

It is not a changelog of every file edit. It records the business reason, the failure that caused the change, the rule learned, and the consequence for future runs.

## Memory Rule

Every material governance or flow change must add an entry here before the change is considered complete.

Each entry should answer:

- What failed or changed?
- What did we learn?
- Which rule, flow, schema, model, budget, dashboard, or validator changed?
- Which future failure should this prevent?
- Where is the evidence?

Do not replace candidate records, validation records, or the technical changelog with this file. Those records prove what happened in one run. This file preserves why the company changed its operating rules.

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
- `workflows/FLOW-004.yaml`
- `specs/SCHEMA-004.yaml`
- `specs/MODEL-004.yaml`

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
- `workflows/FLOW-006.yaml`
- `specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml`
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
- `docs/FLOW-006-C004-RERUN-HANDOFF.md`
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

- Created FLOW-007 with Market Evidence -> Competitor Product Autopsy -> Product Architecture Contract -> Scenario Matrix -> Build Readiness Review before product build.
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
- `workflows/FLOW-006.yaml`
- `specs/SCHEMA-006.yaml`
- `specs/MODEL-006.yaml`
- `specs/BLS-006.yaml`
- `specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml`
- `governance/09_stage_dispatch_006.yaml`

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
- `docs/FLOW-006-C004-RERUN-HANDOFF.md`
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

- `workflows/FLOW-006.yaml`
- `specs/SCHEMA-006.yaml`
- `specs/MODEL-006.yaml`
- `specs/BLS-006.yaml`
- `governance/08_product_generation_budget_006.yaml`
- `governance/09_stage_dispatch_006.yaml`
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
- Wired the artifact validator and C-004 record consistency checks into `validate:flow-006`.
- Updated C-004 R2 records through local launch as `pass_pending_marketplace_publish`; external marketplace publish remains pending human approval and not run.

Prevents:

- Passing a product because records claim compliance while the artifact still violates founder standards.
- Publishing an inventory tracker that is a populated demo workbook instead of a buyer-usable replenishment planner.
- Letting post-hoc human rejection coexist with passing publish-blocker fields.

Evidence:

- `validators/c004_artifact_validator.py`
- `builds/C-004-001/process/build_inventory_tracker.py`
- `records/validation/QA-C-004-001-R2.yaml`
- `records/validation/FA-C-004-001-R2.yaml`
- `records/validation/PM-C-004-001-R2.yaml`
- `records/validation/LR-C-004-001-R2.yaml`
- `records/flow_step_changes/2026-06-28T14-20-00Z-R-004-011-r2-repair-05-to-12.yaml`
- `tests/flow-006.test.mjs`

## Open Backfill Items

- Reconstruct FLOW-003 reason from older history or records.
- Reconstruct FLOW-001 to FLOW-002 transition from repository evidence if older commits become available.
- Add future flow or governance changes here at the same time as the code/spec patch.
