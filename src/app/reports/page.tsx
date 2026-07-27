"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, FileSpreadsheet, FileText, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { dashboardStats, fleetMix, mostRentedVehicles, revenueChart, yearlyRevenueChart } from "@/data/mock";
import { useFleet } from "@/store/fleet-store";
import { downloadFile, formatCurrency, toCsv } from "@/lib/utils";

export default function ReportsPage() {
  const { drivers, customers } = useFleet();
  const toast = useToast();
  const [period, setPeriod] = React.useState<"6M" | "1Y">("6M");

  const data = period === "6M" ? revenueChart : yearlyRevenueChart;
  const totalRevenue = data.reduce((s, r) => s + r.value, 0);
  const totalBookings = data.reduce((s, r) => s + r.bookings, 0);
  const avgBookingValue = Math.round(totalRevenue / Math.max(1, totalBookings));

  const exportExcel = () => {
    downloadFile(
      "driveflow-report.csv",
      toCsv(data.map((r) => ({ Month: r.month, Revenue: r.value, Bookings: r.bookings }))),
    );
    toast({ title: "Excel export ready", description: `${period} performance data downloaded as CSV.` });
  };

  const exportPdf = () => {
    toast({ title: "Preparing PDF", description: "Opening the print dialog to save as PDF.", tone: "info" });
    setTimeout(() => window.print(), 400);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <PageHeader
        title="Reports"
        description="Revenue analytics, fleet utilization, and operational reporting."
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Reports" }]}
        actions={
          <>
            <Select value={period} onValueChange={(v) => setPeriod(v as "6M" | "1Y")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6M">Last 6 months</SelectItem>
                <SelectItem value="1Y">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={exportPdf}>
              <FileText /> Download PDF
            </Button>
            <Button onClick={exportExcel}>
              <FileSpreadsheet /> Export Excel
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={formatCurrency(totalRevenue)} icon={<TrendingUp />} tone="green" />
        <StatCard label="Total bookings" value={totalBookings.toLocaleString()} icon={<Download />} />
        <StatCard label="Avg. booking value" value={formatCurrency(avgBookingValue)} icon={<FileText />} tone="violet" />
        <StatCard
          label="Utilization rate"
          value={`${dashboardStats.utilizationRate}%`}
          icon={<TrendingUp />}
          tone="amber"
          hint={<Badge variant="success">+4.2 pts</Badge>}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue analytics</CardTitle>
            <CardDescription>Revenue and booking volume side by side</CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis
                  yAxisId="revenue"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  width={70}
                />
                <YAxis
                  yAxisId="bookings"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  width={44}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
                  formatter={(v: number, name) => [name === "Revenue" ? formatCurrency(v) : v, name]}
                />
                <Legend />
                <Bar yAxisId="revenue" dataKey="value" name="Revenue" fill="#2563EB" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="bookings" dataKey="bookings" name="Bookings" fill="#93C5FD" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fleet utilization</CardTitle>
            <CardDescription>Current status split</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={fleetMix} dataKey="value" innerRadius={50} outerRadius={78} paddingAngle={3}>
                    {fleetMix.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, name) => [`${v} cars`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Utilization rate</span>
                <span className="font-bold">{dashboardStats.utilizationRate}%</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Most rented vehicle</span>
                <span className="font-bold">{mostRentedVehicles[0].name}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Avg. rental length</span>
                <span className="font-bold">4.2 days</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most rented vehicles</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <THead>
                <TR>
                  <TH>Vehicle</TH>
                  <TH>Rentals</TH>
                  <TH className="text-right">Revenue</TH>
                </TR>
              </THead>
              <TBody>
                {mostRentedVehicles.map((v) => (
                  <TR key={v.name}>
                    <TD className="font-medium">{v.name}</TD>
                    <TD>
                      <div className="flex items-center gap-3">
                        <Progress value={(v.rentals / mostRentedVehicles[0].rentals) * 100} className="w-24" />
                        <span className="text-sm font-semibold">{v.rentals}</span>
                      </div>
                    </TD>
                    <TD className="text-right font-semibold">{formatCurrency(v.revenue)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking trend</CardTitle>
            <CardDescription>Reservation volume over the period</CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} width={40} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} />
                <Line type="monotone" dataKey="bookings" stroke="#2563EB" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Driver performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {[...drivers]
              .sort((a, b) => b.performance - a.performance)
              .slice(0, 5)
              .map((d) => (
                <div key={d.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{d.name}</span>
                    <span className="text-muted-foreground">
                      {d.trips} trips · ★ {d.rating}
                    </span>
                  </div>
                  <Progress value={d.performance} />
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer report</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH>Tier</TH>
                  <TH>Rentals</TH>
                  <TH className="text-right">Lifetime spend</TH>
                </TR>
              </THead>
              <TBody>
                {[...customers]
                  .sort((a, b) => b.lifetimeSpend - a.lifetimeSpend)
                  .slice(0, 5)
                  .map((c) => (
                    <TR key={c.id}>
                      <TD className="font-medium">{c.name}</TD>
                      <TD>
                        <Badge variant={c.tier === "standard" ? "muted" : "default"}>{c.tier.toUpperCase()}</Badge>
                      </TD>
                      <TD>{c.totalRentals}</TD>
                      <TD className="text-right font-semibold">{formatCurrency(c.lifetimeSpend)}</TD>
                    </TR>
                  ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
