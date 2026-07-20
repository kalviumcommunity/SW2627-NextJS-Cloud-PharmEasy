import { getMedicines, getMedicineById } from "@/lib/services/medicine.service";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    medicine: { findMany: jest.fn(), findUnique: jest.fn() },
  },
}));

describe("getMedicines", () => {
  beforeEach(() => jest.clearAllMocks());

  it("fetches all medicines ordered by name when no filters are given", async () => {
    prisma.medicine.findMany.mockResolvedValue([]);

    await getMedicines();

    expect(prisma.medicine.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { name: "asc" },
    });
  });

  it("filters by category, case-insensitively, but ignores 'all'", async () => {
    prisma.medicine.findMany.mockResolvedValue([]);

    await getMedicines({ category: "Pain Relief" });
    expect(prisma.medicine.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { category: { equals: "Pain Relief", mode: "insensitive" } },
      })
    );

    jest.clearAllMocks();
    prisma.medicine.findMany.mockResolvedValue([]);
    await getMedicines({ category: "All" });
    expect(prisma.medicine.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  it("builds an OR search across name/description/category when a query is given", async () => {
    prisma.medicine.findMany.mockResolvedValue([]);

    await getMedicines({ query: "  paracetamol  " });

    expect(prisma.medicine.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { name: { contains: "paracetamol", mode: "insensitive" } },
            { description: { contains: "paracetamol", mode: "insensitive" } },
            { category: { contains: "paracetamol", mode: "insensitive" } },
          ],
        },
      })
    );
  });
});

describe("getMedicineById", () => {
  beforeEach(() => jest.clearAllMocks());

  it("looks up a medicine by id", async () => {
    prisma.medicine.findUnique.mockResolvedValue({ id: "med_1", name: "Paracetamol" });

    const result = await getMedicineById("med_1");

    expect(prisma.medicine.findUnique).toHaveBeenCalledWith({ where: { id: "med_1" } });
    expect(result).toEqual({ id: "med_1", name: "Paracetamol" });
  });

  it("returns null when prisma finds nothing", async () => {
    prisma.medicine.findUnique.mockResolvedValue(null);

    const result = await getMedicineById("does_not_exist");

    expect(result).toBeNull();
  });
});