import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { mapNotificationCategoryFromApi, toNotificationDto } from "../utils/mappers.js";

type NotificationInput = {
  userId?: string | null;
  category?: string;
  title: string;
  description?: string;
  read?: boolean;
};

export async function listNotifications(userId?: string) {
  const rows = await prisma.notification.findMany({
    where: userId ? { OR: [{ userId }, { userId: null }] } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toNotificationDto);
}

export async function createNotification(input: NotificationInput) {
  const category = mapNotificationCategoryFromApi(input.category) ?? "SYSTEM";
  const row = await prisma.notification.create({
    data: {
      userId: input.userId || null,
      category,
      title: input.title,
      description: input.description ?? "",
      read: input.read ?? false,
    },
  });
  return toNotificationDto(row);
}

export async function markRead(id: string, userId?: string) {
  const row = await prisma.notification.findUnique({ where: { id } });
  if (!row) throw new AppError(404, "Notification not found");
  if (row.userId && userId && row.userId !== userId) {
    throw new AppError(403, "Forbidden");
  }
  return toNotificationDto(
    await prisma.notification.update({ where: { id }, data: { read: true } }),
  );
}

export async function markAllRead(userId?: string) {
  await prisma.notification.updateMany({
    where: userId
      ? { read: false, OR: [{ userId }, { userId: null }] }
      : { read: false },
    data: { read: true },
  });
  return { ok: true };
}

export async function deleteNotification(id: string, userId?: string) {
  const row = await prisma.notification.findUnique({ where: { id } });
  if (!row) throw new AppError(404, "Notification not found");
  if (row.userId && userId && row.userId !== userId) {
    throw new AppError(403, "Forbidden");
  }
  await prisma.notification.delete({ where: { id } });
}
