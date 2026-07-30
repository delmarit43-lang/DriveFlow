import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import {
  mapCustomerStatusFromApi,
  mapTierFromApi,
  toCustomerDto,
} from "../utils/mappers.js";

type CustomerInput = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  license?: string;
  licenseExpiry?: string;
  tier?: string;
  status?: string;
  avatar?: string;
  memberSince?: number;
  totalRentals?: number;
  lifetimeSpend?: number;
  loyaltyProgress?: number;
  balance?: number;
  trips?: number;
};

export async function listCustomers() {
  const rows = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toCustomerDto);
}

export async function getCustomer(id: string) {
  const row = await prisma.customer.findUnique({ where: { id } });
  if (!row) throw new AppError(404, "Customer not found");
  return toCustomerDto(row);
}

export async function createCustomer(input: CustomerInput) {
  const tier = mapTierFromApi(input.tier) ?? "STANDARD";
  const status = mapCustomerStatusFromApi(input.status) ?? "ACTIVE";

  const row = await prisma.customer.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone ?? "",
      address: input.address ?? "",
      license: input.license ?? "",
      licenseExpiry: input.licenseExpiry ?? "",
      tier,
      status,
      avatar: input.avatar ?? "",
      memberSince: input.memberSince ?? new Date().getFullYear(),
      totalRentals: input.totalRentals ?? 0,
      lifetimeSpend: input.lifetimeSpend ?? 0,
      loyaltyProgress: input.loyaltyProgress ?? 0,
      balance: input.balance ?? 0,
      trips: input.trips ?? 0,
    },
  });
  return toCustomerDto(row);
}

export async function updateCustomer(id: string, input: Partial<CustomerInput>) {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Customer not found");

  const tier = input.tier ? mapTierFromApi(input.tier) : undefined;
  const status = input.status ? mapCustomerStatusFromApi(input.status) : undefined;
  if (input.tier && !tier) throw new AppError(400, "Invalid customer tier");
  if (input.status && !status) throw new AppError(400, "Invalid customer status");

  const row = await prisma.customer.update({
    where: { id },
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      license: input.license,
      licenseExpiry: input.licenseExpiry,
      tier,
      status,
      avatar: input.avatar,
      memberSince: input.memberSince,
      totalRentals: input.totalRentals,
      lifetimeSpend: input.lifetimeSpend,
      loyaltyProgress: input.loyaltyProgress,
      balance: input.balance,
      trips: input.trips,
    },
  });
  return toCustomerDto(row);
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({ where: { id } });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      throw new AppError(404, "Customer not found");
    }
    if ((err as { code?: string }).code === "P2003") {
      throw new AppError(400, "Customer has related bookings and cannot be deleted");
    }
    throw err;
  }
}
