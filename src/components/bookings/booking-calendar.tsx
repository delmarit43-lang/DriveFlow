"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookingStatusMeta } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const dotColor: Record<Booking["status"], string> = {
  active: "bg-emerald-500",
  pending: "bg-amber-500",
  overdue: "bg-red-500",
  completed: "bg-slate-400",
  cancelled: "bg-slate-300",
};

function toKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Days covered by a booking, so multi-day rentals show on every day in range. */
function bookingDays(booking: Booking) {
  const keys: string[] = [];
  const start = new Date(booking.pickup);
  const end = new Date(booking.return);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return keys;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    keys.push(toKey(d));
  }
  return keys;
}

export function BookingCalendar({ bookings }: { bookings: Booking[] }) {
  const firstBooking = bookings[0];
  const initial = firstBooking ? new Date(firstBooking.pickup) : new Date();
  const [cursor, setCursor] = React.useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [selected, setSelected] = React.useState<string | null>(null);

  const byDay = React.useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((b) => {
      bookingDays(b).forEach((key) => {
        map.set(key, [...(map.get(key) ?? []), b]);
      });
    });
    return map;
  }, [bookings]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first offset.
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedBookings = selected ? (byDay.get(selected) ?? []) : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>
            {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              aria-label="Previous month"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Next month"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekdays.map((d) => (
              <div key={d} className="pb-2 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {d}
              </div>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <div key={`blank-${i}`} />;
              const key = toKey(new Date(year, month, day));
              const dayBookings = byDay.get(key) ?? [];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(key)}
                  className={cn(
                    "flex min-h-[76px] flex-col gap-1 rounded-xl border p-2 text-left transition",
                    selected === key ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                  )}
                >
                  <span className="text-sm font-semibold">{day}</span>
                  <span className="flex flex-wrap gap-1">
                    {dayBookings.slice(0, 4).map((b) => (
                      <span key={b.id} className={cn("size-1.5 rounded-full", dotColor[b.status])} />
                    ))}
                    {dayBookings.length > 4 ? (
                      <span className="text-[10px] font-bold text-muted-foreground">+{dayBookings.length - 4}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selected
              ? new Date(selected).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
              : "Select a day"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {!selected ? (
            <p className="text-sm text-muted-foreground">Pick a date on the calendar to see the reservations for that day.</p>
          ) : selectedBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reservations on this date.</p>
          ) : (
            selectedBookings.map((b) => {
              const meta = bookingStatusMeta[b.status];
              return (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="block rounded-xl border border-border p-3 transition hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-primary">{b.id}</span>
                    <span className={cn("size-2 rounded-full", dotColor[b.status])} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {meta.label} · {b.pickupLocation}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {b.pickup} → {b.return}
                  </p>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
