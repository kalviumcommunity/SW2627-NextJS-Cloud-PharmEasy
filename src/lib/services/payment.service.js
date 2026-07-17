import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/services/notification.service";
import { sendMail } from "@/lib/mailer";
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  MAX_PAYMENT_RETRIES,
  PAYMENT_SUCCESS_PROBABILITY,
  PAYMENT_RETRY_BACKOFF_MS,
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

/** How long to wait before the next retry, given how many attempts have been made so far. */
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

/**
 * Attempts payment for an order.
 *
 * @param {string} orderId
 * @param {{ forceOutcome?: "SUCCESS" | "FAILED" }} options
 *
 * Behavior:
 *   - On SUCCESS: writes a SUCCESS Payment row, marks the Order SUCCESS,
 *     clears nextPaymentAttemptAt, and notifies the user.
 *   - On FAILURE with retries remaining: writes a RETRYING Payment row,
 *     leaves the Order PENDING, and sets nextPaymentAttemptAt to now +
 *     the backoff delay for this attempt number, so the scheduler knows
 *     exactly when to try again.
 *   - On FAILURE with retries exhausted: writes a FAILED Payment row,
 *     marks the Order FAILED, clears nextPaymentAttemptAt, and notifies
 *     the user the order was cancelled.
 *
 * Throws if the order does not exist, or is not currently PENDING.
 */
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
        // Don't fail the whole payment flow just because the receipt email
        // couldn't be sent — the in-app notification already covers this.
        console.error("Failed to send payment receipt email:", err.message);
      }
    }

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
      data: { status: ORDER_STATUS.FAILED, nextPaymentAttemptAt: null },
    });

    await createNotification({
      userId: order.userId,
      message: `We couldn't process payment for your ${medicineName} refill after ${MAX_PAYMENT_RETRIES} retries. The order has been cancelled.`,
      type: NOTIFICATION_TYPE.ORDER_FAILED,
    });

    return { order: updatedOrder, payment };
  }

  // Retries remain — schedule the next attempt via backoff instead of
  // waiting for the subscription's next full refill cycle.
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