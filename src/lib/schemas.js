import { z } from "zod"; 
import { FREQUENCY } from "@/lib/utils";

// --- Cart Schemas ---
export const addToCartSchema = z.object({
  medicineId: z.string().min(1, "Medicine is required"),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(20, "Quantity cannot exceed 20"),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(20, "Quantity cannot exceed 20"),
});


// --- Medicine Schemas ---
export const medicineQuerySchema = z.object({
  q: z.string().max(100, "Search query must be under 100 characters").optional().default(""),
  category: z.string().max(50, "Category must be under 50 characters").optional().default(""),
});

export function validateMedicineQuery(data) {
  return medicineQuerySchema.safeParse(data);
}


// --- Order Schemas ---
export const directOrderSchema = z.object({
  medicineId: z.string().min(1, "Medicine is required"),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(20, "Quantity cannot exceed 20"),
});

export const cartOrderSchema = z.object({
  items: z
    .array(
      z.object({
        medicineId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(20),
      })
    )
    .min(1, "Cart is empty"),
});

export function validateDirectOrder(data) {
  return directOrderSchema.safeParse(data);
}


// --- Payment Schemas ---
export const paymentSchema = z.object({
  cardName: z
    .string()
    .trim()
    .min(2, "Enter the name on the card")
    .max(60, "Name is too long"),
  cardNumber: z
    .string()
    .transform((val) => val.replace(/\s+/g, ""))
    .refine((val) => /^\d{16}$/.test(val), "Card number must be 16 digits"),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be in MM/YY format")
    .refine((val) => {
      const [month, year] = val.split("/").map(Number);
      const expiryDate = new Date(2000 + year, month); // first day of month after expiry
      return expiryDate > new Date();
    }, "Card has expired"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

export function validatePayment(data) {
  return paymentSchema.safeParse(data);
}

export const savedCardSchema = paymentSchema.omit({ cvv: true });


// --- Subscription Schemas ---
export const subscriptionSchema = z.object({
  medicineId: z.string().min(1, "Medicine is required"),
  frequency: z.enum([FREQUENCY.DAILY, FREQUENCY.WEEKLY, FREQUENCY.MONTHLY], {
    errorMap: () => ({ message: "Frequency must be Daily, Weekly, or Monthly" }),
  }),
});

export function validateSubscription(data) {
  return subscriptionSchema.safeParse(data);
}
