import { createDirectOrder, getOrders, cancelOrder } from "@/lib/services/order.service";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS } from "@/lib/utils/constants";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    medicine: { findUnique: jest.fn() },
    order: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  },
}));

describe("createDirectOrder", () => {
  beforeEach(() => jest.clearAllMocks());

  it("computes totalAmount server-side from the medicine's price, ignoring any client-sent amount", async () => {
    prisma.medicine.findUnique.mockResolvedValue({ id: "med_1", price: 19.99 });
    prisma.order.create.mockResolvedValue({ id: "order_1" });

    await createDirectOrder({ userId: "user_1", medicineId: "med_1", quantity: 3 });

    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user_1",
          status: ORDER_STATUS.PENDING,
          totalAmount: 59.97,
        }),
      })
    );
  });

  it("throws if the medicine does not exist", async () => {
    prisma.medicine.findUnique.mockResolvedValue(null);

    await expect(
      createDirectOrder({ userId: "user_1", medicineId: "missing", quantity: 1 })
    ).rejects.toThrow("Medicine not found");

    expect(prisma.order.create).not.toHaveBeenCalled();
  });
});

describe("getOrders", () => {
  beforeEach(() => jest.clearAllMocks());

  it("only fetches orders scoped to the given user", async () => {
    prisma.order.findMany.mockResolvedValue([]);

    await getOrders("user_1");

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user_1" } })
    );
  });
});

describe("cancelOrder", () => {
  beforeEach(() => jest.clearAllMocks());

  it("cancels a PENDING order belonging to the user", async () => {
    prisma.order.findFirst.mockResolvedValue({ id: "order_1", status: ORDER_STATUS.PENDING });
    prisma.order.update.mockResolvedValue({ id: "order_1", status: ORDER_STATUS.CANCELLED });

    const result = await cancelOrder("order_1", "user_1");

    expect(prisma.order.findFirst).toHaveBeenCalledWith({
      where: { id: "order_1", userId: "user_1" },
    });
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: "order_1" },
      data: { status: ORDER_STATUS.CANCELLED, nextPaymentAttemptAt: null },
    });
    expect(result.status).toBe(ORDER_STATUS.CANCELLED);
  });

  it("throws if the order doesn't exist or doesn't belong to the user", async () => {
    prisma.order.findFirst.mockResolvedValue(null);

    await expect(cancelOrder("order_1", "someone_else")).rejects.toThrow("Order not found");
  });

  it("throws if the order is no longer PENDING", async () => {
    prisma.order.findFirst.mockResolvedValue({ id: "order_1", status: ORDER_STATUS.SUCCESS });

    await expect(cancelOrder("order_1", "user_1")).rejects.toThrow(
      "Cannot cancel an order that is already SUCCESS"
    );
  });
});