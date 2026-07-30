import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import {
  mapVehicleStatusFromApi,
  toVehicleDto,
} from "../utils/mappers.js";

type VehicleInput = {
  brand: string;
  model: string;
  name?: string;
  plate: string;
  category: string;
  status?: string;
  fuel: string;
  engine?: string;
  transmission: string;
  dailyRate: number;
  image?: string;
  year: number;
  mileage?: number;
  seats?: number;
  location?: string;
  health?: number;
  nextServiceDue?: string;
  insuranceExpiry?: string;
  registrationExpiry?: string;
};

export async function listVehicles() {
  const rows = await prisma.vehicle.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toVehicleDto);
}

export async function getVehicle(id: string) {
  const row = await prisma.vehicle.findUnique({ where: { id } });
  if (!row) throw new AppError(404, "Vehicle not found");
  return toVehicleDto(row);
}

export async function createVehicle(input: VehicleInput) {
  const name = input.name?.trim() || `${input.brand} ${input.model}`.trim();
  const status = mapVehicleStatusFromApi(input.status) ?? "AVAILABLE";

  try {
    const row = await prisma.vehicle.create({
      data: {
        brand: input.brand,
        model: input.model,
        name,
        plate: input.plate,
        category: input.category,
        status,
        fuel: input.fuel,
        engine: input.engine ?? "",
        transmission: input.transmission,
        dailyRate: input.dailyRate,
        image: input.image ?? "",
        year: input.year,
        mileage: input.mileage ?? 0,
        seats: input.seats ?? 5,
        location: input.location ?? "",
        health: input.health ?? 100,
        nextServiceDue: input.nextServiceDue ?? "",
        insuranceExpiry: input.insuranceExpiry ?? "",
        registrationExpiry: input.registrationExpiry ?? "",
      },
    });
    return toVehicleDto(row);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      throw new AppError(409, "Plate already exists");
    }
    throw err;
  }
}

export async function updateVehicle(id: string, input: Partial<VehicleInput>) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Vehicle not found");

  const status = input.status ? mapVehicleStatusFromApi(input.status) : undefined;
  if (input.status && !status) throw new AppError(400, "Invalid vehicle status");

  try {
    const row = await prisma.vehicle.update({
      where: { id },
      data: {
        brand: input.brand,
        model: input.model,
        name: input.name,
        plate: input.plate,
        category: input.category,
        status,
        fuel: input.fuel,
        engine: input.engine,
        transmission: input.transmission,
        dailyRate: input.dailyRate,
        image: input.image,
        year: input.year,
        mileage: input.mileage,
        seats: input.seats,
        location: input.location,
        health: input.health,
        nextServiceDue: input.nextServiceDue,
        insuranceExpiry: input.insuranceExpiry,
        registrationExpiry: input.registrationExpiry,
      },
    });
    return toVehicleDto(row);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      throw new AppError(409, "Plate already exists");
    }
    throw err;
  }
}

export async function deleteVehicle(id: string) {
  try {
    await prisma.vehicle.delete({ where: { id } });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      throw new AppError(404, "Vehicle not found");
    }
    if ((err as { code?: string }).code === "P2003") {
      throw new AppError(400, "Vehicle has related bookings and cannot be deleted");
    }
    throw err;
  }
}
