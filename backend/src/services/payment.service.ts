import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { mapPaymentStatusFromApi, toPaymentDto } from "../utils/mappers.js";

type PaymentInput = {
  bookingId?: string;
  customerId?: string;
  vehicleId?: string;
  amount: number;
  method?: string;
  status?: string;
  paidAt?: string;
};

export async function listPayments() {
  const rows = await prisma.payment.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toPaymentDto);
}

export async function getPayment(id: string) {
  const row = await prisma.payment.findUnique({
    where: { id },
    include: { customer: true },
  });
  if (!row) throw new AppError(404, "Payment not found");
  return toPaymentDto(row);
}

export async function createPayment(input: PaymentInput) {
  const status = mapPaymentStatusFromApi(input.status) ?? "PENDING";
  const row = await prisma.payment.create({
    data: {
      bookingId: input.bookingId || null,
      customerId: input.customerId || null,
      vehicleId: input.vehicleId || null,
      amount: input.amount,
      method: input.method ?? "",
      status,
      paidAt: status === "SUCCESS" ? new Date(input.paidAt ?? Date.now()) : null,
    },
    include: { customer: true },
  });
  return toPaymentDto(row);
}

export async function updatePayment(id: string, input: Partial<PaymentInput>) {
  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Payment not found");

  const status = input.status ? mapPaymentStatusFromApi(input.status) : undefined;
  if (input.status && !status) throw new AppError(400, "Invalid payment status");

  const row = await prisma.payment.update({
    where: { id },
    data: {
      bookingId: input.bookingId === undefined ? undefined : input.bookingId || null,
      customerId: input.customerId === undefined ? undefined : input.customerId || null,
      vehicleId: input.vehicleId === undefined ? undefined : input.vehicleId || null,
      amount: input.amount,
      method: input.method,
      status,
      paidAt:
        status === "SUCCESS"
          ? new Date(input.paidAt ?? Date.now())
          : status
            ? null
            : undefined,
    },
    include: { customer: true },
  });
  return toPaymentDto(row);
}

export async function deletePayment(id: string) {
  try {
    await prisma.payment.delete({ where: { id } });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") throw new AppError(404, "Payment not found");
    throw err;
  }
}
