const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

  for (const med of medicines) {
    await prisma.medicine.create({ data: med });
  }

  console.log(`Seeded ${medicines.length} medicines.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });