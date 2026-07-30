import { z } from "zod";

export const createDriverSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  avatar: z.string().optional(),
  license: z.string().max(80).optional(),
  licenseExpiry: z.string().max(40).optional(),
  rating: z.number().min(0).max(5).optional(),
  trips: z.number().int().min(0).optional(),
  performance: z.number().int().min(0).max(100).optional(),
  availability: z.enum(["available", "on-trip", "off-duty"]).optional(),
  assignedVehicleId: z.string().nullable().optional(),
  emergencyContact: z
    .object({ name: z.string().optional(), phone: z.string().optional() })
    .optional(),
  documents: z
    .array(z.object({ label: z.string(), status: z.enum(["verified", "pending", "expired"]) }))
    .optional(),
});

export const updateDriverSchema = createDriverSchema.partial();

export const createPaymentSchema = z.object({
  bookingId: z.string().optional(),
  customerId: z.string().optional(),
  vehicleId: z.string().optional(),
  amount: z.number().positive(),
  method: z.string().max(80).optional(),
  status: z.enum(["success", "pending", "failed", "refunded"]).optional(),
  paidAt: z.string().optional(),
});

export const updatePaymentSchema = createPaymentSchema.partial();

export const createInvoiceSchema = z.object({
  bookingId: z.string().optional(),
  customerId: z.string().optional(),
  amount: z.number().positive(),
  issuedAt: z.string().optional(),
  dueAt: z.string().optional(),
  status: z.enum(["paid", "pending", "overdue"]).optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1),
  type: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  cost: z.number().min(0).optional(),
  garage: z.string().max(120).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  status: z.enum(["scheduled", "in-progress", "completed"]).optional(),
  dueDate: z.string().max(40).optional(),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial();

export const createNotificationSchema = z.object({
  userId: z.string().nullable().optional(),
  category: z.enum(["maintenance", "booking", "payment", "vehicle", "system"]).optional(),
  title: z.string().min(2).max(200),
  description: z.string().max(500).optional(),
  read: z.boolean().optional(),
});

export const createPaymentMethodSchema = z.object({
  type: z.enum(["visa", "mastercard", "bank", "wallet"]).optional(),
  label: z.string().min(2).max(120),
  detail: z.string().min(2).max(120),
  meta: z.string().max(120).optional(),
  isDefault: z.boolean().optional(),
  verified: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  newPassword: z.string().min(8).max(128),
});
