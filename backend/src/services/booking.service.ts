import type { BookingStatus, Prisma, VehicleStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import {
  mapBookingStatusFromApi,
  mapPaymentStatusFromApi,
  toBookingDto,
} from "../utils/mappers.js";

type BookingInput = {
  customerId: string;
  vehicleId: string;
  status?: string;
  pickup: string;
  return: string;
  pickupLocation?: string;
  amount?: number;
  paymentStatus?: string;
};

function vehicleStatusForBooking(status: BookingStatus): VehicleStatus | null {
  switch (status) {
    case "PENDING":
      return "BOOKED";
    case "ACTIVE":
    case "OVERDUE":
      return "RENTED";
    case "COMPLETED":
    case "CANCELLED":
      return "AVAILABLE";
    default:
      return null;
  }
}

async function syncVehicleStatus(
  tx: Prisma.TransactionClient,
  vehicleId: string,
  bookingStatus: BookingStatus,
) {
  const next = vehicleStatusForBooking(bookingStatus);
  if (!next) return;

  if (next === "AVAILABLE") {
    const blocking = await tx.booking.count({
      where: {
        vehicleId,
        status: { in: ["PENDING", "ACTIVE", "OVERDUE"] },
      },
    });
    if (blocking > 0) return;
  }

  await tx.vehicle.update({
    where: { id: vehicleId },
    data: { status: next },
  });
}

export async function listBookings() {
  const rows = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, vehicle: true },
  });
  return rows.map(toBookingDto);
}

export async function getBooking(id: string) {
  const row = await prisma.booking.findUnique({
    where: { id },
    include: { customer: true, vehicle: true },
  });
  if (!row) throw new AppError(404, "Booking not found");
  return toBookingDto(row);
}

export async function createBooking(input: BookingInput) {
  const status = mapBookingStatusFromApi(input.status) ?? "PENDING";
  const paymentStatus = mapPaymentStatusFromApi(input.paymentStatus) ?? "PENDING";

  const [customer, vehicle] = await Promise.all([
    prisma.customer.findUnique({ where: { id: input.customerId } }),
    prisma.vehicle.findUnique({ where: { id: input.vehicleId } }),
  ]);
  if (!customer) throw new AppError(400, "Invalid customer id");
  if (!vehicle) throw new AppError(400, "Invalid vehicle id");

  if (status === "PENDING" || status === "ACTIVE") {
    if (vehicle.status !== "AVAILABLE" && vehicle.status !== "BOOKED") {
      throw new AppError(400, "Vehicle is not available for booking");
    }
  }

  const row = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        customerId: input.customerId,
        vehicleId: input.vehicleId,
        status,
        pickup: input.pickup,
        returnDate: input.return,
        pickupLocation: input.pickupLocation ?? "",
        amount: input.amount ?? 0,
        paymentStatus,
      },
    });
    await syncVehicleStatus(tx, input.vehicleId, status);
    return booking;
  });

  return toBookingDto(row);
}

export async function updateBooking(id: string, input: Partial<BookingInput>) {
  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Booking not found");

  const status = input.status ? mapBookingStatusFromApi(input.status) : undefined;
  const paymentStatus = input.paymentStatus
    ? mapPaymentStatusFromApi(input.paymentStatus)
    : undefined;
  if (input.status && !status) throw new AppError(400, "Invalid booking status");
  if (input.paymentStatus && !paymentStatus) throw new AppError(400, "Invalid payment status");

  const nextCustomerId = input.customerId ?? existing.customerId;
  const nextVehicleId = input.vehicleId ?? existing.vehicleId;
  const nextStatus = status ?? existing.status;

  const row = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.update({
      where: { id },
      data: {
        customerId: nextCustomerId,
        vehicleId: nextVehicleId,
        status: nextStatus,
        pickup: input.pickup,
        returnDate: input.return,
        pickupLocation: input.pickupLocation,
        amount: input.amount,
        paymentStatus,
      },
    });

    if (existing.vehicleId !== nextVehicleId) {
      await syncVehicleStatus(tx, existing.vehicleId, "CANCELLED");
    }
    await syncVehicleStatus(tx, nextVehicleId, nextStatus);
    return booking;
  });

  return toBookingDto(row);
}

export async function deleteBooking(id: string) {
  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Booking not found");

  await prisma.$transaction(async (tx) => {
    await tx.booking.delete({ where: { id } });
    await syncVehicleStatus(tx, existing.vehicleId, "CANCELLED");
  });
}
