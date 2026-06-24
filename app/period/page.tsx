import { PeriodDashboard } from "@/components/period/PeriodDashboard";
import { loadPeriodState } from "@/lib/dashboard/loadDashboardState";

export default async function PeriodPage() {
  const state = await loadPeriodState();

  return (
    <PeriodDashboard
      state={state}
    />
  );
}
