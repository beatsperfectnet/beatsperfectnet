# Changelog

## FLOW-004

- Major flow version bump for BeatsPerfect spreadsheet-template products.
- Adds mandatory external competitor purchase approval and spend control before final specs.
- Adds private purchased-asset handling and purchased competitor inspection before Listing, Product, Delivery, and GEH specs.
- Adds competitor stress inspection, inspection-to-spec traceability, spreadsheet resilience QA, and support-by-design QA.
- Reorders the pre-build specification sequence so Listing Spec is created before Product Spec and Good Enough for Humans remains pre-build.
- Preserves the output architecture as Listing + Product + Delivery and does not introduce a fourth package abstraction.
- Adds fixed functional mandates for reasoning-heavy stages.
- Adds one Medium-owned candidate domain brief stage.
- Adds domain-consideration traceability and bounded domain correctness reasoning.
- Explicitly prevents domain-driven feature bloat.
- Adds domain-derived GEH and QA checks.
- Does not create role-based agents.
- Market evidence determines what to offer.
- Domain expertise determines how to implement and test the evidence-backed offer correctly.

- Updates FLOW-004 model policy to use canonical model IDs instead of the gpt-5-mini alias.
- Makes GPT-5.5 the quality owner for purchased competitor inspection, final specs, core build, buyer-facing listing assets, QA, and launch review.
- Adds versioned pricing and generation-budget contracts with deterministic shared-cost allocation and a protected QA/fix reserve.
- Separates competitor purchase spend from generation budget accounting.
- Adds budget preflight, budget-pass telemetry, and launch blocking on budget failure.
- Documents that GPT-5.5 Pro is disabled for the normal FLOW-004 path.
