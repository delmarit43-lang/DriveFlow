"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus, Car, LifeBuoy, Plus, Receipt } from "lucide-react";
import { useBookingDialog } from "@/components/bookings/booking-dialog-provider";
import { useVehicleDialog } from "@/components/vehicles/vehicle-dialog-provider";
import { cn } from "@/lib/utils";

export function FloatingActions() {
  const router = useRouter();
  const booking = useBookingDialog();
  const vehicle = useVehicleDialog();
  const [open, setOpen] = React.useState(false);

  const actions = [
    { label: "New booking", icon: CalendarPlus, run: () => booking.setOpen(true) },
    { label: "Add vehicle", icon: Car, run: () => vehicle.openCreate() },
    { label: "New invoice", icon: Receipt, run: () => router.push("/invoices") },
    { label: "Contact support", icon: LifeBuoy, run: () => router.push("/support") },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open
          ? actions.map((action, i) => (
              <motion.button
                key={action.label}
                type="button"
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  setOpen(false);
                  action.run();
                }}
                className="flex items-center gap-2.5 rounded-full border border-border bg-card py-2.5 pl-4 pr-5 text-sm font-semibold shadow-lift transition hover:bg-muted"
              >
                <action.icon className="size-4 text-primary" />
                {action.label}
              </motion.button>
            ))
          : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close quick actions" : "Open quick actions"}
        className={cn(
          "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition",
          "hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
        )}
      >
        <Plus className={cn("size-6 transition-transform duration-300", open && "rotate-45")} />
      </button>
    </div>
  );
}
