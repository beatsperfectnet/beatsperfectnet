"use client";

import { useMemo, useState } from "react";
import { mockPeriodState } from "@/lib/period/mockPeriodState";
import type { PeriodBucket, PeriodState } from "@/lib/period/types";
import { Shell } from "@/components/site/Shell";
import { MetricCard } from "@/components/site/MetricCard";

function isInRange(date: string, from: string, to: string) {
  return date >= from && date <= to;
}

function sumBuckets(buckets: PeriodBucket[], getter: (bucket: PeriodBucket) => number) {
  return Number(buckets.reduce((total, bucket) => total + getter(bucket), 0).toFixed(2));
}

function deriveTotals(buckets: PeriodBucket[]) {
  const rejectedLaunchCount = sumBuckets(buckets, (bucket) => bucket.rejectedLaunchCount);
  const modelTokensTotal = sumBuckets(
    buckets,
    (bucket) => bucket.avgModelTokensPerLaunch * bucket.rejectedLaunchCount
  );
  const rejectedLaunchUsdTotal = sumBuckets(
    buckets,
    (bucket) => bucket.avgUsdSpendPerLaunch * bucket.rejectedLaunchCount
  );

  return {
    launchedCount: sumBuckets(buckets, (bucket) => bucket.launchedCount),
    rejectedLaunchCount,
    modelTokensTotal,
    launchTokensTotal: sumBuckets(buckets, (bucket) => bucket.launchTokens),
    governanceTokensTotal: sumBuckets(buckets, (bucket) => bucket.governanceTokens),
    postLaunchSupportTokensTotal: sumBuckets(buckets, (bucket) => bucket.postLaunchSupportTokens),
    refundTokensTotal: sumBuckets(buckets, (bucket) => bucket.refundTokens),
    refundCountTotal: sumBuckets(buckets, (bucket) => bucket.refundCount),
    usdTotalSpend: sumBuckets(buckets, (bucket) => bucket.totalApiCostUsd),
    totalApiCostUsd: sumBuckets(buckets, (bucket) => bucket.totalApiCostUsd),
    productApiCostUsd: sumBuckets(buckets, (bucket) => bucket.productApiCostUsd),
    governanceApiCostUsd: sumBuckets(buckets, (bucket) => bucket.governanceApiCostUsd),
    unallocatedApiCostUsd: sumBuckets(buckets, (bucket) => bucket.unallocatedApiCostUsd),
    rejectedProductApiCostUsd: sumBuckets(buckets, (bucket) => bucket.rejectedProductApiCostUsd),
    humanEscalationsTotal: sumBuckets(buckets, (bucket) => bucket.humanEscalations),
    avgModelTokensPerLaunch: rejectedLaunchCount ? Math.round(modelTokensTotal / rejectedLaunchCount) : 0,
    avgUsdSpendPerLaunch: rejectedLaunchCount ? rejectedLaunchUsdTotal / rejectedLaunchCount : 0
  };
}

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
  const visibleBuckets = useMemo(
    () => state.buckets.filter((bucket) => isInRange(bucket.date, from, to)),
    [from, state.buckets, to]
  );
  const visibleTotals = useMemo(() => deriveTotals(visibleBuckets), [visibleBuckets]);
  const visibleRejectedLaunch =
    state.rejectedLaunch && isInRange(state.rejectedLaunch.reviewedAt, from, to)
      ? state.rejectedLaunch
      : null;

  const maxRejectedLaunches = useMemo(
    () => Math.max(...visibleBuckets.map((bucket) => bucket.rejectedLaunchCount), 0),
    [visibleBuckets]
  );
  const maxModelTokens = useMemo(
    () => Math.max(...visibleBuckets.map((bucket) => bucket.avgModelTokensPerLaunch), 0),
    [visibleBuckets]
  );
  const maxUsd = useMemo(() => Math.max(...visibleBuckets.map((bucket) => bucket.avgUsdSpendPerLaunch), 0), [visibleBuckets]);
  const maxHuman = useMemo(
    () =>
      Math.max(
        ...visibleBuckets.map(
          (bucket) =>
            bucket.launchTokens +
            bucket.governanceTokens +
            bucket.postLaunchSupportTokens +
            bucket.refundTokens
        ),
        0
      ),
    [visibleBuckets]
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
          <div className="mono muted">generated from recorded daily costs</div>
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
        <MetricCard label="Launched" value={visibleTotals.launchedCount} tone="success" />
        <MetricCard label="Rejected launches" value={visibleTotals.rejectedLaunchCount} tone="danger" />
        <MetricCard label="Model tokens" value={visibleTotals.modelTokensTotal.toLocaleString()} tone="pipeline" />
        <MetricCard label="Avg tokens / rejected launch" value={visibleTotals.avgModelTokensPerLaunch.toLocaleString()} tone="pipeline" />
        <MetricCard label="Review Tokens" value={visibleTotals.launchTokensTotal.toLocaleString()} tone="warning" />
        <MetricCard label="Governance Tokens" value={visibleTotals.governanceTokensTotal.toLocaleString()} tone="accent" />
        <MetricCard
          label="Post-launch support Tokens"
          value={visibleTotals.postLaunchSupportTokensTotal.toLocaleString()}
          tone="warning"
        />
        <MetricCard label="Refunds count / Tokens" value={`${visibleTotals.refundCountTotal} / ${visibleTotals.refundTokensTotal.toLocaleString()}`} tone="danger" />
        <MetricCard label="USD Total Spend" value={`$${visibleTotals.usdTotalSpend.toFixed(2)}`} tone="neutral" />
        <MetricCard label="API Cost Total" value={`$${visibleTotals.totalApiCostUsd.toFixed(2)}`} tone="neutral" />
        <MetricCard label="Product API Cost" value={`$${visibleTotals.productApiCostUsd.toFixed(2)}`} tone="success" />
        <MetricCard label="Rejected Product API" value={`$${visibleTotals.rejectedProductApiCostUsd.toFixed(2)}`} tone="danger" />
        <MetricCard label="Governance API Cost" value={`$${visibleTotals.governanceApiCostUsd.toFixed(2)}`} tone="accent" />
        <MetricCard label="Human escalations" value={visibleTotals.humanEscalationsTotal} tone="warning" />
        <MetricCard label="Avg USD spend / rejected launch" value={`$${visibleTotals.avgUsdSpendPerLaunch.toFixed(2)}`} tone="success" />
      </section>

      {visibleRejectedLaunch ? (
        <section className="card panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Yesterday</p>
              <h2>Rejected launch record</h2>
            </div>
            <div className="mono muted">{visibleRejectedLaunch.reviewedAt}</div>
          </div>
          <div className="listStack">
            <div className="listItem">
              <div>
                <div className="candidateId">{visibleRejectedLaunch.reviewId}</div>
                <div className="candidateLabel">{visibleRejectedLaunch.candidateTitle}</div>
              </div>
              <div className="mono muted">{visibleRejectedLaunch.candidateId}</div>
            </div>
            <div className="listItem">
              <div>
                <div className="candidateLabel">Decision</div>
                <div className="candidateReason">{visibleRejectedLaunch.decisionSummary}</div>
              </div>
              <div className="mono muted">{visibleRejectedLaunch.status}</div>
            </div>
            <div className="listItem">
              <div>
                <div className="candidateLabel">Blocker</div>
                <div className="candidateReason">{visibleRejectedLaunch.blockerSummary}</div>
              </div>
              <div className="mono muted">{visibleRejectedLaunch.flowContractRef}</div>
            </div>
          </div>
          <p className="panelNote mono muted">Evidence: {visibleRejectedLaunch.evidenceRefs.join(" · ")}</p>
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
          {visibleBuckets.map((bucket) => (
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
            {visibleBuckets.map((bucket) => (
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
            {visibleBuckets.map((bucket) => (
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
          {visibleBuckets.map((bucket) => (
            <HumanSplitBar key={bucket.date} bucket={bucket} max={maxHuman} />
          ))}
        </div>
      </section>
    </Shell>
  );
}
