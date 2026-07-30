import { z } from "zod";

const vehicleStatus = z.enum(["available", "reserved", "booked", "rented", "maintenance"]);

export const createVehicleSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  name: z.string().optional(),
  plate: z.string().min(1),
  category: z.string().min(1),
  status: vehicleStatus.optional(),
  fuel: z.string().min(1),
  engine: z.string().optional().default(""),
  transmission: z.string().min(1),
  dailyRate: z.coerce.number().nonnegative(),
  image: z.string().optional().default(""),
  year: z.coerce.number().int().min(1980).max(2100),
  mileage: z.coerce.number().int().nonnegative().optional().default(0),
  seats: z.coerce.number().int().positive().optional().default(5),
  location: z.string().optional().default(""),
  health: z.coerce.number().int().min(0).max(100).optional().default(100),
  nextServiceDue: z.string().optional().default(""),
  insuranceExpiry: z.string().optional().default(""),
  registrationExpiry: z.string().optional().default(""),
});

export const updateVehicleSchema = createVehicleSchema.partial();
