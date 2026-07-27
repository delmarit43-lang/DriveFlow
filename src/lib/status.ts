import type { BookingStatus, PaymentStatus, VehicleStatus } from "@/types";

type Variant = "default" | "success" | "warning" | "danger" | "purple" | "muted";

export const vehicleStatusMeta: Record<VehicleStatus, { label: string; variant: Variant }> = {
  available: { label: "Available", variant: "success" },
  rented: { label: "Rented", variant: "default" },
  reserved: { label: "Reserved", variant: "purple" },
  maintenance: { label: "In Maintenance", variant: "danger" },
};

export const bookingStatusMeta: Record<BookingStatus, { label: string; variant: Variant }> = {
  active: { label: "Active", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  completed: { label: "Completed", variant: "muted" },
  overdue: { label: "Overdue", variant: "danger" },
  cancelled: { label: "Cancelled", variant: "muted" },
};

export const paymentStatusMeta: Record<PaymentStatus, { label: string; variant: Variant }> = {
  success: { label: "Success", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  failed: { label: "Failed", variant: "danger" },
  refunded: { label: "Refunded", variant: "purple" },
};
