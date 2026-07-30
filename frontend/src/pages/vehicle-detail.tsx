import * as React from "react";
import { Link, useParams, useRouter } from "@/lib/navigation";
import { Car, CalendarPlus, Fuel, Gauge, MapPin, Pencil, ShieldCheck, Trash2, Users, Wrench } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useBookingDialog } from "@/components/bookings/booking-dialog-provider";
import { useVehicleDialog } from "@/components/vehicles/vehicle-dialog-provider";
import { serviceHistory } from "@/data/mock";
import { useFleet } from "@/store/fleet-store";
import { bookingStatusMeta, vehicleStatusMeta } from "@/lib/status";
import { formatCurrency } from "@/lib/utils";

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { vehicles, bookings, customers, deleteVehicle } = useFleet();
  const { openEdit } = useVehicleDialog();
  const booking = useBookingDialog();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-[900px] py-10">
        <EmptyState
          icon={<Car />}
          title="Vehicle not found"
          description="This asset may have been removed from the fleet."
          action={
            <Button asChild>
              <Link href="/vehicles">Back to fleet</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const meta = vehicleStatusMeta[vehicle.status];
  const history = bookings.filter((b) => b.vehicleId === vehicle.id);
  const services = serviceHistory.filter((s) => s.vehicleId === vehicle.id);
  const revenue = history.filter((b) => b.status !== "cancelled").reduce((sum, b) => sum + b.amount, 0);

  const specs = [
    { icon: Fuel, label: "Fuel", value: vehicle.fuel },
    { icon: Gauge, label: "Transmission", value: vehicle.transmission },
    { icon: Users, label: "Seats", value: String(vehicle.seats) },
    { icon: Car, label: "Category", value: vehicle.category },
    { icon: MapPin, label: "Home location", value: vehicle.location },
    { icon: Wrench, label: "Next service", value: vehicle.nextServiceDue },
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader
        title={vehicle.name}
        description={`${vehicle.plate} · ${vehicle.year} · ${vehicle.mileage.toLocaleString()} km`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Vehicles", href: "/vehicles" },
          { label: vehicle.model },
        ]}
        actions={
          <>
            <Button variant="secondary" onClick={() => booking.setOpen(true)}>
              <CalendarPlus /> Book vehicle
            </Button>
            <Button variant="secondary" onClick={() => openEdit(vehicle)}>
              <Pencil /> Edit
            </Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 /> Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="overflow-hidden lg:col-span-3">
          <div className="relative">
            <img src={vehicle.image} alt={vehicle.name} className="h-80 w-full object-cover" />
            <Badge className="absolute left-5 top-5" variant={meta.variant} dot>
              {meta.label}
            </Badge>
          </div>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-border p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Icon className="size-3.5" /> {label}
                </p>
                <p className="mt-1 font-semibold">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Earnings & rate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Daily rate</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(vehicle.dailyRate)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Lifetime revenue</span>
                <span className="text-xl font-bold">{formatCurrency(revenue)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total bookings</span>
                <span className="text-xl font-bold">{history.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Condition score</span>
                  <span className="font-bold">{vehicle.health}%</span>
                </div>
                <Progress value={vehicle.health} />
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <ShieldCheck className="size-4" /> Insurance expires
                  </dt>
                  <dd className="font-semibold">{vehicle.insuranceExpiry}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Registration expires</dt>
                  <dd className="font-semibold">{vehicle.registrationExpiry}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking history</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {history.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No bookings recorded yet.</p>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Booking</TH>
                    <TH>Customer</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Amount</TH>
                  </TR>
                </THead>
                <TBody>
                  {history.map((b) => {
                    const statusMeta = bookingStatusMeta[b.status];
                    return (
                      <TR key={b.id}>
                        <TD>
                          <Link href={`/bookings/${b.id}`} className="font-semibold text-primary hover:underline">
                            {b.id}
                          </Link>
                        </TD>
                        <TD>{customers.find((c) => c.id === b.customerId)?.name ?? "—"}</TD>
                        <TD>
                          <Badge variant={statusMeta.variant} dot>
                            {statusMeta.label}
                          </Badge>
                        </TD>
                        <TD className="text-right font-semibold">{formatCurrency(b.amount)}</TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {services.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No service records for this vehicle.</p>
            ) : (
              services.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
                  <div className="min-w-0">
                    <p className="font-semibold">{s.type}</p>
                    <p className="text-sm text-muted-foreground">{s.notes}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.date} · {s.odometer.toLocaleString()} km
                    </p>
                  </div>
                  <span className="shrink-0 font-bold">{formatCurrency(s.cost)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this vehicle?"
        description={`${vehicle.name} (${vehicle.plate}) will be removed from your fleet. This cannot be undone.`}
        confirmLabel="Delete vehicle"
        destructive
        onConfirm={async () => {
          try {
            await deleteVehicle(vehicle.id);
            toast({ title: "Vehicle deleted", description: `${vehicle.name} removed from the fleet.`, tone: "warning" });
            router.push("/vehicles");
          } catch (err) {
            toast({
              title: "Delete failed",
              description: err instanceof Error ? err.message : "Could not delete vehicle.",
              tone: "error",
            });
          }
        }}
      />
    </div>
  );
}
