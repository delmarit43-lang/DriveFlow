import * as React from "react";
import { Route, Routes } from "react-router-dom";
import { CardSkeleton, Skeleton, TableSkeleton } from "@/components/ui/skeleton";

// Every screen loads on demand so heavy dependencies (charts, tables, forms)
// stay out of the initial download.
const lazyPages = {
  Analytics: React.lazy(() => import("@/pages/analytics")),
  BookingCreate: React.lazy(() => import("@/pages/booking-create")),
  BookingDetail: React.lazy(() => import("@/pages/booking-detail")),
  Bookings: React.lazy(() => import("@/pages/bookings")),
  CustomerDetail: React.lazy(() => import("@/pages/customer-detail")),
  Customers: React.lazy(() => import("@/pages/customers")),
  Dashboard: React.lazy(() => import("@/pages/dashboard")),
  DriverDetail: React.lazy(() => import("@/pages/driver-detail")),
  Drivers: React.lazy(() => import("@/pages/drivers")),
  ForgotPassword: React.lazy(() => import("@/pages/forgot-password")),
  ResetPassword: React.lazy(() => import("@/pages/reset-password")),
  Help: React.lazy(() => import("@/pages/help")),
  Invoices: React.lazy(() => import("@/pages/invoices")),
  Login: React.lazy(() => import("@/pages/login")),
  Maintenance: React.lazy(() => import("@/pages/maintenance")),
  NotFound: React.lazy(() => import("@/pages/not-found")),
  Notifications: React.lazy(() => import("@/pages/notifications")),
  Payments: React.lazy(() => import("@/pages/payments")),
  Profile: React.lazy(() => import("@/pages/profile")),
  Reports: React.lazy(() => import("@/pages/reports")),
  Revenue: React.lazy(() => import("@/pages/revenue")),
  Settings: React.lazy(() => import("@/pages/settings")),
  Support: React.lazy(() => import("@/pages/support")),
  VehicleDetail: React.lazy(() => import("@/pages/vehicle-detail")),
  Vehicles: React.lazy(() => import("@/pages/vehicles")),
};

function PageFallback() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <TableSkeleton />
      </div>
    </div>
  );
}

export function AppRoutes() {
  const p = lazyPages;

  return (
    <React.Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<p.Dashboard />} />
        <Route path="/vehicles" element={<p.Vehicles />} />
        <Route path="/vehicles/:id" element={<p.VehicleDetail />} />
        <Route path="/bookings" element={<p.Bookings />} />
        <Route path="/bookings/create" element={<p.BookingCreate />} />
        <Route path="/bookings/:id" element={<p.BookingDetail />} />
        <Route path="/customers" element={<p.Customers />} />
        <Route path="/customers/:id" element={<p.CustomerDetail />} />
        <Route path="/drivers" element={<p.Drivers />} />
        <Route path="/drivers/:id" element={<p.DriverDetail />} />
        <Route path="/payments" element={<p.Payments />} />
        <Route path="/maintenance" element={<p.Maintenance />} />
        <Route path="/reports" element={<p.Reports />} />
        <Route path="/analytics" element={<p.Analytics />} />
        <Route path="/notifications" element={<p.Notifications />} />
        <Route path="/profile" element={<p.Profile />} />
        <Route path="/settings" element={<p.Settings />} />
        <Route path="/invoices" element={<p.Invoices />} />
        <Route path="/revenue" element={<p.Revenue />} />
        <Route path="/support" element={<p.Support />} />
        <Route path="/help" element={<p.Help />} />
        <Route path="/login" element={<p.Login />} />
        <Route path="/forgot-password" element={<p.ForgotPassword />} />
        <Route path="/reset-password" element={<p.ResetPassword />} />
        <Route path="*" element={<p.NotFound />} />
      </Routes>
    </React.Suspense>
  );
}
