"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  Droplets,
  FileCheck2,
  Gauge,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { serviceHistory } from "@/data/mock";
import { useFleet } from "@/store/fleet-store";
import { cn, formatCurrency } from "@/lib/utils";
import type { MaintenanceType } from "@/types";

const typeIcons: Record<MaintenanceType, React.ElementType> = {
  "Oil Change": Droplets,
  "Tyre Replacement": Gauge,
  "Brake Service": Wrench,
  Insurance: ShieldCheck,
  Registration: FileCheck2,
  Inspection: Check,
};

const priorityMeta = {
  high: { label: "High", variant: "danger" as const },
  medium: { label: "Medium", variant: "warning" as const },
  low: { label: "Low", variant: "muted" as const },
};

const statusMeta = {
  scheduled: { label: "Scheduled", variant: "default" as const },
  "in-progress": { label: "In progress", variant: "warning" as const },
  completed: { label: "Completed", variant: "success" as const },
};

export default function MaintenancePage() {
  const { vehicles, maintenanceTasks, completeMaintenance } = useFleet();
  const toast = useToast();

  const open = maintenanceTasks.filter((t) => t.status !== "completed");
  const completed = maintenanceTasks.filter((t) => t.status === "completed");
  const highPriority = open.filter((t) => t.priority === "high").length;
  const projectedCost = open.reduce((sum, t) => sum + t.cost, 0);
  const inShop = vehicles.filter((v) => v.status === "maintenance");
  const needsAttention = [...vehicles].sort((a, b) => a.health - b.health).slice(0, 5);

  const renderTasks = (tasks: typeof maintenanceTasks) =>
    tasks.length === 0 ? (
      <EmptyState
        icon={<Wrench />}
        title="Nothing scheduled"
        description="All maintenance work in this view is up to date."
        className="border-0"
      />
    ) : (
      <Table>
        <THead>
          <TR>
            <TH>Service</TH>
            <TH>Vehicle</TH>
            <TH>Due date</TH>
            <TH>Garage</TH>
            <TH>Priority</TH>
            <TH>Status</TH>
            <TH className="text-right">Cost</TH>
            <TH />
          </TR>
        </THead>
        <TBody>
          {tasks.map((t) => {
            const vehicle = vehicles.find((v) => v.id === t.vehicleId);
            const Icon = typeIcons[t.type];
            const priority = priorityMeta[t.priority];
            const status = statusMeta[t.status];
            return (
              <TR key={t.id}>
                <TD>
                  <span className="flex items-center gap-2.5 font-semibold">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    {t.type}
                  </span>
                </TD>
                <TD>
                  {vehicle ? (
                    <Link href={`/vehicles/${vehicle.id}`} className="hover:text-primary">
                      {vehicle.name}
                      <span className="block text-xs text-muted-foreground">{vehicle.plate}</span>
                    </Link>
                  ) : (
                    "—"
                  )}
                </TD>
                <TD className="whitespace-nowrap">{t.dueDate}</TD>
                <TD className="text-muted-foreground">{t.garage}</TD>
                <TD>
                  <Badge variant={priority.variant} dot>
                    {priority.label}
                  </Badge>
                </TD>
                <TD>
                  <Badge variant={status.variant} dot>
                    {status.label}
                  </Badge>
                </TD>
                <TD className="text-right font-semibold">{formatCurrency(t.cost)}</TD>
                <TD className="text-right">
                  {t.status !== "completed" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        completeMaintenance(t.id);
                        toast({ title: "Service completed", description: `${t.type} logged for ${vehicle?.name ?? "vehicle"}.` });
                      }}
                    >
                      <Check /> Complete
                    </Button>
                  ) : null}
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    );

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Maintenance"
        description="Service schedule, vehicle health, and repair records."
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Maintenance" }]}
        actions={
          <Button onClick={() => toast({ title: "Service booked", description: "A new service slot was requested at Central Garage." })}>
            <CalendarClock /> Schedule service
          </Button>
        }
      />

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open services" value={String(open.length)} icon={<Wrench />} />
        <StatCard
          label="High priority"
          value={String(highPriority)}
          icon={<AlertTriangle />}
          tone="red"
          hint={highPriority > 0 ? <Badge variant="danger">Act now</Badge> : <Badge variant="success">All clear</Badge>}
        />
        <StatCard label="Vehicles in shop" value={String(inShop.length)} icon={<Gauge />} tone="amber" />
        <StatCard label="Projected cost" value={formatCurrency(projectedCost)} icon={<FileCheck2 />} tone="violet" />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Maintenance schedule</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming ({open.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
                <TabsTrigger value="history">Repair history</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">{renderTasks(open)}</TabsContent>
              <TabsContent value="completed">{renderTasks(completed)}</TabsContent>
              <TabsContent value="history">
                <div className="space-y-3">
                  {serviceHistory.map((s) => {
                    const vehicle = vehicles.find((v) => v.id === s.vehicleId);
                    return (
                      <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4">
                        <div className="min-w-0">
                          <p className="font-semibold">
                            {s.type} · {vehicle?.name ?? "Unknown vehicle"}
                          </p>
                          <p className="text-sm text-muted-foreground">{s.notes}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {s.date} · {s.odometer.toLocaleString()} km
                          </p>
                        </div>
                        <span className="font-bold">{formatCurrency(s.cost)}</span>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {needsAttention.map((v) => (
                <div key={v.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                    <Link href={`/vehicles/${v.id}`} className="truncate font-medium hover:text-primary">
                      {v.name}
                    </Link>
                    <span
                      className={cn(
                        "font-bold",
                        v.health < 70 ? "text-red-500" : v.health < 85 ? "text-amber-500" : "text-emerald-600",
                      )}
                    >
                      {v.health}%
                    </span>
                  </div>
                  <Progress value={v.health} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expiring documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {vehicles.slice(0, 5).map((v) => (
                <div key={v.id} className="rounded-xl border border-border p-3 text-sm">
                  <p className="font-semibold">{v.plate}</p>
                  <p className="text-muted-foreground">Insurance · {v.insuranceExpiry}</p>
                  <p className="text-muted-foreground">Registration · {v.registrationExpiry}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
