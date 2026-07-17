// One-off script: creates a PENDING order directly (skips the random
// payment gateway entirely), so you can test Cancel Order immediately.
// Usage: node scripts/create-test-order.js <userId>

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error("Usage: node scripts/create-test-order.js <userId>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`No user found with id: ${userId}`);
    process.exit(1);
  }

  const medicine = await prisma.medicine.findFirst();
  if (!medicine) {
    console.error("No medicines found in the database — seed medicines first.");
    process.exit(1);
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      subscriptionId: null,
      status: "PENDING",
      totalAmount: medicine.price,
      items: {
        create: [{ medicineId: medicine.id, quantity: 1, price: medicine.price }],
      },
    },
  });

  console.log("Created a PENDING order:");
  console.log({
    id: order.id,
    userId: order.userId,
    userEmail: user.email,
    medicineName: medicine.name,
    status: order.status,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());