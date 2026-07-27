export async function fetchFleetSummary() {
  const { dashboardStats } = await import("@/data/mock");
  return dashboardStats;
}
