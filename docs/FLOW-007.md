# FLOW-007 Principle

Do not build digital products from market ideas, category names, or plausible feature lists.

Build only after a Product Architecture Contract proves:

- who the product is for
- what real buyer behavior it supports
- what the market/category standard is
- what the real-world domain model is
- what decision outputs must exist
- how real buyer scenarios pass through the product

FLOW-006 improved acceptance, QA, artifact inspection, listing gates, cost accountability, and founder-style rejection. It still allowed C-004-001 to be rebuilt around an under-specified inventory product idea. FLOW-007 moves the decisive lock before product generation.

## Sequence

Market Evidence
-> Competitor Product Autopsy
-> Product Architecture Contract
-> Scenario Matrix
-> Build Readiness Review
-> Product Build
-> Real Artifact Inspection
-> Blind Buyer Walkthrough
-> Listing/Packaging QA
-> Founder Launch Gate

## Hard Build Rule

Only candidates with `build_readiness.status = BUILD_READY` may enter product generation.

`NOT_BUILD_READY` is not a repair prompt for the artifact. It returns to Product Architecture Contract, benchmark evidence, or scenario definition.

## Architecture Rules

- Target audience must be locked before build.
- Buyer behavior must name the buyer situation, inputs, transformation, decision output, next action, and repeated usage loop.
- If the product cannot name the buyer's primary decision or outcome, it is `NOT_BUILD_READY`.
- Domain model must separate static reference data, dated events, change history, calculated state, and dashboards/views.
- If a real-world value changes over time and affects future decisions, the product must not model it only as an overwritten static field. It must be represented as a dated event or dated settings change where appropriate.
- Promised decision outputs must be supported by the domain model.
- Scenario Matrix must pass before build.

## C-004 Canonical Domain Example

For an inventory replenishment workbook, Opening Stock must not be treated as a static SKU field. Stock is a dated physical state changed by sales, purchases/receipts, adjustments, and later counts.

The required buyer decision is:

"When should I reorder each SKU, and how much should I buy?"

Required outputs include:

- on hand
- incoming stock
- sales velocity
- days of cover
- projected stockout date
- reorder-by date
- suggested order quantity
- confidence level
- next action

## Cost Rule

Repeated similar artifact regeneration is forbidden. Stronger model escalation belongs before build-readiness approval, not after repeated failed rebuilds.

No paid rebuild may start unless the Product Architecture Contract changed materially. One implementation repair loop is allowed after build. If the product fails again after implementation repair, stop or escalate.
