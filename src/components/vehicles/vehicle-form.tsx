"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useFleet } from "@/store/fleet-store";
import type { Vehicle } from "@/types";

const schema = z.object({
  brand: z.string().min(2, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  plate: z.string().min(3, "Plate number is required"),
  category: z.enum(["Sedan", "SUV", "Luxury", "Van", "Pickup", "Hatchback"]),
  status: z.enum(["available", "rented", "maintenance", "reserved"]),
  fuel: z.enum(["Electric", "Gasoline", "Diesel", "Hybrid"]),
  transmission: z.enum(["Automatic", "Manual"]),
  dailyRate: z.coerce.number().min(1, "Daily rate must be greater than zero"),
  year: z.coerce.number().min(1990, "Enter a valid year").max(2100, "Enter a valid year"),
  mileage: z.coerce.number().min(0, "Mileage cannot be negative"),
  seats: z.coerce.number().min(1, "At least one seat").max(20, "Too many seats"),
  location: z.string().min(2, "Location is required"),
});

type FormValues = z.input<typeof schema>;

const fallbackImage =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {error ? <span className="block text-xs font-medium text-destructive">{error}</span> : null}
    </label>
  );
}

export function VehicleForm({ vehicle, onDone }: { vehicle: Vehicle | null; onDone: () => void }) {
  const { addVehicle, updateVehicle } = useFleet();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      brand: vehicle?.brand ?? "",
      model: vehicle?.model ?? "",
      plate: vehicle?.plate ?? "",
      category: vehicle?.category ?? "SUV",
      status: vehicle?.status ?? "available",
      fuel: vehicle?.fuel ?? "Gasoline",
      transmission: vehicle?.transmission ?? "Automatic",
      dailyRate: vehicle?.dailyRate ?? 120,
      year: vehicle?.year ?? new Date().getFullYear(),
      mileage: vehicle?.mileage ?? 0,
      seats: vehicle?.seats ?? 5,
      location: vehicle?.location ?? "Downtown Hub",
    },
  });

  const onSubmit = handleSubmit((raw) => {
    const values = schema.parse(raw);
    const name = `${values.brand} ${values.model}`.replace(/\s+/g, " ").trim();

    if (vehicle) {
      updateVehicle(vehicle.id, { ...values, name, engine: vehicle.engine });
      toast({ title: "Vehicle updated", description: `${name} (${values.plate}) has been saved.` });
    } else {
      addVehicle({
        ...values,
        name,
        engine: values.fuel === "Electric" ? "Electric Motor" : `${values.fuel} Engine`,
        image: fallbackImage,
        health: 100,
        nextServiceDue: "Not scheduled",
        insuranceExpiry: "Not set",
        registrationExpiry: "Not set",
      });
      toast({ title: "Vehicle added", description: `${name} (${values.plate}) joined your fleet.` });
    }
    onDone();
  });

  const selectValue = <K extends keyof FormValues>(field: K) => String(watch(field) ?? "");

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Brand" error={errors.brand?.message}>
          <Input placeholder="e.g. Tesla" {...register("brand")} />
        </Field>
        <Field label="Model" error={errors.model?.message}>
          <Input placeholder="e.g. Model Y" {...register("model")} />
        </Field>
        <Field label="Plate number" error={errors.plate?.message}>
          <Input placeholder="e.g. NY-882-EV" {...register("plate")} />
        </Field>
        <Field label="Daily rate (USD)" error={errors.dailyRate?.message}>
          <Input type="number" min={1} {...register("dailyRate")} />
        </Field>

        <Field label="Category">
          <Select value={selectValue("category")} onValueChange={(v) => setValue("category", v as FormValues["category"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Sedan", "SUV", "Luxury", "Van", "Pickup", "Hatchback"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Availability">
          <Select value={selectValue("status")} onValueChange={(v) => setValue("status", v as FormValues["status"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="maintenance">In maintenance</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Fuel type">
          <Select value={selectValue("fuel")} onValueChange={(v) => setValue("fuel", v as FormValues["fuel"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Electric", "Gasoline", "Diesel", "Hybrid"].map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Transmission">
          <Select
            value={selectValue("transmission")}
            onValueChange={(v) => setValue("transmission", v as FormValues["transmission"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Automatic">Automatic</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Year" error={errors.year?.message}>
          <Input type="number" {...register("year")} />
        </Field>
        <Field label="Seats" error={errors.seats?.message}>
          <Input type="number" min={1} {...register("seats")} />
        </Field>
        <Field label="Mileage (km)" error={errors.mileage?.message}>
          <Input type="number" min={0} {...register("mileage")} />
        </Field>
        <Field label="Home location" error={errors.location?.message}>
          <Input placeholder="e.g. Downtown Hub" {...register("location")} />
        </Field>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {vehicle ? "Save changes" : "Add vehicle"}
        </Button>
      </div>
    </form>
  );
}
