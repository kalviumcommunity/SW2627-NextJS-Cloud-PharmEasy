import { prisma } from "@/lib/prisma";

export async function getNotifications(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function markAllAsRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function createNotification({ userId, message, type }) {
  return prisma.notification.create({
    data: {
      userId,
      message,
      type,
      read: false,
    },
  });
}
