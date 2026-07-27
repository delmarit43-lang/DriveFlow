"use client";

import * as React from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Download,
  KeyRound,
  MessageCircle,
  UserPlus,
  Wrench,
} from "lucide-react";
import { NewBookingButton } from "@/components/bookings/new-booking-button";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useVehicleDialog } from "@/components/vehicles/vehicle-dialog-provider";
import { activities, dashboardStats, fleetMix, revenueChart, yearlyRevenueChart } from "@/data/mock";
import { useFleet } from "@/store/fleet-store";
import { bookingStatusMeta } from "@/lib/status";
import { cn, downloadFile, formatCurrency, toCsv } from "@/lib/utils";

const activityIcons = {
  check: CheckCircle2,
  payment: DollarSign,
  maintenance: Wrench,
  user: UserPlus,
} as const;

export default function DashboardPage() {
  const { vehicles, bookings, customers } = useFleet();
  const { openCreate } = useVehicleDialog();
  const toast = useToast();
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true });
  const [range, setRange] = React.useState<"6M" | "1Y">("6M");

  const chartData = range === "6M" ? revenueChart : yearlyRevenueChart;
  const upcomingReturns = bookings.filter((b) => b.status === "active" || b.status === "overdue");
  const topCustomers = [...customers].sort((a, b) => b.lifetimeSpend - a.lifetimeSpend).slice(0, 4);

  const exportReport = () => {
    downloadFile(
      "driveflow-fleet-overview.csv",
      toCsv(
        chartData.map((row) => ({ Month: row.month, Revenue: row.value, Bookings: row.bookings })),
      ),
    );
    toast({ title: "Report exported", description: `${range} revenue summary downloaded as CSV.` });
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <PageHeader
        title="Fleet Overview"
        description={`Managing ${dashboardStats.totalVehicles} luxury assets across ${dashboardStats.regions} regions.`}
        actions={
          <>
            <Button variant="secondary" onClick={exportReport}>
              <Download /> Export Report
            </Button>
            <NewBookingButton />
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Total Vehicles"
          value={String(dashboardStats.totalVehicles)}
          icon={<Car />}
          hint={<Badge variant="success">+2.4%</Badge>}
        />
        <StatCard
          label="Available"
          value={String(dashboardStats.available)}
          icon={<CheckCircle2 />}
          tone="green"
          hint={
            <Badge variant="success" dot>
              Healthy
            </Badge>
          }
        />
        <StatCard
          label="Active Rentals"
          value={String(dashboardStats.activeRentals)}
          icon={<KeyRound />}
          hint={
            <Badge variant="default" dot>
              Active
            </Badge>
          }
        />
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(dashboardStats.monthlyRevenue)}
          icon={<DollarSign />}
          hint={<Badge variant="success">+18.5%</Badge>}
        />
        <StatCard
          label="Pending Payments"
          value={String(dashboardStats.pendingPayments)}
          icon={<Clock3 />}
          tone="red"
          hint={<span className="text-xs font-semibold text-red-500">Action Required</span>}
        />
        <StatCard
          label="In Maintenance"
          value={String(dashboardStats.inMaintenance)}
          icon={<Wrench />}
          tone="amber"
          hint={<Badge variant="warning">3 overdue</Badge>}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Revenue Performance</CardTitle>
              <CardDescription>Revenue growth trends</CardDescription>
            </div>
            <div className="flex gap-1 rounded-xl bg-muted p-1 text-xs font-semibold">
              {(["6M", "1Y"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 transition",
                    range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="h-72 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={range === "6M" ? 32 : 18}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
                  formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={`hsl(221 83% ${Math.max(38, 70 - i * (range === "6M" ? 4 : 2))}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Availability</CardTitle>
            <CardDescription>Fleet utilization snapshot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mx-auto h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={fleetMix} innerRadius={58} outerRadius={78} paddingAngle={3} dataKey="value">
                    {fleetMix.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, name) => [`${v} cars`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{dashboardStats.utilizationRate}%</span>
                <span className="text-xs text-muted-foreground">Utilization</span>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {fleetMix.map((item) => (
                <li key={item.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-medium">{item.value} Cars</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Latest Bookings</CardTitle>
            <Link href="/bookings" className="text-sm font-semibold text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <THead>
                <TR>
                  <TH>Client</TH>
                  <TH>Vehicle</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Amount</TH>
                </TR>
              </THead>
              <TBody>
                {bookings.slice(0, 5).map((b) => {
                  const customer = customers.find((c) => c.id === b.customerId);
                  const vehicle = vehicles.find((v) => v.id === b.vehicleId);
                  const meta = bookingStatusMeta[b.status];
                  return (
                    <TR key={b.id}>
                      <TD className="font-medium">
                        <Link href={`/bookings/${b.id}`} className="hover:text-primary">
                          {customer?.name ?? "Unknown"}
                        </Link>
                      </TD>
                      <TD className="text-muted-foreground">{vehicle?.name ?? "Unassigned"}</TD>
                      <TD>
                        <Badge variant={meta.variant} dot>
                          {meta.label}
                        </Badge>
                      </TD>
                      <TD className="text-right font-semibold">{formatCurrency(b.amount)}</TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="relative">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            {activities.map((a) => {
              const Icon = activityIcons[a.icon];
              return (
                <div key={a.id} className="flex gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
          <Button
            size="icon"
            className="absolute bottom-5 right-5 rounded-full shadow-lift"
            aria-label="Open support chat"
            asChild
          >
            <Link href="/support">
              <MessageCircle />
            </Link>
          </Button>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {topCustomers.map((c) => (
              <Link key={c.id} href={`/customers/${c.id}`} className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-muted/60">
                <Avatar src={c.avatar} name={c.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.totalRentals} Bookings • {c.tier.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(c.lifetimeSpend)}</p>
                  <p className="text-xs text-emerald-600">LTV ↑</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Upcoming Returns</CardTitle>
            <div className="flex gap-1">
              <Button variant="secondary" size="icon" aria-label="Previous" onClick={() => emblaApi?.scrollPrev()}>
                <ChevronLeft />
              </Button>
              <Button variant="secondary" size="icon" aria-label="Next" onClick={() => emblaApi?.scrollNext()}>
                <ChevronRight />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden pt-0">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex gap-4">
                {upcomingReturns.map((b) => {
                  const v = vehicles.find((veh) => veh.id === b.vehicleId);
                  if (!v) return null;
                  return (
                    <div
                      key={b.id}
                      className="min-w-[240px] flex-[0_0_240px] overflow-hidden rounded-2xl border border-border bg-muted/20"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.image} alt={v.name} className="h-28 w-full object-cover" />
                      <div className="space-y-2 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold">{v.model}</p>
                          <Badge variant={b.status === "overdue" ? "danger" : "warning"}>
                            {b.status === "overdue" ? "OVERDUE" : "DUE SOON"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {b.pickupLocation} · returns {b.return}
                        </p>
                        <Link href={`/bookings/${b.id}`} className="inline-block text-sm font-semibold text-primary hover:underline">
                          Manage →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump straight into your most common daily tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-0 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="secondary" className="h-auto justify-start gap-3 py-4" onClick={openCreate}>
              <Car /> Add a vehicle
            </Button>
            <Button variant="secondary" className="h-auto justify-start gap-3 py-4" asChild>
              <Link href="/customers">
                <UserPlus /> Manage customers
              </Link>
            </Button>
            <Button variant="secondary" className="h-auto justify-start gap-3 py-4" asChild>
              <Link href="/maintenance">
                <Wrench /> Schedule maintenance
              </Link>
            </Button>
            <Button variant="secondary" className="h-auto justify-start gap-3 py-4" asChild>
              <Link href="/reports">
                <Download /> Build a report
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
