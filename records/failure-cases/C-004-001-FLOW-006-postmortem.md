# C-004-001 FLOW-006 Failure Case

Status: FLOW_006_FAILURE_CASE

Candidate: C-004-001

Failed flow: FLOW-006

Current artifact: `builds/C-004-001/product/Inventory-Tracker-Studio.xlsx`

## Root Cause

FLOW-006 allowed artifact generation before the product had a locked buyer-behavior and domain-model contract.

The current `Inventory-Tracker-Studio.xlsx` must be treated as a FLOW-006 failure case, not as a product to patch immediately.

## Lessons

- Market signal was real but insufficient.
- Target audience was underdefined.
- Competitor analysis was shallow.
- Inventory was modeled as a static snapshot instead of dated events.
- Opening Stock as a static SKU field was architecturally wrong.
- QA came too late.
- Repeated rebuilds hardened symptoms instead of preventing the root cause.

## Prevention Rule

FLOW-007 requires Product Architecture Contract and Scenario Matrix pass before build. C-004-style inventory replenishment products must model stock as dated physical state changed by counts, sales, purchases/receipts, adjustments, and later counts.

## Build Readiness Outcome Under FLOW-007

`build_readiness.status = NOT_BUILD_READY`

No product rebuild was performed for this failure-case record.
