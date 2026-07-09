import { prisma } from "@/lib/prisma";
import { attemptPayment } from "@/lib/services/payment.service";
import { addIntervalForFrequency } from "@/lib/utils/date";
import { SUBSCRIPTION_STATUS, ORDER_STATUS } from "@/lib/utils/constants";

/**
 * Finds every ACTIVE subscription whose nextRefillDate has arrived, and for
 * each one:
 *   1. Creates a PENDING Order (+ OrderItem) for the subscribed medicine.
 *   2. Calls attemptPayment() with no forced outcome, so the simulated
 *      gateway decides success/failure on its own.
 *   3. Advances the subscription's nextRefillDate by one frequency interval.
 *
 * A failure processing one subscription (e.g. a bad medicine reference)
 * is caught and recorded per-subscription so it doesn't stop the rest of
 * the batch from running.
 *
 * Returns a summary suitable for the trigger endpoint / cron job logs.
 */
export async function runScheduler() {
  const now = new Date();

  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: SUBSCRIPTION_STATUS.ACTIVE,
      nextRefillDate: { lte: now },
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

      const nextRefillDate = addIntervalForFrequency(subscription.nextRefillDate, subscription.frequency);
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { nextRefillDate },
      });

      results.push({
        subscriptionId: subscription.id,
        orderId: order.id,
        orderStatus: settledOrder.status,
        paymentStatus: payment.status,
        nextRefillDate,
      });
    } catch (err) {
      results.push({
        subscriptionId: subscription.id,
        error: err.message || "Failed to process subscription",
      });
    }
  }

  return {
    ranAt: now,
    dueCount: dueSubscriptions.length,
    processed: results.length,
    results,
  };
}