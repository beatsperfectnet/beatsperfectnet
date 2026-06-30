# FLOW-006 C-004-001 Rerun Handoff

Date: 2026-06-26
Candidate: `C-004-001`
Active attempt: `C-004-001-R2`
Product lane: Inventory tracker spreadsheet for small-business stock, purchases, sales, reorder alerts, pricing, and saved price snapshots.
Active flow: `FLOW-006`

## Current State

`C-004-001` passed market/category admission. The prior downstream build attempts are quarantined as failed active inputs.

The clean `C-004-001-R2` rerun reached `12_delivery_launch`, then failed human product inspection.
The failed R2 artifacts have been moved out of live `builds/` and into `archive/candidates/C-004-001/C-004-001-R2-FAILED/` as failed evidence, not publish-ready assets.

Do not publish.
Do not publish unless Andrey explicitly approves external marketplace publishing.

The active source record now points to `C-004-001-R2` at `05_one_promise_propagation_system_spec` with `failed_assets_status`. Prior downstream records and artifacts are preserved only as failed baseline evidence under:

`archive/candidates/C-004-001/failed-attempt-2026-06-28-pre-r2`

Baseline guardrail:

`records/failed_artifact_baselines/BAS-C-004-001-R1.yaml`

## Why The Current R2 Product Failed

The workbook is still not a real replenishment planner humans should use.

Specific failure:
- `On Hand` can be negative or is shown negative in buyer-visible inventory.
- `Reorder Point` is exposed as a buyer input while lead time/sales velocity inputs exist; for this product it must be derived from demand during lead time plus buffer/safety stock.
- Working capacity rows are populated with generated sample data instead of only a few seed examples plus blank formula-ready rows for buyer use.
- Start Here/helper behavior is unclear; it does not walk the buyer step by step from inputs through transformations, results, and next action.
- The pre-mortem, QA, and founder gates missed these blockers.

## What Was Fixed In FLOW-006 After The R2 Failure

The next run must satisfy the previous gates plus the new inventory-specific gates:
- negative on-hand must block or clearly flag review before any healthy/no-action/publishable state.
- reorder point must be derived from lead time, sales velocity/history, and buffer/safety stock unless explicit market/category evidence justifies manual override.
- non-seed capacity must be blank but formula-ready after a few demo rows.
- Start Here/helper must be a concrete behavior scenario: first open, inputs, transformations, outputs, and next action.
- pre-mortem must audit these product-logic blockers against company memory and founder corpus before launch can pass.

Relevant files:
- `workflows/FLOW-006.yaml`
- `specs/SCHEMA-006.yaml`
- `specs/MODEL-006.yaml`
- `specs/BLS-006.yaml`
- `specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml`
- `governance/08_product_generation_budget_006.yaml`
- `governance/09_stage_dispatch_006.yaml`

## Failed R2 Path

R2 was restarted from:

`04_alignment_synthesis`

Reason: admission, market research, public shelf read, purchase, and hidden inspection are usable. The prior alignment/spec/build/QA/founder/listing/launch chain must not be reused as active input after the FLOW-006 behavior-contract and pre-mortem changes.

R2 ran forward through:

`04 -> 05 -> 06 -> 07 -> 08 -> 10 -> 11 -> 11b -> 12`

`09_optional_supporting_feature_pass` was skipped because QA/founder acceptance did not require an additional feature pass.

Fresh R2 outputs now classified as failed evidence:
- `records/alignment_chain/AC-C-004-001-R2.yaml`
- `records/propagation_system_spec/PSS-C-004-001-R2.yaml`
- `archive/candidates/C-004-001/C-004-001-R2-FAILED/manifest.yaml`
- `records/validation/QA-C-004-001-R2.yaml`
- `records/validation/FA-C-004-001-R2.yaml`
- `records/listing_hook/LH-C-004-001-R2.yaml`
- `records/listing_creatives/LC-C-004-001-R2.yaml`
- `records/validation/LQ-C-004-001-R2.yaml`
- `records/validation/PM-C-004-001-R2.yaml`
- `records/validation/LR-C-004-001-R2.yaml`

Stop before marketplace publishing. The next repair starts from `05_one_promise_propagation_system_spec`, not publishing.

## Non-Negotiable Product Requirements

The next product must not be a 12-row demo.

Before building, define a visible capacity floor in `PSS-C-004-001.yaml`.
Use a stronger floor if market evidence supports it, but do not go below:
- Inventory: at least 100 buyer-usable SKU/item rows.
- Purchases: at least 300 buyer-usable purchase rows.
- Sales: at least 500 buyer-usable sales rows.
- Price Calculator: at least 100 buyer-usable test rows or a clearly reusable calculator workflow.
- Price List: at least 100 saved price snapshot rows.

The workbook should use real expandable table/range behavior where practical. If a capacity limit is fixed, it must be visible, useful, and honest in the product and delivery copy.

The build manifest and QA must record:
- prior failed visible row counts
- new visible row counts
- material delta summary
- formula range coverage
- editable range coverage
- mutation tests beyond the first seeded rows
- proof that capacity is buyer-usable, not hidden-only

## Non-Negotiable Listing Requirements

Each final listing image needs a specific hook, not just a clean template plus screenshot.

For every image, record:
- one buyer promise
- one visible grid-stop reason
- one product-specific reason to believe
- proof surface from the actual workbook
- how this image is stronger than the prior hookless asset

Do not treat screenshot presence as a hook.
Do not reuse the same visual hierarchy across all images unless each image has a distinct stop reason.

## Cost/Outcome Rule

If the rerun spends material budget and the workbook is still demo-scale, stop immediately and record a failed iteration.

If the product is fixed but listing hooks are weak, do not publish. Rerun listing from step `10_listing_creative_assembly`.

## Verification Commands

Run before final handoff:

```bash
npm run dashboard:update
npm run validate:flow-006
npm run test:flow-006
npm run build
```

## Dashboard/Accounting Context

As of the latest dashboard update:
- Today total API spend: `$29`
- Product API: `$16`
- Governance API: `$13`
- Human escalations: `5`

Latest related commits:
- `c230eec Tighten founder acceptance rejection corpus`
- `6b5eb5a Harden FLOW-006 artifact outcome gates`
- `d696bf1 Update dashboard costs and escalations`

## Suggested First Action In Next Thread

Restart `C-004-001-R2` repair from `05_one_promise_propagation_system_spec`. The new PSS must explicitly specify derived reorder point logic, negative on-hand handling, blank formula-ready capacity, and the helper behavior scenario before any rebuild.
