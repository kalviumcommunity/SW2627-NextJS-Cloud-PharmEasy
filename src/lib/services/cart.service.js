import { prisma } from "@/lib/prisma";

async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }
  return cart;
}

export async function getCart(userId) {
  const cart = await getOrCreateCart(userId);
  return prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { medicine: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function addToCart({ userId, medicineId, quantity }) {
  const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
  if (!medicine) {
    throw new Error("Medicine not found");
  }

  const cart = await getOrCreateCart(userId);

  // Merge with existing line if this medicine is already in the cart.
  return prisma.cartItem.upsert({
    where: { cartId_medicineId: { cartId: cart.id, medicineId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, medicineId, quantity },
    include: { medicine: true },
  });
}

export async function updateCartItem({ userId, itemId, quantity }) {
  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
  if (!item) {
    throw new Error("Cart item not found");
  }
  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: { medicine: true },
  });
}

export async function removeCartItem({ userId, itemId }) {
  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
  if (!item) {
    throw new Error("Cart item not found");
  }
  return prisma.cartItem.delete({ where: { id: itemId } });
}

export async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  return prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}
