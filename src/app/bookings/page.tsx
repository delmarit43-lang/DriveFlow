"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, Download, LayoutList, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { NewBookingButton } from "@/components/bookings/new-booking-button";
import { BookingCalendar } from "@/components/bookings/booking-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useFleet } from "@/store/fleet-store";
import { bookingStatusMeta, paymentStatusMeta } from "@/lib/status";
import { cn, downloadFile, formatCurrency, toCsv } from "@/lib/utils";
import type { BookingStatus } from "@/types";

const quickFilters: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Overdue", value: "overdue" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const PAGE_SIZE = 6;

export default function BookingsPage() {
  const { bookings, customers, vehicles } = useFleet();
  const toast = useToast();

  const [status, setStatus] = React.useState<BookingStatus | "all">("all");
  const [query, setQuery] = React.useState("");
  const [view, setView] = React.useState<"table" | "calendar">("table");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings
      .filter((b) => status === "all" || b.status === status)
      .filter((b) => {
        if (!q) return true;
        const customer = customers.find((c) => c.id === b.customerId)?.name.toLowerCase() ?? "";
        const vehicle = vehicles.find((v) => v.id === b.vehicleId)?.name.toLowerCase() ?? "";
        return b.id.toLowerCase().includes(q) || customer.includes(q) || vehicle.includes(q);
      });
  }, [bookings, customers, vehicles, status, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  React.useEffect(() => setPage(1), [status, query]);

  const counts = React.useMemo(
    () =>
      quickFilters.reduce<Record<string, number>>((acc, f) => {
        acc[f.value] = f.value === "all" ? bookings.length : bookings.filter((b) => b.status === f.value).length;
        return acc;
      }, {}),
    [bookings],
  );

  const exportBookings = () => {
    downloadFile(
      "driveflow-bookings.csv",
      toCsv(
        filtered.map((b) => ({
          BookingID: b.id,
          Customer: customers.find((c) => c.id === b.customerId)?.name ?? "—",
          Vehicle: vehicles.find((v) => v.id === b.vehicleId)?.name ?? "—",
          Pickup: b.pickup,
          Return: b.return,
          Status: b.status,
          Payment: b.paymentStatus,
          Amount: b.amount,
        })),
      ),
    );
    toast({ title: "Bookings exported", description: `${filtered.length} rows downloaded as CSV.` });
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Bookings"
        description="Manage reservations, rental timelines, and payment status."
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Bookings" }]}
        actions={
          <>
            <Button variant="secondary" onClick={exportBookings}>
              <Download /> Export
            </Button>
            <NewBookingButton />
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex flex-wrap rounded-xl border border-border bg-muted/40 p-1">
          {quickFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition",
                status === f.value ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span className="rounded-full bg-muted px-1.5 text-[10px] font-bold text-muted-foreground">
                {counts[f.value] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="min-w-[220px] flex-1">
          <Input
            placeholder="Search booking ID, customer or vehicle..."
            icon={<Search />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search bookings"
          />
        </div>

        <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setView("table")}
            aria-pressed={view === "table"}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
              view === "table" ? "bg-card shadow-sm" : "text-muted-foreground",
            )}
          >
            <LayoutList className="size-4" /> Table
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            aria-pressed={view === "calendar"}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
              view === "calendar" ? "bg-card shadow-sm" : "text-muted-foreground",
            )}
          >
            <CalendarDays className="size-4" /> Calendar
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        <BookingCalendar bookings={filtered} />
      ) : (
        <Card>
          <CardContent className="p-0">
            {visible.length === 0 ? (
              <EmptyState
                icon={<CalendarDays />}
                title="No bookings found"
                description="Try a different filter, or create a new reservation."
                className="m-6 border-0"
                action={<NewBookingButton />}
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Booking ID</TH>
                    <TH>Customer</TH>
                    <TH>Vehicle</TH>
                    <TH>Pickup</TH>
                    <TH>Return</TH>
                    <TH>Status</TH>
                    <TH>Payment</TH>
                    <TH className="text-right">Amount</TH>
                  </TR>
                </THead>
                <TBody>
                  {visible.map((b) => {
                    const meta = bookingStatusMeta[b.status];
                    const payment = paymentStatusMeta[b.paymentStatus];
                    return (
                      <TR key={b.id}>
                        <TD>
                          <Link href={`/bookings/${b.id}`} className="font-semibold text-primary hover:underline">
                            {b.id}
                          </Link>
                        </TD>
                        <TD className="font-medium">{customers.find((c) => c.id === b.customerId)?.name ?? "—"}</TD>
                        <TD className="text-muted-foreground">{vehicles.find((v) => v.id === b.vehicleId)?.name ?? "—"}</TD>
                        <TD className="whitespace-nowrap">{b.pickup}</TD>
                        <TD className="whitespace-nowrap">{b.return}</TD>
                        <TD>
                          <Badge variant={meta.variant} dot>
                            {meta.label}
                          </Badge>
                        </TD>
                        <TD>
                          <Badge variant={payment.variant} dot>
                            {payment.label}
                          </Badge>
                        </TD>
                        <TD className="text-right font-semibold">{formatCurrency(b.amount)}</TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            )}

            {filtered.length > 0 ? (
              <div className="border-t border-border px-6 py-4">
                <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
