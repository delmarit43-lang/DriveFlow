"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Gauge, Repeat, Target, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dashboardStats, revenueChart } from "@/data/mock";
import { useFleet } from "@/store/fleet-store";
import { formatCurrency } from "@/lib/utils";

const radarData = [
  { metric: "Utilization", score: 69 },
  { metric: "Uptime", score: 94 },
  { metric: "Satisfaction", score: 88 },
  { metric: "On-time returns", score: 76 },
  { metric: "Cost control", score: 82 },
  { metric: "Driver score", score: 91 },
];

const locationPerformance = [
  { location: "Downtown Hub", utilization: 82, revenue: 42800 },
  { location: "Airport T2", utilization: 74, revenue: 38100 },
  { location: "City Center Hub", utilization: 61, revenue: 21400 },
  { location: "East Station", utilization: 55, revenue: 14900 },
  { location: "North Depot", utilization: 41, revenue: 7300 },
];

export default function AnalyticsPage() {
  const { vehicles, bookings, customers } = useFleet();

  const completed = bookings.filter((b) => b.status === "completed").length;
  const conversion = bookings.length ? Math.round((completed / bookings.length) * 1000) / 10 : 0;
  const repeatCustomers = customers.filter((c) => c.totalRentals > 10).length;
  const repeatRate = customers.length ? Math.round((repeatCustomers / customers.length) * 100) : 0;
  const uptime = vehicles.length
    ? Math.round(vehicles.reduce((sum, v) => sum + v.health, 0) / vehicles.length)
    : 0;
  const avgDailyRate = vehicles.length
    ? Math.round(vehicles.reduce((sum, v) => sum + v.dailyRate, 0) / vehicles.length)
    : 0;

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <PageHeader
        title="Analytics"
        description="Advanced fleet, revenue, and customer insights."
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Analytics" }]}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Booking conversion"
          value={`${conversion}%`}
          icon={<Target />}
          hint={<Badge variant="success">+2.1 pts</Badge>}
        />
        <StatCard label="Fleet uptime" value={`${uptime}%`} icon={<Gauge />} tone="green" />
        <StatCard label="Repeat customer rate" value={`${repeatRate}%`} icon={<Repeat />} tone="violet" />
        <StatCard label="Avg. daily rate" value={formatCurrency(avgDailyRate)} icon={<TrendingUp />} tone="amber" />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue momentum</CardTitle>
            <CardDescription>Cumulative revenue growth across the last six months</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} width={70} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
                  formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                />
                <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational scorecard</CardTitle>
            <CardDescription>Balanced view of fleet health</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748B", fontSize: 11 }} />
                <Radar dataKey="score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.25} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Location performance</CardTitle>
            <CardDescription>Utilization and revenue by pickup hub</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            {locationPerformance.map((l) => (
              <div key={l.location}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{l.location}</span>
                  <span className="text-muted-foreground">
                    {l.utilization}% · {formatCurrency(l.revenue)}
                  </span>
                </div>
                <Progress value={l.utilization} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key indicators</CardTitle>
            <CardDescription>Snapshot of this month&rsquo;s operating metrics</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-0 sm:grid-cols-2">
            {[
              { icon: Users, label: "Active renters", value: String(dashboardStats.activeRenters) },
              { icon: Activity, label: "Late returns", value: String(dashboardStats.lateReturns) },
              { icon: Repeat, label: "New customers", value: String(dashboardStats.newThisMonth) },
              { icon: Gauge, label: "Vehicles in shop", value: String(dashboardStats.inMaintenance) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-border p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Icon className="size-3.5" /> {label}
                </p>
                <p className="mt-2 text-2xl font-bold">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
