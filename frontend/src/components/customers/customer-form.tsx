import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useFleet } from "@/store/fleet-store";
import type { Customer } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Phone is required"),
  address: z.string().min(2, "Address is required"),
  license: z.string().min(3, "License number is required"),
  licenseExpiry: z.string().min(2, "License expiry is required"),
  tier: z.enum(["standard", "gold", "platinum", "vip"]),
  status: z.enum(["active", "pending", "inactive"]),
});

type FormValues = z.input<typeof schema>;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {error ? <span className="block text-xs font-medium text-destructive">{error}</span> : null}
    </label>
  );
}

export function CustomerForm({ customer, onDone }: { customer: Customer | null; onDone: () => void }) {
  const { addCustomer, updateCustomer } = useFleet();
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
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      address: customer?.address ?? "",
      license: customer?.license ?? "",
      licenseExpiry: customer?.licenseExpiry ?? "",
      tier: customer?.tier ?? "standard",
      status: customer?.status ?? "active",
    },
  });

  const onSubmit = handleSubmit(async (raw) => {
    const values = schema.parse(raw);
    try {
      if (customer) {
        await updateCustomer(customer.id, values);
        toast({ title: "Customer updated", description: `${values.name} has been saved.` });
      } else {
        await addCustomer({
          ...values,
          avatar: "",
          memberSince: new Date().getFullYear(),
          totalRentals: 0,
          lifetimeSpend: 0,
          loyaltyProgress: 0,
          balance: 0,
          trips: 0,
        });
        toast({ title: "Customer added", description: `${values.name} joined your directory.` });
      }
      onDone();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Could not save customer.",
        tone: "error",
      });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.name?.message}>
          <Input {...register("name")} placeholder="Amina Hassan Omar" />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} placeholder="name@email.com" />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <Input {...register("phone")} placeholder="+252 63 400 0000" />
        </Field>
        <Field label="Address" error={errors.address?.message}>
          <Input {...register("address")} placeholder="Hargeisa" />
        </Field>
        <Field label="License number" error={errors.license?.message}>
          <Input {...register("license")} placeholder="DL-SL-0000000" />
        </Field>
        <Field label="License expiry" error={errors.licenseExpiry?.message}>
          <Input {...register("licenseExpiry")} placeholder="Mar 2029" />
        </Field>
        <Field label="Tier" error={errors.tier?.message}>
          <Select value={watch("tier")} onValueChange={(v) => setValue("tier", v as FormValues["tier"], { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <Select
            value={watch("status")}
            onValueChange={(v) => setValue("status", v as FormValues["status"], { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onDone} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : customer ? "Save changes" : "Add customer"}
        </Button>
      </div>
    </form>
  );
}
