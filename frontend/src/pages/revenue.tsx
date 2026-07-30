import * as React from "react";
import { Link } from "@/lib/navigation";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, Download, TrendingDown, TrendingUp } from "lucide-react";
import { useLocale } from "@/i18n/locale-context";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { fleetKeys, useFleet } from "@/store/fleet-store";
import { downloadFile, formatCurrency, formatCurrencyPrecise, toCsv } from "@/lib/utils";

const periods = {
  quarter: { label: "This quarter", months: 3 },
  half: { label: "Last 6 months", months: 6 },
  year: { label: "This year", months: 12 },
} as const;

const financialActivity: {
  tx: string;
  vehicle: string;
  category: string;
  date: string;
  amount: number;
}[] = [];

export default function RevenuePage() {
  const { t } = useLocale();
  const { vehicles } = useFleet();
  const toast = useToast();
  const [period, setPeriod] = React.useState<keyof typeof periods>("year");

  const { data: analytics } = useQuery({
    queryKey: fleetKeys.analytics,
    queryFn: api.analyticsSummary,
  });
  const expenseCategories = analytics?.expenseCategories ?? [];
  const spendTrend = analytics?.spendTrend ?? [];

  const data = spendTrend.slice(-periods[period].months);
  const totalSpend = data.reduce((s, r) => s + r.actual, 0);
  const previousSpend = data.reduce((s, r) => s + r.previous, 0);
  const variance = totalSpend - previousSpend;
  const costPerVehicle = vehicles.length ? Math.round(totalSpend / vehicles.length) : 0;
  const latestMonth = data[data.length - 1];

  const downloadReport = () => {
    downloadFile(
      "driveflow-financial-overview.csv",
      toCsv(data.map((r) => ({ Month: r.month, ActualSpend: r.actual, PreviousYear: r.previous }))),
    );
    toast({ title: "Report downloaded", description: `${periods[period].label} financial data exported as CSV.` });
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <PageHeader
        title={t("page.revenue.title")}
        description={t("page.revenue.desc")}
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Financial Overview" }]}
        actions={
          <>
            <Button variant="secondary" onClick={downloadReport}>
              <Download /> Download Report
            </Button>
            <Select value={period} onValueChange={(v) => setPeriod(v as keyof typeof periods)}>
              <SelectTrigger className="w-[170px]">
                <span className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(periods).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total spend"
          value={formatCurrency(totalSpend)}
          badge={`${variance >= 0 ? "+" : ""}${Math.round((variance / Math.max(1, previousSpend)) * 1000) / 10}%`}
          negative={variance > 0}
          accent
        />
        <MetricCard
          title="Avg. cost per vehicle"
          value={formatCurrency(costPerVehicle)}
          sub={<span className="text-sm text-muted-foreground">Across {vehicles.length} assets</span>}
        />
        <MetricCard
          title="Latest month"
          value={formatCurrency(latestMonth?.actual ?? 0)}
          sub={<span className="text-sm text-muted-foreground">{latestMonth?.month} spend</span>}
        />
        <MetricCard
          title="Projected annual budget"
          value="$1.8M"
          sub={<Badge>82% used</Badge>}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly spending trends</CardTitle>
            <CardDescription>Actual spend compared with the same period last year</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} width={70} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
                  formatter={(v: number, name) => [formatCurrency(v), name === "actual" ? "Actual spend" : "Previous year"]}
                />
                <Legend formatter={(value) => (value === "actual" ? "Actual spend" : "Previous year")} />
                <Area type="monotone" dataKey="previous" stroke="#CBD5E1" strokeWidth={2} fill="transparent" />
                <Area type="monotone" dataKey="actual" stroke="#2563EB" strokeWidth={3} fill="url(#actualFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {expenseCategories.map((c) => (
              <div key={c.category}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>{c.category}</span>
                  <span className="font-semibold">{c.share}%</span>
                </div>
                <Progress value={c.share} />
                <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(c.amount)}</p>
              </div>
            ))}
            <Link href="/reports" className="inline-block pt-2 text-sm font-semibold text-primary hover:underline">
              View detailed breakdown →
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Spend comparison</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Actual spend ({periods[period].label.toLowerCase()})</p>
            <p className="text-3xl font-bold">{formatCurrency(totalSpend)}</p>
            <div className="mt-4 flex items-center gap-2">
              <span
                className={
                  variance <= 0
                    ? "flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                    : "flex size-9 items-center justify-center rounded-full bg-red-50 text-red-500"
                }
              >
                {variance <= 0 ? <TrendingDown className="size-4" /> : <TrendingUp className="size-4" />}
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Budget variance</p>
                <p className="font-bold">
                  {variance <= 0 ? "-" : "+"}
                  {formatCurrency(Math.abs(variance))} ({variance <= 0 ? "under" : "over"})
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Most savings come from optimized maintenance scheduling and consolidated fuel contracts.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent financial activity</CardTitle>
            <Link href="/payments" className="text-sm font-semibold text-primary hover:underline">
              See all transactions →
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <THead>
                <TR>
                  <TH>Transaction</TH>
                  <TH>Vehicle ID</TH>
                  <TH>Category</TH>
                  <TH>Date</TH>
                  <TH className="text-right">Amount</TH>
                </TR>
              </THead>
              <TBody>
                {financialActivity.map((row) => (
                  <TR key={row.tx}>
                    <TD className="font-medium">{row.tx}</TD>
                    <TD className="text-muted-foreground">{row.vehicle}</TD>
                    <TD>
                      <Badge variant="muted">{row.category}</Badge>
                    </TD>
                    <TD className="whitespace-nowrap text-muted-foreground">{row.date}</TD>
                    <TD className="text-right font-bold">{formatCurrencyPrecise(row.amount)}</TD>
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

function MetricCard({
  title,
  value,
  badge,
  sub,
  accent,
  negative,
}: {
  title: string;
  value: string;
  badge?: string;
  sub?: React.ReactNode;
  accent?: boolean;
  negative?: boolean;
}) {
  return (
    <Card className={accent ? "border-l-4 border-l-primary p-5" : "p-5"}>
      <p className="text-sm text-muted-foreground">{title}</p>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <p className="text-3xl font-bold">{value}</p>
        {badge ? <Badge variant={negative ? "danger" : "success"}>{badge}</Badge> : null}
      </div>
      {sub ? <div className="mt-2">{sub}</div> : null}
    </Card>
  );
}
