import { prisma } from "../config/prisma.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export async function getDashboardSummary() {
  const [vehicles, bookings, customers, payments, maintenance, drivers] = await Promise.all([
    prisma.vehicle.findMany(),
    prisma.booking.findMany(),
    prisma.customer.findMany(),
    prisma.payment.findMany({ include: { customer: true, vehicle: true } }),
    prisma.maintenance.findMany(),
    prisma.driver.findMany(),
  ]);

  const available = vehicles.filter((v) => v.status === "AVAILABLE").length;
  const inMaintenance = vehicles.filter((v) => v.status === "MAINTENANCE").length;
  const activeRentals = bookings.filter((b) => b.status === "ACTIVE").length;
  const pendingPayments = payments.filter((p) => p.status === "PENDING").length;
  const successfulPayments = payments.filter((p) => p.status === "SUCCESS");
  const monthlyRevenue = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const utilizationRate =
    vehicles.length === 0 ? 0 : Math.round(((vehicles.length - available) / vehicles.length) * 100);

  const categoryCounts = new Map<string, number>();
  for (const v of vehicles) {
    categoryCounts.set(v.category, (categoryCounts.get(v.category) ?? 0) + 1);
  }
  const palette = ["#2563eb", "#0ea5e9", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];
  const fleetMix = [...categoryCounts.entries()].map(([name, value], i) => ({
    name,
    value,
    color: palette[i % palette.length],
  }));

  const now = new Date();
  const revenueByMonth = new Map<string, { value: number; bookings: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    revenueByMonth.set(monthKey(d), { value: 0, bookings: 0 });
  }
  for (const p of successfulPayments) {
    const d = p.paidAt ?? p.createdAt;
    const key = monthKey(d);
    const bucket = revenueByMonth.get(key);
    if (bucket) bucket.value += Number(p.amount);
  }
  for (const b of bookings) {
    const key = monthKey(b.createdAt);
    const bucket = revenueByMonth.get(key);
    if (bucket) bucket.bookings += 1;
  }

  const revenueChart = [...revenueByMonth.entries()].map(([key, data]) => {
    const [, month] = key.split("-").map(Number);
    return { month: MONTHS[month], value: Math.round(data.value), bookings: data.bookings };
  });

  const rentalsByVehicle = new Map<string, { name: string; rentals: number; revenue: number }>();
  for (const b of bookings) {
    const vehicle = vehicles.find((v) => v.id === b.vehicleId);
    if (!vehicle) continue;
    const cur = rentalsByVehicle.get(vehicle.id) ?? {
      name: vehicle.name,
      rentals: 0,
      revenue: 0,
    };
    cur.rentals += 1;
    cur.revenue += Number(b.amount);
    rentalsByVehicle.set(vehicle.id, cur);
  }
  const mostRentedVehicles = [...rentalsByVehicle.values()]
    .sort((a, b) => b.rentals - a.rentals)
    .slice(0, 5);

  const expenseTotal = maintenance.reduce((s, m) => s + Number(m.cost), 0);
  const expenseCategories =
    expenseTotal > 0
      ? [
          {
            category: "Maintenance",
            amount: Math.round(expenseTotal),
            share: 100,
          },
        ]
      : [];

  const activities = [
    ...bookings.slice(0, 3).map((b) => ({
      id: `b-${b.id}`,
      title: "Booking update",
      description: `Booking ${b.id.slice(0, 8)} is ${b.status.toLowerCase()}`,
      time: b.updatedAt.toISOString(),
      icon: "check" as const,
    })),
    ...successfulPayments.slice(0, 2).map((p) => ({
      id: `p-${p.id}`,
      title: "Payment received",
      description: `${p.customer?.name ?? "Customer"} · $${Number(p.amount).toFixed(0)}`,
      time: (p.paidAt ?? p.createdAt).toISOString(),
      icon: "payment" as const,
    })),
    ...maintenance.slice(0, 2).map((m) => ({
      id: `m-${m.id}`,
      title: "Maintenance",
      description: m.title,
      time: m.updatedAt.toISOString(),
      icon: "maintenance" as const,
    })),
  ].slice(0, 8);

  const regions = new Set(vehicles.map((v) => v.location).filter(Boolean)).size;

  return {
    dashboardStats: {
      totalVehicles: vehicles.length,
      available,
      activeRentals,
      monthlyRevenue: Math.round(monthlyRevenue),
      pendingPayments,
      inMaintenance,
      regions,
      utilizationRate,
      activeRenters: customers.filter((c) => c.status === "ACTIVE").length,
      lateReturns: bookings.filter((b) => b.status === "OVERDUE").length,
      newThisMonth: customers.filter((c) => {
        const created = c.createdAt;
        return (
          created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
        );
      }).length,
    },
    fleetMix,
    revenueChart,
    yearlyRevenueChart: revenueChart,
    mostRentedVehicles,
    expenseCategories,
    spendTrend: revenueChart.map((r, i, arr) => ({
      month: r.month,
      actual: r.value,
      previous: arr[i - 1]?.value ?? 0,
    })),
    activities,
    driverLeaderboard: drivers
      .slice()
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 5)
      .map((d) => ({
        id: d.id,
        name: d.name,
        trips: d.trips,
        rating: d.rating,
        performance: d.performance,
      })),
  };
}
