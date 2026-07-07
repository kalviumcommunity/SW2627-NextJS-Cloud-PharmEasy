import { prisma } from "@/lib/prisma";

export async function getMedicines({ query = "", category = "" } = {}) {
  const where = {};

  if (category && category.toLowerCase() !== "all") {
    where.category = {
      equals: category,
      mode: "insensitive",
    };
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  return prisma.medicine.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function getMedicineById(id) {
  return prisma.medicine.findUnique({
    where: { id },
  });
}
