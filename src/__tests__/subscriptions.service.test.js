import {
  getSubscriptions,
  createSubscription,
  updateSubscriptionStatus,
  updateSubscriptionFrequency,
  skipNextRefill,
} from "@/lib/services";
import { prisma } from "@/lib/prisma";
import { SUBSCRIPTION_STATUS, ORDER_STATUS, FREQUENCY } from "@/lib/utils";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    medicine: { findUnique: jest.fn() },
    order: { findFirst: jest.fn() },
    notification: { create: jest.fn() },
  },
}));

describe("getSubscriptions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("only fetches subscriptions scoped to the given user, with medicine included", async () => {
    prisma.subscription.findMany.mockResolvedValue([]);

    await getSubscriptions("user_1");

    expect(prisma.subscription.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user_1" }, include: { medicine: true } })
    );
  });
});

describe("createSubscription", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates an ACTIVE subscription with a calculated nextRefillDate", async () => {
    prisma.medicine.findUnique.mockResolvedValue({ id: "med_1", price: 50 });
    prisma.subscription.create.mockResolvedValue({ id: "sub_1", status: "ACTIVE" });

    await createSubscription({ userId: "user_1", medicineId: "med_1", frequency: FREQUENCY.MONTHLY });

    expect(prisma.subscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user_1",
          medicineId: "med_1",
          frequency: FREQUENCY.MONTHLY,
          status: "ACTIVE",
          nextRefillDate: expect.any(Date),
        }),
      })
    );
  });

  it("throws if the medicine does not exist", async () => {
    prisma.medicine.findUnique.mockResolvedValue(null);

    await expect(
      createSubscription({ userId: "user_1", medicineId: "missing", frequency: FREQUENCY.MONTHLY })
    ).rejects.toThrow("Medicine not found");

    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });
});

describe("updateSubscriptionStatus", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates status for a subscription belonging to the user", async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      id: "sub_1",
      status: "ACTIVE",
      nextRefillDate: new Date(Date.now() + 86400000),
      frequency: FREQUENCY.MONTHLY,
    });
    prisma.subscription.update.mockResolvedValue({ id: "sub_1", status: "PAUSED" });

    await updateSubscriptionStatus("sub_1", "user_1", "PAUSED");

    expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
      where: { id: "sub_1", userId: "user_1" },
    });
    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "sub_1" }, data: { status: "PAUSED" } })
    );
  });

  it("throws if the subscription doesn't exist or doesn't belong to the user", async () => {
    prisma.subscription.findFirst.mockResolvedValue(null);

    await expect(updateSubscriptionStatus("sub_1", "someone_else", "PAUSED")).rejects.toThrow(
      "Subscription not found"
    );
  });

  it("recalculates nextRefillDate when resuming a PAUSED subscription whose refill date has already passed", async () => {
    const pastDate = new Date(Date.now() - 86400000);
    prisma.subscription.findFirst.mockResolvedValue({
      id: "sub_1",
      status: "PAUSED",
      nextRefillDate: pastDate,
      frequency: FREQUENCY.MONTHLY,
    });
    prisma.subscription.update.mockResolvedValue({ id: "sub_1", status: "ACTIVE" });

    await updateSubscriptionStatus("sub_1", "user_1", "ACTIVE");

    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "ACTIVE", nextRefillDate: expect.any(Date) }),
      })
    );
  });
});

describe("updateSubscriptionFrequency", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates frequency and recalculates nextRefillDate", async () => {
    prisma.subscription.findFirst.mockResolvedValue({ id: "sub_1", status: "ACTIVE" });
    prisma.subscription.update.mockResolvedValue({ id: "sub_1", frequency: FREQUENCY.WEEKLY });

    await updateSubscriptionFrequency("sub_1", "user_1", FREQUENCY.WEEKLY);

    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ frequency: FREQUENCY.WEEKLY, nextRefillDate: expect.any(Date) }),
      })
    );
  });

  it("throws if the subscription is cancelled", async () => {
    prisma.subscription.findFirst.mockResolvedValue({ id: "sub_1", status: "CANCELLED" });

    await expect(
      updateSubscriptionFrequency("sub_1", "user_1", FREQUENCY.WEEKLY)
    ).rejects.toThrow("Cannot edit a cancelled subscription");

    expect(prisma.subscription.update).not.toHaveBeenCalled();
  });
});

describe("skipNextRefill", () => {
  beforeEach(() => jest.clearAllMocks());

  const baseSub = {
    id: "sub_1",
    status: SUBSCRIPTION_STATUS.ACTIVE,
    frequency: FREQUENCY.MONTHLY,
    nextRefillDate: new Date("2026-08-10T00:00:00.000Z"),
    medicine: { name: "Amlodipine 5mg" },
  };

  it("pushes nextRefillDate forward and notifies the user", async () => {
    prisma.subscription.findFirst.mockResolvedValue(baseSub);
    prisma.order.findFirst.mockResolvedValue(null);
    prisma.subscription.update.mockResolvedValue({ ...baseSub, nextRefillDate: new Date("2026-09-10") });
    prisma.notification.create.mockResolvedValue({});

    await skipNextRefill("sub_1", "user_1");

    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sub_1" },
        data: expect.objectContaining({ nextRefillDate: expect.any(Date), lastReminderSentFor: null }),
      })
    );
    expect(prisma.notification.create).toHaveBeenCalled();
  });

  it("throws if a PENDING order already exists for this cycle", async () => {
    prisma.subscription.findFirst.mockResolvedValue(baseSub);
    prisma.order.findFirst.mockResolvedValue({ id: "order_1", status: ORDER_STATUS.PENDING });

    await expect(skipNextRefill("sub_1", "user_1")).rejects.toThrow(
      "This refill has already started processing — cancel the order instead if you don't want it."
    );
    expect(prisma.subscription.update).not.toHaveBeenCalled();
  });

  it("throws if the subscription is not ACTIVE", async () => {
    prisma.subscription.findFirst.mockResolvedValue({ ...baseSub, status: "PAUSED" });

    await expect(skipNextRefill("sub_1", "user_1")).rejects.toThrow(
      "Only active subscriptions can skip a refill"
    );
  });

  it("throws if the subscription doesn't exist or doesn't belong to the user", async () => {
    prisma.subscription.findFirst.mockResolvedValue(null);

    await expect(skipNextRefill("sub_1", "someone_else")).rejects.toThrow("Subscription not found");
  });
});