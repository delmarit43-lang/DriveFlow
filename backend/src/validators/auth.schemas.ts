import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().default(""),
  password: z.string().min(8).max(128),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "STAFF"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().max(40).optional(),
  profileImage: z.string().optional(),
  email: z.string().email().optional(),
});
