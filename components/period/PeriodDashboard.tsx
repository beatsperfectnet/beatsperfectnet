"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatStepLabel } from "@/lib/today/flow";
import { mockPeriodState } from "@/lib/period/mockPeriodState";
import type { PeriodBucket, PeriodState } from "@/lib/period/types";
import { Shell } from "@/components/site/Shell";
import { MetricCard } from "@/components/site/MetricCard";

const VISIBLE_PERIOD_DAYS = 7;
const PERIOD_BAR_GAP_PX = 12;

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

function chartGridStyle(bucketCount: number) {
  if (bucketCount === 0) {
    return {
      width: "100%",
      gridTemplateColumns: "none"
    };
  }

  const width =
    bucketCount > VISIBLE_PERIOD_DAYS
      ? `calc(${bucketCount} * ((100% - ${(VISIBLE_PERIOD_DAYS - 1) * PERIOD_BAR_GAP_PX}px) / ${VISIBLE_PERIOD_DAYS}) + ${
          (bucketCount - 1) * PERIOD_BAR_GAP_PX
        }px)`
      : "100%";

  return {
    width,
    gridTemplateColumns: `repeat(${bucketCount}, minmax(0, 1fr))`
  };
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

function FlowTimelineCard({ state }: { state: PeriodState }) {
  const flowTimeline = state.flowTimeline ?? [];

  if (flowTimeline.length === 0) {
    return null;
  }

  return (
    <section className="card panel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">{state.flowVersion}</p>
          <h2>Active flow steps</h2>
        </div>
        <div className="mono muted">{flowTimeline.reduce((count, stage) => count + stage.stepIds.length, 0)} steps</div>
      </div>
      <p className="panelNote">
        This is the current contract step map shown alongside the historical charts so the daily tracker still reflects the active operating flow.
      </p>
      <div className="flowTimeline">
        {flowTimeline.map((stage) => (
          <div className="flowStage" key={`${stage.stageGroup}-${stage.stepIds.join("-")}`}>
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

export function PeriodDashboard({ state = mockPeriodState }: { state?: PeriodState }) {
  const [from, setFrom] = useState(state.from);
  const [to, setTo] = useState(state.to);
  const spendScrollerRef = useRef<HTMLDivElement | null>(null);
  const productScrollerRef = useRef<HTMLDivElement | null>(null);
  const syncingScrollRef = useRef(false);
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
  const gridStyle = useMemo(() => chartGridStyle(visibleBuckets.length), [visibleBuckets.length]);

  useEffect(() => {
    const scrollers = [spendScrollerRef.current, productScrollerRef.current].filter(
      (value): value is HTMLDivElement => Boolean(value)
    );

    if (scrollers.length === 0) {
      return;
    }

    requestAnimationFrame(() => {
      for (const scroller of scrollers) {
        scroller.scrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      }
    });
  }, [from, to, visibleBuckets.length]);

  function syncScroll(source: "spend" | "product") {
    const sourceScroller = source === "spend" ? spendScrollerRef.current : productScrollerRef.current;
    const targetScroller = source === "spend" ? productScrollerRef.current : spendScrollerRef.current;

    if (!sourceScroller || !targetScroller || syncingScrollRef.current) {
      return;
    }

    syncingScrollRef.current = true;
    targetScroller.scrollLeft = sourceScroller.scrollLeft;

    requestAnimationFrame(() => {
      syncingScrollRef.current = false;
    });
  }

  return (
    <Shell
      title="Period"
      subtitle="Daily operating history for BeatsPerfect. BeatsPerfect - Focused digital products."
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
        <p className="panelNote">
          Snapshot as of {state.asOf ?? "the current records"}.
          Netlify is treated as a once-per-day history publish rather than an event-driven live dashboard for now.
        </p>
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
        <div className="periodScroller" ref={spendScrollerRef} onScroll={() => syncScroll("spend")}>
          <div className="periodGrid" style={gridStyle}>
            {visibleBuckets.map((bucket) => (
              <SpendBar key={bucket.date} bucket={bucket} max={maxSpend} />
            ))}
          </div>
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
        <div className="periodScroller" ref={productScrollerRef} onScroll={() => syncScroll("product")}>
          <div className="periodGrid" style={gridStyle}>
            {visibleBuckets.map((bucket) => (
              <ProductBar key={bucket.date} bucket={bucket} max={maxProducts} />
            ))}
          </div>
        </div>
      </section>

      <FlowTimelineCard state={state} />

      <section className="card panel periodPublishLink">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Publishing</p>
            <h2>Ready for Publish / Published Products</h2>
          </div>
        </div>
        <p className="panelNote">The live storefront for ready-for-publish and published BeatsPerfect products.</p>
        <a className="periodExternalLink" href="https://beatsperfect.shop" target="_blank" rel="noreferrer">
          beatsperfect.shop
        </a>
      </section>
    </Shell>
  );
}
