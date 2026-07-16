import { prisma } from "@/lib/prisma";

function calculateNextRefillDate(frequency) {
  const date = new Date();
  if (frequency === "DAILY") {
    date.setDate(date.getDate() + 1);
  } else if (frequency === "WEEKLY") {
    date.setDate(date.getDate() + 7);
  } else if (frequency === "MONTHLY") {
    date.setDate(date.getDate() + 30); // Or date.setMonth(date.getMonth() + 1)
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
  // Check if medicine exists
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
  // Validate subscription belongs to user
  const sub = await prisma.subscription.findFirst({
    where: { id, userId },
  });
  if (!sub) {
    throw new Error("Subscription not found");
  }

  const data = { status };
  // If resuming, optionally recalculate the next refill date so it is in the future
  if (status === "ACTIVE" && sub.status === "PAUSED") {
    // If nextRefillDate is in the past, update it to be from today
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

  // Recompute the next refill date from today using the new frequency,
  // since the old date was scheduled against the old cadence.
  const nextRefillDate = calculateNextRefillDate(frequency);

  return prisma.subscription.update({
    where: { id },
    data: { frequency, nextRefillDate },
    include: { medicine: true },
  });
}