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
  return {
    launchedCount: sumBuckets(buckets, (bucket) => bucket.launchedCount),
    readyForLaunchCount: sumBuckets(buckets, (bucket) => bucket.readyForLaunchCount),
    rejectedCount: sumBuckets(buckets, (bucket) => bucket.rejectedCount),
    totalSpendUsd: sumBuckets(buckets, (bucket) => bucket.totalSpendUsd),
    buildSpendUsd: sumBuckets(buckets, (bucket) => bucket.buildSpendUsd),
    governanceApiCostUsd: sumBuckets(buckets, (bucket) => bucket.governanceApiCostUsd),
    otherSpendUsd: sumBuckets(buckets, (bucket) => bucket.otherSpendUsd)
  };
}

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function SpendBar({ bucket, max }: { bucket: PeriodBucket; max: number }) {
  const total = bucket.totalSpendUsd;
  const height = max === 0 || total === 0 ? 0 : Math.max(10, (total / max) * 190);
  const buildPct = total ? (bucket.buildSpendUsd / total) * 100 : 0;
  const governancePct = total ? (bucket.governanceApiCostUsd / total) * 100 : 0;
  const otherPct = total ? (bucket.otherSpendUsd / total) * 100 : 0;

  return (
    <div className="periodBar">
      <div className="periodBarTrack periodStackTrack">
        <div className="periodStack" style={{ height }}>
          <div className="periodStackPart build" style={{ height: `${buildPct}%` }} />
          <div className="periodStackPart governance" style={{ height: `${governancePct}%` }} />
          <div className="periodStackPart other" style={{ height: `${otherPct}%` }} />
        </div>
      </div>
      <div className="periodBarLabel">{bucket.date.slice(5)}</div>
      <div className="periodBarValue mono">{money(total)}</div>
    </div>
  );
}

function ProductBar({ bucket, max }: { bucket: PeriodBucket; max: number }) {
  const total = bucket.launchedCount + bucket.readyForLaunchCount + bucket.rejectedCount;
  const height = max === 0 || total === 0 ? 0 : Math.max(10, (total / max) * 190);
  const launchedPct = total ? (bucket.launchedCount / total) * 100 : 0;
  const readyPct = total ? (bucket.readyForLaunchCount / total) * 100 : 0;
  const rejectedPct = total ? (bucket.rejectedCount / total) * 100 : 0;

  return (
    <div className="periodBar">
      <div className="periodBarTrack periodStackTrack">
        <div className="periodStack" style={{ height }}>
          <div className="periodStackPart launched" style={{ height: `${launchedPct}%` }} />
          <div className="periodStackPart ready" style={{ height: `${readyPct}%` }} />
          <div className="periodStackPart rejected" style={{ height: `${rejectedPct}%` }} />
        </div>
      </div>
      <div className="periodBarLabel">{bucket.date.slice(5)}</div>
      <div className="periodBarValue mono">{total}</div>
    </div>
  );
}

function Legend({ items }: { items: Array<{ label: string; className: string }> }) {
  return (
    <div className="chartLegend">
      {items.map((item) => (
        <span key={item.label} className="legendItem">
          <span className={`legendSwatch ${item.className}`} />
          {item.label}
        </span>
      ))}
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
  const maxSpend = useMemo(() => Math.max(...visibleBuckets.map((bucket) => bucket.totalSpendUsd), 0), [visibleBuckets]);
  const maxProducts = useMemo(
    () =>
      Math.max(
        ...visibleBuckets.map((bucket) => bucket.launchedCount + bucket.readyForLaunchCount + bucket.rejectedCount),
        0
      ),
    [visibleBuckets]
  );

  return (
    <Shell
      title="Period"
      subtitle="Daily spend and product outcomes for the selected period."
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
          <div className="mono muted">
            {from} to {to}
          </div>
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
        <MetricCard label="Spend" value={money(visibleTotals.totalSpendUsd)} tone="neutral" />
        <MetricCard label="Launched" value={visibleTotals.launchedCount} tone="success" />
        <MetricCard label="Ready for launch" value={visibleTotals.readyForLaunchCount} tone="pipeline" />
        <MetricCard label="Rejected" value={visibleTotals.rejectedCount} tone="danger" />
      </section>

      <section className="card panel">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Spend</p>
            <h2>Total and split by day</h2>
          </div>
          <div className="mono muted">
            Build {money(visibleTotals.buildSpendUsd)} / Governance {money(visibleTotals.governanceApiCostUsd)} / Other{" "}
            {money(visibleTotals.otherSpendUsd)}
          </div>
        </div>
        <Legend
          items={[
            { label: "Build", className: "build" },
            { label: "Governance", className: "governance" },
            { label: "Other", className: "other" }
          ]}
        />
        <div className="periodGrid">
          {visibleBuckets.map((bucket) => (
            <SpendBar key={bucket.date} bucket={bucket} max={maxSpend} />
          ))}
        </div>
      </section>

      <section className="card panel">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Products</p>
            <h2>Launched, ready, rejected by day</h2>
          </div>
          <div className="mono muted">
            {visibleTotals.launchedCount} launched / {visibleTotals.readyForLaunchCount} ready / {visibleTotals.rejectedCount} rejected
          </div>
        </div>
        <Legend
          items={[
            { label: "Launched", className: "launched" },
            { label: "Ready", className: "ready" },
            { label: "Rejected", className: "rejected" }
          ]}
        />
        <div className="periodGrid">
          {visibleBuckets.map((bucket) => (
            <ProductBar key={bucket.date} bucket={bucket} max={maxProducts} />
          ))}
        </div>
      </section>
    </Shell>
  );
}
