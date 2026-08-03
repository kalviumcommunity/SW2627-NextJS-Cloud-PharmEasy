import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from "@/lib/services";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    cart: { findUnique: jest.fn(), create: jest.fn() },
    cartItem: { findMany: jest.fn(), upsert: jest.fn(), findFirst: jest.fn(), update: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
    medicine: { findUnique: jest.fn() },
  },
}));

const mockCart = { id: "cart_1", userId: "user_1" };

describe("getCart", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the user's cart items, including medicine details", async () => {
    prisma.cart.findUnique.mockResolvedValue(mockCart);
    prisma.cartItem.findMany.mockResolvedValue([{ id: "item_1", medicine: { name: "Paracetamol" } }]);

    const result = await getCart("user_1");

    expect(prisma.cartItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { cartId: "cart_1" }, include: { medicine: true } })
    );
    expect(result).toHaveLength(1);
  });

  it("creates a cart for the user if one doesn't exist yet", async () => {
    prisma.cart.findUnique.mockResolvedValue(null);
    prisma.cart.create.mockResolvedValue(mockCart);
    prisma.cartItem.findMany.mockResolvedValue([]);

    await getCart("user_1");

    expect(prisma.cart.create).toHaveBeenCalledWith({ data: { userId: "user_1" } });
  });
});

describe("addToCart", () => {
  beforeEach(() => jest.clearAllMocks());

  it("upserts the item — increments quantity if it's already in the cart", async () => {
    prisma.medicine.findUnique.mockResolvedValue({ id: "med_1", price: 20 });
    prisma.cart.findUnique.mockResolvedValue(mockCart);
    prisma.cartItem.upsert.mockResolvedValue({ id: "item_1", quantity: 3 });

    await addToCart({ userId: "user_1", medicineId: "med_1", quantity: 2 });

    expect(prisma.cartItem.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { cartId_medicineId: { cartId: "cart_1", medicineId: "med_1" } },
        update: { quantity: { increment: 2 } },
        create: { cartId: "cart_1", medicineId: "med_1", quantity: 2 },
      })
    );
  });

  it("throws if the medicine does not exist", async () => {
    prisma.medicine.findUnique.mockResolvedValue(null);

    await expect(addToCart({ userId: "user_1", medicineId: "missing", quantity: 1 })).rejects.toThrow(
      "Medicine not found"
    );
    expect(prisma.cartItem.upsert).not.toHaveBeenCalled();
  });
});

describe("updateCartItem", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates quantity for an item belonging to the user's cart", async () => {
    prisma.cart.findUnique.mockResolvedValue(mockCart);
    prisma.cartItem.findFirst.mockResolvedValue({ id: "item_1", cartId: "cart_1" });
    prisma.cartItem.update.mockResolvedValue({ id: "item_1", quantity: 5 });

    await updateCartItem({ userId: "user_1", itemId: "item_1", quantity: 5 });

    expect(prisma.cartItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item_1" }, data: { quantity: 5 } })
    );
  });

  it("throws if the item doesn't belong to the user's cart", async () => {
    prisma.cart.findUnique.mockResolvedValue(mockCart);
    prisma.cartItem.findFirst.mockResolvedValue(null);

    await expect(
      updateCartItem({ userId: "user_1", itemId: "someone_elses_item", quantity: 2 })
    ).rejects.toThrow("Cart item not found");
  });
});

describe("removeCartItem", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes an item belonging to the user's cart", async () => {
    prisma.cart.findUnique.mockResolvedValue(mockCart);
    prisma.cartItem.findFirst.mockResolvedValue({ id: "item_1", cartId: "cart_1" });
    prisma.cartItem.delete.mockResolvedValue({ id: "item_1" });

    await removeCartItem({ userId: "user_1", itemId: "item_1" });

    expect(prisma.cartItem.delete).toHaveBeenCalledWith({ where: { id: "item_1" } });
  });

  it("throws if the item doesn't exist in the user's cart", async () => {
    prisma.cart.findUnique.mockResolvedValue(mockCart);
    prisma.cartItem.findFirst.mockResolvedValue(null);

    await expect(removeCartItem({ userId: "user_1", itemId: "missing" })).rejects.toThrow(
      "Cart item not found"
    );
  });
});

describe("clearCart", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes all items scoped to the user's cart only", async () => {
    prisma.cart.findUnique.mockResolvedValue(mockCart);
    prisma.cartItem.deleteMany.mockResolvedValue({ count: 3 });

    await clearCart("user_1");

    expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: "cart_1" } });
  });
});