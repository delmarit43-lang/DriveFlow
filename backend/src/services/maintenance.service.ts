import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { mapMaintenanceStatusFromApi, toMaintenanceDto } from "../utils/mappers.js";

type MaintenanceInput = {
  vehicleId: string;
  type: string;
  description?: string;
  cost?: number;
  garage?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
};

export async function listMaintenance() {
  const rows = await prisma.maintenance.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toMaintenanceDto);
}

export async function getMaintenance(id: string) {
  const row = await prisma.maintenance.findUnique({ where: { id } });
  if (!row) throw new AppError(404, "Maintenance task not found");
  return toMaintenanceDto(row);
}

export async function createMaintenance(input: MaintenanceInput) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
  if (!vehicle) throw new AppError(400, "Vehicle not found");

  const status = mapMaintenanceStatusFromApi(input.status) ?? "PENDING";
  const row = await prisma.maintenance.create({
    data: {
      vehicleId: input.vehicleId,
      title: input.type,
      description: input.description ?? "",
      cost: input.cost ?? 0,
      garage: input.garage ?? "",
      priority: input.priority ?? "medium",
      status,
      dueDate: input.dueDate ?? "",
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });
  return toMaintenanceDto(row);
}

export async function updateMaintenance(id: string, input: Partial<MaintenanceInput>) {
  const existing = await prisma.maintenance.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Maintenance task not found");

  const status = input.status ? mapMaintenanceStatusFromApi(input.status) : undefined;
  if (input.status && !status) throw new AppError(400, "Invalid maintenance status");

  if (input.vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
    if (!vehicle) throw new AppError(400, "Vehicle not found");
  }

  const row = await prisma.maintenance.update({
    where: { id },
    data: {
      vehicleId: input.vehicleId,
      title: input.type,
      description: input.description,
      cost: input.cost,
      garage: input.garage,
      priority: input.priority,
      status,
      dueDate: input.dueDate,
      completedAt:
        status === "COMPLETED"
          ? new Date()
          : status
            ? null
            : undefined,
    },
  });
  return toMaintenanceDto(row);
}

export async function completeMaintenance(id: string) {
  return updateMaintenance(id, { status: "completed" });
}

export async function deleteMaintenance(id: string) {
  try {
    await prisma.maintenance.delete({ where: { id } });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      throw new AppError(404, "Maintenance task not found");
    }
    throw err;
  }
}
