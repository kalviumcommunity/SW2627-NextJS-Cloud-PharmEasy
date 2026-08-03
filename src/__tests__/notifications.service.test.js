import {
  getNotifications,
  markAllAsRead,
  createNotification,
  deleteNotification,
  deleteAllNotifications,
} from "@/lib/services";
import { prisma } from "@/lib/prisma";
import { NOTIFICATION_TYPE } from "@/lib/utils";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    notification: { findMany: jest.fn(), updateMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
  },
}));

describe("getNotifications", () => {
  beforeEach(() => jest.clearAllMocks());

  it("only fetches notifications scoped to the given user, newest first", async () => {
    prisma.notification.findMany.mockResolvedValue([]);

    await getNotifications("user_1");

    expect(prisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId: "user_1" },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("markAllAsRead", () => {
  beforeEach(() => jest.clearAllMocks());

  it("marks only the user's unread notifications as read", async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 2 });

    await markAllAsRead("user_1");

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: "user_1", read: false },
      data: { read: true },
    });
  });
});

describe("createNotification", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a notification as unread by default", async () => {
    prisma.notification.create.mockResolvedValue({ id: "notif_1" });

    await createNotification({
      userId: "user_1",
      message: "Your refill is due tomorrow",
      type: NOTIFICATION_TYPE.REFILL_REMINDER,
    });

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: "user_1",
        message: "Your refill is due tomorrow",
        type: NOTIFICATION_TYPE.REFILL_REMINDER,
        read: false,
      },
    });
  });
});

describe("deleteNotification", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes a notification belonging to the user", async () => {
    prisma.notification.findFirst.mockResolvedValue({ id: "notif_1", userId: "user_1" });
    prisma.notification.delete.mockResolvedValue({ id: "notif_1" });

    await deleteNotification("notif_1", "user_1");

    expect(prisma.notification.delete).toHaveBeenCalledWith({ where: { id: "notif_1" } });
  });

  it("throws if the notification doesn't exist or belongs to someone else", async () => {
    prisma.notification.findFirst.mockResolvedValue(null);

    await expect(deleteNotification("notif_1", "someone_else")).rejects.toThrow(
      "Notification not found"
    );
    expect(prisma.notification.delete).not.toHaveBeenCalled();
  });
});

describe("deleteAllNotifications", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes all notifications scoped to the given user only", async () => {
    prisma.notification.deleteMany.mockResolvedValue({ count: 5 });

    await deleteAllNotifications("user_1");

    expect(prisma.notification.deleteMany).toHaveBeenCalledWith({ where: { userId: "user_1" } });
  });
});