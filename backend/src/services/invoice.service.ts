import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { mapInvoiceStatusFromApi, toInvoiceDto } from "../utils/mappers.js";

type InvoiceInput = {
  bookingId?: string;
  customerId?: string;
  amount: number;
  issuedAt?: string;
  dueAt?: string;
  status?: string;
};

export async function listInvoices() {
  const rows = await prisma.invoice.findMany({
    include: { customer: true },
    orderBy: { issuedAt: "desc" },
  });
  return rows.map(toInvoiceDto);
}

export async function getInvoice(id: string) {
  const row = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true },
  });
  if (!row) throw new AppError(404, "Invoice not found");
  return toInvoiceDto(row);
}

export async function createInvoice(input: InvoiceInput) {
  const status = mapInvoiceStatusFromApi(input.status) ?? "PENDING";
  const row = await prisma.invoice.create({
    data: {
      bookingId: input.bookingId || null,
      customerId: input.customerId || null,
      amount: input.amount,
      issuedAt: input.issuedAt ? new Date(input.issuedAt) : undefined,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
      status,
    },
    include: { customer: true },
  });
  return toInvoiceDto(row);
}

export async function updateInvoice(id: string, input: Partial<InvoiceInput>) {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Invoice not found");

  const status = input.status ? mapInvoiceStatusFromApi(input.status) : undefined;
  if (input.status && !status) throw new AppError(400, "Invalid invoice status");

  const row = await prisma.invoice.update({
    where: { id },
    data: {
      bookingId: input.bookingId === undefined ? undefined : input.bookingId || null,
      customerId: input.customerId === undefined ? undefined : input.customerId || null,
      amount: input.amount,
      issuedAt: input.issuedAt ? new Date(input.issuedAt) : undefined,
      dueAt: input.dueAt === undefined ? undefined : input.dueAt ? new Date(input.dueAt) : null,
      status,
    },
    include: { customer: true },
  });
  return toInvoiceDto(row);
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({ where: { id } });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") throw new AppError(404, "Invoice not found");
    throw err;
  }
}
