"use client";

import * as React from "react";
import {
  bookings as seedBookings,
  customers as seedCustomers,
  drivers as seedDrivers,
  maintenanceTasks as seedMaintenance,
  notifications as seedNotifications,
  paymentMethods as seedPaymentMethods,
  vehicles as seedVehicles,
} from "@/data/mock";
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

type FleetState = {
  vehicles: Vehicle[];
  bookings: Booking[];
  customers: Customer[];
  drivers: Driver[];
  notifications: NotificationItem[];
  paymentMethods: PaymentMethod[];
  maintenanceTasks: MaintenanceTask[];
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Vehicle;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addBooking: (booking: Omit<Booking, "id">) => Booking;
  setBookingStatus: (id: string, status: BookingStatus) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  addPaymentMethod: (method: Omit<PaymentMethod, "id">) => void;
  setDefaultPaymentMethod: (id: string) => void;
  removePaymentMethod: (id: string) => void;
  completeMaintenance: (id: string) => void;
  setDriverAvailability: (id: string, availability: Driver["availability"]) => void;
};

const FleetContext = React.createContext<FleetState | null>(null);

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}${Date.now().toString(36)}${(idCounter++).toString(36)}`;

export function FleetProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>(seedVehicles);
  const [bookings, setBookings] = React.useState<Booking[]>(seedBookings);
  const [customers] = React.useState<Customer[]>(seedCustomers);
  const [drivers, setDrivers] = React.useState<Driver[]>(seedDrivers);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(seedNotifications);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>(seedPaymentMethods);
  const [maintenanceTasks, setMaintenanceTasks] = React.useState<MaintenanceTask[]>(seedMaintenance);

  const value = React.useMemo<FleetState>(
    () => ({
      vehicles,
      bookings,
      customers,
      drivers,
      notifications,
      paymentMethods,
      maintenanceTasks,
      addVehicle: (vehicle) => {
        const created: Vehicle = { ...vehicle, id: nextId("v-") };
        setVehicles((prev) => [created, ...prev]);
        return created;
      },
      updateVehicle: (id, patch) => {
        setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
      },
      deleteVehicle: (id) => {
        setVehicles((prev) => prev.filter((v) => v.id !== id));
      },
      addBooking: (booking) => {
        const created: Booking = { ...booking, id: `BK-${Math.floor(10000 + Math.random() * 89999)}` };
        setBookings((prev) => [created, ...prev]);
        setVehicles((prev) => prev.map((v) => (v.id === booking.vehicleId ? { ...v, status: "reserved" } : v)));
        return created;
      },
      setBookingStatus: (id, status) => {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      },
      markNotificationRead: (id) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      },
      markAllNotificationsRead: () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      },
      dismissNotification: (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      },
      addPaymentMethod: (method) => {
        setPaymentMethods((prev) => [...prev, { ...method, id: nextId("pm-") }]);
      },
      setDefaultPaymentMethod: (id) => {
        setPaymentMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
      },
      removePaymentMethod: (id) => {
        setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
      },
      completeMaintenance: (id) => {
        setMaintenanceTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "completed" } : t)));
      },
      setDriverAvailability: (id, availability) => {
        setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, availability } : d)));
      },
    }),
    [vehicles, bookings, customers, drivers, notifications, paymentMethods, maintenanceTasks],
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const ctx = React.useContext(FleetContext);
  if (!ctx) throw new Error("useFleet must be used within FleetProvider");
  return ctx;
}
