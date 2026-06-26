"use client";

import { useState } from "react";
import { mockTodayState } from "@/lib/today/mockTodayState";
import { formatStepLabel, stageLabels } from "@/lib/today/flow";
import type { TodayCandidateSnapshot, TodayState } from "@/lib/today/types";
import { Shell } from "@/components/site/Shell";
import { HealthPill } from "@/components/site/HealthPill";
import { MetricCard } from "@/components/site/MetricCard";

function CandidateCard({
  candidate,
  selected,
  minimal,
  onSelect
}: {
  candidate: TodayCandidateSnapshot;
  selected: boolean;
  minimal?: boolean;
  onSelect: (candidateId: string) => void;
}) {
  if (minimal) {
    return (
      <button
        className={selected ? "candidate card selected candidateCompact" : "candidate card candidateCompact"}
        onClick={() => onSelect(candidate.candidateId)}
        type="button"
      >
        <div className="candidateTop">
          <div>
            <div className="candidateId">{candidate.candidateId}</div>
            <div className="candidateLabel">{candidate.candidateTitle}</div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      className={selected ? "candidate card selected" : "candidate card"}
      onClick={() => onSelect(candidate.candidateId)}
      type="button"
    >
      <div className="candidateTop">
        <div>
          <div className="candidateId">{candidate.candidateId}</div>
          <div className="candidateLabel">{candidate.candidateTitle}</div>
        </div>
        <div className={`statusDot ${candidate.outcomeStatus}`} />
      </div>
      <div className="candidateMeta">
        <span className="mono">{candidate.currentStepId ? formatStepLabel(candidate.currentStepId) : candidate.currentStageGroup ?? candidate.outcomeStatus}</span>
        <span className="stage">{candidate.currentStageGroup ?? candidate.outcomeStatus}</span>
      </div>
      <div className="healthRow">
        <HealthPill label="budget" value={candidate.budgetHealth} />
        <HealthPill label="process" value={candidate.processHealth} />
      </div>
      <div className="candidateStats">
        <div>
          <span>tokens</span>
          <strong className="mono">{candidate.totalTokensUsed.toLocaleString()}</strong>
        </div>
        <div>
          <span>USD</span>
          <strong className="mono">${candidate.totalUsdSpent.toFixed(2)}</strong>
        </div>
      </div>
      {candidate.terminalReason ? <p className="candidateReason">{candidate.terminalReason}</p> : null}
    </button>
  );
}

function EscalationCard({ state }: { state: TodayState }) {
  if (state.activeEscalation.status === "none") {
    return (
      <section className="card bucket">
        <div className="bucketHeader">
          <div>
            <h3>Escalation</h3>
          </div>
        </div>
        <div className="panelNote">None today.</div>
      </section>
    );
  }

  return (
    <section className="card bucket">
      <div className="bucketHeader">
        <div>
          <h3>Escalation</h3>
        </div>
      </div>
      <div className="escalationBlock">
        <div className="escalationLine mono">
          {state.activeEscalation.candidateId} | {state.activeEscalation.status}
        </div>
        <div className="escalationLine">{state.activeEscalation.reason}</div>
        <div className="escalationLine">{state.activeEscalation.recommendedAction}</div>
        <div className="escalationLine mono">{state.activeEscalation.governanceFile ?? "n/a"}</div>
      </div>
    </section>
  );
}

function FlowTimelineCard({ state }: { state: TodayState }) {
  const flowTimeline =
    state.flowTimeline ??
    stageLabels.map(({ label, steps }) => ({
      stageGroup: label,
      stepIds: steps
    }));

  return (
    <section className="card panel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">{state.flowVersion}</p>
          <h2>Current step map</h2>
        </div>
        <div className="mono muted">{flowTimeline.reduce((count, stage) => count + stage.stepIds.length, 0)} steps</div>
      </div>
      <p className="panelNote">This panel mirrors the current flow contract so dashboard entries stay aligned with the live sequence.</p>
      <div className="flowTimeline">
        {flowTimeline.map((stage) => (
          <div className="flowStage" key={stage.stageGroup}>
            <div className="flowStageHeader">
              <div className="flowStageLabel">{stage.stageGroup.replaceAll("_", " ")}</div>
              <div className="mono muted">{stage.stepIds.length}</div>
            </div>
            <div className="flowStepList">
              {stage.stepIds.map((stepId) => (
                <span className="flowStep" key={stepId}>
                  {formatStepLabel(stepId)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TodayLogCard({ state }: { state: TodayState }) {
  const entries = state.todayLog ?? [];

  return (
    <section className="card panel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Today log</p>
          <h2>Cost and flow changes</h2>
        </div>
        <div className="mono muted">{entries.length}</div>
      </div>
      <div className="todayLogList">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <div className={`todayLogItem ${entry.kind}`} key={entry.id}>
              <div>
                <div className="candidateId">{entry.label}</div>
                <div className="candidateLabel">{entry.detail}</div>
              </div>
              <div className="mono muted">{entry.amountUsd > 0 ? `$${entry.amountUsd.toFixed(2)}` : "recorded"}</div>
            </div>
          ))
        ) : (
          <div className="panelNote">No entries today.</div>
        )}
      </div>
    </section>
  );
}

function ListCard({
  title,
  note,
  items
}: {
  title: string;
  note: string;
  items: Array<{ id: string; title: string; detail: string }>;
}) {
  return (
    <section className="card panel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">{title}</p>
          <h2>{note}</h2>
        </div>
        <div className="mono muted">{items.length}</div>
      </div>
      <div className="listStack">
        {items.length > 0 ? (
          items.map((item) => (
            <div className="listItem" key={item.id}>
              <div>
                <div className="candidateId">{item.id}</div>
                <div className="candidateLabel">{item.title}</div>
              </div>
              <div className="mono muted">{item.detail}</div>
            </div>
          ))
        ) : (
          <div className="panelNote">None today.</div>
        )}
      </div>
    </section>
  );
}

export function TodayDashboard({ state = mockTodayState }: { state?: TodayState }) {
  const [selectedCandidateId, setSelectedCandidateId] = useState(state.activeEscalation.candidateId);
  const supportCandidates = state.launchedCandidates.filter((candidate) => candidate.postLaunchSupportTokens > 0);
  const refundCandidates = state.launchedCandidates.filter((candidate) => candidate.refundCount > 0);

  return (
    <Shell
      title="Today"
      subtitle="Today is the CET day window. This tab shows spend and cost signals only; outcomes and payback come later."
      meta={
        <>
          <span className="mono muted">{state.dataMode} snapshot</span>
          <span className="mono muted">{state.flowVersion}</span>
        </>
      }
    >
      <section className="summaryGrid">
        <MetricCard label="Pipeline candidates" value={state.totals.pipelineCandidates} tone="pipeline" />
        <MetricCard label="In-flight" value={state.totals.inFlightCandidates} tone="warning" />
        <MetricCard label="Launched" value={state.totals.launchedCandidates} tone="success" />
        <MetricCard label="Rejected" value={state.totals.rejectedCandidates} tone="danger" />
        <MetricCard label="API spend today" value={`$${state.totals.totalSpendUsd.toFixed(2)}`} tone="neutral" />
        <MetricCard label="Product API" value={`$${state.totals.productApiCostUsd.toFixed(2)}`} tone="success" />
        <MetricCard
          label="Governance API"
          value={`$${state.totals.governanceApiCostUsd.toFixed(2)}`}
          note={`Current API costs for governance for Today is $${state.totals.governanceApiCostUsd.toFixed(2)}.`}
          tone="accent"
        />
        <MetricCard label="Human escalations" value={state.totals.humanEscalationsTotal} tone="warning" />
      </section>

      <section className="flowSection">
        <div className="sectionHeader">
          <div>
          <p className="eyebrow">Current Flow</p>
          <h2>Today spend as of {state.asOf}</h2>
        </div>
          <div className="mono muted">${state.totals.totalSpendUsd.toFixed(2)} total spend</div>
        </div>

        <FlowTimelineCard state={state} />
        <TodayLogCard state={state} />

        <div className="bucketStack">
          <Bucket
            title="Pipeline"
            note="Candidates ready after ideas, screening, and research"
            rows={state.pipelineCandidates}
            selectedCandidateId={selectedCandidateId}
            onSelect={setSelectedCandidateId}
            minimal
          />
          <Bucket
            title="In-flight"
            note="Candidates currently being built"
            rows={state.inFlightCandidates}
            selectedCandidateId={selectedCandidateId}
            onSelect={setSelectedCandidateId}
          />
          <EscalationCard state={state} />
          <Bucket
            title="Launched"
            note="Launched today"
            rows={state.launchedCandidates}
            selectedCandidateId={selectedCandidateId}
            onSelect={setSelectedCandidateId}
          />
          <Bucket
            title="Rejected before launch"
            note="Rejected today"
            rows={state.rejectedCandidates}
            selectedCandidateId={selectedCandidateId}
            onSelect={setSelectedCandidateId}
          />
        </div>
      </section>

      <section className="grid2">
        <ListCard
          title="Today's Post-Launch support"
          note="Products that needed support, with tokens spent."
          items={supportCandidates.map((candidate) => ({
            id: candidate.candidateId,
            title: candidate.candidateTitle,
            detail: `${candidate.postLaunchSupportTokens.toLocaleString()} tokens`
          }))}
        />
        <ListCard
          title="Refunds"
          note="Products with refund count and refund tokens."
          items={refundCandidates.map((candidate) => ({
            id: candidate.candidateId,
            title: candidate.candidateTitle,
            detail: `${candidate.refundCount} / ${candidate.refundTokens.toLocaleString()}`
          }))}
        />
      </section>
    </Shell>
  );
}

function Bucket({
  title,
  note,
  rows,
  selectedCandidateId,
  onSelect,
  minimal = false
}: {
  title: string;
  note: string;
  rows: TodayCandidateSnapshot[];
  selectedCandidateId: string | null;
  onSelect: (candidateId: string) => void;
  minimal?: boolean;
}) {
  const totalTokens = rows.reduce((sum, candidate) => sum + candidate.totalTokensUsed, 0);
  const totalUsd = rows.reduce((sum, candidate) => sum + candidate.totalUsdSpent, 0);

  return (
    <section className="card bucket">
      <div className="bucketHeader">
        <div>
          <h3>{title}</h3>
          <p>{note}</p>
        </div>
        <div className="bucketTotals">
          <div className="mono muted">{rows.length}</div>
          <div className="bucketTotalLine mono">{minimal ? `$${totalUsd.toFixed(2)}` : `${totalTokens.toLocaleString()} tokens / $${totalUsd.toFixed(2)}`}</div>
        </div>
      </div>
      <div className="bucketGrid">
        {rows.map((candidate) => (
          <CandidateCard
            key={candidate.candidateId}
            candidate={candidate}
            selected={selectedCandidateId === candidate.candidateId}
            onSelect={onSelect}
            minimal={minimal}
          />
        ))}
      </div>
    </section>
  );
}
