import { z } from "zod";

export const createBookingSchema = z.object({
  customerId: z.string().min(1),
  vehicleId: z.string().min(1),
  status: z.enum(["pending", "active", "completed", "overdue", "cancelled"]).optional(),
  pickup: z.string().min(1),
  return: z.string().min(1),
  pickupLocation: z.string().optional().default(""),
  amount: z.coerce.number().nonnegative().optional().default(0),
  paymentStatus: z.enum(["success", "pending", "failed", "refunded"]).optional(),
});

export const updateBookingSchema = createBookingSchema.partial();
