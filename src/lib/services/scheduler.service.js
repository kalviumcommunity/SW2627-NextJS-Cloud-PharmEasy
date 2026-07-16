import { prisma } from "@/lib/prisma";
import { attemptPayment } from "@/lib/services/payment.service";
import { createNotification } from "@/lib/services/notification.service";
import { addIntervalForFrequency, addDays } from "@/lib/utils/date";
import { SUBSCRIPTION_STATUS, ORDER_STATUS, NOTIFICATION_TYPE } from "@/lib/utils/constants";

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

/**
 * Sends a "refill tomorrow" reminder for any ACTIVE subscription whose
 * nextRefillDate falls within the next 24 hours, as long as a reminder
 * hasn't already gone out for this specific cycle (tracked via
 * lastReminderSentFor so it only fires once per nextRefillDate value).
 */
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