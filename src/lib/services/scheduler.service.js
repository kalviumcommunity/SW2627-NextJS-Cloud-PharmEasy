import { prisma } from "@/lib/prisma";
import { attemptPayment } from "@/lib/services/payment.service";
import { addIntervalForFrequency } from "@/lib/utils/date";
import { SUBSCRIPTION_STATUS, ORDER_STATUS } from "@/lib/utils/constants";

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

export async function runScheduler() {
  const now = new Date();

  const newSubscriptionResults = await processNewlyDueSubscriptions(now);
  const retryResults = await processDueRetries(now);

  const results = [...newSubscriptionResults, ...retryResults];

  return {
    ranAt: now,
    newlyDueCount: newSubscriptionResults.length,
    retriesDueCount: retryResults.length,
    processed: results.length,
    results,
  };
}