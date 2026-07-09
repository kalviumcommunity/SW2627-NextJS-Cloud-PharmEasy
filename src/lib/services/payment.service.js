import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/services/notification.service";
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  MAX_PAYMENT_RETRIES,
  PAYMENT_SUCCESS_PROBABILITY,
  NOTIFICATION_TYPE,
} from "@/lib/utils/constants";

/** Simulated gateway: succeeds ~PAYMENT_SUCCESS_PROBABILITY of the time. */
function simulateOutcome() {
  return Math.random() < PAYMENT_SUCCESS_PROBABILITY
    ? PAYMENT_STATUS.SUCCESS
    : PAYMENT_STATUS.FAILED;
}

function formatCurrency(amount) {
  return `Rs. ${Number(amount).toFixed(2)}`;
}

/**
 * Attempts payment for an order.
 *
 * @param {string} orderId
 * @param {{ forceOutcome?: "SUCCESS" | "FAILED" }} options
 *   forceOutcome lets callers (e.g. the demo "Simulate Success/Failure"
 *   endpoint) bypass the random simulation. When omitted, the outcome is
 *   randomized, which is what the scheduler uses.
 *
 * Behavior:
 *   - Reads how many payment attempts already exist for this order. That
 *     count becomes the `retryCount` for this attempt (0 = first attempt).
 *   - On SUCCESS: writes a SUCCESS Payment row, marks the Order SUCCESS,
 *     and notifies the user.
 *   - On FAILURE: writes a Payment row.
 *       - If this was the last allowed attempt (retryCount === MAX_PAYMENT_RETRIES),
 *         the Payment is marked FAILED, the Order is marked FAILED, and the
 *         user is notified the retries are exhausted.
 *       - Otherwise the Payment is marked RETRYING, the Order stays PENDING
 *         (a future call -- from the scheduler's next run, or a manual demo
 *         retry -- will make the next attempt), and the user is notified the
 *         attempt failed.
 *
 * Throws if the order does not exist, or is not currently PENDING (i.e. it
 * was already resolved as SUCCESS or FAILED).
 */
export async function attemptPayment(orderId, { forceOutcome } = {}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      payments: true,
      subscription: { include: { medicine: true } },
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
      data: { status: ORDER_STATUS.SUCCESS },
    });

    await createNotification({
      userId: order.userId,
      message: `Payment of ${formatCurrency(order.totalAmount)} for your ${medicineName} refill was successful.`,
      type: NOTIFICATION_TYPE.PAYMENT_SUCCESS,
    });

    return { order: updatedOrder, payment };
  }

  // Payment failed.
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
      data: { status: ORDER_STATUS.FAILED },
    });

    await createNotification({
      userId: order.userId,
      message: `We couldn't process payment for your ${medicineName} refill after ${MAX_PAYMENT_RETRIES} retries. The order has been cancelled.`,
      type: NOTIFICATION_TYPE.ORDER_FAILED,
    });

    return { order: updatedOrder, payment };
  }

  await createNotification({
    userId: order.userId,
    message: `Payment for your ${medicineName} refill failed. We'll retry automatically (attempt ${attemptsMade + 1} of ${MAX_PAYMENT_RETRIES + 1}).`,
    type: NOTIFICATION_TYPE.PAYMENT_FAILED,
  });

  return { order, payment };
}