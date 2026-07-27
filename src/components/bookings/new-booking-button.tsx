"use client";

import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingDialog } from "@/components/bookings/booking-dialog-provider";

export function NewBookingButton() {
  const { setOpen } = useBookingDialog();
  return (
    <Button onClick={() => setOpen(true)}>
      <CalendarPlus /> New Booking
    </Button>
  );
}
