import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { toPaymentMethodDto } from "../utils/mappers.js";

type MethodInput = {
  type?: string;
  label: string;
  detail: string;
  meta?: string;
  isDefault?: boolean;
  verified?: boolean;
};

export async function listPaymentMethods() {
  const rows = await prisma.paymentMethod.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toPaymentMethodDto);
}

export async function createPaymentMethod(input: MethodInput) {
  if (input.isDefault) {
    await prisma.paymentMethod.updateMany({ data: { isDefault: false } });
  }
  const row = await prisma.paymentMethod.create({
    data: {
      type: input.type ?? "visa",
      label: input.label,
      detail: input.detail,
      meta: input.meta ?? "",
      isDefault: input.isDefault ?? false,
      verified: input.verified ?? true,
    },
  });
  return toPaymentMethodDto(row);
}

export async function setDefaultPaymentMethod(id: string) {
  const existing = await prisma.paymentMethod.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Payment method not found");
  await prisma.paymentMethod.updateMany({ data: { isDefault: false } });
  return toPaymentMethodDto(
    await prisma.paymentMethod.update({ where: { id }, data: { isDefault: true } }),
  );
}

export async function deletePaymentMethod(id: string) {
  try {
    await prisma.paymentMethod.delete({ where: { id } });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      throw new AppError(404, "Payment method not found");
    }
    throw err;
  }
}
