// One-off script: creates a subscription for a specific user, backdated
// so it's immediately "due" for the scheduler to pick up.
// Usage: node scripts/create-test-subscription.js <userId>

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error("Usage: node scripts/create-test-subscription.js <userId>");
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

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      medicineId: medicine.id,
      frequency: "MONTHLY",
      status: "ACTIVE",
      nextRefillDate: yesterday,
    },
  });

  console.log("Created subscription:");
  console.log({
    id: subscription.id,
    userId: subscription.userId,
    userEmail: user.email,
    medicineName: medicine.name,
    nextRefillDate: subscription.nextRefillDate,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());