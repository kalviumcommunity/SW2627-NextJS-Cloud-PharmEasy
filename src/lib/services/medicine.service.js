import { prisma } from "@/lib/prisma";

export async function getMedicines({ query = "", category = "" } = {}) {
  const where = {};

  if (category && category.toLowerCase() !== "all") {
    where.category = {
      equals: category,
      mode: "insensitive",
    };
  }

  const trimmedQuery = typeof query === "string" ? query.trim() : "";

  if (trimmedQuery) {
    where.OR = [
      { name: { contains: trimmedQuery, mode: "insensitive" } },
      { description: { contains: trimmedQuery, mode: "insensitive" } },
      { category: { contains: trimmedQuery, mode: "insensitive" } },
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
