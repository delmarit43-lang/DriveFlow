import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { api } from "@/services/api";
import { useAuth } from "@/store/auth-store";
import type {
  Booking,
  BookingStatus,
  Customer,
  Driver,
  MaintenanceTask,
  NotificationItem,
  PaymentMethod,
  Vehicle,
} from "@/types";

const fleetKeys = {
  vehicles: ["fleet", "vehicles"] as const,
  customers: ["fleet", "customers"] as const,
  bookings: ["fleet", "bookings"] as const,
  drivers: ["fleet", "drivers"] as const,
  notifications: ["fleet", "notifications"] as const,
  paymentMethods: ["fleet", "payment-methods"] as const,
  maintenance: ["fleet", "maintenance"] as const,
  payments: ["fleet", "payments"] as const,
  invoices: ["fleet", "invoices"] as const,
  analytics: ["fleet", "analytics"] as const,
};

type FleetState = {
  ready: boolean;
  error: string | null;
  vehicles: Vehicle[];
  bookings: Booking[];
  customers: Customer[];
  drivers: Driver[];
  notifications: NotificationItem[];
  paymentMethods: PaymentMethod[];
  maintenanceTasks: MaintenanceTask[];
  refreshCore: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Promise<Vehicle>;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, "id">) => Promise<Customer>;
  updateCustomer: (id: string, patch: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addBooking: (booking: Omit<Booking, "id">) => Promise<Booking>;
  setBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, "id">) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  completeMaintenance: (id: string) => Promise<void>;
  setDriverAvailability: (id: string, availability: Driver["availability"]) => Promise<void>;
};

const FleetContext = React.createContext<FleetState | null>(null);

export function FleetProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { isAuthenticated, ready: authReady } = useAuth();
  const authed = authReady && isAuthenticated;

  const vehiclesQuery = useQuery({
    queryKey: fleetKeys.vehicles,
    queryFn: api.listVehicles,
    enabled: authed,
  });
  const customersQuery = useQuery({
    queryKey: fleetKeys.customers,
    queryFn: api.listCustomers,
    enabled: authed,
  });
  const bookingsQuery = useQuery({
    queryKey: fleetKeys.bookings,
    queryFn: api.listBookings,
    enabled: authed,
  });
  const driversQuery = useQuery({
    queryKey: fleetKeys.drivers,
    queryFn: api.listDrivers,
    enabled: authed,
  });
  const notificationsQuery = useQuery({
    queryKey: fleetKeys.notifications,
    queryFn: api.listNotifications,
    enabled: authed,
  });
  const paymentMethodsQuery = useQuery({
    queryKey: fleetKeys.paymentMethods,
    queryFn: api.listPaymentMethods,
    enabled: authed,
  });
  const maintenanceQuery = useQuery({
    queryKey: fleetKeys.maintenance,
    queryFn: api.listMaintenance,
    enabled: authed,
  });

  const coreFetched =
    (vehiclesQuery.isFetched || vehiclesQuery.isError) &&
    (customersQuery.isFetched || customersQuery.isError) &&
    (bookingsQuery.isFetched || bookingsQuery.isError);

  const ready = !authReady || !authed || coreFetched;

  const error =
    vehiclesQuery.error?.message ||
    customersQuery.error?.message ||
    bookingsQuery.error?.message ||
    driversQuery.error?.message ||
    notificationsQuery.error?.message ||
    paymentMethodsQuery.error?.message ||
    maintenanceQuery.error?.message ||
    null;

  const refreshCore = React.useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: fleetKeys.vehicles }),
      queryClient.invalidateQueries({ queryKey: fleetKeys.customers }),
      queryClient.invalidateQueries({ queryKey: fleetKeys.bookings }),
      queryClient.invalidateQueries({ queryKey: fleetKeys.drivers }),
      queryClient.invalidateQueries({ queryKey: fleetKeys.notifications }),
      queryClient.invalidateQueries({ queryKey: fleetKeys.paymentMethods }),
      queryClient.invalidateQueries({ queryKey: fleetKeys.maintenance }),
      queryClient.invalidateQueries({ queryKey: fleetKeys.analytics }),
    ]);
  }, [queryClient]);

  const addVehicleMutation = useMutation({
    mutationFn: api.createVehicle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fleetKeys.vehicles }),
  });
  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Vehicle> }) => api.updateVehicle(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fleetKeys.vehicles }),
  });
  const deleteVehicleMutation = useMutation({
    mutationFn: api.deleteVehicle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fleetKeys.vehicles }),
  });

  const addCustomerMutation = useMutation({
    mutationFn: api.createCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fleetKeys.customers }),
  });
  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Customer> }) =>
      api.updateCustomer(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fleetKeys.customers }),
  });
  const deleteCustomerMutation = useMutation({
    mutationFn: api.deleteCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fleetKeys.customers }),
  });

  const addBookingMutation = useMutation({
    mutationFn: api.createBooking,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: fleetKeys.bookings }),
        queryClient.invalidateQueries({ queryKey: fleetKeys.vehicles }),
        queryClient.invalidateQueries({ queryKey: fleetKeys.analytics }),
      ]);
    },
  });
  const setBookingStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      api.setBookingStatus(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: fleetKeys.bookings }),
        queryClient.invalidateQueries({ queryKey: fleetKeys.vehicles }),
        queryClient.invalidateQueries({ queryKey: fleetKeys.analytics }),
      ]);
    },
  });
  const deleteBookingMutation = useMutation({
    mutationFn: api.deleteBooking,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: fleetKeys.bookings }),
        queryClient.invalidateQueries({ queryKey: fleetKeys.vehicles }),
        queryClient.invalidateQueries({ queryKey: fleetKeys.analytics }),
      ]);
    },
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Driver> }) =>
      api.updateDriver(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fleetKeys.drivers }),
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fleetKeys.notifications }),
  });
  const markAllNotificationsReadMutation = useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fleetKeys.notifications }),
  });
  const dismissNotificationMutation = useMutation({
    mutationFn: api.deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fleetKeys.notifications }),
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: api.createPaymentMethod,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fleetKeys.paymentMethods }),
  });
  const setDefaultPaymentMethodMutation = useMutation({
    mutationFn: api.setDefaultPaymentMethod,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fleetKeys.paymentMethods }),
  });
  const removePaymentMethodMutation = useMutation({
    mutationFn: api.deletePaymentMethod,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fleetKeys.paymentMethods }),
  });

  const completeMaintenanceMutation = useMutation({
    mutationFn: api.completeMaintenance,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fleetKeys.maintenance }),
  });

  const value = React.useMemo<FleetState>(
    () => ({
      ready,
      error: authed ? error : null,
      vehicles: vehiclesQuery.data ?? [],
      bookings: bookingsQuery.data ?? [],
      customers: customersQuery.data ?? [],
      drivers: driversQuery.data ?? [],
      notifications: notificationsQuery.data ?? [],
      paymentMethods: paymentMethodsQuery.data ?? [],
      maintenanceTasks: maintenanceQuery.data ?? [],
      refreshCore,
      addVehicle: async (vehicle) => addVehicleMutation.mutateAsync(vehicle),
      updateVehicle: async (id, patch) => {
        await updateVehicleMutation.mutateAsync({ id, patch });
      },
      deleteVehicle: async (id) => {
        await deleteVehicleMutation.mutateAsync(id);
      },
      addCustomer: async (customer) => addCustomerMutation.mutateAsync(customer),
      updateCustomer: async (id, patch) => {
        await updateCustomerMutation.mutateAsync({ id, patch });
      },
      deleteCustomer: async (id) => {
        await deleteCustomerMutation.mutateAsync(id);
      },
      addBooking: async (booking) => addBookingMutation.mutateAsync(booking),
      setBookingStatus: async (id, status) => {
        await setBookingStatusMutation.mutateAsync({ id, status });
      },
      deleteBooking: async (id) => {
        await deleteBookingMutation.mutateAsync(id);
      },
      markNotificationRead: async (id) => {
        await markNotificationReadMutation.mutateAsync(id);
      },
      markAllNotificationsRead: async () => {
        await markAllNotificationsReadMutation.mutateAsync();
      },
      dismissNotification: async (id) => {
        await dismissNotificationMutation.mutateAsync(id);
      },
      addPaymentMethod: async (method) => {
        await addPaymentMethodMutation.mutateAsync(method);
      },
      setDefaultPaymentMethod: async (id) => {
        await setDefaultPaymentMethodMutation.mutateAsync(id);
      },
      removePaymentMethod: async (id) => {
        await removePaymentMethodMutation.mutateAsync(id);
      },
      completeMaintenance: async (id) => {
        await completeMaintenanceMutation.mutateAsync(id);
      },
      setDriverAvailability: async (id, availability) => {
        await updateDriverMutation.mutateAsync({ id, patch: { availability } });
      },
    }),
    [
      ready,
      authed,
      error,
      vehiclesQuery.data,
      bookingsQuery.data,
      customersQuery.data,
      driversQuery.data,
      notificationsQuery.data,
      paymentMethodsQuery.data,
      maintenanceQuery.data,
      refreshCore,
      addVehicleMutation,
      updateVehicleMutation,
      deleteVehicleMutation,
      addCustomerMutation,
      updateCustomerMutation,
      deleteCustomerMutation,
      addBookingMutation,
      setBookingStatusMutation,
      deleteBookingMutation,
      markNotificationReadMutation,
      markAllNotificationsReadMutation,
      dismissNotificationMutation,
      addPaymentMethodMutation,
      setDefaultPaymentMethodMutation,
      removePaymentMethodMutation,
      completeMaintenanceMutation,
      updateDriverMutation,
    ],
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const ctx = React.useContext(FleetContext);
  if (!ctx) throw new Error("useFleet must be used within FleetProvider");
  return ctx;
}

export { fleetKeys };
