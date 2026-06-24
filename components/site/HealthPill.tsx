import type { Health } from "@/lib/today/types";

const labels: Record<Health, string> = {
  green: "green",
  yellow: "yellow",
  red: "red"
};

export function HealthPill({ label, value }: { label: string; value: Health }) {
  return <span className={`pill ${value}`}>{label}: {labels[value]}</span>;
}
