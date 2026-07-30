import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import * as React from "react";
import { BookingDialogProvider } from "@/components/bookings/booking-dialog-provider";
import { CustomerDialogProvider } from "@/components/customers/customer-dialog-provider";
import { VehicleDialogProvider } from "@/components/vehicles/vehicle-dialog-provider";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { LocaleProvider } from "@/i18n/locale-context";
import { AuthProvider } from "@/store/auth-store";
import { FleetProvider, useFleet } from "@/store/fleet-store";
import { UserProfileProvider } from "@/store/user-profile-store";

function FleetApiErrorWatcher({ children }: { children: React.ReactNode }) {
  const { ready, error } = useFleet();
  const toast = useToast();
  const shown = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!ready || !error || shown.current === error) return;
    shown.current = error;
    toast({
      title: "Could not load fleet data",
      description: error,
      tone: "error",
    });
  }, [ready, error, toast]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={client}>
        <LocaleProvider>
          <ToastProvider>
            <AuthProvider>
              <UserProfileProvider>
                <FleetProvider>
                  <FleetApiErrorWatcher>
                    <BookingDialogProvider>
                      <VehicleDialogProvider>
                        <CustomerDialogProvider>{children}</CustomerDialogProvider>
                      </VehicleDialogProvider>
                    </BookingDialogProvider>
                  </FleetApiErrorWatcher>
                </FleetProvider>
              </UserProfileProvider>
            </AuthProvider>
          </ToastProvider>
        </LocaleProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
