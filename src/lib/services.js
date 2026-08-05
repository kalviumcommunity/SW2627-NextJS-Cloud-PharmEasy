import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  MAX_PAYMENT_RETRIES,
  PAYMENT_SUCCESS_PROBABILITY,
  PAYMENT_RETRY_BACKOFF_MS,
  NOTIFICATION_TYPE,
  SUBSCRIPTION_STATUS,
  addDays,
  addIntervalForFrequency,
} from "@/lib/utils";

const JWT_SECRET = process.env.JWT_SECRET || "pharmeasy-jwt-secret-key-2026";


// ==========================================
// AUTH SERVICES
// ==========================================

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export async function registerUser({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email);

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, password: hashedPassword },
  });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

  return { user: { id: user.id, name: user.name, email: user.email }, token };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

  return { user: { id: user.id, name: user.name, email: user.email }, token };
}

export async function forgotPassword({ email, origin }) {
  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return { message: "If that email is registered, a reset link has been sent." };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetOtp: hashedToken,
      resetOtpExpiry: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    },
  });

  const frontendUrl = origin || process.env.FRONTEND_URL || "http://localhost:3000";
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  await sendMail({
    to: user.email,
    subject: "Password Reset",
    text: `You can reset your password using this link: ${resetLink}`,
    html: `<p>You can reset your password using this link: <a href="${resetLink}">${resetLink}</a></p>`,
  });

  return { message: "If that email is registered, a reset link has been sent." };
}

export async function resetPassword({ token, newPassword }) {
  if (!token) {
    throw new Error("Reset token is required");
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetOtp: hashedToken,
      resetOtpExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new Error("Invalid or expired reset link");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetOtp: null,
      resetOtpExpiry: null,
    },
  });

  return { message: "Password reset successfully" };
}


// ==========================================
// CART SERVICES
// ==========================================

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


// ==========================================
// MEDICINE SERVICES
// ==========================================

export async function getMedicines({ query = "", category = "" } = {}) {
  const where = {};

  if (category && category.toLowerCase() !== "all") {
    where.category = {
      equals: category,
      mode: "insensitive",
    };
  }

  const trimmedQuery = typeof query === "string" ? query.trim() : "";

  if (trimmedQuery) {
    where.OR = [
      { name: { contains: trimmedQuery, mode: "insensitive" } },
      { description: { contains: trimmedQuery, mode: "insensitive" } },
      { category: { contains: trimmedQuery, mode: "insensitive" } },
    ];
  }

  return prisma.medicine.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function getMedicineById(id) {
  return prisma.medicine.findUnique({
    where: { id },
  });
}


// ==========================================
// NOTIFICATION SERVICES
// ==========================================

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

export async function deleteNotification(id, userId) {
  const notif = await prisma.notification.findFirst({
    where: { id, userId },
  });
  if (!notif) {
    throw new Error("Notification not found");
  }
  return prisma.notification.delete({
    where: { id },
  });
}

export async function deleteAllNotifications(userId) {
  return prisma.notification.deleteMany({
    where: { userId },
  });
}


// ==========================================
// ORDER SERVICES
// ==========================================

export async function createDirectOrder({ userId, medicineId, quantity }) {
  const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
  if (!medicine) {
    throw new Error("Medicine not found");
  }

  const totalAmount = Number((medicine.price * quantity).toFixed(2));

  return prisma.order.create({
    data: {
      userId,
      subscriptionId: null,
      status: ORDER_STATUS.PENDING,
      totalAmount,
      items: {
        create: [{ medicineId, quantity, price: medicine.price }],
      },
    },
    include: {
      items: { include: { medicine: true } },
    },
  });
}

export async function createOrderFromCart({ userId, items }) {
  const medicineIds = items.map((i) => i.medicineId);
  const medicines = await prisma.medicine.findMany({ where: { id: { in: medicineIds } } });

  const medicineMap = new Map(medicines.map((m) => [m.id, m]));

  const orderItems = items.map(({ medicineId, quantity }) => {
    const medicine = medicineMap.get(medicineId);
    if (!medicine) throw new Error(`Medicine ${medicineId} not found`);
    return { medicineId, quantity, price: medicine.price };
  });

  const totalAmount = Number(
    orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)
  );

  return prisma.order.create({
    data: {
      userId,
      subscriptionId: null,
      status: ORDER_STATUS.PENDING,
      totalAmount,
      items: { create: orderItems },
    },
    include: {
      items: { include: { medicine: true } },
    },
  });
}

export async function getOrders(userId) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          medicine: true,
        },
      },
      subscription: {
        include: {
          medicine: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function cancelOrder(orderId, userId) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== ORDER_STATUS.PENDING) {
    throw new Error(`Cannot cancel an order that is already ${order.status}`);
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: ORDER_STATUS.CANCELLED, nextPaymentAttemptAt: null },
  });
}


// ==========================================
// PAYMENT SERVICES
// ==========================================

function simulateOutcome() {
  return Math.random() < PAYMENT_SUCCESS_PROBABILITY
    ? PAYMENT_STATUS.SUCCESS
    : PAYMENT_STATUS.FAILED;
}

function formatCurrency(amount) {
  return `Rs. ${Number(amount).toFixed(2)}`;
}

function backoffDelayFor(attemptsMade) {
  return (
    PAYMENT_RETRY_BACKOFF_MS[attemptsMade] ??
    PAYMENT_RETRY_BACKOFF_MS[PAYMENT_RETRY_BACKOFF_MS.length - 1]
  );
}

function buildReceiptEmail({ order, medicineName, payment }) {
  const subject = `Your PharmEasy receipt — ${medicineName}`;
  const text =
    `Payment confirmed!\n\n` +
    `Medicine: ${medicineName}\n` +
    `Amount charged: ${formatCurrency(order.totalAmount)}\n` +
    `Order ID: ${order.id}\n` +
    `Date: ${new Date(payment.attemptedAt).toLocaleString()}\n\n` +
    `Thank you for using PharmEasy.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color:#10604e;">Payment confirmed</h2>
      <p>Your refill order has been paid successfully.</p>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <tr><td style="padding:6px 0; color:#5a6c65;">Medicine</td><td style="padding:6px 0; text-align:right;">${medicineName}</td></tr>
        <tr><td style="padding:6px 0; color:#5a6c65;">Amount charged</td><td style="padding:6px 0; text-align:right; font-weight:700;">${formatCurrency(order.totalAmount)}</td></tr>
        <tr><td style="padding:6px 0; color:#5a6c65;">Order ID</td><td style="padding:6px 0; text-align:right;">${order.id}</td></tr>
      </table>
      <p style="color:#5a6c65; font-size:13px;">Thank you for using PharmEasy.</p>
    </div>`;
  return { subject, text, html };
}

export async function attemptPayment(orderId, { forceOutcome } = {}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      payments: true,
      subscription: { include: { medicine: true } },
      user: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== ORDER_STATUS.PENDING) {
    throw new Error(`Cannot attempt payment on an order that is already ${order.status}`);
  }

  const attemptsMade = order.payments.length;
  if (attemptsMade > MAX_PAYMENT_RETRIES) {
    throw new Error("Payment retry limit already exceeded for this order");
  }

  const outcome =
    forceOutcome === PAYMENT_STATUS.SUCCESS || forceOutcome === PAYMENT_STATUS.FAILED
      ? forceOutcome
      : simulateOutcome();

  const medicineName = order.subscription?.medicine?.name || "your medicine";

  if (outcome === PAYMENT_STATUS.SUCCESS) {
    const payment = await prisma.payment.create({
      data: { orderId, status: PAYMENT_STATUS.SUCCESS, retryCount: attemptsMade },
    });
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: ORDER_STATUS.SUCCESS, nextPaymentAttemptAt: null },
    });

    await createNotification({
      userId: order.userId,
      message: `Payment of ${formatCurrency(order.totalAmount)} for your ${medicineName} refill was successful.`,
      type: NOTIFICATION_TYPE.PAYMENT_SUCCESS,
    });

    if (order.user?.email) {
      const { subject, text, html } = buildReceiptEmail({ order: updatedOrder, medicineName, payment });
      try {
        await sendMail({ to: order.user.email, subject, text, html });
      } catch (err) {
        console.error("Failed to send payment receipt email:", err.message);
      }
    }

    return { order: updatedOrder, payment };
  }

  const retriesExhausted = attemptsMade >= MAX_PAYMENT_RETRIES;

  const payment = await prisma.payment.create({
    data: {
      orderId,
      status: retriesExhausted ? PAYMENT_STATUS.FAILED : PAYMENT_STATUS.RETRYING,
      retryCount: attemptsMade,
    },
  });

  if (retriesExhausted) {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: ORDER_STATUS.FAILED, nextPaymentAttemptAt: null },
    });

    await createNotification({
      userId: order.userId,
      message: `We couldn't process payment for your ${medicineName} refill after ${MAX_PAYMENT_RETRIES} retries. The order has been cancelled.`,
      type: NOTIFICATION_TYPE.ORDER_FAILED,
    });

    return { order: updatedOrder, payment };
  }

  const nextPaymentAttemptAt = new Date(Date.now() + backoffDelayFor(attemptsMade));
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { nextPaymentAttemptAt },
  });

  await createNotification({
    userId: order.userId,
    message: `Payment for your ${medicineName} refill failed. We'll retry automatically (attempt ${attemptsMade + 1} of ${MAX_PAYMENT_RETRIES + 1}).`,
    type: NOTIFICATION_TYPE.PAYMENT_FAILED,
  });

  return { order: updatedOrder, payment };
}


// ==========================================
// SUBSCRIPTION SERVICES
// ==========================================

function calculateNextRefillDate(frequency) {
  const date = new Date();
  if (frequency === "DAILY") {
    date.setDate(date.getDate() + 1);
  } else if (frequency === "WEEKLY") {
    date.setDate(date.getDate() + 7);
  } else if (frequency === "MONTHLY") {
    date.setDate(date.getDate() + 30);
  }
  return date;
}

export async function getSubscriptions(userId) {
  return prisma.subscription.findMany({
    where: { userId },
    include: {
      medicine: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createSubscription({ userId, medicineId, frequency }) {
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });
  if (!medicine) {
    throw new Error("Medicine not found");
  }

  const nextRefillDate = calculateNextRefillDate(frequency);

  return prisma.subscription.create({
    data: {
      userId,
      medicineId,
      frequency,
      status: "ACTIVE",
      nextRefillDate,
    },
    include: {
      medicine: true,
    },
  });
}

export async function updateSubscriptionStatus(id, userId, status) {
  const sub = await prisma.subscription.findFirst({
    where: { id, userId },
  });
  if (!sub) {
    throw new Error("Subscription not found");
  }

  const data = { status };
  if (status === "ACTIVE" && sub.status === "PAUSED") {
    if (new Date(sub.nextRefillDate) < new Date()) {
      data.nextRefillDate = calculateNextRefillDate(sub.frequency);
    }
  }

  return prisma.subscription.update({
    where: { id },
    data,
    include: {
      medicine: true,
    },
  });
}

export async function updateSubscriptionFrequency(id, userId, frequency) {
  const sub = await prisma.subscription.findFirst({
    where: { id, userId },
  });
  if (!sub) {
    throw new Error("Subscription not found");
  }
  if (sub.status === "CANCELLED") {
    throw new Error("Cannot edit a cancelled subscription");
  }

  const nextRefillDate = calculateNextRefillDate(frequency);

  return prisma.subscription.update({
    where: { id },
    data: { frequency, nextRefillDate },
    include: { medicine: true },
  });
}

/**
 * Skips the upcoming refill for a subscription without cancelling it.
 *
 * Just pushes nextRefillDate forward by one interval so the scheduler
 * doesn't pick it up this cycle, then resumes as normal from there.
 * Blocked once the scheduler has already generated an order for the
 * current cycle (a PENDING order tied to this subscription) — at that
 * point the user should cancel the order instead, not the refill.
 */
export async function skipNextRefill(id, userId) {
  const sub = await prisma.subscription.findFirst({
    where: { id, userId },
    include: { medicine: true },
  });
  if (!sub) {
    throw new Error("Subscription not found");
  }
  if (sub.status !== SUBSCRIPTION_STATUS.ACTIVE) {
    throw new Error("Only active subscriptions can skip a refill");
  }

  const pendingOrder = await prisma.order.findFirst({
    where: { subscriptionId: id, status: ORDER_STATUS.PENDING },
  });
  if (pendingOrder) {
    throw new Error(
      "This refill has already started processing — cancel the order instead if you don't want it."
    );
  }

  const skippedDate = sub.nextRefillDate;
  const nextRefillDate = addIntervalForFrequency(sub.nextRefillDate, sub.frequency);

  const updated = await prisma.subscription.update({
    where: { id },
    data: { nextRefillDate, lastReminderSentFor: null },
    include: { medicine: true },
  });

  await createNotification({
    userId,
    message: `Skipped your ${sub.medicine.name} refill scheduled for ${skippedDate.toLocaleDateString(
      "en-IN",
      { day: "numeric", month: "short", year: "numeric" }
    )}. Next refill moved to ${nextRefillDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}.`,
    type: NOTIFICATION_TYPE.REFILL_SKIPPED,
  });

  return updated;
}

// ==========================================
// SCHEDULER SERVICES
// ==========================================

async function processNewlyDueSubscriptions(now) {
  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: SUBSCRIPTION_STATUS.ACTIVE,
      nextRefillDate: { lte: now },
      orders: { none: { status: ORDER_STATUS.PENDING } },
    },
    include: { medicine: true },
  });

  const results = [];

  for (const subscription of dueSubscriptions) {
    try {
      const order = await prisma.order.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          status: ORDER_STATUS.PENDING,
          totalAmount: subscription.medicine.price,
          items: {
            create: [
              {
                medicineId: subscription.medicineId,
                quantity: 1,
                price: subscription.medicine.price,
              },
            ],
          },
        },
      });

      const { order: settledOrder, payment } = await attemptPayment(order.id);

      let nextRefillDate = subscription.nextRefillDate;
      if (settledOrder.status !== ORDER_STATUS.PENDING) {
        nextRefillDate = addIntervalForFrequency(subscription.nextRefillDate, subscription.frequency);
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { nextRefillDate },
        });
      }

      results.push({
        subscriptionId: subscription.id,
        orderId: order.id,
        orderStatus: settledOrder.status,
        paymentStatus: payment.status,
        nextPaymentAttemptAt: settledOrder.nextPaymentAttemptAt,
        nextRefillDate,
      });
    } catch (err) {
      results.push({
        subscriptionId: subscription.id,
        error: err.message || "Failed to process subscription",
      });
    }
  }

  return results;
}

async function processDueRetries(now) {
  const dueRetryOrders = await prisma.order.findMany({
    where: {
      status: ORDER_STATUS.PENDING,
      nextPaymentAttemptAt: { lte: now },
    },
    include: { subscription: true },
  });

  const results = [];

  for (const order of dueRetryOrders) {
    try {
      const { order: settledOrder, payment } = await attemptPayment(order.id);

      let nextRefillDate = order.subscription?.nextRefillDate ?? null;
      if (settledOrder.status !== ORDER_STATUS.PENDING && order.subscription) {
        nextRefillDate = addIntervalForFrequency(
          order.subscription.nextRefillDate,
          order.subscription.frequency
        );
        await prisma.subscription.update({
          where: { id: order.subscription.id },
          data: { nextRefillDate },
        });
      }

      results.push({
        subscriptionId: order.subscriptionId,
        orderId: order.id,
        orderStatus: settledOrder.status,
        paymentStatus: payment.status,
        nextPaymentAttemptAt: settledOrder.nextPaymentAttemptAt,
        nextRefillDate,
      });
    } catch (err) {
      results.push({
        orderId: order.id,
        error: err.message || "Failed to retry payment for order",
      });
    }
  }

  return results;
}

async function processUpcomingReminders(now) {
  const reminderWindowEnd = addDays(now, 1);

  const upcomingSubscriptions = await prisma.subscription.findMany({
    where: {
      status: SUBSCRIPTION_STATUS.ACTIVE,
      nextRefillDate: { gt: now, lte: reminderWindowEnd },
    },
    include: { medicine: true },
  });

  const results = [];

  for (const subscription of upcomingSubscriptions) {
    const alreadySentForThisCycle =
      subscription.lastReminderSentFor &&
      subscription.lastReminderSentFor.getTime() === subscription.nextRefillDate.getTime();

    if (alreadySentForThisCycle) {
      continue;
    }

    try {
      await createNotification({
        userId: subscription.userId,
        message: `Reminder: your ${subscription.medicine.name} refill is scheduled for tomorrow. We'll place the order automatically.`,
        type: NOTIFICATION_TYPE.REFILL_REMINDER,
      });

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { lastReminderSentFor: subscription.nextRefillDate },
      });

      results.push({ subscriptionId: subscription.id, reminderSent: true });
    } catch (err) {
      results.push({
        subscriptionId: subscription.id,
        error: err.message || "Failed to send reminder",
      });
    }
  }

  return results;
}

export async function runScheduler() {
  const now = new Date();

  const newSubscriptionResults = await processNewlyDueSubscriptions(now);
  const retryResults = await processDueRetries(now);
  const reminderResults = await processUpcomingReminders(now);

  const results = [...newSubscriptionResults, ...retryResults, ...reminderResults];

  return {
    ranAt: now,
    newlyDueCount: newSubscriptionResults.length,
    retriesDueCount: retryResults.length,
    remindersSentCount: reminderResults.filter((r) => r.reminderSent).length,
    processed: results.length,
    results,
  };
}