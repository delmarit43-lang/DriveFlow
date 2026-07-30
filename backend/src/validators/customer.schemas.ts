import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  license: z.string().optional().default(""),
  licenseExpiry: z.string().optional().default(""),
  tier: z.enum(["standard", "gold", "platinum", "vip"]).optional(),
  status: z.enum(["active", "pending", "inactive"]).optional(),
  avatar: z.string().optional().default(""),
  memberSince: z.coerce.number().int().optional(),
  totalRentals: z.coerce.number().int().optional(),
  lifetimeSpend: z.coerce.number().optional(),
  loyaltyProgress: z.coerce.number().int().optional(),
  balance: z.coerce.number().optional(),
  trips: z.coerce.number().int().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
