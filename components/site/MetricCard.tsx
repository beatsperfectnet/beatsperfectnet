import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  note,
  tone = "neutral"
}: {
  label: string;
  value: ReactNode;
  note?: string;
  tone?: "neutral" | "pipeline" | "success" | "warning" | "accent" | "danger";
}) {
  return (
    <section className={`card metric tone-${tone}`}>
      <div className="metricLabel">{label}</div>
      <div className="metricValue">{value}</div>
      {note ? <div className="metricNote">{note}</div> : null}
    </section>
  );
}
