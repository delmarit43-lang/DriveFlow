import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { mapDriverAvailabilityFromApi, toDriverDto } from "../utils/mappers.js";

type DriverInput = {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  license?: string;
  licenseExpiry?: string;
  rating?: number;
  trips?: number;
  performance?: number;
  availability?: string;
  assignedVehicleId?: string | null;
  emergencyContact?: { name?: string; phone?: string };
  documents?: { label: string; status: string }[];
};

export async function listDrivers() {
  const rows = await prisma.driver.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toDriverDto);
}

export async function getDriver(id: string) {
  const row = await prisma.driver.findUnique({ where: { id } });
  if (!row) throw new AppError(404, "Driver not found");
  return toDriverDto(row);
}

export async function createDriver(input: DriverInput) {
  const availability = mapDriverAvailabilityFromApi(input.availability) ?? "AVAILABLE";
  try {
    const row = await prisma.driver.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone ?? "",
        avatar: input.avatar ?? "",
        license: input.license ?? "",
        licenseExpiry: input.licenseExpiry ?? "",
        rating: input.rating ?? 5,
        trips: input.trips ?? 0,
        performance: input.performance ?? 80,
        availability,
        assignedVehicleId: input.assignedVehicleId || null,
        emergencyContactName: input.emergencyContact?.name ?? "",
        emergencyContactPhone: input.emergencyContact?.phone ?? "",
        documents: input.documents ?? [],
      },
    });
    return toDriverDto(row);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") throw new AppError(409, "Email already exists");
    throw err;
  }
}

export async function updateDriver(id: string, input: Partial<DriverInput>) {
  const existing = await prisma.driver.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Driver not found");

  const availability = input.availability
    ? mapDriverAvailabilityFromApi(input.availability)
    : undefined;
  if (input.availability && !availability) throw new AppError(400, "Invalid availability");

  try {
    const row = await prisma.driver.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email?.toLowerCase(),
        phone: input.phone,
        avatar: input.avatar,
        license: input.license,
        licenseExpiry: input.licenseExpiry,
        rating: input.rating,
        trips: input.trips,
        performance: input.performance,
        availability,
        assignedVehicleId:
          input.assignedVehicleId === undefined ? undefined : input.assignedVehicleId || null,
        emergencyContactName: input.emergencyContact?.name,
        emergencyContactPhone: input.emergencyContact?.phone,
        documents: input.documents,
      },
    });
    return toDriverDto(row);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") throw new AppError(409, "Email already exists");
    throw err;
  }
}

export async function deleteDriver(id: string) {
  try {
    await prisma.driver.delete({ where: { id } });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") throw new AppError(404, "Driver not found");
    throw err;
  }
}
