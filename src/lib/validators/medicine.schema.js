import { z } from "zod";

export const medicineQuerySchema = z.object({
  q: z.string().max(100, "Search query must be under 100 characters").optional().default(""),
  category: z.string().max(50, "Category must be under 50 characters").optional().default(""),
});

export function validateMedicineQuery(data) {
  return medicineQuerySchema.safeParse(data);
}
