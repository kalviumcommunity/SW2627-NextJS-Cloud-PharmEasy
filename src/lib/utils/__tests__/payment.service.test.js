import { attemptPayment } from "@/lib/services/payment.service";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS, PAYMENT_STATUS, MAX_PAYMENT_RETRIES } from "@/lib/utils/constants";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique: jest.fn(), update: jest.fn() },
    payment: { create: jest.fn() },
  },
}));

jest.mock("@/lib/services/notification.service", () => ({
  createNotification: jest.fn(),
}));

jest.mock("@/lib/mailer", () => ({
  sendMail: jest.fn(),
}));

function mockOrder({ payments = [], status = ORDER_STATUS.PENDING } = {}) {
  return {
    id: "order_1",
    userId: "user_1",
    status,
    totalAmount: 100,
    payments,
    subscription: { medicine: { name: "Metformin 500mg" } },
    user: { email: "test@example.com" },
  };
}

describe("attemptPayment", () => {
  beforeEach(() => jest.clearAllMocks());

  it("marks the order SUCCESS on a forced success outcome", async () => {
    prisma.order.findUnique.mockResolvedValue(mockOrder());
    prisma.payment.create.mockResolvedValue({ status: PAYMENT_STATUS.SUCCESS, retryCount: 0, attemptedAt: new Date() });
    prisma.order.update.mockResolvedValue({ status: ORDER_STATUS.SUCCESS });

    const result = await attemptPayment("order_1", { forceOutcome: "SUCCESS" });

    expect(result.order.status).toBe(ORDER_STATUS.SUCCESS);
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: ORDER_STATUS.SUCCESS }) })
    );
  });

  it("marks the payment RETRYING (not FAILED) before the retry cap is hit", async () => {
    prisma.order.findUnique.mockResolvedValue(mockOrder({ payments: [{}, {}] })); // 2 attempts so far
    prisma.payment.create.mockResolvedValue({ status: PAYMENT_STATUS.RETRYING, retryCount: 2 });
    prisma.order.update.mockResolvedValue({ status: ORDER_STATUS.PENDING });

    const result = await attemptPayment("order_1", { forceOutcome: "FAILED" });

    expect(result.payment.status).toBe(PAYMENT_STATUS.RETRYING);
  });

  it("marks the order FAILED once retries are exhausted", async () => {
    const payments = Array.from({ length: MAX_PAYMENT_RETRIES }, () => ({}));
    prisma.order.findUnique.mockResolvedValue(mockOrder({ payments }));
    prisma.payment.create.mockResolvedValue({ status: PAYMENT_STATUS.FAILED, retryCount: MAX_PAYMENT_RETRIES });
    prisma.order.update.mockResolvedValue({ status: ORDER_STATUS.FAILED });

    const result = await attemptPayment("order_1", { forceOutcome: "FAILED" });

    expect(result.order.status).toBe(ORDER_STATUS.FAILED);
  });

  it("throws if the order is already resolved (not PENDING)", async () => {
    prisma.order.findUnique.mockResolvedValue(mockOrder({ status: ORDER_STATUS.SUCCESS }));

    await expect(attemptPayment("order_1", { forceOutcome: "SUCCESS" })).rejects.toThrow(
      /already SUCCESS/
    );
  });

  it("throws if the order does not exist", async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(attemptPayment("missing_order")).rejects.toThrow("Order not found");
  });
});