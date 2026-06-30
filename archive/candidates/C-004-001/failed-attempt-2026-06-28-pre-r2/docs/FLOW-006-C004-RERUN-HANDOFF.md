# FLOW-006 C-004-001 Rerun Handoff

Date: 2026-06-26
Candidate: `C-004-001`
Product lane: Inventory tracker spreadsheet for small-business stock, purchases, sales, reorder alerts, pricing, and saved price snapshots.
Active flow: `FLOW-006`

## Current State

`C-004-001` passed market/category admission, but the product outcome failed founder review.

Do not publish.
Do not continue from the current `12_delivery_launch` record as if it is valid.

The current dashboard still shows `C-004-001` at `12_delivery_launch`, but that is a pre-rerun accounting/dashboard state, not a publish approval.

## Why The Current Product Failed

The workbook is still a good-enough demo, not a real workbook humans will use.

Specific failure:
- Inventory visible rows are effectively unchanged from the prior version.
- Purchases and Sales visible rows are effectively unchanged from the prior version.
- Pricing and Price List capacity is still visibly tiny.
- Regenerating timestamps did not create a material product improvement.
- Listing assets are clean enough visually, but each image lacks a real grid-stopping hook.
- The prior FLOW-006 run spent product/governance budget while producing substantially the same outcome.

## What Was Fixed In FLOW-006 After The Failure

FLOW-006 was hardened in commit `6b5eb5a Harden FLOW-006 artifact outcome gates`.

The next run must satisfy these new gates:
- visible human-scale capacity
- material artifact delta versus the prior failed version
- direct artifact inspection, not record-only pass
- per-image real listing hook with a grid-stop reason
- hook delta versus prior hookless assets
- cost/outcome accountability for paid reruns

Relevant files:
- `workflows/FLOW-006.yaml`
- `specs/SCHEMA-006.yaml`
- `specs/MODEL-006.yaml`
- `specs/BLS-006.yaml`
- `specs/FOUNDER-ACCEPTANCE-CORPUS-001.yaml`
- `governance/08_product_generation_budget_006.yaml`
- `governance/09_stage_dispatch_006.yaml`

## Recommended Restart Point

Restart from:

`05_one_promise_propagation_system_spec`

Reason: admission, market research, public shelf read, purchase, hidden inspection, and alignment are usable. The failure is in the product specification/build/QA/founder/listing chain.

Run forward through:

`05 -> 06 -> 07 -> 08 -> 10 -> 11 -> 12`

Skip `09_optional_supporting_feature_pass` unless a single supporting feature is genuinely necessary after QA passes.

Stop before marketplace publishing.

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

Open and compare:
- `builds/C-004-001/process/build_inventory_tracker.py`
- `builds/C-004-001/manifest.yaml`
- `records/propagation_system_spec/PSS-C-004-001.yaml`
- `records/validation/QA-C-004-001.yaml`
- `records/validation/FA-C-004-001.yaml`
- `records/listing_creatives/LC-C-004-001.yaml`
- `records/validation/LQ-C-004-001.yaml`

Then create the new propagation spec requirements and rebuild from step `05`.
