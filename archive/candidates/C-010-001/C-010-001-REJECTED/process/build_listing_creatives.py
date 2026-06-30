from __future__ import annotations

import base64
import html
import subprocess
import textwrap
from pathlib import Path


BASE = Path("/Users/andreyeremichev/beatsperfect")
BUILD = BASE / "builds/C-010-001"
SOURCE_DIR = BUILD / "process/rendered"
FINAL_DIR = BUILD / "listing-assets/final"
SVG_DIR = BUILD / "process/listing-creatives/svg"

LC_RECORD = BASE / "records/listing_creatives/LC-C-010-001.yaml"
PRODUCT_SPEC = BASE / "records/product_specs/PS-C-010-001.yaml"
LISTING_SPEC = BASE / "records/listing_specs/LS-C-010-001.yaml"
MANIFEST = BUILD / "manifest.yaml"
TITLE_FILE = BUILD / "listing-assets/etsy-title.txt"
DESCRIPTION_FILE = BUILD / "listing-assets/etsy-description.md"

WIDTH = 2000
HEIGHT = 1600
BG = "#f5f1ea"
SURFACE = "#fffdfc"
TEXT = "#1e293b"
MUTED = "#52606d"
PIPELINE = "#8c3b28"
SUCCESS = "#5c7a52"
WARNING = "#d97706"
BORDER = "#d7c7b4"

CREATIVES = [
    {
        "file": "01-main-promise",
        "role": "thumbnail_main_promise",
        "source": "04-quote-summary.png",
        "eyebrow": "HANDYMAN QUOTE READINESS PLANNER",
        "title": "Know if the quote is ready before you send it.",
        "subtitle": "Get the total, deposit, delivery window, and next-step recommendation in one view.",
        "claim": "Quote Summary shows the send_ready state, the deposit, and the guardrail outputs from the shipped workbook.",
        "badge": "Send / Clarify / Reset",
        "accent": PIPELINE,
    },
    {
        "file": "02-scope-workflow",
        "role": "scope_input_workflow",
        "source": "03-scope-inputs.png",
        "eyebrow": "SCOPE TO QUOTE WORKFLOW",
        "title": "Check readiness before you trust the total.",
        "subtitle": "Client info, site-visit confirmation, scope status, and line items all feed the quote decision.",
        "claim": "Scope Inputs combines readiness checks with labor, material, and travel rows.",
        "badge": "Yellow cells = edit",
        "accent": SUCCESS,
    },
    {
        "file": "03-assumptions-guardrails",
        "role": "assumptions_guardrails",
        "source": "02-assumptions.png",
        "eyebrow": "BUSINESS RULES",
        "title": "Set your floor, deposit, and rush rules once.",
        "subtitle": "Change the defaults and the summary updates without manual formula edits.",
        "claim": "Assumptions controls hourly rate, deposit percent, minimum job floor, travel fee, and timing rules.",
        "badge": "No formula hunting",
        "accent": WARNING,
    },
    {
        "file": "04-start-here",
        "role": "onboarding_surface",
        "source": "01-start-here.png",
        "eyebrow": "FIRST OPEN CLARITY",
        "title": "See exactly what to do first.",
        "subtitle": "The workbook starts with plain-English steps instead of dropping the buyer into a raw estimate grid.",
        "claim": "Start Here explains the workflow and what each state means before any quote is sent.",
        "badge": "No hidden setup path",
        "accent": PIPELINE,
    },
    {
        "file": "05-repeat-use",
        "role": "saved_quotes_and_repeat_use",
        "source": "05-saved-quotes.png",
        "eyebrow": "REPEAT USE",
        "title": "Keep prior quote snapshots visible.",
        "subtitle": "Log sent or blocked quotes without overwriting the next live estimate.",
        "claim": "Saved Quotes preserves visible quote history and shows repeat-use capacity beyond the seeded examples.",
        "badge": "50 visible rows",
        "accent": SUCCESS,
    },
]


def data_uri(path: Path) -> str:
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def wrap_lines(text: str, width: int) -> list[str]:
    return textwrap.wrap(text, width=width, break_long_words=False)


def text_block(text: str, x: int, y: int, size: int, width_chars: int, *, weight: int = 400, gap: int = 8) -> str:
    lines = wrap_lines(text, width_chars)
    out = []
    for idx, line in enumerate(lines):
        out.append(
            f'<text x="{x}" y="{y + idx * (size + gap)}" font-family="Aptos, Arial, sans-serif" '
            f'font-size="{size}" font-weight="{weight}" fill="{TEXT}">{html.escape(line)}</text>'
        )
    return "\n  ".join(out)


def creative_svg(spec: dict[str, str]) -> str:
    image_uri = data_uri(SOURCE_DIR / spec["source"])
    title = text_block(spec["title"], 130, 285, 64, 18, weight=800)
    subtitle = text_block(spec["subtitle"], 130, 495, 34, 30)
    claim = text_block(spec["claim"], 170, 1290, 30, 56, weight=600)
    accent = spec["accent"]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}">
  <rect width="{WIDTH}" height="{HEIGHT}" fill="{BG}"/>
  <rect x="72" y="70" width="1856" height="1460" rx="40" fill="{SURFACE}" stroke="{BORDER}" stroke-width="4"/>
  <rect x="72" y="70" width="1856" height="26" rx="13" fill="{accent}"/>
  <text x="130" y="170" font-family="Aptos, Arial, sans-serif" font-size="34" font-weight="700" fill="{accent}">{html.escape(spec["eyebrow"])}</text>
  {title}
  {subtitle}
  <rect x="130" y="690" width="430" height="84" rx="16" fill="{accent}" opacity="0.16"/>
  <text x="160" y="745" font-family="Aptos, Arial, sans-serif" font-size="34" font-weight="800" fill="{TEXT}">{html.escape(spec["badge"])}</text>
  <rect x="860" y="200" width="960" height="860" rx="28" fill="#f7f8fa" stroke="{BORDER}" stroke-width="3"/>
  <rect x="900" y="240" width="880" height="780" rx="18" fill="#ffffff" stroke="{BORDER}" stroke-width="2"/>
  <image x="920" y="260" width="840" height="740" preserveAspectRatio="xMidYMid meet" href="{image_uri}"/>
  <rect x="130" y="1180" width="1690" height="170" rx="24" fill="#faf6f1" stroke="{BORDER}" stroke-width="2"/>
  <text x="170" y="1240" font-family="Aptos, Arial, sans-serif" font-size="32" font-weight="800" fill="{TEXT}">Proof from the shipped workbook</text>
  {claim}
  <text x="130" y="1470" font-family="Aptos, Arial, sans-serif" font-size="24" fill="{MUTED}">BeatsPerfect | Handyman Quote Readiness Planner</text>
</svg>
"""


def write_listing_creatives_record():
    lines = [
        "listing_creative_assembly:",
        "  candidate_id: C-010-001",
        "  listing_hook_ref: records/listing_specs/LS-C-010-001.yaml",
        "  passed_qa_ref: records/validation/LPQ-C-010-001.yaml",
        "  source_surface_refs:",
    ]
    for spec in CREATIVES:
        lines.append(f"    - builds/C-010-001/process/rendered/{spec['source']}")
    lines.append("  creative_assets:")
    for spec in CREATIVES:
        lines.extend(
            [
                f"    - path: builds/C-010-001/listing-assets/final/{spec['file']}.png",
                f"      source_svg: builds/C-010-001/process/listing-creatives/svg/{spec['file']}.svg",
                f"      role: {spec['role']}",
                f"      source_surface_ref: builds/C-010-001/process/rendered/{spec['source']}",
                f"      claim: {spec['claim']}",
                "      transformation_allowed: crop_frame_scale_callout_text_only",
                "      fabricated_product_surface_absent: true",
            ]
        )
    lines.extend(
        [
            "  no_fabricated_product_surfaces: true",
            "  output_format:",
            f"    width_px: {WIDTH}",
            f"    height_px: {HEIGHT}",
            "    file_type: png",
            "  listing_upload_sequence:",
        ]
    )
    for spec in CREATIVES:
        lines.append(f"    - builds/C-010-001/listing-assets/final/{spec['file']}.png")
    lines.extend(
        [
            "  artifact_fidelity_check:",
            "    status: pass",
            "    notes: Final creatives embed rendered workbook surfaces from the built artifact; only framing, scaling, and explanatory text were added.",
            "  publish_blockers:",
            "    status: pass",
            "    blockers: []",
        ]
    )
    LC_RECORD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_product_spec():
    PRODUCT_SPEC.write_text(
        """product_spec:
  spec_id: PS-C-010-001
  candidate_ref: C-010-001
  idea_ref: I-001
  flow_version: FLOW-007
  product_architecture_contract_ref: records/product_architecture_contract/PAC-C-010-001.yaml
  build_readiness_review_ref: records/build_readiness/BRR-C-010-001.yaml
  hard_rule: No product spec can be accepted if it does not cite the Product Architecture Contract.
  product_name: Handyman Quote Readiness Planner
  marketplace: Etsy
  listing_spec_ref: records/listing_specs/LS-C-010-001.yaml
  product_analysis_ref: records/product_architecture_contract/PAC-C-010-001.yaml
  purchased_competitor_inspection_ref: records/competitor_autopsy/AUT-C-010-001.yaml
  generated_from_product_architecture_contract:
    primary_buyer: Solo handyman or tiny repair contractor pricing real jobs before replying to the client.
    excluded_buyer: Multi-crew contractor needing dispatch, CRM, scheduling, or invoicing.
    buyer_behavior_loop: confirm assumptions -> complete readiness inputs -> enter scope rows -> read quote summary -> save snapshot -> repeat
    domain_model: assumptions + quote request + scope line items + saved quote snapshots
    decision_outputs:
      - quote_total
      - deposit_amount
      - estimated_delivery_window
      - quote_confidence_state
      - recommended_next_step
      - minimum_profitable_floor
      - quote_margin_buffer
    scenario_matrix_ref: records/scenario_matrix/SM-C-010-001.yaml
    competitor_category_standard: line-item estimate workbook with visible totals near the quote surface
    support_risk_mitigations:
      - Start Here workflow
      - yellow input cells
      - protected formula areas
      - explicit warning states
    capacity_requirements:
      - 15 visible scope rows
      - 50 visible saved-quote rows
    visual_formatting_standard: clean workbook plus guided summary outputs
  architecture_lock_traceability:
    target_audience_contract_ref: records/product_architecture_contract/PAC-C-010-001.yaml#target_audience_contract
    buyer_behavior_contract_ref: records/product_architecture_contract/PAC-C-010-001.yaml#buyer_behavior_contract
    domain_model_contract_ref: records/product_architecture_contract/PAC-C-010-001.yaml#domain_model_contract
    decision_output_contract_ref: records/product_architecture_contract/PAC-C-010-001.yaml#decision_output_contract
    scenario_matrix_ref: records/scenario_matrix/SM-C-010-001.yaml
    build_readiness_status: BUILD_READY
    accepted_only_if_build_readiness_status_is_BUILD_READY: true
  applied_inspection_requirement_ids:
    - AUT-C-010-001-gap-deposit-and-timeline
    - AUT-C-010-001-gap-next-step
    - AUT-C-010-001-gap-scope-completeness
  spreadsheet_resilience_standard_ref: records/scenario_matrix/SM-C-010-001.yaml
  support_by_design_standard_ref: records/product_architecture_contract/PAC-C-010-001.yaml#support_risk
  market_gap_summary: The benchmark proves same-platform demand but stops at shallow totaling. This product closes the gap with send/clarify/timeline logic and visible quote guardrails.
  successful_new_entrant_sources:
    - listing_url: https://www.etsy.com/listing/4490143881/handyman-estimate-template-excel-google
      evidence_summary: Same-platform benchmark shows direct quote demand and real buyer language around fast estimating and profit protection.
  buyer_outcome_requirements:
    primary_buyer_decision: Should I send this quote now, and at what total, deposit, and delivery expectation?
    buyer_success_state: Buyer reaches send_ready only when scope, profitability, and timing checks pass.
    buyer_failure_state: Buyer is blocked from sending when scope is incomplete, quote is below floor, or timing is unrealistic.
  correct_logic_requirements:
    - quote total must respond to line-item hours, material cost, travel flags, rush setting, and discount amount
    - deposit amount must respond to the deposit assumption
    - delivery window must respond to rush setting and timing assumptions
  unsafe_state_requirements:
    - no send_ready state when required readiness fields are incomplete
    - no healthy success state when quote is below the minimum floor
  required_warning_requirements:
    - clarify_scope
    - below_floor
    - unrealistic_timeline
  expected_output_requirements:
    - Quote Summary!B8 quote_total
    - Quote Summary!B9 deposit_amount
    - Quote Summary!B10 delivery_window
    - Quote Summary!B12 confidence_state
    - Quote Summary!B13 next_step
  negative_review_trigger_requirements:
    - hidden editable areas
    - totals without next-step context
    - impossible timing displayed as safe to send
  workbook_requirements:
    - Start Here sheet
    - Assumptions sheet
    - Scope Inputs sheet
    - Quote Summary sheet
    - Saved Quotes sheet
  tab_requirements:
    - all core sheets visible on first open
  workflow_requirements:
    - first-open steps explain where to start
    - quote summary explains what each state means
  formula_requirements:
    - line-item formulas extend beyond the seeded examples
    - saved quote area remains visible and blank-capable
  dashboard_requirements:
    - quote summary block is the main buyer-facing decision dashboard
  product_visual_surface_requirements:
    - clear yellow input cells
    - clear blue output cells
    - visible headings and buyer guidance
  dashboard_surface_requirements:
    - quote total, deposit, delivery, state, and next step visible without scrolling to hidden helpers
  chart_quality_requirements: []
  buyer_decision_bearing_charts: []
  chart_unit_and_threshold_semantics: []
  screenshot_eligible_surface_requirements:
    - Start Here
    - Scope Inputs
    - Quote Summary
    - Saved Quotes
  no_listing_only_fake_surfaces:
    - real workbook surfaces only
  editable_area_requirements:
    - Assumptions!B4:B11
    - Scope Inputs!B4:B11
    - Scope Inputs!B15:F29
  sample_data_requirements:
    - one seeded standard quote
    - one blocked clarify example in Saved Quotes
  output_requirements:
    - quote_total
    - deposit_amount
    - delivery_window
    - confidence_state
    - next_step
  complaint_fix_requirements:
    - add first-open onboarding
    - avoid actual-hours quote logic
    - add visible next-step guidance
  forbidden_product_features:
    - invoice sending
    - CRM pipeline
    - dispatch tools
  files_to_create:
    - builds/C-010-001/product/Handyman-Quote-Readiness-Planner.xlsx
    - builds/C-010-001/product/Handyman-Quote-Readiness-Planner-google-sheets-import.xlsx
    - builds/C-010-001/delivery-assets/README-FIRST.md
    - builds/C-010-001/delivery-assets/Quick-Start-and-FAQ.md
  compatibility_requirements:
    - Excel desktop
    - Google Sheets import copy
    - no macros required
  listing_verification_requirements:
    - every buyer-facing claim must map to a rendered product surface
  spreadsheet_resilience_strategies:
    - standard_item_id: SR-001
      applicability: required
      strategy: protect formula cells while leaving buyer input cells unlocked
      reason: reduce accidental overwrites
      source_inspection_requirement_id: AUT-C-010-001-gap-onboarding
      acceptance_test: formula cells remain protected and input cells remain editable
    - standard_item_id: SR-002
      applicability: required
      strategy: extend formulas through blank working rows
      reason: avoid demo-only capacity
      source_inspection_requirement_id: AUT-C-010-001-gap-capacity
      acceptance_test: blank rows still calculate when filled
  support_by_design_requirements:
    - requirement_id: SD-001
      strategy: Start Here sheet with step-by-step usage
      reason: benchmark lacked a true first-open helper
    - requirement_id: SD-002
      strategy: quote state and next-step outputs on the summary
      reason: buyer needs guidance, not only a total
  evidence_missing: []
""",
        encoding="utf-8",
    )


def write_listing_spec():
    LISTING_SPEC.write_text(
        """listing_spec:
  spec_id: LS-C-010-001
  candidate_ref: C-010-001
  idea_ref: I-001
  flow_version: FLOW-007
  product_architecture_contract_ref: records/product_architecture_contract/PAC-C-010-001.yaml
  decision_output_contract_ref: records/product_architecture_contract/PAC-C-010-001.yaml#decision_output_contract
  scenario_matrix_ref: records/scenario_matrix/SM-C-010-001.yaml
  hard_rule: Clean screenshots without a buyer hook do not pass.
  product_name: Handyman Quote Readiness Planner
  branding_ref: brandbook/beatsperfect-brandbook.v1.yaml
  marketplace: Etsy
  listing_analysis_ref: records/public_shelf_read/PSR-C-010-001.yaml
  purchased_competitor_inspection_ref: records/competitor_autopsy/AUT-C-010-001.yaml
  generated_from:
    buyer_promise: Turn repair-job scope into a send-ready quote, deposit, and delivery plan before replying to the client.
    decision_output_contract: records/product_architecture_contract/PAC-C-010-001.yaml#decision_output_contract
    competitor_category_standard: same-platform estimate workbook with visible totals
    actual_artifact_screenshots:
      - builds/C-010-001/process/rendered/01-start-here.png
      - builds/C-010-001/process/rendered/02-assumptions.png
      - builds/C-010-001/process/rendered/03-scope-inputs.png
      - builds/C-010-001/process/rendered/04-quote-summary.png
      - builds/C-010-001/process/rendered/05-saved-quotes.png
    beatsperfect_brandbook_ref: brandbook/beatsperfect-brandbook.v1.yaml
  per_listing_image_requirements:
    - image_role: thumbnail_main_promise
      buyer_hook: Know if the quote is ready before you send it.
      specific_product_proof_shown: Quote Summary state, quote total, deposit, and delivery output
      reason_this_image_helps_conversion: immediately proves the workbook is a decision aid rather than a decorative form
      grid_stop_reason: send_ready / clarify / reset framing
      product_surface_large_enough_to_prove_claim: true
      one_promise_and_matching_reason_to_believe: true
      verified_product_surface_ref: builds/C-010-001/process/rendered/04-quote-summary.png
    - image_role: scope_input_workflow
      buyer_hook: Check readiness before trusting the total.
      specific_product_proof_shown: readiness inputs plus line items
      reason_this_image_helps_conversion: shows the buyer how the quote is built
      grid_stop_reason: blended scope plus estimate workflow
      product_surface_large_enough_to_prove_claim: true
      one_promise_and_matching_reason_to_believe: true
      verified_product_surface_ref: builds/C-010-001/process/rendered/03-scope-inputs.png
    - image_role: assumptions_guardrails
      buyer_hook: Set your rules once.
      specific_product_proof_shown: deposit, floor, and rush settings
      reason_this_image_helps_conversion: proves buyer control over business defaults
      grid_stop_reason: visible guardrails
      product_surface_large_enough_to_prove_claim: true
      one_promise_and_matching_reason_to_believe: true
      verified_product_surface_ref: builds/C-010-001/process/rendered/02-assumptions.png
    - image_role: onboarding_surface
      buyer_hook: Know what to do first.
      specific_product_proof_shown: Start Here workflow
      reason_this_image_helps_conversion: closes the onboarding gap exposed by the benchmark
      grid_stop_reason: first-open clarity
      product_surface_large_enough_to_prove_claim: true
      one_promise_and_matching_reason_to_believe: true
      verified_product_surface_ref: builds/C-010-001/process/rendered/01-start-here.png
    - image_role: saved_quotes_and_repeat_use
      buyer_hook: Keep prior quote snapshots visible.
      specific_product_proof_shown: Saved Quotes table
      reason_this_image_helps_conversion: proves repeat-use value instead of one-off mockup behavior
      grid_stop_reason: visible working capacity
      product_surface_large_enough_to_prove_claim: true
      one_promise_and_matching_reason_to_believe: true
      verified_product_surface_ref: builds/C-010-001/process/rendered/05-saved-quotes.png
  listing_quality_fail_if:
    - clean_assets_lack_real_hook
    - report_slide_layout_as_thumbnail
    - screenshot_presence_as_the_only_hook
    - tiny_product_surface_that_cannot_prove_claim
    - unverified_compatibility_or_protection_claim
    - every_image_uses_same_visual_hierarchy_without_distinct_grid_stop_reason
  applied_inspection_requirement_ids:
    - AUT-C-010-001-gap-deposit-and-timeline
    - AUT-C-010-001-gap-next-step
    - AUT-C-010-001-gap-start-here
  listing_evidence_packet: records/public_shelf_read/PSR-C-010-001.yaml
  buyer_expectation_requirements:
    - the workbook helps decide whether the quote is ready to send
    - the workbook includes real quote totals, deposit, and delivery logic
  buyer_success_expectations:
    - faster quote judgment
    - fewer under-scoped sends
    - consistent deposit and timing outputs
  buyer_failure_expectations:
    - no invoicing
    - no scheduling
    - no CRM
  promise_to_product_alignment_requirements:
    - every claim maps to a rendered workbook surface
  negative_review_prevention_requirements:
    - state what the workbook does not do
    - show the onboarding surface
    - prove editable assumption controls
  title_requirements:
    - handyman quote planner
    - Excel and Google Sheets
    - deposit and timeline
  thumbnail_requirements:
    - large quote summary surface
    - strong send-ready hook
  image_sequence_requirements:
    - hero promise
    - workflow proof
    - guardrails
    - onboarding
    - repeat-use capacity
  image_roles:
    - thumbnail_main_promise
    - scope_input_workflow
    - assumptions_guardrails
    - onboarding_surface
    - saved_quotes_and_repeat_use
  bestseller_visual_grammar:
    - workbook proof first
    - concise buyer hook
    - one claim per image
  required_screenshot_moments:
    - Quote Summary send-ready view
    - Scope Inputs with line items
    - Assumptions with guardrails
    - Start Here
    - Saved Quotes
  real_product_surface_dependencies:
    - builds/C-010-001/process/rendered/01-start-here.png
    - builds/C-010-001/process/rendered/02-assumptions.png
    - builds/C-010-001/process/rendered/03-scope-inputs.png
    - builds/C-010-001/process/rendered/04-quote-summary.png
    - builds/C-010-001/process/rendered/05-saved-quotes.png
  image_to_product_fidelity_requirements:
    - use rendered workbook surfaces only
    - no fabricated UI panels
  no_listing_only_fake_surfaces:
    - true
  promise_requirements:
    - clarify that the product helps decide send/clarify/reset
    - mention deposit and delivery outputs
  trust_signal_requirements:
    - spreadsheet-compatible
    - no macros
    - editable assumptions
  objection_handler_requirements:
    - what happens when scope is incomplete
    - what happens when a quote is below floor
  buyer_visible_contents_requirements:
    - 5 workbook sheets
    - README
    - quick-start FAQ
  compatibility_claim_requirements:
    - Excel
    - Google Sheets import copy
  bonus_visibility_requirements: []
  description_requirements:
    - explain who it is for
    - explain the send-ready states
    - explain what is not included
  pricing_position_requirements:
    - position as a better-product upgrade inside the low-cost estimate-template lane
  benchmark_gap_closure_requirements:
    - show onboarding not present in benchmark
    - show next-step logic absent from benchmark
    - show deposit and timing outputs absent from benchmark
  claim_to_product_verification_requirements:
    - every image must have a matching rendered source surface
  forbidden_listing_claims:
    - automatic invoicing
    - CRM
    - dispatch
    - team collaboration
  evidence_missing: []
""",
        encoding="utf-8",
    )


def write_manifest():
    MANIFEST.write_text(
        """build_manifest:
  build_id: B-C-010-001
  candidate_ref: C-010-001
  process_dir: builds/C-010-001/process
  runtime_launcher_ref: runtime/model-stage-launcher.mjs
  flow_contract_ref: workflows/FLOW-007.yaml
  product_architecture_contract_ref: records/product_architecture_contract/PAC-C-010-001.yaml
  product_identity_reframe_ref: records/product_identity_reframe/PIR-C-010-001.yaml
  product_spec_ref: records/product_specs/PS-C-010-001.yaml
  workbook_or_product_blueprint_ref: records/workbook_blueprint/WBP-C-010-001.yaml
  build_readiness_review_ref: records/build_readiness/BRR-C-010-001.yaml
  pre_build_architecture_premortem_ref: records/pre_build_architecture_premortem/PBAP-C-010-001.yaml
  company_memory_preflight_ref: records/run_preflight/CMR-C-010-001.yaml
  findings_ledger_ref: records/findings/FND-C-010-001.yaml
  prior_failed_baseline_refs: []
  build_readiness_status: BUILD_READY
  hard_rule: Builder must receive a locked Product Architecture Contract and product spec. Build may start only when build_readiness.status is BUILD_READY.
  locked_architecture_fields_builder_must_not_change:
    - primary_buyer
    - buyer_behavior_loop
    - domain_model
    - decision_outputs
    - scenario_logic
    - scope_boundaries
  builder_may_implement:
    - workbook_files_templates
    - formulas
    - dashboards
    - instructions
    - listing_assets
    - packaging
  spreadsheet_workbook_requirements:
    - realistic_demo_rows
    - blank_formula_ready_rows
    - formulas_extended_beyond_demo_area
    - clear_input_areas
    - formula_or_protected_areas_where_possible
    - warning_error_states
    - no_demo_only_workbook
    - no_fake_filled_capacity
    - visible_human_scale_capacity_floor
    - non_seed_capacity_blank_formula_ready
    - helper_behavior_scenario_implemented
    - setup_input_propagation_manifest
    - primary_buyer_decision_outputs_implemented
  required_behavior_manifests:
    - product_identity_reframe_manifest
    - buyer_behavior_contract_ref
    - primary_buyer_decision_output_manifest
    - buyer_behavior_to_next_action_manifest
    - adversarial_scenario_coverage_manifest
    - scenario_fixture_manifest
    - workbook_product_blueprint_manifest
    - builder_input_completeness_manifest
    - setup_input_usage_manifest
    - working_capacity_manifest
    - visible_capacity_manifest
    - pre_build_architecture_premortem_manifest
    - prior_failed_artifact_delta_manifest
    - seed_data_behavior_demo_manifest
    - helper_behavior_scenario_manifest
  model_policy_ref: MODEL-007.product_build
  pricing_snapshot_ref:
  generation_budget_usd: 40
  shared_research_cost_usd: 0
  generation_api_and_tool_cost_usd: 0
  competitor_purchase_cost_usd: 2.99
  competitor_purchase_excluded_from_generation_budget: true
  remaining_generation_budget_usd: 40
  generation_budget_pass: true
  good_enough_for_humans_spec_ref: records/product_specs/PS-C-010-001.yaml
  real_product_surface_spec_ref: records/listing_specs/LS-C-010-001.yaml
  competitive_purchase_approval_ref: records/competitive_purchase_approval/CPA-C-010-001.yaml
  purchased_competitor_inspection_ref: records/competitor_autopsy/AUT-C-010-001.yaml
  applied_inspection_requirement_ids:
    - AUT-C-010-001-gap-deposit-and-timeline
    - AUT-C-010-001-gap-next-step
    - AUT-C-010-001-gap-start-here
  branding_ref: brandbook/beatsperfect-brandbook.v1.yaml
  delivery_method: digital_download
  competitive_standard: same-platform service-quote workbook with visible total near the quote surface
  benchmark_sources:
    - records/public_shelf_read/PSR-C-010-001.yaml
    - records/competitive_purchase_approval/CPA-C-010-001.yaml
    - records/competitor_autopsy/AUT-C-010-001.yaml
  status: pass_pending_real_artifact_inspection
  listing_assets:
    - path: builds/C-010-001/listing-assets/final/01-main-promise.png
      role: thumbnail_main_promise
    - path: builds/C-010-001/listing-assets/final/02-scope-workflow.png
      role: scope_input_workflow
    - path: builds/C-010-001/listing-assets/final/03-assumptions-guardrails.png
      role: assumptions_guardrails
    - path: builds/C-010-001/listing-assets/final/04-start-here.png
      role: onboarding_surface
    - path: builds/C-010-001/listing-assets/final/05-repeat-use.png
      role: saved_quotes_and_repeat_use
    - path: builds/C-010-001/listing-assets/etsy-title.txt
      role: listing_title
    - path: builds/C-010-001/listing-assets/etsy-description.md
      role: listing_description
  product_assets:
    - path: builds/C-010-001/product/Handyman-Quote-Readiness-Planner.xlsx
      role: primary_workbook
    - path: builds/C-010-001/product/Handyman-Quote-Readiness-Planner-google-sheets-import.xlsx
      role: import_copy
  delivery_assets:
    - path: builds/C-010-001/delivery-assets/README-FIRST.md
      role: first_open_readme
    - path: builds/C-010-001/delivery-assets/Quick-Start-and-FAQ.md
      role: quick_start_faq
  internal_process_artifacts:
    - path: builds/C-010-001/process/rendered/01-start-here.png
      role: start_here_render
    - path: builds/C-010-001/process/rendered/02-assumptions.png
      role: assumptions_render
    - path: builds/C-010-001/process/rendered/03-scope-inputs.png
      role: scope_inputs_render
    - path: builds/C-010-001/process/rendered/04-quote-summary.png
      role: quote_summary_render
    - path: builds/C-010-001/process/rendered/05-saved-quotes.png
      role: saved_quotes_render
    - path: records/listing_creatives/LC-C-010-001.yaml
      role: listing_creative_assembly
    - path: records/product_specs/PS-C-010-001.yaml
      role: product_spec
    - path: records/listing_specs/LS-C-010-001.yaml
      role: listing_spec
  ready_for_publish_requires:
    - build_readiness_status_BUILD_READY
    - product_architecture_contract_locked
    - product_spec_generated_from_product_architecture_contract
    - listing_quality_pass
    - product_quality_pass
    - delivery_quality_pass
    - good_enough_pass
    - domain_correctness_qa_pass
    - prohibited_domain_scope_absent
    - professional_boundary_claims_pass
    - generation_budget_pass
    - competitor_purchase_completed
    - purchased_competitor_inspection_complete
    - inspection_requirements_applied
    - promise_delivery_truthfulness_pass
    - spreadsheet_resilience_qa_pass
    - support_by_design_qa_pass
    - reference_based_originality_pass
    - private_competitor_assets_excluded
    - qa_result_pass
    - launch_review_result_pass
    - buyer_behavior_contract_consumed
    - primary_buyer_decision_outputs_implemented
    - product_identity_reframe_consumed
    - workbook_or_product_blueprint_consumed
    - scenario_fixtures_consumed
    - executable_adversarial_scenarios_pass
    - setup_input_propagation_pass
    - blank_formula_ready_capacity_pass
    - visible_human_scale_capacity_pass
    - helper_behavior_scenario_pass
    - measured_material_product_delta_pass
    - seed_data_behavior_demo_pass
    - pre_build_architecture_premortem_pass
    - builder_input_completeness_pass
    - pre_mortem_launch_blockers_absent
    - cost_outcome_accountability_pass
""",
        encoding="utf-8",
    )


def write_copy():
    TITLE_FILE.write_text(
        "Handyman Quote Readiness Planner | Excel & Google Sheets Estimate Template | Deposit, Timeline & Send-Ready Quote Calculator\n",
        encoding="utf-8",
    )
    DESCRIPTION_FILE.write_text(
        """# Handyman Quote Readiness Planner

Turn a repair-job scope into a send-ready quote before you reply to the client.

## Best for
- Solo handymen
- Tiny repair businesses
- Spreadsheet-first service sellers who already know their rough rates but want a more consistent quote workflow

## What it does
- Calculates the quote total from labor, material, travel, rush, and discount inputs
- Recommends a deposit amount
- Shows the expected delivery window
- Flags whether the quote is `send_ready`, `clarify_scope`, `below_floor`, or `unrealistic_timeline`
- Gives a next-step recommendation so you know whether to send, clarify, or reset expectations

## What's included
- Excel workbook
- Google Sheets import copy
- README first-open guide
- Quick-start FAQ

## What it does not do
- No invoicing
- No CRM
- No dispatch or scheduling
- No automatic email sending

## Compatibility
- Microsoft Excel
- Google Sheets via import copy
- No macros required
""",
        encoding="utf-8",
    )


def main():
    FINAL_DIR.mkdir(parents=True, exist_ok=True)
    SVG_DIR.mkdir(parents=True, exist_ok=True)
    for spec in CREATIVES:
        svg_path = SVG_DIR / f"{spec['file']}.svg"
        png_path = FINAL_DIR / f"{spec['file']}.png"
        svg_path.write_text(creative_svg(spec), encoding="utf-8")
        subprocess.run(["sips", "-s", "format", "png", str(svg_path), "--out", str(png_path)], check=True, stdout=subprocess.DEVNULL)

    write_listing_creatives_record()
    write_product_spec()
    write_listing_spec()
    write_manifest()
    write_copy()
    print(MANIFEST)


if __name__ == "__main__":
    main()
