"use client";

import { useMemo, useState } from "react";
import { mockPeriodState } from "@/lib/period/mockPeriodState";
import type { PeriodBucket, PeriodState } from "@/lib/period/types";
import { Shell } from "@/components/site/Shell";
import { MetricCard } from "@/components/site/MetricCard";

function PeriodBar({ bucket, max }: { bucket: PeriodBucket; max: number }) {
  const height = max === 0 ? 0 : Math.max(8, (bucket.rejectedLaunchCount / max) * 180);
  return (
    <div className="periodBar">
      <div className="periodBarTrack">
        <div className="periodBarFill" style={{ height }} />
      </div>
      <div className="periodBarLabel">{bucket.date.slice(5)}</div>
      <div className="periodBarValue mono">{bucket.rejectedLaunchCount}</div>
    </div>
  );
}

function PeriodMetricBar({
  bucket,
  max,
  value,
  tone
}: {
  bucket: PeriodBucket;
  max: number;
  value: number;
  tone: "pipeline" | "success" | "warning" | "accent";
}) {
  const height = max === 0 ? 0 : Math.max(8, (value / max) * 180);
  return (
    <div className="periodBar">
      <div className="periodBarTrack">
        <div className={`periodBarFill ${tone}`} style={{ height }} />
      </div>
      <div className="periodBarLabel">{bucket.date.slice(5)}</div>
      <div className="periodBarValue mono">{value.toLocaleString()}</div>
    </div>
  );
}

function HumanSplitBar({ bucket, max }: { bucket: PeriodBucket; max: number }) {
  const launchHuman = bucket.launchTokens + bucket.governanceTokens;
  const postLaunchHuman = bucket.postLaunchSupportTokens + bucket.refundTokens;
  const launchHeight = max === 0 ? 0 : Math.max(8, (launchHuman / max) * 180);
  const postLaunchHeight = max === 0 ? 0 : Math.max(8, (postLaunchHuman / max) * 180);

  return (
    <div className="humanBar">
      <div className="humanStack humanSplitStack">
        <div className="humanPart launch" style={{ height: launchHeight }} />
        <div className="humanPart postLaunch" style={{ height: postLaunchHeight }} />
      </div>
      <div className="humanSplitLabels">
        <span>review</span>
        <span>post-launch</span>
      </div>
      <div className="periodBarLabel">{bucket.date.slice(5)}</div>
      <div className="periodBarValue mono">{launchHuman + postLaunchHuman}</div>
    </div>
  );
}

export function PeriodDashboard({ state = mockPeriodState }: { state?: PeriodState }) {
  const [from, setFrom] = useState(state.from);
  const [to, setTo] = useState(state.to);

  const maxRejectedLaunches = useMemo(
    () => Math.max(...state.buckets.map((bucket) => bucket.rejectedLaunchCount), 0),
    [state.buckets]
  );
  const maxModelTokens = useMemo(
    () => Math.max(...state.buckets.map((bucket) => bucket.avgModelTokensPerLaunch), 0),
    [state.buckets]
  );
  const maxUsd = useMemo(() => Math.max(...state.buckets.map((bucket) => bucket.avgUsdSpendPerLaunch), 0), [state.buckets]);
  const maxHuman = useMemo(
    () =>
      Math.max(
        ...state.buckets.map(
          (bucket) =>
            bucket.launchTokens +
            bucket.governanceTokens +
            bucket.postLaunchSupportTokens +
            bucket.refundTokens
        ),
        0
      ),
    [state.buckets]
  );

  return (
    <Shell
      title="Period"
      subtitle="This is the calendar aggregation of Today. It now keeps yesterday's rejected launch review visible alongside spend and cost signals."
      meta={
        <>
          <span className="mono muted">{state.dataMode} snapshot</span>
          <span className="mono muted">{state.flowVersion}</span>
        </>
      }
    >
      <section className="card panel periodControls">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Date range</p>
            <h2>Choose a window</h2>
          </div>
          <div className="mono muted">mocked from live-ready state</div>
        </div>
        <div className="controlRow">
          <label>
            <span>From</span>
            <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label>
            <span>To</span>
            <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
        </div>
      </section>

      <section className="summaryGrid">
        <MetricCard label="Launched" value={state.totals.launchedCount} tone="success" />
        <MetricCard label="Rejected launches" value={state.totals.rejectedLaunchCount} tone="danger" />
        <MetricCard label="Model tokens" value={state.totals.modelTokensTotal.toLocaleString()} tone="pipeline" />
        <MetricCard label="Avg tokens / rejected launch" value={state.totals.avgModelTokensPerLaunch.toLocaleString()} tone="pipeline" />
        <MetricCard label="Review Tokens" value={state.totals.launchTokensTotal.toLocaleString()} tone="warning" />
        <MetricCard label="Governance Tokens" value={state.totals.governanceTokensTotal.toLocaleString()} tone="accent" />
        <MetricCard
          label="Post-launch support Tokens"
          value={state.totals.postLaunchSupportTokensTotal.toLocaleString()}
          tone="warning"
        />
        <MetricCard label="Refunds count / Tokens" value={`${state.totals.refundCountTotal} / ${state.totals.refundTokensTotal.toLocaleString()}`} tone="danger" />
        <MetricCard label="USD Total Spend" value={`$${state.totals.usdTotalSpend.toFixed(2)}`} tone="neutral" />
        <MetricCard label="API Cost Total" value={`$${state.totals.totalApiCostUsd.toFixed(2)}`} tone="neutral" />
        <MetricCard label="Product API Cost" value={`$${state.totals.productApiCostUsd.toFixed(2)}`} tone="success" />
        <MetricCard label="Governance API Cost" value={`$${state.totals.governanceApiCostUsd.toFixed(2)}`} tone="accent" />
        <MetricCard label="Human escalations" value={state.totals.humanEscalationsTotal} tone="warning" />
        <MetricCard label="Avg USD spend / rejected launch" value={`$${state.totals.avgUsdSpendPerLaunch.toFixed(2)}`} tone="success" />
      </section>

      {state.rejectedLaunch ? (
        <section className="card panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Yesterday</p>
              <h2>Rejected launch record</h2>
            </div>
            <div className="mono muted">{state.rejectedLaunch.reviewedAt}</div>
          </div>
          <div className="listStack">
            <div className="listItem">
              <div>
                <div className="candidateId">{state.rejectedLaunch.reviewId}</div>
                <div className="candidateLabel">{state.rejectedLaunch.candidateTitle}</div>
              </div>
              <div className="mono muted">{state.rejectedLaunch.candidateId}</div>
            </div>
            <div className="listItem">
              <div>
                <div className="candidateLabel">Decision</div>
                <div className="candidateReason">{state.rejectedLaunch.decisionSummary}</div>
              </div>
              <div className="mono muted">{state.rejectedLaunch.status}</div>
            </div>
            <div className="listItem">
              <div>
                <div className="candidateLabel">Blocker</div>
                <div className="candidateReason">{state.rejectedLaunch.blockerSummary}</div>
              </div>
              <div className="mono muted">{state.rejectedLaunch.flowContractRef}</div>
            </div>
          </div>
          <p className="panelNote mono muted">Evidence: {state.rejectedLaunch.evidenceRefs.join(" · ")}</p>
        </section>
      ) : null}

      <section className="card panel">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Rejected launches per day</p>
            <h2>Daily rejection volume</h2>
          </div>
          <div className="mono muted">
            {from} → {to}
          </div>
        </div>
        <div className="periodGrid">
          {state.buckets.map((bucket) => (
            <PeriodBar key={bucket.date} bucket={bucket} max={maxRejectedLaunches} />
          ))}
        </div>
      </section>

      <section className="grid2">
        <section className="card panel">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Average tokens</p>
              <h2>Per rejected launch</h2>
            </div>
          </div>
          <div className="periodGrid">
            {state.buckets.map((bucket) => (
              <PeriodMetricBar
                key={bucket.date}
                bucket={bucket}
                max={maxModelTokens}
                value={bucket.avgModelTokensPerLaunch}
                tone="pipeline"
              />
            ))}
          </div>
        </section>

        <section className="card panel">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Average USD spend</p>
              <h2>Per rejected launch</h2>
            </div>
          </div>
          <div className="periodGrid">
            {state.buckets.map((bucket) => (
              <PeriodMetricBar
                key={bucket.date}
                bucket={bucket}
                max={maxUsd}
                value={bucket.avgUsdSpendPerLaunch}
                tone="success"
              />
            ))}
          </div>
        </section>
      </section>

      <section className="card panel">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Human tokens</p>
            <h2>Review vs post-launch</h2>
          </div>
          <div className="mono muted">review = launch + governance, post-launch = support + refunds</div>
        </div>
        <div className="periodGrid humanGrid">
          {state.buckets.map((bucket) => (
            <HumanSplitBar key={bucket.date} bucket={bucket} max={maxHuman} />
          ))}
        </div>
      </section>
    </Shell>
  );
}
