import { runScheduler } from "@/lib/services";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS, PAYMENT_STATUS, NOTIFICATION_TYPE } from "@/lib/utils";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: { findMany: jest.fn(), update: jest.fn() },
    order: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    payment: { create: jest.fn() },
    notification: { create: jest.fn() },
  },
}));

// attemptPayment (called internally by runScheduler) sends an email on
// success — stub it out so tests don't depend on real mail config.
jest.mock("@/lib/mailer", () => ({
  sendMail: jest.fn(),
}));

function mockOrderRecord(overrides = {}) {
  return {
    id: "order_1",
    userId: "user_1",
    status: ORDER_STATUS.PENDING,
    totalAmount: 65,
    payments: [],
    subscription: { medicine: { name: "Amlodipine 5mg" } },
    user: {}, // no email -> skips the receipt-email branch entirely
    ...overrides,
  };
}

describe("runScheduler", () => {
  let randomSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.order.findMany.mockResolvedValue([]); // no due retries by default
    prisma.payment.create.mockResolvedValue({ status: PAYMENT_STATUS.SUCCESS, retryCount: 0 });
    prisma.notification.create.mockResolvedValue({});
  });

  afterEach(() => {
    randomSpy?.mockRestore();
  });

  it("creates an order and settles payment (SUCCESS) for a subscription that's newly due", async () => {
    randomSpy = jest.spyOn(Math, "random").mockReturnValue(0); // forces simulateOutcome() -> SUCCESS

    const subscription = {
      id: "sub_1",
      userId: "user_1",
      medicineId: "med_1",
      frequency: "MONTHLY",
      nextRefillDate: new Date("2026-08-01"),
      medicine: { price: 65, name: "Amlodipine 5mg" },
    };
    prisma.subscription.findMany
      .mockResolvedValueOnce([subscription]) // due subscriptions
      .mockResolvedValueOnce([]); // upcoming reminders
    prisma.order.create.mockResolvedValue({ id: "order_1" });
    prisma.order.findUnique.mockResolvedValue(mockOrderRecord());
    prisma.order.update.mockResolvedValue({
      id: "order_1",
      status: ORDER_STATUS.SUCCESS,
      nextPaymentAttemptAt: null,
    });

    const result = await runScheduler();

    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user_1", subscriptionId: "sub_1", status: ORDER_STATUS.PENDING }),
      })
    );
    // Order settled (SUCCESS, not PENDING) -> subscription should roll forward.
    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "sub_1" }, data: expect.objectContaining({ nextRefillDate: expect.any(Date) }) })
    );
    expect(result.newlyDueCount).toBe(1);
    expect(result.processed).toBe(1);
    expect(result.results[0].orderStatus).toBe(ORDER_STATUS.SUCCESS);
  });

  it("does NOT advance nextRefillDate when the order stays PENDING (payment failed, retry scheduled)", async () => {
    randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.99); // forces simulateOutcome() -> FAILED

    const subscription = {
      id: "sub_1",
      userId: "user_1",
      medicineId: "med_1",
      frequency: "MONTHLY",
      nextRefillDate: new Date("2026-08-01"),
      medicine: { price: 65 },
    };
    prisma.subscription.findMany.mockResolvedValueOnce([subscription]).mockResolvedValueOnce([]);
    prisma.order.create.mockResolvedValue({ id: "order_1" });
    prisma.order.findUnique.mockResolvedValue(mockOrderRecord());
    // Not retries-exhausted (0 prior payments < MAX_PAYMENT_RETRIES) -> stays PENDING with a retry time.
    prisma.order.update.mockResolvedValue({
      id: "order_1",
      status: ORDER_STATUS.PENDING,
      nextPaymentAttemptAt: new Date(),
    });

    await runScheduler();

    expect(prisma.subscription.update).not.toHaveBeenCalled();
  });

  it("continues processing remaining subscriptions if one throws", async () => {
    randomSpy = jest.spyOn(Math, "random").mockReturnValue(0); // SUCCESS for whichever order does get created

    const subA = { id: "sub_a", userId: "u1", medicineId: "m1", frequency: "MONTHLY", nextRefillDate: new Date(), medicine: { price: 10 } };
    const subB = { id: "sub_b", userId: "u2", medicineId: "m2", frequency: "MONTHLY", nextRefillDate: new Date(), medicine: { price: 20 } };
    prisma.subscription.findMany.mockResolvedValueOnce([subA, subB]).mockResolvedValueOnce([]);
    prisma.order.create
      .mockRejectedValueOnce(new Error("DB write failed"))
      .mockResolvedValueOnce({ id: "order_b" });
    prisma.order.findUnique.mockResolvedValue(mockOrderRecord({ id: "order_b", userId: "u2" }));
    prisma.order.update.mockResolvedValue({ id: "order_b", status: ORDER_STATUS.SUCCESS, nextPaymentAttemptAt: null });

    const result = await runScheduler();

    expect(result.processed).toBe(2);
    expect(result.results.find((r) => r.subscriptionId === "sub_a").error).toBe("DB write failed");
    expect(result.results.find((r) => r.subscriptionId === "sub_b").orderStatus).toBe(ORDER_STATUS.SUCCESS);
  });

  it("retries a due PENDING order without creating a new one", async () => {
    randomSpy = jest.spyOn(Math, "random").mockReturnValue(0); // SUCCESS

    prisma.subscription.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]); // no new-due, no reminders
    prisma.order.findMany.mockResolvedValue([
      { id: "order_1", subscriptionId: "sub_1", subscription: { id: "sub_1", nextRefillDate: new Date(), frequency: "MONTHLY" } },
    ]);
    prisma.order.findUnique.mockResolvedValue(mockOrderRecord());
    prisma.order.update.mockResolvedValue({ id: "order_1", status: ORDER_STATUS.SUCCESS, nextPaymentAttemptAt: null });

    const result = await runScheduler();

    expect(prisma.order.create).not.toHaveBeenCalled();
    expect(prisma.order.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "order_1" } })
    );
    expect(result.retriesDueCount).toBe(1);
  });

  it("sends a reminder notification for a subscription due within 24 hours, and marks it sent", async () => {
    const soonDue = {
      id: "sub_1",
      userId: "user_1",
      nextRefillDate: new Date(Date.now() + 3600 * 1000), // 1 hour from now
      lastReminderSentFor: null,
      medicine: { name: "Amlodipine 5mg" },
    };
    prisma.subscription.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([soonDue]);
    prisma.subscription.update.mockResolvedValue({});

    const result = await runScheduler();

    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user_1", type: NOTIFICATION_TYPE.REFILL_REMINDER }) })
    );
    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "sub_1" }, data: { lastReminderSentFor: soonDue.nextRefillDate } })
    );
    expect(result.remindersSentCount).toBe(1);
  });

  it("does not re-send a reminder already sent for the same cycle", async () => {
    const sameDate = new Date(Date.now() + 3600 * 1000);
    const alreadyNotified = {
      id: "sub_1",
      userId: "user_1",
      nextRefillDate: sameDate,
      lastReminderSentFor: sameDate,
      medicine: { name: "Amlodipine 5mg" },
    };
    prisma.subscription.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([alreadyNotified]);

    const result = await runScheduler();

    expect(prisma.notification.create).not.toHaveBeenCalled();
    expect(result.remindersSentCount).toBe(0);
  });
});