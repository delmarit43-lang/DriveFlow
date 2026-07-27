"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Calendar, Check, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useFleet } from "@/store/fleet-store";
import { cn, formatCurrency } from "@/lib/utils";

const steps = ["Duration", "Vehicle", "Customer", "Review"] as const;

function daysBetween(from: string, to: string) {
  const diff = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(1, Math.round(diff / 86_400_000));
}

export function BookingWizard({ onClose }: { onClose: () => void }) {
  const { vehicles, customers, addBooking } = useFleet();
  const toast = useToast();

  const [step, setStep] = React.useState(0);
  const [pickup, setPickup] = React.useState("2026-07-28");
  const [ret, setRet] = React.useState("2026-08-01");
  const [vehicleQuery, setVehicleQuery] = React.useState("");
  const [customerQuery, setCustomerQuery] = React.useState("");
  const [vehicleId, setVehicleId] = React.useState<string | null>(null);
  const [customerId, setCustomerId] = React.useState<string | null>(null);

  const bookable = React.useMemo(
    () => vehicles.filter((v) => v.status === "available" || v.status === "reserved"),
    [vehicles],
  );

  const vehicleResults = React.useMemo(() => {
    const q = vehicleQuery.trim().toLowerCase();
    return bookable.filter((v) => !q || v.name.toLowerCase().includes(q) || v.plate.toLowerCase().includes(q)).slice(0, 5);
  }, [bookable, vehicleQuery]);

  const customerResults = React.useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    return customers.filter((c) => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 5);
  }, [customers, customerQuery]);

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const customer = customers.find((c) => c.id === customerId);
  const days = daysBetween(pickup, ret);
  const total = vehicle ? vehicle.dailyRate * days : 0;

  const datesValid = Boolean(pickup && ret) && new Date(ret) > new Date(pickup);
  const canContinue = [datesValid, Boolean(vehicleId), Boolean(customerId), true][step];

  const confirm = () => {
    if (!vehicle || !customer) return;
    const created = addBooking({
      customerId: customer.id,
      vehicleId: vehicle.id,
      status: "pending",
      pickup,
      return: ret,
      pickupLocation: vehicle.location,
      amount: total,
      paymentStatus: "pending",
    });
    toast({
      title: "Booking confirmed",
      description: `${created.id} — ${vehicle.name} for ${customer.name} (${days} ${days === 1 ? "day" : "days"}).`,
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      <ol className="flex items-center gap-2">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-sm font-semibold transition",
                  i < step
                    ? "bg-primary/15 text-primary"
                    : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  i === step ? "text-primary" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 ? <span className="mb-5 h-px flex-1 bg-border" /> : null}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Pickup Date</span>
              <Input type="date" value={pickup} onChange={(e) => setPickup(e.target.value)} icon={<Calendar />} />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Return Date</span>
              <Input type="date" value={ret} onChange={(e) => setRet(e.target.value)} icon={<Calendar />} />
            </label>
          </div>
          {datesValid ? (
            <p className="text-sm text-muted-foreground">
              Rental duration: <span className="font-semibold text-foreground">{days} {days === 1 ? "day" : "days"}</span>
            </p>
          ) : (
            <p className="text-sm font-medium text-destructive">Return date must be after the pickup date.</p>
          )}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-3">
          <Input
            placeholder="Search available fleet..."
            icon={<Search />}
            value={vehicleQuery}
            onChange={(e) => setVehicleQuery(e.target.value)}
          />
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {vehicleResults.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No available vehicles match that search.</p>
            ) : (
              vehicleResults.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicleId(v.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                    vehicleId === v.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.image} alt="" className="size-14 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{v.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {v.plate} · {v.transmission} · {v.seats} seats
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-bold text-primary">{formatCurrency(v.dailyRate)}</span>
                    <span className="block text-[10px] uppercase text-muted-foreground">per day</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3">
          <Input
            placeholder="Select or add new customer..."
            icon={<Search />}
            value={customerQuery}
            onChange={(e) => setCustomerQuery(e.target.value)}
          />
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {customerResults.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No customers match that search.</p>
            ) : (
              customerResults.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCustomerId(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                    customerId === c.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                  )}
                >
                  <Avatar src={c.avatar} name={c.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{c.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{c.email}</span>
                  </span>
                  <Badge variant={c.tier === "standard" ? "muted" : "default"}>{c.tier.toUpperCase()}</Badge>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}

      {step === 3 && vehicle && customer ? (
        <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-5">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={vehicle.image} alt="" className="size-16 rounded-xl object-cover" />
            <div>
              <p className="font-bold">{vehicle.name}</p>
              <p className="text-sm text-muted-foreground">
                {vehicle.plate} · {vehicle.location}
              </p>
            </div>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Customer</dt>
              <dd className="font-semibold">{customer.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="font-semibold">{days} {days === 1 ? "day" : "days"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Pickup</dt>
              <dd className="font-semibold">{pickup}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Return</dt>
              <dd className="font-semibold">{ret}</dd>
            </div>
          </dl>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">
              {formatCurrency(vehicle.dailyRate)} × {days}
            </span>
            <span className="text-2xl font-bold">{formatCurrency(total)}</span>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between border-t border-border pt-4">
        {step === 0 ? (
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
        ) : (
          <Button variant="ghost" type="button" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft /> Back
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button type="button" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
            Next <ArrowRight />
          </Button>
        ) : (
          <Button type="button" onClick={confirm}>
            <Check /> Confirm Booking
          </Button>
        )}
      </div>
    </div>
  );
}
