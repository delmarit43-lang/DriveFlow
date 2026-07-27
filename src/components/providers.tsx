"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import * as React from "react";
import { BookingDialogProvider } from "@/components/bookings/booking-dialog-provider";
import { VehicleDialogProvider } from "@/components/vehicles/vehicle-dialog-provider";
import { ToastProvider } from "@/components/ui/toast";
import { FleetProvider } from "@/store/fleet-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={client}>
        <ToastProvider>
          <FleetProvider>
            <BookingDialogProvider>
              <VehicleDialogProvider>{children}</VehicleDialogProvider>
            </BookingDialogProvider>
          </FleetProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
