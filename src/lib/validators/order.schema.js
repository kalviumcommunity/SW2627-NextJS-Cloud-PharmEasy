import { z } from "zod";

export const directOrderSchema = z.object({
  medicineId: z.string().min(1, "Medicine is required"),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(20, "Quantity cannot exceed 20"),
});

export function validateDirectOrder(data) {
  return directOrderSchema.safeParse(data);
}