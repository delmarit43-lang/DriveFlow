"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpDown, Car, Eye, Filter, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useVehicleDialog } from "@/components/vehicles/vehicle-dialog-provider";
import { useFleet } from "@/store/fleet-store";
import { vehicleStatusMeta } from "@/lib/status";
import { cn, formatCurrency } from "@/lib/utils";
import type { Vehicle, VehicleStatus } from "@/types";

const tabs: { label: string; value: VehicleStatus | "all" }[] = [
  { label: "All Fleet", value: "all" },
  { label: "Available", value: "available" },
  { label: "Rented", value: "rented" },
  { label: "Maintenance", value: "maintenance" },
];

const sorts = {
  "price-desc": { label: "Price: high to low", compare: (a: Vehicle, b: Vehicle) => b.dailyRate - a.dailyRate },
  "price-asc": { label: "Price: low to high", compare: (a: Vehicle, b: Vehicle) => a.dailyRate - b.dailyRate },
  "name-asc": { label: "Name: A to Z", compare: (a: Vehicle, b: Vehicle) => a.name.localeCompare(b.name) },
  "year-desc": { label: "Newest first", compare: (a: Vehicle, b: Vehicle) => b.year - a.year },
  "mileage-asc": { label: "Lowest mileage", compare: (a: Vehicle, b: Vehicle) => a.mileage - b.mileage },
} as const;

const PAGE_SIZE = 6;

export default function VehiclesPage() {
  const { vehicles, deleteVehicle } = useFleet();
  const { openCreate, openEdit } = useVehicleDialog();
  const toast = useToast();

  const [tab, setTab] = React.useState<VehicleStatus | "all">("all");
  const [query, setQuery] = React.useState("");
  const [brand, setBrand] = React.useState("all");
  const [category, setCategory] = React.useState("all");
  const [fuel, setFuel] = React.useState("all");
  const [sort, setSort] = React.useState<keyof typeof sorts>("price-desc");
  const [showFilters, setShowFilters] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pendingDelete, setPendingDelete] = React.useState<Vehicle | null>(null);

  const brands = React.useMemo(() => Array.from(new Set(vehicles.map((v) => v.brand))).sort(), [vehicles]);
  const categories = React.useMemo(() => Array.from(new Set(vehicles.map((v) => v.category))).sort(), [vehicles]);
  const fuels = React.useMemo(() => Array.from(new Set(vehicles.map((v) => v.fuel))).sort(), [vehicles]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return vehicles
      .filter((v) => tab === "all" || v.status === tab)
      .filter((v) => brand === "all" || v.brand === brand)
      .filter((v) => category === "all" || v.category === category)
      .filter((v) => fuel === "all" || v.fuel === fuel)
      .filter((v) => !q || v.name.toLowerCase().includes(q) || v.plate.toLowerCase().includes(q))
      .sort(sorts[sort].compare);
  }, [vehicles, tab, brand, category, fuel, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  React.useEffect(() => setPage(1), [tab, brand, category, fuel, query, sort]);

  const activeFilters = [brand, category, fuel].filter((f) => f !== "all").length;

  const resetFilters = () => {
    setBrand("all");
    setCategory("all");
    setFuel("all");
    setQuery("");
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Vehicles Fleet"
        description="Manage and monitor your enterprise assets in real-time."
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Vehicles" }]}
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowFilters((v) => !v)}>
              <Filter /> Filters
              {activeFilters > 0 ? (
                <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {activeFilters}
                </span>
              ) : null}
            </Button>
            <Select value={sort} onValueChange={(v) => setSort(v as keyof typeof sorts)}>
              <SelectTrigger className="w-[190px]">
                <span className="flex items-center gap-2">
                  <ArrowUpDown className="size-4 text-muted-foreground" />
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sorts).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={openCreate}>
              <Plus /> Add vehicle
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition",
                tab === t.value ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="min-w-[240px] flex-1">
          <Input
            placeholder="Search by name or plate..."
            icon={<Search />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search vehicles"
          />
        </div>
      </div>

      {showFilters ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 overflow-hidden"
        >
          <Card className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Brand</span>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All brands</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Vehicle type</span>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Fuel</span>
              <Select value={fuel} onValueChange={setFuel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All fuel types</SelectItem>
                  {fuels.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <div className="flex items-end">
              <Button variant="ghost" onClick={resetFilters} className="w-full">
                <X /> Clear filters
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          icon={<Car />}
          title="No vehicles match your filters"
          description="Try clearing the filters or add a new asset to your fleet."
          action={
            <div className="flex gap-3">
              <Button variant="secondary" onClick={resetFilters}>
                Clear filters
              </Button>
              <Button onClick={openCreate}>
                <Plus /> Add vehicle
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((v) => {
            const meta = vehicleStatusMeta[v.status];
            return (
              <motion.div key={v.id} layout whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 26 }}>
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-lift">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.image} alt={v.name} className="h-52 w-full object-cover" />
                    <Badge className="absolute left-4 top-4" variant={meta.variant} dot>
                      {meta.label}
                    </Badge>
                    <div className="absolute bottom-4 right-4 rounded-xl bg-card px-3 py-2 text-right shadow-card">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Per Day</p>
                      <p className="text-xl font-bold text-primary">{formatCurrency(v.dailyRate)}</p>
                    </div>
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{v.brand}</p>
                        <h3 className="truncate text-lg font-bold">{v.model}</h3>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/vehicles/${v.id}`} aria-label={`View ${v.name}`}>
                            <Eye />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" aria-label={`Edit ${v.name}`} onClick={() => openEdit(v)}>
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${v.name}`}
                          className="hover:text-destructive"
                          onClick={() => setPendingDelete(v)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Engine</p>
                        <p className="truncate font-semibold">{v.engine}</p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Plate</p>
                        <p className="truncate font-semibold">{v.plate}</p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Transmission</p>
                        <p className="truncate font-semibold">{v.transmission}</p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Seats · Year</p>
                        <p className="font-semibold">
                          {v.seats} · {v.year}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{v.mileage.toLocaleString()} km · {v.location}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 ? (
        <>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{visible.length}</span> of{" "}
            <span className="font-semibold text-foreground">{filtered.length}</span> vehicles
          </p>
          <Pagination className="mt-4" page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this vehicle?"
        description={`${pendingDelete?.name ?? ""} (${pendingDelete?.plate ?? ""}) will be removed from your fleet. This cannot be undone.`}
        confirmLabel="Delete vehicle"
        destructive
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteVehicle(pendingDelete.id);
          toast({
            title: "Vehicle deleted",
            description: `${pendingDelete.name} has been removed from the fleet.`,
            tone: "warning",
          });
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
