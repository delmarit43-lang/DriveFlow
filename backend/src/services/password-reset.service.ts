import { createHash, randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { hashPassword } from "../utils/password.js";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function getMailer() {
  if (!env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  // Always succeed to avoid email enumeration
  if (!user) return { ok: true };

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  const resetUrl = `${env.APP_URL.replace(/\/$/, "")}/reset-password?token=${token}`;
  const mailer = await getMailer();

  if (mailer) {
    await mailer.sendMail({
      from: env.SMTP_FROM,
      to: user.email,
      subject: "DriveFlow password reset",
      text: `Reset your password: ${resetUrl}\nThis link expires in 1 hour.`,
      html: `<p>Reset your DriveFlow password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
    });
  } else {
    console.info(`[password-reset] ${user.email} → ${resetUrl}`);
  }

  return { ok: true };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const tokenHash = hashToken(token);
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    throw new AppError(400, "Reset link is invalid or expired");
  }

  await prisma.user.update({
    where: { id: row.userId },
    data: { password: await hashPassword(newPassword) },
  });
  await prisma.passwordResetToken.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });
  await prisma.refreshToken.updateMany({
    where: { userId: row.userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return { ok: true };
}
