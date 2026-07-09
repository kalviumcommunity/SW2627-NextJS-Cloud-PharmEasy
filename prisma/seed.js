const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  const medicines = [
    { name: "Metformin 500mg", description: "For type 2 diabetes management", price: 89, category: "Diabetes", imageUrl: null },
    { name: "Amlodipine 5mg", description: "For blood pressure control", price: 65, category: "Hypertension", imageUrl: null },
    { name: "Thyronorm 50mcg", description: "For thyroid hormone regulation", price: 45, category: "Thyroid", imageUrl: null },
    { name: "Atorvastatin 10mg", description: "For cholesterol management", price: 120, category: "Cardiac", imageUrl: null },
    { name: "Vitamin D3 60K", description: "Weekly vitamin D supplement", price: 32, category: "Supplements", imageUrl: null },
    { name: "Calcium + Vitamin D3", description: "Bone health supplement", price: 210, category: "Supplements", imageUrl: null },
    { name: "Losartan 50mg", description: "For blood pressure control", price: 78, category: "Hypertension", imageUrl: null },
    { name: "Glimepiride 2mg", description: "For type 2 diabetes management", price: 95, category: "Diabetes", imageUrl: null },
  ];

  const createdMedicines = [];
  for (const med of medicines) {
    createdMedicines.push(await prisma.medicine.create({ data: med }));
  }
  console.log(`Seeded ${createdMedicines.length} medicines.`);

  const findMedicine = (name) => createdMedicines.find((m) => m.name === name);

  // --- Demo user ---
  const demoPassword = await bcrypt.hash("Demo@1234", 10);
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@pharmeasy.com",
      password: demoPassword,
      address: "221B, Sector 45, Gurugram, Haryana",
    },
  });
  console.log(`Seeded demo user (${demoUser.email} / Demo@1234).`);

  // --- Subscriptions: an active/paused/cancelled mix ---

  // 1. ACTIVE and already overdue, so runScheduler() has something to do
  //    immediately after seeding -- useful for a first demo run.
  const metforminSub = await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      medicineId: findMedicine("Metformin 500mg").id,
      frequency: "MONTHLY",
      status: "ACTIVE",
      nextRefillDate: daysFromNow(-1),
    },
  });

  // 2. ACTIVE but not due yet.
  const amlodipineSub = await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      medicineId: findMedicine("Amlodipine 5mg").id,
      frequency: "WEEKLY",
      status: "ACTIVE",
      nextRefillDate: daysFromNow(4),
    },
  });

  // 3. PAUSED -- the scheduler must skip this even though the date has passed.
  await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      medicineId: findMedicine("Vitamin D3 60K").id,
      frequency: "WEEKLY",
      status: "PAUSED",
      nextRefillDate: daysFromNow(-2),
    },
  });

  // 4. CANCELLED -- also must be skipped by the scheduler.
  await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      medicineId: findMedicine("Atorvastatin 10mg").id,
      frequency: "MONTHLY",
      status: "CANCELLED",
      nextRefillDate: daysFromNow(10),
    },
  });

  console.log("Seeded 4 subscriptions (active/active-overdue/paused/cancelled).");

  // --- Historical orders + payments ---

  // A. A past refill for Metformin that succeeded on the first attempt.
  const successfulOrder = await prisma.order.create({
    data: {
      userId: demoUser.id,
      subscriptionId: metforminSub.id,
      status: "SUCCESS",
      totalAmount: findMedicine("Metformin 500mg").price,
      createdAt: daysFromNow(-31),
      items: {
        create: [{ medicineId: findMedicine("Metformin 500mg").id, quantity: 1, price: findMedicine("Metformin 500mg").price }],
      },
    },
  });
  await prisma.payment.create({
    data: { orderId: successfulOrder.id, status: "SUCCESS", retryCount: 0, attemptedAt: daysFromNow(-31) },
  });
  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      message: `Payment of Rs. ${findMedicine("Metformin 500mg").price.toFixed(2)} for your Metformin 500mg refill was successful.`,
      type: "PAYMENT_SUCCESS",
      read: true,
      createdAt: daysFromNow(-31),
    },
  });

  // B. A past refill for Amlodipine that failed, retried, and eventually
  //    exhausted all retries -- demonstrates the retry cap end-to-end.
  const failedOrder = await prisma.order.create({
    data: {
      userId: demoUser.id,
      subscriptionId: amlodipineSub.id,
      status: "FAILED",
      totalAmount: findMedicine("Amlodipine 5mg").price,
      createdAt: daysFromNow(-3),
      items: {
        create: [{ medicineId: findMedicine("Amlodipine 5mg").id, quantity: 1, price: findMedicine("Amlodipine 5mg").price }],
      },
    },
  });
  const retryStatuses = ["RETRYING", "RETRYING", "RETRYING", "FAILED"];
  for (let i = 0; i < retryStatuses.length; i += 1) {
    await prisma.payment.create({
      data: {
        orderId: failedOrder.id,
        status: retryStatuses[i],
        retryCount: i,
        attemptedAt: daysFromNow(-3 + i * 0.01),
      },
    });
  }
  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      message: `We couldn't process payment for your Amlodipine 5mg refill after 3 retries. The order has been cancelled.`,
      type: "ORDER_FAILED",
      read: false,
      createdAt: daysFromNow(-3),
    },
  });

  console.log("Seeded 2 historical orders with payments and notifications.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });