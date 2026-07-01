# FLOW-007 Principle

Current active revision: `FLOW-007-001`

Do not build digital products from market ideas, category names, plausible feature lists, or post-mortem hypotheses.

Build only after a Product Architecture Contract proves:

- who the product is for
- what the product actually is, versus the market category label
- what real buyer behavior it supports
- what the market/category standard is
- what the real-world domain model is
- what decision outputs must exist
- what executable buyer scenarios must pass through the product

FLOW-006 improved acceptance, QA, artifact inspection, listing gates, cost accountability, and founder-style rejection. It still allowed C-004-001 to be rebuilt around an under-specified inventory product idea. FLOW-007 moves the decisive lock before product generation.

The product direction itself must be market-derived before architecture starts. A failure post-mortem can seed research terms, but it cannot pre-lock the product that FLOW-007 is supposed to prove.

## Sequence

Market Evidence
-> Public Shelf Read
-> Competitor Selection/Purchase Approval
-> Purchased Competitor Inspection
-> Product Identity Reframe
-> Product Architecture Contract
-> Scenario Matrix
-> Workbook/Product Blueprint
-> Build Readiness Review
-> Pre-Build Architecture Premortem
-> Product Build
-> Real Artifact Inspection
-> Blind Buyer Walkthrough
-> Listing/Packaging QA
-> Pre-Mortem Failure Analysis
-> Founder Launch Gate

## Hard Build Rule

Only candidates with `build_readiness.status = BUILD_READY` may enter product generation.

`NOT_BUILD_READY` is not a repair prompt for the artifact. It returns to Product Architecture Contract, benchmark evidence, or scenario definition.

Serious failures are not closed by rerunning the same lane. They trigger `LEARN-001`, which must convert the failure into intake, post-mortem, findings, flow patches, regression replay, and an active company-memory guard before the same failed case may try again.

Major contract revisions inside the family are tracked separately. The current in-family hardening is [FLOW-007-001](./FLOW-007-001.md).

## Failed Baseline / Anti-Clone Rule

When a new candidate, rerun, repair, or pilot uses a prior failed artifact as evidence, the prior artifact must be treated as a measured failure baseline, not as an implicit product blueprint.

Before build readiness, the Product Architecture Contract must identify every relevant failed baseline and state the material product delta required to justify a new build. The delta must cover buyer behavior, domain model, decision outputs, scenario coverage, working capacity, onboarding/help behavior, listing promise, and demo seed behavior where applicable.

Build readiness must be `NOT_BUILD_READY` if the contract mostly restates the failed artifact with cleaner wording, renamed governance, or the same product surface without a market-proven reason.

Actual Artifact Inspection must compare the shipped artifact against the failed baseline using measured evidence, not record claims. For spreadsheet products this includes sheet list, visible dimensions, formula count/ranges, editable ranges, seed data dates, working-capacity rows, decision-output locations, warning states, and a first-open behavior demo.

Launch cannot pass if the new artifact is a structural clone, behavior clone, or same buyer-facing outcome after paid work, unless the prior artifact was already launch-worthy and the new run is explicitly a packaging-only release. FLOW-007 pilots may not use that exception.

## Pre-Architecture Market Rules

- Start from a category or market thesis, not a locked product direction.
- Market evidence must identify category demand, price range, top products, buyer language, promises, review pain points, visible feature standards, sophistication level, weak spots, and the most credible product opportunity.
- Public shelf read must collect listing/gallery evidence before purchase selection.
- Select exactly one competitor from the evidence-backed market set by match tier, market strength, product surface completeness, gallery evidence, then price/friction.
- Do not select by lowest price, easiest live result, or fit to a prelocked hypothesis.
- If the purchased competitor is formula-broken, inaccessible, unrepresentative, or missing core benchmark surfaces, request exactly one replacement purchase or equivalent benchmark evidence.
- Target audience, use cases, domain model, decision outputs, and scenario logic must come from market evidence plus purchased competitor inspection.

## Architecture Rules

- Target audience must be locked before build.
- Target audience must name the buyer's real-world decision objective, not only a nearby sub-metric or generic job label.
- Buyer behavior must name the buyer situation, inputs, transformation, decision output, next action, and repeated usage loop.
- If the product cannot name the buyer's primary decision or outcome, it is `NOT_BUILD_READY`.
- Domain model must separate static reference data, dated events, change history, calculated state, and dashboards/views.
- If a real-world value changes over time and affects future decisions, the product must not model it only as an overwritten static field. It must be represented as a dated event or dated settings change where appropriate.
- Domain evidence must distinguish intermediate metrics from terminal decision metrics.
- If evidence implies a higher real-world decision layer, the product cannot stop at an intermediate metric and still be considered complete.
- Promised decision outputs must be supported by the domain model.
- Decision outputs must reach the buyer's real decision layer when domain evidence says that layer is required.
- Scenario Matrix must pass before build.
- Product Architecture Contract must define machine-checkable output locations, formula/logic sources, next-action map, domain invariants, setup-input propagation, working-capacity requirements, and helper behavior scenario before build.
- Artifact QA must execute buyer behavior and adversarial mutations on the actual artifact, not only inspect formula presence or records.
- Launch cannot pass until a pre-mortem assumes failure and finds no specific preventable launch blockers.

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

Cost/outcome accountability is a launch requirement. A paid rerun that produces the same demo-scale product, same hookless listing, or same founder-rejected outcome cannot pass launch by updating records alone.

## Post-Failure Closure

`FLOW-007` now has a mandatory post-failure hook:

- `on_failure -> LEARN-001`
- failure intake is required
- serious failures require a post-mortem
- next same-lane runs are blocked until learning closure exists

Architecture, governance, model-routing, validator, template, schema, and memory failures are company-control failures first. Patch the control, replay the failed case without rebuilding when possible, merge the proven rule into company memory, then let pre-run memory guards police the next attempt.

## FLOW-007-001

`FLOW-007-001` hardens the family against process-success illusions:

- a candidate may become stronger after intervention
- but the flow still fails if it did not derive the right terminal decision layer from evidence

The flow now treats real-world decision-layer underfit as a first-class architecture blocker rather than as optional polish.
