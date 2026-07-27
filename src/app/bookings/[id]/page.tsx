"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, Check, MapPin, Phone, Printer, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { useFleet } from "@/store/fleet-store";
import { bookingStatusMeta, paymentStatusMeta } from "@/lib/status";
import { formatCurrency } from "@/lib/utils";

function nights(from: string, to: string) {
  const diff = new Date(to).getTime() - new Date(from).getTime();
  return Number.isNaN(diff) ? 1 : Math.max(1, Math.round(diff / 86_400_000));
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { bookings, customers, vehicles, setBookingStatus } = useFleet();
  const toast = useToast();
  const [cancelOpen, setCancelOpen] = React.useState(false);

  const booking = bookings.find((b) => b.id === id || b.id === id.replace("#", ""));

  if (!booking) {
    return (
      <div className="mx-auto max-w-[900px] py-10">
        <EmptyState
          icon={<CalendarDays />}
          title="Booking not found"
          description="This reservation may have been removed."
          action={
            <Button asChild>
              <Link href="/bookings">Back to bookings</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const customer = customers.find((c) => c.id === booking.customerId);
  const vehicle = vehicles.find((v) => v.id === booking.vehicleId);
  const meta = bookingStatusMeta[booking.status];
  const payment = paymentStatusMeta[booking.paymentStatus];
  const days = nights(booking.pickup, booking.return);
  const canApprove = booking.status === "pending";
  const canClose = booking.status === "active" || booking.status === "overdue";

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <PageHeader
        title={`Booking ${booking.id}`}
        description={`${booking.pickup} → ${booking.return} · ${days} ${days === 1 ? "day" : "days"}`}
        breadcrumbs={[{ label: "Bookings", href: "/bookings" }, { label: booking.id }]}
        actions={
          <>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer /> Print
            </Button>
            {canApprove ? (
              <Button
                onClick={() => {
                  setBookingStatus(booking.id, "active");
                  toast({ title: "Booking approved", description: `${booking.id} is now active.` });
                }}
              >
                <Check /> Approve
              </Button>
            ) : null}
            {canClose ? (
              <Button
                onClick={() => {
                  setBookingStatus(booking.id, "completed");
                  toast({ title: "Rental closed", description: `${booking.id} marked as completed.` });
                }}
              >
                <Check /> Mark returned
              </Button>
            ) : null}
            {booking.status !== "cancelled" && booking.status !== "completed" ? (
              <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                <X /> Cancel
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Rental timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={meta.variant} dot>
                {meta.label}
              </Badge>
              <Badge variant={payment.variant} dot>
                Payment: {payment.label}
              </Badge>
            </div>

            <ol className="relative space-y-6 border-l border-border pl-6">
              {[
                { label: "Reservation created", detail: `Booking ${booking.id} registered in the system.`, done: true },
                { label: "Pickup", detail: `${booking.pickup} · ${booking.pickupLocation}`, done: booking.status !== "pending" },
                {
                  label: "Return",
                  detail: `${booking.return} · ${booking.pickupLocation}`,
                  done: booking.status === "completed",
                },
              ].map((step) => (
                <li key={step.label} className="relative">
                  <span
                    className={
                      step.done
                        ? "absolute -left-[31px] top-1 flex size-4 items-center justify-center rounded-full bg-primary"
                        : "absolute -left-[31px] top-1 size-4 rounded-full border-2 border-border bg-card"
                    }
                  />
                  <p className="font-semibold">{step.label}</p>
                  <p className="text-sm text-muted-foreground">{step.detail}</p>
                </li>
              ))}
            </ol>

            {vehicle ? (
              <div className="flex items-center gap-4 rounded-2xl border border-border p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={vehicle.image} alt={vehicle.name} className="size-20 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{vehicle.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.plate} · {vehicle.transmission} · {vehicle.seats} seats
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {booking.pickupLocation}
                  </p>
                </div>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/vehicles/${vehicle.id}`}>View vehicle</Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {customer ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar src={customer.avatar} name={customer.name} className="size-12" />
                    <div className="min-w-0">
                      <p className="truncate font-bold">{customer.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="size-4" /> {customer.phone}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" size="sm" asChild className="flex-1">
                      <Link href={`/customers/${customer.id}`}>Profile</Link>
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        toast({ title: "Message sent", description: `${customer.name} was contacted about ${booking.id}.` })
                      }
                    >
                      Contact
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Customer record unavailable.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Charges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {vehicle ? `${formatCurrency(vehicle.dailyRate)} × ${days}` : "Rental"}
                </span>
                <span className="font-semibold">{formatCurrency(booking.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes & fees</span>
                <span className="font-semibold">Included</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">{formatCurrency(booking.amount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this booking?"
        description={`${booking.id} will be cancelled and the vehicle released back to the available pool.`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        destructive
        onConfirm={() => {
          setBookingStatus(booking.id, "cancelled");
          toast({ title: "Booking cancelled", description: `${booking.id} has been cancelled.`, tone: "warning" });
        }}
      />
    </div>
  );
}
