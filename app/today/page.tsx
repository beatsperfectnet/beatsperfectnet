import { TodayDashboard } from "@/components/today/TodayDashboard";
import { loadTodayState } from "@/lib/dashboard/loadDashboardState";

export default async function TodayPage() {
  const state = await loadTodayState();

  return (
    <TodayDashboard
      state={state}
    />
  );
}
