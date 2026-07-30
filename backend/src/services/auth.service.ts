import { randomUUID } from "node:crypto";
import type { UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import {
  refreshExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { toUserDto } from "../utils/mappers.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

type RegisterInput = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role?: UserRole;
};

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) throw new AppError(409, "Email already registered");

  const userCount = await prisma.user.count();
  const role: UserRole =
    input.role ?? (userCount === 0 ? "SUPER_ADMIN" : "STAFF");

  if (input.role === "SUPER_ADMIN" && userCount > 0) {
    throw new AppError(403, "Cannot self-assign Super Admin");
  }

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      phone: input.phone ?? "",
      password: await hashPassword(input.password),
      role,
    },
  });

  return issueTokens(user.id, user.email, user.role);
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw new AppError(401, "Invalid email or password");
  if (user.status !== "ACTIVE") throw new AppError(403, "Account is not active");

  const ok = await verifyPassword(password, user.password);
  if (!ok) throw new AppError(401, "Invalid email or password");

  return issueTokens(user.id, user.email, user.role);
}

export async function logoutUser(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (stored && !stored.revokedAt) {
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
  }
  return { ok: true };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");
  return toUserDto(user);
}

export async function updateProfile(
  userId: string,
  input: { fullName?: string; phone?: string; profileImage?: string; email?: string },
) {
  if (input.email) {
    const taken = await prisma.user.findFirst({
      where: { email: input.email.toLowerCase(), NOT: { id: userId } },
    });
    if (taken) throw new AppError(409, "Email already in use");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: input.fullName,
      phone: input.phone,
      profileImage: input.profileImage,
      email: input.email ? input.email.toLowerCase() : undefined,
    },
  });
  return toUserDto(user);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  const ok = await verifyPassword(currentPassword, user.password);
  if (!ok) throw new AppError(400, "Current password is incorrect");

  await prisma.user.update({
    where: { id: userId },
    data: { password: await hashPassword(newPassword) },
  });

  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return { ok: true };
}

export async function refreshSession(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AppError(401, "Refresh token revoked or expired");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.status !== "ACTIVE") throw new AppError(401, "Invalid user");

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return issueTokens(user.id, user.email, user.role);
}

async function issueTokens(userId: string, email: string, role: UserRole) {
  const jti = randomUUID();
  const accessToken = signAccessToken({ sub: userId, email, role });
  const refreshToken = signRefreshToken({ sub: userId, jti });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: refreshExpiryDate(),
    },
  });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  return {
    user: toUserDto(user),
    accessToken,
    refreshToken,
  };
}
