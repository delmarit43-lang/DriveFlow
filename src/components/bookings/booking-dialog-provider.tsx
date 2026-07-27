"use client";

import * as React from "react";
import { DialogContent, DialogRoot } from "@/components/ui/dialog";
import { BookingWizard } from "@/components/bookings/booking-wizard";

type Ctx = { open: boolean; setOpen: (v: boolean) => void };

const BookingDialogContext = React.createContext<Ctx | null>(null);

export function BookingDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <BookingDialogContext.Provider value={{ open, setOpen }}>
      {children}
      <DialogRoot open={open} onOpenChange={setOpen}>
        <DialogContent title="New Booking" description="Create a rental in four quick steps.">
          <BookingWizard onClose={() => setOpen(false)} />
        </DialogContent>
      </DialogRoot>
    </BookingDialogContext.Provider>
  );
}

export function useBookingDialog() {
  const ctx = React.useContext(BookingDialogContext);
  if (!ctx) throw new Error("useBookingDialog must be used within BookingDialogProvider");
  return ctx;
}
